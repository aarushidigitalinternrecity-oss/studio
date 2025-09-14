export type Urgency = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  points: number;
  completed: boolean;
  urgency: Urgency;
}

export interface Habit {
  id: string;
  name: string;
  points: number;
  completed: boolean;
}

export interface DailyRecord {
    date: string;
    points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export interface AppState {
  todayTasks: Task[];
  tomorrowTasks: Task[];
  habits: Habit[];
  history: DailyRecord[];
  weeklyPoints: number;
  weeklyGoal: number;
  dailyStreak: number;
  totalXp: number;
  achievements: Achievement[];
}
