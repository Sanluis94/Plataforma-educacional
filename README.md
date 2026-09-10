# Edu-Interact — Plataforma Educacional de Ciências, Laboratórios Virtuais & LMS Inclusivo

> Plataforma educacional moderna com **72 laboratórios virtuais interativos**, módulos avançados de **LMS (estilo Moodle)**, arquitetura de **segurança RBAC** e fundamentação em **Metodologia Ativa de Aprendizagem & Desenho Universal para a Aprendizagem (DUA)**.

---

## 🏛️ Fundamentação Pedagógica & Metodologia Inclusiva

A plataforma Edu-Interact foi concebida a partir da convergência harmônica entre a filosofia clássica, a pedagogia crítica latino-americana e a neurociência cognitiva moderna. Nosso objetivo central é **democratizar o aprendizado científico de alto nível**, acolhendo com dignidade e eficácia alunos com dificuldades de aprendizagem (**TDAH, TEA, dislexia e defasagem escolar**).

O tratado pedagógico completo está documentado em [`docs/METODOLOGIA_PEDAGOGICA.md`](./docs/METODOLOGIA_PEDAGOGICA.md).

### Os 4 Pilares da Metodologia Edu-Interact

1. **🏛️ Sócrates (A Maiêutica e o Questionamento Guiado)**:
   - A plataforma e os simuladores não entregam conclusões prontas. O **Tutor Socrático** faz perguntas reflexivas, estimula hipóteses e leva o educando a "dar à luz" o seu próprio entendimento através de contradições produtivas.

2. **🔬 Aristóteles (Empirismo Sensorial & As 4 Causas)**:
   - Todo conceito abstrato nasce da experiência sensorial concreta. Nos laboratórios, o aluno manipula variáveis físicas reais (massa, gravidade, ângulo, refração) e identifica as causas *material*, *formal*, *eficiente* e *final* de cada fenômeno.

3. **🌱 Paulo Freire (Problematização, Temas Geradores e Autonomia)**:
   - Superação da "educação bancária". Os conteúdos curriculares são contextualizados em problemas do cotidiano comunitário e social dos estudantes. O professor atua como mediador horizontal, instigando a leitura crítica do mundo.

4. **🧩 Desenho Universal para a Aprendizagem (DUA / UDL) & Inclusão Cognitiva**:
   - **Múltiplos Meios de Representação**: Interface visual com alto contraste, animações interativas, leitor de áudio nativo (Text-to-Speech via Web Speech API) e textos claros.
   - **Múltiplos Meios de Ação e Expressão**: Resolução prática em simuladores, digitação de hipóteses guiadas e provas adaptadas com diferentes níveis de complexidade.
   - **Múltiplos Meios de Engajamento**: Gamificação formativa com XP e medalhas, feedback imediato e redução drástica de sobrecarga sensorial.

---

## ♿ Recursos Nativos de Acessibilidade (Barra DUA)

No topo da aplicação (acessível por teclado e leitor de tela), a **Barra de Acessibilidade & Inclusão DUA** oferece:
- **🔠 Ajuste Tipográfico**: Escala de fonte dinâmica (100%, 115%, 130%) com reflow responsivo.
- **📖 Tipografia para Dislexia**: Alternância para fonte aberta com maior espaçamento entrelinhas/palavras e peso balanceado na base das letras.
- **👁️ Modo Foco (TDAH & TEA)**: Neutralização de animações contínuas, remoção de efeitos de brilho/vidro reflexivo e contraste focado para minimizar a dispersão sensorial.
- **🔊 Leitor em Voz Alta (Text-to-Speech)**: Narração em voz humanizada em português (`pt-BR`) de qualquer parágrafo selecionado ou conteúdo da tela via Web Speech API nativa, sem sobrecarregar a banda do usuário.

---

## 🚀 Funcionalidades Principais

### 1. 72 Laboratórios Virtuais Interativos de Ciências e Matemática
- **Mecânica Clássica**: Pêndulo Simples, Colisões Elásticas/Inelásticas, Movimento Harmônico, Gravitação, Atrito e Queda Livre.
- **Óptica e Ondulatória**: Lei de Snell e Refração, Interferência, Lentes Delgadas, Efeito Doppler.
- **Termodinâmica e Fluidos**: Gases Ideais (P·V = n·R·T), Ciclos Térmicos, Calorimetria, Empuxo e Arquimedes.
- **Eletromagnetismo & Física Moderna**: Circuitos RLC, Campo Magnético, Indução de Faraday, Efeito Fotoelétrico.
- **Química e Biologia**: Reações Químicas, Balanceamento, Células e Cadeias Moleculares.
- **Matemática**: Gráficos de Funções, Trigonometria, Estatística e Probabilidade.

### 2. Módulos LMS Completos (Estilo Moodle / Google Classroom)
- **Quadro de Notas Ponderado (Gradebook)**: Cálculo de média bimestral combinando Laboratórios (30%), Provas Formais (50%) e Participação/Avisos (20%).
- **Mural de Avisos da Turma**: Comunicação direta entre professor e estudantes com feed em tempo real.
- **Repositório de Materiais Didáticos**: Suporte a upload de PDFs, apostilas, links externos e notas de aula com organização por bimestre.
- **Fórum de Dúvidas e Mensagens**: Canal interativo onde o professor pode responder alunos e conceder moedas/XP bônus por engajamento.
- **Planejador de Aulas Bimestral (BNCC)**: Criação de planos de aula com atalhos de preenchimento para Metodologia Socrática, Aristotélica, Freiriana e DUA, além de assistência por IA (Google Gemini).
- **Provas e Avaliações com Correção Automática**: Criação de testes com peso por questão, tempo limite, data de entrega e relatórios analíticos de acerto/erro por habilidade.

### 3. Segurança & Proteção de Dados
- **Firestore Security Rules**: Regras granulares baseadas em RBAC (`isProfessor`, `isStudent`, `isAdmin`, `isEnrolledInClass`), prevenindo acessos não autorizados.
- **Cabeçalhos HTTP Seguros**: Configuração com Content Security Policy (CSP), HSTS, `X-Frame-Options: DENY` e `X-Content-Type-Options: nosniff`.
- **Rotas Protegidas no Frontend**: Guardas de navegação (`ProtectedRoute.tsx`) que garantem que apenas usuários autenticados e com o cargo correto acessem os painéis de controle.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend & Database**: Google Firebase (Authentication & Cloud Firestore).
- **Acessibilidade**: Web Speech API (SpeechSynthesis), WAI-ARIA, Padrões WCAG 2.1 AA.
- **Inteligência Artificial**: Google Gemini API (Geração de diagnósticos pedagógicos, planos de aula e mediação socrática).
- **Testes & Qualidade**: Vitest, React Testing Library, ESLint, TypeScript Strict Mode.

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Sanluis94/Plataforma-educacional.git
cd Plataforma-educacional/plataforma-educacional

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Execução de Testes

```bash
# Executar a suíte de testes unitários e de integração
npm run test:run

# Checagem estrita de tipos TypeScript
npx tsc -b
```

### Build de Produção

```bash
npm run build
```

---

## 📦 Pipeline ETL (Firebase / Firestore)

O projeto inclui um pipeline de ETL para desenvolvimento, homologação e relatórios analíticos:

```bash
# Executar o ETL usando Firebase
npm run etl

# Executar com dados simulados locais (seed)
npm run etl:seed

# Iniciar a API local de métricas do ETL
npm run etl:serve
```

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de pesquisa acadêmica em metodologias ativas e acessibilidade digital.
