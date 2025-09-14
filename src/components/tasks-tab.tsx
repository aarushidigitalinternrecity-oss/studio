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
import { ListTodo, Plus, Flame, Edit, Save, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface TasksTabProps {
  state: AppState & ReturnType<typeof calculateLevelInfo>;
  toggleTask: (id: string) => void;
  addTomorrowTask: (name: string, urgency: Urgency) => void;
  updateTask: (id: string, name: string, urgency: Urgency) => void;
}

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "text-green-500 border-green-500/50",
  medium: "text-yellow-500 border-yellow-500/50",
  high: "text-red-500 border-red-500/50",
};

function TaskItem({ task, onToggle, onUpdate }: { task: Task, onToggle: (id: string) => void, onUpdate: (id: string, name: string, urgency: Urgency) => void }) {
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
      />
      {isEditing ? (
        <div className="flex-grow grid gap-2 grid-cols-[1fr_auto_auto_auto]">
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

function AddTaskForm({ onAddTask }: { onAddTask: (name: string, urgency: Urgency) => void }) {
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
    onAddTask(name.trim(), urgency);
    setName('');
    setUrgency('medium');
    toast({
      title: "Task added to tomorrow's plan!",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="new-task-name">New Task Name</Label>
        <Input 
          id="new-task-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Water the plants"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new-task-urgency">Urgency</Label>
        <Select value={urgency} onValueChange={(v: Urgency) => setUrgency(v)}>
          <SelectTrigger id="new-task-urgency" className="w-full">
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </form>
  )
}

export function TasksTab({ state, toggleTask, addTomorrowTask, updateTask }: TasksTabProps) {
  const { todayTasks, tomorrowTasks } = state;

  return (
    <div className="grid gap-6 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            {todayTasks.length > 0 ? (
              <div className="space-y-2 pr-4">
                {todayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} onUpdate={updateTask} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No tasks for today. Great job, or time to plan!</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tomorrow's Plan</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label>Add a Task</Label>
                <AddTaskForm onAddTask={addTomorrowTask} />
              </div>
              <div className="space-y-4">
                <Label>Planned Tasks</Label>
                {tomorrowTasks.length > 0 ? (
                  <ScrollArea className="h-48">
                    <ul className="space-y-2 text-sm text-muted-foreground pr-4">
                      {tomorrowTasks.map((task) => (
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
