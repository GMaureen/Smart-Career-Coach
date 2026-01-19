
export interface StudyEntry {
  id: string;
  question: string;
  answer: string;
  topic: string;
  timestamp: number;
  notesUsed?: string;
  hasImage?: boolean;
  generatedImageUrl?: string;
  audioData?: string; // base64
}

export interface UserProgress {
  totalQuestions: number;
  studyHours: number;
  topicsMastered: Record<string, number>;
  streak: number;
  lastStudyDate: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export enum NavigationTab {
  CHAT = 'chat',
  HISTORY = 'history',
  DASHBOARD = 'dashboard',
  QUIZ = 'quiz'
}

export const SA_LANGUAGES = [
  "English", "Afrikaans", "isiXhosa", "isiZulu", "Sepedi", 
  "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga", "isiNdebele"
];
