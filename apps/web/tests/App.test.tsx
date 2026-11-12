import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { createQueryClient } from '../src/health';

const clients: ReturnType<typeof createQueryClient>[] = [];
afterEach(() => { clients.splice(0).forEach((client) => client.clear()); });

function renderApp(path = '/') {
  const client = createQueryClient();
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
    </QueryClientProvider>,
  );
}

it('muestra carga y después éxito según la respuesta de la consulta', async () => {
  let resolveResponse!: (response: Response) => void;
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((resolve) => { resolveResponse = resolve; }));
  vi.stubGlobal('fetch', fetchMock);
  renderApp();
  expect(screen.getByRole('status')).toHaveTextContent('Comprobando conexión');
  expect(screen.getByRole('button', { name: 'Comprobando…' })).toBeDisabled();
  resolveResponse(Response.json({ status: 'ok' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Conexión correcta'));
  expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(screen.getByRole('button', { name: 'Volver a comprobar' })).toBeEnabled();
});

it('muestra un error de red y permite reintentar manualmente con teclado', async () => {
  const fetchMock = vi.fn()
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(Response.json({ status: 'ok' }));
  vi.stubGlobal('fetch', fetchMock);
  const user = userEvent.setup();
  renderApp();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se ha podido conectar'));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  screen.getByRole('button', { name: 'Volver a comprobar' }).focus();
  await user.keyboard('{Enter}');
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Conexión correcta'));
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('no conserva un éxito anterior cuando una nueva comprobación falla', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ status: 'ok' }))
    .mockResolvedValueOnce(Response.json({ error: 'fallo' }, { status: 503 }));
  vi.stubGlobal('fetch', fetchMock);
  renderApp();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Conexión correcta'));
  await userEvent.click(screen.getByRole('button', { name: 'Volver a comprobar' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se ha podido conectar'));
  expect(screen.queryByText('Conexión correcta')).not.toBeInTheDocument();
});

it('no anuncia éxito si el servidor responde con un contrato incorrecto', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'otro' })));
  renderApp();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No se ha podido conectar'));
});

it('ofrece volver al inicio desde una ruta desconocida', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ status: 'ok' }));
  vi.stubGlobal('fetch', fetchMock);
  renderApp('/no-existe');
  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('link', { name: 'Volver al inicio' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Conexión correcta'));
});
