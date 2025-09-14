"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppState, Task } from '@/lib/types';
import { initialData } from '@/lib/data';

const STORAGE_KEY = 'atomic-habit-tracker-state';

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
    if (!internalState) return;
    setInternalState(updater);
  };

  const toggleTask = useCallback((taskId: string) => {
    updateState(prevState => {
      let taskFound = false;
      const updatedTasks = prevState.todayTasks.map(task => {
        if (task.id === taskId) {
          taskFound = true;
          return { ...task, completed: !task.completed };
        }
        return task;
      });

      if (!taskFound) return prevState;

      const task = prevState.todayTasks.find(t => t.id === taskId)!;
      const pointsChange = task.completed ? -task.points : task.points;
      
      const newWeeklyPoints = prevState.weeklyPoints + pointsChange;
      const newTotalXp = prevState.totalXp + pointsChange * 10;

      return {
        ...prevState,
        todayTasks: updatedTasks,
        weeklyPoints: Math.max(0, newWeeklyPoints),
        totalXp: Math.max(0, newTotalXp),
      };
    });
  }, []);

  const addTomorrowTasks = useCallback((tasks: { name: string, points: number }[]) => {
    updateState(prevState => {
      const newTasks: Task[] = tasks.map((task, index) => ({
        id: `tm-${Date.now()}-${index}`,
        name: task.name,
        points: task.points,
        completed: false,
      }));

      return {
        ...prevState,
        tomorrowTasks: [...prevState.tomorrowTasks, ...newTasks],
      };
    });
  }, []);
  
  const state = internalState ? {
    ...internalState,
    ...calculateLevelInfo(internalState.totalXp),
  } : null;

  return { state, isLoaded, toggleTask, addTomorrowTasks };
}
