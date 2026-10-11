# Continuidade entre telas — revisão de 11/10/2026

A revisão acompanhou os caminhos de estudante, professor, coordenação e administração, com atenção a pessoas que não conhecem termos técnicos. Foram corrigidas quebras de navegação e mensagens que não correspondiam ao comportamento da aplicação.

## Navegação e contexto

- Menus e busca exibem destinos permitidos para o perfil. A coordenação recebe seu próprio painel; professores não recebem atalhos para áreas sem acesso.
- Entrar por um link protegido preserva a página, os filtros e a atividade solicitados. Cancelar o acesso fecha o diálogo; entrar pela página inicial leva ao painel do perfil efetivamente autenticado.
- Abas, turma e filtros ficam na URL. O professor também mantém o bimestre e nível dos laboratórios. Atualizar a página e usar o histórico do navegador preservam esse contexto.
- As alterações de parâmetros são compostas antes de uma transição terminar, evitando que uma seleção rápida apague outra.
- Laboratórios e simulado recebem um retorno para a tela de origem. A atividade aberta no plano do estudante volta ao plano; o catálogo mantém disciplina e busca ao fechar uma atividade.
- O cabeçalho permanece disponível durante o carregamento das telas. Menu, página atual, busca e ações têm nomes acessíveis; há um atalho para chegar ao conteúdo.

## Resultados e linguagem

- Matrícula só anuncia sucesso quando a operação termina com sucesso. Códigos inexistentes são rejeitados também no ambiente local; erros preservam o código digitado.
- Relatórios do professor carregam ao abrir a aba. Atualizar consulta novamente, e respostas de uma turma anterior não sobrescrevem a turma atual.
- O treino ENEM explica suas 5 questões e 30 minutos antes de começar. A tentativa é guardada por conta nesta aba, com prazo absoluto; recarregar não reinicia o tempo. A entrega pede confirmação quando há questões em branco.
- A nota do treino é identificada como estimativa de um modelo próprio inspirado na TRI. O cálculo existente foi preservado; foram retiradas alegações de nota oficial, algoritmo oficial do INEP e previsão de ingresso pelo SiSU.
- Planos comerciais, portal familiar e painel demonstrativo da coordenação identificam dados e operações de exemplo. Prévia de CSV não anuncia matrícula efetiva; prévias de mensagens não anunciam envio ou contato realizado. Documentos da coordenação são modelos demonstrativos.
- Mensagens de erro não prometem que dados foram salvos sem verificar isso. Termos como “Hub”, “Command Palette” e “Analytics” foram substituídos nos principais caminhos por nomes de tarefas.

## Acessibilidade e telas pequenas

Os diálogos de acesso, busca, planos, família e confirmação de entrega possuem nome, Escape, limite de Tab e gestão de foco. Campos experimentais e respostas têm rótulos. Espaço e atalhos do laboratório respeitam controles focados e diálogos. O modo de reduzir distrações conserva as cores do tema; o alto contraste define também as cores de texto.

Foram conferidos os quatro perfis em larguras de 320 e 390 pixels. Os dois diálogos demonstrativos e uma bancada avançada foram conferidos em tela estreita. O contraste medido foi de 13,61:1 para o título no tema claro com redução de distrações e 21:1 para o título da bancada em alto contraste. Esses testes não representam uma certificação completa de acessibilidade.

## Validação

- 906 testes passaram em 42 arquivos, incluindo acesso, histórico, atualizações sucessivas de filtros, matrícula, relatórios, tentativa ENEM e teclado.
- TypeScript e compilação de produção local passaram.
- 19 jornadas no navegador passaram, incluindo os quatro perfis, acesso por link, cancelamento, retorno, recarga, código inválido, atualização de relatório e tentativa ENEM.
- 7 verificações adicionais de foco, diálogos, filtros, contraste e bancada estreita passaram.
- Os 582 IDs foram conferidos nos catálogos de estudante e de simulações, com os seis níveis, disciplinas, busca e retornos por perfil.
- 28 verificações de regressão passaram, incluindo persistência e recompensas do progresso, preservação da bancada e telas dos painéis.

Os testes de navegador usam exclusivamente contas e registros fictícios, bloqueiam serviços externos e exportações privadas e verificam a identidade da compilação servida. O conteúdo pedagógico e o modelo matemático dos laboratórios não foram alterados nesta revisão.

O lint de `src` ainda registra 156 erros e 16 avisos anteriores. A comparação com a revisão anterior não encontrou novos erros nos arquivos alterados; os novos arquivos também foram verificados. Permanece o aviso de tamanho do catálogo na compilação. As pendências de dependências estão descritas em [REVISAO-REGRESSAO.md](REVISAO-REGRESSAO.md).

## Limites

Esta validação automatizada não substitui observar pessoas reais usando a plataforma. O login Google completo, mensagens reais e escritas em contas de produção não foram exercitados. As áreas demonstrativas continuam precisando de integração de dados e operações para uso institucional; nesta revisão, seu estado foi tornado explícito. A publicação abrange o código no GitHub e o Firebase Hosting, sem alterações de regras ou dados do banco.
