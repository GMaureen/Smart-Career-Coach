
export const APP_NAME = "FundaBuddy AI";
export const STORAGE_KEY_HISTORY = "fundabuddy_history";
export const STORAGE_KEY_PROGRESS = "fundabuddy_progress";

export const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#3b82f6', // blue-500
  'Science': '#60a5fa', // blue-400
  'History': '#93c5fd', // blue-300
  'Computer Science': '#2563eb', // blue-600
  'Literature': '#1d4ed8', // blue-700
  'Other': '#64748b'
};

export const DEFAULT_PROGRESS = {
  totalQuestions: 0,
  studyHours: 0,
  topicsMastered: {},
  streak: 0,
  lastStudyDate: new Date().toISOString().split('T')[0]
};
