"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppState, Task, Urgency } from '@/lib/types';
import { initialData } from '@/lib/data';

const STORAGE_KEY = 'atomic-habit-tracker-state';

const URGENCY_POINTS: Record<Urgency, number> = {
  low: 5,
  medium: 10,
  high: 20,
};

export const calculateLevelInfo = (totalXp: number) => {
  let level = 1;
  let xpForNext = 100;
  let xpAccumulated = 0;
  
  while (totalXp >= xpAccumulated + xpForNext) {
    xpAccumulated += xpForNext;
    level++;
    xpForNext = Math.floor(xpForNext * 1.5);
  }
  
  const xpInLevel = totalXp - xpAccumulated;
  return { level, xp: xpInLevel, xpToNextLevel: xpForNext };
};


export function useAtomicState() {
  const [internalState, setInternalState] = useState<AppState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        setInternalState(JSON.parse(storedState));
      } else {
        setInternalState(initialData);
      }
    } catch (error) {
      console.error("Failed to load state from local storage:", error);
      setInternalState(initialData);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (internalState && isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(internalState));
      } catch (error) {
        console.error("Failed to save state to local storage:", error);
      }
    }
  }, [internalState, isLoaded]);
  
  const updateState = (updater: (prevState: AppState) => AppState) => {
    setInternalState(prevState => {
      if (!prevState) return null;
      return updater(prevState);
    });
  };

  const toggleTask = useCallback((taskId: string) => {
    updateState(prevState => {
      const task = prevState.todayTasks.find(t => t.id === taskId);
      if (!task) return prevState;

      const pointsChange = task.completed ? -task.points : task.points;
      
      return {
        ...prevState,
        todayTasks: prevState.todayTasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
        weeklyPoints: Math.max(0, prevState.weeklyPoints + pointsChange),
        totalXp: Math.max(0, prevState.totalXp + pointsChange * 10),
      };
    });
  }, []);

  const addTodayTask = useCallback((name: string, urgency: Urgency) => {
    updateState(prevState => {
      const newTask: Task = {
        id: `td-${Date.now()}`,
        name,
        urgency,
        points: URGENCY_POINTS[urgency],
        completed: false,
      };
      return {
        ...prevState,
        todayTasks: [...prevState.todayTasks, newTask],
      };
    });
  }, []);

  const addTomorrowTask = useCallback((name: string, urgency: Urgency) => {
    updateState(prevState => {
      const newTask: Task = {
        id: `tm-${Date.now()}`,
        name,
        urgency,
        points: URGENCY_POINTS[urgency],
        completed: false,
      };
      return {
        ...prevState,
        tomorrowTasks: [...prevState.tomorrowTasks, newTask],
      };
    });
  }, []);

  const updateTask = useCallback((taskId: string, newName: string, newUrgency: Urgency) => {
    updateState(prevState => {
      const task = prevState.todayTasks.find(t => t.id === taskId);
      if (!task) return prevState;

      const newPoints = URGENCY_POINTS[newUrgency];
      
      let weeklyPoints = prevState.weeklyPoints;
      let totalXp = prevState.totalXp;

      if(task.completed) {
        const pointsDifference = newPoints - task.points;
        weeklyPoints = Math.max(0, weeklyPoints + pointsDifference);
        totalXp = Math.max(0, totalXp + pointsDifference * 10);
      }
      
      return {
        ...prevState,
        todayTasks: prevState.todayTasks.map(t =>
          t.id === taskId ? { ...t, name: newName, urgency: newUrgency, points: newPoints } : t
        ),
        weeklyPoints,
        totalXp
      };
    });
  }, []);
  
  const state = internalState ? {
    ...internalState,
    ...calculateLevelInfo(internalState.totalXp),
  } : null;

  return { state, isLoaded, toggleTask, addTodayTask, addTomorrowTask, updateTask };
}
