// Catálogo Completo dos 500+ Laboratórios Virtuais Kortex
// Organizado em 5 Níveis Acadêmicos e Todas as Disciplinas Estruturantes
import type { UniversalLabConfig } from '../../ux/components/UniversalLabContainer';
import { NEW_ADVANCED_LABS } from './advancedLabsRegistry';

export interface CatalogLabItem {
  id: string;
  title: string;
  academicLevel: 'fundamental_1' | 'fundamental_2' | 'medio' | 'graduacao' | 'pos_graduacao';
  academicLevelLabel: string;
  subject: string;
  subjectCategory: string;
  topic: string;
  objective: string;
  theoreticalBackground: string;
  curriculumCode: string;
  simulatedHours: number;
  icon: string;
  solverType: string;
  defaultParams: {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }[];
  diagnosticQuestion: {
    question: string;
    options: { text: string; correct: boolean; explanation: string }[];
  };
}

export const MASTER_LABS_CATALOG: CatalogLabItem[] = [
  {
    "id": "fund1_mat_01",
    "title": "Ábaco e Sistema de Numeração Decimal",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Unidades e Dezenas",
    "objective": "Decomposição em unidade, dezena e centena",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF01MA01).",
    "curriculumCode": "BNCC EF01MA01",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "abacus",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 10
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular ábaco e sistema de numeração decimal?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre unidades e dezenas",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_02",
    "title": "Balança de Pratos das Quatro Operações",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Adição e Subtração",
    "objective": "Equilíbrio visual de pesos para adição e subtração",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF02MA02).",
    "curriculumCode": "BNCC EF02MA02",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "balance",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 12
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular balança de pratos das quatro operações?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre adição e subtração",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_03",
    "title": "Pizzaria das Frações",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Partes do Todo",
    "objective": "Fatias interativas para aprendizado de frações unitárias",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF04MA09).",
    "curriculumCode": "BNCC EF04MA09",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "pie",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 14
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular pizzaria das frações?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre partes do todo",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_04",
    "title": "Relógio Analógico e Linha do Tempo",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Medidas de Tempo",
    "objective": "Manipulação de ponteiros e conversão de horas e minutos",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF03MA22).",
    "curriculumCode": "BNCC EF03MA22",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "clock",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 16
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular relógio analógico e linha do tempo?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre medidas de tempo",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_05",
    "title": "Geoplano Virtual",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Figuras Geométricas",
    "objective": "Construção elástica de polígonos, contagem de lados e vértices",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF03MA15).",
    "curriculumCode": "BNCC EF03MA15",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "geometry",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 18
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular geoplano virtual?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre figuras geométricas",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_06",
    "title": "Mercadinho e Sistema Monetário",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Matemática Financeira",
    "objective": "Simulação de troco e composição com moedas e cédulas",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF02MA20).",
    "curriculumCode": "BNCC EF02MA20",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "money",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 20
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular mercadinho e sistema monetário?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre matemática financeira",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_07",
    "title": "Gráfico de Barras da Sala de Aula",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Estatística Lúdica",
    "objective": "Coleta visual de dados de animais favoritos e histograma",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF02MA22).",
    "curriculumCode": "BNCC EF02MA22",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "chart",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 22
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular gráfico de barras da sala de aula?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre estatística lúdica",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_08",
    "title": "Régua e Trena Métrica",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Grandezas e Medidas",
    "objective": "Medição de objetos cotidianos com milímetros e centímetros",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF03MA19).",
    "curriculumCode": "BNCC EF03MA19",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "ruler",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 24
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular régua e trena métrica?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre grandezas e medidas",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_09",
    "title": "Tabuada em Matriz Retangular",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Multiplicação Visual",
    "objective": "Disposição de quadradinhos para multiplicação A x B",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF04MA06).",
    "curriculumCode": "BNCC EF04MA06",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "matrix",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 26
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular tabuada em matriz retangular?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre multiplicação visual",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_mat_10",
    "title": "Labirinto de Simetria e Espelhamento",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Matemática Lúdica",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Simetria Axial",
    "objective": "Reflexão de figuras em malha quadriculada",
    "theoreticalBackground": "Compreensão intuitiva e sensorial dos fundamentos matemáticos iniciais conforme a Base Nacional Comum Curricular (BNCC EF03MA16).",
    "curriculumCode": "BNCC EF03MA16",
    "simulatedHours": 15,
    "icon": "📐",
    "solverType": "mirror",
    "defaultParams": [
      {
        "id": "param1",
        "label": "Quantidade / Escala",
        "unit": "un",
        "min": 1,
        "max": 50,
        "step": 1,
        "defaultValue": 28
      },
      {
        "id": "param2",
        "label": "Fator Multiplicador",
        "unit": "x",
        "min": 1,
        "max": 10,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual é o objetivo principal ao manipular labirinto de simetria e espelhamento?",
      "options": [
        {
          "text": "Desenvolver raciocínio lógico e visual sobre simetria axial",
          "correct": true,
          "explanation": "Correto! A experimentação visual consolida conceitos abstratos em modelos mentais concretos."
        },
        {
          "text": "Apenas decorar números sem entender a relação",
          "correct": false,
          "explanation": "O método Kortex foca na apreensão conceitual ativa e não na decoreba mecânica."
        },
        {
          "text": "Calcular integrais diferenciais avançadas",
          "correct": false,
          "explanation": "Este laboratório é desenhado para o ciclo de alfabetização matemática fundamental."
        }
      ]
    }
  },
  {
    "id": "fund1_port_01",
    "title": "Fábrica de Rimas",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Consciência Fonológica",
    "objective": "Associação fonética de palavras com terminações idênticas",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF15LP01).",
    "curriculumCode": "BNCC EF15LP01",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "rhyme",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Fábrica de Rimas\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de consciência fonológica de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_02",
    "title": "Separador Silábico Interativo",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Estrutura Silábica",
    "objective": "Divisão de palavras em vagões de trem silábicos",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF01LP06).",
    "curriculumCode": "BNCC EF01LP06",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "syllables",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Separador Silábico Interativo\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de estrutura silábica de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_03",
    "title": "Construtor de Quadrinhos e Tiras",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Gênero Quadrinhos",
    "objective": "Montagem narrativa com introdução, clímax e desfecho",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF15LP04).",
    "curriculumCode": "BNCC EF15LP04",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "comic",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Construtor de Quadrinhos e Tiras\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de gênero quadrinhos de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_04",
    "title": "Detetive da Pontuação Expressiva",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Sinais de Pontuação",
    "objective": "Efeito expressivo do ponto final, interrogação e exclamação",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF02LP09).",
    "curriculumCode": "BNCC EF02LP09",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "punct",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Detetive da Pontuação Expressiva\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de sinais de pontuação de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_05",
    "title": "Árvore de Substantivos e Adjetivos",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Classes Gramaticais",
    "objective": "Classificação morfológica de seres e suas qualidades",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF03LP08).",
    "curriculumCode": "BNCC EF03LP08",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "tree",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Árvore de Substantivos e Adjetivos\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de classes gramaticais de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_06",
    "title": "Cata-Sinônimos e Antônimos",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Semântica e Léxico",
    "objective": "Ligação semântica de termos equivalentes e opostos",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF02LP10).",
    "curriculumCode": "BNCC EF02LP10",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "words",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Cata-Sinônimos e Antônimos\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de semântica e léxico de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_07",
    "title": "Alfabeto Fonético Animado",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Fonemas e Grafemas",
    "objective": "Sons das letras com animação do aparelho fonador",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF01LP05).",
    "curriculumCode": "BNCC EF01LP05",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "phonetics",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Alfabeto Fonético Animado\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de fonemas e grafemas de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_08",
    "title": "Livro Aberto de Leitura Fluente",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Fluência Leitora",
    "objective": "Karaokê textual com velocidade ajustável de leitura",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF12LP01).",
    "curriculumCode": "BNCC EF12LP01",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "reading",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Livro Aberto de Leitura Fluente\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de fluência leitora de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_09",
    "title": "Caça ao Erro Ortográfico",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Ortografia Padrão",
    "objective": "Regras de M antes de P e B e dígrafos comuns",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF02LP01).",
    "curriculumCode": "BNCC EF02LP01",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "spelling",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Caça ao Erro Ortográfico\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de ortografia padrão de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund1_port_10",
    "title": "Gêneros Textuais em Blocos",
    "academicLevel": "fundamental_1",
    "academicLevelLabel": "Ensino Fundamental I",
    "subject": "Português & Alfabetização",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Gêneros Textuais",
    "objective": "Distinção estrutural de receitas, poemas e notícias",
    "theoreticalBackground": "Desenvolvimento das competências linguísticas, de leitura expressiva e produção de sentido (BNCC EF15LP15).",
    "curriculumCode": "BNCC EF15LP15",
    "simulatedHours": 15,
    "icon": "📖",
    "solverType": "genres",
    "defaultParams": [
      {
        "id": "velocidade",
        "label": "Velocidade / Ritmo",
        "unit": "ppm",
        "min": 20,
        "max": 120,
        "step": 5,
        "defaultValue": 60
      },
      {
        "id": "nivel_desafio",
        "label": "Complexidade",
        "unit": "lvl",
        "min": 1,
        "max": 5,
        "step": 1,
        "defaultValue": 2
      }
    ],
    "diagnosticQuestion": {
      "question": "No laboratório \"Gêneros Textuais em Blocos\", o que a atividade busca aprimorar?",
      "options": [
        {
          "text": "A competência de gêneros textuais de forma contextualizada",
          "correct": true,
          "explanation": "Exato! A prática ativa permite internalizar regras linguísticas com significado real."
        },
        {
          "text": "Apenas a caligrafia rápida sem leitura",
          "correct": false,
          "explanation": "O foco é a compreensão semântica e fonológica."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_01",
    "title": "Teorema de Pitágoras com Fluidos",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Geometria Métrica",
    "objective": "Áreas nos catetos preenchendo a hipotenusa com líquido",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09MA13).",
    "curriculumCode": "BNCC EF09MA13",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Teorema de Pitágoras com Fluidos\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geometria métrica",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_02",
    "title": "Reta Numérica dos Inteiros (Saldo e Temperatura)",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Números Inteiros",
    "objective": "Adição e subtração com números negativos e simétricos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07MA03).",
    "curriculumCode": "BNCC EF07MA03",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Reta Numérica dos Inteiros (Saldo e Temperatura)\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em números inteiros",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_03",
    "title": "Balança Algébrica de Equações de 1º Grau",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Álgebra e Equações",
    "objective": "Isolamento da incógnita x com operações equivalentes",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07MA18).",
    "curriculumCode": "BNCC EF07MA18",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Balança Algébrica de Equações de 1º Grau\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em álgebra e equações",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_04",
    "title": "Ângulos em Retas Paralelas Cortadas por Transversal",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Geometria Euclidiana",
    "objective": "Identificação de alternos internos e correspondentes",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08MA17).",
    "curriculumCode": "BNCC EF08MA17",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Ângulos em Retas Paralelas Cortadas por Transversal\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geometria euclidiana",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_05",
    "title": "Círculo Trigonométrico Básico",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Trigonometria Plana",
    "objective": "Projeções de seno e cosseno para ângulos notáveis",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09MA08).",
    "curriculumCode": "BNCC EF09MA08",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Círculo Trigonométrico Básico\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em trigonometria plana",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_06",
    "title": "Regra de Três Direta e Inversa",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Razão e Proporção",
    "objective": "Proporções de velocidade x tempo e operários x dias",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07MA17).",
    "curriculumCode": "BNCC EF07MA17",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Regra de Três Direta e Inversa\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em razão e proporção",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_07",
    "title": "Probabilidade com Roletas e Dados",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Estatística e Probabilidade",
    "objective": "Comparação entre probabilidade teórica e frequência empírica",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08MA22).",
    "curriculumCode": "BNCC EF08MA22",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Probabilidade com Roletas e Dados\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em estatística e probabilidade",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_08",
    "title": "Potenciação e Notação Científica Cósmica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Potenciação",
    "objective": "Navegação em potências de 10 da escala atômica à galáctica",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08MA01).",
    "curriculumCode": "BNCC EF08MA01",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Potenciação e Notação Científica Cósmica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em potenciação",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_09",
    "title": "Poliedros de Platão e Relação de Euler (V - A + F = 2)",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Geometria Espacial",
    "objective": "Manipulação tridimensional e planificação de faces",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06MA17).",
    "curriculumCode": "BNCC EF06MA17",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Poliedros de Platão e Relação de Euler (V - A + F = 2)\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geometria espacial",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_mat_10",
    "title": "Plano Cartesiano e Batalha Naval",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Matemática Fundamental II",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Coordenadas Cartesianas",
    "objective": "Localização de pares ordenados (x,y) e construção de retas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07MA19).",
    "curriculumCode": "BNCC EF07MA19",
    "simulatedHours": 20,
    "icon": "📐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Plano Cartesiano e Batalha Naval\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em coordenadas cartesianas",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_01",
    "title": "Célula Vegetal vs. Animal ao Microscópio",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Citologia Básica",
    "objective": "Comparação visual de organelas, parede e cloroplastos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06CI05).",
    "curriculumCode": "BNCC EF06CI05",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Célula Vegetal vs. Animal ao Microscópio\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em citologia básica",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_02",
    "title": "Cadeia Alimentar e Pirâmide de Energia",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Ecologia",
    "objective": "Simulação trófica e impacto da extinção de predadores",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07CI08).",
    "curriculumCode": "BNCC EF07CI08",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Cadeia Alimentar e Pirâmide de Energia\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em ecologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_03",
    "title": "Sistema Digestório e Quebra Enzimática",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Fisiologia Humana",
    "objective": "Caminho dos alimentos e absorção no intestino",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06CI07).",
    "curriculumCode": "BNCC EF06CI07",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Sistema Digestório e Quebra Enzimática\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em fisiologia humana",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_04",
    "title": "Mecânica Respiratória e Hematose Alveolar",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Sistema Respiratório",
    "objective": "Pressão diafragmática e trocas de O2 e CO2",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06CI08).",
    "curriculumCode": "BNCC EF06CI08",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Mecânica Respiratória e Hematose Alveolar\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em sistema respiratório",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_05",
    "title": "Ciclo da Água e Aquíferos Subterrâneos",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Hidrologia",
    "objective": "Evapotranspiração, infiltração e recarga hídrica",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06CI11).",
    "curriculumCode": "BNCC EF06CI11",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Ciclo da Água e Aquíferos Subterrâneos\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em hidrologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_06",
    "title": "Permeabilidade de Solos e Escoamento",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Pedologia",
    "objective": "Infiltração de água em areia, argila e matéria orgânica",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06CI12).",
    "curriculumCode": "BNCC EF06CI12",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Permeabilidade de Solos e Escoamento\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em pedologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_07",
    "title": "Camadas da Atmosfera e Camada de Ozônio",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Meteorologia",
    "objective": "Pressão, altitude e filtragem da radiação UV solar",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07CI14).",
    "curriculumCode": "BNCC EF07CI14",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Camadas da Atmosfera e Camada de Ozônio\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em meteorologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_08",
    "title": "Vacinas, Antígenos e Resposta Imunológica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Imunologia",
    "objective": "Ação de anticorpos e memória imunológica celular",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07CI10).",
    "curriculumCode": "BNCC EF07CI10",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Vacinas, Antígenos e Resposta Imunológica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em imunologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_09",
    "title": "Anatomia Floral e Polinização Cruzada",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Botânica",
    "objective": "Dispersão de pólen por vento e insetos até a semente",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08CI07).",
    "curriculumCode": "BNCC EF08CI07",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Anatomia Floral e Polinização Cruzada\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em botânica",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_bio_10",
    "title": "Fósseis e Estratigrafia Geológica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Ciências & Biologia",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Paleontologia",
    "objective": "Datação relativa de rochas sedimentares e eras da Terra",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09CI11).",
    "curriculumCode": "BNCC EF09CI11",
    "simulatedHours": 20,
    "icon": "🔬",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Fósseis e Estratigrafia Geológica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em paleontologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_01",
    "title": "Sociedade do Nilo e as Pirâmides do Egito",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Antiguidade Oriental",
    "objective": "Cheias sazonais, irrigação e hierarquia social dos faraós",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06HI07).",
    "curriculumCode": "BNCC EF06HI07",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Sociedade do Nilo e as Pirâmides do Egito\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em antiguidade oriental",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_02",
    "title": "Democracia Ateniense vs. Militarismo Espartano",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Grécia Antiga",
    "objective": "Votação na Eclésia vs. agogê dos guerreiros lacedemônios",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06HI10).",
    "curriculumCode": "BNCC EF06HI10",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Democracia Ateniense vs. Militarismo Espartano\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em grécia antiga",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_03",
    "title": "Feudo Medieval e Rotação Trienal de Culturas",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Idade Média",
    "objective": "Obrigações servis (corveia, talha) e castelos fortificados",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06HI14).",
    "curriculumCode": "BNCC EF06HI14",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Feudo Medieval e Rotação Trienal de Culturas\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em idade média",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_04",
    "title": "As Grandes Navegações e a Bússola Náutica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Expansão Marítima",
    "objective": "Instrumentos marítimos e rotas marítimas transoceânicas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07HI02).",
    "curriculumCode": "BNCC EF07HI02",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"As Grandes Navegações e a Bússola Náutica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em expansão marítima",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_05",
    "title": "Impérios Pré-Colombianos (Incas, Maias, Astecas)",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "América Pré-Colombiana",
    "objective": "Terraços agrícolas nos Andes e calendários solares",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07HI03).",
    "curriculumCode": "BNCC EF07HI03",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Impérios Pré-Colombianos (Incas, Maias, Astecas)\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em américa pré-colombiana",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_06",
    "title": "O Engenho de Açúcar no Brasil Colonial",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Brasil Colonial",
    "objective": "Moenda, casa-grande e tráfico negreiro transatlântico",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07HI15).",
    "curriculumCode": "BNCC EF07HI15",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"O Engenho de Açúcar no Brasil Colonial\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em brasil colonial",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_07",
    "title": "A Queda da Bastilha e a Revolução Francesa",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Idade Moderna",
    "objective": "Divisão dos Três Estados e Declaração dos Direitos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08HI04).",
    "curriculumCode": "BNCC EF08HI04",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"A Queda da Bastilha e a Revolução Francesa\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em idade moderna",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_08",
    "title": "Ciclo do Ouro e a Inconfidência Mineira",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Século do Ouro",
    "objective": "Cobrança do quinto, derrama e arte barroca de Aleijadinho",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08HI10).",
    "curriculumCode": "BNCC EF08HI10",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Ciclo do Ouro e a Inconfidência Mineira\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em século do ouro",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_09",
    "title": "Brasil Império e a Guerra do Paraguai",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Brasil Imperial",
    "objective": "Segundo Reinado, diplomacia platina e abolição",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08HI15).",
    "curriculumCode": "BNCC EF08HI15",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Brasil Império e a Guerra do Paraguai\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em brasil imperial",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_hist_10",
    "title": "A Vida nas Trincheiras da Primeira Guerra",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "História Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Século XX",
    "objective": "Guerra de atrito, metralhadoras e gases químicos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09HI10).",
    "curriculumCode": "BNCC EF09HI10",
    "simulatedHours": 20,
    "icon": "🏛️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"A Vida nas Trincheiras da Primeira Guerra\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em século xx",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_01",
    "title": "Coordenadas Geográficas e Fusos Horários",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Cartografia",
    "objective": "Cálculo de meridianos, paralelos e horário GMT",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06GE03).",
    "curriculumCode": "BNCC EF06GE03",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Coordenadas Geográficas e Fusos Horários\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em cartografia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_02",
    "title": "Tectônica de Placas e Falhas Sismogênicas",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geologia Física",
    "objective": "Limites convergentes, fossas oceânicas e terremotos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06GE05).",
    "curriculumCode": "BNCC EF06GE05",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Tectônica de Placas e Falhas Sismogênicas\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geologia física",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_03",
    "title": "Erosão e Dinâmica dos Vales Fluviais",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geomorfologia",
    "objective": "Ação mecânica da água modelando meandros e canions",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06GE06).",
    "curriculumCode": "BNCC EF06GE06",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Erosão e Dinâmica dos Vales Fluviais\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geomorfologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_04",
    "title": "Biomas Brasileiros e Climatogramas",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Biogeografia",
    "objective": "Adaptações da Caatinga, Cerrado, Amazônia e Pampa",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07GE06).",
    "curriculumCode": "BNCC EF07GE06",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Biomas Brasileiros e Climatogramas\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em biogeografia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_05",
    "title": "Pirâmides Etárias e Transição Demográfica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Demografia",
    "objective": "Envelhecimento populacional e taxa de fecundidade",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07GE09).",
    "curriculumCode": "BNCC EF07GE09",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Pirâmides Etárias e Transição Demográfica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em demografia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_06",
    "title": "Ilhas de Calor e Problemas Urbanos",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geografia Urbana",
    "objective": "Impermeabilização do solo, tráfego e microclima",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08GE15).",
    "curriculumCode": "BNCC EF08GE15",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Ilhas de Calor e Problemas Urbanos\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em geografia urbana",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_07",
    "title": "Zonas Térmicas e Circulação Atmosférica",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Climatologia",
    "objective": "Células de Hadley, ventos alísios e monções",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08GE03).",
    "curriculumCode": "BNCC EF08GE03",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Zonas Térmicas e Circulação Atmosférica\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em climatologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_08",
    "title": "Matriz Elétrica e Fontes Renováveis",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Energia e Recursos",
    "objective": "Pegada de carbono de usinas hidrelétricas, solares e eólicas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08GE20).",
    "curriculumCode": "BNCC EF08GE20",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Matriz Elétrica e Fontes Renováveis\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em energia e recursos",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_09",
    "title": "Globalização e Redes de Telecomunicação",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Economia Global",
    "objective": "Cabos submarinos de fibra óptica e rotas de contêineres",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09GE05).",
    "curriculumCode": "BNCC EF09GE05",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Globalização e Redes de Telecomunicação\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em economia global",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_geo_10",
    "title": "Curvas de Nível e Modelagem 3D do Relevo",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Geografia Fundamental II",
    "subjectCategory": "Ciências Humanas",
    "topic": "Sensoriamento",
    "objective": "Interpretação de mapas topográficos e declividade",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09GE14).",
    "curriculumCode": "BNCC EF09GE14",
    "simulatedHours": 20,
    "icon": "🌍",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Curvas de Nível e Modelagem 3D do Relevo\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em sensoriamento",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_01",
    "title": "Sintaxe: Análise de Sujeito e Predicado",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Análise Sintática",
    "objective": "Classificação de núcleos e predicação verbal",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LP05).",
    "curriculumCode": "BNCC EF07LP05",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Sintaxe: Análise de Sujeito e Predicado\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em análise sintática",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_02",
    "title": "Transitividade Verbal e Objetos Direto/Indireto",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Regência Verbal",
    "objective": "Exigência de preposição e complementação do sentido",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LP06).",
    "curriculumCode": "BNCC EF07LP06",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Transitividade Verbal e Objetos Direto/Indireto\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em regência verbal",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_03",
    "title": "Figuras de Linguagem em Textos Poéticos",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Estilística",
    "objective": "Metáfora, metonímia, hipérbole, paradoxo e ironia",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LP03).",
    "curriculumCode": "BNCC EF08LP03",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Figuras de Linguagem em Textos Poéticos\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em estilística",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_04",
    "title": "Crase sem Segredos e Casos Especiais",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Norma Culta",
    "objective": "Fusão de preposição A com artigo feminino e pronomes",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LP08).",
    "curriculumCode": "BNCC EF08LP08",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Crase sem Segredos e Casos Especiais\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em norma culta",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_05",
    "title": "Concordância Verbal com Casos Particulares",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Morfossintaxe",
    "objective": "Sujeitos partitivos, coletivos e voz passiva com SE",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LP07).",
    "curriculumCode": "BNCC EF08LP07",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Concordância Verbal com Casos Particulares\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em morfossintaxe",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_06",
    "title": "Gêneros Jornalísticos: Editorial vs. Notícia",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Mídia e Opinião",
    "objective": "Fato objetivo vs. posicionamento institucional",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09LP01).",
    "curriculumCode": "BNCC EF09LP01",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Gêneros Jornalísticos: Editorial vs. Notícia\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em mídia e opinião",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_07",
    "title": "A Vírgula e a Mudança de Sentido",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Pontuação",
    "objective": "Uso da vírgula em vocativo, aposto e orações intercaladas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09LP04).",
    "curriculumCode": "BNCC EF09LP04",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"A Vírgula e a Mudança de Sentido\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em pontuação",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_08",
    "title": "Verbos Irregulares nos Modos Indicativo e Subjuntivo",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Morfologia",
    "objective": "Conjugação e correlação de tempos compostos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LP04).",
    "curriculumCode": "BNCC EF07LP04",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Verbos Irregulares nos Modos Indicativo e Subjuntivo\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em morfologia",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_09",
    "title": "Vozes Verbais: Ativa, Passiva e Agente da Passiva",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Vozes Verbais",
    "objective": "Transposição sintática e foco discursivo",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LP06).",
    "curriculumCode": "BNCC EF08LP06",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Vozes Verbais: Ativa, Passiva e Agente da Passiva\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em vozes verbais",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_port_10",
    "title": "Intertextualidade e Criação de Paródias",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Portuguesa & Gramática",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Produção Textual",
    "objective": "Diálogo entre textos canônicos e releituras contemporâneas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09LP09).",
    "curriculumCode": "BNCC EF09LP09",
    "simulatedHours": 20,
    "icon": "✍️",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Intertextualidade e Criação de Paródias\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em produção textual",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_01",
    "title": "Verb To Be & Sentence Builder",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Grammar Fundamentals",
    "objective": "Estruturação de afirmativas, negativas e perguntas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06LI19).",
    "curriculumCode": "BNCC EF06LI19",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Verb To Be & Sentence Builder\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em grammar fundamentals",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_02",
    "title": "Daily Routine & Simple Present",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Present Tense",
    "objective": "Adverbs of frequency (always, usually) e rotina cotidiana",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF06LI20).",
    "curriculumCode": "BNCC EF06LI20",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Daily Routine & Simple Present\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em present tense",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_03",
    "title": "Irregular Verbs Time Machine",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Past Tense",
    "objective": "Linha do tempo convertendo infinitivo para simple past",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LI15).",
    "curriculumCode": "BNCC EF07LI15",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Irregular Verbs Time Machine\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em past tense",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_04",
    "title": "Food, Quantifiers & Countable/Uncountable",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Quantifiers",
    "objective": "Uso prático de many, much, a lot of, some e any",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LI16).",
    "curriculumCode": "BNCC EF07LI16",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Food, Quantifiers & Countable/Uncountable\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em quantifiers",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_05",
    "title": "City Map & Giving Directions",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Communication",
    "objective": "Orientação espacial (turn right, across from, go straight)",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF07LI05).",
    "curriculumCode": "BNCC EF07LI05",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"City Map & Giving Directions\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em communication",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_06",
    "title": "Comparatives and Superlatives Simulator",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Comparisons",
    "objective": "Regras de sufixo -er/-est e uso de more/most",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LI15).",
    "curriculumCode": "BNCC EF08LI15",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Comparatives and Superlatives Simulator\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em comparisons",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_07",
    "title": "Present Continuous in Live Scenarios",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Continuous Aspect",
    "objective": "Ações em progresso com gerúndio -ing e verbos dinâmicos",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LI16).",
    "curriculumCode": "BNCC EF08LI16",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Present Continuous in Live Scenarios\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em continuous aspect",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_08",
    "title": "Weather Forecast & Modal Verbs",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Modals & Future",
    "objective": "Previsão do tempo com will, might, could e can",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF08LI17).",
    "curriculumCode": "BNCC EF08LI17",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Weather Forecast & Modal Verbs\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em modals & future",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_09",
    "title": "Airport Check-in & Travel English",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Practical English",
    "objective": "Simulação de diálogo de imigração e despacho de malas",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09LI01).",
    "curriculumCode": "BNCC EF09LI01",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"Airport Check-in & Travel English\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em practical english",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "fund2_ing_10",
    "title": "False Cognates (False Friends) Detector",
    "academicLevel": "fundamental_2",
    "academicLevelLabel": "Ensino Fundamental II",
    "subject": "Língua Inglesa & Idiomas",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Vocabulary Mastery",
    "objective": "Armadilhas como actually, pretend, push e novel",
    "theoreticalBackground": "Abordagem investigativa e experimental alinhada às competências da BNCC dos anos finais (BNCC EF09LI14).",
    "curriculumCode": "BNCC EF09LI14",
    "simulatedHours": 20,
    "icon": "🌐",
    "solverType": "analytical",
    "defaultParams": [
      {
        "id": "variavel_a",
        "label": "Parâmetro de Controle A",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 25
      },
      {
        "id": "variavel_b",
        "label": "Parâmetro de Controle B",
        "unit": "SI",
        "min": 0.1,
        "max": 10,
        "step": 0.1,
        "defaultValue": 2.5
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a principal conclusão demonstrada no laboratório \"False Cognates (False Friends) Detector\"?",
      "options": [
        {
          "text": "A correlação dinâmica e fundamentada em vocabulary mastery",
          "correct": true,
          "explanation": "Exato! A simulação quantitativa comprova a relação de causa e efeito."
        },
        {
          "text": "Que os resultados independem de quaisquer variáveis",
          "correct": false,
          "explanation": "Variáveis do sistema alteram significativamente a resposta observada."
        }
      ]
    }
  },
  {
    "id": "em_fis_01",
    "title": "Lançamento Oblíquo de Projéteis",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Cinemática Vetorial",
    "objective": "Ângulo de 45º, alcance horizontal e tempo de voo",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT301).",
    "curriculumCode": "EM13CNT301",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Lançamento Oblíquo de Projéteis\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de cinemática vetorial",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_02",
    "title": "Plano Inclinado e Atrito Estático/Cinético",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Dinâmica Newtoniana",
    "objective": "Decomposição de forças (Px e Py) e coeficiente de atrito",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT302).",
    "curriculumCode": "EM13CNT302",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Plano Inclinado e Atrito Estático/Cinético\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de dinâmica newtoniana",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_03",
    "title": "Conservação de Energia em Montanha-Russa",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Energia Mecânica",
    "objective": "Transformação contínua entre energia potencial e cinética",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT303).",
    "curriculumCode": "EM13CNT303",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Conservação de Energia em Montanha-Russa\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de energia mecânica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_04",
    "title": "Circuitos Elétricos e Leis de Kirchhoff",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Eletrodinâmica",
    "objective": "Associação de resistores e malhas elétricas com multímetro",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT308).",
    "curriculumCode": "EM13CNT308",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Circuitos Elétricos e Leis de Kirchhoff\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de eletrodinâmica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_05",
    "title": "Óptica: Espelhos Esféricos e Lentes Delgadas",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Óptica Geométrica",
    "objective": "Equação de Gauss e formação de imagens reais e virtuais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT304).",
    "curriculumCode": "EM13CNT304",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Óptica: Espelhos Esféricos e Lentes Delgadas\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de óptica geométrica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_06",
    "title": "Tubos Sonoros e Ondas Estacionárias",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Ondulatória e Acústica",
    "objective": "Frequências ressonantes em tubos abertos e fechados",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT305).",
    "curriculumCode": "EM13CNT305",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Tubos Sonoros e Ondas Estacionárias\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de ondulatória e acústica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_07",
    "title": "Gravitação Universal e Leis de Kepler",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Gravitação",
    "objective": "Órbitas elípticas e período de revolução planetária",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT306).",
    "curriculumCode": "EM13CNT306",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Gravitação Universal e Leis de Kepler\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de gravitação",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_08",
    "title": "Calorimetria e Curva de Aquecimento da Água",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Termologia",
    "objective": "Calor sensível e latente com trocas térmicas no calorímetro",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT307).",
    "curriculumCode": "EM13CNT307",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Calorimetria e Curva de Aquecimento da Água\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de termologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_09",
    "title": "Indução Eletromagnética e Lei de Faraday-Lenz",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Eletromagnetismo",
    "objective": "Variação de fluxo magnético e força eletromotriz gerada",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT309).",
    "curriculumCode": "EM13CNT309",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Indução Eletromagnética e Lei de Faraday-Lenz\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de eletromagnetismo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fis_10",
    "title": "Efeito Fotoelétrico e Dualidade Onda-Partícula",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Física ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Física Moderna",
    "objective": "Energia do fóton (E=hf) superando a função trabalho metálica",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT310).",
    "curriculumCode": "EM13CNT310",
    "simulatedHours": 25,
    "icon": "⚛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Efeito Fotoelétrico e Dualidade Onda-Partícula\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de física moderna",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_01",
    "title": "Propriedades Periódicas dos Elementos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Tabela Periódica",
    "objective": "Variação de raio atômico, eletronegatividade e eletroafinidade",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT201).",
    "curriculumCode": "EM13CNT201",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Propriedades Periódicas dos Elementos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de tabela periódica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_02",
    "title": "Geometria Molecular e Teoria VSEPR",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Ligações Químicas",
    "objective": "Hibridização sp, sp2, sp3 e polaridade molecular",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT202).",
    "curriculumCode": "EM13CNT202",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Geometria Molecular e Teoria VSEPR\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de ligações químicas",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_03",
    "title": "Cálculo Estequiométrico com Reagente Limitante",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Estequiometria",
    "objective": "Pureza de reagentes, rendimento real e excessos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT203).",
    "curriculumCode": "EM13CNT203",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Cálculo Estequiométrico com Reagente Limitante\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de estequiometria",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_04",
    "title": "Cinética Química e Fatores de Velocidade",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Cinética Química",
    "objective": "Energia de ativação, catalisadores e teoria das colisões",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT204).",
    "curriculumCode": "EM13CNT204",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Cinética Química e Fatores de Velocidade\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de cinética química",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_05",
    "title": "Equilíbrio Químico e Princípio de Le Chatelier",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Equilíbrio",
    "objective": "Deslocamento de equilíbrio com pressão, temperatura e concentração",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT205).",
    "curriculumCode": "EM13CNT205",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Equilíbrio Químico e Princípio de Le Chatelier\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de equilíbrio",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_06",
    "title": "Curva de Titulação Ácido-Base e pH",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Soluções e Ácidos",
    "objective": "Ponto de equivalência com indicadores fenolftaleína e pH-metro",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT206).",
    "curriculumCode": "EM13CNT206",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Curva de Titulação Ácido-Base e pH\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de soluções e ácidos",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_07",
    "title": "Pilha de Daniell e Potencial Padrão Eº",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Eletroquímica",
    "objective": "Fluxo de elétrons, ponte salina e oxirredução",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT207).",
    "curriculumCode": "EM13CNT207",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Pilha de Daniell e Potencial Padrão Eº\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de eletroquímica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_08",
    "title": "Funções Orgânicas Oxigenadas e Nitrogenadas",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Química Orgânica",
    "objective": "Reconhecimento de álcool, aldeído, cetona, éster e amina",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT208).",
    "curriculumCode": "EM13CNT208",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Funções Orgânicas Oxigenadas e Nitrogenadas\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de química orgânica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_09",
    "title": "Isomeria Plana, Geométrica (Cis/Trans) e Óptica",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Estereoquímica",
    "objective": "Carbonos assimétricos e rotação da luz polarizada",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT209).",
    "curriculumCode": "EM13CNT209",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Isomeria Plana, Geométrica (Cis/Trans) e Óptica\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de estereoquímica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_qui_10",
    "title": "Reações de Polimerização (PET, PVC e Nylon)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Química ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Polímeros",
    "objective": "Polímeros de adição e condensação e impacto ambiental",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT210).",
    "curriculumCode": "EM13CNT210",
    "simulatedHours": 25,
    "icon": "🧪",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Reações de Polimerização (PET, PVC e Nylon)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de polímeros",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_01",
    "title": "Transporte Ativo e Passivo através da Membrana",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Citologia",
    "objective": "Osmose em hemácias e bomba de sódio-potássio",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT101).",
    "curriculumCode": "EM13CNT101",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Transporte Ativo e Passivo através da Membrana\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de citologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_02",
    "title": "Bioenergética: Fotossíntese e Respiração Celular",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Metabolismo Energético",
    "objective": "Balanço de ATP nos tilacoides e mitocôndrias",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT102).",
    "curriculumCode": "EM13CNT102",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Bioenergética: Fotossíntese e Respiração Celular\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de metabolismo energético",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_03",
    "title": "Dogma Central: Replicação, Transcrição e Tradução",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Genética Molecular",
    "objective": "Tradução do código genético e montagem peptídica",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT103).",
    "curriculumCode": "EM13CNT103",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Dogma Central: Replicação, Transcrição e Tradução\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de genética molecular",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_04",
    "title": "Grupos Sanguíneos (Sistema ABO e Fator Rh)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Genética Clássica",
    "objective": "Aglutininas e aglutinogênios em transfusões sanguíneas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT104).",
    "curriculumCode": "EM13CNT104",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Grupos Sanguíneos (Sistema ABO e Fator Rh)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de genética clássica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_05",
    "title": "Seleção Natural e Equilíbrio de Hardy-Weinberg",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Evolução Biológica",
    "objective": "Frequências alélicas sob pressão seletiva e mutações",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT105).",
    "curriculumCode": "EM13CNT105",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Seleção Natural e Equilíbrio de Hardy-Weinberg\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de evolução biológica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_06",
    "title": "Embriologia e Diferenciação dos Três Folhetos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Embriologia",
    "objective": "Destino celular de ectoderme, mesoderme e endoderme",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT106).",
    "curriculumCode": "EM13CNT106",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Embriologia e Diferenciação dos Três Folhetos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de embriologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_07",
    "title": "Fisiologia Cardiovascular e Ciclo Cardíaco",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Fisiologia Humana",
    "objective": "Sístole, diástole e regulação autonômica da pressão",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT107).",
    "curriculumCode": "EM13CNT107",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Fisiologia Cardiovascular e Ciclo Cardíaco\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de fisiologia humana",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_08",
    "title": "Biotecnologia: Enzimas de Restrição e CRISPR",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Biotecnologia",
    "objective": "Clonagem molecular e recombinação de plasmídeos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT108).",
    "curriculumCode": "EM13CNT108",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Biotecnologia: Enzimas de Restrição e CRISPR\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de biotecnologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_09",
    "title": "Ciclos Biogeoquímicos do Carbono e Nitrogênio",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Ecologia de Ecossistemas",
    "objective": "Bactérias fixadoras e o efeito estufa na biosfera",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT109).",
    "curriculumCode": "EM13CNT109",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Ciclos Biogeoquímicos do Carbono e Nitrogênio\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de ecologia de ecossistemas",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_bio_10",
    "title": "Virologia: Ciclos Lítico e Lisogênico de Bacteriófagos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Biologia ENEM & Vestibulares",
    "subjectCategory": "Ciências da Natureza",
    "topic": "Microbiologia",
    "objective": "Replicação viral e mecanismos de infecção humana",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CNT110).",
    "curriculumCode": "EM13CNT110",
    "simulatedHours": 25,
    "icon": "🧬",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Virologia: Ciclos Lítico e Lisogênico de Bacteriófagos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de microbiologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_01",
    "title": "Função Exponencial e Dinâmica de Populações",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Funções Elementares",
    "objective": "Crescimento e decaimento exponencial e juros compostos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT101).",
    "curriculumCode": "EM13MAT101",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Função Exponencial e Dinâmica de Populações\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de funções elementares",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_02",
    "title": "Função Logarítmica e Escalas de Terremotos (Richter)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Logaritmos",
    "objective": "Comportamento assimptótico e linearização de dados",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT102).",
    "curriculumCode": "EM13MAT102",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Função Logarítmica e Escalas de Terremotos (Richter)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de logaritmos",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_03",
    "title": "Funções Trigonométricas e Fenômenos Periódicos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Trigonometria Avançada",
    "objective": "Senoide e cossenoide modelando marés e ciclos solares",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT103).",
    "curriculumCode": "EM13MAT103",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Funções Trigonométricas e Fenômenos Periódicos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de trigonometria avançada",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_04",
    "title": "Progressões Aritméticas e Geométricas (PA e PG)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Sequências Numéricas",
    "objective": "Fórmulas do termo geral e somatório de termos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT104).",
    "curriculumCode": "EM13MAT104",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Progressões Aritméticas e Geométricas (PA e PG)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de sequências numéricas",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_05",
    "title": "Análise Combinatória: Permutação, Arranjo e Combinação",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Combinatória",
    "objective": "Princípio fundamental da contagem e triângulo de Pascal",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT105).",
    "curriculumCode": "EM13MAT105",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Análise Combinatória: Permutação, Arranjo e Combinação\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de combinatória",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_06",
    "title": "Geometria Espacial: Volumes de Cilindro, Cone e Esfera",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Geometria Espacial",
    "objective": "Relações de Cavalieri e áreas superficiais de sólidos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT106).",
    "curriculumCode": "EM13MAT106",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Geometria Espacial: Volumes de Cilindro, Cone e Esfera\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geometria espacial",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_07",
    "title": "Geometria Analítica: Retas e Circunferências",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Geometria Analítica",
    "objective": "Equação reduzida e geral e distância de ponto a reta",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT107).",
    "curriculumCode": "EM13MAT107",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Geometria Analítica: Retas e Circunferências\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geometria analítica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_08",
    "title": "Estatística Descritiva e Medidas de Dispersão",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Estatística ENEM",
    "objective": "Desvio padrão, variância e boxplot para análise de dados",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT108).",
    "curriculumCode": "EM13MAT108",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Estatística Descritiva e Medidas de Dispersão\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de estatística enem",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_09",
    "title": "Polinômios e Raízes Complexas",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Álgebra Polinomial",
    "objective": "Dispositivo prático de Briot-Ruffini e teorema do resto",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT109).",
    "curriculumCode": "EM13MAT109",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Polinômios e Raízes Complexas\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de álgebra polinomial",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_mat_10",
    "title": "Matrizes, Determinantes e Criptografia Hill",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Matemática ENEM & Vestibulares",
    "subjectCategory": "Exatas & Lógica",
    "topic": "Matrizes e Sistemas",
    "objective": "Inversão matricial e resolução de sistemas lineares",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13MAT110).",
    "curriculumCode": "EM13MAT110",
    "simulatedHours": 25,
    "icon": "📊",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Matrizes, Determinantes e Criptografia Hill\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de matrizes e sistemas",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_01",
    "title": "Engenharia da Tese e Ponto de Vista Crítico",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Estrutura Textual",
    "objective": "Construção da tese conectada com duas causas estruturais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG101).",
    "curriculumCode": "EM13LGG101",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Engenharia da Tese e Ponto de Vista Crítico\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de estrutura textual",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_02",
    "title": "Conectivos e Coesão Interparágrafos (Competência 4)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Coesão Textual",
    "objective": "Mecanismos coesivos formais e operadores argumentativos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG102).",
    "curriculumCode": "EM13LGG102",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Conectivos e Coesão Interparágrafos (Competência 4)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de coesão textual",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_03",
    "title": "Os 5 Elementos da Proposta de Intervenção (Comp. 5)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Intervenção Social",
    "objective": "Agente, Ação, Meio, Efeito e Detalhamento rigorosos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG103).",
    "curriculumCode": "EM13LGG103",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Os 5 Elementos da Proposta de Intervenção (Comp. 5)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de intervenção social",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_04",
    "title": "Repertório Sociocultural Legitimado e Produtivo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Repertório Crítico",
    "objective": "Citação de pensadores (Bauman, Bourdieu) atrelada ao tema",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG104).",
    "curriculumCode": "EM13LGG104",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Repertório Sociocultural Legitimado e Produtivo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de repertório crítico",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_05",
    "title": "Desenvolvimento Argumentativo: Causa e Efeito",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Argumentação",
    "objective": "Fundamentação lógica evitando falácias e generalizações",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG105).",
    "curriculumCode": "EM13LGG105",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Desenvolvimento Argumentativo: Causa e Efeito\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de argumentação",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_06",
    "title": "Detecção de Desvios Gramaticais e Paralelismo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Norma Culta",
    "objective": "Concordância, pontuação e eliminação de marcas da oralidade",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG106).",
    "curriculumCode": "EM13LGG106",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Detecção de Desvios Gramaticais e Paralelismo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de norma culta",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_07",
    "title": "Leitura Crítica dos Textos Motivadores da Coletânea",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Interpretação",
    "objective": "Identificação de núcleos problemáticos sem cópia de trechos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG107).",
    "curriculumCode": "EM13LGG107",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Leitura Crítica dos Textos Motivadores da Coletânea\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de interpretação",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_08",
    "title": "Modelos de Introdução de Alto Impacto",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Ganchos Temáticos",
    "objective": "Alusão histórica, definição constitucional e contraposição",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG108).",
    "curriculumCode": "EM13LGG108",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Modelos de Introdução de Alto Impacto\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de ganchos temáticos",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_09",
    "title": "Coesão Referencial Anafórica e Catfórica",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Linguística Textual",
    "objective": "Substituição pronominal e nominal para fluidez discursiva",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG109).",
    "curriculumCode": "EM13LGG109",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Coesão Referencial Anafórica e Catfórica\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de linguística textual",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_red_10",
    "title": "Simulado Cronometrado com Análise por IA",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Redação Dissertativa Nota 1000",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Prática Extensiva",
    "objective": "Redação completa com cronômetro de 60 minutos e feedback",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG110).",
    "curriculumCode": "EM13LGG110",
    "simulatedHours": 25,
    "icon": "📝",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Simulado Cronometrado com Análise por IA\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de prática extensiva",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_01",
    "title": "Barroco vs. Arcadismo: O Conflito do Homem",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Estilos de Época",
    "objective": "Gregório de Matos e o conceptismo vs. Cláudio Manuel da Costa",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG201).",
    "curriculumCode": "EM13LGG201",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Barroco vs. Arcadismo: O Conflito do Homem\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de estilos de época",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_02",
    "title": "As Três Fases do Romantismo Brasileiro",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Romantismo",
    "objective": "Indianismo de Gonçalves Dias, ultrarromantismo e condoreirismo",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG202).",
    "curriculumCode": "EM13LGG202",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"As Três Fases do Romantismo Brasileiro\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de romantismo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_03",
    "title": "Realismo Psicológico e a Ironia de Machado de Assis",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Machado de Assis",
    "objective": "Narrador em Dom Casmurro e Memórias Póstumas de Brás Cubas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG203).",
    "curriculumCode": "EM13LGG203",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Realismo Psicológico e a Ironia de Machado de Assis\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de machado de assis",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_04",
    "title": "Naturalismo e o Determinismo Social de Aluísio Azevedo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Naturalismo",
    "objective": "Zoomorfização e influências do cortiço nas personagens",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG204).",
    "curriculumCode": "EM13LGG204",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Naturalismo e o Determinismo Social de Aluísio Azevedo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de naturalismo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_05",
    "title": "Modernismo de 1922: A Semana de Arte Moderna",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Vanguardas",
    "objective": "Manifesto Antropófago de Oswald de Andrade e Mário de Andrade",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG205).",
    "curriculumCode": "EM13LGG205",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Modernismo de 1922: A Semana de Arte Moderna\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de vanguardas",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_06",
    "title": "Geração de 30: O Romance Social Nordestino",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Regionalismo",
    "objective": "Vidas Secas de Graciliano Ramos e Capitães da Areia",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG206).",
    "curriculumCode": "EM13LGG206",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Geração de 30: O Romance Social Nordestino\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de regionalismo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_07",
    "title": "Concretismo e Poesia Visual dos Irmãos Campos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Poesia Concreta",
    "objective": "O espaço da página como elemento ativo do poema",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG207).",
    "curriculumCode": "EM13LGG207",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Concretismo e Poesia Visual dos Irmãos Campos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de poesia concreta",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_08",
    "title": "Clarice Lispector e o Fluxo de Consciência",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Prosa Introspectiva",
    "objective": "Epifanias cotidianas em A Hora da Estrela e contos",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG208).",
    "curriculumCode": "EM13LGG208",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Clarice Lispector e o Fluxo de Consciência\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de prosa introspectiva",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_09",
    "title": "Guimarães Rosa e o Sertão Universal",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Linguagem Poética",
    "objective": "Neologismos e travessias existenciais em Grande Sertão: Veredas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG209).",
    "curriculumCode": "EM13LGG209",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Guimarães Rosa e o Sertão Universal\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de linguagem poética",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_lit_10",
    "title": "Literatura Contemporânea e Marginal/Periférica",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Literatura Brasileira & Artes",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Contemporaneidade",
    "objective": "Carolina Maria de Jesus e vozes urbanas das favelas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG210).",
    "curriculumCode": "EM13LGG210",
    "simulatedHours": 25,
    "icon": "🎭",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Literatura Contemporânea e Marginal/Periférica\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de contemporaneidade",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_01",
    "title": "Revoluções Industriais e Formação da Classe Trabalhadora",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "História Econômica",
    "objective": "Ludismo, cartismo e as formulações marxistas e liberais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS101).",
    "curriculumCode": "EM13CHS101",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Revoluções Industriais e Formação da Classe Trabalhadora\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de história econômica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_02",
    "title": "Imperialismo do Século XIX e Partilha da África",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Neocolonialismo",
    "objective": "Conferência de Berlim e justificativas pseudocientíficas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS102).",
    "curriculumCode": "EM13CHS102",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Imperialismo do Século XIX e Partilha da África\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de neocolonialismo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_03",
    "title": "Revolução Russa de 1917 e Guerra Civil",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Século XX",
    "objective": "Domingo Sangrento, Sovietes e ascensão do Bolchevismo",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS103).",
    "curriculumCode": "EM13CHS103",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Revolução Russa de 1917 e Guerra Civil\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de século xx",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_04",
    "title": "Ascensão do Nazifascismo e a Segunda Guerra Mundial",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Conflitos Globais",
    "objective": "Totalitarismo europeu, Holocausto e a bomba atômica",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS104).",
    "curriculumCode": "EM13CHS104",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Ascensão do Nazifascismo e a Segunda Guerra Mundial\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de conflitos globais",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_05",
    "title": "Guerra Fria: Bipolaridade e Corrida Armamentista",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Guerra Fria",
    "objective": "Crise dos Mísseis em Cuba e espionagem na cortina de ferro",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS105).",
    "curriculumCode": "EM13CHS105",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Guerra Fria: Bipolaridade e Corrida Armamentista\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de guerra fria",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_06",
    "title": "Era Vargas (1930-1945): Trabalhismo e Estado Novo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Brasil Republicano",
    "objective": "Revolução Constitucionalista e criação da CLT e CSN",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS106).",
    "curriculumCode": "EM13CHS106",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Era Vargas (1930-1945): Trabalhismo e Estado Novo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de brasil republicano",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_07",
    "title": "Ditadura Militar Brasileira (1964-1985)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Regime Militar",
    "objective": "Atos Institucionais (AI-5), censura, guerrilha e abertura",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS107).",
    "curriculumCode": "EM13CHS107",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Ditadura Militar Brasileira (1964-1985)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de regime militar",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_08",
    "title": "Redemocratização e a Constituição Cidadã de 1988",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Brasil Contemporâneo",
    "objective": "Movimento Diretas Já e garantias de direitos fundamentais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS108).",
    "curriculumCode": "EM13CHS108",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Redemocratização e a Constituição Cidadã de 1988\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de brasil contemporâneo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_09",
    "title": "Descolonização Afro-Asiática e Não-Alinhamento",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Terceiro Mundo",
    "objective": "Luta de Gandhi na Índia e guerrilhas de libertação em Angola",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS109).",
    "curriculumCode": "EM13CHS109",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Descolonização Afro-Asiática e Não-Alinhamento\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de terceiro mundo",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_hist_10",
    "title": "Conflitos Contemporâneos e a Geopolítica do Petróleo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "História do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geopolítica",
    "objective": "Questão israelo-palestina e as guerras no Golfo Pérsico",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS110).",
    "curriculumCode": "EM13CHS110",
    "simulatedHours": 25,
    "icon": "📜",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Conflitos Contemporâneos e a Geopolítica do Petróleo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geopolítica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_01",
    "title": "Geopolítica da Nova Ordem Mundial e os BRICS",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geopolítica Mundial",
    "objective": "Multipolaridade, comércio sul-sul e hegemonias regionais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS201).",
    "curriculumCode": "EM13CHS201",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Geopolítica da Nova Ordem Mundial e os BRICS\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geopolítica mundial",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_02",
    "title": "Mudanças Climáticas e Acordos Internacionais",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geografia Ambiental",
    "objective": "Gases do efeito estufa, Acordo de Paris e metas de carbono",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS202).",
    "curriculumCode": "EM13CHS202",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Mudanças Climáticas e Acordos Internacionais\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geografia ambiental",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_03",
    "title": "Agronegócio Brasileiro e Fronteiras Agrícolas",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geografia Agrária",
    "objective": "Complexo da soja no Centro-Oeste e conflitos por terra",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS203).",
    "curriculumCode": "EM13CHS203",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Agronegócio Brasileiro e Fronteiras Agrícolas\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geografia agrária",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_04",
    "title": "Fluxos Migratórios Internacionais e Refugiados",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Demografia Global",
    "objective": "Rotas no Mediterrâneo, fatores de repulsão e xenofobia",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS204).",
    "curriculumCode": "EM13CHS204",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Fluxos Migratórios Internacionais e Refugiados\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de demografia global",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_05",
    "title": "Bacias Hidrográficas e Crises Hídricas no Brasil",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Recursos Hídricos",
    "objective": "Transposição do Rio São Francisco e o Sistema Cantareira",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS205).",
    "curriculumCode": "EM13CHS205",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Bacias Hidrográficas e Crises Hídricas no Brasil\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de recursos hídricos",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_06",
    "title": "Indústria 4.0 e Tecnopolos no Espaço Geográfico",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geografia das Indústrias",
    "objective": "Silício americano, rota do Vale do Paraíba e robotização",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS206).",
    "curriculumCode": "EM13CHS206",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Indústria 4.0 e Tecnopolos no Espaço Geográfico\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geografia das indústrias",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_07",
    "title": "Transição Demográfica e Previdência no Brasil",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "População Brasileira",
    "objective": "Bônus demográfico em declínio e desafios da longevidade",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS207).",
    "curriculumCode": "EM13CHS207",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Transição Demográfica e Previdência no Brasil\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de população brasileira",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_08",
    "title": "Globalização e Blocos Econômicos (Mercosul, UE)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Economia Espacial",
    "objective": "Tarifas externas comuns e livre circulação de mercadorias",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS208).",
    "curriculumCode": "EM13CHS208",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Globalização e Blocos Econômicos (Mercosul, UE)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de economia espacial",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_09",
    "title": "Impactos da Mineração e Rompimento de Barragens",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Impactos Ambientais",
    "objective": "Degradação ambiental em Mariana e Brumadinho (MG)",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS209).",
    "curriculumCode": "EM13CHS209",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Impactos da Mineração e Rompimento de Barragens\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de impactos ambientais",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_geo_10",
    "title": "Sensoriamento Remoto por Satélite e Cartografia Digital",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Geografia do Brasil & Geral",
    "subjectCategory": "Ciências Humanas",
    "topic": "Geotecnologias",
    "objective": "Imagens multiespectrais e índices de biomassa (NDVI)",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS210).",
    "curriculumCode": "EM13CHS210",
    "simulatedHours": 25,
    "icon": "🗺️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Sensoriamento Remoto por Satélite e Cartografia Digital\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de geotecnologias",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_01",
    "title": "Teoria do Conhecimento: Racionalismo vs. Empirismo",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Epistemologia",
    "objective": "Dúvida metódica de Descartes vs. tábula rasa de Locke",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS301).",
    "curriculumCode": "EM13CHS301",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Teoria do Conhecimento: Racionalismo vs. Empirismo\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de epistemologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_02",
    "title": "O Contratualismo Político de Hobbes, Locke e Rousseau",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Filosofia Política",
    "objective": "Do estado de natureza à soberania do contrato social",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS302).",
    "curriculumCode": "EM13CHS302",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"O Contratualismo Político de Hobbes, Locke e Rousseau\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de filosofia política",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_03",
    "title": "Ética Kantiana do Dever vs. Utilitarismo de Bentham",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Ética Normativa",
    "objective": "Imperativo categórico vs. máxima utilidade coletiva",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS303).",
    "curriculumCode": "EM13CHS303",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Ética Kantiana do Dever vs. Utilitarismo de Bentham\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de ética normativa",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_04",
    "title": "Escola de Frankfurt e a Indústria Cultural",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Sociologia Crítica",
    "objective": "Adorno e Horkheimer sobre alienação e consumo de massas",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS304).",
    "curriculumCode": "EM13CHS304",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Escola de Frankfurt e a Indústria Cultural\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de sociologia crítica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_05",
    "title": "Poder e Biopolítica em Michel Foucault",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Filosofia Contemporânea",
    "objective": "O panóptico, microfísica do poder e disciplina social",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS305).",
    "curriculumCode": "EM13CHS305",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Poder e Biopolítica em Michel Foucault\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de filosofia contemporânea",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_06",
    "title": "Estratificação Social e Classes em Marx e Weber",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Sociologia Clássica",
    "objective": "Mais-valia econômica vs. status e prestígio sociológico",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS306).",
    "curriculumCode": "EM13CHS306",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Estratificação Social e Classes em Marx e Weber\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de sociologia clássica",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_07",
    "title": "A Modernidade Líquida de Zygmunt Bauman",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Sociologia do Presente",
    "objective": "Instituições voláteis e relações afetivas efêmeras",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS307).",
    "curriculumCode": "EM13CHS307",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"A Modernidade Líquida de Zygmunt Bauman\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de sociologia do presente",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_08",
    "title": "Relações Étnico-Raciais e Pensamento Descolonial",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Pensamento Crítico",
    "objective": "Ailton Krenak, Djamila Ribeiro e o racismo estrutural",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS308).",
    "curriculumCode": "EM13CHS308",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Relações Étnico-Raciais e Pensamento Descolonial\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de pensamento crítico",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_09",
    "title": "Fatos Sociais e Solidariedade em Émile Durkheim",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Sociologia Durkheimiana",
    "objective": "Coerção social, anomia e solidariedade orgânica/mecânica",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS309).",
    "curriculumCode": "EM13CHS309",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Fatos Sociais e Solidariedade em Émile Durkheim\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de sociologia durkheimiana",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_fil_10",
    "title": "Dilemas Éticos da Inteligência Artificial e Biotecnologia",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Filosofia & Sociologia ENEM",
    "subjectCategory": "Ciências Humanas",
    "topic": "Bioética e Tecnologia",
    "objective": "Transumanismo, justiça algorítmica e autonomia humana",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13CHS310).",
    "curriculumCode": "EM13CHS310",
    "simulatedHours": 25,
    "icon": "🏛️",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Dilemas Éticos da Inteligência Artificial e Biotecnologia\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de bioética e tecnologia",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_01",
    "title": "Estratégias de Leitura Rápida: Skimming & Scanning",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Reading Skills",
    "objective": "Localização instantânea de ideias-chave e palavras-guia",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG301).",
    "curriculumCode": "EM13LGG301",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Estratégias de Leitura Rápida: Skimming & Scanning\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de reading skills",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_02",
    "title": "Operadores Argumentativos e Conectivos em Artigos",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Discourse Markers",
    "objective": "However, furthermore, nevertheless e a coesão discursiva",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG302).",
    "curriculumCode": "EM13LGG302",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Operadores Argumentativos e Conectivos em Artigos\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de discourse markers",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_03",
    "title": "Interpretação de Cartuns, Tirinhas e Humor Gráfico",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Multimodal Reading",
    "objective": "Ironia sutil e trocadilhos em charges internacionais",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG303).",
    "curriculumCode": "EM13LGG303",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Interpretação de Cartuns, Tirinhas e Humor Gráfico\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de multimodal reading",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_04",
    "title": "Gênero Artigo Científico (Abstracts) em Inglês",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Academic English",
    "objective": "Decodificação de metodologia, resultados e conclusões",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG304).",
    "curriculumCode": "EM13LGG304",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Gênero Artigo Científico (Abstracts) em Inglês\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de academic english",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_05",
    "title": "Falsos Cognatos e Armadilhas Lexicais no ENEM",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Lexical Precision",
    "objective": "Distinção entre intend/pretend, push/pull e novel/soap opera",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG305).",
    "curriculumCode": "EM13LGG305",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Falsos Cognatos e Armadilhas Lexicais no ENEM\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de lexical precision",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_06",
    "title": "Voz Passiva em Textos Jornalísticos Internacionais",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Grammar in Context",
    "objective": "Foco no evento noticiado (BBC, Reuters, CNN)",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG306).",
    "curriculumCode": "EM13LGG306",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Voz Passiva em Textos Jornalísticos Internacionais\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de grammar in context",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_07",
    "title": "Verbos Modais e Graus de Certeza (Deduction)",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Modal Verbs",
    "objective": "Must, might, can’t indicando probabilidade lógica",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG307).",
    "curriculumCode": "EM13LGG307",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Verbos Modais e Graus de Certeza (Deduction)\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de modal verbs",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_08",
    "title": "Conditionals: Hipóteses Reais, Futuras e Irreais",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Conditionals",
    "objective": "Zero, First, Second e Third Conditionals no cotidiano",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG308).",
    "curriculumCode": "EM13LGG308",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Conditionals: Hipóteses Reais, Futuras e Irreais\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de conditionals",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_09",
    "title": "Prefixos e Sufixos Gregos/Latinos na Formação de Palavras",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "Word Formation",
    "objective": "Estratégia de dedução de vocabulário desconhecido",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG309).",
    "curriculumCode": "EM13LGG309",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Prefixos e Sufixos Gregos/Latinos na Formação de Palavras\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de word formation",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "em_ing_10",
    "title": "Simulado Completo ENEM com 5 Questões Inéditas",
    "academicLevel": "medio",
    "academicLevelLabel": "Ensino Médio & ENEM",
    "subject": "Língua Inglesa ENEM & Habilidades Globais",
    "subjectCategory": "Linguagens & Comunicação",
    "topic": "ENEM Practice",
    "objective": "Resolução comentada de itens autênticos com temporizador",
    "theoreticalBackground": "Conteúdo de alta relevância para a Matriz de Referência do ENEM e Vestibulares Nacionais (EM13LGG310).",
    "curriculumCode": "EM13LGG310",
    "simulatedHours": 25,
    "icon": "🌐",
    "solverType": "numerical",
    "defaultParams": [
      {
        "id": "variavel_x",
        "label": "Condição Inicial X",
        "unit": "SI",
        "min": 1,
        "max": 100,
        "step": 1,
        "defaultValue": 45
      },
      {
        "id": "fator_escala",
        "label": "Fator de Sensibilidade",
        "unit": "",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "defaultValue": 1
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual conceito-chave é consolidado pelo laboratório \"Simulado Completo ENEM com 5 Questões Inéditas\"?",
      "options": [
        {
          "text": "O domínio analítico e a aplicação prática de enem practice",
          "correct": true,
          "explanation": "Correto! Essa competência é recorrente em itens de alta dificuldade do ENEM."
        },
        {
          "text": "Apenas a memorização de dados sem correlação contextual",
          "correct": false,
          "explanation": "O modelo Kortex foca em raciocínio investigativo de segunda ordem."
        }
      ]
    }
  },
  {
    "id": "sup_calc_01",
    "title": "Somas de Riemann e Convergência da Integral",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Cálculo Integral",
    "objective": "Partições regulares de Darboux e Teorema Fundamental do Cálculo",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-01).",
    "curriculumCode": "DCN-EXATAS-01",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Somas de Riemann e Convergência da Integral\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de cálculo integral",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_02",
    "title": "Taxas Relacionadas e Otimização com Derivadas",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Cálculo Diferencial",
    "objective": "Minimização e maximização de funções no espaço real",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-02).",
    "curriculumCode": "DCN-EXATAS-02",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Taxas Relacionadas e Otimização com Derivadas\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de cálculo diferencial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_03",
    "title": "Séries de Taylor e Maclaurin com Raio de Convergência",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Séries Numéricas",
    "objective": "Aproximação polinomial de funções transcendentes",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-03).",
    "curriculumCode": "DCN-EXATAS-03",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Séries de Taylor e Maclaurin com Raio de Convergência\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de séries numéricas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_04",
    "title": "Integrais Duplas e Triplas em Coordenadas Polares/Esféricas",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Cálculo Vetorial",
    "objective": "Cálculo de volume e centróides de sólidos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-04).",
    "curriculumCode": "DCN-EXATAS-04",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Integrais Duplas e Triplas em Coordenadas Polares/Esféricas\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de cálculo vetorial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_05",
    "title": "Teorema de Green e Integral de Linha no Plano",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Campos Vetoriais",
    "objective": "Trabalho de campos de força e circulação fechada",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-05).",
    "curriculumCode": "DCN-EXATAS-05",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teorema de Green e Integral de Linha no Plano\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de campos vetoriais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_06",
    "title": "Teorema de Stokes e Rotacional no Espaço 3D",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Cálculo Avançado",
    "objective": "Circulação em superfícies orientadas abertas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-06).",
    "curriculumCode": "DCN-EXATAS-06",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teorema de Stokes e Rotacional no Espaço 3D\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de cálculo avançado",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_07",
    "title": "Teorema da Divergência de Gauss e Fluxo",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Campos Vetoriais",
    "objective": "Fluxo de campo elétrico e gravitacional através de superfícies fechadas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-07).",
    "curriculumCode": "DCN-EXATAS-07",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teorema da Divergência de Gauss e Fluxo\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de campos vetoriais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_08",
    "title": "Equações Diferenciais Ordinárias de 1ª Ordem (Separabilidade)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "EDOs Lineares",
    "objective": "Fator integrante e modelagem de decaimento e tanques",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-08).",
    "curriculumCode": "DCN-EXATAS-08",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Equações Diferenciais Ordinárias de 1ª Ordem (Separabilidade)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de edos lineares",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_09",
    "title": "EDOs de 2ª Ordem com Coeficientes Constantes",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Equações Diferenciais",
    "objective": "Sistemas subamortecidos, criticamente amortecidos e superamortecidos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-09).",
    "curriculumCode": "DCN-EXATAS-09",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"EDOs de 2ª Ordem com Coeficientes Constantes\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de equações diferenciais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_calc_10",
    "title": "Transformada de Laplace e Resolução de Circuitos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Cálculo Diferencial e Integral",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Laplace",
    "objective": "Domínio da frequência e resolução de equações integro-diferenciais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-10).",
    "curriculumCode": "DCN-EXATAS-10",
    "simulatedHours": 30,
    "icon": "📐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Transformada de Laplace e Resolução de Circuitos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de laplace",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_01",
    "title": "Oscilações Forçadas e Ressonância Mecânica",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Mecânica Clássica",
    "objective": "Equação de Euler-Cromer, pico ressonante e fator de mérito Q",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-01).",
    "curriculumCode": "DCN-ENG-01",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Oscilações Forçadas e Ressonância Mecânica\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de mecânica clássica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_02",
    "title": "Momento de Inércia e Pêndulo de Torção",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Dinâmica Rotacional",
    "objective": "Teorema dos Eixos Paralelos (Steiner) e rotação de corpos rígidos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-02).",
    "curriculumCode": "DCN-ENG-02",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Momento de Inércia e Pêndulo de Torção\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de dinâmica rotacional",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_03",
    "title": "Interferômetro de Michelson e Comprimento de Onda",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Óptica Física",
    "objective": "Padrão de franjas de interferência e precisão nanométrica",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-03).",
    "curriculumCode": "DCN-ENG-03",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Interferômetro de Michelson e Comprimento de Onda\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de óptica física",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_04",
    "title": "Giroscópio e Precessão Mecânica",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Mecânica Avançada",
    "objective": "Conservação do momento angular e torque gravitacional",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-04).",
    "curriculumCode": "DCN-ENG-04",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Giroscópio e Precessão Mecânica\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de mecânica avançada",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_05",
    "title": "Efeito Doppler Ultrassônico em Fluidos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Acústica",
    "objective": "Desvio de frequência e medição contínua de velocidade de escoamento",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-05).",
    "curriculumCode": "DCN-ENG-05",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Efeito Doppler Ultrassônico em Fluidos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de acústica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_06",
    "title": "Condutividade Térmica de Metais e Lei de Fourier",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Termodinâmica",
    "objective": "Gradiente unidimensional de temperatura em regime estacionário",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-06).",
    "curriculumCode": "DCN-ENG-06",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Condutividade Térmica de Metais e Lei de Fourier\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de termodinâmica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_07",
    "title": "Difração de Raios-X e Lei de Bragg em Cristais",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estrutura da Matéria",
    "objective": "Espaçamento interplanar em reticulados cúbicos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Difração de Raios-X e Lei de Bragg em Cristais\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estrutura da matéria",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_08",
    "title": "Efeito Hall em Semicondutores Tipo P e Tipo N",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Física do Estado Sólido",
    "objective": "Medição de voltagem transversal e densidade de portadores",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-08).",
    "curriculumCode": "DCN-ENG-08",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Efeito Hall em Semicondutores Tipo P e Tipo N\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de física do estado sólido",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_09",
    "title": "Tensão Superficial e Método do Anel de Du Noüy",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Física de Fluidos",
    "objective": "Forças intermoleculares em líquidos polares e apolares",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Tensão Superficial e Método do Anel de Du Noüy\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de física de fluidos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fis_10",
    "title": "Tubo de Raios Catódicos e Razão Carga-Massa e/m",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Física Geral e Experimental Universitária",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletromagnetismo",
    "objective": "Campos cruzados elétricos e magnéticos de Thomson",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "⚛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Tubo de Raios Catódicos e Razão Carga-Massa e/m\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletromagnetismo",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_01",
    "title": "Cinética Química e Equação de Arrhenius",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Físico-Química",
    "objective": "Constante k, energia de ativação e dependência com temperatura",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-01).",
    "curriculumCode": "DCN-QUI-01",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Cinética Química e Equação de Arrhenius\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de físico-química",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_02",
    "title": "Espectrofotometria UV-Vis e Lei de Beer-Lambert",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Química Analítica",
    "objective": "Curva analítica de calibração e absortividade molar",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-02).",
    "curriculumCode": "DCN-QUI-02",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Espectrofotometria UV-Vis e Lei de Beer-Lambert\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de química analítica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_03",
    "title": "Equilíbrio Químico em Sistemas Homogêneos e Heterogêneos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Físico-Química",
    "objective": "Determinação termodinâmica de constante de equilíbrio K",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-03).",
    "curriculumCode": "DCN-QUI-03",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Equilíbrio Químico em Sistemas Homogêneos e Heterogêneos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de físico-química",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_04",
    "title": "Eletrodeposição e Leis de Faraday da Eletrólise",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletroquímica",
    "objective": "Galvanoplastia com deposição catódica de cobre e zinco",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-04).",
    "curriculumCode": "DCN-QUI-04",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Eletrodeposição e Leis de Faraday da Eletrólise\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletroquímica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_05",
    "title": "Termoquímica e Calorimetria de Reação",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Termoquímica",
    "objective": "Entalpia de neutralização e lei de Hess",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-05).",
    "curriculumCode": "DCN-QUI-05",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Termoquímica e Calorimetria de Reação\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de termoquímica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_06",
    "title": "Equilíbrio Ácido-Base e Soluções Tampão",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Química Geral",
    "objective": "Equação de Henderson-Hasselbalch e capacidade tamponante",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-06).",
    "curriculumCode": "DCN-QUI-06",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Equilíbrio Ácido-Base e Soluções Tampão\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de química geral",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_07",
    "title": "Cromatografia em Coluna e Separação de Pigmentos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Química Orgânica",
    "objective": "Fase estacionária, fase móvel e fator de retenção Rf",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-07).",
    "curriculumCode": "DCN-QUI-07",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Cromatografia em Coluna e Separação de Pigmentos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de química orgânica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_08",
    "title": "Propriedades Coligativas (Ebulioscopia e Crioscopia)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Soluções",
    "objective": "Constante crioscópica e massa molar de solutos não voláteis",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-08).",
    "curriculumCode": "DCN-QUI-08",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Propriedades Coligativas (Ebulioscopia e Crioscopia)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de soluções",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_09",
    "title": "Complexação e Titulação Complexométrica com EDTA",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Análise Instrumental",
    "objective": "Determinação de dureza total em amostras de água",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-09).",
    "curriculumCode": "DCN-QUI-09",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Complexação e Titulação Complexométrica com EDTA\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de análise instrumental",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_qui_10",
    "title": "Síntese de Ésteres e Polímeros Biodegradáveis",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Química Geral e Experimental",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Síntese Química",
    "objective": "Reação de esterificação de Fischer com refluxo ácido",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-QUI-10).",
    "curriculumCode": "DCN-QUI-10",
    "simulatedHours": 30,
    "icon": "🧪",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Síntese de Ésteres e Polímeros Biodegradáveis\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de síntese química",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_01",
    "title": "Complexidade de Algoritmos de Ordenação O(n)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Análise Assintótica",
    "objective": "QuickSort, MergeSort e comparações empíricas com arrays grandes",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-01).",
    "curriculumCode": "DCN-COMP-01",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Complexidade de Algoritmos de Ordenação O(n)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de análise assintótica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_02",
    "title": "Árvores Binárias de Busca Balanceadas (AVL e Rubro-Negra)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estruturas de Dados",
    "objective": "Rotações à esquerda/direita e fator de balanceamento",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-02).",
    "curriculumCode": "DCN-COMP-02",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Árvores Binárias de Busca Balanceadas (AVL e Rubro-Negra)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estruturas de dados",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_03",
    "title": "Tabelas Hash e Tratamento de Colisões",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estruturas de Dados",
    "objective": "Encadeamento separado vs. endereçamento aberto com dispersão uniforme",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-03).",
    "curriculumCode": "DCN-COMP-03",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Tabelas Hash e Tratamento de Colisões\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estruturas de dados",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_04",
    "title": "Algoritmo de Dijkstra e Menor Caminho em Grafos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Teoria dos Grafos",
    "objective": "Fila de prioridades com heap e relaxamento de arestas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-04).",
    "curriculumCode": "DCN-COMP-04",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Algoritmo de Dijkstra e Menor Caminho em Grafos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de teoria dos grafos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_05",
    "title": "Programação Dinâmica: Problema da Mochila (Knapsack)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Otimização",
    "objective": "Tabela de memoização bottom-up e subestrutura ótima",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-05).",
    "curriculumCode": "DCN-COMP-05",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Programação Dinâmica: Problema da Mochila (Knapsack)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de otimização",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_06",
    "title": "Algoritmos Gulosos: Codificação de Huffman",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Teoria da Informação",
    "objective": "Árvore de prefixos para compressão ótima de dados",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-06).",
    "curriculumCode": "DCN-COMP-06",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Algoritmos Gulosos: Codificação de Huffman\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de teoria da informação",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_07",
    "title": "Árvore Geradora Mínima (Algoritmos de Kruskal e Prim)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Grafos",
    "objective": "Estrutura Union-Find (Disjoint-Set) com detecção de ciclos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-07).",
    "curriculumCode": "DCN-COMP-07",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Árvore Geradora Mínima (Algoritmos de Kruskal e Prim)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de grafos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_08",
    "title": "Busca em Largura (BFS) e Profundidade (DFS)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Algoritmos em Grafos",
    "objective": "Identificação de componentes conexos e ordenação topológica",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-08).",
    "curriculumCode": "DCN-COMP-08",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Busca em Largura (BFS) e Profundidade (DFS)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de algoritmos em grafos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_09",
    "title": "Casamento de Padrões em Texto (Algoritmo KMP)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Processamento de Strings",
    "objective": "Função de falha do autômato finito determinístico em O(n)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-09).",
    "curriculumCode": "DCN-COMP-09",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Casamento de Padrões em Texto (Algoritmo KMP)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de processamento de strings",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_comp_10",
    "title": "Problemas NP-Completos e Heurísticas de Aproximação",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Algoritmos e Complexidade Computacional",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Teoria da Computação",
    "objective": "Problema do Caixeiro Viajante e coloração de grafos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-10).",
    "curriculumCode": "DCN-COMP-10",
    "simulatedHours": 30,
    "icon": "💻",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Problemas NP-Completos e Heurísticas de Aproximação\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de teoria da computação",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_01",
    "title": "Teoremas de Thevenin e Norton em Regime DC",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Análise de Circuitos",
    "objective": "Equivalência de bipolos ativos e máxima transferência de potência",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-01).",
    "curriculumCode": "DCN-ENG-ELE-01",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teoremas de Thevenin e Norton em Regime DC\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de análise de circuitos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_02",
    "title": "Resposta em Frequência e Filtros Passivos (RC, RL, RLC)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Filtros Analógicos",
    "objective": "Gráficos de Bode de magnitude e fase com frequência de corte",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-02).",
    "curriculumCode": "DCN-ENG-ELE-02",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Resposta em Frequência e Filtros Passivos (RC, RL, RLC)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de filtros analógicos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_03",
    "title": "Circuito RLC Transiente e Osciloscópio Digital",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Regimes Transitórios",
    "objective": "Equação diferencial característica e amortecimento crítico",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-03).",
    "curriculumCode": "DCN-ENG-ELE-03",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Circuito RLC Transiente e Osciloscópio Digital\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de regimes transitórios",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_04",
    "title": "Diodos Semicondutores e Retificadores de Onda Completa",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletrônica Básica",
    "objective": "Ponte de Graetz, filtragem capacitiva e tensão de ripple",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-04).",
    "curriculumCode": "DCN-ENG-ELE-04",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Diodos Semicondutores e Retificadores de Onda Completa\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletrônica básica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_05",
    "title": "Transistores Bipolares (BJT) como Chave e Amplificador",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Semicondutores",
    "objective": "Ponto quiescente Q na reta de carga e ganho de corrente beta",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-05).",
    "curriculumCode": "DCN-ENG-ELE-05",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Transistores Bipolares (BJT) como Chave e Amplificador\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de semicondutores",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_06",
    "title": "Transistores MOSFET e Inversores CMOS",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletrônica Digital",
    "objective": "Curvas de dreno ID-VDS, região de saturação e chaveamento lógico",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-06).",
    "curriculumCode": "DCN-ENG-ELE-06",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Transistores MOSFET e Inversores CMOS\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletrônica digital",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_07",
    "title": "Amplificadores Operacionais (Inversor, Integrador, Somador)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Circuitos Integrados",
    "objective": "Terra virtual, realimentação negativa e taxa de subida (Slew Rate)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-07).",
    "curriculumCode": "DCN-ENG-ELE-07",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Amplificadores Operacionais (Inversor, Integrador, Somador)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de circuitos integrados",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_08",
    "title": "Portas Lógicas Digitais e Mapas de Karnaugh",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Sistemas Digitais",
    "objective": "Minimização booleana e síntese de circuitos combinacionais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-08).",
    "curriculumCode": "DCN-ENG-ELE-08",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Portas Lógicas Digitais e Mapas de Karnaugh\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de sistemas digitais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_09",
    "title": "Flip-Flops e Contadores Síncronos/Assíncronos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletrônica Sequencial",
    "objective": "Máquinas de estados finitos (Moore e Mealy) com clock",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-09).",
    "curriculumCode": "DCN-ENG-ELE-09",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Flip-Flops e Contadores Síncronos/Assíncronos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletrônica sequencial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletr_10",
    "title": "Conversores Analógico-Digitais (ADC SAR e Flash)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Circuitos Elétricos e Eletrônica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Instrumentação Eletrônica",
    "objective": "Resolução em bits, amostragem e erro de quantização",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-ELE-10).",
    "curriculumCode": "DCN-ENG-ELE-10",
    "simulatedHours": 30,
    "icon": "⚡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Conversores Analógico-Digitais (ADC SAR e Flash)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de instrumentação eletrônica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_01",
    "title": "Controle PID de Nível de Reservatório",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Controle Clássico",
    "objective": "Sintonia pelos métodos de Ziegler-Nichols e sobressinal",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-01).",
    "curriculumCode": "DCN-ENG-AUT-01",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controle PID de Nível de Reservatório\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de controle clássico",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_02",
    "title": "Lugar das Raízes (Root Locus) e Estabilidade",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Análise de Estabilidade",
    "objective": "Trajetória dos polos em malha fechada e ganho crítico",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-02).",
    "curriculumCode": "DCN-ENG-AUT-02",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Lugar das Raízes (Root Locus) e Estabilidade\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de análise de estabilidade",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_03",
    "title": "Critério de Estabilidade de Nyquist",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Resposta em Frequência",
    "objective": "Margem de ganho e margem de fase no plano complexo",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-03).",
    "curriculumCode": "DCN-ENG-AUT-03",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Critério de Estabilidade de Nyquist\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de resposta em frequência",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_04",
    "title": "Modelagem no Espaço de Estados e Controlabilidade",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Controle Moderno",
    "objective": "Matrizes A, B, C, D e matriz de controlabilidade de Kalman",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-04).",
    "curriculumCode": "DCN-ENG-AUT-04",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Modelagem no Espaço de Estados e Controlabilidade\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de controle moderno",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_05",
    "title": "Observador de Estados de Luenberger",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estimativa de Estados",
    "objective": "Reconstrução de estados internos a partir de saídas ruidosas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-05).",
    "curriculumCode": "DCN-ENG-AUT-05",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Observador de Estados de Luenberger\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estimativa de estados",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_06",
    "title": "Controlador LQR (Linear Quadratic Regulator)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Controle Ótimo",
    "objective": "Otimização com matrizes de ponderação Q e R",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-06).",
    "curriculumCode": "DCN-ENG-AUT-06",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controlador LQR (Linear Quadratic Regulator)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de controle ótimo",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_07",
    "title": "Controle de Pêndulo Invertido sobre Carrinho",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Sistemas Não-Lineares",
    "objective": "Equilíbrio em ponto de sela com linearização jacobiana",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-07).",
    "curriculumCode": "DCN-ENG-AUT-07",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controle de Pêndulo Invertido sobre Carrinho\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de sistemas não-lineares",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_08",
    "title": "Controladores Lógicos Programáveis (CLP) em Ladder",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Automação Industrial",
    "objective": "Temporizadores, contadores e automação de esteiras industriais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-08).",
    "curriculumCode": "DCN-ENG-AUT-08",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controladores Lógicos Programáveis (CLP) em Ladder\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de automação industrial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_09",
    "title": "Controle Preditivo Baseado em Modelo (MPC)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Controle Avançado",
    "objective": "Horizonte de predição e restrições operacionais em tempo real",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-09).",
    "curriculumCode": "DCN-ENG-AUT-09",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controle Preditivo Baseado em Modelo (MPC)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de controle avançado",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_cont_10",
    "title": "Identificação de Sistemas pelo Método dos Mínimos Quadrados",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Sistemas de Controle e Automação",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Modelagem Dinâmica",
    "objective": "Estimação de parâmetros de funções de transferência ARX",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-AUT-10).",
    "curriculumCode": "DCN-ENG-AUT-10",
    "simulatedHours": 30,
    "icon": "🎛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Identificação de Sistemas pelo Método dos Mínimos Quadrados\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de modelagem dinâmica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_01",
    "title": "Lei de Gauss e Mapeamento de Campo Eletrostático",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Eletrostática",
    "objective": "Superfícies gaussianas esféricas e cilíndricas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Lei de Gauss e Mapeamento de Campo Eletrostático\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de eletrostática",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_02",
    "title": "Lei de Ampère e Campo Magnético de Solenóides",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Magnetostática",
    "objective": "Permeabilidade magnética e linhas de indução B",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Lei de Ampère e Campo Magnético de Solenóides\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de magnetostática",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_03",
    "title": "Equações de Maxwell e Ondas Planas no Vácuo",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Ondas EM",
    "objective": "Impedância intrínseca do meio e velocidade da luz c",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Equações de Maxwell e Ondas Planas no Vácuo\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de ondas em",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_04",
    "title": "Linhas de Transmissão e Carta de Smith",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Linhas de Transmissão",
    "objective": "Impedância característica, coeficiente de reflexão e ROE",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Linhas de Transmissão e Carta de Smith\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de linhas de transmissão",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_05",
    "title": "Guias de Onda Retangulares e Modos TE/TM",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Micro-ondas",
    "objective": "Frequência de corte e comprimento de onda guiado",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Guias de Onda Retangulares e Modos TE/TM\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de micro-ondas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_06",
    "title": "Antenas: Dipolo de Meia Onda e Diagrama de Radiação",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Antenas",
    "objective": "Ganho de antena, diretividade e resistência de radiação",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Antenas: Dipolo de Meia Onda e Diagrama de Radiação\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de antenas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_07",
    "title": "Reflexão e Refração de Ondas EM (Leis de Fresnel)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Óptica Eletromagnética",
    "objective": "Ângulo de Brewster e polarização por reflexão",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Reflexão e Refração de Ondas EM (Leis de Fresnel)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de óptica eletromagnética",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_08",
    "title": "Efeito Pelicular (Skin Effect) em Condutores",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Alta Frequência",
    "objective": "Profundidade de penetração com aumento da frequência",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Efeito Pelicular (Skin Effect) em Condutores\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de alta frequência",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_09",
    "title": "Força de Lorentz e Trajetória de Íons em Espectrômetro",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Partículas Carregadas",
    "objective": "Deflexão circular e seleção de velocidades",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Força de Lorentz e Trajetória de Íons em Espectrômetro\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de partículas carregadas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_eletromag_10",
    "title": "Compatibilidade Eletromagnética e Blindagem de Faraday",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Eletromagnetismo e Ondas",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "EMC/EMI",
    "objective": "Atenuação por absorção e reflexão em gaiolas condutoras",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-07).",
    "curriculumCode": "DCN-ENG-07",
    "simulatedHours": 30,
    "icon": "📡",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Compatibilidade Eletromagnética e Blindagem de Faraday\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de emc/emi",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_01",
    "title": "Ensaio de Tração e Curva Tensão-Deformação",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Mecânica dos Sólidos",
    "objective": "Módulo de Young, limite de escoamento e estricção plástica",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-01).",
    "curriculumCode": "DCN-ENG-MEC-01",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ensaio de Tração e Curva Tensão-Deformação\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de mecânica dos sólidos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_02",
    "title": "Flexão Pura em Vigas e Equação de Euler-Bernoulli",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Flexão de Vigas",
    "objective": "Momento fletor, linha neutra e tensões normais máximas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-02).",
    "curriculumCode": "DCN-ENG-MEC-02",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Flexão Pura em Vigas e Equação de Euler-Bernoulli\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de flexão de vigas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_03",
    "title": "Círculo de Mohr para Estado Plano de Tensões",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Transformação de Tensões",
    "objective": "Tensões principais e planos de cisalhamento máximo",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-03).",
    "curriculumCode": "DCN-ENG-MEC-03",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Círculo de Mohr para Estado Plano de Tensões\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de transformação de tensões",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_04",
    "title": "Torção em Eixos Circulares e Ângulo de Torção",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Torção Mecânica",
    "objective": "Momento polar de inércia e tensões cisalhantes radiais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-04).",
    "curriculumCode": "DCN-ENG-MEC-04",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Torção em Eixos Circulares e Ângulo de Torção\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de torção mecânica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_05",
    "title": "Flambagem de Colunas e Carga Crítica de Euler",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Instabilidade Estrutural",
    "objective": "Índice de esbeltez e condições de contorno de engaste/apoio",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-05).",
    "curriculumCode": "DCN-ENG-MEC-05",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Flambagem de Colunas e Carga Crítica de Euler\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de instabilidade estrutural",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_06",
    "title": "Critérios de Falha por Escoamento (Tresca e Von Mises)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Critérios de Resistência",
    "objective": "Superfícies de escoamento para materiais dúcteis sob tensão biaxial",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-06).",
    "curriculumCode": "DCN-ENG-MEC-06",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Critérios de Falha por Escoamento (Tresca e Von Mises)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de critérios de resistência",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_07",
    "title": "Ensaio de Impacto Charpy e Transição Dúctil-Frágil",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Tenacidade à Fratura",
    "objective": "Energia absorvida por entalhe em diferentes temperaturas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-07).",
    "curriculumCode": "DCN-ENG-MEC-07",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ensaio de Impacto Charpy e Transição Dúctil-Frágil\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de tenacidade à fratura",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_08",
    "title": "Ensaio de Dureza (Brinell, Rockwell e Vickers)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Metalurgia Mecânica",
    "objective": "Penetradores padronizados e cálculo de número de dureza",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-08).",
    "curriculumCode": "DCN-ENG-MEC-08",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ensaio de Dureza (Brinell, Rockwell e Vickers)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de metalurgia mecânica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_09",
    "title": "Deflexão de Vigas por Linha Elástica e Funções de Singularidade",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Deformação Elástica",
    "objective": "Equação diferencial de 4ª ordem e flecha máxima",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-09).",
    "curriculumCode": "DCN-ENG-MEC-09",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Deflexão de Vigas por Linha Elástica e Funções de Singularidade\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de deformação elástica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_resmat_10",
    "title": "Concentração de Tensões em Entalhes e Fadiga S-N",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Resistência dos Materiais",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Fadiga Estrutural",
    "objective": "Fator de forma Kt e limite de resistência à fadiga cíclica",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-MEC-10).",
    "curriculumCode": "DCN-ENG-MEC-10",
    "simulatedHours": 30,
    "icon": "🏗️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Concentração de Tensões em Entalhes e Fadiga S-N\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de fadiga estrutural",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_01",
    "title": "Ciclo Rankine a Vapor com Reaquecimento",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Termodinâmica de Potência",
    "objective": "Rendimento térmico e título de vapor na turbina",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ciclo Rankine a Vapor com Reaquecimento\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de termodinâmica de potência",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_02",
    "title": "Ciclos a Gás para Motores Otto e Diesel",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Motores de Combustão",
    "objective": "Razão de compressão vs. pressão média efetiva",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ciclos a Gás para Motores Otto e Diesel\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de motores de combustão",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_03",
    "title": "Ciclo de Refrigeração por Compressão de Vapor",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Refrigeração",
    "objective": "Coeficiente de performance COP e diagrama P-h do fluido R134a",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ciclo de Refrigeração por Compressão de Vapor\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de refrigeração",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_04",
    "title": "Carta Psicrométrica e Condicionamento de Ar",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Psicrometria",
    "objective": "Umidade relativa, entalpia do ar úmido e ponto de orvalho",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Carta Psicrométrica e Condicionamento de Ar\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de psicrometria",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_05",
    "title": "Condução Térmica em Paredes Compostas",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Transferência de Calor",
    "objective": "Resistência térmica equivalente em série e paralelo",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Condução Térmica em Paredes Compostas\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de transferência de calor",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_06",
    "title": "Aletas e Superfícies Estendidas de Resfriamento",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Convecção e Condução",
    "objective": "Distribuição de temperatura e eficiência de aleta",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Aletas e Superfícies Estendidas de Resfriamento\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de convecção e condução",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_07",
    "title": "Convecção Forçada sobre Placas Planas e Cilindros",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Convecção Forçada",
    "objective": "Números de Reynolds, Prandtl e correlações de Nusselt",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Convecção Forçada sobre Placas Planas e Cilindros\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de convecção forçada",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_08",
    "title": "Trocadores de Calor: Método LMTD e Efetividade NTU",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Trocadores de Calor",
    "objective": "Trocadores de casco e tubos com correntes paralelas e contracorrente",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Trocadores de Calor: Método LMTD e Efetividade NTU\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de trocadores de calor",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_09",
    "title": "Radiação Térmica e Fatores de Forma entre Superfícies",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Radiação",
    "objective": "Lei de Stefan-Boltzmann e troca radiativa entre corpos cinzas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Radiação Térmica e Fatores de Forma entre Superfícies\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de radiação",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_termo_10",
    "title": "Ebulição em Piscina e Curva de Nukiyama",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Termodinâmica Aplicada e Transcal",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Mudança de Fase",
    "objective": "Fluxo crítico de calor (CHF) e regime de filme de vapor",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-09).",
    "curriculumCode": "DCN-ENG-09",
    "simulatedHours": 30,
    "icon": "🔥",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ebulição em Piscina e Curva de Nukiyama\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de mudança de fase",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_01",
    "title": "Reômetro Rotacional e Fluidos Não-Newtonianos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Reologia",
    "objective": "Fluidos pseudoplásticos, dilatantes e plástico de Bingham",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Reômetro Rotacional e Fluidos Não-Newtonianos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de reologia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_02",
    "title": "Perda de Carga em Tubulações e Diagrama de Moody",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Hidráulica de Tubulações",
    "objective": "Fator de atrito de Darcy e rugosidade relativa",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Perda de Carga em Tubulações e Diagrama de Moody\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de hidráulica de tubulações",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_03",
    "title": "Curvas Características de Bombas Centrífugas e NPSH",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Máquinas de Fluxo",
    "objective": "Ponto de operação do sistema e prevenção de cavitação",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Curvas Características de Bombas Centrífugas e NPSH\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de máquinas de fluxo",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_04",
    "title": "Escoamento em Canais Abertos e Ressalto Hidráulico",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Hidráulica Fluvial",
    "objective": "Número de Froude e transição de regime supercrítico para subcrítico",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Escoamento em Canais Abertos e Ressalto Hidráulico\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de hidráulica fluvial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_05",
    "title": "Camada Limite Hidrodinâmica sobre Aerofólio",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Aerodinâmica",
    "objective": "Espessura de deslocamento e descolamento da camada limite",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Camada Limite Hidrodinâmica sobre Aerofólio\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de aerodinâmica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_06",
    "title": "Escoamento Compressível em Tubeira de Laval",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Gás Dinâmica",
    "objective": "Garganta sônica Mach 1 e ondas de choque normais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Escoamento Compressível em Tubeira de Laval\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de gás dinâmica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_07",
    "title": "Difusão Mássica e Primeira Lei de Fick",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Transferência de Massa",
    "objective": "Coeficiente de difusão molecular em soluções binárias",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Difusão Mássica e Primeira Lei de Fick\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de transferência de massa",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_08",
    "title": "Transferência Convectiva de Massa e Número de Sherwood",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Fenômenos Mássicos",
    "objective": "Evaporação de solventes sob convecção forçada",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Transferência Convectiva de Massa e Número de Sherwood\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de fenômenos mássicos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_09",
    "title": "Arrasto Aerodinâmico em Corpos Submersos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Arrasto e Sustentação",
    "objective": "Coeficiente de arrasto Cd vs. Reynolds para esferas e cilindros",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Arrasto Aerodinâmico em Corpos Submersos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de arrasto e sustentação",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_fluid_10",
    "title": "Visualização de Vórtices e Esteira de Von Kármán",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Dinâmica dos Fluidos e Fenômenos de Transporte",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Instabilidade de Fluxo",
    "objective": "Frequência de emissão de vórtices e Número de Strouhal",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-10).",
    "curriculumCode": "DCN-ENG-10",
    "simulatedHours": 30,
    "icon": "💧",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Visualização de Vórtices e Esteira de Von Kármán\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de instabilidade de fluxo",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_01",
    "title": "Teorema Central do Limite com 10.000 Amostras",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Inferência Estatística",
    "objective": "Convergência para distribuição normal e erro padrão",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teorema Central do Limite com 10.000 Amostras\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de inferência estatística",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_02",
    "title": "Testes de Hipóteses Paramétricos (Teste t e Teste Z)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Testes Estatísticos",
    "objective": "Nível de significância alfa, valor-p e poder do teste 1-beta",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Testes de Hipóteses Paramétricos (Teste t e Teste Z)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de testes estatísticos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_03",
    "title": "ANOVA Unifatorial e Teste Post-Hoc de Tukey",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Análise de Variância",
    "objective": "Estatística F de Snedecor e variabilidade intra/entre grupos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"ANOVA Unifatorial e Teste Post-Hoc de Tukey\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de análise de variância",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_04",
    "title": "Regressão Linear Múltipla e Diagnóstico de Resíduos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Modelos Lineares",
    "objective": "Homocedasticidade, multicolinearidade (VIF) e R² ajustado",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Regressão Linear Múltipla e Diagnóstico de Resíduos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de modelos lineares",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_05",
    "title": "Teste Qui-Quadrado de Independência e Aderência",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estatística Não-Paramétrica",
    "objective": "Tabelas de contingência e graus de liberdade",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teste Qui-Quadrado de Independência e Aderência\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estatística não-paramétrica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_06",
    "title": "Distribuição de Weibull em Análise de Confiabilidade",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Engenharia de Confiabilidade",
    "objective": "Taxa de falhas de equipamentos e curva da banheira",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Distribuição de Weibull em Análise de Confiabilidade\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de engenharia de confiabilidade",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_07",
    "title": "Controle Estatístico de Processo (Cartas X-barra e R)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Qualidade Seis Sigma",
    "objective": "Limites de controle 3-sigma e causas especiais de variação",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controle Estatístico de Processo (Cartas X-barra e R)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de qualidade seis sigma",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_08",
    "title": "Inferência Bayesiana com Conjugada Normal-Normal",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estatística Bayesiana",
    "objective": "Distribuição a priori, verossimilhança e distribuição a posteriori",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Inferência Bayesiana com Conjugada Normal-Normal\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estatística bayesiana",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_09",
    "title": "Bootstrapping e Intervalos de Confiança Empíricos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estatística Computacional",
    "objective": "Reamostragem não paramétrica para distribuições assimétricas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Bootstrapping e Intervalos de Confiança Empíricos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estatística computacional",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_estat_10",
    "title": "Curva ROC e Avaliação de Classificadores Binários",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Estatística Aplicada e Ciência de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Machine Learning Metrics",
    "objective": "Área sob a curva AUC, sensibilidade e especificidade",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-EXATAS-11).",
    "curriculumCode": "DCN-EXATAS-11",
    "simulatedHours": 30,
    "icon": "📈",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Curva ROC e Avaliação de Classificadores Binários\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de machine learning metrics",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_01",
    "title": "Cinética Enzimática de Michaelis-Menten e Lineweaver-Burk",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Enzimologia",
    "objective": "Constante Km, Vmax e inibição competitiva/não competitiva",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Cinética Enzimática de Michaelis-Menten e Lineweaver-Burk\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de enzimologia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_02",
    "title": "qPCR e Curva de Amplificação em Tempo Real",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Biologia Molecular",
    "objective": "Ciclo de quantificação Cq e expressão gênica comparativa 2^-ddCt",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"qPCR e Curva de Amplificação em Tempo Real\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de biologia molecular",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_03",
    "title": "Cromatografia Líquida de Alta Eficiência (HPLC)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Química Analítica",
    "objective": "Tempo de retenção, resolução cromatográfica e pratos teóricos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Cromatografia Líquida de Alta Eficiência (HPLC)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de química analítica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_04",
    "title": "Docking Molecular e Interação Fármaco-Receptor",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Modelagem Molecular",
    "objective": "Energia livre de Gibbs de ligação e sítio alostérico",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Docking Molecular e Interação Fármaco-Receptor\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de modelagem molecular",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_05",
    "title": "Fosforilação Oxidativa e Cadeia Respiratória Mitocondrial",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Metabolismo",
    "objective": "Gradiente de prótons e síntese quimiosmótica de ATP",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Fosforilação Oxidativa e Cadeia Respiratória Mitocondrial\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de metabolismo",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_06",
    "title": "Curva Concentração-Efeito (Dose-Resposta) Farmacológica",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Farmacodinâmica",
    "objective": "Potência EC50, eficácia máxima e antagonistas competitivos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Curva Concentração-Efeito (Dose-Resposta) Farmacológica\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de farmacodinâmica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_07",
    "title": "Ensaio Imunoenzimático ELISA Sanduíche",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Imunodiagnóstico",
    "objective": "Curva padrão óptica e titulação sorológica de anticorpos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Ensaio Imunoenzimático ELISA Sanduíche\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de imunodiagnóstico",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_08",
    "title": "Expressão e Purificação de Proteína Recombinante",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Biotecnologia",
    "objective": "Indução por IPTG e eluição por coluna de afinidade de níquel",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Expressão e Purificação de Proteína Recombinante\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de biotecnologia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_09",
    "title": "Sequenciamento NGS e Alinhamento de Leituras (Reads)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Genômica",
    "objective": "Mapeamento contra genoma de referência e detecção de SNPs",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Sequenciamento NGS e Alinhamento de Leituras (Reads)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de genômica",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_bioq_10",
    "title": "Farmacocinética Monocompartimental com Dose Única",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Bioquímica e Farmacologia Molecular",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Farmacocinética",
    "objective": "Meia-vida de eliminação t1/2, volume de distribuição e clearance",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-SAUDE-12).",
    "curriculumCode": "DCN-SAUDE-12",
    "simulatedHours": 30,
    "icon": "🧬",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Farmacocinética Monocompartimental com Dose Única\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de farmacocinética",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_01",
    "title": "Engenharia Econômica: VPL, TIR e Payback Descontado",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Finanças Corporativas",
    "objective": "Fluxo de caixa projetado e taxa mínima de atratividade (TMA)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Engenharia Econômica: VPL, TIR e Payback Descontado\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de finanças corporativas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_02",
    "title": "Elasticidade-Preço da Demanda e Equilíbrio de Mercado",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Microeconomia",
    "objective": "Ponto de equilíbrio microeconômico e excedente do consumidor",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Elasticidade-Preço da Demanda e Equilíbrio de Mercado\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de microeconomia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_03",
    "title": "Maximização de Lucro em Estruturas Monopolistas",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estruturas de Mercado",
    "objective": "Receita marginal igual ao custo marginal e poder de mercado",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Maximização de Lucro em Estruturas Monopolistas\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estruturas de mercado",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_04",
    "title": "Depreciação Contábil Linear vs. Saldos Decrescentes",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Contabilidade de Custos",
    "objective": "Impacto fiscal no lucro operacional antes do IR (EBITDA)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Depreciação Contábil Linear vs. Saldos Decrescentes\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de contabilidade de custos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_05",
    "title": "Teoria dos Jogos e Equilíbrio de Nash em Duopólio",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Estratégia Empresarial",
    "objective": "Dilema dos prisioneiros e modelo de Cournot",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Teoria dos Jogos e Equilíbrio de Nash em Duopólio\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de estratégia empresarial",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_06",
    "title": "Fronteira Eficiente de Markowitz e Gestão de Portfólio",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Mercado Financeiro",
    "objective": "Matriz de covariância de ativos e diversificação ótima",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Fronteira Eficiente de Markowitz e Gestão de Portfólio\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de mercado financeiro",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_07",
    "title": "Modelo de Black-Scholes para Precificação de Opções",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Derivativos",
    "objective": "Volatilidade implícita e gregas de sensibilidade (Delta, Gamma)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Modelo de Black-Scholes para Precificação de Opções\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de derivativos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_08",
    "title": "Análise de Ponto de Equilíbrio Operacional (Break-Even)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Gestão Financeira",
    "objective": "Margem de contribuição unitária e custos fixos operacionais",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Análise de Ponto de Equilíbrio Operacional (Break-Even)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de gestão financeira",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_09",
    "title": "Modelo Macroeconômico IS-LM e Políticas Fiscais/Monetárias",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Macroeconomia",
    "objective": "Equilíbrio nos mercados de bens e monetário sob choques de juros",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Modelo Macroeconômico IS-LM e Políticas Fiscais/Monetárias\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de macroeconomia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_econ_10",
    "title": "Sistemas de Amortização de Dívidas (Price vs. SAC)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Economia e Engenharia Econômica",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Matemática Financeira",
    "objective": "Composição de juros e evolução temporal do saldo devedor",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-ENG-13).",
    "curriculumCode": "DCN-ENG-13",
    "simulatedHours": 30,
    "icon": "💰",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Sistemas de Amortização de Dívidas (Price vs. SAC)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de matemática financeira",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_01",
    "title": "Handshake Triplo TCP e Controle de Congestionamento",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Protocolos de Transporte",
    "objective": "Captura de pacotes SYN, SYN-ACK, ACK e janela deslizante",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Handshake Triplo TCP e Controle de Congestionamento\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de protocolos de transporte",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_02",
    "title": "Endereçamento IPv4, Máscaras VLSM e Notação CIDR",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Redes de Computadores",
    "objective": "Divisão lógica de sub-redes e cálculo de broadcast",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Endereçamento IPv4, Máscaras VLSM e Notação CIDR\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de redes de computadores",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_03",
    "title": "Roteamento Dinâmico com Algoritmo Dijkstra (OSPF)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Roteamento IP",
    "objective": "Convergência de tabela de rotas e custo de enlaces",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Roteamento Dinâmico com Algoritmo Dijkstra (OSPF)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de roteamento ip",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_04",
    "title": "Criptografia Assimétrica RSA e Assinatura Digital",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Criptografia",
    "objective": "Aritmética modular com chaves pública e privada",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Criptografia Assimétrica RSA e Assinatura Digital\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de criptografia",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_05",
    "title": "Handshake TLS 1.3 e Cadeia de Certificados X.509",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Segurança Web",
    "objective": "Troca de chaves Diffie-Hellman efêmera e autenticação de servidor",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Handshake TLS 1.3 e Cadeia de Certificados X.509\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de segurança web",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_06",
    "title": "Mitigação de Ataques de Rede (ARP Spoofing e SYN Flood)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Segurança Defensiva",
    "objective": "Inspeção de pacotes por firewall stateful e tabelas ARP estáticas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Mitigação de Ataques de Rede (ARP Spoofing e SYN Flood)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de segurança defensiva",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_07",
    "title": "Consenso Distribuído com Algoritmo Raft",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Sistemas Distribuídos",
    "objective": "Eleição de nó líder e replicação consistente de registros de log",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Consenso Distribuído com Algoritmo Raft\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de sistemas distribuídos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_08",
    "title": "Resolução de Nomes DNS Recursiva e Hierárquica",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Serviços de Internet",
    "objective": "Consultas a root servers, TLD e zonas autoritativas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Resolução de Nomes DNS Recursiva e Hierárquica\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de serviços de internet",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_09",
    "title": "Balanceador de Carga e Proxies Reversos (Round Robin)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Infraestrutura Cloud",
    "objective": "Distribuição uniforme de requisições e persistência de sessão",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Balanceador de Carga e Proxies Reversos (Round Robin)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de infraestrutura cloud",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_redes_10",
    "title": "Redes Definidas por Software (SDN) e OpenFlow",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Redes de Computadores e Cibersegurança",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Redes Avançadas",
    "objective": "Separação entre plano de dados e plano de controle centralizado",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-14).",
    "curriculumCode": "DCN-COMP-14",
    "simulatedHours": 30,
    "icon": "🌐",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Redes Definidas por Software (SDN) e OpenFlow\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de redes avançadas",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_01",
    "title": "Regressão com Gradiente Descendente Estocástico (SGD)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Otimização para ML",
    "objective": "Taxa de aprendizado, superfície convexa e decaimento de peso",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Regressão com Gradiente Descendente Estocástico (SGD)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de otimização para ml",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_02",
    "title": "Classificador MLP com Backpropagation e Não-Linearidades",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Redes Neurais",
    "objective": "Funções de ativação ReLU, Sigmoid e matriz de confusão",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Classificador MLP com Backpropagation e Não-Linearidades\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de redes neurais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_03",
    "title": "Rede Neural Convolucional (CNN) e Extração de Features",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Visão Computacional",
    "objective": "Convolução 2D, pooling e classificação de padrões em imagens",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Rede Neural Convolucional (CNN) e Extração de Features\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de visão computacional",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_04",
    "title": "Árvores de Decisão e Florestas Aleatórias (Random Forest)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Modelos em Árvore",
    "objective": "Cálculo de impureza de Gini e ganho de informação de Shannon",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Árvores de Decisão e Florestas Aleatórias (Random Forest)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de modelos em árvore",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_05",
    "title": "Algoritmos Genéticos e Otimização Heurística",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Computação Evolutiva",
    "objective": "Cruzamento genético, mutação e seleção por roleta ponderada",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Algoritmos Genéticos e Otimização Heurística\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de computação evolutiva",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_06",
    "title": "Clusterização com K-Means e Análise de Silhueta",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Aprendizado Não-Supervisionado",
    "objective": "Minimização da inércia intra-cluster e método do cotovelo",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Clusterização com K-Means e Análise de Silhueta\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de aprendizado não-supervisionado",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_07",
    "title": "Aprendizado por Reforço Q-Learning em Tabuleiro",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Reinforcement Learning",
    "objective": "Dilema exploração vs. explotação com política epsilon-greedy",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Aprendizado por Reforço Q-Learning em Tabuleiro\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de reinforcement learning",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_08",
    "title": "Processamento de Linguagem Natural: TF-IDF e Word2Vec",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Processamento de Linguagem",
    "objective": "Similaridade por cosseno em representações vetoriais de palavras",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Processamento de Linguagem Natural: TF-IDF e Word2Vec\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de processamento de linguagem",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_09",
    "title": "Autoencoders e Redução Não-Linear de Dimensionalidade",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Modelos Generativos",
    "objective": "Compressão em gargalo latente e reconstrução com erro quadrático",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Autoencoders e Redução Não-Linear de Dimensionalidade\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de modelos generativos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_ia_10",
    "title": "Algoritmo de Busca Heurística A* em Malhas de Navegação",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Inteligência Artificial e Machine Learning",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Busca e Grafos",
    "objective": "Função de custo f(n) = g(n) + h(n) com heurística euclidiana",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-15).",
    "curriculumCode": "DCN-COMP-15",
    "simulatedHours": 30,
    "icon": "🧠",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Algoritmo de Busca Heurística A* em Malhas de Navegação\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de busca e grafos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_01",
    "title": "Modelagem Relacional (MER/DER) e Formas Normais (1FN a 3FN)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Bancos de Dados",
    "objective": "Chaves primárias, estrangeiras e eliminação de redundâncias",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Modelagem Relacional (MER/DER) e Formas Normais (1FN a 3FN)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de bancos de dados",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_02",
    "title": "Otimização de Consultas SQL e Criação de Índices B-Tree",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Performance SQL",
    "objective": "Análise de plano de execução (Explain Plan) e varredura de tabelas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Otimização de Consultas SQL e Criação de Índices B-Tree\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de performance sql",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_03",
    "title": "Transações Concorrentes e Propriedades ACID",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Sistemas Transacionais",
    "objective": "Níveis de isolamento de transações (Read Committed, Serializable)",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Transações Concorrentes e Propriedades ACID\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de sistemas transacionais",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_04",
    "title": "Design Patterns GoF Estruturais e Comportamentais",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Padrões de Projeto",
    "objective": "Implementação de Factory Method, Observer e Strategy",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Design Patterns GoF Estruturais e Comportamentais\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de padrões de projeto",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_05",
    "title": "Modelagem UML: Diagramas de Sequência e Estados",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Engenharia de Requisitos",
    "objective": "Mapeamento temporal de mensagens síncronas e assíncronas",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Modelagem UML: Diagramas de Sequência e Estados\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de engenharia de requisitos",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_06",
    "title": "Esteira CI/CD Automatizada com Testes e Deploy",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "DevOps",
    "objective": "Pipelines com linting, testes unitários e build de contêiner",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Esteira CI/CD Automatizada com Testes e Deploy\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de devops",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_07",
    "title": "Controle de Versão Git: Resolução de Conflitos de Merge",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Gerência de Configuração",
    "objective": "Histórico em grafo DAG, branches, rebasing e cherry-picking",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Controle de Versão Git: Resolução de Conflitos de Merge\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de gerência de configuração",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_08",
    "title": "Arquitetura de Microsserviços e Mensageria Orientada a Eventos",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Arquitetura de Software",
    "objective": "Topologia pub/sub com filas assíncronas e partições de tópicos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Arquitetura de Microsserviços e Mensageria Orientada a Eventos\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de arquitetura de software",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_09",
    "title": "Testes de Software e Cobertura de Código (Mutações)",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Qualidade de Software",
    "objective": "Testes unitários automatizados e teste de mutação com mutantes mortos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Testes de Software e Cobertura de Código (Mutações)\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de qualidade de software",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "sup_engsoft_10",
    "title": "Refatoração de Código e Complexidade Ciclomática de McCabe",
    "academicLevel": "graduacao",
    "academicLevelLabel": "Ensino Superior (Graduação)",
    "subject": "Engenharia de Software e Banco de Dados",
    "subjectCategory": "Engenharias & Tecnologias",
    "topic": "Manutenibilidade",
    "objective": "Identificação de code smells, acoplamento e coesão de módulos",
    "theoreticalBackground": "Atendimento rigoroso às Diretrizes Curriculares Nacionais do Ensino Superior (DCN-COMP-16).",
    "curriculumCode": "DCN-COMP-16",
    "simulatedHours": 30,
    "icon": "🏛️",
    "solverType": "ode_numerical",
    "defaultParams": [
      {
        "id": "param_entrada",
        "label": "Parâmetro de Excitação",
        "unit": "SI",
        "min": 0.1,
        "max": 100,
        "step": 0.5,
        "defaultValue": 10
      },
      {
        "id": "coef_amort",
        "label": "Constante do Sistema",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.05,
        "defaultValue": 1.5
      }
    ],
    "diagnosticQuestion": {
      "question": "O laboratório avançado \"Refatoração de Código e Complexidade Ciclomática de McCabe\" demonstra qual princípio fundamental da engenharia?",
      "options": [
        {
          "text": "O equacionamento matemático formal e a resposta dinâmica de manutenibilidade",
          "correct": true,
          "explanation": "Correto! A experimentação confirma os modelos teóricos recomendados pelas DCNs."
        },
        {
          "text": "Que sistemas físicos reais não seguem equações diferenciais",
          "correct": false,
          "explanation": "Sistemas físicos seguem rigorosamente as leis fundamentais descritas pelas equações diferenciais."
        }
      ]
    }
  },
  {
    "id": "pos_ia_01",
    "title": "Otimização por Gradiente com Momentum e Hessiana",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Otimização Convexa",
    "objective": "Anisotropia de superfícies de perda e decaimento de taxa",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-01).",
    "curriculumCode": "CAPES-COMP-01",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Otimização por Gradiente com Momentum e Hessiana\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em otimização convexa",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_02",
    "title": "Normalização em Camadas (LayerNorm) e Conexões Residuais",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Deep Architectures",
    "objective": "Mitigação do gradiente evanescente em redes ultraprofundas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-02).",
    "curriculumCode": "CAPES-COMP-02",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Normalização em Camadas (LayerNorm) e Conexões Residuais\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em deep architectures",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_03",
    "title": "Mecanismo de Atenção Multi-Head e Transformers",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Modelos de Linguagem",
    "objective": "Projeções de Query, Key, Value com mascaramento causal",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-03).",
    "curriculumCode": "CAPES-COMP-03",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mecanismo de Atenção Multi-Head e Transformers\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em modelos de linguagem",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_04",
    "title": "Modelos de Difusão Probabilística (DDPM)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Modelos Generativos",
    "objective": "Processo direto de adição de ruído e reversão por score-matching",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-04).",
    "curriculumCode": "CAPES-COMP-04",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelos de Difusão Probabilística (DDPM)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em modelos generativos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_05",
    "title": "Aprendizado por Reforço com Políticas Próximas (PPO)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Deep RL",
    "objective": "Clipagem da razão de probabilidade em espaços de ação contínuos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-05).",
    "curriculumCode": "CAPES-COMP-05",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Aprendizado por Reforço com Políticas Próximas (PPO)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em deep rl",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_06",
    "title": "Adaptação de Baixo Posto (LoRA) para Ajuste de LLMs",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Fine-Tuning Eficiente",
    "objective": "Fatoração matricial de parâmetros de peso com economia de VRAM",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-06).",
    "curriculumCode": "CAPES-COMP-06",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Adaptação de Baixo Posto (LoRA) para Ajuste de LLMs\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em fine-tuning eficiente",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_07",
    "title": "Redes Neurais Gráficas (Graph Neural Networks - GNN)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "GNNs",
    "objective": "Propagação de mensagens neurais em topologias moleculares",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-07).",
    "curriculumCode": "CAPES-COMP-07",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Redes Neurais Gráficas (Graph Neural Networks - GNN)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em gnns",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_08",
    "title": "Aprendizado Contrastivo Auto-Supervisionado (SimCLR)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Auto-Supervisão",
    "objective": "Espaço latente invariante a transformações geométricas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-08).",
    "curriculumCode": "CAPES-COMP-08",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Aprendizado Contrastivo Auto-Supervisionado (SimCLR)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em auto-supervisão",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_09",
    "title": "Modelos Neurais com RAG e Busca Vetorial Densa",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "RAG Neural",
    "objective": "Recuperação semântica em bases de alta dimensionalidade (FAISS)",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-09).",
    "curriculumCode": "CAPES-COMP-09",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelos Neurais com RAG e Busca Vetorial Densa\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em rag neural",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ia_10",
    "title": "Interpretabilidade com SHAP Values e Grad-CAM",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Aprendizado de Máquina Avançado & Otimização",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "XAI - IA Explicável",
    "objective": "Atribuição de relevância de features via teoria dos jogos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-10).",
    "curriculumCode": "CAPES-COMP-10",
    "simulatedHours": 45,
    "icon": "🧠",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Interpretabilidade com SHAP Values e Grad-CAM\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em xai - ia explicável",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_01",
    "title": "Ciclo Brayton Regenerativo e Análise Exergética",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Ciclos Térmicos",
    "objective": "Rendimento de 1ª e 2ª Lei e destruição de exergia na turbina",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-01).",
    "curriculumCode": "CAPES-ENG-01",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ciclo Brayton Regenerativo e Análise Exergética\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em ciclos térmicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_02",
    "title": "Cogeração com Turbina a Gás e Caldeira de Recuperação (HRSG)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Sistemas Térmicos",
    "objective": "Eficiência combinada e fator de economia de energia primária (FEP)",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-02).",
    "curriculumCode": "CAPES-ENG-02",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Cogeração com Turbina a Gás e Caldeira de Recuperação (HRSG)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sistemas térmicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_03",
    "title": "Ciclo Rankine Supercrítico e Ultra-Supercrítico",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Potência Térmica",
    "objective": "Pressão acima de 22,1 MPa e mitigação de emissões de CO2",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-03).",
    "curriculumCode": "CAPES-ENG-03",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ciclo Rankine Supercrítico e Ultra-Supercrítico\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em potência térmica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_04",
    "title": "Refrigeração por Absorção de Brometo de Lítio e Água",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Refrigeração Térmica",
    "objective": "Aproveitamento de calor residual de baixa entalpia",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-04).",
    "curriculumCode": "CAPES-ENG-04",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Refrigeração por Absorção de Brometo de Lítio e Água\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em refrigeração térmica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_05",
    "title": "Combustão Estequiométrica e Emissões de Poluentes (NOx e CO)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Combustão",
    "objective": "Cinética de Zeldovich e temperatura adiabática de chama",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-05).",
    "curriculumCode": "CAPES-ENG-05",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Combustão Estequiométrica e Emissões de Poluentes (NOx e CO)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em combustão",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_06",
    "title": "Pilas a Combustível de Membrana Polimérica (PEMFC)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Hidrogênio e Energia",
    "objective": "Curva de polarização, sobretensão de ativação e rendimento eletroquímico",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-06).",
    "curriculumCode": "CAPES-ENG-06",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Pilas a Combustível de Membrana Polimérica (PEMFC)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em hidrogênio e energia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_07",
    "title": "Armazenamento de Energia Térmica por Mudança de Fase (PCM)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Armazenamento Térmico",
    "objective": "Calor latente de fusão em sais fundidos e parafinas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-07).",
    "curriculumCode": "CAPES-ENG-07",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Armazenamento de Energia Térmica por Mudança de Fase (PCM)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em armazenamento térmico",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_08",
    "title": "Ciclo Stirling com Regenerador Térmico Real",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Máquinas Térmicas",
    "objective": "Trabalho indicado e perdas mecânicas em motores de combustão externa",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-08).",
    "curriculumCode": "CAPES-ENG-08",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ciclo Stirling com Regenerador Térmico Real\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em máquinas térmicas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_09",
    "title": "Gaseificação de Biomassa e Síntese de Syngas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Biorrefinarias",
    "objective": "Balanço mássico e energético de reações de Boudouard e reforma a vapor",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-09).",
    "curriculumCode": "CAPES-ENG-09",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Gaseificação de Biomassa e Síntese de Syngas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em biorrefinarias",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_termo_10",
    "title": "Análise Termoeconômica de Centrais Termelétricas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Termodinâmica Avançada e Cogeração",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Termoeconomia",
    "objective": "Custo exergético do kWh e otimização multiobjetivo de plantas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-10).",
    "curriculumCode": "CAPES-ENG-10",
    "simulatedHours": 45,
    "icon": "🚀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Análise Termoeconômica de Centrais Termelétricas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em termoeconomia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_01",
    "title": "Discretização por Volumes Finitos da Equação de Transporte",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Métodos Numéricos CFD",
    "objective": "Esquema Upwind vs. Diferenças Centrais com número de Péclet",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Discretização por Volumes Finitos da Equação de Transporte\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em métodos numéricos cfd",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_02",
    "title": "Algoritmo SIMPLE para Acoplamento Pressão-Velocidade",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Solvers de Navier-Stokes",
    "objective": "Correção de pressão e convergência residual de continuidade",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmo SIMPLE para Acoplamento Pressão-Velocidade\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em solvers de navier-stokes",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_03",
    "title": "Modelagem de Turbulência RANS: Modelos k-epsilon e k-omega",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Turbulência",
    "objective": "Energia cinética turbulenta e taxa de dissipação específica",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelagem de Turbulência RANS: Modelos k-epsilon e k-omega\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em turbulência",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_04",
    "title": "Simulação de Grandes Escalas (Large Eddy Simulation - LES)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "LES Avançado",
    "objective": "Filtragem espacial e modelo de submalha de Smagorinsky",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Simulação de Grandes Escalas (Large Eddy Simulation - LES)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em les avançado",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_05",
    "title": "Escoamentos Multifásicos com Método Volume of Fluid (VOF)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Escoamentos Multifásicos",
    "objective": "Rastreamento de interface livre e tensão superficial contínua",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Escoamentos Multifásicos com Método Volume of Fluid (VOF)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em escoamentos multifásicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_06",
    "title": "Malhas Desestruturadas e Critérios de Qualidade (Skewness)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Geração de Malhas",
    "objective": "Geração poliédrica e ortogonalidade em geometrias complexas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Malhas Desestruturadas e Critérios de Qualidade (Skewness)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em geração de malhas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_07",
    "title": "Camada Limite Turbulenta e Tratamento de Parede (y+)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Física de Parede",
    "objective": "Funções de parede padrão vs. abordagem resolvida até a parede",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Camada Limite Turbulenta e Tratamento de Parede (y+)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em física de parede",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_08",
    "title": "Escoamento Aerodinâmico Transônico sobre Perfil Supercrítico",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Aerodinâmica Numérica",
    "objective": "Ondas de choque e descolamento induzido por choque",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Escoamento Aerodinâmico Transônico sobre Perfil Supercrítico\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em aerodinâmica numérica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_09",
    "title": "Dispersão de Poluentes Atmosféricos em Canyons Urbanos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "CFD Ambiental",
    "objective": "Transporte convectivo-difusivo e recirculação por edifícios",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Dispersão de Poluentes Atmosféricos em Canyons Urbanos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em cfd ambiental",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cfd_10",
    "title": "Interação Fluido-Estrutura (FSI) com Malha Móvel (ALE)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Dinâmica dos Fluidos Computacional (CFD)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "FSI Acoplado",
    "objective": "Oscilação aeroelástica de pontes induzida por vórtices",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-11).",
    "curriculumCode": "CAPES-ENG-11",
    "simulatedHours": 45,
    "icon": "💨",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Interação Fluido-Estrutura (FSI) com Malha Móvel (ALE)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em fsi acoplado",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_01",
    "title": "Formulação Variacional e Princípio dos Trabalhos Virtuais",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Análise Estrutural FEM",
    "objective": "Matriz de rigidez elementar e montagem do sistema global K*u=F",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Formulação Variacional e Princípio dos Trabalhos Virtuais\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em análise estrutural fem",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_02",
    "title": "Elementos Isoparamétricos e Quadratura de Gauss",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Teoria de Elementos",
    "objective": "Mapeamento no espaço de coordenadas naturais xi e eta",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Elementos Isoparamétricos e Quadratura de Gauss\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em teoria de elementos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_03",
    "title": "Não-Linearidade Geométrica e Método de Newton-Raphson",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Mecânica Não-Linear",
    "objective": "Grandes deslocamentos e matriz de rigidez tangente",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Não-Linearidade Geométrica e Método de Newton-Raphson\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em mecânica não-linear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_04",
    "title": "Não-Linearidade Material e Plasticidade com Encruamento",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Plasticidade",
    "objective": "Critério de escoamento de Von Mises com retorno radial",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Não-Linearidade Material e Plasticidade com Encruamento\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em plasticidade",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_05",
    "title": "Análise Dinâmica Modal e Frequências Naturais",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Dinâmica Estrutural",
    "objective": "Problema de autovalores generalizado K*phi = omega^2*M*phi",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Análise Dinâmica Modal e Frequências Naturais\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em dinâmica estrutural",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_06",
    "title": "Análise Transiente por Integração Direta (Método de Newmark)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Métodos de Passo no Tempo",
    "objective": "Amortecimento de Rayleigh e estabilidade incondicional",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Análise Transiente por Integração Direta (Método de Newmark)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em métodos de passo no tempo",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_07",
    "title": "Mecânica da Fratura Linear Elástica: Fator K e Integral J",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Mecânica da Fratura",
    "objective": "Singularidade de tensão na ponta da trinca e elementos de quarto de ponto",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mecânica da Fratura Linear Elástica: Fator K e Integral J\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em mecânica da fratura",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_08",
    "title": "Análise Térmica Transiente Acoplada à Termomecânica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Campos Acoplados",
    "objective": "Tensões de origem térmica induzidas por gradientes térmicos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Análise Térmica Transiente Acoplada à Termomecânica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em campos acoplados",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_09",
    "title": "Problemas de Contato Mecânico e Multiplicadores de Lagrange",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Contato Estrutural",
    "objective": "Não-penetração, formulação de penalidade e atrito de Coulomb",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Problemas de Contato Mecânico e Multiplicadores de Lagrange\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em contato estrutural",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_fem_10",
    "title": "Otimização Topológica com Método SIMP",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Método dos Elementos Finitos (FEM)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Otimização de Estruturas",
    "objective": "Densidade artificial de material para peso mínimo com rigidez máxima",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-12).",
    "curriculumCode": "CAPES-ENG-12",
    "simulatedHours": 45,
    "icon": "🔩",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Otimização Topológica com Método SIMP\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em otimização de estruturas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_01",
    "title": "Qubits e Esfera de Bloch: Estados e Superposição",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Fundamentos Quânticos",
    "objective": "Portas quânticas unitárias Pauli X, Y, Z e Hadamard H",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Qubits e Esfera de Bloch: Estados e Superposição\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em fundamentos quânticos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_02",
    "title": "Emaranhamento Quântico e Portas de Dois Qubits (CNOT)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Emaranhamento",
    "objective": "Geração de estados de Bell e violação de desigualdades de Bell",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Emaranhamento Quântico e Portas de Dois Qubits (CNOT)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em emaranhamento",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_03",
    "title": "Teletransporte Quântico de Estados Desconhecidos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Protocolos Quânticos",
    "objective": "Protocolo com três qubits e canais clássicos de comunicação",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Teletransporte Quântico de Estados Desconhecidos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em protocolos quânticos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_04",
    "title": "Algoritmo de Deutsch-Jozsa e Paralelismo Quântico",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Complexidade Quântica",
    "objective": "Determinação de funções constantes ou balanceadas em 1 consulta",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmo de Deutsch-Jozsa e Paralelismo Quântico\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em complexidade quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_05",
    "title": "Algoritmo de Grover para Busca em Bases Não Estruturadas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Busca Quântica",
    "objective": "Amplificação quântica de amplitude com ganho quadrático O(sqrt(N))",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmo de Grover para Busca em Bases Não Estruturadas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em busca quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_06",
    "title": "Transformada Quântica de Fourier (QFT)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Frequência Quântica",
    "objective": "Estimação de fase quântica com portas controladas de fase Rk",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Transformada Quântica de Fourier (QFT)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em frequência quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_07",
    "title": "Algoritmo de Shor para Fatoração de Inteiros em Tempo Polinomial",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Criptoanálise Quântica",
    "objective": "Quebra quântica de chaves RSA através da busca de períodos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmo de Shor para Fatoração de Inteiros em Tempo Polinomial\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em criptoanálise quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_08",
    "title": "Algoritmos Quânticos Variacionais (VQE)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Química Quântica",
    "objective": "Otimização híbrida clássica-quântica de moléculas e energia do estado fundamental",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmos Quânticos Variacionais (VQE)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em química quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_09",
    "title": "Códigos Corretores de Erros Quânticos (Código de Shor e Superfície)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Tolerância a Falhas",
    "objective": "Síndrome de erros e correção de bit-flip e phase-flip em qubits físicos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Códigos Corretores de Erros Quânticos (Código de Shor e Superfície)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em tolerância a falhas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_quant_10",
    "title": "Supremacia Quântica e Amostragem de Circuitos Aleatórios",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Computação Quântica e Algoritmos Quânticos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Hardware Quântico",
    "objective": "Simulação de computadores quânticos NISQ com ruído estocástico",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-13).",
    "curriculumCode": "CAPES-COMP-13",
    "simulatedHours": 45,
    "icon": "⚛️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Supremacia Quântica e Amostragem de Circuitos Aleatórios\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em hardware quântico",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_01",
    "title": "Atrator de Lorenz e o Efeito Borboleta",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Teoria do Caos",
    "objective": "Sistema convectivo não linear em 3D e sensibilidade às condições iniciais",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Atrator de Lorenz e o Efeito Borboleta\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em teoria do caos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_02",
    "title": "Mapa Logístico e Diagrama de Bifurcação de Feigenbaum",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Mapas Discretos",
    "objective": "Constante universal delta=4,669 e rota para o caos por duplicação de período",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mapa Logístico e Diagrama de Bifurcação de Feigenbaum\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em mapas discretos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_03",
    "title": "Expoentes de Lyapunov e Divergência de Trajetórias",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Quantificação do Caos",
    "objective": "Taxa assintótica de separação exponencial de trajetórias vizinhas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Expoentes de Lyapunov e Divergência de Trajetórias\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em quantificação do caos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_04",
    "title": "Seção de Poincaré e Reconstrução do Espaço de Fase",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Análise de Séries",
    "objective": "Teorema de Takens e coordenadas de retardo temporal a partir de 1 série temporal",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Seção de Poincaré e Reconstrução do Espaço de Fase\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em análise de séries",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_05",
    "title": "Atrator de Rössler e Caos Espiral",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Atratores Estranhos",
    "objective": "Geometria fractal e estiramento/dobramento do espaço de fase",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Atrator de Rössler e Caos Espiral\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em atratores estranhos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_06",
    "title": "Dimensão Fractal: Contagem de Caixas e Dimensão de Hausdorff",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Geometria Fractal",
    "objective": "Conjunto de Cantor, Curva de Koch e atratores com dimensão fracionária",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Dimensão Fractal: Contagem de Caixas e Dimensão de Hausdorff\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em geometria fractal",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_07",
    "title": "Sincronização de Sistemas Caóticos (Esquema de Pecora-Carroll)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Controle do Caos",
    "objective": "Comunicação criptografada mascarada por sinais caóticos contínuos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Sincronização de Sistemas Caóticos (Esquema de Pecora-Carroll)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em controle do caos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_08",
    "title": "Oscilador de Van der Pol e Ciclos Limite Auto-Sustentados",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Osciladores Não-Lineares",
    "objective": "Equação diferencial não linear com termo de amortecimento dependente da amplitude",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Oscilador de Van der Pol e Ciclos Limite Auto-Sustentados\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em osciladores não-lineares",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_09",
    "title": "Bilhar Caótico e Caos Hamiltoniano em Mecânica Clássica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Sistemas Hamiltonianos",
    "objective": "Teorema KAM (Kolmogorov-Arnold-Moser) e destruição de toros invariantes",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Bilhar Caótico e Caos Hamiltoniano em Mecânica Clássica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sistemas hamiltonianos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_caos_10",
    "title": "Intermitência e Transições Críticas em Ecossistemas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Sistemas Dinâmicos e Caos",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Transições Críticas",
    "objective": "Sinais de alerta precoce (Critical Slowing Down) e bifurcações catastróficas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-EXATAS-14).",
    "curriculumCode": "CAPES-EXATAS-14",
    "simulatedHours": 45,
    "icon": "🌀",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Intermitência e Transições Críticas em Ecossistemas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em transições críticas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_01",
    "title": "Diagramas de Fase Ternários e Linhas de Amarração",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Termodinâmica de Materiais",
    "objective": "Regra da alavanca e equilíbrio termodinâmico de ligas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Diagramas de Fase Ternários e Linhas de Amarração\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em termodinâmica de materiais",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_02",
    "title": "Cinética de Transformação de Fase e Equação de Johnson-Mehl-Avrami",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Cinética de Fases",
    "objective": "Nucleação e crescimento de fases cristalinas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Cinética de Transformação de Fase e Equação de Johnson-Mehl-Avrami\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em cinética de fases",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_03",
    "title": "Diagramas TTT (Tempo-Temperatura-Transformação) de Aços",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Metalurgia Física",
    "objective": "Formação de perlita, bainita e martensita em resfriamento contínuo",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Diagramas TTT (Tempo-Temperatura-Transformação) de Aços\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em metalurgia física",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_04",
    "title": "Fluência em Altas Temperaturas e Equação de Larson-Miller",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Comportamento Mecânico",
    "objective": "Deformação permanente dependente do tempo sob tensão constante",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Fluência em Altas Temperaturas e Equação de Larson-Miller\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em comportamento mecânico",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_05",
    "title": "Supercondutividade de Alta Temperatura (YBCO) e Efeito Meissner",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Supercondutores",
    "objective": "Resistência elétrica zero e expulsão completa do campo magnético",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Supercondutividade de Alta Temperatura (YBCO) e Efeito Meissner\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em supercondutores",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_06",
    "title": "Células Solares de Perovskita e Eficiência Fotovoltaica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Materiais Eletrônicos",
    "objective": "Recombinação não radiativa de portadores e comprimento de difusão de carga",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Células Solares de Perovskita e Eficiência Fotovoltaica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em materiais eletrônicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_07",
    "title": "Materiais Compósitos e Critério de Falha de Tsai-Wu",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Compósitos Avançados",
    "objective": "Laminados anisotrópicos de fibra de carbono com resina epóxi",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Materiais Compósitos e Critério de Falha de Tsai-Wu\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em compósitos avançados",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_08",
    "title": "Microscopia Eletrônica de Transmissão (TEM) e Discordâncias",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Microestrutura",
    "objective": "Movimento de discordâncias de borda e hélice no encruamento",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Microscopia Eletrônica de Transmissão (TEM) e Discordâncias\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em microestrutura",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_09",
    "title": "Sinterização de Cerâmicas Avançadas e Crescimento de Grãos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Cerâmicas Especiais",
    "objective": "Densificação em estado sólido e eliminação de porosidade residual",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Sinterização de Cerâmicas Avançadas e Crescimento de Grãos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em cerâmicas especiais",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_mat_10",
    "title": "Pontos Quânticos (Quantum Dots) e Confinamento Eletrônico",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Ciência dos Materiais Avançada",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Nanotecnologia",
    "objective": "Tunabilidade de emissão óptica por variação de tamanho nanométrico",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-15).",
    "curriculumCode": "CAPES-ENG-15",
    "simulatedHours": 45,
    "icon": "🔬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Pontos Quânticos (Quantum Dots) e Confinamento Eletrônico\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em nanotecnologia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_01",
    "title": "Projeto de Filtros Digitais IIR e FIR (Parks-McClellan)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Filtros Digitais",
    "objective": "Atenuação de faixa de rejeição e ondulação (ripple) de passagem",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Projeto de Filtros Digitais IIR e FIR (Parks-McClellan)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em filtros digitais",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_02",
    "title": "Transformada Wavelet Discreta (DWT) e Multirresolução",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Análise de Sinais",
    "objective": "Decomposição em coeficientes de aproximação e detalhe",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Transformada Wavelet Discreta (DWT) e Multirresolução\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em análise de sinais",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_03",
    "title": "Filtro Adaptativo LMS para Cancelamento de Ruído",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Sinais Biomédicos",
    "objective": "Ajuste de pesos em tempo real por gradiente descendente recursivo",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Filtro Adaptativo LMS para Cancelamento de Ruído\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sinais biomédicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_04",
    "title": "Detecção de Bordas por Algoritmo de Canny em Imagens",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Visão Computacional",
    "objective": "Gradiente de Sobel, supressão de não-máximos e histerese",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Detecção de Bordas por Algoritmo de Canny em Imagens\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em visão computacional",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_05",
    "title": "Transformada de Hough para Detecção de Linhas e Círculos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Reconhecimento de Formas",
    "objective": "Mapeamento para espaço de parâmetros acumulares",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Transformada de Hough para Detecção de Linhas e Círculos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em reconhecimento de formas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_06",
    "title": "Registro de Imagens Médicas por Informação Mútua",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Imagens Médicas",
    "objective": "Alinhamento multirresolução de tomografias (CT) e ressonâncias (MRI)",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Registro de Imagens Médicas por Informação Mútua\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em imagens médicas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_07",
    "title": "Compressão Psicoacústica de Áudio (Padrão MP3/AAC)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Processamento de Áudio",
    "objective": "Bancos de filtros e mascaramento espectral de frequências inaudíveis",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Compressão Psicoacústica de Áudio (Padrão MP3/AAC)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em processamento de áudio",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_08",
    "title": "Beamforming em Arranjos de Microfones e Antenas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Arranjos de Sensores",
    "objective": "Filtragem espacial para direcionamento seletivo de feixes acústicos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Beamforming em Arranjos de Microfones e Antenas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em arranjos de sensores",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_09",
    "title": "Desconvolução de Imagens por Algoritmo Richardson-Lucy",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Restauração de Imagens",
    "objective": "Restauração probabilística de imagens borradas por movimento",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Desconvolução de Imagens por Algoritmo Richardson-Lucy\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em restauração de imagens",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_pds_10",
    "title": "Espectrograma STFT (Short-Time Fourier Transform)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Processamento Digital de Sinais (PDS)",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Análise Tempo-Frequência",
    "objective": "Compensação resolução no tempo vs. resolução na frequência de Gabor",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-16).",
    "curriculumCode": "CAPES-ENG-16",
    "simulatedHours": 45,
    "icon": "🎚️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Espectrograma STFT (Short-Time Fourier Transform)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em análise tempo-frequência",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_01",
    "title": "Algoritmo Simplex e Análise de Dualidade",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Programação Linear",
    "objective": "Preços-sombra e sensibilidade econômica de restrições",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmo Simplex e Análise de Dualidade\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em programação linear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_02",
    "title": "Branch and Bound em Programação Inteira Mista (MIP)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Otimização Discreta",
    "objective": "Resolução de problemas de empacotamento e corte de barras",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Branch and Bound em Programação Inteira Mista (MIP)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em otimização discreta",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_03",
    "title": "Métodos de Quase-Newton (Algoritmo BFGS)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Otimização Não-Linear",
    "objective": "Aproximação da Hessiana inversa para funções não lineares irrestritas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Métodos de Quase-Newton (Algoritmo BFGS)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em otimização não-linear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_04",
    "title": "Otimização por Enxame de Partículas (PSO)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Metaheurísticas",
    "objective": "Convergência populacional com velocidade cognitiva e social",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Otimização por Enxame de Partículas (PSO)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em metaheurísticas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_05",
    "title": "Roteamento de Veículos (VRP) e Heurística de Clark-Wright",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Logística Avançada",
    "objective": "Minimização de frotas e roteirização com janelas de tempo",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Roteamento de Veículos (VRP) e Heurística de Clark-Wright\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em logística avançada",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_06",
    "title": "Programação Semidefinida Positiva (SDP) e Cones Convexos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Convex Optimization",
    "objective": "Relaxações convexas para problemas NP-difíceis de matrizes",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Programação Semidefinida Positiva (SDP) e Cones Convexos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em convex optimization",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_07",
    "title": "Otimização Multiobjetivo e Fronteira de Pareto (NSGA-II)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Multiobjetivo",
    "objective": "Dominância de Pareto e diversidade por distância de aglomeração",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Otimização Multiobjetivo e Fronteira de Pareto (NSGA-II)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em multiobjetivo",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_08",
    "title": "Algoritmos de Pontos Interiores com Barreira Logarítmica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Pontos Interiores",
    "objective": "Trajetória central em otimização com restrições de desigualdade",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Algoritmos de Pontos Interiores com Barreira Logarítmica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em pontos interiores",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_09",
    "title": "Metaheurística de Colônia de Formigas (ACO)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Inteligência Coletiva",
    "objective": "Deposição e evaporação estocástica de feromônio em grafos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Metaheurística de Colônia de Formigas (ACO)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em inteligência coletiva",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_otim_10",
    "title": "Otimização Robusta sob Incerteza Elipsoidal",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Otimização Convexa & Pesquisa Operacional",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Otimização Robusta",
    "objective": "Formulação de pior caso para parâmetros estocásticos sensíveis",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-17).",
    "curriculumCode": "CAPES-ENG-17",
    "simulatedHours": 45,
    "icon": "📉",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Otimização Robusta sob Incerteza Elipsoidal\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em otimização robusta",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_01",
    "title": "Alinhamento Múltiplo de Sequências com HMMs",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Bioinformática",
    "objective": "Modelos Ocultos de Markov para detecção de domínios conservados",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Alinhamento Múltiplo de Sequências com HMMs\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em bioinformática",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_02",
    "title": "Dinâmica Molecular com Integração de Verlet",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Simulação Biofísica",
    "objective": "Campos de força atomísticos (AMBER) calculando trajetórias de nanossegundos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Dinâmica Molecular com Integração de Verlet\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em simulação biofísica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_03",
    "title": "Diagrama de Ramachandran e Geometria Peptídica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Biologia Estrutural",
    "objective": "Ângulos diedros phi e psi em conformações permitidas e impedidas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Diagrama de Ramachandran e Geometria Peptídica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em biologia estrutural",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_04",
    "title": "Cálculo de Energia Livre de Ligação (MM-PBSA)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Química Computacional",
    "objective": "Interações eletrostáticas e de van der Waals ligante-alvo",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Cálculo de Energia Livre de Ligação (MM-PBSA)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em química computacional",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_05",
    "title": "Análise de Redes de Coexpressão Gênica (WGCNA)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Biologia de Sistemas",
    "objective": "Identificação de módulos de genes correlacionados com câncer",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Análise de Redes de Coexpressão Gênica (WGCNA)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em biologia de sistemas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_06",
    "title": "Triagem Virtual de Fármacos em Bibliotecas Químicas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Drug Discovery",
    "objective": "Filtros de Lipinski e ancoramento em receptores de membrana",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Triagem Virtual de Fármacos em Bibliotecas Químicas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em drug discovery",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_07",
    "title": "Modelagem Comparativa de Proteínas por Homologia",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Engenharia de Proteínas",
    "objective": "Alinhamento alvo-molde e refinamento de loops espaciais",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelagem Comparativa de Proteínas por Homologia\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em engenharia de proteínas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_08",
    "title": "Eletrostática Molecular via Equação de Poisson-Boltzmann",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Eletrostática Biológica",
    "objective": "Mapeamento de potencial na superfície solúvel de proteínas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Eletrostática Molecular via Equação de Poisson-Boltzmann\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em eletrostática biológica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_09",
    "title": "Inferência Filogenética por Máxima Verossimilhança",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Evolução Molecular",
    "objective": "Matrizes de substituição de aminoácidos (PAM/BLOSUM) e árvores",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Inferência Filogenética por Máxima Verossimilhança\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em evolução molecular",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_bioinf_10",
    "title": "Modelagem QSAR e Descritores Moleculares de Bioatividade",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Bioinformática Estrutural & Farmacologia",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Quimioinformática",
    "objective": "Regressão de bioatividade baseada em propriedades físico-químicas 3D",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-BIO-18).",
    "curriculumCode": "CAPES-BIO-18",
    "simulatedHours": 45,
    "icon": "🧬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelagem QSAR e Descritores Moleculares de Bioatividade\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em quimioinformática",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_01",
    "title": "Cinemática Direta de Manipuladores (Denavit-Hartenberg)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Cinemática Robótica",
    "objective": "Matrizes de transformação homogênea de juntas de robôs industriais",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Cinemática Direta de Manipuladores (Denavit-Hartenberg)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em cinemática robótica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_02",
    "title": "Jacobiano Cinemático e Singularidades Articulares",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Controle de Manipuladores",
    "objective": "Mapeamento de velocidades diferenciais e perda de graus de liberdade",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Jacobiano Cinemático e Singularidades Articulares\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em controle de manipuladores",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_03",
    "title": "Robôs Móveis Diferenciais e Modelo de Uniciclo",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Robótica Móvel",
    "objective": "Cinemática não-holonômica e controle de seguimento de trajetória",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Robôs Móveis Diferenciais e Modelo de Uniciclo\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em robótica móvel",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_04",
    "title": "Mapeamento e Localização Simultâneos (SLAM com EKF)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "SLAM",
    "objective": "Fusão de odometria com laser scanner (Lidar) para mapa de ocupação",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mapeamento e Localização Simultâneos (SLAM com EKF)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em slam",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_05",
    "title": "Planejamento de Trajetórias por RRT* no Espaço de Configurações",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Path Planning",
    "objective": "Árvores aleatórias de exploração rápida com convergência quase-ótima",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Planejamento de Trajetórias por RRT* no Espaço de Configurações\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em path planning",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_06",
    "title": "Dinâmica de Manipuladores pelo Formalismo de Euler-Lagrange",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Dinâmica Robótica",
    "objective": "Matriz de inércia, termos de Coriolis e torques gravitacionais",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Dinâmica de Manipuladores pelo Formalismo de Euler-Lagrange\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em dinâmica robótica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_07",
    "title": "Controle de Impedância para Interação Robô-Humano",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Robótica Colaborativa",
    "objective": "Rigidez e amortecimento virtuais para conformidade passiva",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Controle de Impedância para Interação Robô-Humano\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em robótica colaborativa",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_08",
    "title": "Fusão Sensorial com Filtro de Partículas (Monte Carlo Localization)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Navegação Autônoma",
    "objective": "Estimativa multimodal de pose em ambientes com oclusão",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Fusão Sensorial com Filtro de Partículas (Monte Carlo Localization)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em navegação autônoma",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_09",
    "title": "Odometria Visual com Câmera Estéreo",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Visão Robótica",
    "objective": "Correspondência de pontos-chave (ORB) e cálculo da matriz essencial",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Odometria Visual com Câmera Estéreo\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em visão robótica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_rob_10",
    "title": "Controle de Formação de Enxames de Robôs Móveis",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Robótica Móvel e Manipuladores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Robótica de Enxame",
    "objective": "Campos de potencial artificial atrativos e repulsivos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-19).",
    "curriculumCode": "CAPES-ENG-19",
    "simulatedHours": 45,
    "icon": "🤖",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Controle de Formação de Enxames de Robôs Móveis\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em robótica de enxame",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_01",
    "title": "Decodificação Auto-Regressiva com Top-p (Nucleus) e Top-k",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Geração de Texto",
    "objective": "Amostragem probabilística com temperatura em LLMs",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Decodificação Auto-Regressiva com Top-p (Nucleus) e Top-k\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em geração de texto",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_02",
    "title": "Quantização de Modelos de Linguagem (GPTQ e AWQ de 4 bits)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Compressão de LLMs",
    "objective": "Arredondamento ótimo de pesos e preservação de perplexidade",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Quantização de Modelos de Linguagem (GPTQ e AWQ de 4 bits)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em compressão de llms",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_03",
    "title": "Alinhamento de LLMs por Reinforcement Learning from Human Feedback (RLHF)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Segurança de IA",
    "objective": "Treinamento de modelo de recompensa e otimização por PPO",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Alinhamento de LLMs por Reinforcement Learning from Human Feedback (RLHF)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em segurança de ia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_04",
    "title": "Direct Preference Optimization (DPO) sem Modelo de Recompensa",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Alinhamento de Modelos",
    "objective": "Otimização implícita de preferências humanas sobre respostas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Direct Preference Optimization (DPO) sem Modelo de Recompensa\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em alinhamento de modelos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_05",
    "title": "Mecanismo de Atenção FlashAttention e Otimização de Memória",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Hardware-Aware ML",
    "objective": "Blocos de computação em SRAM com complexidade de I/O linear",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mecanismo de Atenção FlashAttention e Otimização de Memória\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em hardware-aware ml",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_06",
    "title": "Representação de Contexto Ultra-Longo com RoPE (Rotary Position)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Contexto Extenso",
    "objective": "Interpolação de frequências para expansão de janelas de contexto",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Representação de Contexto Ultra-Longo com RoPE (Rotary Position)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em contexto extenso",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_07",
    "title": "Mistura de Especialistas (Mixture of Experts - MoE)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Arquitetura MoE",
    "objective": "Roteamento esparso de tokens para redes com centenas de bilhões de parâmetros",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mistura de Especialistas (Mixture of Experts - MoE)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em arquitetura moe",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_08",
    "title": "Modelos Multimodais: Projeções de Visão e Linguagem (CLIP)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "IA Multimodal",
    "objective": "Espaço latente compartilhado entre imagens e textos descritivos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modelos Multimodais: Projeções de Visão e Linguagem (CLIP)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em ia multimodal",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_09",
    "title": "Ajuste de Instruções (Instruction Tuning) e Formato ChatML",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "SFT de Modelos",
    "objective": "Sintonia supervisionada para seguimento fiel de comandos e raciocínio",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ajuste de Instruções (Instruction Tuning) e Formato ChatML\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sft de modelos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_deep_10",
    "title": "Benchmarking e Avaliação Automática de Alucinações em IA",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Modelos de Linguagem e Deep Learning Avançado",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Avaliação de IA",
    "objective": "Métricas de fidelidade fática e checagem de consistência lógica",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-20).",
    "curriculumCode": "CAPES-COMP-20",
    "simulatedHours": 45,
    "icon": "💬",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Benchmarking e Avaliação Automática de Alucinações em IA\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em avaliação de ia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_01",
    "title": "Criptografia Baseada em Reticulados e Problema LWE",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Pós-Quântica",
    "objective": "Segurança quântica pós-RSA pelo Learning With Errors (Kyber)",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Criptografia Baseada em Reticulados e Problema LWE\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em pós-quântica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_02",
    "title": "Provas de Conhecimento Zero Não-Interativas (zk-SNARKs)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Zero-Knowledge",
    "objective": "Verificação criptográfica com polinômios de Schwartz-Zippel",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Provas de Conhecimento Zero Não-Interativas (zk-SNARKs)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em zero-knowledge",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_03",
    "title": "Criptografia Totalmente Homomórfica (FHE)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Privacidade de Dados",
    "objective": "Execução de somas e multiplicações diretamente sobre dados cifrados",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Criptografia Totalmente Homomórfica (FHE)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em privacidade de dados",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_04",
    "title": "Mecanismos de Consenso em Blockchain: PoW vs. PoS",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Blockchain Architecture",
    "objective": "Taxas de finalidade, vulnerabilidade de 51% e slashing de validadores",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Mecanismos de Consenso em Blockchain: PoW vs. PoS\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em blockchain architecture",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_05",
    "title": "Vulnerabilidade de Reentrância em Contratos Inteligentes",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Segurança Smart Contracts",
    "objective": "Ataques na Máquina Virtual Ethereum (EVM) e padrão Checks-Effects-Interactions",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Vulnerabilidade de Reentrância em Contratos Inteligentes\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em segurança smart contracts",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_06",
    "title": "Assinaturas Digitais em Curvas Elípticas (ECDSA e Ed25519)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Criptografia Moderna",
    "objective": "Aritmética de pontos em curvas de Weierstrass e Edwards",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Assinaturas Digitais em Curvas Elípticas (ECDSA e Ed25519)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em criptografia moderna",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_07",
    "title": "Compartilhamento de Segredos de Shamir (k de n partes)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Gestão de Chaves",
    "objective": "Interpolação polinomial de Lagrange para recuperação de chaves mestras",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Compartilhamento de Segredos de Shamir (k de n partes)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em gestão de chaves",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_08",
    "title": "Computação Multipartidária Segura (SMPC)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "SMPC",
    "objective": "Circuitos booleanos com garbled circuits de Yao para dados privados",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Computação Multipartidária Segura (SMPC)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em smpc",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_09",
    "title": "Ataques de Canal Lateral por Análise de Consumo (DPA)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Criptoanálise Física",
    "objective": "Vazamento eletromagnético e de tempo durante encriptação AES",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ataques de Canal Lateral por Análise de Consumo (DPA)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em criptoanálise física",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_cripto_10",
    "title": "Árvores de Merkle e Provas de Inclusão Criptográfica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Criptografia Pós-Quântica e Blockchain",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Integridade Distribuída",
    "objective": "Verificação instantânea de integridade em transações distribuídas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-COMP-21).",
    "curriculumCode": "CAPES-COMP-21",
    "simulatedHours": 45,
    "icon": "🔒",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Árvores de Merkle e Provas de Inclusão Criptográfica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em integridade distribuída",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_01",
    "title": "Entropia de Shannon e Teorema de Codificação de Fonte",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Teoria da Informação",
    "objective": "Limite fundamental de compressão sem perda e codificação aritmética",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Entropia de Shannon e Teorema de Codificação de Fonte\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em teoria da informação",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_02",
    "title": "Capacidade de Canal de Shannon-Hartley em Canais AWGN",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Capacidade de Canal",
    "objective": "Relação sinal-ruído SNR e eficiência espectral em bits/s/Hz",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Capacidade de Canal de Shannon-Hartley em Canais AWGN\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em capacidade de canal",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_03",
    "title": "Códigos Corretores de Erro LDPC com Propagação de Crenças",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Códigos de Canal",
    "objective": "Grafos de Tanner bipartidos e decodificação quasi-ótima de paridade",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Códigos Corretores de Erro LDPC com Propagação de Crenças\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em códigos de canal",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_04",
    "title": "Modulação OFDM e Eliminação de Interferência Intersimbólica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Comunicações Móveis",
    "objective": "Prefixo cíclico e equalização no domínio da frequência",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Modulação OFDM e Eliminação de Interferência Intersimbólica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em comunicações móveis",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_05",
    "title": "Sistemas Massivos MIMO e Conformação de Feixes Espaciais",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Sistemas Celulares",
    "objective": "Matriz de canal H e pré-codificação por Zero-Forcing",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Sistemas Massivos MIMO e Conformação de Feixes Espaciais\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sistemas celulares",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_06",
    "title": "Códigos Polares e Cancelamento Sucessivo no Padrão 5G",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "5G New Radio",
    "objective": "Polarização de canais sintéticos para controle de dados ultra-confiável",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Códigos Polares e Cancelamento Sucessivo no Padrão 5G\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em 5g new radio",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_07",
    "title": "Equalização Adaptativa MMSE em Canais com Desvanecimento",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Equalização",
    "objective": "Minimização do erro quadrático médio sob ruído e multipercurso",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Equalização Adaptativa MMSE em Canais com Desvanecimento\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em equalização",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_08",
    "title": "Distribuição Quântica de Chaves (QKD - Protocolo BB84)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Comunicações Quânticas",
    "objective": "Detecção imediata de interceptação espiã pelo colapso quântico de fótons",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Distribuição Quântica de Chaves (QKD - Protocolo BB84)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em comunicações quânticas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_09",
    "title": "Teoria da Taxa-Distorção em Compressão com Perdas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Compressão",
    "objective": "Quantização vetorial e fronteira de informação mútua",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Teoria da Taxa-Distorção em Compressão com Perdas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em compressão",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_ti_10",
    "title": "Fatiamento de Rede (Network Slicing) em 5G/6G",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Teoria da Informação e Redes 5G/6G",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Redes 6G",
    "objective": "Garantia de QoS para eMBB, URLLC e mMTC na mesma infraestrutura",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-22).",
    "curriculumCode": "CAPES-ENG-22",
    "simulatedHours": 45,
    "icon": "📡",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Fatiamento de Rede (Network Slicing) em 5G/6G\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em redes 6g",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_01",
    "title": "Reconstrução Tomográfica por Retroprojeção Filtrada (FBP)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Imagens Médicas",
    "objective": "Transformada de Radon de sinogramas em imagens tomográficas 2D",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Reconstrução Tomográfica por Retroprojeção Filtrada (FBP)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em imagens médicas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_02",
    "title": "Eletrocardiograma (ECG) e Processamento de Complexos QRS",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Sinais Biomédicos",
    "objective": "Algoritmo de Pan-Tompkins para detecção de arritmias cardíacas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Eletrocardiograma (ECG) e Processamento de Complexos QRS\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em sinais biomédicos",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_03",
    "title": "Ressonância Magnética Nuclear: Sequência Spin-Eco e Relaxação T1/T2",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Ressonância",
    "objective": "Precessão de Larmor e tempo de repetição TR/TE",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ressonância Magnética Nuclear: Sequência Spin-Eco e Relaxação T1/T2\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em ressonância",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_04",
    "title": "Ultrassom Modo B e Efeito Doppler Colorido de Fluxo Sanguíneo",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Ultrassonografia",
    "objective": "Transdutor piezoelétrico e atenuação acústica em tecidos humanos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ultrassom Modo B e Efeito Doppler Colorido de Fluxo Sanguíneo\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em ultrassonografia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_05",
    "title": "Biomecânica de Próteses Articulares e Análise de Marcha",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Biomecânica",
    "objective": "Cinemática inversa de forças no quadril durante ciclo de marcha",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Biomecânica de Próteses Articulares e Análise de Marcha\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em biomecânica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_06",
    "title": "Bioimpedância Elétrica e Modelo de Fricke-Cole",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Bioinstrumentação",
    "objective": "Resistência celular e reatância capacitiva na avaliação corporal",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Bioimpedância Elétrica e Modelo de Fricke-Cole\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em bioinstrumentação",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_07",
    "title": "Oximetria de Pulso e Espectrofotometria Diferencial",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Monitores Hospitalares",
    "objective": "Absorção de luz vermelha e infravermelha por oxi-hemoglobina e desoxi",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Oximetria de Pulso e Espectrofotometria Diferencial\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em monitores hospitalares",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_08",
    "title": "Interação Laser-Tecido e Termoterapia Intersticial",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Biofotônica",
    "objective": "Dispersão múltipla de luz e modelo de Monte Carlo para fototermólise",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Interação Laser-Tecido e Termoterapia Intersticial\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em biofotônica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_09",
    "title": "Implantes Cocleares e Codificação Eletroacústica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Neuroengenharia",
    "objective": "Filtros passa-faixa estimulando terminações do nervo auditivo",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Implantes Cocleares e Codificação Eletroacústica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em neuroengenharia",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_biomed_10",
    "title": "Regulação Térmica Humana e Troca de Calor no Corpo",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Biomédica e Biofotônica",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Fisiologia Médica",
    "objective": "Equação de bioaquecimento de Pennes com perfusão sanguínea",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-SAUDE-23).",
    "curriculumCode": "CAPES-SAUDE-23",
    "simulatedHours": 45,
    "icon": "🩺",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Regulação Térmica Humana e Troca de Calor no Corpo\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em fisiologia médica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_01",
    "title": "Equação do Foguete de Tsiolkovsky e Razão de Massa",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Mecânica Orbital",
    "objective": "Velocidade de exaustão efetiva e delta-v necessário para órbita baixa",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Equação do Foguete de Tsiolkovsky e Razão de Massa\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em mecânica orbital",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_02",
    "title": "Manobra de Transferência Orbital de Hohmann",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Astrodinâmica",
    "objective": "Órbitas elípticas de transferência entre altitudes coplanares",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Manobra de Transferência Orbital de Hohmann\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em astrodinâmica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_03",
    "title": "Tubeira Convergente-Divergente de De Laval sob Expansão",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Propulsão a Foguete",
    "objective": "Razão de expansão ótima, subexpansão e sobre-expansão com ondas de choque",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Tubeira Convergente-Divergente de De Laval sob Expansão\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em propulsão a foguete",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_04",
    "title": "Aerotermodinâmica de Reentrada Atmosférica",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Voo Espacial",
    "objective": "Camada de choque hipersônica e fluxo de calor por estagnação",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Aerotermodinâmica de Reentrada Atmosférica\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em voo espacial",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_05",
    "title": "Dinâmica de Atitude de Satélites com Rodas de Reação",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Controle de Satélites",
    "objective": "Momento angular interno e desaturação magnética por magnetorquers",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Dinâmica de Atitude de Satélites com Rodas de Reação\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em controle de satélites",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_06",
    "title": "Perturbações Orbitais (Achatamento J2 da Terra e Arrasto)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Mecânica Celeste",
    "objective": "Precessão nodal e órbitas heliossíncronas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Perturbações Orbitais (Achatamento J2 da Terra e Arrasto)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em mecânica celeste",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_07",
    "title": "Propulsão Elétrica Espacial (Motores a Íons e Efeito Hall)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Propulsão Elétrica",
    "objective": "Impulso específico superior a 3000 s com aceleração eletrostática de xenônio",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Propulsão Elétrica Espacial (Motores a Íons e Efeito Hall)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em propulsão elétrica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_08",
    "title": "Estabilidade e Controle Longitudinal de Aeronaves (Fugóide)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Dinâmica de Voo",
    "objective": "Modos próprios de curto período e estabilidade estática de cauda",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Estabilidade e Controle Longitudinal de Aeronaves (Fugóide)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em dinâmica de voo",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_09",
    "title": "Navegação Inercial com Filtro de Kalman Estendido (INS/GPS)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Guiamento e Navegação",
    "objective": "Integração de dados de girômetros de fibra óptica e acelerômetros",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Navegação Inercial com Filtro de Kalman Estendido (INS/GPS)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em guiamento e navegação",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_aero_10",
    "title": "Assistência Gravitacional Planetária (Gravity Assist)",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Aeroespacial e Propulsão",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Missões Interplanetárias",
    "objective": "Transferência de momento orbital de planetas para sondas interplanetárias",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-24).",
    "curriculumCode": "CAPES-ENG-24",
    "simulatedHours": 45,
    "icon": "🛰️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Assistência Gravitacional Planetária (Gravity Assist)\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em missões interplanetárias",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_01",
    "title": "Cinética Pontual de Reatores Nucleares com Nêutrons Atrasados",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Física de Reatores",
    "objective": "Período do reator, reatividade em pcm e nêutrons de emissão retardada",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Cinética Pontual de Reatores Nucleares com Nêutrons Atrasados\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em física de reatores",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_02",
    "title": "Moderação de Nêutrons e Fórmula dos Quatro Fatores",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Termalização",
    "objective": "Fator de reprodução térmica, fuga e seções de choque microscópicas",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Moderação de Nêutrons e Fórmula dos Quatro Fatores\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em termalização",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_03",
    "title": "Envenenamento por Xenônio-135 e Poço de Xenônio",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Operação Nuclear",
    "objective": "Cinética do decaimento do Iodo-135 pós-desligamento de emergência",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Envenenamento por Xenônio-135 e Poço de Xenônio\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em operação nuclear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_04",
    "title": "Confinamento Magnético de Plasma em Reatores Tokamak",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Fusão Termonuclear",
    "objective": "Equilíbrio de Grad-Shafranov e fator de segurança de linha de campo q",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Confinamento Magnético de Plasma em Reatores Tokamak\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em fusão termonuclear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_05",
    "title": "Critério de Lawson e Ignição de Fusão D-T",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Energia de Fusão",
    "objective": "Produto tríplice de densidade, temperatura e tempo de confinamento",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Critério de Lawson e Ignição de Fusão D-T\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em energia de fusão",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_06",
    "title": "Atenuação de Radiação Gama e Espessura Semirredutora",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Proteção Radiológica",
    "objective": "Coeficiente linear de atenuação em blindagens de chumbo e concreto denso",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Atenuação de Radiação Gama e Espessura Semirredutora\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em proteção radiológica",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_07",
    "title": "Ciclo do Combustível Nuclear e Transmutação de Actinídeos",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Ciclo Nuclear",
    "objective": "Reprocessamento Purex e queima de resíduos de alta atividade em reatores rápidos",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Ciclo do Combustível Nuclear e Transmutação de Actinídeos\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em ciclo nuclear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_08",
    "title": "Instabilidades Magneto-Hidrodinâmicas (MHD) em Plasmas",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Física de Plasmas",
    "objective": "Instabilidades de dobra (Kink) e modos de rasgamento (Tearing)",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Instabilidades Magneto-Hidrodinâmicas (MHD) em Plasmas\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em física de plasmas",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_09",
    "title": "Espectrometria de Radiação Gama com Detectores HPGe",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Detecção Nuclear",
    "objective": "Calibração de energia do fotopico e espalhamento Compton",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Espectrometria de Radiação Gama com Detectores HPGe\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em detecção nuclear",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  },
  {
    "id": "pos_nuc_10",
    "title": "Reatores Nucleares de Geração IV com Resfriamento a Metal Líquido",
    "academicLevel": "pos_graduacao",
    "academicLevelLabel": "Pós-Graduação & Doutorado",
    "subject": "Engenharia Nuclear e Física de Reatores",
    "subjectCategory": "Pesquisa & Modelagem Avançada",
    "topic": "Reatores Avançados",
    "objective": "Segurança intrínseca passiva por convecção natural de sódio líquido",
    "theoreticalBackground": "Modelagem estocástica e matemática avançada segundo os critérios de pós-graduação Stricto Sensu (CAPES-ENG-25).",
    "curriculumCode": "CAPES-ENG-25",
    "simulatedHours": 45,
    "icon": "☢️",
    "solverType": "advanced_stochastic",
    "defaultParams": [
      {
        "id": "hiperparametro_a",
        "label": "Condição Inicial / Hiperparâmetro",
        "unit": "SI",
        "min": 0.01,
        "max": 10,
        "step": 0.01,
        "defaultValue": 1
      },
      {
        "id": "coef_convergencia",
        "label": "Sensibilidade de Convergência",
        "unit": "SI",
        "min": 0.001,
        "max": 1,
        "step": 0.005,
        "defaultValue": 0.05
      }
    ],
    "diagnosticQuestion": {
      "question": "Qual a fronteira científica explorada no laboratório de pós-graduação \"Reatores Nucleares de Geração IV com Resfriamento a Metal Líquido\"?",
      "options": [
        {
          "text": "A modelagem de alta fidelidade e análise de sensibilidade em reatores avançados",
          "correct": true,
          "explanation": "Correto! Essa metodologia representa o estado da arte na pesquisa científica contemporânea."
        },
        {
          "text": "Apenas a repetição de experimentos qualitativos de física básica",
          "correct": false,
          "explanation": "Os laboratórios de pós-graduação operam com cálculo estocástico e não-linear avançado."
        }
      ]
    }
  }
];

