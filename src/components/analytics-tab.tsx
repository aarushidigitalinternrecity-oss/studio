"use client"

import * as React from "react"
import { BarChart, Calendar as CalendarIcon, CheckSquare, TrendingUp } from "lucide-react"
import { addDays, format, startOfWeek } from "date-fns"
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import type { AppState, DailyRecord } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AnalyticsTabProps {
  state: AppState & {
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  toggleHabit: (id: string) => void;
  addDailyRecord: (points: number) => void;
}

const COLORS = ["#E51A4C", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8"];

export function AnalyticsTab({ state, toggleHabit }: AnalyticsTabProps) {
  const { habits, todayTasks, history } = state;

  const pointData = React.useMemo(() => {
    const safeTodayTasks = todayTasks || [];
    const safeHabits = habits || [];

    const low = safeTodayTasks.filter(t => t.completed && t.urgency === 'low').reduce((acc, t) => acc + t.points, 0);
    const medium = safeTodayTasks.filter(t => t.completed && t.urgency === 'medium').reduce((acc, t) => acc + t.points, 0);
    const high = safeTodayTasks.filter(t => t.completed && t.urgency === 'high').reduce((acc, t) => acc + t.points, 0);
    const habitPoints = safeHabits.filter(h => h.completed).reduce((acc, h) => acc + h.points, 0);

    const data = [
      { name: "Low Urgency", value: low },
      { name: "Medium Urgency", value: medium },
      { name: "High Urgency", value: high },
      { name: "Habits", value: habitPoints },
    ].filter(d => d.value > 0);
    
    return data;
  }, [todayTasks, habits]);

  const calendarModifiers = React.useMemo(() => {
    const modifiers: Record<string, Date[]> = {
      highlighted: [],
    };
    const pointsByDay: { [key: string]: number } = {};
    let maxPoints = 0;

    (history || []).forEach(record => {
      const date = new Date(record.date);
      date.setUTCHours(0,0,0,0);
      const dateString = format(date, 'yyyy-MM-dd');
      pointsByDay[dateString] = (pointsByDay[dateString] || 0) + record.points;
      if (pointsByDay[dateString] > maxPoints) {
        maxPoints = pointsByDay[dateString];
      }
    });

    for (const dateStr in pointsByDay) {
      if(pointsByDay[dateStr] > 0) {
        const opacity = Math.max(0.2, pointsByDay[dateStr] / maxPoints);
        modifiers[`opacity-${opacity.toFixed(1)}`] = [new Date(dateStr)];
      }
    }
    
    return modifiers;
  }, [history]);
  
  const calendarModifierStyles = React.useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    for (let i = 2; i <= 10; i++) {
        const opacity = i / 10;
        styles[`opacity-${opacity.toFixed(1)}`] = {
            backgroundColor: `rgba(229, 26, 76, ${opacity})`,
            color: 'white',
        };
    }
    return styles;
  }, []);

  return (
    <div className="grid gap-6 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Habit Scorecard
          </CardTitle>
          <CardDescription>
            Check off your daily habits to build consistency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(habits || []).map(habit => (
            <div key={habit.id} className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
              <Checkbox
                id={`habit-${habit.id}`}
                checked={habit.completed}
                onCheckedChange={() => toggleHabit(habit.id)}
                className={cn("h-5 w-5", habit.completed && "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500")}
              />
              <label
                htmlFor={`habit-${habit.id}`}
                className={`flex-grow cursor-pointer text-sm transition-colors ${habit.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {habit.name}
              </label>
              <span className="text-sm font-semibold text-primary">{habit.points} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Point Breakdown
          </CardTitle>
          <CardDescription>
            Distribution of points earned from completed tasks and habits today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            {pointData.length > 0 ? (
                <PieChart>
                <Pie data={pointData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pointData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    }}
                />
                </PieChart>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">No points earned today. Complete some tasks!</p>
                </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Historical Performance
          </CardTitle>
          <CardDescription>
            Your daily consistency chain. Darker red means more points earned.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={new Date()}
            modifiers={calendarModifiers}
            modifiersStyles={calendarModifierStyles}
            className="rounded-md border p-0"
          />
        </CardContent>
      </Card>
    </div>
  )
}
