# Plataforma Educacional

## ETL Firebase/Firestore

Este branch inclui um ETL versionado para desenvolvimento e homologacao. A fonte principal e o Firebase/Firestore. Ele executa o ciclo completo:

1. Extrai dados das colecoes do Firestore: `users`, `classes`, `activities`, `progress` e `system_logs`.
2. Transforma usuarios, turmas, atividades, progresso e logs para os contratos da plataforma.
3. Gera colecoes normalizadas e metricas educacionais.
4. Expoe os dados por arquivos estaticos do Vite e, opcionalmente, por uma API HTTP local.

Configure uma credencial de service account fora do Git:

```bash
mkdir .local
# salve o JSON da service account em:
# .local/firebase-service-account.json
```

Variaveis esperadas:

```bash
ETL_SOURCE="firebase"
FIREBASE_PROJECT_ID="seu-projeto"
FIREBASE_SERVICE_ACCOUNT_PATH="./.local/firebase-service-account.json"
ETL_OUTPUT_DIR="./public/local-data/etl"
```

Executar o ETL usando Firebase:

```bash
npm run etl
```

Para validar o pipeline sem credenciais do Firebase, use o seed de exemplo:

```bash
npm run etl:seed
```

Tambem e possivel extrair de um arquivo/URL JSON, util para homologacao:

```bash
npm run etl -- --source ./caminho/para/dados.json
npm run etl -- --source https://exemplo.com/dados.json
```

Os artefatos gerados ficam em `public/local-data/etl/` e nao sao versionados. Durante o `npm run dev`, o frontend consome esses arquivos em `/local-data/etl/...` quando o Firebase do app nao esta configurado.

API auxiliar do ETL:

```bash
npm run etl:serve
```

Endpoints:

- `GET /health`
- `GET /snapshot`
- `GET /collections/users`
- `GET /collections/classes`
- `GET /collections/activities`
- `GET /collections/progress`
- `GET /collections/systemLogs`
- `GET /metrics/summary`
- `GET /metrics/teacher-performance`
- `GET /metrics/student-performance`
- `GET /metrics/subject-engagement`

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
