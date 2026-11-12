import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, Outlet } from 'react-router';
import { AuthClient, type AuthState } from './auth-client';

const Context=createContext<{client:AuthClient;state:AuthState}|null>(null);
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('Falta contexto de acceso');return value;}
export function AuthArea(){
  const queries=useQueryClient();
  const [client]=useState(()=>new AuthClient(queries));
  const state=useSyncExternalStore(client.subscribe,client.getSnapshot);
  useEffect(()=>client.start(),[client]);
  return <Context.Provider value={{client,state}}><Outlet /></Context.Provider>;
}
export function SessionStatus(){
  const {client,state}=useAuth();
  if(state.status==='checking')return <p role="status">Comprobando sesión…</p>;
  if(state.status==='error')return <div><p role="alert">{state.message}</p><button onClick={()=>{void client.check();}}>Volver a comprobar sesión</button></div>;
  return null;
}
export function Login(){
  const {client,state}=useAuth();
  const [correo,setCorreo]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const errorRef=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
  if(state.status==='authenticated')return <Navigate to="/cuenta" replace />;
  return <section className="connection auth-panel" aria-labelledby="access-title">
    <h2 id="access-title">Acceder a tu cuenta</h2>
    {(state.status==='checking'||state.status==='error')?<SessionStatus />:
      <form onSubmit={event=>{
        event.preventDefault();setBusy(true);setError('');
        void client.login(correo,password).then(()=>{setPassword('');}).catch((cause:unknown)=>{
          setError(cause instanceof Error?cause.message:'No se ha podido acceder.');
        }).finally(()=>{setBusy(false);setPassword('');});
      }}>
        {state.message&&<p role="status">{state.message}</p>}
        <p className="connection-detail">Introduce las credenciales de tu cuenta.</p>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" name="correo" type="email" autoComplete="username" required maxLength={254}
          value={correo} onChange={event=>setCorreo(event.target.value)} disabled={busy}/>
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024}
          value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/>
        {error&&<p className="error" role="alert" tabIndex={-1} ref={errorRef}>{error}</p>}
        <button type="submit" disabled={busy}>{busy?'Accediendo…':'Acceder'}</button>
      </form>}
    <p><Link to="/">Estado técnico</Link></p>
  </section>;
}
export function Account(){
  const {client,state}=useAuth();
  if(state.status==='anonymous')return <Navigate to="/acceso" replace />;
  return <section className="connection auth-panel" aria-labelledby="account-title">
    <h2 id="account-title">Tu cuenta</h2>
    {state.status==='authenticated'?<>
      <p className="account-name">{state.identity.user.nombre}</p>
      <dl><dt>Rol</dt><dd>{state.identity.user.rol==='solicitante'?'Solicitante':'Revisor'}</dd>
        <dt>Correo</dt><dd>{state.identity.user.correo}</dd></dl>
      <p>Sesión válida hasta <time dateTime={state.identity.expiresAt}>{new Date(state.identity.expiresAt).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</time>.</p>
      <p><Link to="/solicitudes">{state.identity.user.rol==="solicitante"?"Mis solicitudes":"Bandeja de revisión"}</Link></p>
      <button onClick={()=>{void client.logout();}}>Cerrar sesión</button>
    </>:<SessionStatus />}
    <p><Link to="/">Estado técnico</Link></p>
  </section>;
}