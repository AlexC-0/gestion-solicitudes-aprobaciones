import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './Auth';
import { AuthFailure } from './auth-client';

export function SolicitudActions({id,estado,reload}:{id:string;estado:string;reload:()=>Promise<unknown>}){
  const {client,state}=useAuth();
  const queries=useQueryClient();
  const epoch=client.getSessionKey();
  const userId=state.status==='authenticated'?state.identity.user.id:'';
  const [confirm,setConfirm]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState<Error>();
  const alive=useRef(true),abort=useRef(new AbortController());
  const cancelButton=useRef<HTMLButtonElement>(null),keepButton=useRef<HTMLButtonElement>(null);
  const feedback=useRef<HTMLParagraphElement>(null);
  const returnFocus=useRef(false);
  useEffect(()=>{alive.current=true;abort.current=new AbortController();return()=>{alive.current=false;abort.current.abort();};},[]);
  useEffect(()=>{
    if(confirm)keepButton.current?.focus();
    else if(returnFocus.current){returnFocus.current=false;cancelButton.current?.focus();}
  },[confirm]);
  useEffect(()=>{if(message||error)feedback.current?.focus();},[message,error]);
  const current=()=>alive.current&&client.isSessionCurrent(epoch);
  async function act(action:'enviar'|'cancelar'){
    if(busy)return;
    setBusy(true);setMessage('');setError(undefined);
    try{
      await client.request('solicitudes/'+id+'/'+action,abort.current.signal,{method:'POST',body:'{}'});
      if(!current())return;
      setConfirm(false);
      setMessage(action==='enviar'?'Solicitud enviada.':'Solicitud cancelada. No se puede reabrir.');
      await queries.invalidateQueries({queryKey:['private',userId,epoch]});
    }catch(cause){
      if(current()){
        setConfirm(false);
        setError(cause instanceof AuthFailure?cause:new Error('No se ha podido confirmar la acción. Puede haberse completado; comprueba el detalle antes de repetirla.'));
      }
    }finally{if(current())setBusy(false);}
  }
  async function refresh(){
    setBusy(true);setMessage('');
    try{await reload();if(current())setError(undefined);}
    catch{if(current())setError(new Error('No se pudo recuperar el detalle. Comprueba la conexión antes de repetir la acción.'));}
    finally{if(current())setBusy(false);}
  }
  function close(){returnFocus.current=true;setConfirm(false);}
  return <div className="request-actions" aria-busy={busy}>
    {message&&<p role="status" tabIndex={-1} ref={feedback} className="success">{message}</p>}
    {error&&<div><p role="alert" tabIndex={-1} ref={feedback} className="error">{error.message}</p>
      <button disabled={busy} onClick={()=>{void refresh();}}>Actualizar detalle</button></div>}
    <div className="form-actions">
      {estado==='borrador'&&<button disabled={busy||!!error||confirm} onClick={()=>{void act('enviar');}}>Enviar borrador</button>}
      {['borrador','pendiente'].includes(estado)&&<button ref={cancelButton} disabled={busy||!!error||confirm} onClick={()=>setConfirm(true)}>Cancelar solicitud</button>}
    </div>
    {busy&&<p role="status">Procesando…</p>}
    {confirm&&<div className="cancel-confirmation" role="alertdialog" aria-labelledby="cancel-title" aria-describedby="cancel-help"
      onKeyDown={e=>{if(e.key==='Escape'&&!busy)close();}}>
      <h3 id="cancel-title">Confirmar cancelación</h3>
      <p id="cancel-help">La solicitud quedará cancelada y no se podrá reabrir ni editar.</p>
      <div className="form-actions"><button ref={keepButton} disabled={busy} onClick={close}>Volver sin cancelar</button>
        <button disabled={busy} onClick={()=>{void act('cancelar');}}>Sí, cancelar solicitud</button></div>
    </div>}
  </div>;
}
