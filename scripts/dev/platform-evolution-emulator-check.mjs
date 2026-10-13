import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
assert.equal(process.env.GCLOUD_PROJECT,'demo-kortex');assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9099');assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');
const output=new URL('../../.local/platform-evolution/entry.mjs',import.meta.url);await mkdir(new URL('./',output),{recursive:true});
await build({entryPoints:[fileURLToPath(new URL('platform-evolution-emulator-entry.mjs',import.meta.url))],outfile:fileURLToPath(output),bundle:true,platform:'node',target:'node22',format:'esm',packages:'external',define:{'import.meta.env':JSON.stringify({DEV:true,VITE_USE_FIREBASE_EMULATORS:'true',VITE_FIREBASE_EMULATOR_HOST:'127.0.0.1',VITE_FIREBASE_AUTH_EMULATOR_PORT:'9099',VITE_FIREBASE_FIRESTORE_EMULATOR_PORT:'8080',VITE_DISABLE_AI:'true'})}});
await import(pathToFileURL(fileURLToPath(output)).href);
