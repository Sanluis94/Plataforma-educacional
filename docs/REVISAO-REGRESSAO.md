# Revisão de regressões — 11/10/2026

Revisão das integrações GitHub/Firebase, do conteúdo e da organização por níveis, comparando a versão publicada 298bb34 e o estado anterior f4a296c. Foram corrigidas falhas de integração e uma lacuna de persistência no fluxo ampliado do catálogo.

| Caso identificado | Comportamento após a correção |
| --- | --- |
| Voltar da bancada ao roteiro desmontava o simulador | Parâmetros, dados e estado são preservados; efeitos e animação ficam pausados enquanto a bancada está oculta. |
| Bancada avançada embutida não era renderizada | IDs como sup_fis_01 abrem o simulador recebido e comunicam sua conclusão na escala esperada. |
| Roteiro substituía a fundamentação original das bancadas avançadas | Equações e teoria original permanecem junto ao novo conteúdo. Física e parâmetros dos nove simuladores avançados foram preservados. |
| Nota 67 de uma bancada antiga chegava como 70 ao catálogo geral | A conversão entre as escalas mantém 67 como 6,7, sem arredondamento intermediário. |
| Catálogo geral registrava conclusão somente na sessão | Estudantes recebem progresso persistente. Roteiro, bancada e novas tentativas usam o mesmo ID e concedem a recompensa uma única vez. A leitura e a escrita remotas usam transação; erros aparecem na tela e permitem nova tentativa. A exploração livre não cria entregas para turmas sem vínculo explícito. |
| Repositório descartava o nível acadêmico da turma | gradeLevel e academicLevel chegam ao painel tanto no modo local como no Firestore. O catálogo do professor acompanha o nível da turma selecionada. |
| Motor adaptativo ignorava a chave de IA inserida pelo usuário | A chave é consultada em cada solicitação; troca, remoção e desativação limpam o cache associado. |

O modelo Gemini 1.5 Flash já era utilizado antes dessas mudanças e estava descontinuado. As chamadas de texto agora compartilham gemini-3.5-flash-lite, listado como modelo estável recomendado na [documentação oficial](https://ai.google.dev/gemini-api/docs/deprecations). A compilação pública continua sem a chave Gemini privada do projeto.

## Verificação

- 862 testes automatizados aprovados, incluindo concorrência, recompensa única, precisão de notas, falha remota e nova tentativa, chave de IA em tempo de execução, pausa da bancada e preservação das equações.
- TypeScript e compilação Vite aprovados. A auditoria de conteúdo encontrou 582 roteiros, 1.746 cenários e 1.167 questões, sem pendências.
- Os 582 laboratórios foram abertos e avaliados no navegador. Conteúdo, cenários, teoria, alternativas, feedback e identificação por nível foram verificados; nenhum erro de execução foi registrado.
- Partições completas nos dois catálogos, seis níveis, busca global, links de retorno dos quatro cargos e visualização móvel passaram. O Studio criou e reabriu atividades em Fundamental I, Pós-Graduação e Formação Profissional.
- 28 verificações adicionais no navegador: progresso após recarregar, ausência de recompensa duplicada, estado da bancada, catálogo do professor através do repositório real, simulado ENEM com TRI e reinício, abas dos painéis do estudante/professor/coordenação e painel administrativo. As abas passaram por testes de renderização e navegação; isso não significa validação exaustiva de todas as operações administrativas.
- MCPs GitHub e Firebase responderam a consultas de leitura e confirmaram o repositório e o projeto configurados.
- Nenhum novo erro de lint foi introduzido nos arquivos alterados. Arquivos novos passaram no lint. O lint global ainda tem 166 erros e 17 avisos de dívida anterior.

Os testes de navegador usam dados fictícios e bloqueiam chamadas externas e exportações em /local-data/. Testes de Firestore usam transações simuladas, incluindo falha e repetição; Google OAuth, escrita com contas reais e chamadas pagas de IA não foram exercitados. A publicação atualiza somente Hosting; regras e dados remotos não fazem parte da alteração.

## Pendências identificadas

O npm audit atual informa 41 pacotes com alertas: 2 baixos, 14 moderados, 24 altos e 1 crítico. Comparando com o lockfile anterior às integrações, dez pacotes com alertas entraram pela ferramenta Firebase de desenvolvimento: @google-cloud/pubsub, @opentelemetry/core, basic-ftp, braces, chokidar, firebase-tools, get-uri, pac-proxy-agent, proxy-agent, re2. Todos esses dez estão marcados como dependências de desenvolvimento e não são importados pela aplicação em src. O alerta crítico em websocket-driver já existia no lockfile de referência. Esta correção não alterou dependências.

firebase-tools 15.33.0 era a versão mais recente informada pelo registro npm nesta revisão. A correção automática proposta para parte da cadeia era uma regressão para firebase-tools 13.13.3; essa troca não foi aplicada porque mudaria a ferramenta que fornece o MCP atual. Os alertas permanecem como risco do ambiente de desenvolvimento e devem ser tratados em uma atualização específica, com validação do MCP, emuladores e publicação.

Também permanecem questões anteriores à reorganização: links do Layout que oferecem destinos incompatíveis com alguns cargos e o catálogo concentrado em um arquivo JavaScript de aproximadamente 3,7 MB (743 KB comprimidos). Esses pontos não foram apresentados como aprovados nem como novas regressões nesta revisão.

## Reproduzir

npm run test:local, npm run labs:audit e node scripts/labs/build-browser-preview.mjs. Sirva o preview em 127.0.0.1:5175 e execute node scripts/labs/browser-check.mjs --require-complete --workers=3, node scripts/labs/learning-level-browser-check.mjs, node scripts/labs/studio-browser-check.mjs e node scripts/labs/regression-browser-check.mjs. As evidências ficam em .local/labs/, fora do Git.
