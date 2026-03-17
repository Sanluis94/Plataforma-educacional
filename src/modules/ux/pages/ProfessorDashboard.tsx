import { Card, CardContent, CardHeader, CardFooter, Button, Badge } from '../components';
import { PlusCircle, Users, BookOpen, BarChart } from 'lucide-react';
import { useProfessorDashboard } from '../../core/hooks/useProfessorDashboard';
import './ProfessorDashboard.css';

export function ProfessorDashboard() {
  const {
    turmas,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    publishActivity
  } = useProfessorDashboard();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Painel do Professor</h1>
        <p className="text-secondary">Gerencie suas turmas, crie atividades e acompanhe o progresso dos alunos.</p>
      </header>

      <div className="dashboard-grid">
        {/* Seção Principal de Turmas */}
        <section className="main-section">
          <div className="section-header">
            <h2>Minhas Turmas</h2>
            <Button onClick={() => setIsCreatingClass(!isCreatingClass)} variant="primary" size="sm">
              <PlusCircle size={16} style={{ marginRight: '0.5rem' }} />
              Nova Turma
            </Button>
          </div>

          {isCreatingClass && (
            <Card className="create-class-card">
              <CardContent>
                <form onSubmit={handleCreateClass} className="create-class-form">
                  <div className="form-group">
                    <label htmlFor="className">Nome da Turma</label>
                    <input 
                      id="className"
                      type="text" 
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Ex: História - 3º Ano C"
                      autoFocus
                    />
                  </div>
                  <div className="form-actions">
                    <Button type="button" variant="ghost" onClick={() => setIsCreatingClass(false)}>Cancelar</Button>
                    <Button type="submit" variant="primary">Criar Turma</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="turmas-grid">
            {turmas.map(turma => (
              <Card key={turma.id} interactive>
                <CardHeader>
                  <h3 className="turma-title">{turma.name}</h3>
                  <Badge variant={turma.studentsCount > 0 ? "success" : "warning"}>Ativa</Badge>
                </CardHeader>
                <CardContent>
                  <div className="turma-stats">
                    <Users size={16} />
                    <span>{turma.studentsCount} Alunos Matriculados</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="btn-full-width">Visualizar Relatório da Turma</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Sidebar com Ações Rápidas Expandidas (Construtor de Aulas) */}
        <aside className="sidebar-section">
           <h2>Ações e Relatórios</h2>
           <Card interactive className="action-card mb-1" onClick={() => setActiveTab(activeTab === 'activityBuilder' ? 'classes' : 'activityBuilder')}>
              <CardContent className="action-card-content">
                <div className="icon-wrapper bg-primary-light">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <div>
                  <h3>Construtor de Aula</h3>
                  <p>Desenvolva novos desafios e experimentos interativos.</p>
                </div>
              </CardContent>
            </Card>

            <Card interactive className="action-card" onClick={() => setActiveTab('reports')}>
              <CardContent className="action-card-content">
                <div className="icon-wrapper bg-success-light">
                  <BarChart size={24} className="text-success" />
                </div>
                <div>
                  <h3>Relatórios Gerenciais</h3>
                  <p>Acompanhe a inteligência artificial categorizando a turma.</p>
                </div>
              </CardContent>
            </Card>
        </aside>

      </div>

      {/* Modal/View Integrado do Construtor de Aulas */}
      {activeTab === 'activityBuilder' && (
        <div className="lesson-builder-overlay fade-in">
          <Card className="lesson-builder-card">
            <CardHeader className="builder-header">
              <h2>Construtor de Experiências (Passo {builderStep}/3)</h2>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('classes')}>Fechar</Button>
            </CardHeader>
            <CardContent>
               {builderStep === 1 && (
                 <div className="builder-step">
                   <h3>1. Qual o foco da atividade?</h3>
                   <div className="activity-types-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                      <div className={`type-card ${activityConfig.type === 'simulation_physics' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'simulation_physics', config: { gravity: 9.8 }})}>
                         <h4>🔭 Simulação de Física</h4>
                         <p>Kinemática, Dinâmica, Eletromagnetismo. (Ex: Pêndulo, Lançamento de Projéteis).</p>
                      </div>
                      <div className={`type-card ${activityConfig.type === 'simulation_chemistry' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'simulation_chemistry', config: { reagents: [] }})}>
                         <h4>🧪 Laboratório de Química</h4>
                         <p>Reações, Titulação, Tabela Periódica. Simulação de misturas e compostos.</p>
                      </div>
                      <div className={`type-card ${activityConfig.type === 'simulation_biology' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'simulation_biology', config: { microscopeZoom: 10 }})}>
                         <h4>🔬 Microscópio Virtual (Biologia)</h4>
                         <p>Células, Genética, Anatomia. Exploração interativa de organismos.</p>
                      </div>
                      <div className={`type-card ${activityConfig.type === 'simulation_math' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'simulation_math', config: { functionType: 'linear', allowGraphing: true }})}>
                         <h4>📐 Álgebra e Geometria (Matemática)</h4>
                         <p>Funções, Gráficos dinâmicos no Plano Cartesiano e Estatística básica.</p>
                      </div>
                      <div className={`type-card ${activityConfig.type === 'professional_training' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'professional_training', config: { skillLevel: 'iniciante' }})}>
                         <h4>💼 Capacitação Profissional</h4>
                         <p>Soft skills, Liderança, Mercado de Trabalho, Ferramentas Digitais.</p>
                      </div>
                      <div className={`type-card ${activityConfig.type === 'quiz' ? 'selected' : ''}`} onClick={() => setActivityConfig({...activityConfig, type: 'quiz', config: { difficulty: 'adaptative' }})}>
                         <h4>📝 Quiz Adaptativo com IA</h4>
                         <p>Avaliação inteligente e personalizada baseada no nível do aluno.</p>
                      </div>
                   </div>
                 </div>
               )}
               
               {builderStep === 2 && (
                 <div className="builder-step">
                   <h3>2. Detalhes Base e Configurações</h3>
                   <div className="form-group premium-input mb-1">
                     <label>Título da Experiência</label>
                     <input type="text" value={activityConfig.title} onChange={e => setActivityConfig({...activityConfig, title: e.target.value})} placeholder="Ex: Descobrindo Júpiter com Pêndulos" />
                   </div>
                   
                   {/* DYNAMIC CONFIG FORMS BASED ON TYPE */}
                   {activityConfig.type === 'simulation_physics' && (
                     <div className="form-group premium-input mt-2">
                       <label>Gravidade Simulada Inicial (m/s²)</label>
                       <input type="number" value={activityConfig.config.gravity} onChange={e => setActivityConfig({...activityConfig, config: { gravity: parseFloat(e.target.value) }})} step="0.1" />
                     </div>
                   )}

                   {activityConfig.type === 'simulation_chemistry' && (
                     <div className="form-group premium-input mt-2">
                       <label>Reagentes Disponíveis (separados por vírgula)</label>
                       <input type="text" placeholder="Ex: H2O, NaCl, HCl" onChange={e => setActivityConfig({...activityConfig, config: { ...activityConfig.config, reagents: e.target.value.split(',') }})} />
                     </div>
                   )}

                   {activityConfig.type === 'simulation_math' && (
                     <div className="form-group premium-input mt-2">
                       <label>Tipo de Função para Estudo Visual</label>
                       <select 
                         className="form-control" 
                         value={activityConfig.config.functionType}
                         onChange={e => setActivityConfig({...activityConfig, config: { ...activityConfig.config, functionType: e.target.value }})}
                       >
                         <option value="linear">Linear (1º Grau)</option>
                         <option value="quadratic">Quadrática (2º Grau)</option>
                         <option value="trigonometric">Trigonométrica (Seno/Coseno)</option>
                       </select>
                     </div>
                   )}

                   {activityConfig.type === 'professional_training' && (
                     <div className="form-group premium-input mt-2">
                       <label>Foco da Capacitação</label>
                       <input type="text" placeholder="Ex: Gestão de Tempo, Liderança de Equipes" onChange={e => setActivityConfig({...activityConfig, config: { focus: e.target.value }})} />
                     </div>
                   )}
                 </div>
               )}

               {builderStep === 3 && (
                 <div className="builder-step">
                   <h3>3. Confirmação</h3>
                   <p className="summary-text">A atividade "{activityConfig.title || 'Sem título'}" será publicada e o motor de IA irá recomendá-la para alunos com proficiência suficiente no módulo físico.</p>
                 </div>
               )}
            </CardContent>
            <CardFooter style={{ justifyContent: 'space-between' }}>
               <Button variant="ghost" disabled={builderStep === 1} onClick={() => setBuilderStep(b => b - 1)}>
                 Voltar
               </Button>
               {builderStep < 3 ? (
                 <Button variant="primary" onClick={() => setBuilderStep(b => b + 1)}>Próximo Passo</Button>
               ) : (
                 <Button variant="primary" onClick={publishActivity}>
                   Publicar Atividade Mágica
                 </Button>
               )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
