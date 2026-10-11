# Conteúdo individual dos laboratórios

O objetivo abrange todos os laboratórios incorporados ao site: 510 entradas do catálogo master e 72 entradas da biblioteca inicial. Os nove motores avançados são entradas do catálogo, não nove laboratórios adicionais. Nenhuma entrada deve ser retirada do inventário para fazer a cobertura parecer completa.

## O que cada laboratório deve oferecer

- Um problema contextualizado, ligado ao tópico e ao nível escolar.
- Explicação conceitual e exemplo resolvido com números, trechos ou situações próprios.
- Roteiro de investigação com etapas executáveis e critérios para justificar uma conclusão.
- Três ou mais cenários que permitam comparar condições e resultados, explicando as hipóteses do caso.
- Duas ou mais questões específicas, alternativas plausíveis e feedback para cada alternativa.
- Interação acessível por teclado, com identificação correta do laboratório e sem transferir respostas entre atividades.

Textos, perguntas ou parâmetros que apenas interpolam o título não comprovam individualidade. Um caso didático deve ser identificado como tal; não pode fingir medições, fontes históricas ou resultados de um modelo científico que não foi implementado.

## Fonte do conteúdo e apresentação

Os arquivos JSON em `src/modules/core/content/` contêm os roteiros autorados. Cada chave é um ID existente no inventário. `labLearningContent.ts` carrega os pacotes e recusa IDs duplicados. O contrato é `LabLearningContent`.

`resolveUniversalLab` liga o roteiro à entrada correspondente. Quando a entrada só possuía a antiga curva harmônica genérica, a bancada apresenta uma atividade guiada com casos próprios, previsão, comparação, teoria e avaliação. Ela não exibe os controles de uma equação sem relação com o tópico nem fabrica telemetria. `LabLearningWorkspace` oferece o roteiro e acesso à bancada existente nos modos da biblioteca inicial e nos motores avançados. As anotações do roteiro são preservadas ao alternar; reabrir a bancada reinicia sua execução. Um ID inexistente produz um erro explícito em vez de abrir o laboratório de oscilação forçada.

Na atividade guiada, as previsões e conclusões ficam na memória enquanto o laboratório está aberto; o aluno pode baixar suas anotações. A avaliação informa acertos e explicações. Esses casos não são um substituto para medições reais nem uma alegação de que todos os tópicos têm um solver próprio.

O navegador do catálogo permite percorrer todos os resultados. Os cartões incorporados não apresentam as antigas cargas horárias geradas como duração comprovada dos novos roteiros; atividades criadas no Studio identificam a estimativa informada pelo professor.

Os antigos geradores `generate_master_labs.mjs` e `enrich_master_labs.mjs` agora escrevem apenas rascunhos ignorados em `.local/catalog-preview/`, preservando o catálogo e os roteiros do app.

## Verificação e conclusão do objetivo

```powershell
npm.cmd run labs:audit
npm.cmd run test:local -- src/test/labLearningContent.test.ts src/test/guidedLabActivity.test.tsx src/test/masterLabsCatalog.test.ts
```

`labs:audit` cruza o inventário completo com todos os pacotes, verifica campos, questões, cenários, repetições e o molde genérico antigo. Gera `.local/labs/content-audit.json` com cada ID pendente. Sai com código 1 enquanto faltar qualquer roteiro ou existir problema; sair com código 0 é uma condição necessária para concluir o objetivo. O verificador antigo `check_uniqueness.mjs` encaminha para essa auditoria, sem emitir aprovação baseada apenas em títulos únicos.

A validação estrutural não prova correção conceitual. Também é necessário revisar o conteúdo, testar a integração de todas as entradas na interface e conferir a navegação em navegador real. Os testes de conteúdo exigem os 582 IDs e validam todos os pacotes. O CI executa a auditoria global como etapa obrigatória antes dos testes e da compilação; conteúdo ausente, duplicado ou inválido impede a aprovação.

