# Produto educacional: adequação brasileira e entrada em operação

Revisão técnica e documental em **13/10/2026**. Abrange o código deste repositório e as fontes oficiais abaixo; não abrange contratos assinados, pessoas cadastradas, todos os dados de produção, infraestrutura de terceiros ou uma avaliação jurídica integral.

**Resultado: ainda não é possível declarar o produto integralmente conforme ou liberado para uso comercial com menores.** As correções desta entrega reduzem riscos identificados e preparam a implantação, mas os itens pendentes precisam de implementação, evidências operacionais e análise jurídica do contexto. O rótulo “piloto” não isenta um tratamento real de dados das obrigações legais.

## O que foi decidido e preparado

- Uma instalação e um projeto Firebase próprio para **cada escola**; outro projeto e instalação para **uso doméstico**. Não compartilhar banco, autenticação, origem, credenciais administrativas ou restaurações entre esses ambientes. Não basta acrescentar `schoolId` no navegador.
- Frontend em contêiner utilizável em provedores diferentes; o backend desta versão continua Firebase/Google. Hospedar o frontend na AWS/Azure não transfere o banco para esses provedores. Consulte [implantação e isolamento](NUVEM-ISOLAMENTO.md).
- Responsável, documento público e e-mail ficam vazios no piloto, como solicitado. A configuração está pronta para inclusão. O nome do responsável e um canal válido são obrigatórios para a etapa comercial; a existência de CNPJ, a identificação do fornecedor e o enquadramento empresarial precisam ser definidos antes da oferta.
- Rotas públicas `/privacidade`, `/termos` e `/seguranca`, acessíveis antes do login e pelo rodapé. Explicam o funcionamento atual e as lacunas; não apresentam um aceite genérico como consentimento válido.
- Bloqueio do acesso a perfis locais de desenvolvimento em um build publicado com Firebase ausente. Registros de autenticação deixam de repetir nomes/e-mails em mensagens de log.
- Correção de frequência: chamada completa acessível apenas à equipe autorizada, com leitura individual para o estudante. Documentos antigos exigem republicação pelo professor para gerar a projeção individual; não há migração remota automática.
- Compilações de nuvem desativam IA externa e removem a chave Gemini. IA comercial exige projeto próprio de backend, proteção de credenciais, contratos e avaliação de riscos antes de habilitação.

## Matriz de exigências e pendências

| Tema | Evidência no produto / ação necessária | Situação |
|---|---|---|
| LGPD: transparência e responsabilidade | Informações públicas adicionadas. Preencher responsável/canal, contratos escola–fornecedor, bases legais por finalidade e papéis de controlador/operador. | Parcial; impede operação comercial enquanto indefinido |
| LGPD: direitos e conservação | Não existe exportação integral ou exclusão consistente de todas as referências. Definir atendimento com protocolo, identidade proporcional, inventário de dados, prazos, exceções de conservação, exclusão de backups e registro de execução. | Pendente |
| Dados de menores | Seleção de nível escolar não comprova idade; convite familiar não prova representação legal. Documentar melhor interesse, acesso por idade/contexto e participação do responsável; implementar os controles definidos. | Pendente |
| ECA Digital: proteção e supervisão | Portal familiar oferece consulta, mas faltam limites de tempo/interações e controles parentais completos. Não tratar “Sou responsável” como verificação suficiente. | Pendente antes da expansão com menores |
| ECA Digital: denúncia e moderação | Rota de orientação e contato configurável preparadas; canal está vazio. Criar protocolo acompanhado, equipe, remoção, preservação adequada e encaminhamento de violações quando aplicável. | Pendente |
| Segurança e mínimo acesso | Autenticação/regras por vínculo existentes; frequência e logs corrigidos. Revisar acessos administrativos, restrição de cadastro institucional, proteção contra abuso, monitoramento e incidentes por instalação. | Parcial |
| Hospedagem e transferências | Configuração e documentação para instalações dedicadas. Avaliar região efetiva de cada serviço, contratos, suboperadores, acesso remoto e mecanismo de transferência internacional. Região brasileira do frontend não resolve todos os fluxos. | Pendente operacional/contratual |
| Acessibilidade | Há teclado, foco de diálogos, tema e ferramentas de acessibilidade. Verificações anteriores não equivalem a auditoria completa WCAG. Avaliar todos os fluxos com leitor de tela, teclado e alternativas às simulações visuais. | Parcial |
| Oferta, cobrança e suporte | Planos continuam identificados como demonstração e moedas são virtuais. Antes de vender: identificar fornecedor, preço, contratação, cancelamento, suporte, condições de disponibilidade e reembolso aplicáveis. | Pendente comercial |
| Conteúdo, imagem e certificados | Inventariar licenças dos materiais e autorizações de imagens. Certificado registra atividade; não anunciar reconhecimento MEC ou formação oficial sem fundamento. Projeção pública atual omite nome/UID do aluno, mas conserva metadados de atividade. | Revisão documental pendente |
| Continuidade de serviço | Definir responsáveis, orçamento, SLA/SLO, alertas, política de backup, RPO/RTO, restauração testada e encerramento de contrato com devolução de dados. | Pendente antes da contratação |

