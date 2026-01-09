
export enum ExerciseType {
  LEARN = 'LEARN',         // Etapa 1: Aprender (Observação + Áudio)
  LISTEN = 'LISTEN',       // Etapa 2: Escutar (Reconhecimento auditivo)
  PRACTICE = 'PRACTICE',   // Etapa 3: Praticar (Reconhecimento/Múltipla escolha)
  TRANSLATE = 'TRANSLATE', // Etapa 4: Traduzir (Tradução simples)
  SPEAK = 'SPEAK'          // Etapa 5: Falar (Pronúncia)
}

export enum Difficulty {
  FACIL = 'Fácil',
  MEDIO = 'Médio',
  DIFICIL = 'Difícil'
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetText?: string;
  audioText?: string;
  options?: string[];
  explanation?: string;
  context?: string;
}

export interface UserStats {
  xp: number;
  streak: number;
  hearts: number;
  coins: number;
  currentLevel: number;
  name?: string;
  goal?: number;
}

export enum AppState {
  START = 'START',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  LESSON = 'LESSON',
  COMPLETED = 'COMPLETED'
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}
