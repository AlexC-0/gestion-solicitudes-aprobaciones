import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import net from 'node:net';
class SetupError extends Error {}
const root=fileURLToPath(new URL('../',import.meta.url));
const local=join(root,'.local','postgres');
const data=join(local,'data');
const bin=join(local,'binaries','pgsql','bin');
const metadata=join(local,'instance.json');
const source='https://get.enterprisedb.com/postgresql/postgresql-18.6-1-windows-x64-binaries.zip';
const {Client,escapeLiteral}=createRequire(new URL('../apps/api/package.json',import.meta.url))('pg');
function restrict(path,directory=false){
 const user=execFileSync('whoami',[],{encoding:'utf8',windowsHide:true}).trim();
 const rights=directory?'(OI)(CI)F':'F';
 execFileSync('icacls',[path,'/inheritance:r','/grant:r',`${user}:${rights}`,`SYSTEM:${rights}`],{windowsHide:true,stdio:'ignore'});
}
async function privateFile(path,contents){
 await writeFile(path,'',{flag:'wx',mode:0o600});restrict(path);await writeFile(path,contents);
}
function run(name,args){
 const result=spawnSync(join(bin,name+'.exe'),args,{windowsHide:true,encoding:'utf8',stdio:name==='pg_ctl'?'ignore':'pipe'});
 if(result.status!==0)throw new SetupError(`${name} no pudo completar la operación; consulta los logs privados de .local/postgres.`);
 return result.stdout?.trim() ?? '';
}
function running(){return existsSync(join(data,'PG_VERSION'))&&spawnSync(join(bin,'pg_ctl.exe'),['-D',data,'status'],{windowsHide:true,stdio:'ignore'}).status===0;}
async function config(){
 if(!existsSync(metadata))throw new SetupError('No hay instancia propia preparada. Ejecuta db:local -- prepare.');
 const c=JSON.parse(await readFile(metadata,'utf8'));
 if(c.project!=='gestion-solicitudes-aprobaciones'||!Number.isInteger(c.port)||c.port<1||c.port>65535)throw new SetupError('Metadatos locales no reconocidos.');
 return c;
}
async function freePort(port){await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(new SetupError('Puerto ocupado; selecciona otro con prepare --port=N, sin detener procesos ajenos.')));s.listen(port,'127.0.0.1',()=>s.close(resolve));});}
async function start(c){
 if(running()){console.log('La instancia propia ya está iniciada.');return;}
 await freePort(c.port);run('pg_ctl',['-D',data,'-l',join(local,'postgresql.log'),'-w','-t','30','start']);
 console.log(`PostgreSQL propio iniciado en 127.0.0.1:${c.port}.`);
}
async function prepare(){
 if(existsSync(metadata)){const c=await config();if(c.prepared){console.log('Entorno ya preparado; no se reinicializa ni se cambian credenciales.');return;}throw new SetupError('Preparación anterior incompleta. Conserva los datos y revisa los logs privados antes de continuar.');}
 if(existsSync(join(root,'.env')))throw new SetupError('Ya existe .env; se conserva. Revisa la configuración explícita antes de preparar otra instancia.');
 if(existsSync(data)&&(await readdir(data)).length)throw new SetupError('El directorio de datos no está vacío; no se reinicializa.');
 const arg=process.argv.find(a=>a.startsWith('--port='));const port=arg?Number(arg.slice(7)):55433;
 if(!Number.isInteger(port)||port<1||port>65535)throw new SetupError('Puerto no válido.');
 await freePort(port);await mkdir(local,{recursive:true});restrict(local,true);
 const archive=join(local,'postgresql.zip');
 if(!existsSync(archive)){const response=await fetch(source);if(!response.ok)throw new SetupError('No se pudo descargar PostgreSQL de EDB.');await pipeline(Readable.fromWeb(response.body),createWriteStream(archive,{flags:'wx'}));}
 if(!existsSync(join(bin,'initdb.exe'))){
  execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath $env:P02_ARCHIVE -DestinationPath $env:P02_BIN'],{windowsHide:true,stdio:'ignore',env:{...process.env,P02_ARCHIVE:archive,P02_BIN:join(local,'binaries')}});
 }
 const version=run('postgres',['--version']);if(!version.includes('18.6'))throw new SetupError('Versión PostgreSQL inesperada.');
 const hash=createHash('sha256');for await(const chunk of createReadStream(archive))hash.update(chunk);
 const c={project:'gestion-solicitudes-aprobaciones',port,source,version,sha256:hash.digest('hex'),adminPassword:randomBytes(32).toString('hex'),devPassword:randomBytes(32).toString('hex'),testPassword:randomBytes(32).toString('hex'),prepared:false};
 await privateFile(metadata,JSON.stringify(c,null,2));
 const pwfile=join(local,'admin-password');await privateFile(pwfile,c.adminPassword+'\n');
 run('initdb',['-D',data,'-U','p02_admin','--pwfile='+pwfile,'--auth-local=scram-sha-256','--auth-host=scram-sha-256','--encoding=UTF8','--locale=C']);
 await writeFile(join(data,'postgresql.conf'),"\nlisten_addresses = '127.0.0.1'\nport = "+port+"\npassword_encryption = 'scram-sha-256'\nmax_connections = 30\nshared_buffers = '64MB'\nlog_statement = 'none'\nlog_min_error_statement = 'panic'\nlog_error_verbosity = 'terse'\n",{flag:'a'});
 await writeFile(join(data,'pg_hba.conf'),[
 'host all p02_admin 127.0.0.1/32 scram-sha-256',
 'host gestion_solicitudes_aprobaciones p02_dev 127.0.0.1/32 scram-sha-256',
 'host gestion_solicitudes_aprobaciones_test p02_test 127.0.0.1/32 scram-sha-256',
 'host all all 0.0.0.0/0 reject','host all all ::/0 reject',''
 ].join('\n'));
 await start(c);
 const client=new Client({host:'127.0.0.1',port,user:'p02_admin',password:c.adminPassword,database:'postgres',connectionTimeoutMillis:5000});
 try{
  await client.connect();
  for(const [role,database,password] of [['p02_dev','gestion_solicitudes_aprobaciones',c.devPassword],['p02_test','gestion_solicitudes_aprobaciones_test',c.testPassword]]){
   await client.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD ${escapeLiteral(password)}`);
   await client.query(`CREATE DATABASE ${database} OWNER ${role}`);
   await client.query(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC`);
  }
 }finally{await client.end();}
 const url=(role,password,database)=>`postgresql://${role}:${password}@127.0.0.1:${port}/${database}`;
 await privateFile(join(root,'.env'),`DATABASE_URL=${url('p02_dev',c.devPassword,'gestion_solicitudes_aprobaciones')}\nTEST_DATABASE_URL=${url('p02_test',c.testPassword,'gestion_solicitudes_aprobaciones_test')}\n`);
 c.prepared=true;await writeFile(metadata,JSON.stringify(c,null,2));
 console.log(`Entorno preparado: ${version}, puerto ${port}. Configuración privada: ${join(root,'.env')}`);
}
try{
 if(process.platform!=='win32')throw new SetupError('Este comando prepara solo el entorno Windows propio; en CI usa el servicio PostgreSQL del runner.');
 const action=process.argv[2]??'status';
 if(action==='prepare')await prepare();
 else if(action==='status'){if(!existsSync(metadata))console.log('Instancia propia todavía no preparada.');else{const c=await config();console.log(`${c.version}; 127.0.0.1:${c.port}; ${running()?'iniciada':'detenida'}.`);}}
 else if(action==='start')await start(await config());
 else if(action==='stop'){await config();if(running())run('pg_ctl',['-D',data,'-m','fast','-w','-t','30','stop']);console.log('Instancia propia detenida; datos conservados.');}
 else throw new SetupError('Usa prepare, status, start o stop.');
}catch(error){
 // Los errores nativos pueden contener SQL/credenciales: no se imprimen.
 const safe=error instanceof SetupError ? error.message : 'Operación PostgreSQL fallida; consulta la configuración y los logs privados.';
 console.error(safe);process.exitCode=1;
}
