import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(HexColor("#64748b"))

        # Cabeçalho (a partir da página 2)
        if self._pageNumber > 1:
            self.drawString(54, 755, "Plataforma Educacional — Roteiro de Pitchs Comerciais (3 Minutos)")
            self.drawRightString(612 - 54, 755, "Vídeos Aluno & Professor")
            self.setStrokeColor(HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 748, 612 - 54, 748)

        # Rodapé
        self.setStrokeColor(HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "Documento Confidencial • Estratégia de Produto & Vendas EdTech")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(612 - 54, 32, page_text)
        self.restoreState()

def build_pdf(filename="Pitchs_De_Venda_Plataforma_Educacional.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Cores
    primary = HexColor("#0284c7")     # Ciano / Azul vibrante
    dark = HexColor("#0f172a")        # Quase preto
    text_dark = HexColor("#1e293b")   # Grafite escuro
    gray_bg = HexColor("#f8fafc")     # Fundo sutil
    accent_green = HexColor("#10b981")# Verde
    accent_purple = HexColor("#7c3aed")# Roxo

    # Estilos de Tipografia
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=primary,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=dark,
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'CustomBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    quote_style = ParagraphStyle(
        'LocutorQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=HexColor("#334155")
    )

    meta_style = ParagraphStyle(
        'MetaBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark
    )

    story = []

    # =========================================================================
    # CAPA / CABEÇALHO DO DOCUMENTO
    # =========================================================================
    story.append(Paragraph("PLATAFORMA EDUCACIONAL INTERATIVA", subtitle_style))
    story.append(Paragraph("Caderno de Roteiros de Pitch de Vendas", title_style))
    story.append(Paragraph("<b>2 Vídeos Comerciais Estratégicos de 3 Minutos (180s)</b> — Foco no Equilíbrio entre Demonstração Funcional do Aplicativo e Conversão de Clientes", body_style))
    story.append(Spacer(1, 10))

    # Box Informativo
    meta_data = [
        [Paragraph("<b>Público-Alvo Vídeo 1:</b> Estudantes, Pais, Coordenadores Pedagógicos", meta_style),
         Paragraph("<b>Público-Alvo Vídeo 2:</b> Professores, Diretores e Gestores de Ensino", meta_style)],
        [Paragraph("<b>Duração:</b> 3 minutos exatos (180 segundos cada)", meta_style),
         Paragraph("<b>Formato:</b> Screencast dinâmico em 60fps + Locução Profissional", meta_style)],
        [Paragraph("<b>Objetivo:</b> Vender a solução demonstrando recursos reais do app", meta_style),
         Paragraph("<b>Diferencial:</b> 72 Laboratórios Virtuais, IA Socrática e Gestão BNCC", meta_style)]
    ]
    meta_table = Table(meta_data, colWidths=[245, 255])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor("#f1f5f9")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e2e8f0"), spaceAfter=14))

    # =========================================================================
    # VÍDEO 1: INTERFACE DO ALUNO
    # =========================================================================
    story.append(Paragraph("VÍDEO 1: PITCH DA INTERFACE DO ALUNO (3 MINUTOS)", h1_style))
    story.append(Paragraph("<i>Título do Vídeo:</i> <b>'O Aplicativo que Transforma Teoria em Experiência Prática'</b>", body_style))
    story.append(Paragraph("<b>Direção de Arte:</b> Trilha sonora com batida eletrônica moderna e elegante. Tom motivador, enérgico e focado na autonomia do estudante.", body_style))
    story.append(Spacer(1, 8))

    video1_blocks = [
        ("0:00 - 0:30", "Login, Código de Turma & Dashboard Gamificado",
         "O vídeo abre na tela de login e acessa o EstudanteDashboard. O cursor vai no card 'Minhas Turmas', clica em 'Entrar em Turma', digita o código de 6 dígitos (ex: MAT-301) e a turma surge na tela com confirmação imediata. Destaque para a régua de XP, Moedas Virtuais e Ofensiva Diária em chamas.",
         "\"Esqueça as plataformas educacionais que parecem repositórios mortos de PDF. Quando o estudante faz login aqui, a primeira coisa que ele vê é um ambiente vivo, organizado e motivador. Para entrar na sala de aula, basta digitar o código de 6 dígitos fornecido pelo professor — sem burocracia de cadastros longos. No topo, uma régua de gamificação ética acompanha o progresso real do aluno: cada estudo rende pontos de experiência, moedas virtuais e mantém a ofensiva diária ativa. É a mecânica dos melhores jogos, aplicada para transformar o hábito diário de estudar em uma conquista pessoal.\""),

        ("0:30 - 1:15", "Os 72 Laboratórios Virtuais: Controles Interativos em Tempo Real",
         "Cursor clica no grid de disciplinas (12 matérias) e abre Geometria Espacial 3D. Mostra a alternância entre Cilindro, Esfera e Cone, ajustando os sliders de Raio e Altura. O sólido 3D re-renderiza na hora e os cartões de Volume (cm³ e Litros) e Área Total recalculam em tempo real. Corta rapidamente para o laboratório de Química (pH reagindo com reagentes).",
         "\"O grande coração da plataforma são os nossos 72 laboratórios virtuais especializados, divididos em 12 disciplinas completas. Veja a Geometria Espacial na prática: em vez de decorar fórmulas abstratas, o aluno seleciona o sólido em 3D, ajusta os sliders de raio e altura, e o sistema recalcula na hora o volume em centímetros cúbicos, a capacidade em litros e a área de superfície. Em Química, ele manipula tubos de ensaio e vê a escala colorimétrica de pH reagir em tempo real. Cada laboratório foi desenvolvido com motor gráfico próprio, permitindo que o estudante teste hipóteses, erre sem medo e aprenda com a causa e o efeito.\""),

        ("1:15 - 1:55", "IA Adaptativa Socrática & Acessibilidade DUA",
         "Zoom na caixa destacada em ciano luminoso: '🤖 IA ADAPTATIVA (DIAGNÓSTICO EM TEMPO REAL)'. O aluno muda a inclinação de uma reta para negativo e a IA atualiza a orientação textual. Cursor clica no botão inferior: '🏆 Concluir Laboratório (+50 XP & +10 Moedas)'.",
         "\"Dentro de cada simulador atua a nossa IA Adaptativa em tempo real. Inspirada na maiêutica socrática, ela não entrega respostas prontas para o aluno copiar. Ela analisa os parâmetros manipulados na tela e emite feedbacks contextuais imediatos, estimulando o raciocínio crítico: 'Por que o volume triplicou quando você dobrou o raio?'. A interface segue os princípios do Desenho Universal para a Aprendizagem: fundo escuro de alto contraste que reduz fadiga ocular, tipografia legível e controles táteis acessíveis para estudantes com TDAH ou dificuldades de foco. Ao finalizar a análise, o botão de conclusão credita 50 XP e registra a participação diretamente no painel do professor.\""),

        ("1:55 - 2:35", "Avaliações Formais: Cronômetro, Correção Instantânea & Gabarito Comentado",
         "O aluno clica na aba superior '📝 Provas & Avaliações' e entra em uma prova agendada. Mostra o cronômetro regressivo ativo no topo (ex: 48:22) e a navegação rápida por bolinhas de questões. O aluno marca a resposta e clica em 'Finalizar Prova'. Surge imediatamente a nota final, aproveitamento percentual e o gabarito detalhado com a justificativa pedagógica.",
         "\"Na aba de Provas e Avaliações, o aluno realiza testes formais e simulados com total clareza. O sistema traz um cronômetro regressivo na tela e um painel de navegação rápida por questões. A grande vantagem para o estudante? Zero ansiedade de esperar semanas pela nota. Ao submeter a prova, a correção é automática e instantânea. E o mais importante: o aplicativo exibe o gabarito pedagógico comentado, explicando exatamente a lógica da resposta correta e o motivo dos distratores estarem errados. É avaliação como ferramenta de aprendizagem, e não apenas de punição.\""),

        ("2:35 - 3:00", "Mural de Conteúdos & Fechamento Comercial",
         "Mostra a aba de Materiais Didáticos com clique no botão 'Copiar Texto' e 'Acessar Link Externo'. Encerra com a logo da plataforma, URL de acesso destacada e chamada para ação.",
         "\"Tudo o que o aluno precisa fica concentrado em um único ecossistema: materiais da aula, simuladores de ponta e simulados com correção em tempo real. É o fim da fragmentação de arquivos perdidos em grupos de mensagens. Proporcione aos seus alunos o aplicativo que desperta a curiosidade e transforma o rendimento escolar. Conheça a nossa plataforma e ative uma turma de testes hoje mesmo.\"")
    ]

    for time_code, block_title, screencast, speech in video1_blocks:
        block_data = [
            [Paragraph(f"<b>Bloco:</b> {time_code} — {block_title}", body_bold)],
            [Paragraph(f"<b>🖥️ O que mostrar na tela (Screencast):</b><br/>{screencast}", body_style)],
            [Paragraph(f"<b>🎙️ Fala do Locutor (Narração):</b><br/>{speech}", quote_style)]
        ]
        block_table = Table(block_data, colWidths=[500])
        block_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor("#e0f2fe")),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor("#ffffff")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, HexColor("#bae6fd")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor("#f1f5f9")),
        ]))
        story.append(block_table)
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # =========================================================================
    # VÍDEO 2: INTERFACE DO PROFESSOR
    # =========================================================================
    story.append(Paragraph("VÍDEO 2: PITCH DA INTERFACE DO PROFESSOR (3 MINUTOS)", h1_style))
    story.append(Paragraph("<i>Título do Vídeo:</i> <b>'A Central de Comando do Educador: Da IA à Gestão da Aprendizagem'</b>", body_style))
    story.append(Paragraph("<b>Direção de Arte:</b> Trilha corporativa acústica moderna e elegante. Tom empático, profissional, focado na eliminação de burocracia e no impacto pedagógico.", body_style))
    story.append(Spacer(1, 8))

    video2_blocks = [
        ("0:00 - 0:30", "Central de Turmas & Upload Polimórfico de Conteúdos",
         "Abre no ProfessorDashboard. O professor clica em 'Nova Turma', digita nome e disciplina e salva. O sistema gera instantaneamente o card da turma com o Código de Convite em destaque e botão 'Copiar Código'. Na aba 'Materiais Complementares', alterna entre os modos Texto (resumo com cópia rápida), Link (URL sanitizada com https://) e Arquivo (PDF com metadados).",
         "\"Como professor, quanto tempo da sua rotina é consumido gerenciando turmas e distribuindo arquivos soltos? No nosso Painel do Professor, a gestão começa com agilidade máxima. Você cria uma turma em segundos e gera um código de acesso exclusivo para os seus alunos entrarem direto. E na hora de compartilhar conteúdos, nossa Central Polimórfica resolve tudo em uma só tela: envie textos formatados com botão de cópia rápida, links externos seguros ou documentos em PDF com sanitização automática de dados. Tudo vinculado à turma certa, sem links quebrados e sem retrabalho.\""),

        ("0:30 - 1:15", "Criador de Provas Híbrido: Manual ou Assistido por IA",
         "O professor clica na aba '📝 Provas & Avaliações' e abre 'Criar Nova Prova'. Define título, turma, prazo e duração de 50 minutos. Clica em '🤖 Gerar Questões com IA', digita 'Leis de Newton e Força de Atrito' com dificuldade Média. Em menos de 5 segundos, 5 questões completas são preenchidas com alternativas, gabarito assinalado e Justificativa Pedagógica. Clica em 'Publicar Prova' com toast verde de confirmação.",
         "\"A criação de avaliações foi desenhada para zerar o estresse do docente. Você define a data de entrega, a turma e a duração com cronômetro integrado. E aqui está o diferencial: você pode cadastrar questões manuais ou acionar o nosso Gerador por Inteligência Artificial. Basta informar o assunto desejado e o nível de dificuldade. O sistema redige os enunciados, formula alternativas plausíveis, marca o gabarito oficial e — o mais importante — redige a justificativa pedagógica da resolução. Em dois minutos, uma prova completa, padronizada e contextualizada está publicada para a sua turma.\""),

        ("1:15 - 2:00", "Correção Instantânea em 0s & Raio-X Analítico por Questão",
         "O professor abre o relatório da prova entregue. Mostra a lista de alunos com nota e aproveitamento percentual calculados automaticamente. Foca no gráfico de colunas 'Taxa de Acerto por Questão': questões com alto índice em verde e a Questão 4 em destaque vermelho/âmbar com 42% de acerto, exibindo o card: '⚠️ Alerta Pedagógico: Intervenção Prioritária Necessária (<50% de acertos)'.",
         "\"E o que acontece após os alunos fazerem a prova? Você não gasta um único minuto corrigindo folhas. O sistema calcula a nota, credita o XP dos estudantes e gera este painel analítico em tempo real. Em vez de uma média geral que esconde os problemas da turma, você enxerga a radiografia completa por questão. O gráfico aponta exatamente onde os alunos dominaram o assunto e onde houve defasagem. Se uma questão tem acerto inferior a 50%, o sistema aciona um alerta pedagógico automático de intervenção prioritária. Você sabe exatamente o que revisar na aula seguinte, com base em evidências e dados reais.\""),

        ("2:00 - 2:35", "Plano de Aulas Bimestral Conectado aos 72 Simuladores",
         "O professor abre a aba 'Plano de Aulas' com 4 abas bimestrais (1º ao 4º Bimestre). Abre o formulário da aula: campos de Habilidades da BNCC, metodologia ativa e dropdown 'Laboratório Virtual Associado'. Ele escolhe 'Estatística Descritiva' e salva, exibindo o botão direto que abre o simulador pré-configurado.",
         "\"O planejamento pedagógico também ganha estrutura profissional. Na aba de Plano de Aulas Bimestral, o professor organiza o cronograma do ano letivo de acordo com os códigos de habilidades da BNCC. E o grande trunfo: cada aula planejada pode ser vinculada diretamente a qualquer um dos 72 laboratórios práticos da plataforma. Quando o professor agenda uma aula sobre Estatística ou Trigonometria, o simulador correspondente já fica pré-configurado para os estudantes usarem em sala ou como lição ativa de casa. O planejamento deixa de ser um documento burocrático de gaveta e vira um roteiro de aula interativo.\""),

        ("2:35 - 3:00", "Mural Integrado, Retenção Escolar & Fechamento Comercial",
         "Mostra o Mural de Comunicados publicando aviso com toast de feedback. Transição para montagem rápida das telas de turmas, provas e gráficos analíticos. Tela final com dados de contato, selos BNCC e botão de demonstração.",
         "\"Comunicação centralizada, avaliação automatizada, planos alinhados à BNCC e relatórios precisos de aprendizagem. A nossa plataforma devolve o que o professor tem de mais precioso: tempo para focar nas pessoas, e não nas planilhas. Para os gestores escolares, significa maior retenção de alunos, dados confiáveis para reuniões de pais e aumento comprovado no rendimento do ENEM e vestibulares. Agende uma demonstração com nossa equipe pedagógica e transforme a gestão da sua escola hoje mesmo.\"")
    ]

    for time_code, block_title, screencast, speech in video2_blocks:
        block_data = [
            [Paragraph(f"<b>Bloco:</b> {time_code} — {block_title}", body_bold)],
            [Paragraph(f"<b>🖥️ O que mostrar na tela (Screencast):</b><br/>{screencast}", body_style)],
            [Paragraph(f"<b>🎙️ Fala do Locutor (Narração):</b><br/>{speech}", quote_style)]
        ]
        block_table = Table(block_data, colWidths=[500])
        block_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor("#f3e8ff")),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor("#ffffff")),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, HexColor("#d8b4fe")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor("#f1f5f9")),
        ]))
        story.append(block_table)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))

    # =========================================================================
    # GUIA DE GRAVAÇÃO E PRODUÇÃO
    # =========================================================================
    story.append(Paragraph("GUIA RÁPIDO DE GRAVAÇÃO E PRODUÇÃO AUDIOVISUAL", h1_style))

    guide_data = [
        [Paragraph("<b>Aspecto Técnico</b>", body_bold), Paragraph("<b>Recomendação Prática</b>", body_bold)],
        [Paragraph("<b>Captura de Tela (Screencast)</b>", body_style), Paragraph("Gravar em 1080p ou 4K a 60fps usando OBS Studio ou Camtasia. Cursor com realce sutil amarelo.", body_style)],
        [Paragraph("<b>Tema da Interface</b>", body_style), Paragraph("Manter o Dark Glassmorphism ativado. Os tons ciano (#06b6d4), roxo (#7c4dff) e esmeralda (#10b981) criam alto apelo visual moderno.", body_style)],
        [Paragraph("<b>Cadência de Locução</b>", body_style), Paragraph("Entre 130 e 145 palavras por minuto. A narração foi cronometrada para pausas naturais entre cada bloco de 30 a 45s.", body_style)],
        [Paragraph("<b>Áudio & Microfone</b>", body_style), Paragraph("Microfone condensador ou lapela direcional, com filtro anti-pop e tratamento acústico (sem eco de sala).", body_style)],
        [Paragraph("<b>Call to Action Final</b>", body_style), Paragraph("Inserir QR Code e link direto para agendamento de demonstração ou login na versão de avaliação.", body_style)],
    ]
    guide_table = Table(guide_data, colWidths=[160, 340])
    guide_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor("#f1f5f9")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 0.5, HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
    ]))
    story.append(guide_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF gerado com sucesso: {filename}")

if __name__ == "__main__":
    build_pdf()
