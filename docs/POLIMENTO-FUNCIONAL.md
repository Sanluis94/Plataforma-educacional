# Polimento das mecânicas existentes

Objetivo: cada ação disponível precisa ter uma finalidade clara, produzir o resultado anunciado, conservar o contexto correto e apresentar falhas sem anunciar sucesso. Esta revisão não está concluída apenas porque a compilação passa: as operações abaixo precisam de evidência de execução e de regressão na versão final.

## Critérios de verificação

| Área | Comportamento exigido | Evidência necessária |
| --- | --- | --- |
| Entrada e perfis | Login respeita perfil real, retorno e cancelamento; logout não conserva dados de outra conta | Testes de navegação, quatro perfis e navegador |
| Turmas e códigos | Criar gera código utilizável; matrícula própria é idempotente; concorrência não duplica alunos | Repositório real no emulador e jornada docente/aluno |
| Publicação | Prévia corresponde à atividade salva; repetição não duplica publicação; falha mantém roteiro | Tests do publicador e Studio, emulador, navegador |
| Studio | Editor valida conteúdo, permite revisar e publica roteiro completo como atividade da turma | Questões e material conferidos no aluno após publicação |
| Entregas | Resposta escrita e quiz conservam evidência, têm confirmação real e retry com o mesmo identificador | Testes de drafts, captura, offline e interface |
| Provas da turma | Configuração válida, prazo absoluto, respostas recuperáveis e entrega confirmada | Sessão da prova, emulador e percurso de professor/aluno |
| Treino ENEM | Tentativa por conta, tempo após recarga, estimativa identificada e compartilhamento autorizado | Testes de sessão, cálculo e entrega, navegador |
| Planos de aula | Data, nível e laboratório correspondem ao plano; edição/exclusão remota não cai em sucesso local | Repositórios, professor e retorno do aluno |
| Geração por IA | Usa resultado real válido; ausência de chave, resposta inválida ou falha conserva formulário | Testes de geração e mensagens de erro |
| Boletim | Aluno e professor consultam os mesmos critérios; ausência não vira zero; parecer respeita escolha | Testes de notas, períodos, privacidade e interface |
| Pareceres | Rascunho privado, versões publicadas e conflito de sessão; texto chega ao aluno autorizado | Emulador e jornada de correção |
| Frequência | Atualização da chamada não cria duplicata; falta justificada não vira presença automaticamente | Testes de cálculo, edição e repositório real |
| Fórum | Autor real, textos mantidos em erro, respostas concorrentes conservadas e moderação real | Testes de repositório, UI e emulador |
| Materiais | ID estável, limites de anexo compatíveis, exclusão efetiva e cópia confirmada | Testes de persistência e navegador |
| Dúvidas privadas | Somente aluno/equipe leem; resposta e bônus têm efeito uma vez | Repositórios e emulador |
| Família | Convite para email verificado, expiração, aceite, mensagens, revogação e novo convite legítimo | Emulador e portal no navegador |
| Coordenação | Apenas turmas autorizadas; atualização força consulta; exportação usa relatório real | Emulador, CSV e navegador |
| Administração | Falha de consulta não exibe dados locais como dados reais; atualização e contagens corretas | Testes de falha e tela administrativa |
| Certificados | Evidências distintas, requisitos reais, consulta mínima pública e revogação | Serviço, emulador e emissão/consulta no navegador |
| Experiência e moedas | Recompensa única, saldo e item salvos juntos, compras concorrentes e falhas | Testes de transação e emulador |
| Personalização | Itens comprados produzem o efeito descrito e permanecem após recarga | Navegador com dados fictícios |
| Conquistas | IDs reais dos laboratórios desbloqueiam a medalha correspondente | Testes de conquistas e catálogo |
| Catálogo e roteiros | 582 conteúdos preservados; filtros e abertura usam ID, nível e disciplina corretos | Auditoria de conteúdo, testes e catálogos no navegador |
| Bancadas | Controles alteram o modelo, pausas conservam estado e parâmetros ficam dentro das faixas | Testes dos simuladores e bancada real no navegador |
| Avaliação da bancada | Questões visíveis, nota baseada em respostas, confirmação somente após gravação e retry | Testes de avaliação e modo com tempo |
| Telemetria e CSV | Tempo relativo medido por amostra; colunas estáveis, sem valores ou resultados inventados | Testes de amostragem e exportação |
| Replay e comparação | Replay usa estados capturados; comparação conserva cenário A e aplica B | Testes de estados e controles |
| Visualização 3D | Interação funciona, usa medição atual e explicita que é ilustrativa | Testes de controles, retorno à bancada e tela |
| Caderno e drafts | Separados por conta e atividade; falha de storage/cópia é visível | Testes de privacidade, recarga e erro |
| Python | Código editado executa de verdade, usa amostras reais, mostra erro e pode ser interrompido | Testes do worker e execução real de Pyodide no navegador |
| Tutor | Perguntas locais identificadas; IA usa serviço real; fechar encerra áudio/microfone/solicitação | Testes de falha, voz e interface |
| Redação e exercícios antigos | Orientação de prática não promete correção oficial nem análise de IA quando local | Fonte atual, testes dos modos e interface |
| Listas e exportações | Lista CSV valida entradas; não anuncia criação de contas; relatório consulta dados reais | Parser, erros e download no navegador |
| Planos ilustrativos | Comparação responde aos controles, sem ação fictícia de contratação ou cobrança | Interface e teste do modal |
| Acessibilidade e telas pequenas | Teclado, foco, rótulos, contraste, feedback e ausência de transbordamento | Testes e telas de 320/390 pixels |
| Publicação | Código validado no GitHub, produção corresponde ao artefato e regras testadas | CI, hashes do Hosting e regras ativas |

