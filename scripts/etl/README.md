# ETL educacional

O mesmo `buildClassLearningReport` transforma registros no navegador, no Firestore e neste processamento batch. A saída preserva os documentos e acrescenta relatórios por turma, métricas e diagnóstico de qualidade.

## Uso

```powershell
npm.cmd run etl
npm.cmd run etl -- --source caminho/arquivo.json
npm.cmd run etl:serve
```

A saída padrão fica em `.local/etl`, fora dos arquivos servidos pelo site. O processamento aceita JSON com coleções no nível superior ou dentro de `collections`. As coleções são `users`, `classes`, `activities`, `submissions`, `progress`, `student_progress` (compatibilidade), `system_logs`, `exams`, `exam_attempts` e `lesson_plans`. Os aliases `systemLogs`, `examAttempts` e `lessonPlans` também são aceitos.

`npm.cmd run etl:seed` publica exclusivamente o seed fictício versionado em `public/local-data/etl`, mediante `--public-seed`. Exportações de outra fonte não podem usar a saída pública. A API local lê a saída privada; para ler o seed público, execute `npm.cmd run etl:serve -- --public-seed`. Ela permanece em loopback, recusa origens externas e não permite cache dos registros.

A extração administrativa do Firestore é explícita: `npm.cmd run etl -- --source firebase`. Exige credenciais administrativas configuradas. Não altera documentos nem regras. As verificações automatizadas usam somente fixtures fictícias; não executam essa extração contra o projeto real.

## Fidelidade e leitura

- IDs, matrícula, nível acadêmico, conteúdo pedagógico, respostas e evidências são preservados. Perfis de coordenação são aceitos.
- O progresso canônico vem de `progress`; `student_progress` serve apenas de compatibilidade quando esse estudante não tem progresso canônico na fonte. Não se inferem XP, moedas ou conclusão a partir de notas.
- Submissões embutidas em atividades antigas e `learningEvents` são convertidos para o contrato de `submissions`, com identidade estável. Eventos diferentes permanecem no histórico; reenvios iguais não acrescentam conclusões.
- Datas são normalizadas pela mesma validação do relatório. Datas ausentes ou impossíveis não viram a data da extração. Nota ausente ou inválida permanece sem nota; zero verdadeiro é preservado. Estados desconhecidos não viram conclusão.
- Tempo exige medida registrada na evidência. Um número legado é preservado no documento de origem, sem ser apresentado como uma duração medida pelo sistema atual.
- Práticas pessoais, inclusive laboratórios livres e treino ENEM, permanecem nas coleções sem inventar uma turma. Elas não contaminam indicadores da turma; o compartilhamento explícito utiliza seu próprio vínculo.
- Respostas escritas entregues cumprem a entrega sem receber uma nota automática. A nota estimada do treino ENEM fica separada dos percentuais de acerto e não alimenta o boletim.
- A conclusão usa os trabalhos atribuídos e os estudantes matriculados de cada turma. Atividades em rascunho e vínculos incompatíveis não entram no denominador ou na média. Práticas complementares aparecem com essa distinção.
- O processamento não apaga recursivamente a pasta indicada. Só substitui seus JSONs, valida os diretórios e recusa caminhos fora da área ETL ou links. `index.json` é gravado por último e constitui o snapshot consumido pela API.

`index.json` reúne coleções e relatórios; `quality.json` registra exclusões, IDs repetidos e campos inválidos. `metrics/class-reports.json` contém os mesmos indicadores usados na tela do professor. Os diagnósticos de console exibem contagens, sem nomes, emails ou credenciais.

O boletim usa somente evidências avaliadas da turma. Notas são convertidas para 0–10; categorias sem evidência e chamadas ausentes ficam sem dados. Uma média final exige todas as categorias com peso. A participação depende de nota declarada pelo professor; frequência e acessos não substituem essa avaliação. No modelo semestral, P1 e P2 são provas explicitamente selecionadas, e o CSV corresponde ao modelo mostrado. Pesos, participação e o modelo semestral configurados na tela valem para a consulta/exportação atual; não são políticas institucionais gravadas no banco.
