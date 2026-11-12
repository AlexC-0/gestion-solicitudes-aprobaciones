export function readPort(value: string | undefined): number {
  if (value === undefined) return 3000;
  if (!/^[0-9]+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error('API_PORT debe ser un entero entre 1 y 65535.');
  }
  return Number(value);
}
