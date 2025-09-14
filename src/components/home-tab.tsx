"use client";

import * as React from "react";
import { BarChart, Gem, Star, Zap, Footprints } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AppState } from "@/lib/types";
import { calculateLevelInfo } from "@/hooks/use-atomic-state";

interface HomeTabProps {
  state: AppState & ReturnType<typeof calculateLevelInfo>;
}

const iconMap: { [key: string]: React.ElementType } = {
  Footprints,
  Star,
  Gem,
};

export function HomeTab({ state }: HomeTabProps) {
  const { weeklyPoints, weeklyGoal, dailyStreak, level, xp, xpToNextLevel, achievements } = state;
  const weeklyProgress = weeklyGoal > 0 ? (weeklyPoints / weeklyGoal) * 100 : 0;
  const xpProgress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  const nextAchievement = achievements.find(a => !a.unlocked);
  const NextAchievementIcon = nextAchievement ? iconMap[nextAchievement.icon] : null;

  return (
    <div className="grid gap-6 animate-in fade-in-0 duration-500">
      <Card className="md:col-span-2 text-center bg-card border-primary/20">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold text-primary tracking-tight">Build Habits That Stick</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Turn your goals into daily actions. Track your progress, build streaks, and level up your life, one atomic habit at a time.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Goal Progress</CardTitle>
            <CardDescription>
              Your progress towards your weekly goal of {weeklyGoal} points.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={weeklyProgress} className="h-4 transition-all duration-500" />
            <p className="text-right font-medium text-primary">
              {weeklyPoints} / {weeklyGoal} points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{dailyStreak}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Level {level}</div>
            <p className="text-xs text-muted-foreground">
              {xp} / {xpToNextLevel} XP to next level
            </p>
            <Progress value={xpProgress} className="h-2 mt-2 transition-all duration-500" />
          </CardContent>
        </Card>
        
        {nextAchievement && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Next Achievement</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {NextAchievementIcon && <NextAchievementIcon className="h-10 w-10 text-primary" />}
              <div>
                <p className="font-semibold">{nextAchievement.name}</p>
                <p className="text-sm text-muted-foreground">{nextAchievement.description}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
