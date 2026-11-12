import type { QueryClient } from '@tanstack/react-query';

export interface Identity {
  user: { id: string; nombre: string; correo: string; rol: 'solicitante' | 'revisor' };
  expiresAt: string;
}
export type AuthState =
  | { status: 'checking' }
  | { status: 'anonymous'; message?: string }
  | { status: 'authenticated'; identity: Identity }
  | { status: 'error'; message: string };
export class AuthFailure extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
function identity(value: unknown): Identity {
  if (!value || typeof value !== 'object' || !('user' in value) || !('expiresAt' in value)) throw new Error('Respuesta de sesión no válida.');
  const u=value.user;
  if (!u || typeof u!=='object' || !('id' in u) || typeof u.id!=='string' ||
      !('nombre' in u) || typeof u.nombre!=='string' || !('correo' in u) || typeof u.correo!=='string' ||
      !('rol' in u) || !['solicitante','revisor'].includes(String(u.rol)) ||
      typeof value.expiresAt!=='string' || !Number.isFinite(Date.parse(value.expiresAt))) throw new Error('Respuesta de sesión no válida.');
  return value as Identity;
}
const technical='No se ha podido comprobar la sesión. Comprueba la conexión y vuelve a intentarlo.';
export class AuthClient {
  private state: AuthState={status:'checking'};
  private listeners=new Set<()=>void>();
  private revision=0;
  private epoch=0;
  private privateAbort=new AbortController();
  getSessionKey=()=>this.epoch;
  isSessionCurrent=(epoch:number)=>epoch===this.epoch && this.state.status==='authenticated';
  private abort: AbortController | undefined;
  private token: string | undefined;
  private expiry: ReturnType<typeof setTimeout> | undefined;
  private channel: BroadcastChannel | undefined;
  constructor(private readonly queries: QueryClient) {}
  getSnapshot=()=>this.state;
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
  private set(state: AuthState) {
    this.state=state;
    if(this.expiry)clearTimeout(this.expiry);
    if(state.status==='authenticated'){
      const remaining=Date.parse(state.identity.expiresAt)-Date.now();
      if(remaining<=0){this.expire();return;}
      this.expiry=setTimeout(()=>this.expire(),Math.min(remaining,2147483647));
    }
    this.listeners.forEach(fn=>fn());
  }
  private clearPrivate() {
    ++this.epoch;
    this.privateAbort.abort();this.privateAbort=new AbortController();this.token=undefined;
    const filter={predicate:(q:{queryKey:readonly unknown[]})=>q.queryKey[0]==='private'};
    void this.queries.cancelQueries(filter);
    this.queries.removeQueries(filter);
  }
  private begin(reset=true) {
    this.abort?.abort();this.abort=new AbortController();
    if(reset)this.clearPrivate();
    return {revision:++this.revision,signal:this.abort.signal};
  }
  private current(revision:number){return revision===this.revision;}
  private async http(path:string,signal:AbortSignal,options:RequestInit={}) {
    const response=await fetch('/api/auth/'+path,{...options,signal,credentials:'same-origin',cache:'no-store'});
    if(!response.ok){
      const message=response.status===429?'Demasiados intentos. Espera antes de volver a intentarlo.':
        response.status===409?'Ya hay una sesión abierta. Compruébala antes de cambiar de cuenta.':
        response.status===403?'La comprobación de seguridad ha caducado. Vuelve a intentarlo.':
        response.status===401?'Correo o contraseña incorrectos.':technical;
      throw new AuthFailure(response.status,message);
    }
    return response.status===204?undefined:await response.json() as unknown;
  }
  private async csrf(signal:AbortSignal) {
    const value=await this.http('csrf',signal);
    if(!value||typeof value!=='object'||!('csrfToken' in value)||typeof value.csrfToken!=='string')throw new Error(technical);
    return value.csrfToken;
  }
  async check(reset=false) {
    const previous=this.state.status==='authenticated'?this.state.identity:undefined;
    const op=this.begin(reset || !previous);
    if(reset || !previous)this.set({status:'checking'});
    try {
      const result=identity(await this.http('me',op.signal));
      if(!this.current(op.revision))return;
      if(previous && (previous.user.id!==result.user.id || previous.user.rol!==result.user.rol || previous.expiresAt!==result.expiresAt))this.clearPrivate();
      this.set({status:'authenticated',identity:result});
    }catch(error){
      if(!this.current(op.revision))return;
      this.clearPrivate();
      this.set(error instanceof AuthFailure&&error.status===401?{status:'anonymous'}:{status:'error',message:technical});
    }
  }
  async request<T>(path:string,signal:AbortSignal,options:RequestInit={}):Promise<T> {
    const epoch=this.epoch;
    const current=()=>{if(!this.isSessionCurrent(epoch))throw new DOMException('Sesión cambiada','AbortError');};
    current();
    const combined=AbortSignal.any([signal,this.privateAbort.signal]);
    const headers=new Headers(options.headers);
    const writing=options.method==='POST'||options.method==='PATCH';
    if(writing){
      if(!this.token){
        try {
          const token=await this.csrf(combined);current();this.token=token;
        } catch(error) {
          current();
          if(error instanceof AuthFailure && error.status===401)this.expire();
          throw error;
        }
      }
      headers.set('X-CSRF-Token',this.token);
      headers.set('Content-Type','application/json');
    }
    current();
    let response:Response;
    try{
      response=await fetch('/api/'+path,{...options,headers,signal:combined,credentials:'same-origin',cache:'no-store'});
    }catch{
      current();
      throw new Error(writing?'No se ha podido confirmar el guardado. Puede haberse guardado; comprueba Mis solicitudes antes de repetirlo.':'No se han podido cargar los datos. Comprueba la conexión y vuelve a intentarlo.');
    }
    current();
    if(response.status===401){this.expire();throw new AuthFailure(401,'La sesión ha caducado.');}
    if(!response.ok){
      if(response.status===403)this.token=undefined;
      const data:unknown=await response.json().catch(()=>undefined);current();
      let message='No se puede completar la operación. Vuelve a intentarlo más tarde.';
      if([400,403,404,409,413].includes(response.status) && data && typeof data==='object' && 'error' in data){
        const error=data.error;
        if(error && typeof error==='object' && 'message' in error && typeof error.message==='string')message=error.message;
      }
      throw new AuthFailure(response.status,message);
    }
    try { const data=await response.json() as T;current();return data; }
    catch { current();throw new Error(writing?'No se ha podido confirmar el guardado. Comprueba Mis solicitudes antes de repetirlo.':'La respuesta no se ha podido leer. Vuelve a intentarlo.'); }
  }
  async login(correo:string,password:string) {
    const op=this.begin();
    try {
      const token=await this.csrf(op.signal);
      const result=identity(await this.http('login',op.signal,{method:'POST',
        headers:{'Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify({correo,password})}));
      const nextToken=await this.csrf(op.signal);
      if(!this.current(op.revision))throw new Error('La sesión cambió durante el acceso.');
      this.token=nextToken;this.set({status:'authenticated',identity:result});this.channel?.postMessage('changed');
    }catch(error){
      if(this.current(op.revision)) {
        if(error instanceof AuthFailure&&[400,401,403,429].includes(error.status))this.set({status:'anonymous'});
        else this.set({status:'error',message:technical});
      }
      throw error instanceof AuthFailure?error:new Error(technical);
    }
  }
  async logout() {
    const op=this.begin();this.set({status:'checking'});
    try {
      const token=await this.csrf(op.signal);
      await this.http('logout',op.signal,{method:'POST',headers:{'X-CSRF-Token':token}});
      if(this.current(op.revision)){this.set({status:'anonymous',message:'Sesión cerrada.'});this.channel?.postMessage('changed');}
    }catch(error){
      if(!this.current(op.revision))return;
      if(error instanceof AuthFailure&&error.status===401){this.set({status:'anonymous'});this.channel?.postMessage('changed');}
      else this.set({status:'error',message:'No se ha podido confirmar el cierre de sesión. Comprueba la conexión y vuelve a comprobarla.'});
    }
  }
  expire() { this.begin();this.set({status:'anonymous',message:'Tu sesión ha caducado. Vuelve a acceder.'}); }
  start() {
    const revalidate=()=>{void this.check();};
    window.addEventListener('focus',revalidate);
    const visibility=()=>{if(document.visibilityState==='visible')revalidate();};
    document.addEventListener('visibilitychange',visibility);
    if(typeof BroadcastChannel!=='undefined'){
      this.channel=new BroadcastChannel('chamba-auth');
      this.channel.onmessage=event=>{if(event.data==='changed')void this.check(true);};
    }
    void this.check();
    return()=>{
      ++this.revision;this.abort?.abort();this.token=undefined;this.clearPrivate();
      if(this.expiry)clearTimeout(this.expiry);
      this.channel?.close();this.channel=undefined;
      window.removeEventListener('focus',revalidate);
      document.removeEventListener('visibilitychange',visibility);
    };
  }
}