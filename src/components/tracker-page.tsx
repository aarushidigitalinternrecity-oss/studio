"use client";

import { useAtomicState } from "@/hooks/use-atomic-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeTab } from "@/components/home-tab";
import { TasksTab } from "@/components/tasks-tab";
import { AnalyticsTab } from "@/components/analytics-tab";
import { AtomIcon } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

export function TrackerPage() {
  const { state, isLoaded, toggleTask, addTodayTask, addTomorrowTask, updateTask, toggleHabit, addDailyRecord } = useAtomicState();

  if (!isLoaded || !state) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AtomIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
            Atomic Habit Tracker
          </h1>
        </div>
      </header>
      
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="mt-6">
          <HomeTab state={state} />
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <TasksTab 
            state={state} 
            toggleTask={toggleTask} 
            addTodayTask={addTodayTask}
            addTomorrowTask={addTomorrowTask}
            updateTask={updateTask}
          />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab
            state={state}
            toggleHabit={toggleHabit}
            addDailyRecord={addDailyRecord}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
      </header>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
