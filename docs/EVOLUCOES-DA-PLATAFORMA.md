# Evoluções da plataforma

Esta versão conecta o caminho completo: entrar, escolher a turma, publicar uma atividade, entregar, receber uma devolutiva e acompanhar a aprendizagem. Os painéis da família e da coordenação consultam registros reais dentro dos vínculos autorizados.

## Primeiro uso

- **Professor:** entre pelo cartão Professor, crie a turma e compartilhe o código. Em **Atividades**, escolha uma resposta escrita ou questões, confira a prévia e publique. O rascunho fica neste navegador até a publicação ser confirmada.
- **Estudante:** entre pelo cartão Estudante e use o código fornecido pelo professor. A turma recém cadastrada fica selecionada. Abra **Atividades**, leia a instrução e envie a resposta. Entregas e devolutivas permanecem disponíveis após recarregar a página.
- **Família:** o professor escolhe o aluno e cadastra o e-mail do responsável em **Família e responsáveis**. O responsável abre **Portal da família**, entra com a conta Google do mesmo e-mail verificado e aceita o convite. O cadastro não envia e-mail automaticamente; o professor compartilha o endereço do portal. O convite pendente vale sete dias.
- **Coordenação:** o painel mostra as turmas vinculadas por um administrador e as turmas em que o coordenador também atua como docente. O perfil de coordenação sozinho não permite consultar todas as turmas. O administrador gerencia os vínculos no painel de coordenação.

## Entregas e devolutivas

Em **Corrigir entregas**, o professor seleciona a entrega e confere resposta, questões, reflexão e evidências disponíveis. A rubrica soma até 10 pontos. **Salvar rascunho** conserva o trabalho privado; **Publicar devolutiva** disponibiliza o parecer ao aluno e à família vinculada. O histórico publicado contém somente versões anteriormente publicadas. Um conflito entre sessões exige recarregar antes de salvar novamente.

O relatório da turma oferece ações para corrigir uma entrega, enviar uma orientação individual e planejar uma retomada. A orientação aparece nas atividades do aluno. As sugestões de estudo usam atividades atribuídas e respostas efetivamente registradas. **Continuar laboratório** retoma o último laboratório e conserva o vínculo com o plano da turma quando ele existe.

As dúvidas dos alunos são privadas. O professor pode conceder um bônus ao responder. O bônus é recebido uma única vez quando o aluno atualiza suas mensagens, sem expor seu documento privado de progresso ao professor.

## Boletim e acompanhamento

Os critérios são salvos por turma e período. Professor e aluno consultam os mesmos pesos, provas selecionadas, datas e explicação. Os pesos de cada modelo somam 100%. A nota individual de participação fica em um registro separado, acessível ao próprio aluno e à equipe autorizada.

O professor escolhe se um parecer publicado somente orienta ou substitui a pontuação da entrega no cálculo do boletim. A evidência original permanece registrada. O boletim identifica essa escolha; uma consulta sem resultados não inventa uma média.

O relatório permite filtrar datas, consultar o histórico e comparar tentativas da mesma atividade com questões compatíveis. Médias, amostras e evolução são descritas com seus limites; uma diferença de pontuação não é apresentada como prova de que uma intervenção causou a melhora.

## Certificados e comprovantes

O professor informa turma, estudante, título, carga horária autorizada, mínimo de 1 a 8 atividades e aproveitamento mínimo. A emissão verifica entregas concluídas com correção automática, questões registradas e pontuação compatível. Respostas escritas com parecer não entram nesse requisito automático. Repetições do mesmo laboratório ou atividade não aumentam o número de itens distintos.

A carga horária é definida pelo professor para o curso. Ela aparece separada do tempo de uso observado, que pode estar incompleto. O comprovante de prática de um nível não atribui carga horária nem certificação institucional.

Cada documento novo possui um código aleatório e uma consulta em `/verificar-certificado?codigo=...`. A consulta pública informa documento, emissor, requisitos e estado ativo ou revogado; não mostra nome, e-mail, matrícula, turma ou IDs das entregas. O professor pode revogar um certificado com motivo registrado. Documentos antigos guardados somente no navegador não ganham validação pública automaticamente.

## Permissões e desempenho

As regras do Firestore verificam professor responsável, matrícula, vínculo de coordenação e convite aceito pelo responsável. Alunos não recebem entregas, notas individuais ou pareceres privados de colegas. A revogação do vínculo familiar bloqueia novas consultas e mensagens.

Os roteiros completos dos laboratórios são carregados quando necessários. O catálogo inicial usa metadados menores, e as consultas de relatório reutilizam um retrato recente da turma. Todos os 582 laboratórios e seus conteúdos individuais foram preservados. As telas de professor e estudante foram verificadas em largura de 320 pixels.

## Validação e desenvolvimento

Os testes de interface usam perfis fictícios em um preview local. Os testes de Auth e Firestore usam exclusivamente `demo-kortex` nos emuladores de loopback. Eles exercitam os repositórios reais da aplicação, incluindo acessos permitidos e negados, publicação, matrícula, rascunho, parecer, boletim, família, coordenação e certificados.

Comandos principais:

```powershell
npm.cmd run test:local -- --maxWorkers=2 --testTimeout=20000
npm.cmd run emulators:check
npm.cmd run etl:emulator-check
npm.cmd run evolution:emulator-check
node scripts/labs/generate-learning-index.mjs --check
node scripts/labs/build-browser-preview.mjs
# Com o preview em http://127.0.0.1:5175:
node scripts/labs/platform-evolution-browser-check.mjs
node scripts/labs/certificate-browser-check.mjs
```

Os relatórios privados ficam em `.local/` e não são publicados. O `.env` é usado somente para compilar a configuração autorizada de produção e permanece fora do Git. A validação local não consulta nem altera registros reais de alunos. Login Google com uma conta real e uso cotidiano pela escola dependem das sessões dos usuários.

Resultado da validação desta implementação: **988 testes em 55 arquivos**, **43 verificações de fluxos e permissões no emulador**, **12 cenários de navegação e interface** e **10 verificações do fluxo de certificados** aprovados. A compilação TypeScript/Vite, o smoke de Auth/Firestore, os quatro cenários anteriores de captura de aprendizagem e a auditoria dos 582 laboratórios também passaram. Os arquivos novos da aplicação passaram no lint; os arquivos antigos ainda contêm dívida de lint preexistente. Os testes de emulador agora integram as verificações automáticas do GitHub.

O lint global possui dívida anterior documentada no projeto. Sua etapa informativa no GitHub não substitui testes, compilação e verificação dos fluxos. Consulte também [Desenvolvimento](DESENVOLVIMENTO.md) e [Pipeline de aprendizagem](PIPELINE-DE-APRENDIZAGEM.md).
