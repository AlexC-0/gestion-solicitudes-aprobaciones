import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './Auth';
import { AuthFailure } from './auth-client';

type Decision='aprobar'|'rechazar';
export function ReviewActions({id,estado,reload}:{id:string;estado:string;reload:()=>Promise<unknown>}){
  const {client,state}=useAuth();
  const queries=useQueryClient(),epoch=client.getSessionKey();
  const userId=state.status==='authenticated'?state.identity.user.id:'';
  const [mode,setMode]=useState<Decision>();
  const [text,setText]=useState('');
  const [fieldError,setFieldError]=useState('');
  const [error,setError]=useState<Error>();
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const alive=useRef(true),abort=useRef(new AbortController());
  const input=useRef<HTMLTextAreaElement>(null),feedback=useRef<HTMLParagraphElement>(null);
  const approve=useRef<HTMLButtonElement>(null),reject=useRef<HTMLButtonElement>(null);
  const restore=useRef<Decision|undefined>(undefined);
  useEffect(()=>{alive.current=true;abort.current=new AbortController();return()=>{alive.current=false;abort.current.abort();};},[]);
  useEffect(()=>{
    if(mode)input.current?.focus();
    else if(restore.current){(restore.current==='aprobar'?approve:reject).current?.focus();restore.current=undefined;}
  },[mode]);
  useEffect(()=>{if(estado!=='pendiente'){setMode(undefined);setText('');setFieldError('');}},[estado]);
  useEffect(()=>{if(fieldError)input.current?.focus();},[fieldError]);
  useEffect(()=>{if(error||message)feedback.current?.focus();},[error,message]);
  const current=()=>alive.current&&client.isSessionCurrent(epoch);
  const needsRefresh=!!error&&!(error instanceof AuthFailure&&error.status===400);
  function open(decision:Decision){setMode(decision);setText('');setFieldError('');setError(undefined);setMessage('');}
  function close(){restore.current=mode;setMode(undefined);setText('');setFieldError('');setError(undefined);}
  async function submit(){
    if(!mode||busy||needsRefresh)return;
    const normalized=text.trim(),length=Array.from(normalized).length;
    if(length>1000||(mode==='rechazar'&&length<10)||/[\uD800-\uDFFF]/u.test(normalized)||normalized.includes('\0')||/<\/?[a-z][^>]*>/iu.test(normalized)){
      setFieldError(mode==='aprobar'?'El comentario admite hasta 1000 caracteres de texto plano.':'El motivo debe tener entre 10 y 1000 caracteres de texto plano, sin contar espacios exteriores.');return;
    }
    setBusy(true);setError(undefined);setFieldError('');setMessage('');
    try{
      await client.request('solicitudes/'+id+'/'+mode,abort.current.signal,{method:'POST',
        body:JSON.stringify(mode==='aprobar'?{comentario:normalized}:{motivo:normalized})});
      if(!current())return;
      setMessage(mode==='aprobar'?'Solicitud aprobada.':'Solicitud rechazada.');
      setMode(undefined);setText('');
      await queries.invalidateQueries({queryKey:['private',userId,epoch]});
    }catch(cause){
      if(current()){
        setError(cause instanceof AuthFailure?cause:new Error('No se ha podido confirmar la decisión. Podría haberse guardado; consulta el detalle antes de repetirla.'));
        if(cause instanceof AuthFailure&&cause.status===409){setMode(undefined);setText('');}
      }
    }finally{if(current())setBusy(false);}
  }
  async function refresh(){
    setBusy(true);setMessage('');
    try{await reload();if(current())setError(undefined);}
    catch{if(current())setError(new Error('No se pudo recuperar el detalle. Comprueba la conexión antes de repetir la decisión.'));}
    finally{if(current())setBusy(false);}
  }
  return <div className="request-actions" aria-busy={busy}>
    {message&&<p role="status" className="success" tabIndex={-1} ref={feedback}>{message}</p>}
    {error&&<div><p role="alert" id="decision-feedback" className="error" tabIndex={-1} ref={feedback}>{error.message}</p>
      {needsRefresh&&<button disabled={busy} onClick={()=>{void refresh();}}>Actualizar detalle</button>}</div>}
    {estado==='pendiente'&&<div className="form-actions">
      <button ref={approve} disabled={busy||!!mode||needsRefresh} onClick={()=>open('aprobar')}>Aprobar</button>
      <button ref={reject} disabled={busy||!!mode||needsRefresh} onClick={()=>open('rechazar')}>Rechazar</button>
    </div>}
    {mode&&estado==='pendiente'&&<form className="decision-form" noValidate aria-labelledby="decision-title"
      onSubmit={e=>{e.preventDefault();void submit();}} onKeyDown={e=>{if(e.key==='Escape'&&!busy){e.preventDefault();close();}}}>
      <h3 id="decision-title">{mode==='aprobar'?'Aprobar solicitud':'Rechazar solicitud'}</h3>
      <p>La decisión es definitiva. No se podrá reabrir ni modificar.</p>
      <label htmlFor="decision-text">{mode==='aprobar'?'Comentario (opcional)':'Motivo del rechazo'}</label>
      <textarea id="decision-text" ref={input} rows={5} value={text} disabled={busy}
        required={mode==='rechazar'} aria-invalid={!!fieldError}
        aria-describedby={'decision-help'+(fieldError?' decision-field-error':'')+(error?' decision-feedback':'')}
        onChange={e=>{setText(e.target.value);setFieldError('');}}/>
      <small id="decision-help">{mode==='aprobar'?'Hasta 1000':'De 10 a 1000'} caracteres tras recortar espacios exteriores. {Array.from(text.trim()).length}/1000</small>
      {fieldError&&<p id="decision-field-error" className="error" role="alert">{fieldError}</p>}
      <div className="form-actions"><button type="submit" disabled={busy||needsRefresh}>{mode==='aprobar'?'Confirmar aprobación':'Confirmar rechazo'}</button>
        <button type="button" disabled={busy} onClick={close}>Volver sin resolver</button></div>
    </form>}
    {busy&&<p role="status">Procesando decisión…</p>}
  </div>;
}
