import { expect, it } from 'vitest';
import { readPort } from '../src/config.js';

it('usa el puerto predeterminado y acepta otro puerto válido', () => {
  expect(readPort(undefined)).toBe(3000);
  expect(readPort('3100')).toBe(3100);
});

it('rechaza puertos vacíos, parciales o fuera de rango', () => {
  for (const value of ['', '0', '-1', '65536', '3000abc', '3.5', ' 3000']) {
    expect(() => readPort(value), value).toThrow('API_PORT');
  }
});
