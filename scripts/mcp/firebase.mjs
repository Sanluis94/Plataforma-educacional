import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const cliPath = fileURLToPath(new URL('../../node_modules/firebase-tools/lib/bin/firebase.js', import.meta.url));
// --only still includes all core tools, including deploy/init. An explicit
// allowlist keeps this development integration limited to useful consultations.
const tools = [
  'firebase_get_environment', 'firebase_get_project', 'firebase_list_projects',
  'firebase_list_apps', 'firebase_get_sdk_config', 'firebase_get_security_rules',
  'firebase_validate_security_rules', 'firebase_read_resources',
  'auth_get_users', 'firestore_query_collection',
];

if (!existsSync(cliPath)) {
  console.error('Firebase CLI local ausente. Execute npm ci.');
  process.exitCode = 1;
} else {
  process.chdir(projectDirectory);
  process.argv = [process.execPath, cliPath, 'mcp', '--dir', projectDirectory, '--tools', tools.join(',')];
  // Run in this process so closing the stdio transport cannot orphan a child.
  await import(pathToFileURL(cliPath).href);
}
