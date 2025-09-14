import type { AppState } from './types';

export const initialAchievements = [
  { id: '1', name: 'First Step', description: 'Complete your first task.', unlocked: false, icon: 'Footprints' },
  { id: '2', name: 'Novice', description: 'Reach level 5.', unlocked: false, icon: 'Star' },
  { id: '3', name: 'Adept', description: 'Reach level 10.', unlocked: false, icon: 'Gem' },
];

export const initialHabits = [
    { id: 'h1', name: 'Drank 8 glasses of water', points: 10, completed: false },
    { id: 'h2', name: 'Read for 20 minutes', points: 15, completed: false },
    { id: 'h3', name: 'Meditated for 10 minutes', points: 15, completed: false },
    { id: 'h4', name: 'No social media for 1 hour before bed', points: 20, completed: false },
];

export const initialData: AppState = {
  todayTasks: [
    { id: 't1', name: 'Finalize Q3 report', points: 20, completed: false, urgency: 'high' },
    { id: 't2', name: 'Prep for team meeting', points: 10, completed: false, urgency: 'medium' },
    { id: 't3', name: 'Reply to important emails', points: 10, completed: false, urgency: 'medium' },
    { id: 't4', name: 'Schedule dentist appointment', points: 5, completed: false, urgency: 'low' },
  ],
  tomorrowTasks: [],
  habits: initialHabits,
  history: [],
  weeklyPoints: 0,
  weeklyGoal: 250,
  dailyStreak: 3,
  totalXp: 0,
  achievements: initialAchievements,
};
