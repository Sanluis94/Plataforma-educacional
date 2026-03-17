export interface Turma {
  id: string;
  name: string;
  studentsCount: number;
}

export const getProfessorClasses = async (): Promise<Turma[]> => {
  return [
    { id: '1', name: 'Física Moderna - 3º Ano', studentsCount: 45 },
    { id: '2', name: 'Matemática Aplicada - 2º Ano', studentsCount: 38 },
  ];
};

export const saveClass = async (name: string): Promise<Turma> => {
  const newClass = {
    id: Date.now().toString(),
    name,
    studentsCount: 0,
  };
  console.log('Salvando nova turma no Data Layer:', newClass);
  return newClass;
};
