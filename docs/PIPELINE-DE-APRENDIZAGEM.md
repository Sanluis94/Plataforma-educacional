# Dados de aprendizagem — captura, tratamento e leitura

A plataforma registra o trabalho do aluno e transforma as entregas em evidências para acompanhamento pedagógico. Os indicadores descrevem os registros recebidos; não são diagnósticos de capacidade, previsão de evasão ou notas oficiais da instituição.

## O que o aluno produz

Atividades da turma, avaliações, roteiros de laboratório e bancadas registram tentativas com identidade própria. Cada tentativa preserva a origem, aluno, turma quando aplicável, questões da versão utilizada, texto escolhido, resposta esperada, correção e explicação. Hipóteses, cenários consultados, conclusão escrita e parâmetros experimentais acompanham a entrega quando existem.

As unidades e os nomes experimentais vêm da configuração da bancada. Sem unidade conhecida, a interface informa essa ausência. A captura preserva uma fotografia do experimento; não apresenta essa fotografia como uma gravação integral da sessão.

O tempo mede uso em primeiro plano, com a janela focada, e interrompe a contagem depois de um minuto sem interação. Em listas, somente a atividade com que o aluno interagiu recebe a contagem; trocar de atividade ou tirá-la da tela pausa essa medida. Não representa carga horária curricular nem prova de aprendizagem. Ausência de medida permanece sem dados, e durações curtas são apresentadas em segundos.

Uma resposta escrita sem correção automática cumpre a entrega e fica disponível para leitura do professor. Ela não recebe nota zero nem recompensa de uma avaliação automática. Explorar uma bancada também não equivale a acertar suas questões.

O laboratório de uma aula usa um vínculo explícito com turma e plano, conferido contra a matrícula e o laboratório planejado. A prática livre fica no histórico do aluno. No treino ENEM, o compartilhamento com uma turma exige selecionar essa turma e clicar em compartilhar. Acertos percentuais e nota estimada do treino são campos distintos; a estimativa TRI não entra na média percentual nem no boletim.

## Envio e continuidade

Antes de enviar, a tentativa é guardada na fila do dispositivo. O mesmo identificador permite confirmar um reenvio sem criar outra entrega. Uma nova tentativa ganha outra identidade e permanece no histórico. As recompensas são transacionais e concedidas uma única vez por atividade, separadamente das tentativas.

A fila só remove um item após confirmação de gravação e, quando aplicável, recompensa. Falhas preservam o item e sua informação de erro. Reconectar envia somente os itens do perfil ativo. Uma resposta atrasada de outro perfil não pode trocar a conta ativa para enviar dados.

O indicador de internet distingue conexão, entrega pendente e modo local. Ter internet não prova que uma entrega chegou ao professor. Registros da fila antiga sem identidade confirmada são preservados e sinalizados para revisão; não se inventa um aluno ou turma para migrá-los.

Recarregar a atividade apresenta o trabalho anteriormente entregue. Se o professor editar uma questão, a entrega conserva o texto e a resposta da versão aplicada. Uma nova tentativa usa a versão atual. O aluno mantém os resultados do treino ENEM nesta aba e o histórico de entregas confirmadas.

## Transformação única

`src/modules/data/services/learningAnalytics.ts` aplica a mesma transformação aos dados locais, consultas Firestore e snapshots batch. Primeiro delimita os registros da turma; registros válidos de outras turmas não são apontados como erros desta turma.

- O denominador usa os alunos matriculados e trabalhos atribuídos: atividades publicadas da turma, avaliações abertas/encerradas já disponíveis e laboratórios do plano. Rascunhos e trabalhos futuros indisponíveis ficam fora.
- A conclusão conta uma entrega concluída por aluno e item. Reenvios iguais não acrescentam contagens; tentativas diferentes permanecem no histórico. Para indicadores, prevalece a última entrega concluída. Datas iguais usam o identificador como desempate estável, conservando todas as tentativas no histórico.
- A média usa notas válidas de 0 a 100, com a mesma escala para atividades e avaliações. Avaliações formais derivam o percentual dos pontos obtidos e máximos registrados na tentativa.
- Nota zero verdadeira é distinta de ausência de nota. Respostas escritas e explorações não recebem uma nota inferida. Falta de evidência não é chamada de desempenho ruim.
- O agrupamento usa identidade do trabalho, incluindo plano quando aplicável, e não somente seu título. A disciplina é declarada, sem inferência pelo texto do título.
- Vínculos incompatíveis, aluno fora da matrícula, estado desconhecido e datas inválidas ou mais de cinco minutos no futuro são excluídos dos indicadores e sinalizados. Alunos sem perfil disponível permanecem na matrícula; a entrega pode fornecer seu nome.
- Tempos ausentes não viram 15 minutos, e alunos sem entrega não recebem a data atual como última atividade.

