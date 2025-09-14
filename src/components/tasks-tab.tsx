"use client";

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { assignPointsForTasks } from "@/app/actions";
import type { AppState } from '@/lib/types';
import { calculateLevelInfo } from '@/hooks/use-atomic-state';
import { ListTodo, Plus, Sparkles, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TasksTabProps {
  state: AppState & ReturnType<typeof calculateLevelInfo>;
  toggleTask: (id: string) => void;
  addTomorrowTasks: (tasks: { name: string, points: number }[]) => void;
}

const initialState = {
  success: false,
  error: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate & Add Tasks
        </>
      )}
    </Button>
  );
}

export function TasksTab({ state, toggleTask, addTomorrowTasks }: TasksTabProps) {
  const { todayTasks, tomorrowTasks } = state;
  const [formState, formAction] = useFormState(assignPointsForTasks, initialState);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (formState.success && formState.data) {
      addTomorrowTasks(formState.data);
      toast({
        title: "Tasks added!",
        description: "Your new tasks for tomorrow have been planned.",
      });
      formRef.current?.reset();
    } else if (!formState.success && formState.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: formState.error,
      });
    }
  }, [formState, addTomorrowTasks, toast]);

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
          <ScrollArea className="h-64">
            {todayTasks.length > 0 ? (
              <div className="space-y-4 pr-4">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-grow cursor-pointer text-sm transition-colors ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.name}
                    </label>
                    <span className="text-sm font-semibold text-primary">{task.points} pts</span>
                  </div>
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
            <div className="grid gap-6">
              {tomorrowTasks.length > 0 && (
                <div className="space-y-3">
                  <Label>Planned Tasks</Label>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {tomorrowTasks.map((task) => (
                      <li key={task.id} className="flex items-center gap-2 animate-in fade-in-0 duration-300">
                        <Plus className="h-4 w-4 text-primary" />
                        <span>{task.name} ({task.points} pts)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form action={formAction} ref={formRef} className="space-y-4">
                <div>
                  <Label htmlFor="tasks-input">Add New Tasks</Label>
                  <Textarea
                    id="tasks-input"
                    name="tasks"
                    placeholder="Enter tasks for tomorrow, one per line. For example:&#10;- Finalize Q3 report&#10;- Prep for team meeting"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">Our AI will assign point values based on complexity.</p>
                </div>
                <SubmitButton />
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
