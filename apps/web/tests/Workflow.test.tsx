import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createQueryClient } from '../src/health';

const clients:ReturnType<typeof createQueryClient>[]=[];
afterEach(()=>clients.splice(0).forEach(c=>c.clear()));
const expiresAt=new Date(Date.now()+3600000).toISOString();
const person=(id='uno',rol='solicitante')=>({user:{id,nombre:id,correo:id+'@example.com',rol},expiresAt});
const time=new Date().toISOString();
const initial={id:'expediente',titulo:'Solicitud de prueba',tipo_codigo:'material',descripcion:'Descripción válida para enviar.',
  estado:'borrador',autor_nombre:'Solicitante Uno',responsable_nombre:null as string|null,creada_en:time,actualizada_en:time,enviada_en:null as string|null,finalizada_en:null as string|null};
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return{promise,resolve};}
function backend(role='solicitante'){
  let identity=person('uno',role),solicitud={...initial};
  let history=[{id:'1',accion:'creacion',actor_id:'uno',actor_nombre:'Solicitante Uno',creada_en:time,estado_anterior:null as string|null,estado_posterior:'borrador'}];
  const override=vi.fn<(path:string,options:RequestInit)=>Promise<Response>|undefined>();
  const fetch=vi.fn(async(path:string,options:RequestInit={})=>{
    const custom=override(path,options);if(custom)return custom;
    if(path==='/api/auth/me')return Response.json(identity);
    if(path==='/api/auth/csrf')return Response.json({csrfToken:'csrf-ficticio'});
    if(path==='/api/tipos-solicitud')return Response.json({tipos:[]});
    if(options.method==='POST'){
      const envio=path.endsWith('/enviar'),old=solicitud.estado;
      solicitud={...solicitud,estado:envio?'pendiente':'cancelada',
        responsable_nombre:envio?'Revisor Uno':solicitud.responsable_nombre,
        enviada_en:envio?time:solicitud.enviada_en,finalizada_en:envio?null:time};
      history=[...history,{id:String(history.length+1),accion:envio?'envio':'cancelacion',actor_id:'uno',actor_nombre:'Solicitante Uno',creada_en:time,estado_anterior:old,estado_posterior:solicitud.estado}];
      return Response.json({solicitud});
    }
    if(path==='/api/solicitudes/expediente')return Response.json({solicitud,historial:history});
    if(path.startsWith('/api/solicitudes?'))return Response.json({solicitudes:[solicitud],paginacion:{pagina:1,tamano:20,total:1,paginas:1}});
    throw Error('Ruta no prevista en prueba');
  });
  vi.stubGlobal('fetch',fetch);
  return {fetch,override,setIdentity:(id:string)=>{identity=person(id,role);},setState:(estado:string)=>{solicitud={...solicitud,estado};}};
}
function show(path='/solicitudes/expediente'){
  const c=createQueryClient();clients.push(c);render(<QueryClientProvider client={c}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></QueryClientProvider>);return c;
}
const failure=(status:number,message:string)=>Response.json({error:{code:'ERROR',message}},{status});
it('envía con CSRF, refresca estado/responsable/historial y confirma la acción',async()=>{
  const api=backend();show();
  await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(await screen.findByText('Solicitud enviada.')).toBeInTheDocument();
  expect(await screen.findByText('Revisor Uno')).toBeInTheDocument();
  expect(screen.getByText('Envío de la solicitud')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Enviar borrador'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Editar borrador'})).not.toBeInTheDocument();
  const call=api.fetch.mock.calls.find(c=>c[0].endsWith('/enviar'))!;
  expect(call[1]?.method).toBe('POST');expect(call[1]?.body).toBe('{}');
  expect((call[1]?.headers as Headers).get('X-CSRF-Token')).toBe('csrf-ficticio');
});
it('cancelar exige confirmación explícita, Escape/volver no escriben y foco se restaura',async()=>{
  const api=backend();show();const user=userEvent.setup();
  await user.click(await screen.findByRole('button',{name:'Cancelar solicitud'}));
  expect(screen.getByRole('alertdialog')).toHaveTextContent('no se podrá reabrir ni editar');
  expect(screen.getByRole('button',{name:'Volver sin cancelar'})).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Cancelar solicitud'})).toHaveFocus();
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
  await user.click(screen.getByRole('button',{name:'Cancelar solicitud'}));
  await user.click(screen.getByRole('button',{name:'Sí, cancelar solicitud'}));
  expect(await screen.findByText('Solicitud cancelada. No se puede reabrir.')).toBeInTheDocument();
  expect(await screen.findByText('Cancelación de la solicitud')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Cancelar solicitud'})).not.toBeInTheDocument();
});
it('la bandeja inicia en pendientes, permite todos los estados y nunca muestra acciones del autor',async()=>{
  const api=backend('revisor');api.setState('pendiente');show('/solicitudes');
  expect(await screen.findByRole('heading',{name:'Bandeja de revisión'})).toBeInTheDocument();
  expect(screen.getByLabelText('Filtrar por estado')).toHaveValue('pendiente');
  expect(api.fetch.mock.calls.some(c=>c[0]==='/api/solicitudes?pagina=1&estado=pendiente')).toBe(true);
  expect(screen.queryByRole('link',{name:'Nuevo borrador'})).not.toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText('Filtrar por estado'),'todos');
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[0]==='/api/solicitudes?pagina=1')).toBe(true));
  await userEvent.click(await screen.findByRole('link',{name:'Solicitud de prueba'}));
  expect(await screen.findByText('Solicitante Uno')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/Enviar|Cancelar|Aprobar|Rechazar/})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Editar borrador'})).not.toBeInTheDocument();
});
it('cambiar filtro vuelve a primera página y paginar conserva filtro y clave privada',async()=>{
  const api=backend();
  api.override.mockImplementation(path=>path.startsWith('/api/solicitudes?')?Promise.resolve(Response.json({
    solicitudes:[initial],paginacion:{pagina:Number(new URL(path,'http://local').searchParams.get('pagina')),tamano:20,total:50,paginas:3},
  })):undefined);
  const c=show('/solicitudes?pagina=3&estado=pendiente');
  const filter=await screen.findByLabelText('Filtrar por estado');
  await userEvent.selectOptions(filter,'cancelada');
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[0]==='/api/solicitudes?pagina=1&estado=cancelada')).toBe(true));
  await userEvent.click(await screen.findByRole('button',{name:'Siguiente'}));
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[0]==='/api/solicitudes?pagina=2&estado=cancelada')).toBe(true));
  expect(c.getQueryCache().getAll().some(q=>q.queryKey[0]==='private'&&q.queryKey[1]==='uno'&&q.queryKey.includes('cancelada'))).toBe(true);
});
it('409 bloquea repetir la acción y permite recuperar estado vigente',async()=>{
  const api=backend();
  api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(failure(409,'El estado ha cambiado. Actualiza el detalle.')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('estado ha cambiado');
  expect(screen.getByRole('button',{name:'Enviar borrador'})).toBeDisabled();
  api.setState('cancelada');await userEvent.click(screen.getByRole('button',{name:'Actualizar detalle'}));
  await waitFor(()=>expect(screen.queryByRole('button',{name:'Enviar borrador'})).not.toBeInTheDocument());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
});
it('fallo de red reconoce acción incierta y ofrece consultar detalle sin reintentar',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.reject(new TypeError('red')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Puede haberse completado');
  expect(screen.getByRole('button',{name:'Actualizar detalle'})).toBeInTheDocument();
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
});
it('validación de envío muestra el mensaje del servidor y permite editar el contenido',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(failure(400,'Completa una descripción de 10 a 3000 caracteres.')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('10 a 3000');
  expect(screen.getByRole('link',{name:'Editar borrador'})).toBeInTheDocument();
  expect(screen.queryByText('Solicitud enviada.')).not.toBeInTheDocument();
});
it('escritura pendiente se deshabilita y su respuesta tardía no confirma en otra cuenta',async()=>{
  const api=backend(),pending=deferred<Response>();api.override.mockImplementation((_p,o)=>o.method==='POST'?pending.promise:undefined);
  const c=show();await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(screen.getByRole('button',{name:'Enviar borrador'})).toBeDisabled();
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(true));
  api.setIdentity('dos');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').every(q=>q.queryKey[1]==='dos')).toBe(true));
  await act(async()=>{pending.resolve(Response.json({solicitud:{...initial,estado:'pendiente'}}));});
  expect(screen.queryByText('Solicitud enviada.')).not.toBeInTheDocument();
});
it('cambiar sesión elimina una confirmación de cancelación abierta',async()=>{
  const api=backend();const c=show();
  await userEvent.click(await screen.findByRole('button',{name:'Cancelar solicitud'}));expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  api.setIdentity('dos');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').every(q=>q.queryKey[1]==='dos')).toBe(true);
});
it('terminales se consultan sin controles de envío, cancelación o edición',async()=>{
  const api=backend();api.setState('cancelada');show();
  await screen.findByRole('heading',{name:'Solicitud de prueba'});
  expect(screen.queryByRole('button',{name:/Enviar|Cancelar|Aprobar|Rechazar/})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'Editar borrador'})).not.toBeInTheDocument();
});
it('un error técnico al recuperar detalle no se presenta como acción confirmada',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(failure(503,'Servicio indisponible')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Enviar borrador'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se puede completar');
  expect(screen.queryByText('Solicitud enviada.')).not.toBeInTheDocument();
  api.override.mockImplementation(p=>p==='/api/solicitudes/expediente'?Promise.resolve(failure(503,'Servicio indisponible')):undefined);
  await userEvent.click(screen.getByRole('button',{name:'Actualizar detalle'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se puede completar');
  expect(screen.queryByRole('heading',{name:'Solicitud de prueba'})).not.toBeInTheDocument();
});
