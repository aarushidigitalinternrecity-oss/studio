'use server';

/**
 * @fileOverview Generates point values for tasks based on their complexity using an LLM.
 *
 * - generateTaskPoints - A function that generates point values for a list of tasks.
 * - GenerateTaskPointsInput - The input type for the generateTaskPoints function.
 * - GenerateTaskPointsOutput - The return type for the generateTaskPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskPointsInputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of tasks to assign point values to.'),
});
export type GenerateTaskPointsInput = z.infer<typeof GenerateTaskPointsInputSchema>;

const GenerateTaskPointsOutputSchema = z.object({
  taskPoints: z.array(z.number().min(1).max(10)).describe('A list of point values for the tasks, ranging from 1 to 10.'),
});
export type GenerateTaskPointsOutput = z.infer<typeof GenerateTaskPointsOutputSchema>;

export async function generateTaskPoints(input: GenerateTaskPointsInput): Promise<GenerateTaskPointsOutput> {
  return generateTaskPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskPointsPrompt',
  input: {schema: GenerateTaskPointsInputSchema},
  output: {schema: GenerateTaskPointsOutputSchema},
  prompt: `You are a productivity expert who assigns point values to tasks based on their complexity and estimated time to complete.

  You will receive a list of tasks. For each task, assign a point value between 1 and 10, where 1 is a very simple and quick task, and 10 is a very complex and time-consuming task.

  Return a JSON array where each element of the array is an integer which represents the point values for the corresponding task. 

  Tasks:
  {{#each tasks}}
  - {{{this}}}
  {{/each}}

  Output: An array of point values for the tasks, ranging from 1 to 10.
  Example: [3, 7, 2, 9, 5]
  `, // Ensure the prompt asks for a JSON array of numbers
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateTaskPointsFlow = ai.defineFlow(
  {
    name: 'generateTaskPointsFlow',
    inputSchema: GenerateTaskPointsInputSchema,
    outputSchema: GenerateTaskPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
