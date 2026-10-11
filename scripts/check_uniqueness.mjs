// Compatibility entry point. Unique titles alone are not content coverage.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const result = spawnSync(process.execPath, ['--experimental-strip-types', fileURLToPath(new URL('./labs/audit.mjs', import.meta.url))], {
  stdio: 'inherit', windowsHide: true,
});
process.exitCode = result.status ?? 1;
