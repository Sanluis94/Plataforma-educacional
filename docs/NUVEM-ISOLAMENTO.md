# Implantação isolada por escola e para uso doméstico

Cada escola recebe uma instalação com domínio, imagem do frontend e projeto Firebase próprios. O ambiente doméstico usa outra instalação e outro projeto. Firebase Authentication, Firestore e eventual Storage pertencem ao projeto dedicado: uma conta criada em uma escola não é automaticamente uma conta da outra. As regras atuais continuam controlando os papéis e turmas dentro de cada instalação.

O frontend é portátil entre AWS e Azure. O banco e a autenticação continuam em Firebase/Google Cloud; hospedar o container na AWS ou Azure não transfere esses serviços para esses provedores. Essa separação deve aparecer no contrato, inventário de fornecedores e avaliação de transferências de dados. Projetos diferentes separam recursos Firebase, enquanto IAM, contas administrativas, registros, backups e credenciais também precisam ser configurados por instalação. A [documentação de projetos Firebase](https://firebase.google.com/docs/projects/learn-more) explica o escopo compartilhado dos aplicativos de um mesmo projeto.

## O que foi preparado

- `Dockerfile`: compilação em estágio Node e serviço Nginx sem root, porta8080.
- `.dockerignore`: contexto permitido por lista explícita; `.env`, contas de serviço, exportações, `.local`, testes e `node_modules` ficam de fora.
- `deploy/nginx.conf`: rotas profundas da SPA, arquivos ausentes com404, `/healthz`, headers básicos e cache de assets separados do HTML/metadata.
- `deploy/entrypoint.sh`: compara ID da instalação, projeto Firebase e origem esperados com a imagem compilada. Uma combinação incorreta encerra o container.
- `scripts/cloud/installation.mjs`: valida manifesto público, configuração Firebase coerente e inventário sem instalações/projetos/origens repetidos.
- `scripts/cloud/prepare-installations.mjs`: produz inventário e pacote privado de preparação, incluindo regras, índices e variáveis públicas de inicialização. Não cria recursos, usuários ou dados.
- `scripts/cloud/build-installation.mjs`: compila a instalação sem carregar `.env`, desliga IA externa e emuladores e inspeciona o artefato para credenciais/exportações indevidas.
- `scripts/cloud/check-container.mjs`: teste real local do container, identidade, usuário, filesystem, rotas,404 e recusa de instalação incorreta.
- Exemplos ECS/Fargate e Azure Container Apps em `deploy/`: modelos incompletos, sem provisionamento automático.

## Manifestos e preparação

Os dois exemplos usam dados fictícios. Copie para uma pasta privada sob `.local/` e substitua a configuração web pelo aplicativo do respectivo projeto Firebase. Os campos do SDK web são públicos; o manifesto não aceita contas de serviço, chave Gemini ou campos desconhecidos. Essa configuração não concede acesso ao banco: as [regras e a autenticação continuam necessárias](https://firebase.google.com/support/guides/security-checklist).

```powershell
New-Item -ItemType Directory -Force .local\cloud-input
Copy-Item deploy\installation.school.example.json .local\cloud-input\escola.json
Copy-Item deploy\installation.home.example.json .local\cloud-input\casa.json
# Edite os dois manifestos com projetos, appIds, números de projeto e domínios distintos.
node scripts/cloud/prepare-installations.mjs .local/cloud-input/escola.json .local/cloud-input/casa.json --out .local/cloud/preparacao-001
```

Inclua todos os manifestos do inventário ao preparar: isso permite detectar reutilização de um projeto/domínio existente. O preparador valida formato e consistência do manifesto; não consulta o Firebase nem comprova que os projetos existem. Use a configuração fornecida pelo console de cada projeto e confirme sua associação antes da implantação. A produção compartilhada atual `plataforma-educacional-73df6` é recusada para essas novas instalações. Nenhum registro atual é migrado ou apagado.

`mode` pode ser `school` ou `home`. `releaseStage: pilot` admite os campos de responsável/documento/email vazios para preenchimento futuro. O build comercial exige responsável e email, `legalApprovalReference` e os registros operacionais `legalApproved`, `securityApproved`, `dataProcessingApproved`, `backupRestoreTested` com valortrue. Essas declarações são um bloqueio operacional e precisam de evidências externas; não certificam conformidade. O documento do responsável pode permanecer vazio quando juridicamente adequado à pessoa responsável, conforme revisão específica.

Um piloto também não dispensa obrigações legais nem autoriza usar dados de crianças sem os preparativos necessários. Até essa revisão, use dados fictícios e acesso controlado. As referências jurídicas e exigências do produto devem ser conferidas no documento jurídico preparado para o projeto.

## Compilar e testar uma instalação

A aplicação usa `import.meta.env` do Vite, substituído na compilação. Alterar `VITE_FIREBASE_PROJECT_ID` no container iniciado não muda seu banco. Por isso cada instalação tem uma compilação própria; o mesmo artefato dessa instalação pode ser movido entre provedores. A [documentação do Vite](https://vite.dev/guide/env-and-mode) explica a substituição das variáveis e a exposição de valores `VITE_` no navegador.

No computador/CI com Docker Engine e BuildKit:

```powershell
$revision = git rev-parse HEAD
$manifest = (Resolve-Path .local/cloud/preparacao-001/escola-exemplo/installation.json).Path
$image = "kortex/escola-exemplo:$revision"
docker build --platform linux/amd64 --secret "id=installation,src=$manifest" --build-arg "KORTEX_SOURCE_REVISION=$revision" --tag $image .
node scripts/cloud/check-container.mjs $manifest --image $image
```

O manifesto entra temporariamente via [BuildKit secret](https://docs.docker.com/build/building/secrets/), evitando `COPY .env` e a inclusão do arquivo nas camadas. Seus campos públicos necessários são compilados no frontend. IA externa fica desativada: uma chave privada do projeto não deve ir para o navegador; habilitação futura requer serviço protegido e avaliação jurídica/operacional específica.

Para iniciar manualmente uma instalação já testada:

```powershell
docker run --rm --read-only --cap-drop=ALL --security-opt=no-new-privileges --tmpfs /tmp:rw,noexec,nosuid,size=32m -p 127.0.0.1:8088:8080 --env-file .local/cloud/preparacao-001/escola-exemplo/container.env $image
```

`/healthz` mede apenas disponibilidade do serviço estático. Ele não demonstra funcionamento de Google Login, Firestore, políticas ou certificados. `installation.json` publica somente identificação/configuração de implantação, fingerprint do manifesto e revisão do código. Registre também o digest da imagem e use-o nas revisões do provedor. As bases Node22/Nginx1.30.5-alpine estão fixadas por digest consultado no registry oficial em13/10/2026; a versão estável foi conferida na [página oficial Nginx](https://nginx.org/en/download.html). Isso torna a base reproduzível, mas não é uma análise de vulnerabilidades. Atualize e examine os digests nas revisões de segurança; substituições explícitas usam `NODE_IMAGE` e `NGINX_IMAGE` como build args.

## AWS e Azure

| Item | AWS | Azure |
| --- | --- | --- |
| Imagem privada | ECR, repositório/imagem por instalação | ACR, repositório/imagem por instalação |
| Serviço | ECS/Fargate, serviço e task por escola | Container App por escola; ambiente dedicado quando requerido pelo contrato |
| HTTPS | ALB+certificado e DNS dedicado | Ingress HTTPS+certificado e DNS dedicado |
| Porta/health |8080, `/healthz` |8080, probes em `/healthz` |
| Permissões | Execution role só para ECR/logs; frontend sem credencial Firebase Admin | Identidade gerenciada para leitura ACR; frontend sem credencial Firebase Admin |
| Dados | Firebase dedicado, independente do ECS | Firebase dedicado, independente do Container App |

`deploy/aws-ecs-task.example.json` inclui usuário101, filesystem somente leitura, volume temporário e health check. Preencha imagem por digest, IAM role, grupo de logs e região; depois configure serviço, subnets/security groups, listener HTTPS e target group tipoIP/porta8080. O modelo não cria ALB, certificado, rede, regras IAM nem serviço. Custos e cotas devem ser avaliados antes de qualquer criação. [Volumes temporários Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/bind-mounts.html) permitem separar `/tmp` do root filesystem somente leitura.

`deploy/azure-containerapp.example.yaml` usa ingress HTTPS e probes. Preencha ambiente/região, imagem por digest e variáveis da instalação; associe a identidade gerenciada ao ACR e acrescente sua configuração de registry conforme os recursos existentes. O modelo não configura DNS/certificado/ACR nem cria os recursos. A documentação oficial descreve [ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to), [probes](https://learn.microsoft.com/en-us/azure/container-apps/health-probes) e [acesso ACR por identidade](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity-image-pull).

A escolha de região de frontend não define a região de dados. Selecione e registre a localização do Firestore ao criar cada banco: [a localização é determinada por recurso e pode ser imutável](https://firebase.google.com/docs/projects/locations). Auth, logs, backups, suporte e subprocessadores devem constar da análise de localização; uma região no Brasil não comprova, sozinha, que todo tratamento permanece no país. O plano não assume disponibilidade regional de cada SKU sem consulta no provedor.

## Configurar o backend dedicado

Antes de expor a instalação, um operador autorizado precisa preparar cada projeto: aplicativo web próprio, Google Login e domínios autorizados exatos, Firestore sem modo de teste, regras/índices revisados e roles administrativas específicas. Use uma conta/grupo de operações com acesso mínimo por escola; não distribua credenciais Admin nos containers. A mesma pessoa com uma conta Google ainda pode entrar em instalações diferentes quando a política permitir, mas os cadastros/UIDs e documentos são de projetos separados.

O pacote gerado inclui `firebase.json` somente de Firestore. A publicação futura deve sempre passar `--project ID_DESTA_INSTALACAO --config CAMINHO_DO_PACOTE/firebase.json`; não reutilize o alias `production` atual. Publicação de índices/regras e criação de Auth/banco são operações externas, não executadas pelos scripts de preparação. A versão de regras deve ser a mesma testada nos emuladores; a comparação depois da implantação deve confirmar projeto e conteúdo.

## Aceitação antes de entrada em operação

1. Inventário completo: cada escola e o ambiente doméstico têm origem, projeto Firebase e aplicativo próprios; confirme registros administrativos, IAM e localização.
2. Compile SHA revisado, teste container e registre digest, relatório de saúde e `installation.json`. Execute análise de dependências/imagem.
3. Configure HTTPS/DNS, restrição dos domínios Firebase e headers do ingresso; não direcione uma origem escolar para imagem/projeto de outra escola. Uma origem usada anteriormente deve ter seu estado offline/service worker limpo antes de mudança de identidade.
4. Em homologação com dados fictícios, entre com aluno/docente/responsável/admin; entregue e recupere atividade/prova, confira parecer, convite, certificado e revogação. Confirme erros/retry offline.
5. Teste isolamento: token da escolaA não lê/escreve FirestoreB; usuário/documentos de A não aparecem em B; exclusão ou falha em A não altera B. Repita no doméstico. Projetos separados e validação de manifesto são base arquitetural, sem substituir essa prova real.
6. Execute restauração de backup, retenção/exclusão, atendimento de direitos e resposta a incidentes; registre as evidências por projeto. Logs não devem incluir entregas, nomes de menores ou tokens sem necessidade.
7. Finalize responsável/documento/email e aprovação jurídica, contratos, bases legais, informação às famílias, proteção de menores e processo de suporte. Somente depois mude `releaseStage` para `commercial` e preencha os registros operacionais.

## Validação disponível neste computador

`node --test --test-concurrency=2 scripts/cloud/installation.test.mjs` testa manifestos, isolamento declarado, bloqueio comercial, escrita privada, rejeição de credenciais/exportações e parâmetros estáticos do container. A preparação não acessa dados reais.

Docker Engine não está disponível neste computador no momento desta preparação. Portanto imagem final, `nginx -t`, execução sem root/filesystem somente leitura e smoke HTTP dentro do container precisam ser executados no host/CI com Docker antes da liberação. Os arquivos de implantação foram preparados; não houve provisionamento AWS/Azure, criação de projeto Firebase, publicação, migração de usuários ou validação de uma instalação remota. Essa etapa pendente é bloqueio de aceitação comercial, não apenas uma observação.
