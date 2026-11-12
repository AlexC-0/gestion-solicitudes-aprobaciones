import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { ReviewActions } from './ReviewActions';
import { SolicitudActions } from './SolicitudActions';
import { SessionStatus, useAuth } from './Auth';

interface Solicitud {
  responsable_id?:string|null; id:string; titulo:string; tipo_codigo:string; descripcion:string; estado:string;
  creada_en:string; actualizada_en:string; autor_nombre?:string; responsable_nombre?:string|null; enviada_en?:string|null; finalizada_en?:string|null;
}
interface Evento { id:string; accion:string; creada_en:string; actor_id:string; actor_nombre?:string; comentario?:string|null; estado_anterior?:string|null; estado_posterior:string }
interface Detail { solicitud:Solicitud; historial:Evento[] }
interface Tipo { codigo:string; nombre:string }
interface List { solicitudes:Solicitud[]; paginacion:{pagina:number;tamano:number;total:number;paginas:number} }
function usePrivate() {
  const {client,state}=useAuth();
  if(state.status!=='authenticated')throw new Error('Falta sesión');
  return {client,user:state.identity.user,epoch:client.getSessionKey()};
}
function date(value:string){return new Date(value).toLocaleString('es-ES');}
function ErrorMessage({error,retry}:{error:unknown;retry?:()=>void}) {
  const ref=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{ref.current?.focus();},[error]);
  return <div><p role="alert" className="error" tabIndex={-1} ref={ref}>{error instanceof Error?error.message:'No se ha podido completar la operación.'}</p>
    {retry&&<button onClick={retry}>Volver a intentar</button>}</div>;
}
export function RequestsArea(){
  const {state,client}=useAuth();
  if(state.status==='anonymous')return <Navigate to="/acceso" replace/>;
  if(state.status!=='authenticated')return <section className="connection"><SessionStatus/></section>;

  return <section className="connection requests-panel" key={state.identity.user.id+':'+client.getSessionKey()}>
    <nav aria-label="Solicitudes"><Link to="/solicitudes">{state.identity.user.rol==="revisor"?"Bandeja de revisión":"Mis solicitudes"}</Link><Link to="/cuenta">Mi cuenta</Link></nav>
    <Outlet/>
  </section>;
}
export function RequestsList(){
  const {client,user,epoch}=usePrivate();
  const [params,setParams]=useSearchParams();
  const page=params.get('pagina')??'1';
  const filter=params.get('estado')??(user.rol==='revisor'?'pendiente':'todos');
  const move=(pagina:string,estado=filter)=>setParams({pagina,estado});
  const filterQuery=filter==='todos'?'':'&estado='+encodeURIComponent(filter);
  const query=useQuery({queryKey:['private',user.id,epoch,'solicitudes',page,filter],
    queryFn:({signal})=>client.request<List>('solicitudes?pagina='+encodeURIComponent(page)+filterQuery,signal)});
  return <><h2>{user.rol==='revisor'?'Bandeja de revisión':'Mis solicitudes'}</h2>
    {user.rol==='solicitante'&&<p><Link className="action-link" to="/solicitudes/nueva">Nuevo borrador</Link></p>}
    <div className="state-filter"><label htmlFor="estado">Filtrar por estado</label>
      <select id="estado" value={filter} onChange={e=>move('1',e.target.value)}>
        <option value="todos">Todos los estados</option>
        <option value="borrador">Borrador</option><option value="pendiente">Pendiente</option>
        <option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option><option value="cancelada">Cancelada</option>
      </select>
    </div>
    {query.isPending?<p role="status">Cargando solicitudes…</p>:query.isError?<ErrorMessage error={query.error} retry={()=>{void query.refetch();}}/>:<>
      <p>{query.data.paginacion.total} solicitudes</p>
      {query.data.solicitudes.length===0?<p>No hay solicitudes en esta página.</p>:<ul className="request-list">
        {query.data.solicitudes.map(s=><li key={s.id}><Link to={'/solicitudes/'+s.id}>{s.titulo}</Link><span className="badge">{s.estado}</span>
          <p>{s.tipo_codigo} · Creada el {date(s.creada_en)}</p></li>)}
      </ul>}
      <nav className="pagination" aria-label="Paginación">
        <button disabled={query.data.paginacion.pagina<=1} onClick={()=>move(String(query.data.paginacion.pagina-1))}>Anterior</button>
        <span>Página {query.data.paginacion.pagina} de {Math.max(1,query.data.paginacion.paginas)}</span>
        <button disabled={query.data.paginacion.pagina>=query.data.paginacion.paginas} onClick={()=>move(String(query.data.paginacion.pagina+1))}>Siguiente</button>
      </nav>
    </>}</>;
}
function useDetail(){
  const {id=''}=useParams();
  const {client,user,epoch}=usePrivate();
  return useQuery({queryKey:['private',user.id,epoch,'solicitud',id],
    queryFn:({signal})=>client.request<Detail>('solicitudes/'+encodeURIComponent(id),signal)});
}
export function RequestDetail(){
  const {user,epoch}=usePrivate();
  const query=useDetail();
  const location=useLocation();
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(query.data)heading.current?.focus();},[query.data?.solicitud.id]);
  if(query.isPending)return <p role="status">Cargando solicitud…</p>;
  if(query.isError)return <ErrorMessage error={query.error} retry={()=>{void query.refetch();}}/>;
  const s=query.data.solicitud;
  const saved=location.state as {saved?:{userId:string;epoch:number}}|null;
  return <><h2 tabIndex={-1} ref={heading}>{s.titulo}</h2>
    {s.estado==='borrador'&&saved?.saved?.userId===user.id&&saved.saved.epoch===epoch&&<p className="success" role="status">Borrador guardado.</p>}
    <dl><dt>Autor</dt><dd>{s.autor_nombre??user.nombre}</dd>
      <dt>Responsable</dt><dd>{s.responsable_nombre??'Sin asignar'}</dd>
      <dt>Estado</dt><dd>{s.estado}</dd><dt>Tipo</dt><dd>{s.tipo_codigo}</dd>
      <dt>Descripción</dt><dd className="plain-text">{s.descripcion||'Sin descripción.'}</dd>
      {s.enviada_en&&<><dt>Enviada</dt><dd>{date(s.enviada_en)}</dd></>}
      {s.finalizada_en&&<><dt>Finalizada</dt><dd>{date(s.finalizada_en)}</dd></>}
      <dt>Creada</dt><dd>{date(s.creada_en)}</dd><dt>Última modificación</dt><dd>{date(s.actualizada_en)}</dd></dl>
    {user.rol==='solicitante'&&s.estado==='borrador'&&<p><Link className="action-link" to={'/solicitudes/'+s.id+'/editar'}>Editar borrador</Link></p>}
    {user.rol==='solicitante'&&<SolicitudActions key={s.id} id={s.id} estado={s.estado} reload={async()=>{
      const result=await query.refetch();if(result.isError)throw result.error;
    }}/>}
    {user.rol==='revisor'&&s.responsable_id===user.id&&<ReviewActions key={s.id} id={s.id} estado={s.estado} reload={async()=>{
      const result=await query.refetch();if(result.isError)throw result.error;
    }}/>}
    <h3>Historial</h3><ol className="history">{query.data.historial.map(e=><li key={e.id}>
      <strong>{e.accion==='creacion'?'Creación del borrador':e.accion==='envio'?'Envío de la solicitud':e.accion==='cancelacion'?'Cancelación de la solicitud':e.accion==='aprobacion'?'Aprobación de la solicitud':e.accion==='rechazo'?'Rechazo de la solicitud':e.accion}</strong> · {date(e.creada_en)}
      <p>Actor: {e.actor_id===user.id?'Tú':e.actor_nombre??'Usuario'} · {e.estado_anterior?e.estado_anterior+" → ":"Estado: "}{e.estado_posterior}</p>
      {e.comentario!==null&&e.comentario!==undefined&&<p className="plain-text">{e.comentario}</p>}
    </li>)}</ol></>;
}
export function EditRequest(){
  const query=useDetail();
  if(query.isPending)return <p role="status">Cargando borrador…</p>;
  if(query.isError)return <ErrorMessage error={query.error} retry={()=>{void query.refetch();}}/>;
  if(query.data.solicitud.estado!=='borrador')return <p role="alert">Solo se pueden editar solicitudes en borrador.</p>;
  return <DraftForm key={query.data.solicitud.id} initial={query.data.solicitud}/>;
}
const validPlain=(v:string)=>!/[\uD800-\uDFFF]/u.test(v)&&!v.includes('\0')&&!/<\/?[a-z][^>]*>/iu.test(v);
export function DraftForm({initial}:{initial?:Solicitud}){
  const {user}=usePrivate();
  if(user.rol!=='solicitante')return <p role="alert">Solo un solicitante puede crear o editar borradores.</p>;
  return <DraftEditor {...(initial?{initial}:{})}/>;
}
function DraftEditor({initial}:{initial?:Solicitud}){
  const {client,user,epoch}=usePrivate();
  const queries=useQueryClient();
  const navigate=useNavigate();
  const [titulo,setTitulo]=useState(initial?.titulo??'');
  const [tipo,setTipo]=useState(initial?.tipo_codigo??'');
  const [descripcion,setDescripcion]=useState(initial?.descripcion??'');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<Error>();
  const alive=useRef(true);
  const abort=useRef<AbortController>(new AbortController());
  useEffect(()=>{alive.current=true;abort.current=new AbortController();return()=>{alive.current=false;abort.current.abort();};},[]);
  const catalog=useQuery({queryKey:['private',user.id,epoch,'tipos'],
    queryFn:({signal})=>client.request<{tipos:Tipo[]}>('tipos-solicitud',signal)});
  const canUpdate=()=>alive.current&&client.isSessionCurrent(epoch);
  async function submit(){
    if(busy)return;
    const title=titulo.trim();
    if(Array.from(title).length<3||Array.from(title).length>120||!validPlain(title)){
      setError(new Error('El título debe tener entre 3 y 120 caracteres y ser texto plano.'));return;
    }
    if(!catalog.data?.tipos.some(t=>t.codigo===tipo)){setError(new Error('Selecciona un tipo disponible.'));return;}
    if(Array.from(descripcion).length>3000||!validPlain(descripcion)){setError(new Error('La descripción admite hasta 3000 caracteres de texto plano.'));return;}
    setBusy(true);setError(undefined);
    try{
      const result=await client.request<{solicitud:Solicitud}>('solicitudes'+(initial?'/'+initial.id:''),abort.current.signal,
        {method:initial?'PATCH':'POST',body:JSON.stringify({titulo:title,tipo_codigo:tipo,descripcion})});
      if(!canUpdate())return;
      await queries.invalidateQueries({queryKey:['private',user.id,epoch]});
      if(!canUpdate())return;
      navigate('/solicitudes/'+result.solicitud.id,{replace:true,state:{saved:{userId:user.id,epoch}}});
    }catch(cause){if(canUpdate())setError(cause instanceof Error?cause:new Error('No se pudo confirmar el guardado.'));}
    finally{if(canUpdate())setBusy(false);}
  }
  return <><h2>{initial?'Editar borrador':'Nuevo borrador'}</h2>
    <p>Solo tú puedes ver este borrador. Puedes dejar la descripción vacía.</p>
    {catalog.isPending?<p role="status">Cargando tipos…</p>:catalog.isError?<ErrorMessage error={catalog.error} retry={()=>{void catalog.refetch();}}/>:
    <form noValidate onSubmit={e=>{e.preventDefault();void submit();}}>
      <label htmlFor="titulo">Título</label>
      <input id="titulo" value={titulo} onChange={e=>setTitulo(e.target.value)} disabled={busy} aria-describedby="titulo-help" required/>
      <small id="titulo-help">De 3 a 120 caracteres, sin espacios exteriores. {Array.from(titulo.trim()).length}/120</small>
      <label htmlFor="tipo">Tipo de solicitud</label>
      <select id="tipo" value={tipo} onChange={e=>setTipo(e.target.value)} disabled={busy} required>
        <option value="">Selecciona un tipo</option>{catalog.data.tipos.map(t=><option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
      </select>
      <label htmlFor="descripcion">Descripción (opcional)</label>
      <textarea id="descripcion" rows={6} value={descripcion} onChange={e=>setDescripcion(e.target.value)} disabled={busy} aria-describedby="descripcion-help"/>
      <small id="descripcion-help">Texto plano. {Array.from(descripcion).length}/3000 caracteres.</small>
      {error&&<><ErrorMessage error={error}/><Link to="/solicitudes">Comprobar Mis solicitudes antes de repetir</Link></>}
      <div className="form-actions"><button type="submit" disabled={busy}>{busy?'Guardando…':'Guardar borrador'}</button>
        <Link to={initial?'/solicitudes/'+initial.id:'/solicitudes'}>Volver sin guardar</Link></div>
    </form>}</>;
}
