import type { Page } from '@playwright/test';
import { test, expect } from './fixtures.js';

async function logout(page: Page) {
  await page.getByRole('link', { name: 'Mi cuenta', exact: true }).first().click();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Acceder a tu cuenta' })).toBeVisible();
}
async function create(page: Page, title: string) {
  await page.getByRole('link', { name: 'Mis solicitudes', exact: true }).first().click();
  await page.getByRole('link', { name: 'Nuevo borrador' }).click();
  await page.getByLabel('Título', { exact: true }).fill(title);
  await page.getByLabel('Tipo de solicitud').selectOption('material');
  await page.getByLabel('Descripción (opcional)').fill('Descripción suficiente para enviar la solicitud.');
  await page.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(page.getByText('Borrador guardado.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/solicitudes\/[0-9a-f-]{36}$/);
  return new URL(page.url()).pathname;
}
async function send(page: Page) {
  await page.getByRole('button', { name: 'Enviar borrador' }).click();
  await expect(page.getByText('Solicitud enviada.', { exact: true })).toBeVisible();
}
async function cancel(page: Page) {
  await page.getByRole('button', { name: 'Cancelar solicitud', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, cancelar solicitud' }).click();
  await expect(page.getByText('Solicitud cancelada. No se puede reabrir.', { exact: true })).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function forbidden(page: Page, path: string) {
  const response = page.waitForResponse(r => new URL(r.url()).pathname === '/api' + path);
  await page.goto(path);
  expect((await response).status()).toBe(404);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: /Aprobar|Rechazar|Enviar borrador|Cancelar solicitud/ })).toHaveCount(0);
}

test('crear y editar, enviar, aprobar por teclado y consultar como autor', async ({ actors }, info) => {
  const author = await actors.open(0);
  const path = await create(author, 'Material para aprobar');
  await author.getByRole('link', { name: 'Editar borrador' }).click();
  await author.getByLabel('Título', { exact: true }).fill('Material editado');
  await author.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(author.getByRole('heading', { name: 'Material editado' })).toBeVisible();
  await send(author);
  const reviewer = await actors.open(2);
  await reviewer.getByRole('link', { name: 'Bandeja de revisión' }).click();
  await reviewer.getByRole('link', { name: 'Material editado' }).click();
  await reviewer.getByRole('button', { name: 'Aprobar', exact: true }).click();
  const field = reviewer.getByLabel('Comentario (opcional)');
  await expect(field).toBeFocused();
  await field.fill('Conforme con la petición.\nRevisión terminada.');
  await reviewer.keyboard.press('Escape');
  await expect(reviewer.getByRole('button', { name: 'Aprobar', exact: true })).toBeFocused();
  await reviewer.keyboard.press('Enter');
  await expect(field).toHaveValue('');
  await field.fill('Conforme con la petición.\nRevisión terminada.');
  await reviewer.keyboard.press('Tab');
  await expect(reviewer.getByRole('button', { name: 'Confirmar aprobación' })).toBeFocused();
  expect(await reviewer.getByRole('button', { name: 'Confirmar aprobación' }).evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe('none');
  await reviewer.keyboard.press('Enter');
  await expect(reviewer.getByText('Solicitud aprobada.', { exact: true })).toBeVisible();
  await expect(reviewer.getByRole('button', { name: 'Aprobar', exact: true })).toHaveCount(0);
  await author.goto(path);
  await expect(author.getByText('Aprobación de la solicitud', { exact: true })).toBeVisible();
  await expect(author.getByText('Conforme con la petición. Revisión terminada.', { exact: true })).toBeVisible();
  await noOverflow(author);
  await author.screenshot({ path: info.outputPath('aprobada-escritorio.png'), fullPage: true });
  await author.getByRole('link', { name: 'Mis solicitudes', exact: true }).click();
  await author.getByLabel('Filtrar por estado').selectOption('aprobada');
  await expect(author.getByRole('link', { name: 'Material editado' })).toBeVisible();
});

test('rechazar en móvil con motivo validado e historial para ambas cuentas', async ({ actors }, info) => {
  const author = await actors.open(0, true);
  const path = await create(author, 'Material para rechazar');
  await send(author);
  const reviewer = await actors.open(2, true);
  await reviewer.goto(path);
  await expect(reviewer.getByRole('heading', { name: /Material para rechazar|Conflicto entre cuentas/ })).toBeVisible();
  await reviewer.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await reviewer.getByRole('button', { name: 'Confirmar rechazo' }).click();
  const reason = reviewer.getByLabel('Motivo del rechazo');
  await expect(reason).toBeFocused();
  await expect(reason).toHaveAttribute('aria-invalid', 'true');
  await expect(reviewer.getByRole('alert')).toContainText('10 y 1000');
  await reason.fill('Falta justificar la necesidad.\nAñade los detalles solicitados.');
  await noOverflow(reviewer);
  await reviewer.screenshot({ path: info.outputPath('rechazo-formulario-movil.png'), fullPage: true });
  await reviewer.getByRole('button', { name: 'Confirmar rechazo' }).click();
  await expect(reviewer.getByText('Solicitud rechazada.', { exact: true })).toBeVisible();
  for (const page of [author, reviewer]) {
    await page.goto(path);
    await expect(page.getByText('Rechazo de la solicitud', { exact: true })).toBeVisible();
    await expect(page.getByText('Falta justificar la necesidad. Añade los detalles solicitados.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Aprobar|Rechazar|Cancelar solicitud/ })).toHaveCount(0);
    await noOverflow(page);
  }
  await author.screenshot({ path: info.outputPath('rechazada-autor-movil.png'), fullPage: true });
});

test('cancelar borrador y pendiente conserva distinta visibilidad y aislamiento', async ({ actors }) => {
  const author = await actors.open(0);
  const draft = await create(author, 'Borrador cancelado privado');
  await cancel(author);
  const sent = await create(author, 'Enviada cancelada visible');
  await send(author);
  await cancel(author);
  const reviewer = await actors.open(2);
  await forbidden(reviewer, draft);
  await reviewer.goto(sent);
  await expect(reviewer.getByText('Cancelación de la solicitud', { exact: true })).toBeVisible();
  await reviewer.getByRole('link', { name: 'Bandeja de revisión', exact: true }).click();
  await reviewer.getByLabel('Filtrar por estado').selectOption('cancelada');
  await expect(reviewer.getByRole('link', { name: 'Enviada cancelada visible' })).toBeVisible();
  await expect(reviewer.getByRole('link', { name: 'Borrador cancelado privado' })).toHaveCount(0);
  for (const index of [1, 3]) {
    const stranger = await actors.open(index);
    await stranger.goto('/solicitudes?estado=todos');
    await expect(stranger.getByText('No hay solicitudes en esta página.', { exact: true })).toBeVisible();
    await forbidden(stranger, sent);
  }
});

test('conflicto real: autor cancela mientras el revisor prepara rechazo', async ({ actors }) => {
  const author = await actors.open(0);
  const path = await create(author, 'Conflicto entre cuentas');
  await send(author);
  const reviewer = await actors.open(2);
  await reviewer.goto(path);
  await expect(reviewer.getByRole('heading', { name: /Material para rechazar|Conflicto entre cuentas/ })).toBeVisible();
  await reviewer.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await reviewer.getByLabel('Motivo del rechazo').fill('Este motivo no debe guardarse.');
  await cancel(author);
  await reviewer.getByRole('button', { name: 'Confirmar rechazo' }).click();
  await expect(reviewer.getByRole('alert')).toContainText('El estado ha cambiado');
  await reviewer.getByRole('button', { name: 'Actualizar detalle' }).click();
  await expect(reviewer.getByText('Cancelación de la solicitud', { exact: true })).toBeVisible();
  await expect(reviewer.getByLabel('Motivo del rechazo')).toHaveCount(0);
  await expect(reviewer.getByText('Este motivo no debe guardarse.')).toHaveCount(0);
  await expect(reviewer.getByRole('button', { name: /Aprobar|Rechazar/ })).toHaveCount(0);
});

test('logout y cambio de cuenta no recuperan datos privados de la anterior', async ({ actors }) => {
  const page = await actors.open(0);
  const path = await create(page, 'Datos privados de primera cuenta');
  await logout(page);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Acceder a tu cuenta' })).toBeVisible();
  await expect(page.getByText('Datos privados de primera cuenta')).toHaveCount(0);
  await actors.login(page, 1);
  await page.getByRole('link', { name: 'Mis solicitudes', exact: true }).click();
  await expect(page.getByText('No hay solicitudes en esta página.', { exact: true })).toBeVisible();
  await forbidden(page, path);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});
