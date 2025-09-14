"use client"

import * as React from "react"
import { BarChart, Calendar as CalendarIcon, CheckSquare, Edit, Plus, Save, Trash2, X } from "lucide-react"
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
import type { AppState, DailyRecord, Habit } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AnalyticsTabProps {
  state: AppState & {
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  toggleHabit: (id: string) => void;
  addHabit: (name: string, points: number) => void;
  updateHabit: (id: string, name: string, points: number) => void;
  deleteHabit: (id: string) => void;
  addDailyRecord: (points: number) => void;
}

const COLORS = ["#E51A4C", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8"];

function HabitItem({ habit, onToggle, onUpdate, onDelete }: { habit: Habit, onToggle: (id: string) => void, onUpdate: (id: string, name: string, points: number) => void, onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(habit.name);
  const [points, setPoints] = React.useState(habit.points.toString());

  const handleSave = () => {
    const pointValue = parseInt(points, 10);
    if(name.trim() && !isNaN(pointValue) && pointValue > 0) {
      onUpdate(habit.id, name.trim(), pointValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(habit.name);
    setPoints(habit.points.toString());
    setIsEditing(false);
  };
  
  return (
    <div className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
       <Checkbox
          id={`habit-${habit.id}`}
          checked={habit.completed}
          onCheckedChange={() => onToggle(habit.id)}
          className={cn("h-5 w-5", habit.completed && "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500")}
          disabled={isEditing}
        />
      {isEditing ? (
        <div className="flex-grow grid gap-2 grid-cols-[1fr_80px_auto_auto_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
          <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="h-9 w-20" placeholder="Pts" />
          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSave}><Save className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancel}><X className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the habit "{habit.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(habit.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <>
          <label
            htmlFor={`habit-${habit.id}`}
            className={`flex-grow cursor-pointer text-sm transition-colors ${habit.completed ? "line-through text-muted-foreground" : ""}`}
            onClick={() => setIsEditing(true)}
          >
            {habit.name}
          </label>
          <span className="text-sm font-semibold text-primary w-16 text-right">{habit.points} pts</span>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function AddHabitForm({ onAddHabit }: { onAddHabit: (name: string, points: number) => void }) {
  const [name, setName] = React.useState('');
  const [points, setPoints] = React.useState('10');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pointValue = parseInt(points, 10);
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Habit name is empty",
        description: "Please enter a name for the habit.",
      });
      return;
    }
    if (isNaN(pointValue) || pointValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid points",
        description: "Please enter a positive number for points.",
      });
      return;
    }
    onAddHabit(name.trim(), pointValue);
    setName('');
    setPoints('10');
    toast({
      title: `Habit "${name.trim()}" added!`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_80px] gap-2">
        <div>
            <Label htmlFor="new-habit-name">Habit Name</Label>
            <Input 
            id="new-habit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Go for a walk"
            />
        </div>
        <div>
            <Label htmlFor="new-habit-points">Points</Label>
            <Input 
            id="new-habit-points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            />
        </div>
      </div>
      <Button type="submit">
        <Plus className="mr-2 h-4 w-4" />
        Add Habit
      </Button>
    </form>
  )
}

export function AnalyticsTab({ state, toggleHabit, addHabit, updateHabit, deleteHabit }: AnalyticsTabProps) {
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
            Check off your daily habits to build consistency. Click a habit to edit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(habits || []).map(habit => (
             <HabitItem key={habit.id} habit={habit} onToggle={toggleHabit} onUpdate={updateHabit} onDelete={deleteHabit} />
          ))}
          {habits.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No habits yet. Add one below!</p>
          )}
        </CardContent>
         <Accordion type="single" collapsible className="w-full border-t">
          <AccordionItem value="add-habit" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
              Add a new habit
            </AccordionTrigger>
            <AccordionContent className="px-6">
              <AddHabitForm onAddHabit={addHabit} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
