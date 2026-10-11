import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => {
  const apps: { name: string; options: Record<string, unknown> }[] = [];
  return {
    apps,
    db: { kind: 'firestore' },
    auth: { kind: 'auth' },
    initializeApp: vi.fn((options: Record<string, unknown>, name: string) => {
      const app = { name, options };
      apps.push(app);
      return app;
    }),
    connectFirestoreEmulator: vi.fn(),
    connectAuthEmulator: vi.fn(),
  };
});

vi.mock('firebase/app', () => ({
  getApps: () => sdk.apps,
  initializeApp: sdk.initializeApp,
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: () => sdk.db,
  connectFirestoreEmulator: sdk.connectFirestoreEmulator,
}));
vi.mock('firebase/auth', () => ({
  getAuth: () => sdk.auth,
  connectAuthEmulator: sdk.connectAuthEmulator,
}));

function configureRealProject() {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-production-key');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-production.firebaseapp.com');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-production');
}

describe('Firebase configuration isolation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    sdk.apps.length = 0;
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);
    for (const key of [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_USE_FIREBASE_EMULATORS',
      'VITE_FIREBASE_EMULATOR_HOST',
      'VITE_FIREBASE_AUTH_EMULATOR_PORT',
      'VITE_FIREBASE_FIRESTORE_EMULATOR_PORT',
    ]) {
      vi.stubEnv(key, '');
    }
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('keeps the Firebase-free demo available without configuration', async () => {
    const config = await import('../modules/core/services/firebaseConfig');
    expect(config.app).toBeNull();
    expect(config.auth).toBeNull();
    expect(config.db).toBeNull();
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    expect(sdk.connectAuthEmulator).not.toHaveBeenCalled();
    expect(sdk.connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('uses only a demo project and both emulators even when real settings are present', async () => {
    configureRealProject();
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    const config = await import('../modules/core/services/firebaseConfig');

    expect(config.app?.name).toBe('kortex-emulator');
    expect(sdk.initializeApp).toHaveBeenCalledWith({
      apiKey: 'demo-kortex-api-key',
      authDomain: 'demo-kortex.firebaseapp.com',
      projectId: 'demo-kortex',
      appId: 'demo-kortex-app',
    }, 'kortex-emulator');
    expect(sdk.connectAuthEmulator).toHaveBeenCalledWith(sdk.auth, 'http://127.0.0.1:9099');
    expect(sdk.connectFirestoreEmulator).toHaveBeenCalledWith(sdk.db, '127.0.0.1', 8080);
  });

  it('starts emulator mode without real Firebase credentials', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    const config = await import('../modules/core/services/firebaseConfig');
    expect(config.app?.options.projectId).toBe('demo-kortex');
    expect(config.auth).not.toBeNull();
    expect(config.db).not.toBeNull();
  });

  it.each(['false', 'TRUE', '1'])('requires exact opt-in instead of %s', async flag => {
    configureRealProject();
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', flag);
    const config = await import('../modules/core/services/firebaseConfig');
    expect(config.app?.options.projectId).toBe('test-production');
    expect(sdk.connectAuthEmulator).not.toHaveBeenCalled();
    expect(sdk.connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('preserves production initialization with emulators disabled', async () => {
    configureRealProject();
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    const config = await import('../modules/core/services/firebaseConfig');
    expect(config.app?.name).toBe('[DEFAULT]');
    expect(config.app?.options.projectId).toBe('test-production');
    expect(sdk.connectAuthEmulator).not.toHaveBeenCalled();
    expect(sdk.connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('rejects emulator opt-in in production before initializing any real project', async () => {
    configureRealProject();
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    await expect(import('../modules/core/services/firebaseConfig')).rejects.toThrow(
      'Os emuladores Firebase só podem ser usados no servidor de desenvolvimento.'
    );
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    expect(sdk.connectAuthEmulator).not.toHaveBeenCalled();
    expect(sdk.connectFirestoreEmulator).not.toHaveBeenCalled();
  });

  it('reuses the isolated instance without reconnecting after module reload', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    const first = await import('../modules/core/services/firebaseConfig');
    vi.resetModules();
    const reloaded = await import('../modules/core/services/firebaseConfig');
    expect(reloaded.app).toBe(first.app);
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
    expect(sdk.connectAuthEmulator).toHaveBeenCalledTimes(1);
    expect(sdk.connectFirestoreEmulator).toHaveBeenCalledTimes(1);
  });

  it('uses explicitly configured emulator addresses', async () => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    vi.stubEnv('VITE_FIREBASE_EMULATOR_HOST', 'localhost');
    vi.stubEnv('VITE_FIREBASE_AUTH_EMULATOR_PORT', '9198');
    vi.stubEnv('VITE_FIREBASE_FIRESTORE_EMULATOR_PORT', '8180');
    await import('../modules/core/services/firebaseConfig');
    expect(sdk.connectAuthEmulator).toHaveBeenCalledWith(sdk.auth, 'http://localhost:9198');
    expect(sdk.connectFirestoreEmulator).toHaveBeenCalledWith(sdk.db, 'localhost', 8180);
  });

  it.each(['0', '65536', '9099.5', 'invalid'])('rejects invalid port %s before initializing', async port => {
    vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'true');
    vi.stubEnv('VITE_FIREBASE_AUTH_EMULATOR_PORT', port);
    await expect(import('../modules/core/services/firebaseConfig')).rejects.toThrow('Porta de emulador Firebase inválida');
    expect(sdk.initializeApp).not.toHaveBeenCalled();
  });
});
