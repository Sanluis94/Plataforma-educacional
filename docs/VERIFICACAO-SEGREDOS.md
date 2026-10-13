# Verificação de alertas e exposição de credenciais

Investigação em 13/10/2026 após notificação do GitHub. Nenhum valor de chave ou token é incluído neste documento. O repositório é público; remover um arquivo do estado atual não elimina seu conteúdo de commits anteriores.

## Alertas identificados

| Alerta | Evidência | Resultado e ação |
|---|---|---|
| [Secret scanning #2](https://github.com/Sanluis94/Plataforma-educacional/security/secret-scanning/2) | Exemplo de implantação doméstica adicionado na PR #8 continha uma string sintética no formato de chave Google, composta de caracteres repetidos. | Não era credencial emitida. O exemplo foi substituído por placeholder; testes geram a configuração sintética somente fora do Git. Classificado e encerrado como falso positivo após conferir a string do alerta. |
| [Secret scanning #1](https://github.com/Sanluis94/Plataforma-educacional/security/secret-scanning/1) | Configuração histórica anterior a esta revisão, correspondente a outro projeto. Detalhes ficam no relatório privado do incidente. | A conta conectada não administra esse projeto e não conseguiu verificar suas restrições. **Pendente: administrador do projeto antigo deve verificar/restringir ou revogar a chave; não considerar revogada nem encerrar como resolvida sem comprovação.** |
| Falha de CI da PR #8 | Primeira execução falhou no probe HTTP do contêiner: Node `fetch` descartava o `Host` informado e o Nginx recusava o loopback. | Probe corrigido para preservar Host e regressão adicionada. Cache Docker separado pelo fingerprint do manifesto. [Execução seguinte aprovada](https://github.com/Sanluis94/Plataforma-educacional/actions/runs/38420658150), incluindo ambas as imagens. A falha de CI não é evidência de vazamento. |

## Escopo conferido

- Histórico disponível de todas as referências locais/remotas: 88 commits e 976 blobs de texto na primeira verificação. Também foi executado Gitleaks 8.30.1 oficial, com checksum conferido e saída mascarada. O scanner examinou os commits com diffs disponíveis e apontou a chave histórica e um falso positivo de nome de chave de armazenamento local de certificados; não se apresenta sua contagem de commits como cobertura de todos os merges.
- Nenhum `.env` atual versionado além de `.env.example`. `.local`, contas de serviço e exportações permanecem ignorados e fora do contexto Docker/Hosting. O histórico antigo continua existindo.
- Valores privados configurados atualmente foram comparados em memória com os textos históricos e arquivos publicados, sem exibir os valores: não houve correspondência nesses locais. Também foram inspecionados os padrões de tokens GitHub, acesso AWS, material de chave privada e conta de serviço. Marcadores de chave privada em testes são dados artificiais de rejeição, sem material criptográfico válido.
- Foram conferidos 83 arquivos de texto da publicação `2c9d8b0` e 94 da compilação local desta revisão. A publicação final também deve ser conferida por hash e comparada com os valores privados antes de liberar o conjunto.
- A chave web Firebase atual foi identificada pelo provedor como chave de navegador criada pelo Firebase, com restrições de API; a API Gemini não consta da lista permitida. A chave Gemini atual é separada e não está no repositório nem nos arquivos publicados examinados. A confirmação não equivale a comprovar ausência de uso indevido em todos os serviços; telemetria de uso e cobrança exige revisão própria.

Chaves web Firebase têm uma finalidade diferente de tokens privados e podem integrar o SDK do navegador quando usadas apenas para os serviços apropriados, com restrições, regras e proteção contra abuso. A documentação oficial ressalta que **Gemini deve usar outra chave privada e nunca estar na allowlist de uma chave pública**. [Firebase: gerenciamento e exposição de chaves](https://firebase.google.com/docs/projects/api-keys). Sem verificar a chave do projeto antigo, esta distinção não permite declarar aquele alerta inofensivo.

## Prevenção e contenção

O CI usa Gitleaks com versão/checksum fixados e verifica os commits introduzidos em PRs/pushes, mascarando valores em diagnósticos. A verificação incremental não substitui esta auditoria histórica nem apaga o alerta antigo. Não há allowlist genérica para `.env`, diretórios ou chaves Google reais. Exemplos são placeholders; fixtures são geradas em `.local`.

A configuração pública lê somente os campos nomeados, sem incluir o objeto inteiro de `import.meta.env`. O compilador protegido esvazia valores `VITE_` desconhecidos e a chave Gemini. O serviço de IA também ignora a chave de ambiente fora de desenvolvimento, protegendo builds de produção feitos pelo comando genérico. Uma compilação por `npm run build`, seguida de comparação privada dos valores configurados, também confirmou ausência desses valores no artefato. Isso não torna seguro colocar credenciais privadas em `VITE_`; essas variáveis são destinadas ao navegador e uma nova funcionalidade deve preservar essa separação.

O administrador do projeto antigo deve verificar qual serviço usa a chave, substituir/atualizar os consumidores quando necessário, revogar a chave antiga e confirmar sua rejeição. Se houver exposição de uma credencial privada ou escopo indevido, revisar uso/cotas/cobrança, executar resposta a incidente e avaliar impactos. Reescrever histórico, quando necessário e coordenado, não substitui revogação. [GitHub: avaliação e remediação de alertas](https://docs.github.com/en/code-security/tutorials/remediate-leaked-secrets/evaluating-alerts).

Os relatórios detalhados e mascarados ficam em `.local/security-incident/`. A falta de acesso ao projeto antigo permanece uma limitação concreta; esta revisão não garante inexistência absoluta de vazamentos fora do escopo examinado.
