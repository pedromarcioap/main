'use server';

/**
 * @fileOverview AI agent that suggests new plants based on the user's existing collection and preferences.
 *
 * - suggestNewPlants - A function that handles the plant suggestion process.
 * - SuggestNewPlantsInput - The input type for the suggestNewPlants function.
 * - SuggestNewPlantsOutput - The return type for the suggestNewPlants function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewPlantsInputSchema = z.object({
  userCollection: z
    .string()
    .describe('Uma descrição da coleção de plantas existente do usuário.'),
  userPreferences: z
    .string()
    .describe('As preferências do usuário como condições de iluminação, nível de cuidado, etc.'),
});
export type SuggestNewPlantsInput = z.infer<typeof SuggestNewPlantsInputSchema>;

const SuggestNewPlantsOutputSchema = z.object({
  suggestedPlants: z
    .string()
    .describe('Uma lista de sugestões de plantas com descrições.'),
});
export type SuggestNewPlantsOutput = z.infer<typeof SuggestNewPlantsOutputSchema>;

export async function suggestNewPlants(input: SuggestNewPlantsInput): Promise<SuggestNewPlantsOutput> {
  return suggestNewPlantsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewPlantsPrompt',
  input: {schema: SuggestNewPlantsInputSchema},
  output: {schema: SuggestNewPlantsOutputSchema},
  prompt: `Você é um especialista em jardinagem. Um usuário tem a seguinte coleção de plantas e preferências. Responda em português do Brasil:

Coleção: {{{userCollection}}}
Preferências: {{{userPreferences}}}

Sugira algumas plantas novas que o usuário possa gostar. Retorne as sugestões de plantas com uma breve descrição. Considere sugerir plantas que prosperam em condições semelhantes e complementam a coleção existente do usuário. Foque em plantas que expandiriam o jardim com espécies compatíveis.`,
});

const suggestNewPlantsFlow = ai.defineFlow(
  {
    name: 'suggestNewPlantsFlow',
    inputSchema: SuggestNewPlantsInputSchema,
    outputSchema: SuggestNewPlantsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
