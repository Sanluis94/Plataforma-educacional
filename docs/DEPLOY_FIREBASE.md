# Deploy automático do Firebase Hosting

O ambiente público é [plataforma-educacional-73df6.web.app](https://plataforma-educacional-73df6.web.app). O job de publicação roda somente em push para `main` após os jobs obrigatórios de CI (inclusive os emuladores). PRs, `dev` e execuções manuais não publicam. O lint atual continua informativo. O workflow publica somente o Hosting: não altera Firestore, Auth, regras do banco, índices ou funções.

## Ativação inicial (GitHub e Google Cloud)

1. No GitHub, crie o ambiente `firebase-production`, restrito à branch `main`. Proteja a `main` com revisão de PR, incluindo alterações no workflow. Se for necessário aprovar cada deploy, habilite essa proteção no ambiente; isso introduz uma etapa manual. Mantenha `FIREBASE_HOSTING_AUTO_DEPLOY` desativada por enquanto.
2. Em Google Cloud, use uma conta de serviço dedicada ao Hosting em `plataforma-educacional-73df6`. Conceda `roles/firebasehosting.admin` e `roles/serviceusage.apiKeysViewer`, conforme o Firebase CLI. Não dê acesso a Auth ou Firestore e não gere uma chave JSON. Habilite as APIs exigidas por [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) e pela edição existente do Hosting.
3. Crie ou use um pool dedicado de Workload Identity Federation com um provedor OIDC para `https://token.actions.githubusercontent.com`. Mapeie `google.subject=assertion.sub` e restrinja a condição de atributos:
   ```text
   assertion.repository_owner_id == '105642177' &&
   assertion.repository_id == '1178931770' &&
   assertion.ref == 'refs/heads/main' &&
   assertion.event_name == 'push' &&
   assertion.environment == 'firebase-production' &&
   assertion.workflow_ref == 'Sanluis94/Plataforma-educacional/.github/workflows/ci.yml@refs/heads/main'
   ```
   Confira esses IDs contra a API do GitHub antes do cadastro, especialmente se o repositório tiver mudado de dono. Na conta de serviço, dê `roles/iam.workloadIdentityUser` somente ao principal do ambiente (`principal://iam.googleapis.com/projects/NUMERO_DO_PROJETO/locations/global/workloadIdentityPools/POOL_ID/subject/repo:Sanluis94/Plataforma-educacional:environment:firebase-production`), não ao pool inteiro. Veja também [a ação de autenticação do Google](https://github.com/google-github-actions/auth).
4. No ambiente `firebase-production` do GitHub, configure as **variables** `FIREBASE_WIF_PROVIDER` (nome completo `projects/.../locations/global/workloadIdentityPools/.../providers/...`) e `FIREBASE_DEPLOY_SERVICE_ACCOUNT` (e-mail da conta). Copie da configuração atual de produção apenas estes seis valores públicos do SDK web: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`. Opcional: `VITE_FIREBASE_MEASUREMENT_ID`. Não carregue o `.env` inteiro nem configure chaves Gemini.
5. Mantenha os valores atuais, quando aplicáveis, para `VITE_INSTALLATION_ID`, `VITE_INSTALLATION_NAME`, `VITE_INSTALLATION_MODE`, `VITE_PUBLIC_RELEASE_STAGE`, `VITE_DATA_CONTROLLER_NAME`, `VITE_DATA_CONTROLLER_DOCUMENT`, `VITE_PRIVACY_CONTACT_EMAIL` e `VITE_DISABLE_AI`. Defina explicitamente modo e etapa, mesmo quando forem `pilot`. Não use esta configuração para instalações separadas de escola ou casa.
6. Faça um build de produção com a configuração confirmada e confira o bundle (sem exportações privadas). Quando quiser ativar, defina a **repository variable** `FIREBASE_HOSTING_AUTO_DEPLOY` como `true`. Se for ativada antes da integração do workflow, o merge da pipeline para `main` já pode gerar a primeira publicação. Se for ativada depois, a primeira publicação será no próximo push validado para `main`. Somente esse CI pode publicar automaticamente.

## Conferência e rollback

O deploy é serializado e descarta revisões que não são mais a ponta da `main`. O artefato traz `release.json`; após publicar, o workflow consulta o endereço público e exige que o SHA corresponda ao que foi compilado. Valide também uma rota da SPA e confira o login com uma conta de teste autorizada, sem usar dados de alunos.

Se precisar interromper, desative a variável do repositório e confira no Actions se existe execução de produção já iniciada. Use o histórico de releases do Firebase Hosting para voltar à versão conhecida e corrija ou reverta o commit na `main` antes de reativar a publicação. Não rode o deploy do Firebase sem `--only hosting`; banco, autenticação e regras permanecem em processos separados.
