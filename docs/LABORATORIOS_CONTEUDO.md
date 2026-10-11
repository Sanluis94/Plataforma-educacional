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

## Organização por nível de aprendizado

`learningCatalog.ts` reúne os 510 itens master e os 72 modos da biblioteca inicial em um catálogo de 582 IDs únicos. `learningLevels.ts` define os níveis e normaliza os valores antigos dos perfis sem alterar remotamente matrículas ou turmas. A distribuição para navegação é:

| Nível | Atividades |
| --- | ---: |
| Fundamental I | 21 |
| Fundamental II | 85 |
| Ensino Médio | 134 |
| Graduação | 160 |
| Pós-Graduação | 170 |
| Formação Profissional — trilha complementar | 12 |

As 72 atividades iniciais recebem um nível recomendado de entrada, registrado individualmente em `legacyLabsCatalog.ts`. Essa classificação não é certificação curricular, matrícula nem bloqueio de acesso. O aluno começa pelo nível do perfil e pode mudar a seleção. O painel do estudante e o catálogo de simulações filtram primeiro por nível e depois por disciplina; busca global, links diretos, plano do professor e Studio usam a mesma classificação. Um link com ID resolve o nível desse laboratório mesmo se o parâmetro de nível vier conflitante.

Os motores de Física incorporados a uma atividade mantêm o ID fixo da atividade. O catálogo geral oferece os demais laboratórios. O certificado da sessão contabiliza somente atividades concluídas do nível selecionado, sem gerar carga horária fictícia.

## Verificação e conclusão do objetivo

```powershell
npm.cmd run labs:audit
npm.cmd run test:local -- src/test/labLearningContent.test.ts src/test/guidedLabActivity.test.tsx src/test/masterLabsCatalog.test.ts
```

`labs:audit` cruza o inventário completo com todos os pacotes, verifica campos, questões, cenários, repetições e o molde genérico antigo. Gera `.local/labs/content-audit.json` com cada ID pendente. Sai com código 1 enquanto faltar qualquer roteiro ou existir problema; sair com código 0 é uma condição necessária para concluir o objetivo. O verificador antigo `check_uniqueness.mjs` encaminha para essa auditoria, sem emitir aprovação baseada apenas em títulos únicos.

A validação estrutural não prova correção conceitual. Também é necessário revisar o conteúdo, testar a integração de todas as entradas na interface e conferir a navegação em navegador real. Os testes de conteúdo exigem os 582 IDs e validam todos os pacotes. O CI executa a auditoria global como etapa obrigatória antes dos testes e da compilação; conteúdo ausente, duplicado ou inválido impede a aprovação.

Para verificar a navegação real, compile e sirva o preview local identificado conforme os comandos abaixo, depois execute `npm.cmd run labs:browser-check` em outro terminal. O teste usa login local, abre cada ID, confere seu nível, os casos, a teoria e a avaliação. As evidências ficam em `.local/labs/browser/`. O Chromium do Playwright deve estar instalado. A cobertura é registrada em `result.json`. `-- --legacy-only` verifica apenas os modos da biblioteca inicial e grava `legacy-result.json`.

A conclusão exige 582/582 roteiros e verificação do conteúdo efetivamente exibido, incluindo os 72 modos legados. Execute `node scripts/labs/browser-check.mjs --require-complete` contra uma compilação local estável para exigir essa navegação integral. O Studio exige explicação, exemplo, roteiro, três cenários e duas questões com alternativas e feedback antes de adicionar uma atividade à sessão. `createStudioLab` verifica campos, repetições e gabarito; não preenche lacunas com frases genéricas e não altera o catálogo incorporado. Conteúdos do professor continuam exigindo revisão conceitual: validação estrutural não certifica a matéria. As atividades personalizadas duram apenas a sessão atual e são exibidas com seu próprio conteúdo.

