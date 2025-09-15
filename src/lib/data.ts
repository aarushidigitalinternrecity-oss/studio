import type { AppState } from './types';

export const initialAchievements = [
  { id: '1', name: 'First Step', description: 'Complete your first task.', unlocked: false, icon: 'Footprints' },
  { id: '2', name: 'Novice', description: 'Reach level 5.', unlocked: false, icon: 'Star' },
  { id: '3', name: 'Adept', description: 'Reach level 10.', unlocked: false, icon: 'Gem' },
];

export const initialHabits = [
    { id: 'h1', name: 'Drank 8 glasses of water', points: 10, completed: false },
    { id: 'h2', name: 'Read for 20 minutes', points: 15, completed: false },
];

export const initialData: AppState = {
  todayTasks: [],
  tomorrowTasks: [],
  habits: [],
  history: [],
  weeklyPoints: 0,
  weeklyGoal: 250,
  dailyStreak: 0,
  totalXp: 0,
  achievements: initialAchievements,
};