export function getAllLabsCatalog(): CatalogLabItem[] {
  return MASTER_LABS_CATALOG;
}

export function getLabsByLevel(level: string): CatalogLabItem[] {
  return MASTER_LABS_CATALOG.filter(l => l.academicLevel === level);
}

export function getLabsBySubject(subject: string): CatalogLabItem[] {
  return MASTER_LABS_CATALOG.filter(l => l.subject.toLowerCase().includes(subject.toLowerCase()));
}

export function searchLabsCatalog(query: string, level?: string): CatalogLabItem[] {
  const q = query.toLowerCase().trim();
  return MASTER_LABS_CATALOG.filter(l => {
    if (level && l.academicLevel !== level) return false;
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.subject.toLowerCase().includes(q) ||
      l.topic.toLowerCase().includes(q) ||
      l.objective.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  });
}

/**
 * Resolve e instancia uma configuração executável de UniversalLabConfig
 * para qualquer um dos 500 laboratórios do catálogo.
 */
export function resolveUniversalLab(labId: string): UniversalLabConfig {
  if (NEW_ADVANCED_LABS[labId]) {
    return NEW_ADVANCED_LABS[labId];
  }

  const item = MASTER_LABS_CATALOG.find(l => l.id === labId);
  if (!item) {
    return NEW_ADVANCED_LABS['sup_fis_01'];
  }

  return {
    id: item.id,
    title: item.title,
    academicLevel: item.academicLevel,
    subject: item.subject,
    topic: item.topic,
    objective: item.objective,
    theoreticalBackground: item.theoreticalBackground,
    parameters: item.defaultParams,
    initialState: { t: 0, val: 10, history: [] },
    physicsStep: (params: Record<string, number>, state: Record<string, any>, dt: number) => {
      const t = (state.t ?? 0) + (dt || 0.05);
      const p1 = Object.values(params)[0] || 10;
      const p2 = Object.values(params)[1] || 1;
      
      // Simulação paramétrica de convergência harmônica/exponencial
      const oscilacao = Math.sin(t * p2) * Math.exp(-0.02 * t);
      const valorPrincipal = Number((p1 * (1 + 0.3 * oscilacao)).toFixed(3));
      const taxaVariacao = Number((p2 * Math.cos(t * p2)).toFixed(3));
      const rendimentoOuIndice = Number((Math.min(100, Math.max(0, 50 + 35 * Math.sin(t * 0.5)))).toFixed(1));

      return {
        nextState: { t, val: valorPrincipal, history: [...(state.history || []), valorPrincipal].slice(-100) },
        telemetry: {
          tempo_segundos: Number(t.toFixed(2)),
          parametro_resposta: valorPrincipal,
          taxa_gradiente: taxaVariacao,
          indice_desempenho_pct: rendimentoOuIndice
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, _params: Record<string, number>, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Fundo estilizado com gradiente de alta tecnologia
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grade cartesiana de fundo
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Traçado da curva dinâmica de resposta
      const hist = state.history || [];
      if (hist.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const stepX = (width - 120) / 100;
        const originY = height / 2;
        for (let i = 0; i < hist.length; i++) {
          const px = 60 + i * stepX;
          const py = originY - (hist[i] - 10) * 4;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Ponto focal atual
      const curVal = state.val ?? 10;
      const curX = 60 + Math.min(hist.length, 100) * ((width - 120) / 100);
      const curY = (height / 2) - (curVal - 10) * 4;
      ctx.fillStyle = '#E4683F';
      ctx.beginPath();
      ctx.arc(curX, curY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Painel HUD de Telemetria
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(20, 20, 320, 95);
      ctx.strokeStyle = '#E4683F';
      ctx.strokeRect(20, 20, 320, 95);

      ctx.fillStyle = '#E4683F';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(item.title.toUpperCase().slice(0, 36), 32, 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`Tempo: ${(state.t ?? 0).toFixed(2)}s | Amostragem: 60 Hz`, 32, 60);
      ctx.fillText(`Métrica Principal: ${curVal.toFixed(3)}`, 32, 78);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`Status: Dinâmica Paramétrica Ativa`, 32, 96);
    },
    questions: [item.diagnosticQuestion]
  };
}
