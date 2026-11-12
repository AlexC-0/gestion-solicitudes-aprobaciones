import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createQueryClient } from '../src/health';

const clients:ReturnType<typeof createQueryClient>[]=[];
afterEach(()=>clients.splice(0).forEach(c=>c.clear()));
const expiresAt=new Date(Date.now()+3600000).toISOString(),date=new Date().toISOString();
const person=(id='revisor',rol='revisor')=>({user:{id,nombre:id,correo:id+'@example.com',rol},expiresAt});
const pending={id:'expediente',responsable_id:'revisor',autor_nombre:'Autor',responsable_nombre:'Revisor',titulo:'Expediente pendiente',
  tipo_codigo:'material',descripcion:'Descripción válida.',estado:'pendiente',creada_en:date,actualizada_en:date,enviada_en:date,finalizada_en:null as string|null};
function backend(){
  let who=person(),solicitud={...pending};
  let historial=[{id:'1',accion:'envio',actor_id:'autor',actor_nombre:'Autor',creada_en:date,estado_anterior:'borrador',estado_posterior:'pendiente',comentario:null as string|null}];
  const override=vi.fn<(path:string,options:RequestInit)=>Promise<Response>|undefined>();
  const fetch=vi.fn(async(path:string,options:RequestInit={})=>{
    const custom=override(path,options);if(custom)return custom;
    if(path==='/api/auth/me')return Response.json(who);
    if(path==='/api/auth/csrf')return Response.json({csrfToken:'csrf-de-prueba'});
    if(path==='/api/auth/logout')return new Response(null,{status:204});
    if(options.method==='POST'){
      const approving=path.endsWith('/aprobar'),body=JSON.parse(options.body as string);
      solicitud={...solicitud,estado:approving?'aprobada':'rechazada',finalizada_en:date};
      historial=[...historial,{id:'2',accion:approving?'aprobacion':'rechazo',actor_id:'revisor',actor_nombre:'Revisor',creada_en:date,estado_anterior:'pendiente',estado_posterior:solicitud.estado,comentario:approving?body.comentario?.trim()||null:body.motivo.trim()}];
      return Response.json({solicitud});
    }
    if(path==='/api/solicitudes/expediente')return Response.json({solicitud,historial});
    if(path.startsWith('/api/solicitudes?'))return Response.json({solicitudes:[solicitud],paginacion:{pagina:1,tamano:20,total:1,paginas:1}});
    throw Error('Ruta no prevista');
  });
  vi.stubGlobal('fetch',fetch);
  return {fetch,override,setIdentity:(id:string,rol='revisor')=>{who=person(id,rol);},
    setState:(estado:string)=>{solicitud={...solicitud,estado};},setComment:(comentario:string)=>{historial=[{...historial[0]!,comentario}];}};
}
function show(path='/solicitudes/expediente'){
  const c=createQueryClient();clients.push(c);render(<QueryClientProvider client={c}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></QueryClientProvider>);return c;
}
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return{promise,resolve};}
const fail=(status:number,message:string)=>Response.json({error:{code:'ERROR',message}},{status});
it('aprobación opcional con confirmación explícita, CSRF y retirada de acciones terminales',async()=>{
  const api=backend();show();
  await userEvent.click(await screen.findByRole('button',{name:'Aprobar'}));
  expect(screen.getByLabelText('Comentario (opcional)')).toHaveFocus();
  expect(screen.getByText('La decisión es definitiva. No se podrá reabrir ni modificar.')).toBeInTheDocument();
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
  await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByText('Solicitud aprobada.')).toBeInTheDocument();
  expect(await screen.findByText('Aprobación de la solicitud')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Rechazar'})).not.toBeInTheDocument();
  const call=api.fetch.mock.calls.find(c=>c[0].endsWith('/aprobar'))!;
  expect(JSON.parse(call[1]!.body as string)).toEqual({comentario:''});
  expect((call[1]!.headers as Headers).get('X-CSRF-Token')).toBe('csrf-de-prueba');
});
it('rechazo con motivo normalizado y saltos de línea visibles en historial',async()=>{
  const api=backend();show();const user=userEvent.setup();
  await user.click(await screen.findByRole('button',{name:'Rechazar'}));
  await user.type(screen.getByLabelText('Motivo del rechazo'),'  Motivo detallado.\nOtra línea.  ');
  await user.click(screen.getByRole('button',{name:'Confirmar rechazo'}));
  expect(await screen.findByText('Solicitud rechazada.')).toBeInTheDocument();
  expect(await screen.findByText('Rechazo de la solicitud')).toBeInTheDocument();
  const text=screen.getByText('Motivo detallado. Otra línea.');
  expect(text.textContent).toBe('Motivo detallado.\nOtra línea.');expect(text).toHaveClass('plain-text');
  const call=api.fetch.mock.calls.find(c=>c[0].endsWith('/rechazar'))!;
  expect(JSON.parse(call[1]!.body as string)).toEqual({motivo:'Motivo detallado.\nOtra línea.'});
});
it('validación asociada al campo: motivo blanco/corto/largo y Unicode por puntos de código',async()=>{
  const api=backend();show();await userEvent.click(await screen.findByRole('button',{name:'Rechazar'}));
  const input=screen.getByLabelText('Motivo del rechazo');
  for(const text of ['   ','😀'.repeat(9),'😀'.repeat(1001),'<b>Texto largo</b>']){
    fireEvent.change(input,{target:{value:text}});await userEvent.click(screen.getByRole('button',{name:'Confirmar rechazo'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('10 y 1000');expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid','true');expect(input.getAttribute('aria-describedby')).toContain('decision-field-error');
  }
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
  fireEvent.change(input,{target:{value:'😀'.repeat(10)}});expect(screen.getByText(/10\/1000/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Confirmar rechazo'}));expect(await screen.findByText('Solicitud rechazada.')).toBeInTheDocument();
});
it('comentario de aprobación con exceso de longitud no se envía y se puede corregir',async()=>{
  const api=backend();show();await userEvent.click(await screen.findByRole('button',{name:'Aprobar'}));
  const input=screen.getByLabelText('Comentario (opcional)');
  fireEvent.change(input,{target:{value:'😀'.repeat(1001)}});await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('hasta 1000');
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
  fireEvent.change(input,{target:{value:'  Conforme con lo solicitado.  '}});
  await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByText('Conforme con lo solicitado.')).toBeInTheDocument();
});
it('Escape y volver descartan comentario, restauran foco y no resuelven',async()=>{
  const api=backend();show();const user=userEvent.setup();
  for(const [button,label] of [['Aprobar','Comentario (opcional)'],['Rechazar','Motivo del rechazo']] as const){
    await user.click(await screen.findByRole('button',{name:button}));
    await user.type(screen.getByLabelText(label),'Texto sin confirmar');
    if(button==='Aprobar')await user.keyboard('{Escape}');else await user.click(screen.getByRole('button',{name:'Volver sin resolver'}));
    expect(screen.getByRole('button',{name:button})).toHaveFocus();
    await user.click(screen.getByRole('button',{name:button}));expect(screen.getByLabelText(label)).toHaveValue('');
    await user.click(screen.getByRole('button',{name:'Volver sin resolver'}));
  }
  expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(false);
});
it('misma sesión al foco conserva motivo, pero estado terminal actualizado elimina el formulario',async()=>{
  const api=backend(),c=show();
  await userEvent.click(await screen.findByRole('button',{name:'Rechazar'}));
  await userEvent.type(screen.getByLabelText('Motivo del rechazo'),'Trabajo en curso');
  await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(api.fetch.mock.calls.filter(c=>c[0]==='/api/auth/me')).toHaveLength(2));
  expect(screen.getByLabelText('Motivo del rechazo')).toHaveValue('Trabajo en curso');
  api.setState('cancelada');await act(async()=>{await c.invalidateQueries({queryKey:['private']});});
  await waitFor(()=>expect(screen.queryByLabelText('Motivo del rechazo')).not.toBeInTheDocument());
  expect(screen.queryByRole('button',{name:'Rechazar'})).not.toBeInTheDocument();
});
it('409 después de cancelar el autor obliga a consultar estado vigente antes de actuar',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(fail(409,'El estado ha cambiado. Actualiza el detalle.')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Aprobar'}));
  await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('estado ha cambiado');
  expect(screen.getByRole('button',{name:'Aprobar'})).toBeDisabled();
  api.setState('cancelada');await userEvent.click(screen.getByRole('button',{name:'Actualizar detalle'}));
  await waitFor(()=>expect(screen.queryByRole('button',{name:'Aprobar'})).not.toBeInTheDocument());
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
});
it('red incierta no confirma ni reintenta; consultar detalle recupera la decisión real',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.reject(new TypeError('red')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Aprobar'}));
  await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Podría haberse guardado');
  expect(screen.getByRole('button',{name:'Confirmar aprobación'})).toBeDisabled();
  expect(api.fetch.mock.calls.filter(c=>c[1]?.method==='POST')).toHaveLength(1);
  api.setState('aprobada');await userEvent.click(screen.getByRole('button',{name:'Actualizar detalle'}));
  await waitFor(()=>expect(screen.queryByLabelText('Comentario (opcional)')).not.toBeInTheDocument());
});
it('una decisión pendiente se deshabilita y su respuesta tardía no confirma en otra sesión',async()=>{
  const api=backend(),pendingResponse=deferred<Response>();
  api.override.mockImplementation((_p,o)=>o.method==='POST'?pendingResponse.promise:undefined);
  const c=show();await userEvent.click(await screen.findByRole('button',{name:'Rechazar'}));
  await userEvent.type(screen.getByLabelText('Motivo del rechazo'),'Motivo privado de la primera cuenta');
  await userEvent.click(screen.getByRole('button',{name:'Confirmar rechazo'}));
  expect(screen.getByRole('button',{name:'Confirmar rechazo'})).toBeDisabled();expect(screen.getByLabelText('Motivo del rechazo')).toBeDisabled();
  await waitFor(()=>expect(api.fetch.mock.calls.some(c=>c[1]?.method==='POST')).toBe(true));
  api.setIdentity('otro');await act(async()=>{window.dispatchEvent(new Event('focus'));});
  await waitFor(()=>expect(screen.queryByLabelText('Motivo del rechazo')).not.toBeInTheDocument());
  await act(async()=>{pendingResponse.resolve(Response.json({solicitud:{...pending,estado:'rechazada'}}));});
  expect(screen.queryByText('Solicitud rechazada.')).not.toBeInTheDocument();
  expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private').every(q=>q.queryKey[1]==='otro')).toBe(true);
});
it('caducidad durante una decisión elimina el comentario y vuelve al acceso',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(fail(401,'Caducada')):undefined);
  const c=show();await userEvent.click(await screen.findByRole('button',{name:'Rechazar'}));
  await userEvent.type(screen.getByLabelText('Motivo del rechazo'),'Motivo que debe eliminarse');
  await userEvent.click(screen.getByRole('button',{name:'Confirmar rechazo'}));
  expect(await screen.findByRole('heading',{name:'Acceder a tu cuenta'})).toBeInTheDocument();
  expect(screen.queryByLabelText('Motivo del rechazo')).not.toBeInTheDocument();
  expect(c.getQueryCache().getAll().filter(q=>q.queryKey[0]==='private')).toHaveLength(0);
});
it('autor consulta comentario como texto plano y filtros de decisiones sin controles del revisor',async()=>{
  const api=backend();api.setIdentity('autor','solicitante');api.setState('rechazada');
  api.setComment('<img src=x onerror=alert(1)>\nTexto literal');
  show('/solicitudes?estado=rechazada');
  expect(await screen.findByRole('link',{name:'Expediente pendiente'})).toBeInTheDocument();
  expect(api.fetch.mock.calls.some(c=>c[0].includes('estado=rechazada'))).toBe(true);
  await userEvent.click(screen.getByRole('link',{name:'Expediente pendiente'}));
  const text=await screen.findByText('<img src=x onerror=alert(1)> Texto literal');
  expect(text).toHaveClass('plain-text');expect(text.querySelector('img')).toBeNull();
  expect(screen.queryByRole('button',{name:/Aprobar|Rechazar|Cancelar/})).not.toBeInTheDocument();
});
it('fallo técnico no confirma resolución y permite consultar el detalle',async()=>{
  const api=backend();api.override.mockImplementation((_p,o)=>o.method==='POST'?Promise.resolve(fail(503,'Servicio indisponible')):undefined);
  show();await userEvent.click(await screen.findByRole('button',{name:'Aprobar'}));
  await userEvent.click(screen.getByRole('button',{name:'Confirmar aprobación'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se puede completar');
  expect(screen.queryByText('Solicitud aprobada.')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Actualizar detalle'})).toBeInTheDocument();
});
