import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createQueryClient } from '../src/health';
import { AuthClient } from '../src/auth-client';

const clients:ReturnType<typeof createQueryClient>[]=[];
afterEach(()=>{clients.splice(0).forEach(c=>c.clear());});
const expiresAt=new Date(Date.now()+3600000).toISOString();
const person=(id='uno')=>({user:{id,nombre:id,correo:id+'@example.com',rol:'solicitante'},expiresAt});
const record={id:'id-prueba',titulo:'Material de prueba',tipo_codigo:'material',descripcion:'',estado:'borrador',creada_en:new Date().toISOString(),actualizada_en:new Date().toISOString()};
const history=[{id:'1',accion:'creacion',actor_id:'uno',estado_posterior:'borrador',creada_en:record.creada_en}];
const catalog={tipos:[{codigo:'material',nombre:'Material'},{codigo:'software',nombre:'Software'}]};
const ok=(data:unknown)=>Response.json(data);
function show(path='/solicitudes/nueva'){
  const c=createQueryClient();clients.push(c);
  render(<QueryClientProvider client={c}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></QueryClientProvider>);return c;
}
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return{promise,resolve};}
function backend(){
  let who=person(),saved={...record};
  const pending=vi.fn<(path:string,options:RequestInit)=>Promise<Response>|undefined>();
  const fetch=vi.fn(async(path:string,options:RequestInit={})=>{
    const override=pending(path,options);if(override)return override;
    if(path==='/api/auth/me')return ok(who);
    if(path==='/api/auth/csrf')return ok({csrfToken:'csrf-de-prueba'});
    if(path==='/api/tipos-solicitud')return ok(catalog);
    if(options.method==='POST'||options.method==='PATCH'){
      saved={...saved,...JSON.parse(options.body as string)};return ok({solicitud:saved});
    }
    if(path==='/api/solicitudes/id-prueba')return ok({solicitud:saved,historial:history});
    if(path.startsWith('/api/solicitudes?'))return ok({solicitudes:[],paginacion:{pagina:1,tamano:20,total:0,paginas:0}});
    throw Error('Ruta de prueba inesperada');
  });
  vi.stubGlobal('fetch',fetch);
  return {fetch,pending,setUser:(id:string)=>{who=person(id);}};
}
it('recorrido crear, detalle e historial y edición con confirmación y JSON controlado',async()=>{
  const api=backend();const user=userEvent.setup();show();
  await user.type(await screen.findByLabelText('Título'),'  Material nuevo  ');
  await user.selectOptions(screen.getByLabelText('Tipo de solicitud'),'material');
  await user.type(screen.getByLabelText('Descripción (opcional)'),'Texto inicial');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(await screen.findByRole('heading',{name:'Material nuevo'})).toBeInTheDocument();
  expect(screen.getByText('Borrador guardado.')).toBeInTheDocument();
  expect(screen.getByText('Creación del borrador')).toBeInTheDocument();
  const post=api.fetch.mock.calls.find(c=>c[1]?.method==='POST')!;
  expect(JSON.parse(post[1]!.body as string)).toEqual({titulo:'Material nuevo',tipo_codigo:'material',descripcion:'Texto inicial'});
  expect((post[1]!.headers as Headers).get('X-CSRF-Token')).toBe('csrf-de-prueba');
  await user.click(screen.getByRole('link',{name:'Editar borrador'}));
  const title=await screen.findByLabelText('Título');await user.clear(title);await user.type(title,'Título editado');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(await screen.findByRole('heading',{name:'Título editado'})).toBeInTheDocument();
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='PATCH')).toHaveLength(1);
  expect(localStorage.length+sessionStorage.length).toBe(0);
});
it('validación corregible, foco en error y Unicode contado por puntos de código',async()=>{
  const api=backend();show();const user=userEvent.setup();
  await screen.findByLabelText('Título');await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(screen.getByRole('alert')).toHaveFocus();
  expect(screen.getByRole('alert')).toHaveTextContent('3 y 120');
  await user.type(screen.getByLabelText('Título'),'😀ab');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(screen.getByRole('alert')).toHaveTextContent('Selecciona un tipo');
  expect(screen.getByText(/3\/120/)).toBeInTheDocument();
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
  await user.selectOptions(screen.getByLabelText('Tipo de solicitud'),'material');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(await screen.findByRole('heading',{name:'😀ab'})).toBeInTheDocument();
});
it('revalidar al foco la misma sesión conserva formulario, caché y señales activas',async()=>{
  const api=backend();const c=show();const user=userEvent.setup();
  await user.type(await screen.findByLabelText('Título'),'Trabajo sin guardar');
  const keys=c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').map(q=>q.queryKey);
  await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(api.fetch.mock.calls.filter(c=>c[0]==='/api/auth/me')).toHaveLength(2));
  expect(screen.getByLabelText('Título')).toHaveValue('Trabajo sin guardar');
  expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').map(q=>q.queryKey)).toEqual(keys);
  expect(keys.every(k=>k[1]==='uno')).toBe(true);
});
it('cambio de cuenta elimina formulario y caché anterior y cancela lecturas',async()=>{
  const api=backend();const c=show();const user=userEvent.setup();
  await user.type(await screen.findByLabelText('Título'),'Privado de Uno');
  const call=api.fetch.mock.calls.find(c=>c[0]==='/api/tipos-solicitud')!;
  c.setQueryData(['private','uno','dato'],{titulo:'Privado de Uno'});
  api.setUser('dos');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(screen.getByLabelText('Título')).toHaveValue(''));
  expect(c.getQueryData(['private','uno','dato'])).toBeUndefined();
  expect(call[1]!.signal?.aborted).toBe(true);
  expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').every(q=>q.queryKey[1]==='dos')).toBe(true);
});
it('una creación tardía de otra sesión no navega ni repone confirmaciones',async()=>{
  const api=backend(),pending=deferred<Response>();const user=userEvent.setup();show();
  api.pending.mockImplementation((_path,options)=>options.method==='POST'?pending.promise:undefined);
  await user.type(await screen.findByLabelText('Título'),'Anterior');
  await user.selectOptions(screen.getByLabelText('Tipo de solicitud'),'material');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(screen.getByRole('button',{name:'Guardando…'})).toBeDisabled();
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(true));
  api.setUser('dos');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(screen.getByLabelText('Título')).toHaveValue(''));
  await act(async()=>{pending.resolve(ok({solicitud:{...record,titulo:'Anterior'}}));});
  expect(screen.queryByText('Borrador guardado.')).not.toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Nuevo borrador'})).toBeInTheDocument();
});
it('fallo de red tras POST reconoce guardado incierto y no reintenta',async()=>{
  const api=backend();api.pending.mockImplementation((_p,o)=>o.method==='POST'?Promise.reject(new TypeError('red')):undefined);
  show();const user=userEvent.setup();
  await user.type(await screen.findByLabelText('Título'),'Conexión interrumpida');
  await user.selectOptions(screen.getByLabelText('Tipo de solicitud'),'material');
  await user.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Puede haberse guardado');
  expect(screen.getByRole('link',{name:'Comprobar Mis solicitudes antes de repetir'})).toHaveAttribute('href','/solicitudes');
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
  expect(screen.getByLabelText('Título')).toHaveValue('Conexión interrumpida');
});
it('listado vacío, paginación y error técnico sin fingir lista vacía',async()=>{
  const api=backend();show('/solicitudes');
  expect(await screen.findByText('No hay solicitudes en esta página.')).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Siguiente'})).toBeDisabled();
  api.pending.mockImplementation(path=>path.startsWith('/api/solicitudes?')?Promise.resolve(new Response(null,{status:503})):undefined);
  // Cambio de sesión provoca consulta nueva del listado, sin conservar datos antiguos.
  api.setUser('dos');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  expect(await screen.findByRole('alert')).toHaveTextContent('No se puede completar');
  expect(screen.queryByText('No hay solicitudes en esta página.')).not.toBeInTheDocument();
});
it('paginación solicita siguiente página sin reutilizar resultados anteriores',async()=>{
  const api=backend();
  api.pending.mockImplementation(path=>path.startsWith('/api/solicitudes?')?Promise.resolve(ok({
    solicitudes:[{...record,titulo:path.endsWith('2')?'Página segunda':'Página primera'}],
    paginacion:{pagina:path.endsWith('2')?2:1,tamano:20,total:21,paginas:2},
  })):undefined);
  show('/solicitudes');expect(await screen.findByRole('link',{name:'Página primera'})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Siguiente'}));
  expect(await screen.findByRole('link',{name:'Página segunda'})).toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Página primera'})).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Siguiente'})).toBeDisabled();
});
it('conflicto de edición se muestra sin controles de transición',async()=>{
  const api=backend();api.pending.mockImplementation((p,o)=>o.method==='PATCH'?Promise.resolve(okError(409,'Solo se pueden editar solicitudes en borrador.')):undefined);
  show('/solicitudes/id-prueba/editar');await screen.findByLabelText('Título');
  await userEvent.click(screen.getByRole('button',{name:'Guardar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Solo se pueden editar');
  expect(screen.queryByRole('button',{name:/Enviar|Cancelar|Aprobar|Rechazar/})).not.toBeInTheDocument();
});
function okError(status:number,message:string){return Response.json({error:{code:'ERROR',message}},{status});}
it('lectura privada 401 caduca sesión y elimina datos; respuesta tardía se descarta',async()=>{
  const c=createQueryClient();clients.push(c);const auth=new AuthClient(c);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(ok(person())).mockResolvedValueOnce(okError(401,'Sin sesión')));
  await auth.check();c.setQueryData(['private','uno','dato'],{privado:true});
  await expect(auth.request('solicitudes',new AbortController().signal)).rejects.toThrow('caducado');
  expect(auth.getSnapshot().status).toBe('anonymous');
  expect(c.getQueryData(['private','uno','dato'])).toBeUndefined();
});

it('un 401 al obtener CSRF antes de guardar elimina la sesión y el formulario privado',async()=>{
  const c=createQueryClient();clients.push(c);const auth=new AuthClient(c);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(ok(person())).mockResolvedValueOnce(okError(401,'Sin sesión')));
  await auth.check();c.setQueryData(['private','uno','dato'],{privado:true});
  await expect(auth.request('solicitudes',new AbortController().signal,{method:'POST',body:'{}'})).rejects.toThrow();
  expect(auth.getSnapshot().status).toBe('anonymous');
  expect(c.getQueryData(['private','uno','dato'])).toBeUndefined();
});
it('un CSRF tardío tras cambiar de cuenta no llega a enviar la creación',async()=>{
  const c=createQueryClient();clients.push(c);const auth=new AuthClient(c),pending=deferred<Response>();
  const fetch=vi.fn().mockResolvedValueOnce(ok(person())).mockReturnValueOnce(pending.promise).mockResolvedValueOnce(ok(person('dos')));
  vi.stubGlobal('fetch',fetch);await auth.check();
  const writing=auth.request('solicitudes',new AbortController().signal,{method:'POST',body:'{}'}).catch(()=>undefined);
  await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2));await auth.check();
  pending.resolve(ok({csrfToken:'token-anterior'}));await writing;
  expect(fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);auth.expire();
});