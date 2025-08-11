'use server';
/**
 * @fileOverview An AI agent to chat with a plant care expert, leveraging past conversations and plant analysis.
 *
 * - plantCareExpertChat - A function that handles the chat with the plant care expert.
 * - PlantCareExpertChatInput - The input type for the plantCareExpertChat function.
 * - PlantCareExpertChatOutput - The return type for the plantCareExpertChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlantCareExpertChatInputSchema = z.object({
  plantAnalysis: z.string().optional().describe('The plant analysis data.'),
  chatHistory: z.array(z.object({user: z.string(), bot: z.string()})).optional().describe('The chat history.'),
  userMessage: z.string().describe('The user message to the plant care expert.'),
});
export type PlantCareExpertChatInput = z.infer<typeof PlantCareExpertChatInputSchema>;

const PlantCareExpertChatOutputSchema = z.object({
  botMessage: z.string().describe('The response from the plant care expert.'),
});
export type PlantCareExpertChatOutput = z.infer<typeof PlantCareExpertChatOutputSchema>;

export async function plantCareExpertChat(input: PlantCareExpertChatInput): Promise<PlantCareExpertChatOutput> {
  return plantCareExpertChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantCareExpertChatPrompt',
  input: {schema: PlantCareExpertChatInputSchema},
  output: {schema: PlantCareExpertChatOutputSchema},
  prompt: `You are a helpful AI plant care expert. Your name is Izy.

  You have access to the following information:
  - Plant analysis: {{{plantAnalysis}}}
  - Chat history: {{#each chatHistory}}User: {{{this.user}}}\nBot: {{{this.bot}}}\n{{/each}}

  The user is now asking: {{{userMessage}}}

  What is your response?`,
});

const plantCareExpertChatFlow = ai.defineFlow(
  {
    name: 'plantCareExpertChatFlow',
    inputSchema: PlantCareExpertChatInputSchema,
    outputSchema: PlantCareExpertChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
