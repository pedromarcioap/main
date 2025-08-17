'use server';
/**
 * @fileOverview An AI agent to chat with a plant care expert, leveraging past conversations and plant analysis.
 *
 * - plantCareExpertChat - A function that handles the chat with the plant care expert.
 * - PlantCareExpertChatInput - The input type for the plantCareExpertChat function.
 * - PlantCareExpertChatOutput - The return type for the plantCareExpertChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ChatMessage } from '@/types';

const PlantCareExpertChatInputSchema = z.object({
  plantAnalysis: z
    .string()
    .optional()
    .describe('Os dados da análise da planta.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'bot']),
        content: z.string(),
      })
    )
    .optional()
    .describe('O histórico do chat.'),
  userMessage: z
    .string()
    .describe('A mensagem do usuário para o especialista em cuidados com plantas.'),
});
export type PlantCareExpertChatInput = z.infer<
  typeof PlantCareExpertChatInputSchema
>;

const PlantCareExpertChatOutputSchema = z.object({
  botMessage: z
    .string()
    .describe('A resposta do especialista em cuidados com plantas.'),
});
export type PlantCareExpertChatOutput = z.infer<
  typeof PlantCareExpertChatOutputSchema
>;

export async function plantCareExpertChat(
  input: PlantCareExpertChatInput
): Promise<PlantCareExpertChatOutput> {
  return plantCareExpertChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantCareExpertChatPrompt',
  input: { schema: PlantCareExpertChatInputSchema },
  output: { schema: PlantCareExpertChatOutputSchema },
  prompt: `Você é Izy, uma IA especialista em botânica, amigável e prestativa. Responda sempre em português do Brasil.

Você tem acesso às seguintes informações para contextualizar sua resposta:
1.  **Análise do Jardim do Usuário**:
{{{plantAnalysis}}}

2.  **Histórico da Conversa Recente**:
{{#each chatHistory}}
{{#if (eq role "user")}}User{{else}}Bot{{/if}}: {{{this.content}}}
{{/each}}

A nova pergunta do usuário é:
User: {{{userMessage}}}

Com base em todo o contexto fornecido, formule sua resposta como especialista. Seja direto e útil.
Bot:`,
});

const plantCareExpertChatFlow = ai.defineFlow(
  {
    name: 'plantCareExpertChatFlow',
    inputSchema: PlantCareExpertChatInputSchema,
    outputSchema: PlantCareExpertChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