Para verificar a navegação real das atividades já autoradas, inicie `npm.cmd run dev:local -- --host 127.0.0.1 --port 5175 --strictPort` em um terminal e execute `npm.cmd run labs:browser-check` em outro. O teste usa login local, pesquisa cada ID no catálogo e navega por área/disciplina na biblioteca inicial; abre os casos, confere teoria e responde a avaliação. As evidências ficam em `.local/labs/browser/`. O Chromium do Playwright deve estar instalado. A cobertura desse teste é registrada em `result.json`, sem implicar cobertura dos IDs ainda pendentes. `-- --legacy-only` verifica apenas os modos autorados da biblioteca inicial e grava `legacy-result.json`.

A conclusão exige 582/582 roteiros e verificação do conteúdo efetivamente exibido, incluindo os 72 modos legados. Execute `node scripts/labs/browser-check.mjs --require-complete` contra uma compilação local estável para exigir essa navegação integral. O Studio exige explicação, exemplo, roteiro, três cenários e duas questões com alternativas e feedback antes de adicionar uma atividade à sessão. `createStudioLab` verifica campos, repetições e gabarito; não preenche lacunas com frases genéricas e não altera o catálogo incorporado. Conteúdos do professor continuam exigindo revisão conceitual: validação estrutural não certifica a matéria. As atividades personalizadas duram apenas a sessão atual e são exibidas com seu próprio conteúdo.

Com o servidor local acima ativo, `node scripts/labs/studio-browser-check.mjs` verifica o formulário vazio, a criação de uma atividade completa, sua abertura e a pesquisa sem duplicações. Os testes de navegador bloqueiam requisições externas, inclusive fontes remotas, para manter a verificação isolada e reproduzível.

Para uma conferência final sem recarregamentos durante edições, compile com as configurações locais e sirva o resultado:

```powershell
npx.cmd tsc -b
node scripts/dev/run.mjs local build
node scripts/dev/run.mjs local preview --host 127.0.0.1 --port 5175 --strictPort
```

Em outro terminal, execute `node scripts/labs/browser-check.mjs --require-complete --workers=3` e `node scripts/labs/studio-browser-check.mjs`. As três sessões do navegador são independentes. A primeira verificação exige cada um dos 582 IDs exatamente uma vez e confere roteiro, reflexão, todos os casos e explicações, critérios de evidência, teoria, exemplo, links das fontes, questões e feedback. `result.json` registra IDs visitados, erros de runtime e hash SHA-256 dos conteúdos conferidos. Mudanças posteriores exigem nova verificação dos conteúdos afetados.

A bancada de Filosofia usa os casos do tópico para construir posição, premissa, objeção e resposta. O registro indica exploração dos casos; as justificativas precisam de apreciação do professor e não geram um diagnóstico de personalidade. Nos esquemas de Biologia, ampliação gráfica não equivale à resolução óptica de organelas. Em Idiomas, o último cartão encerra o módulo e o resultado corresponde aos acertos; quando a síntese de voz está indisponível, o aluno pode continuar pela expressão escrita.

## Resultado da conferência de 10/10/2026

O clone local contém os 582 roteiros: 20 do Fundamental I, 60 do Fundamental II, 100 do Ensino Médio, 160 da graduação, 170 da pós-graduação e 72 da biblioteca inicial. São 1.746 cenários e 1.167 questões. A auditoria terminou sem pendências, IDs duplicados, trechos repetidos detectados ou erros de estrutura.

Os 741 testes passaram em 26 arquivos, assim como a checagem de TypeScript e a compilação local. A navegação real conferiu exatamente os 582 IDs, todos os casos, explicações, alternativas e feedback, sem erros de runtime. A criação e a pesquisa de uma atividade no Studio também passaram. O hash do conteúdo testado foi comparado com todos os JSONs atuais, confirmando que não houve mudança posterior à navegação.

As evidências locais estão em `.local/labs/content-audit.json`, `.local/labs/browser/result.json`, `.local/labs/browser/studio-result.json` e `.local/labs/final-verification.json`. Esses resultados correspondem a esta conferência e precisam ser renovados após mudanças. O lint global continua com falhas anteriores; a comparação dos arquivos alterados não identificou novos erros de lint. A compilação ainda sinaliza o tamanho do pacote do catálogo. Estas alterações não foram publicadas no Firebase nem enviadas ao GitHub.
