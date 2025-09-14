export interface Task {
  id: string;
  name: string;
  points: number;
  completed: boolean;
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
  weeklyPoints: number;
  weeklyGoal: number;
  dailyStreak: number;
  totalXp: number;
  achievements: Achievement[];
}
