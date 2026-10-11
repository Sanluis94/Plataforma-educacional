const requiredFirebaseFields = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/** Creates the child environment without changing the shell or loaded files. */
export function productionEnvironment(
  source: Record<string, string | undefined>,
  productionProject: unknown,
): Record<string, string | undefined> {
  if (typeof productionProject !== 'string' || !productionProject.trim() || productionProject.startsWith('demo-')) {
    throw new Error('Configure um projeto real no alias production de .firebaserc.');
  }
  const missing = requiredFirebaseFields.filter(field => !source[field]?.trim());
  if (missing.length) throw new Error(`Configuração Firebase de produção incompleta: ${missing.join(', ')}.`);
  const placeholders = requiredFirebaseFields.filter(field => /SUA_|SEU_|demo-kortex/i.test(source[field] || ''));
  if (placeholders.length) throw new Error(`Configuração Firebase fictícia: ${placeholders.join(', ')}.`);
  if (source.VITE_FIREBASE_PROJECT_ID?.trim() !== productionProject.trim()) {
    throw new Error('VITE_FIREBASE_PROJECT_ID não corresponde ao alias production de .firebaserc.');
  }

  const env = { ...source };
  for (const field of requiredFirebaseFields) env[field] = source[field]!.trim();
  env.NODE_ENV = 'production';
  env.VITE_USE_FIREBASE_EMULATORS = 'false';
  // An explicit empty value prevents Vite from recovering the private .env key.
  env.VITE_GEMINI_API_KEY = '';
  env.VITE_DISABLE_AI = source.VITE_DISABLE_AI === 'true' ? 'true' : 'false';
  return env;
}