## Mudanças desta revisão

Falhas remotas de provas, planos, frequência, fórum e materiais deixam de retornar sucesso local. Materiais mantêm o ID retornado e desaparecem após exclusão. Respostas de fórum usam transações e repetem somente quando uma alteração concorrente foi comprovada. Criação de código e matrícula repetida também tratam concorrência.

O Studio usa o editor real de roteiros e publica explicação, cenários e questões pelo fluxo existente de atividades. A geração com Gemini rejeita conteúdo incompleto; não substitui a resposta por uma questão pronta. A chamada da turma pode ser revista sem duplicar o registro da aula.

Compras consultam o saldo persistido e gravam débito e propriedade juntos. Avatar, moldura, medalha e destaque têm efeitos visíveis no perfil. Conquistas reconhecem IDs atuais. Respostas, anotações e tentativas pendentes ficam isoladas por conta; a prova conserva prazo absoluto ao retomar.

A bancada aguarda a entrega, usa acertos reais, conserva evidência para retry e restaura estados verdadeiros no replay. Relatórios não inventam nota, duração ou assinatura. Python executa o texto do editor em um worker com a distribuição oficial [Pyodide](https://pyodide.org/en/stable/usage/webworker.html), carregada sob demanda; interromper encerra o worker. A análise padrão usa as amostras e instantes registrados, sem preencher a lista vazia com valores de exemplo.

O tutor identifica perguntas locais e respostas Gemini, conserva a mensagem em erro e encerra o reconhecimento de voz. Exportar uma turma usa o relatório real. Conferir uma lista CSV é uma preparação de matrícula: cada estudante precisa entrar com sua própria conta e usar o código; não é uma importação de contas no Firebase Auth.

Os encerramentos das bancadas antigas registram exploração após a prática. A ação aguarda o retorno do fluxo de entrega, conserva a tela em erro e permite tentar novamente. Esse registro não atribui nota de aprendizagem nem recompensa em XP ou moedas; a avaliação do roteiro continua sendo o caminho para concluir a atividade. Explicações fixas de matemática, química, geografia, história, português e microscopia são identificadas como observações do modelo ou orientações locais. A redação informa se a análise veio de critérios locais ou do Gemini.

Uma nova tentativa de atividade conserva respostas e conclusões ao recarregar e não volta à nota anterior durante a atualização da fila. Caderno e código Python ficam separados por conta, laboratório, turma e aula. A prova informa o prazo e impede novas respostas depois dele; tentativas pendentes conservam a evidência para consulta e reenvio. Provas novas usam prazo absoluto também nas regras, com dois minutos para transporte. Registros antigos sem `deadlineAtMillis` mantêm a verificação do prazo na interface até serem salvos novamente pelo professor.

O material de estudo conserva o texto simples, incluindo desigualdades como `x < 4 e y > 2`. Conteúdo HTML antigo apresenta os parágrafos e caracteres legíveis sem inserir HTML executável. A jornada do Studio confere o mesmo texto publicado na tela do aluno.

O Python apresenta falha ao iniciar o worker, mantém o código para uma nova tentativa e ignora resultados que chegam após uma interrupção. O tutor reaproveita a mensagem pendente ao tentar novamente e descarta transcrições de um microfone já cancelado. A política de permissões do Hosting permite solicitar microfone apenas na própria origem; o uso continua dependendo do clique do estudante, da disponibilidade da API de voz e da permissão concedida no navegador. Câmera e geolocalização continuam bloqueadas.

## Estado da auditoria

Verificação da versão de 13/10/2026, com dados fictícios e sem ler exportações de estudantes reais:

| Evidência | Resultado | Cobertura |
| --- | --- | --- |
| `test:local --maxWorkers=2` | 1.151 testes em 71 arquivos, sem falhas; ajuste final do material com 34 testes específicos aprovados | Repositórios, captura, notas, drafts, sessões, avaliação, compras, IA válida/inválida e continuidade |
| `labs:audit` e índice leve | 582 conteúdos próprios; zero pendências | Conteúdo, IDs, roteiros e índices preservados |
| `browser-check --require-complete --workers=3` | 582 laboratórios percorridos | Todos os cenários, teoria, fontes, questões e correção pelo navegador |
| `polish-bench-browser-check` | 72 bancadas | Abertura, retorno ao roteiro e largura de 320px em todas as bancadas antigas |
| Navegação e níveis | 20 jornadas e 7 verificações | Quatro perfis, seis níveis, contexto e menus em 320/390px |
| Evolução, certificados e pipeline | 12, 10 e 9 jornadas | Publicação, entrega, parecer, boletim, família, coordenação, certificados, tentativas e reconexão |
| Polimento e Studio/provas | 21 e 7 verificações | Chamada revisada, anexos, cópia falha/retry, CSV real, loja, Python real, tutor local, caderno e prazos |
| Acessibilidade | 8 verificações | Teclado, foco, temas, contraste medido, alto contraste e controles dos planos ilustrativos |
| `evolution:emulator-check` | 66 verificações | Permissões e transações reais, conflitos de versão, planos remotos, prazo, convites expirados/não verificados e remoção de matrícula |
| Integrações | GitHub e Firebase conectados | Google habilitado; domínios Hosting/Auth autorizados; sintaxe das regras aprovada pelo compilador remoto |

Os relatórios completos são privados em `.local/`. O lint dos arquivos novos passou; permanecem erros e avisos anteriores em arquivos antigos, registrados separadamente. O build passou com o aviso já conhecido de tamanho do módulo de simulação, carregado quando solicitado.

A publicação exige o CI do mesmo código e a comparação de todos os arquivos do Hosting com o snapshot compilado, além da conferência das regras ativas. O artefato `release.json` identifica a revisão publicada e o hash dos 582 conteúdos.

Limites externos conferidos: o OAuth Google depende da sessão interativa do usuário; a configuração do projeto e a interface pública são verificadas sem entrar em uma conta real. Gemini requer uma chave válida e disponibilidade do serviço; respostas, falhas e cancelamento são testados sem chamadas pagas. Python executou de verdade no navegador com a distribuição oficial; o primeiro carregamento depende de conexão. Voz depende da API do navegador e da permissão do usuário; ausência, recusa e encerramento têm tratamento explícito.
