import type { AppState } from './types';

export const initialAchievements = [
  { id: '1', name: 'First Step', description: 'Complete your first task.', unlocked: false, icon: 'Footprints' },
  { id: '2', name: 'Novice', description: 'Reach level 5.', unlocked: false, icon: 'Star' },
  { id: '3', name: 'Adept', description: 'Reach level 10.', unlocked: false, icon: 'Gem' },
];

export const initialData: AppState = {
  todayTasks: [
    { id: 't1', name: 'Review project plan', points: 3, completed: false },
    { id: 't2', name: 'Create initial mockups for the new feature', points: 8, completed: false },
    { id: 't3', name: 'Reply to important emails', points: 2, completed: false },
    { id: 't4', name: 'Morning workout session', points: 5, completed: false },
  ],
  tomorrowTasks: [],
  weeklyPoints: 5,
  weeklyGoal: 70,
  dailyStreak: 3,
  totalXp: 20,
  achievements: initialAchievements,
};
