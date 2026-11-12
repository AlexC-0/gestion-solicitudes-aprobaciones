import { useQuery } from '@tanstack/react-query';
import { Link, Route, Routes } from 'react-router';
import { checkHealth } from './health';
import { RequestsArea, RequestsList, DraftForm, RequestDetail, EditRequest } from './Solicitudes';
import { AuthArea, Login, Account } from './Auth';

function Home() {
  const health = useQuery({ queryKey: ['health'], queryFn: ({ signal }) => checkHealth(signal) });
  const checking = health.isPending || health.isFetching;
  const state = checking ? 'loading' : health.isError ? 'error' : 'success';

  return (
    <section className="connection" aria-labelledby="connection-title">
      <div className="section-heading">
        <span className="section-number" aria-hidden="true">01</span>
        <h2 id="connection-title">Estado de la conexión</h2>
      </div>
      <p className={`connection-status ${state}`} role="status" aria-live="polite">
        <span className="status-dot" aria-hidden="true" />
        {checking ? 'Comprobando conexión…' : health.isError
          ? 'No se ha podido conectar con el servidor.' : 'Conexión correcta'}
      </p>
      <p className="connection-detail">
        {health.isError && !checking
          ? 'Comprueba que el servidor esté en marcha y vuelve a intentarlo.'
          : 'Esta comprobación confirma que el servidor HTTP responde. No verifica una base de datos ni la disponibilidad completa del sistema.'}
      </p>
      <button type="button" onClick={() => { void health.refetch(); }} disabled={checking}>
        {checking ? 'Comprobando…' : 'Volver a comprobar'}
      </button>
    </section>
  );
}

function NotFound() {
  return (
    <section className="connection" aria-labelledby="not-found-title">
      <h2 id="not-found-title">Página no encontrada</h2>
      <p>La dirección que has abierto no corresponde a una página disponible.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <div className="page-shell">
        <header className="project-header">
          <p className="eyebrow">CHAMBA DIARIA <span aria-hidden="true">/</span> PROYECTO 02</p>
          <nav aria-label="Principal"><Link to="/">Inicio</Link><Link to="/cuenta">Mi cuenta</Link></nav>
        </header>
        <main id="contenido" tabIndex={-1}>
          <div className="intro">
            <h1>Gestión de solicitudes<br className="wide-break" /> y aprobaciones</h1>
            <p>Un espacio para organizar solicitudes internas y seguir sus decisiones.</p>
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<AuthArea />}>
              <Route path="/acceso" element={<Login />} />
              <Route path="/cuenta" element={<Account />} />
              <Route path="/solicitudes" element={<RequestsArea />}>
                <Route index element={<RequestsList />} />
                <Route path="nueva" element={<DraftForm />} />
                <Route path=":id" element={<RequestDetail />} />
                <Route path=":id/editar" element={<EditRequest />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <p className="scope-note">Borradores propios disponibles. El envío y la resolución se incorporarán en próximas fases.</p>
        </main>
        <footer>CHAMBA DIARIA · Aprender construyendo</footer>
      </div>
    </>
  );
}
