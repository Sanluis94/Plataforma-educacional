# Desenvolvimento local

O repositório é [Sanluis94/Plataforma-educacional](https://github.com/Sanluis94/Plataforma-educacional), com trabalho atual na branch `dev`. Neste computador, o GitHub CLI está autenticado como `Sanluis94`; confira com `gh auth status`. Essa autenticação fica no computador, fora do repositório.

O Firebase real é `plataforma-educacional-73df6`, identificado pelo alias `production`. O desenvolvimento com emuladores usa exclusivamente `demo-kortex`, sem recursos reais. Confira suas contas e projetos com `firebase login:list` e `firebase projects:list`.

## Preparar e iniciar

Use Node.js 22.12 ou superior da linha 22, npm e JDK 21 ou superior para os emuladores. Na pasta `plataforma-educacional`:

```powershell
npm.cmd ci
npm.cmd run dev:local
```

`dev:local` inicia o Vite com Firebase e IA real desativados, mesmo com credenciais em `.env` ou `.env.local`. Os dados locais ficam no navegador. Os scripts não alteram esses arquivos nem removem chaves salvas no navegador. O modo local desativa também o uso dessas chaves de IA.

Para desenvolver autenticação e persistência, mantenha dois terminais abertos:

```powershell
# Terminal 1: Auth em 127.0.0.1:9099 e Firestore em 127.0.0.1:8080
npm.cmd run emulators:start

# Terminal 2: aplicação ligada aos emuladores; IA real desativada
npm.cmd run dev:emulator
```

A interface dos emuladores fica em [127.0.0.1:4000](http://127.0.0.1:4000). `dev:emulator` exige os emuladores ativos; desligá-los interrompe o acesso ao banco e à autenticação. Os dados dos emuladores são temporários. Não use esse modo para build de produção. `emulators:start` e `emulators:check` fixam o projeto `demo-kortex`, independentemente do alias ativo do Firebase CLI. O primeiro uso pode baixar o emulador Java; os usos seguintes aproveitam o cache local.

No Windows, `npm.cmd` evita bloqueios do `npm.ps1` pela política do PowerShell. Em Linux/macOS, use `npm`. Argumentos adicionais chegam ao Vite/Vitest, por exemplo `npm.cmd run dev:local -- --port 5174`.

Configure `JAVA_HOME` para a pasta do JDK. O auxiliar de emuladores prioriza `JAVA_HOME/bin`, evitando o launcher `Oracle/javapath` do Windows, que pode deixar o Firestore Java aberto após encerrar o CLI. Se `JAVA_HOME` não estiver definido, o Java será procurado no `PATH` normal.

## Verificar mudanças

```powershell
npm.cmd run test:local
npm.cmd run test:local -- src/test/geminiService.test.ts
npm.cmd run emulators:check
npm.cmd run build
npm.cmd run lint
```

`test:local` executa a suíte sem configuração Firebase/Gemini real. `emulators:check` inicia os emuladores e testa uma sessão anônima de Auth, criação/leitura/atualização/exclusão de progresso no Firestore e recusa de leitura/escrita sem sessão. O teste usa o SDK cliente e as regras do repositório, recusa endpoints fora de `127.0.0.1:9099` e `127.0.0.1:8080`, e encerra os emuladores ao final. Não execute enquanto `emulators:start` ocupa as mesmas portas. Esse smoke verifica integração básica; não cobre todas as permissões de estudantes, professores e administradores. `build` conserva a configuração normal do projeto: revise o ambiente antes de publicar qualquer artefato gerado.

O workflow `.github/workflows/ci.yml` valida testes e build em pushes e pull requests para `dev`/`main`, sem precisar de secrets. As versões de [checkout](https://github.com/actions/checkout) e [setup-node](https://github.com/actions/setup-node) seguem os exemplos oficiais. O lint roda em job separado, informa suas falhas e não bloqueia essa primeira etapa: a análise inicial encontrou 182 erros e 17 avisos. O resultado é dívida técnica, não aprovação do lint. Depois de corrigir a base, remova o `continue-on-error` e torne o job obrigatório na proteção de branches.

## Dados e colaboração

Crie branches de trabalho a partir de `dev`, faça alterações pequenas e revise o diff antes de abrir pull request. A publicação de regras, índices e Hosting é uma operação separada; os comandos de desenvolvimento e CI não publicam no Firebase.

Arquivos `.env*`, `.local/`, contas de serviço e exportações privadas devem permanecer ignorados. Somente dados fictícios podem alimentar fixtures/seed versionados ou arquivos em `public/`; tudo nessa pasta pode chegar ao navegador. Exportações reais do Firestore devem usar um caminho privado em `.local/`, nunca `public/local-data/`. Para demonstrações, use a fonte seed de `npm.cmd run etl:seed`.

## MCPs no Codex

Os MCPs pertencem à configuração local do Codex, e os auxiliares de conexão ficam em `scripts/mcp/`. As credenciais ficam fora do Git. No Windows x64, depois de `npm.cmd ci`:

```powershell
npm.cmd run mcp:register
npm.cmd run mcp:check
```

O registro instala/verifica o executável oficial GitHub MCP `v2.0.2` com SHA-256 fixado e registra os dois servidores. Ele preserva um backup de `config.toml` na pasta pessoal do Codex e configura 120 segundos para inicialização. Não grava tokens na configuração. O registro depende deste caminho do projeto; execute-o novamente se mover a pasta.

O GitHub MCP reutiliza a sessão de `gh auth login`, obtendo o token somente na memória do processo. Disponibiliza ferramentas de repositórios, issues, pull requests e Actions, conforme os acessos dessa conta. O Firebase MCP usa o `firebase-tools` `15.33.0` do lockfile e a conta do Firebase CLI. A lista explícita contém dez ferramentas para consultar projeto, aplicativos, SDK, usuários e Firestore, ler documentação local e validar regras. Não expõe publicação, criação de projetos, alteração de usuários ou exclusão de documentos; `--only auth,firestore` sozinho também incluiria ferramentas core de escrita.

`mcp:check` inicia os servidores e verifica o protocolo, a listagem de ferramentas, o usuário GitHub, as branches de `Sanluis94/Plataforma-educacional` e o projeto Firebase ativo. Não consulta documentos nem dados de usuários. Depois da instalação/configuração, reinicie o Codex ou reconecte os servidores na tela de MCP para disponibilizar as ferramentas em uma nova sessão. Os servidores com transporte local podem aparecer com autenticação OAuth não suportada; a autenticação efetiva ocorre pelos CLIs já conectados.

Confira os servidores com `codex mcp list`. Antes de qualquer alteração no ambiente real, confirme o projeto selecionado; o alias `production` identifica `plataforma-educacional-73df6`.

## Estado da preparação

Os testes locais, build e smoke dos emuladores foram executados neste computador. O workflow está preparado no repositório local; será executado no GitHub depois que estas mudanças forem enviadas. A configuração não publica o site.

A instalação ainda apresenta dívida de dependências: `npm audit` encontrou 41 entradas (2 baixas, 14 moderadas, 24 altas e 1 crítica). A crítica já existia; dez entradas novas pertencem à árvore de desenvolvimento do Firebase CLI. Não foi aplicado `audit fix --force`, que sugere mudanças incompatíveis. Revise atualizações em trabalho separado e repita `npm audit` para obter o diagnóstico atual. O lint global também permanece pendente de correção.
