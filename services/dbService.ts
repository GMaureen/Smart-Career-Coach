
import { StudyEntry, UserProgress } from '../types';
import { STORAGE_KEY_HISTORY, STORAGE_KEY_PROGRESS, DEFAULT_PROGRESS } from '../constants';

export const dbService = {
  getHistory: (): StudyEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveHistory: (history: StudyEntry[]) => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  },

  addEntry: (entry: StudyEntry) => {
    const history = dbService.getHistory();
    history.unshift(entry);
    dbService.saveHistory(history);
  },

  getProgress: (): UserProgress => {
    const data = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return data ? JSON.parse(data) : DEFAULT_PROGRESS;
  },

  updateProgress: (topic: string) => {
    const progress = dbService.getProgress();
    const today = new Date().toISOString().split('T')[0];
    
    // Update basic stats
    progress.totalQuestions += 1;
    progress.studyHours = +(progress.studyHours + 0.1).toFixed(1);
    
    // Update topics
    progress.topicsMastered[topic] = (progress.topicsMastered[topic] || 0) + 1;
    
    // Update streak
    if (progress.lastStudyDate !== today) {
        const lastDate = new Date(progress.lastStudyDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toDateString() === yesterday.toDateString()) {
            progress.streak += 1;
        } else {
            progress.streak = 1;
        }
        progress.lastStudyDate = today;
    }

    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    return progress;
  }
};
