# Segurança técnica do produto

Revisão de 13/10/2026. Este documento registra o que foi conferido no código e na árvore de dependências. Não certifica conformidade jurídica, configurações de contas Google ou ausência de vulnerabilidades desconhecidas. Nenhum `.env`, chave privada, registro real de estudante ou certificado de conta de serviço foi aberto nesta revisão.

## Autenticação e registro de eventos

O acesso usa Google/Firebase Auth; o perfil existente no Firestore determina o papel da conta. O código impede que a leitura atrasada de outra sessão substitua o perfil atual. As regras do banco, e não o bloqueio visual das rotas, precisam continuar validando a autorização de cada operação. A orientação oficial do Firebase explica essa separação em [Security Rules](https://firebase.google.com/docs/firestore/security/get-started).

Os novos eventos de cadastro, login e logout registram mensagens fixas e o UID no campo de identidade. Email e nome deixam de ser repetidos na mensagem. Falhas de login registram apenas códigos conhecidos de autenticação/transporte; mensagens arbitrárias, stacks e objetos de erro não são enviados ao log nem impressos pelo contexto de autenticação. O repositório de logs também não imprime o conteúdo do evento quando a gravação falha. A falha do log continua sem bloquear a entrada ou saída da conta.

Essa minimização não apaga eventos antigos já armazenados e não torna o UID anônimo. Os demais eventos ainda podem conter títulos de atividades, nome de turma e nome docente em `professorService.ts`. Retenção e descarte de registros precisam de procedimento definido pelo responsável pelo tratamento, com autorização e execução administrativa próprias. As regras atuais permitem leitura de `system_logs` somente ao administrador e bloqueiam edição/exclusão por clientes.

`authLogPrivacy.test.tsx` verifica a gravação pelo repositório real com transporte fictício: cadastro, login, logout, login com perfil existente, códigos conhecidos e desconhecidos, falha de transporte e ausência de Firestore. Com `polishAuthContinuity.test.tsx` e `firebaseConfig.test.ts`, passaram 27 testes depois da instalação das dependências atualizadas. A regressão completa e a configuração do artefato publicado continuam a ser conferidas na validação final.

## Dados no navegador e computadores compartilhados

A sessão Firebase usa a persistência padrão do SDK: no navegador, pode continuar ativa depois de fechar a janela, até logout explícito. Isso está documentado em [Authentication State Persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence). A opção de sessão, quando necessária em computadores compartilhados, deve ser implementada e verificada sem confundir fechar uma aba com sair da conta.

Rascunhos de respostas, avaliações, anotações de bancada, código Python, pareceres docentes e entregas pendentes usam `localStorage` ou `sessionStorage`. A separação por UID/atividade protege a apresentação pela aplicação, mas não cifra o armazenamento nem impede leitura por scripts da mesma origem, extensões ou outra pessoa com acesso ao perfil do navegador. Logout não promete apagar todos os rascunhos. O hook geral de rascunhos rejeita JSON inválido e não restaura registros com mais de 30 dias; outros repositórios locais e filas têm ciclos próprios.

A chave opcional Gemini inserida pelo professor é guardada no navegador e removida ao sair ou trocar para uma conta diferente da proprietária. Isso não equivale a um cofre de segredos. Uma chave compartilhada de serviço não deve ser embutida no JavaScript por `VITE_GEMINI_API_KEY`; a mediação de uma chave institucional exige serviço servidor, limites de uso e autorização. As chamadas atuais de IA podem enviar texto de redação, perguntas e medições quando acionadas; a disponibilidade de uma chave não dispensa informar essa finalidade e os fornecedores.

O Service Worker armazena recursos de interface e ignora requisições Firestore/Google APIs. As entregas pendentes ficam em uma fila local separada, cujo envio confere a conta atual. A aplicação não habilita explicitamente persistência Firestore em IndexedDB. O Firebase alerta que caches persistentes podem conter informação sensível em dispositivos não confiáveis em [Access data offline](https://firebase.google.com/docs/firestore/manage-data/enable-offline).

## Publicação e arquivos privados

O Git ignora `.env`, `.env.*` (exceto o modelo), `.local/`, `dist/`, `.firebase/` e os nomes previstos de contas de serviço. O Hosting publica `dist`, exclui arquivos ocultos, `node_modules` e `local-data`. `public/` é conteúdo público: apresentações e roteiros PDF/HTML ali presentes são entregues ao visitante e devem ser tratados como materiais de divulgação, jamais como área de documentos privados.

A listagem dos arquivos rastreados não encontrou `.env` privado, conta de serviço ou arquivo de chave privada. Uma varredura limitada de 334 arquivos de texto rastreados não encontrou marcadores de chave privada, token GitHub ou chave Google real. O relatório só grava nomes de arquivos/tipos de indicação, sem valores. Isso não cobre histórico Git, texto em binários/PDF, arquivos privados não rastreados, logs antigos ou todo o artefato final; a publicação precisa continuar verificando os arquivos efetivamente enviados.

A configuração pública do Firebase inclui uma API key de identificação do projeto; ela não substitui autorização. O Firebase explica que essas chaves normalmente não são segredos e que o acesso a dados depende de regras/IAM em [API keys for Firebase](https://firebase.google.com/docs/projects/api-keys). As restrições da chave e o estado ativo das regras devem ser conferidos no projeto, sem expor credenciais de administração.

## Dependências e limites da auditoria

O comando `npm audit --omit=dev` na árvore inicial apontou 22 pacotes afetados: 1 crítico, 13 altos, 7 moderados e 1 baixo. Esse número é do grafo npm e não prova que 22 vulnerabilidades estejam executáveis no site. Bibliotecas de build podem aparecer nessa consulta por meio de dependências diretas como `@tailwindcss/vite`; o Firebase inclui variantes Node que não correspondem à exportação usada pelo navegador. `firebase-admin` é importado por scripts de ETL/emuladores, não pelo código de `src` da aplicação.

Foram instalados Firebase 12.19.0, Firebase Admin 13.10.0, React Router 7.18.4, Vite 7.3.7 e Vitest 4.1.11, mantendo os majors da aplicação. React/React DOM continuam em 19.2.4. O Admin 13.10.0 remove `node-forge` em favor da criptografia nativa, conforme a [release oficial](https://github.com/firebase/firebase-admin-node/releases/tag/v13.10.0). Essa remoção importa porque a vulnerabilidade de verificação RSA em `node-forge` 1.4.0 não tinha versão corrigida segundo o [aviso de segurança](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

O alerta crítico inicial de `websocket-driver` vinha do caminho Firebase → Realtime Database → `faye-websocket`. A versão instalada foi atualizada para 0.7.5; os avisos dos mantenedores descrevem [limites de mensagens comprimidas](https://github.com/advisories/GHSA-mp7j-qc5w-4988) e [corrupção por cabeçalhos de tamanho](https://github.com/advisories/GHSA-xv26-6w52-cph6). O site não importa Realtime Database, mas o pacote instalado também precisava de correção para usos locais/Node. A correção não foi substituída por mover o pacote para `devDependencies` e ocultar a contagem.

React Router inclui avisos relacionados a SSR/RSC e redirecionamento. O projeto usa `BrowserRouter`, sem serviço SSR, porém isso não autoriza manter uma versão vulnerável sem avaliar os caminhos aplicáveis. Vite também tinha avisos específicos do servidor de desenvolvimento Windows, como [bypass das restrições de arquivos](https://github.com/advisories/GHSA-fx2h-pf6j-xcff). Atualizações compatíveis e nova auditoria devem acompanhar testes de navegação, Firebase, emuladores e compilação.

Foi necessário um override restrito: `@firebase/firestore` usa `@grpc/grpc-js` 1.14.6 no lugar da faixa upstream `~1.9.0`. A versão antiga permanecia na distribuição Firebase atual. A versão 1.14.6 mantém o major 1 e inclui as correções de autenticação gRPC documentadas pelos mantenedores em [GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j). Essa é uma exceção à faixa upstream e exige a regressão de operações Node/emuladores. O front-end usa as exportações browser de Firebase, não um servidor gRPC próprio; isso não dispensa corrigir os scripts e a árvore instalada.

As atualizações transitivas incluíram `@fastify/busboy`, `form-data`, `nanoid`, `picomatch`, `postcss`, `protobufjs`, `source-map-js`, `brace-expansion`, `undici` e `flatted`. Esbuild 0.28.2 foi resolvido pela faixa declarada do Vite 7.3.7 (`^0.27.0 || ^0.28.0`), sem override. O lock permaneceu consistente com `npm ls`. A transformação TypeScript pelo binário esbuild instalado, o carregamento nativo de `re2` e a versão local Firebase CLI 15.33.0 foram conferidos. O npm 10.9.2 apresentou erro interno `edgesOut` na resolução; a etapa foi concluída com npm 11.21.0 temporário via `npx`, compatível com Node 22, sem trocar o npm global.

Resultado da auditoria após instalar a árvore:

| Consulta | Críticos | Altos | Moderados | Baixos | Total de pacotes afetados |
| --- | ---: | ---: | ---: | ---: | ---: |
| `npm audit --omit=dev` inicial | 1 | 13 | 7 | 1 | 22 |
| `npm audit --omit=dev` atualizado | 0 | 0 | 8 | 0 | 8 |
| `npm audit` atualizado, incluindo desenvolvimento | 0 | 7 | 11 | 0 | 18 |

Os oito alertas moderados na consulta sem desenvolvimento vêm de `uuid` antigo e sua propagação por `google-gax`, `gaxios`, `teeny-request`, `retry-request`, `@google-cloud/storage`, `@google-cloud/firestore` e Firebase Admin. A atualização exigiria alterar majors upstream; ela não foi forçada. Os sete alertas altos da consulta completa vêm de duas raízes: `basic-ftp` 5.3.1, com [correção apenas em 6.2.1](https://github.com/advisories/GHSA-c475-qrg2-pj4r), e `braces` 3.0.3, [sem versão corrigida disponível](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), propagados por dependências da CLI (`get-uri`, `pac-proxy-agent`, `proxy-agent`, `chokidar`, `firebase-tools`). A CLI 15.33.0 era a versão mais recente do major 15 disponível na revisão. Permanecem também alertas moderados da CLI em OpenTelemetry, `re2` e caminhos de `uuid`. Esses pacotes não são código entregue ao visitante, mas continuam exigindo acompanhamento; não usar FTP/proxies não confiáveis ou padrões arbitrários nas ferramentas não equivale a eliminar as falhas.

Os relatórios completos ficam em `.local/security-product-audit-installed-prod.json` e `.local/security-product-audit-installed-all.json`, fora do Git. A regressão completa, os emuladores e a conferência do artefato publicado continuam sendo responsabilidade da validação final desta revisão. Nenhum `--force`, downgrade do Firebase, migração major de aplicação ou provisionamento remoto foi usado nesta etapa. O resultado não é uma declaração de risco zero.

## Limites operacionais pendentes

Esta revisão não provisionou infraestrutura, não publicou novas regras e não leu contas ou dados reais. Identidade do controlador/operador, canal para direitos dos titulares, política de retenção, contrato com instituições, tratamento de dados de menores, transferências internacionais, respostas a incidentes e fornecedores precisam constar do preparo comercial com responsáveis definidos. Segurança técnica local e textos jurídicos não comprovam, por si só, que esses procedimentos existam na operação.