O relatório mostra quantos registros foram recebidos, aceitos, repetidos ou excluídos, além da cobertura de notas e tempos. Uma falha de consulta não é transformada em relatório vazio ou parcial aparentemente bem sucedido.

## O que chega ao professor

O acompanhamento reúne cobertura de alunos, entregas versus esperadas, média com seu número de registros e tempo medido com sua cobertura. Cada aluno tem histórico consultável, data real e motivo explícito para acompanhamento. O critério de apoio usa média abaixo de 70% ou entrega com prazo encerrado; não atribui causalidade ou previsão de evasão. Alunos sem evidência recebem orientação para verificar acesso e entendimento da proposta.

Questões mostram respostas originais, correção, explicação e acerto entre as entregas consolidadas. Hipóteses distinguem previsão inicial de observação consultada. A consulta permite filtrar os alunos e seguir para as mensagens da mesma turma.

O resumo por critérios está disponível sem serviço externo. A geração com IA é opcional e recebe apenas números agregados, sem nomes, respostas, reflexões ou títulos das atividades. O resultado identifica sua origem e não substitui a leitura das evidências.

O CSV contém o histórico e alunos sem entregas, em colunas uniformes. Preserva ausência como célula vazia, escapa separadores/aspas/quebras e neutraliza fórmulas de planilha. O boletim usa somente notas reais da turma; categorias e frequência sem registros ficam sem dados. Os pesos configurados na consulta são identificados como modelo de análise, sem se apresentar como política institucional salva.

## Processamento batch e proteção dos arquivos

Consulte `scripts/etl/README.md`. A extração lê as coleções efetivamente produzidas pela aplicação, incluindo submissões, avaliações e planos, com progresso canônico e compatibilidade de progresso legado. Preserva práticas pessoais sem inventar uma turma e não infere XP ou moedas a partir de notas.

A saída padrão é privada, em `.local/etl`. Somente o seed fictício versionado pode usar `--public-seed`; exportações reais não entram no Hosting nem no Git. O processamento valida os caminhos, recusa links e não apaga recursivamente diretórios. O snapshot `index.json` é substituído por último, depois das demais saídas.

## Verificação e limites

As verificações usam registros fictícios, serviços externos bloqueados no navegador e o projeto isolado `demo-kortex` no emulador. Exercitam envio real, reenvio, recompensa, fila, troca de conta, duas turmas, prova ponderada, laboratório do plano, resposta escrita, ENEM compartilhado, recarga, leitura docente e CSV. A compilação servida é identificada por hashes de fontes e arquivos.

Comandos de verificação:

```powershell
npm.cmd run test:local -- --maxWorkers=2 --testTimeout=20000
npm.cmd run etl:emulator-check
node scripts/labs/build-browser-preview.mjs
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5175 --strictPort
node scripts/labs/learning-pipeline-browser-check.mjs
```

As evidências automatizadas ficam em `.local/labs/etl-tests.json`, `.local/labs/learning-pipeline-browser/result.json` e `.local/learning-emulator/result.json`. O lint tem dívida anterior; seus resultados devem distinguir novos problemas dos existentes.

Na revisão de 12/10/2026, passaram 984 testes em 53 arquivos, nove jornadas de ETL no navegador, 19 jornadas de navegação e 28 verificações de regressão. O envio real com Auth/Firestore emulados passou no projeto `demo-kortex`. Uma consulta somente de leitura confirmou que as regras Firestore de produção correspondem às regras exercitadas pelo emulador, sem ler registros de produção ou modificar regras. TypeScript e a compilação passaram. O lint registra 133 erros e 17 avisos anteriores; a comparação dos arquivos alterados não encontrou novos erros, e os arquivos novos foram conferidos separadamente.

O código consulta a turma do professor ou administrador autorizado e valida vínculos antes de agregar. A autorização no cliente não substitui as regras do servidor. Esta publicação não altera regras nem migra dados de produção. A validação não usa contas reais, não certifica acessibilidade completa e não transforma correções automáticas em avaliações oficiais. Respostas antigas sem textos ou tempo registrados conservam essa ausência.
