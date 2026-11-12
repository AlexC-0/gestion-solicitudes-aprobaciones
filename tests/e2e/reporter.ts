import { writeFileSync } from 'node:fs';
import { relative, resolve, basename, isAbsolute } from 'node:path';
import type { Reporter, TestCase, TestResult, FullResult, TestError } from '@playwright/test/reporter';

// Nunca volcar call logs, cuerpos de login, cookies o argumentos de fill.
export default class SafeReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    console.log(result.status + ': ' + test.title);
    // Playwright puede crear error-context.md incluso sin trazas; sustituirlo
    // antes de entregar el resultado para que no conserve argumentos de login.
    for (const attachment of result.attachments) {
      if (attachment.name !== 'error-context' || !attachment.path) continue;
      const path = resolve(attachment.path);
      const inside = relative(resolve('test-results/e2e'), path);
      if (inside.startsWith('..') || isAbsolute(inside) || basename(path) !== 'error-context.md') {
        throw new Error('E2E: ruta de informe fuera del directorio propio.');
      }
      writeFileSync(path, 'Caso: ' + test.title + '\nEstado: ' + result.status +
        '\nDetalles privados omitidos. Revisa las aserciones del caso.\n');
    }
    for (const error of result.errors) this.onError(error);
  }
  onError(error: TestError) {
    const text = error.message ?? '';
    if (text.includes("Executable doesn't exist")) {
      console.error('E2E: falta Chromium; ejecuta npm run e2e:install.');
    } else if (text.split('\n').some(line => /^(?:Error: )?E2E:/.test(line))) {
      console.error(text.split('\n').find(line => /^(?:Error: )?E2E:/.test(line))?.replace(/^Error: /, ''));
    } else {
      console.error('E2E: falló una comprobación; ubicaciones sin datos privados:');
      for (const line of (error.stack ?? '').split('\n')) {
        if (/^\s+at /.test(line) && /tests[\\/]e2e[\\/].*:\d+:\d+/.test(line)) console.error(line);
      }
    }
  }
  onEnd(result: FullResult) { console.log('E2E: ' + result.status); }
}
