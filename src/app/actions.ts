"use server";

import { generateTaskPoints } from "@/ai/flows/generate-task-points";
import { z } from "zod";

const inputSchema = z.object({
  tasks: z.array(z.string()).min(1),
});

export async function assignPointsForTasks(
  prevState: any,
  formData: FormData
) {
  const tasksRaw = formData.get("tasks");

  if (typeof tasksRaw !== "string" || tasksRaw.trim() === "") {
    return { success: false, error: "Tasks input is empty.", data: null };
  }

  const tasks = tasksRaw.split('\n').map(t => t.trim()).filter(t => t.length > 0);

  const validation = inputSchema.safeParse({ tasks });
  
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors.tasks?.join(", ") || "Invalid input", data: null };
  }

  try {
    const { taskPoints } = await generateTaskPoints({ tasks });
    
    if (taskPoints.length !== tasks.length) {
      return { success: false, error: "AI could not process all tasks. Please try again.", data: null };
    }

    const tasksWithPoints = tasks.map((name, index) => ({
      name,
      points: taskPoints[index],
    }));

    return { success: true, data: tasksWithPoints, error: null };
  } catch (error) {
    console.error("Error generating task points:", error);
    return { success: false, error: "Failed to generate points. Please try again later.", data: null };
  }
}
