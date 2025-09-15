"use client";

import * as React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { AppState, Urgency, Task } from '@/lib/types';
import { calculateLevelInfo } from '@/hooks/use-atomic-state';
import { ListTodo, Plus, Flame, Edit, Save, X, Zap, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
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

interface TasksTabProps {
  state: AppState & ReturnType<typeof calculateLevelInfo>;
  toggleTask: (id: string) => void;
  addTodayTask: (name: string, urgency: Urgency) => void;
  addTomorrowTask: (name: string, urgency: Urgency) => void;
  updateTask: (id: string, name: string, urgency: Urgency) => void;
  deleteTask: (id: string) => void;
}

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "text-green-500 border-green-500/50",
  medium: "text-yellow-500 border-yellow-500/50",
  high: "text-red-500 border-red-500/50",
};

function TaskItem({ task, onToggle, onUpdate, onDelete }: { task: Task, onToggle: (id: string) => void, onUpdate: (id: string, name: string, urgency: Urgency) => void, onDelete: (id: string) => void }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(task.name);
  const [urgency, setUrgency] = React.useState<Urgency>(task.urgency);

  const handleSave = () => {
    if(name.trim()) {
      onUpdate(task.id, name.trim(), urgency);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(task.name);
    setUrgency(task.urgency);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className={cn("h-5 w-5", task.completed && "data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500")}
        disabled={isEditing}
      />
      {isEditing ? (
        <div className="flex-grow grid gap-2 grid-cols-[1fr_auto_auto_auto_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
          <Select value={urgency} onValueChange={(v: Urgency) => setUrgency(v)}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
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
                  This action cannot be undone. This will permanently delete the task "{task.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <>
          <label
            htmlFor={`task-${task.id}`}
            className={`flex-grow cursor-pointer text-sm transition-colors ${task.completed ? "line-through text-muted-foreground" : ""}`}
            onClick={() => setIsEditing(true)}
          >
            {task.name}
          </label>
           {task.urgency && <div className={cn("text-xs font-semibold px-2 py-1 border rounded-full flex items-center gap-1", URGENCY_STYLES[task.urgency])}>
            <Flame className="h-3 w-3" />
            <span>{task.urgency.charAt(0).toUpperCase() + task.urgency.slice(1)}</span>
          </div>}
          <span className="text-sm font-semibold text-primary w-16 text-right">{task.points} pts</span>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function AddTaskForm({ onAddTask, disabled, listName, onBreakDown }: { onAddTask: (name: string, urgency: Urgency) => void, disabled: boolean, listName: string, onBreakDown: (name: string) => void }) {
  const [name, setName] = React.useState('');
  const [urgency, setUrgency] = React.useState<Urgency>('medium');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Task name is empty",
        description: "Please enter a name for the task.",
      });
      return;
    }
    if (disabled) {
      toast({
        variant: "destructive",
        title: "Task limit reached",
        description: `You can only add up to 10 tasks for ${listName}.`,
      });
      return;
    }
    onAddTask(name.trim(), urgency);
    setName('');
    setUrgency('medium');
    toast({
      title: `Task added to ${listName}'s plan!`,
    });
  };
  
  const handleBreakDown = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Task name is empty",
        description: "Please enter a name for the task to break it down.",
      });
      return;
    }
    onBreakDown(name.trim());
    setName(`Do ${name.trim()} for 2 minutes`);
    setUrgency('low');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`new-task-name-${listName}`}>New Task Name</Label>
        <Input 
          id={`new-task-name-${listName}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Water the plants"
          disabled={disabled}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`new-task-urgency-${listName}`}>Urgency</Label>
        <Select value={urgency} onValueChange={(v: Urgency) => setUrgency(v)} disabled={disabled}>
          <SelectTrigger id={`new-task-urgency-${listName}`} className="w-full">
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="flex-grow sm:flex-grow-0" disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
        <Button type="button" variant="outline" onClick={handleBreakDown} className="flex-grow sm:flex-grow-0" disabled={disabled}>
            <Zap className="mr-2 h-4 w-4" />
            Break it down
        </Button>
      </div>
    </form>
  )
}

export function TasksTab({ state, toggleTask, addTodayTask, addTomorrowTask, updateTask, deleteTask }: TasksTabProps) {
  const { todayTasks, tomorrowTasks } = state;
  const { toast } = useToast();
  const isTodayTaskLimitReached = (todayTasks || []).length >= 10;
  const isTomorrowTaskLimitReached = (tomorrowTasks || []).length >= 10;
  
  const handleBreakDown = (taskName: string) => {
    toast({
        title: "Task broken down!",
        description: `New task: "Do ${taskName} for 2 minutes"`,
    });
  };

  return (
    <div className="grid gap-6 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Today's Tasks
            </div>
            <span className="text-sm font-normal text-muted-foreground">{ (todayTasks || []).length} / 10</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            {(todayTasks || []).length > 0 ? (
              <div className="space-y-2 pr-4">
                {(todayTasks || []).map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onUpdate={updateTask} onDelete={deleteTask} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No tasks for today. Great job, or time to plan!</p>
            )}
          </ScrollArea>
        </CardContent>
         <Accordion type="single" collapsible className="w-full border-t">
          <AccordionItem value="add-today-task" className="border-b-0">
            <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
              Add a task for today
            </AccordionTrigger>
            <AccordionContent className="px-6">
              <AddTaskForm onAddTask={addTodayTask} disabled={isTodayTaskLimitReached} listName="today" onBreakDown={handleBreakDown} />
              {isTodayTaskLimitReached && (
                  <p className="text-sm text-center text-yellow-500 mt-4">Task limit for today reached.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tomorrow's Plan</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label>Add a Task</Label>
                <AddTaskForm onAddTask={addTomorrowTask} disabled={isTomorrowTaskLimitReached} listName="tomorrow" onBreakDown={handleBreakDown} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Planned Tasks</Label>
                  <span className="text-sm text-muted-foreground">{(tomorrowTasks || []).length} / 10</span>
                </div>
                {(tomorrowTasks || []).length > 0 ? (
                  <ScrollArea className="h-48">
                    <ul className="space-y-2 text-sm text-muted-foreground pr-4">
                      {(tomorrowTasks || []).map((task) => (
                        <li key={task.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                          <Plus className="h-4 w-4 text-primary" />
                          <span className="flex-grow">{task.name}</span>
                           <span className={cn("text-xs font-semibold", URGENCY_STYLES[task.urgency])}>{task.points} pts</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm">No tasks planned for tomorrow.</p>
                  </div>
                )}
                 {isTomorrowTaskLimitReached && (
                  <p className="text-sm text-center text-yellow-500">Task limit for tomorrow reached.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    