import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MathSimulator } from '../modules/ux/pages/simuladores/MathSimulator';
import { ALL_MODULES } from '../modules/core/constants/dashboardConstants';

describe('MathSimulator - 6 Unique Specialized Laboratories Suite', () => {
  it('should verify that all 6 math labs in dashboardConstants have dedicated, distinct modes', () => {
    const mathModule = ALL_MODULES.find(m => m.id === 'matematica');
    expect(mathModule).toBeDefined();
    expect(mathModule!.labs).toHaveLength(6);

    const modes = mathModule!.labs.map(l => l.props.mode);
    expect(modes).toEqual(['linear', 'quadratic', 'trigonometric', 'spatial', 'statistics', 'matrices']);

    const uniqueModes = new Set(modes);
    expect(uniqueModes.size).toBe(6);

    // Garante que nenhum usa o functionType 'generic' antigo
    mathModule!.labs.forEach(lab => {
      expect((lab.props as { functionType?: string }).functionType).not.toBe('generic');
    });
  });

  it('1. Linear Mode (Função de 1º Grau) renders slope, root, and handles completion', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="linear" onComplete={onComplete} />);

    expect(screen.getByText(/Função de 1º Grau \(Reta Afim\)/i)).toBeDefined();
    expect(screen.getByText(/Coeficiente Angular/i)).toBeDefined();
    expect(screen.getByText(/Coeficiente Linear/i)).toBeDefined();
    expect(screen.getByText(/Taxa de Variação/i)).toBeDefined();

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de 1º Grau/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });

  it('2. Quadratic Mode (Função de 2º Grau) renders Bhaskara, delta, and vertex', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="quadratic" onComplete={onComplete} />);

    expect(screen.getByText(/Função de 2º Grau \(Parábola & Bhaskara\)/i)).toBeDefined();
    expect(screen.getByText(/Discriminante/i)).toBeDefined();
    expect(screen.getAllByText(/Vértice V/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Concavidade/i)[0]).toBeDefined();

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de 2º Grau/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });

  it('3. Trigonometric Mode renders Unit Circle, Sine, Cosine, and Tangent', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="trigonometric" onComplete={onComplete} />);

    expect(screen.getByText(/Funções Trigonométricas & Círculo Unitário/i)).toBeDefined();
    expect(screen.getByText(/Círculo Trigonométrico Unitário/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Seno/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Cosseno/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Tangente/i })[0]).toBeDefined();

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de Trigonometria/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });

  it('4. Spatial Geometry Mode renders 3D Solids, Volume, and Surface Area', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="spatial" onComplete={onComplete} />);

    expect(screen.getByText(/Geometria Espacial \(Sólidos 3D, Volume & Área\)/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Cilindro/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Cone/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Esfera/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Prisma Retangular/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Pirâmide Regular/i })[0]).toBeDefined();
    expect(screen.getByText(/VOLUME \(Capacidade\)/i)).toBeDefined();
    expect(screen.getByText(/ÁREA TOTAL DA SUPERFÍCIE/i)).toBeDefined();

    // Troca de sólido para Esfera e confere recálculo
    const sphereBtn = screen.getAllByRole('button', { name: /Esfera/i })[0];
    fireEvent.click(sphereBtn);
    expect(screen.getByText(/Fórmula do Volume:/i)).toBeDefined();

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de Geometria Espacial/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });

  it('5. Statistics Mode renders Dataset, Frequency, Mean, Median, and Boxplot', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="statistics" onComplete={onComplete} />);

    expect(screen.getByText(/Estatística Descritiva \(Amostragem, Histograma & Boxplot\)/i)).toBeDefined();
    expect(screen.getByText(/Média \(x̄\)/i)).toBeDefined();
    expect(screen.getByText(/Mediana \(Me\)/i)).toBeDefined();
    expect(screen.getByText(/Desvio Padrão \(s\)/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Notas Escolares/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Com Outlier Notável/i })[0]).toBeDefined();

    // Clica no preset de outlier
    const outlierBtn = screen.getAllByRole('button', { name: /Com Outlier Notável/i })[0];
    fireEvent.click(outlierBtn);

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de Estatística/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });

  it('6. Matrices Mode renders Matrix Inversion, Cramer Determinants, and Linear Systems', () => {
    const onComplete = vi.fn();
    render(<MathSimulator mode="matrices" onComplete={onComplete} />);

    expect(screen.getByText(/Matrizes & Sistemas Lineares \(Determinantes & Cramer\)/i)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Sistema Linear 2D/i })[0]).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Álgebra Matricial/i })[0]).toBeDefined();
    expect(screen.getByText(/Classificação do Sistema:/i)).toBeDefined();
    expect(screen.getByText(/Determinante Principal D/i)).toBeDefined();

    // Troca para aba Álgebra Matricial
    const matrixTabBtn = screen.getAllByRole('button', { name: /Álgebra Matricial/i })[0];
    fireEvent.click(matrixTabBtn);
    expect(screen.getByText(/Editor da Matriz A/i)).toBeDefined();
    expect(screen.getByText(/Cálculo do Determinante:/i)).toBeDefined();

    const finishBtn = screen.getByRole('button', { name: /Concluir Laboratório de Matrizes/i });
    fireEvent.click(finishBtn);
    expect(onComplete).toHaveBeenCalledWith(100);
  });
});
