import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { privacyRequestUrl } from '../../core/config/productDeployment';
import { productDeployment } from '../../core/config/productConfiguration';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={{ marginTop: '1.7rem' }}><h2 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>{title}</h2>{children}</section>;
}

function Contact({ safety = false }: { safety?: boolean }) {
  const { privacyEmail, installationName } = productDeployment;
  return privacyEmail
    ? <p><a className="btn-outline" href={privacyRequestUrl(privacyEmail, safety ? 'safety' : 'rights', installationName)}>{safety ? 'Relatar um problema de segurança' : 'Solicitar atendimento sobre meus dados'}</a><br /><span>Contato: {privacyEmail}. O link abre seu aplicativo de e-mail; o pedido só é enviado por você.</span></p>
    : <p role="status">O canal de atendimento ainda será definido pelo responsável pelo produto. Até essa configuração, esta demonstração não está liberada para operação comercial com dados reais de estudantes.</p>;
}

export default function ProductInformation({ topic }: { topic: 'privacy' | 'terms' | 'safety' }) {
  const title = topic === 'privacy' ? 'Privacidade e seus dados' : topic === 'terms' ? 'Termos de uso' : 'Segurança e orientação para famílias';
  return <article style={{ maxWidth: '52rem', margin: 'auto', padding: '2rem 1rem 3rem', color: 'var(--text-main)', lineHeight: 1.7, overflowWrap: 'anywhere' }}>
    <Link to="/" className="btn-outline">Voltar ao início</Link>
    <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)', margin: '1.4rem 0 0.6rem' }}>{title}</h1>
    <p>{productDeployment.installationName} · Informações atualizadas em 13/10/2026.</p>
    {productDeployment.stage === 'pilot' && <aside className="card" style={{ padding: '1rem', margin: '1rem 0' }}><strong>Produto em preparação.</strong> Esta versão é uma demonstração. Antes do uso institucional ou doméstico com dados reais de crianças e adolescentes, o responsável precisa concluir a avaliação jurídica, os canais de atendimento e os controles de proteção.</aside>}
    {productDeployment.mode !== 'pilot' && <p>Ambiente: {productDeployment.mode === 'school' ? 'instalação da escola' : 'uso doméstico'}. Use o endereço indicado para este ambiente. Contas e progresso de instalações diferentes não são transferidos automaticamente.</p>}
    {topic === 'privacy' && <>
      <Section title="Quem responde pelos dados">
        <p>{productDeployment.controllerName ? `Responsável informado para esta instalação: ${productDeployment.controllerName}.` : 'Nome do responsável: ainda não definido.'} {productDeployment.controllerDocument && `Documento público: ${productDeployment.controllerDocument}.`}</p>
        <p>Na contratação por uma escola, as responsabilidades da escola e do fornecedor e as finalidades do tratamento devem constar do contrato. No uso doméstico, o responsável pelo produto deverá identificar seu papel e as bases legais aplicáveis.</p><Contact />
      </Section>
      <Section title="Quais informações o aplicativo utiliza">
        <ul>
          <li>Conta: nome e e-mail fornecidos pelo Google, identificador da conta, perfil e nível de ensino escolhido.</li>
          <li>Aprendizado: atividades, respostas, resultados, progresso, recompensas virtuais e tentativas de avaliações.</li>
          <li>Turmas: matrícula, frequência, materiais, mensagens, discussões, correções e relatórios pedagógicos.</li>
          <li>Família: e-mail de convite e vínculo de acesso criado e revogado pelo professor. O convite não comprova, por si só, responsabilidade legal.</li>
          <li>Certificados: há consulta pública por código com metadados da atividade e da emissão, sem nome ou identificador da conta do estudante. Avalie essa exposição antes de emitir documentos de menores.</li>
        </ul>
        <p>Esses registros apoiam o acesso, o estudo e o acompanhamento pedagógico. A escolha do nível de ensino não comprova idade. A definição das bases legais, dos prazos de conservação e da participação do responsável legal está pendente para a operação comercial.</p>
      </Section>
      <Section title="Quem pode acessar e quais serviços são usados">
        <p>O Firebase, do Google, fornece autenticação e armazenamento. As regras de acesso consideram a conta, a turma e os vínculos autorizados. O professor e a coordenação vinculada acessam registros pedagógicos da turma; o portal da família depende de convite e conta com e-mail verificado.</p>
        <p>Quando o tutor de IA externo é ativado, a pergunta e o contexto de aprendizagem são enviados ao Google Gemini. Evite nomes de estudantes, contatos, dados de saúde ou outras informações pessoais nas perguntas. A IA pode errar e exige revisão humana.</p>
        <p>Fontes de texto são carregadas do Google Fonts. O laboratório de Python carrega seu ambiente de execução de um serviço externo de distribuição de arquivos. Esses acessos podem transmitir endereço IP e informações técnicas do navegador aos fornecedores. Região de hospedagem, contratos e transferências internacionais precisam ser avaliados em cada instalação.</p>
        <p>A entrada por voz depende de permissão para o microfone. Conforme o navegador e sua configuração, o reconhecimento pode enviar áudio ao serviço do fornecedor do navegador. Você pode usar o teclado sem ativar o microfone.</p>
      </Section>
      <Section title="Informações guardadas no seu navegador">
        <p>O aplicativo guarda preferências de tema e acessibilidade, sessão e rascunhos de atividades no navegador. O modo local de desenvolvimento também mantém registros fictícios nesse dispositivo. Uma chave pessoal de IA, quando inserida, pode ser guardada no navegador.</p>
        <p>Em computadores compartilhados, saia da conta ao terminar. Limpar os dados do site nas configurações do navegador remove rascunhos e preferências locais; essa ação não exclui registros já enviados ao banco da plataforma. Não há ferramenta de publicidade ou Google Analytics ativada nesta versão.</p>
      </Section>
      <Section title="Seus direitos e como pedir ajuda">
        <p>Você pode solicitar informações sobre o tratamento, acesso, correção, revisão de decisões automatizadas e, quando cabível, exclusão, oposição e revogação de consentimento. A exclusão depende das obrigações de conservação aplicáveis, que deverão ser informadas pelo responsável.</p>
        <p>Depois de entrar, você pode <Link to="/meus-dados">registrar e acompanhar uma solicitação sobre seus dados</Link>, com protocolo e resposta da administração desta instalação. Registrar o pedido não executa exportação integral nem exclusão automática. A equipe precisa verificar o escopo, a identidade ou representação quando cabível e as obrigações de conservação. O processo operacional ainda deve ser definido para uso comercial.</p><Contact />
      </Section>
    </>}
    {topic === 'terms' && <>
      <Section title="Finalidade e acesso"><p>O Edu-Interact oferece atividades e simulações para apoiar o estudo. A conta Google e o perfil selecionado permitem acessar as funções correspondentes. Escolha o perfil que descreve sua atuação e use somente turmas e convites autorizados.</p><p>Menores devem utilizar o serviço com a participação da escola ou do responsável legal, conforme o contexto e as medidas definidas para essa instalação. Uma seleção de perfil ou nível de ensino não substitui essa avaliação.</p></Section>
      <Section title="Uso responsável"><p>Não compartilhe senhas ou códigos de acesso fora da turma. Não publique informações pessoais de outras pessoas, assédio, ameaças, discriminação ou conteúdo ilegal. Materiais enviados devem respeitar direitos autorais e direitos de imagem.</p><p>Simulações são atividades educativas; experimentos reais exigem orientação e segurança próprias. Perguntas e respostas de IA devem ser revisadas antes de orientar decisões ou avaliações.</p></Section>
      <Section title="Resultados, certificados e recompensas"><p>Resultados orientam o aprendizado e podem exigir revisão pelo professor. Notas estimadas do simulado ENEM não são notas oficiais. Certificados emitidos registram atividades da plataforma; sua emissão não significa reconhecimento pelo MEC.</p><p>Moedas e itens do aplicativo são recompensas virtuais, sem valor monetário e sem conversão em dinheiro. Os planos exibidos nesta demonstração não constituem uma contratação nem acionam cobrança.</p></Section>
      <Section title="Condições comerciais e atendimento"><p>Preço, fornecedor, suporte, disponibilidade, cancelamento, política de reembolso e responsabilidades deverão ser apresentados antes de qualquer contratação. Direitos previstos na legislação brasileira permanecem aplicáveis.</p><Contact /></Section>
    </>}
    {topic === 'safety' && <>
      <Section title="Para estudantes"><p>Use o endereço da sua escola ou da instalação doméstica indicada pela sua família. Evite publicar seu telefone, endereço, documentos ou informações particulares nas discussões e no tutor. Se uma conversa ou conteúdo causar desconforto, pare e procure um adulto de confiança.</p><p>Faça pausas durante o estudo. Recompensas virtuais não exigem ficar conectado por mais tempo. Nunca execute um experimento real apenas com base em uma simulação.</p></Section>
      <Section title="Para responsáveis e escolas"><p>O portal da família permite consultar informações do estudante após convite do professor e verificação do e-mail. O professor pode revogar o vínculo. Essa consulta não é um sistema completo de supervisão parental: limites de tempo, restrições de interação e verificação de representação legal ainda precisam ser implementados.</p><p>Antes de cadastrar estudantes, defina as finalidades do uso, os responsáveis pelo tratamento, as bases legais e os procedimentos de denúncia, revisão, conservação e exclusão. A operação com menores depende da conclusão dessas medidas.</p></Section>
      <Section title="Relatar conteúdo ou problema de segurança"><p>Informe o endereço, turma ou código do conteúdo e descreva o ocorrido. Não inclua senhas nem repasse material ofensivo ou dados de terceiros no primeiro contato. O canal deve permitir acompanhamento, remoção quando cabível e encaminhamento pelo responsável competente.</p><Contact safety /></Section>
    </>}
    <nav aria-label="Informações do produto" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}><Link to="/privacidade">Privacidade</Link><Link to="/termos">Termos de uso</Link><Link to="/seguranca">Segurança e famílias</Link></nav>
  </article>;
}
