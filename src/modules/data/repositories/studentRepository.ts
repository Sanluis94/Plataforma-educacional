export interface StudentProgress {
  level: number;
  xp: number;
  coins: number;
}

export const getStudentProgress = async (): Promise<StudentProgress> => {
  // Simulando chamada de API
  return {
    level: 5,
    xp: 1250,
    coins: 450,
  };
};

export const saveStudentProgress = async (progress: StudentProgress): Promise<void> => {
  console.log('Salvando progresso no Data Layer:', progress);
};
