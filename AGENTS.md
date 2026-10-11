# Orientações do projeto

Esta pasta é a raiz do repositório React/TypeScript/Vite. O código fica em `src/modules/`; os testes, em `src/test/`. Consulte `docs/DESENVOLVIMENTO.md` para o ambiente local e as integrações.

- Instale a árvore fixada com `npm ci`; no PowerShell, use `npm.cmd` quando necessário. Use Node 22.12+ da linha 22 e JDK 21+ para emuladores.
- Use `npm run dev:local` para trabalhar com dados no navegador e IA externa desativada. Para Auth/Firestore, use `npm run emulators:start` e `npm run dev:emulator`; o projeto local é sempre `demo-kortex`.
- `npm run test:local` executa os testes sem serviços reais. `npm run emulators:check` verifica Auth/Firestore locais. Rode os testes pertinentes à mudança e `npm run build` para alterações que afetem a aplicação.
- O lint global tem falhas anteriores. Confira os arquivos alterados e reporte falhas existentes separadamente; não apresente o lint informativo do CI como aprovação.
- O Firebase real é `plataforma-educacional-73df6`, alias `production`. Mantenha alterações remotas e publicações dentro do escopo solicitado. Os scripts locais não devem voltar silenciosamente a esse projeto quando um emulador estiver indisponível.
- Preferência expressa do usuário: depois de cada conjunto de alterações validado, envie o código ao GitHub e publique a aplicação no Firebase Hosting de produção. Use o `.env` somente na compilação local, preserve arquivos privados fora do Git e confira o site publicado. Essa autorização permanece válida para as próximas alterações deste projeto; regras e dados do banco continuam exigindo escopo próprio.
- Não versione `.env*` (exceto `.env.example`), tokens, contas de serviço ou exportações reais. Use `.local/` para dados privados; `public/` é entregue ao navegador. Não imprima credenciais em diagnósticos.
- Os MCPs oficiais usam as sessões existentes de `gh` e Firebase CLI; valide-os com `npm run mcp:check`. Os launchers ficam em `scripts/mcp/`; não grave tokens na configuração Codex.
- Ao modificar laboratórios, confira o conteúdo e as questões de cada tópico envolvido. IDs e títulos distintos, por si só, não demonstram individualidade pedagógica.
