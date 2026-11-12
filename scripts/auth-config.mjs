import { randomBytes } from 'node:crypto';
import { readFile, appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const path=fileURLToPath(new URL('../.env',import.meta.url));
try {
  const previous=await readFile(path,'utf8');
  const added=[];
  for(const [name,value] of [
    ['SESSION_SECRET',randomBytes(32).toString('hex')],
    ['AUTH_ORIGIN_DEV','http://127.0.0.1:5173'],
    ['AUTH_ORIGIN_COMPILED','http://127.0.0.1:3000'],
    ['SESSION_ALLOW_HTTP','true'],
  ]) if(!new RegExp('^'+name+'=','m').test(previous))added.push(name+'='+value);
  if(added.length)await appendFile(path,(previous.endsWith('\n')?'':'\n')+added.join('\n')+'\n');
  console.log('Configuración auth privada disponible en .env; variables existentes conservadas.');
} catch {
  console.error('No se pudo completar .env existente; comprueba su ubicación y permisos privados.');
  process.exitCode=1;
}