Com o preview local abaixo ativo, `node scripts/labs/studio-browser-check.mjs` verifica o formulário vazio, a criação de atividades completas em três níveis, sua abertura e a pesquisa sem duplicações. Os testes de navegador bloqueiam requisições externas, inclusive fontes remotas, para manter a verificação isolada e reproduzível. `qa-build.json` identifica fontes e arquivos da compilação e fica somente no artefato local de teste.

Para uma conferência final sem recarregamentos durante edições, compile com as configurações locais e sirva o resultado:

```powershell
node scripts/labs/build-browser-preview.mjs
node scripts/dev/run.mjs local preview --host 127.0.0.1 --port 5175 --strictPort
```

Em outro terminal, execute `node scripts/labs/browser-check.mjs --require-complete --workers=3`, `node scripts/labs/learning-level-browser-check.mjs` e `node scripts/labs/studio-browser-check.mjs`. As três sessões da verificação integral são independentes. Ela exige cada um dos 582 IDs exatamente uma vez e confere nível, roteiro, reflexão, todos os casos e explicações, critérios de evidência, teoria, exemplo, links das fontes, questões e feedback. `result.json` registra IDs visitados, erros de runtime e hash SHA-256 dos conteúdos conferidos. A verificação de níveis percorre os filtros e os links; a do Studio confere o nível inicial do formulário. Mudanças posteriores exigem nova verificação dos conteúdos afetados.

A bancada de Filosofia usa os casos do tópico para construir posição, premissa, objeção e resposta. O registro indica exploração dos casos; as justificativas precisam de apreciação do professor e não geram um diagnóstico de personalidade. Nos esquemas de Biologia, ampliação gráfica não equivale à resolução óptica de organelas. Em Idiomas, o último cartão encerra o módulo e o resultado corresponde aos acertos; quando a síntese de voz está indisponível, o aluno pode continuar pela expressão escrita.

## Resultado da conferência de 10/10/2026

O clone local contém os 582 roteiros: 20 do Fundamental I, 60 do Fundamental II, 100 do Ensino Médio, 160 da graduação, 170 da pós-graduação e 72 da biblioteca inicial. São 1.746 cenários e 1.167 questões. A auditoria terminou sem pendências, IDs duplicados, trechos repetidos detectados ou erros de estrutura.

Os 741 testes passaram em 26 arquivos, assim como a checagem de TypeScript e a compilação local. A navegação real conferiu exatamente os 582 IDs, todos os casos, explicações, alternativas e feedback, sem erros de runtime. A criação e a pesquisa de uma atividade no Studio também passaram. O hash do conteúdo testado foi comparado com todos os JSONs atuais, confirmando que não houve mudança posterior à navegação.

As evidências locais estão em `.local/labs/content-audit.json`, `.local/labs/browser/result.json`, `.local/labs/browser/studio-result.json` e `.local/labs/final-verification.json`. Esses resultados correspondem à conferência inicial e precisam ser renovados após mudanças. O lint global continua com falhas anteriores; a comparação dos arquivos alterados daquela revisão não identificou novos erros de lint. A compilação ainda sinaliza o tamanho do pacote do catálogo. A revisão inicial `4d137a2` foi depois enviada ao GitHub e publicada no Firebase Hosting, com conferência dos arquivos e do login. A distribuição por nível acima inclui também as 72 atividades iniciais e, por isso, difere das contagens apenas do catálogo master.

Na revisão da organização por nível, passaram 836 testes em 32 arquivos, TypeScript, auditoria e compilação. A navegação dos filtros conferiu a partição dos 582 IDs tanto no painel do estudante quanto no catálogo de simulações, o nível inicial de seis perfis, busca global, links conflitantes, retorno aos quatro painéis e ID fixo na bancada de Física. O Studio criou, avaliou, exportou e reabriu sem duplicações atividades do Fundamental I, pós-graduação e formação profissional. Essas evidências estão em `learning-level-result.json` e `studio-result.json`, na mesma pasta local; `result.json` registra a conferência integral dos roteiros para a publicação. Os arquivos novos estão sem erros de lint e os alterados não acrescentaram erros; a dívida global permaneceu em 168 erros e 17 avisos nesta revisão.
