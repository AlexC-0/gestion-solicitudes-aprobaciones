import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createQueryClient } from '../src/health';
import { AuthClient } from '../src/auth-client';

const clients:ReturnType<typeof createQueryClient>[]=[];
const disposers:(()=>void)[]=[];
afterEach(()=>{disposers.splice(0).forEach(fn=>fn());clients.splice(0).forEach(c=>c.clear());vi.useRealTimers();});
function client(){const c=createQueryClient();clients.push(c);return c;}
function person(name='Solicitante Uno',expiresAt=new Date(Date.now()+3600000).toISOString()){
  return {user:{id:name,nombre:name,correo:'ficticio@example.com',rol:'solicitante'},expiresAt};
}
function show(path='/acceso'){
  const c=client();render(<QueryClientProvider client={c}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></QueryClientProvider>);return c;
}
const anonymous=()=>Response.json({error:{code:'UNAUTHENTICATED'}},{status:401});
const csrf=()=>Response.json({csrfToken:'token-ficticio-exclusivo-de-prueba'});
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return{promise,resolve};}

it('comprueba sesión, formulario por teclado, login real de contrato y logout',async()=>{
  const fetchMock=vi.fn().mockResolvedValueOnce(anonymous()).mockResolvedValueOnce(csrf())
    .mockResolvedValueOnce(Response.json(person())).mockResolvedValueOnce(csrf())
    .mockResolvedValueOnce(csrf()).mockResolvedValueOnce(new Response(null,{status:204}));
  vi.stubGlobal('fetch',fetchMock);
  show();expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión');
  const email=await screen.findByLabelText('Correo electrónico');const password=screen.getByLabelText('Contraseña');
  const user=userEvent.setup();await user.type(email,'ficticio@example.com');await user.type(password,'clave-ficticia');
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Solicitante Uno')).toBeInTheDocument();
  const call=fetchMock.mock.calls.find(c=>c[0]==='/api/auth/login')!;
  expect(JSON.parse(call[1].body)).toEqual({correo:'ficticio@example.com',password:'clave-ficticia'});
  expect(call[1]).toMatchObject({credentials:'same-origin',headers:expect.objectContaining({'X-CSRF-Token':expect.any(String)})});
  expect(fetchMock.mock.calls.filter(c=>c[0]==='/api/auth/csrf')).toHaveLength(2);
  await user.click(screen.getByRole('button',{name:'Cerrar sesión'}));
  expect(await screen.findByText('Sesión cerrada.')).toBeInTheDocument();
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  expect(localStorage.length).toBe(0);expect(sessionStorage.length).toBe(0);
});
it('recupera identidad al cargar cuenta y redirige al acceso si responde 401',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(anonymous()));
  show('/cuenta');expect(await screen.findByRole('heading',{name:'Acceder a tu cuenta'})).toBeInTheDocument();
});
it('recupera una sesión existente sin volver a pedir credenciales',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json(person())));
  show('/cuenta');expect(await screen.findByText('Solicitante Uno')).toBeInTheDocument();
  expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
});
it('distingue error técnico al comprobar sesión y permite reintento',async()=>{
  const fetchMock=vi.fn().mockRejectedValueOnce(new TypeError('red')).mockResolvedValueOnce(anonymous());
  vi.stubGlobal('fetch',fetchMock);show();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido comprobar la sesión');
  expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Volver a comprobar sesión'}));
  expect(await screen.findByLabelText('Contraseña')).toBeInTheDocument();
});
it('credenciales incorrectas muestran error y no reintentan la escritura',async()=>{
  const fetchMock=vi.fn().mockResolvedValueOnce(anonymous()).mockResolvedValueOnce(csrf()).mockResolvedValueOnce(anonymous());
  vi.stubGlobal('fetch',fetchMock);show();
  const user=userEvent.setup();await user.type(await screen.findByLabelText('Correo electrónico'),'ficticio@example.com');
  await user.type(screen.getByLabelText('Contraseña'),'incorrecta');await user.click(screen.getByRole('button',{name:'Acceder'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  expect(fetchMock.mock.calls.filter(c=>c[0]==='/api/auth/login')).toHaveLength(1);
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
});
it('no confirma logout cuando falla la red; oculta datos y permite revalidar',async()=>{
  const fetchMock=vi.fn().mockResolvedValueOnce(Response.json(person())).mockResolvedValueOnce(csrf()).mockRejectedValueOnce(new TypeError('red'));
  vi.stubGlobal('fetch',fetchMock);const c=show('/cuenta');
  expect(await screen.findByText('Solicitante Uno')).toBeInTheDocument();
  c.setQueryData(['private','cuenta'],{secreto:'dato anterior'});
  await userEvent.click(screen.getByRole('button',{name:'Cerrar sesión'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido confirmar el cierre');
  expect(screen.queryByText('Solicitante Uno')).not.toBeInTheDocument();
  expect(c.getQueryData(['private','cuenta'])).toBeUndefined();
  expect(fetchMock.mock.calls.filter(c=>c[0]==='/api/auth/logout')).toHaveLength(1);
});
it('al caducar borra identidad y consultas privadas según expiresAt',async()=>{
  vi.useFakeTimers();
  const c=client();const auth=new AuthClient(c);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json(person('Uno',new Date(Date.now()+1000).toISOString()))));
  await auth.check();c.setQueryData(['private','datos'],{id:'anterior'});c.setQueryData(['health'],{status:'ok'});
  await vi.advanceTimersByTimeAsync(1001);
  expect(auth.getSnapshot().status).toBe('anonymous');
  expect(c.getQueryData(['private','datos'])).toBeUndefined();
  expect(c.getQueryData(['health'])).toEqual({status:'ok'});
});
it('descarta me tardío y cancela consultas privadas cuando cambia la sesión',async()=>{
  const c=client(),auth=new AuthClient(c),old=deferred<Response>(),privateResult=deferred<string>();
  let signal:AbortSignal|undefined;
  const query=c.fetchQuery({queryKey:['private','anterior'],queryFn:ctx=>{signal=ctx.signal;return privateResult.promise;}}).catch(()=>undefined);
  const fetchMock=vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(anonymous());
  vi.stubGlobal('fetch',fetchMock);
  const first=auth.check();await auth.check();old.resolve(Response.json(person('Anterior')));await first;
  privateResult.resolve('respuesta tardía');await query;
  expect(signal?.aborted).toBe(true);expect(c.getQueryData(['private','anterior'])).toBeUndefined();
  expect(auth.getSnapshot().status).toBe('anonymous');
});
it('cambio de usuario limpia caché y un login anterior tardío no restaura identidad',async()=>{
  const c=client(),auth=new AuthClient(c),pending=deferred<Response>();
  const fetchMock=vi.fn().mockResolvedValueOnce(csrf()).mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(Response.json(person('Segundo'))).mockResolvedValueOnce(csrf());
  vi.stubGlobal('fetch',fetchMock);
  const first=auth.login('uno@example.com','ficticia').catch(()=>undefined);
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
  c.setQueryData(['private','uno'],{dato:1});await auth.check();
  pending.resolve(Response.json(person('Primero')));await first;
  expect(auth.getSnapshot()).toMatchObject({status:'authenticated',identity:{user:{nombre:'Segundo'}}});
  expect(c.getQueryData(['private','uno'])).toBeUndefined();auth.expire();
});
it('revalida al foco y entre pestañas con mensajes sin secretos',async()=>{
  let channel: {onmessage:((event:{data:unknown})=>void)|null;postMessage:ReturnType<typeof vi.fn>;close:ReturnType<typeof vi.fn>}|undefined;
  class Channel {onmessage:((event:{data:unknown})=>void)|null=null;postMessage=vi.fn();close=vi.fn();constructor(){channel=this;}}
  vi.stubGlobal('BroadcastChannel',Channel);
  const fetchMock=vi.fn().mockResolvedValueOnce(Response.json(person())).mockResolvedValueOnce(anonymous()).mockResolvedValueOnce(anonymous());
  vi.stubGlobal('fetch',fetchMock);
  const auth=new AuthClient(client());disposers.push(auth.start());
  await waitFor(()=>expect(auth.getSnapshot().status).toBe('authenticated'));
  await act(async()=>window.dispatchEvent(new Event('focus')));
  await waitFor(()=>expect(auth.getSnapshot().status).toBe('anonymous'));
  channel!.onmessage!({data:'changed'});
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(channel!.postMessage).not.toHaveBeenCalled();
});