Referência para transparência, direitos, menores e segurança: [LGPD, arts. 6º, 9º, 14, 18–20, 37 e 46–48](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm). As bases legais para crianças e adolescentes precisam ser avaliadas por finalidade; consentimento não é a única possibilidade, e o melhor interesse deve prevalecer. [Enunciado ANPD nº 1/2023](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes).

O [ECA Digital, Lei 15.211/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm), está vigente desde **17/03/2026** e deve integrar esta avaliação, incluindo segurança por padrão, informações para famílias, supervisão e denúncias. O [Decreto 12.880/2026](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d12880.htm) exige avaliação proporcional dos mecanismos de idade. Não há conclusão nesta revisão de que o aplicativo se enquadre em dispensa específica; ser educacional não permite assumir dispensa geral. Não coletar biometria/documentos indiscriminadamente para tentar resolver idade.

Para acessibilidade, considerar a [Lei Brasileira de Inclusão, art. 63](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm), usando [WCAG 2.2](https://www.w3.org/TR/WCAG22/) como referência técnica de avaliação. Para relações de consumo, avaliar o [CDC](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm), inclusive informação e contratação fora do estabelecimento; termos não podem eliminar direitos legais.

## Checklist de liberação por instalação

1. Identificar responsável real, canal de titulares/denúncias e responsável por incidentes; publicar informações completas e adequadas à escola ou uso doméstico.
2. Aprovar inventário de dados/finalidades, contratos e bases legais; avaliar melhor interesse e relatório de impacto para recursos de maior risco, incluindo IA e recomendações. Separar comunicação necessária de consentimentos opcionais.
3. Concluir fluxo de menores, supervisão, moderação e atendimento a direitos. Registrar o pedido, prazo aplicável, resultado, justificativa de eventual conservação e possibilidade de revisão.
4. Rever localização de Auth/Firestore/backup/telemetria/IA/CDN, acordos de tratamento e transferências. Avaliar [Resolução ANPD 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024); quando aplicável, adotar o mecanismo contratual válido, sem presumir que um contrato genérico estrangeiro basta.
5. Testar contêiner no provedor escolhido, TLS, domínio autorizado do Auth, regras/indexes, acessos e restauração com dados fictícios. Verificar separação escola A/escola B/doméstico e recusa de imagem destinada a outra instalação.
6. Definir registros operacionais de acesso e sigilo. Avaliar a obrigação de **seis meses** do [Marco Civil, art. 15](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm), conforme enquadramento do provedor. `system_logs` gerado pelo navegador não substitui registros confiáveis de acesso no servidor/edge. Não aplicar seis meses indiscriminadamente a todo dado pedagógico.
7. Formalizar resposta a incidentes, classificação de risco, preservação de evidências e comunicação. A [ANPD informa prazo de três dias úteis para comunicação de incidentes aplicáveis](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis), ressalvados os regimes e hipóteses pertinentes; avaliar o regulamento e eventual enquadramento de pequeno porte antes de definir o procedimento.
8. Concluir avaliação de acessibilidade e conteúdo/licenças; testar oferta/suporte/cancelamento antes de ativar cobrança.
9. Registrar evidências e referência da aprovação de liberação. Marcar declarações no manifesto não comprova o cumprimento: elas devem apontar para documentação e testes reais. A validação técnica do manifesto não é um certificado jurídico.

## Próximas evoluções de produto

O fluxo institucional deve incluir provisionamento administrativo de equipe e matrícula supervisionada. O doméstico precisa de onboarding próprio por faixa/contexto e participação familiar quando aplicável; não basta apresentar a mesma seleção aberta de professor/coordenação. Implementar serviço confiável de direitos de titulares, retenção/expurgo e supervisão antes de expandir o tratamento real de menores. Um backend portátil de autenticação e persistência seria outra etapa: esta entrega torna o frontend portátil, mantendo Firebase como dependência explícita.

As análises específicas de dados e dependências ficam em [auditoria de dados](AUDITORIA-DADOS-PRODUTO.md) e [segurança técnica](SEGURANCA-PRODUTO.md). ISO 27001/27701, OWASP ASVS e padrões de segurança são referências de engenharia e requisitos possíveis de clientes, não certificações que o aplicativo possua automaticamente.
