'use server';

/**
 * @fileOverview AI agent that suggests new plants based on the user's existing collection and preferences.
 *
 * - suggestNewPlants - A function that handles the plant suggestion process.
 * - SuggestNewPlantsInput - The input type for the suggestNewPlants function.
 * - SuggestNewPlantsOutput - The return type for the suggestNewPlants function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestNewPlantsInputSchema = z.object({
  userCollection: z
    .string()
    .describe('Uma descrição da coleção de plantas existente do usuário.'),
  userPreferences: z
    .string()

    .describe(
      'As preferências do usuário como condições de iluminação, nível de cuidado, etc.'
    ),
});
export type SuggestNewPlantsInput = z.infer<typeof SuggestNewPlantsInputSchema>;

const SuggestNewPlantsOutputSchema = z.object({
  suggestedPlants: z
    .string()
    .describe(
      'Uma lista de 3 a 5 sugestões de plantas com descrições curtas, formatada como uma string com quebras de linha.'
    ),
});
export type SuggestNewPlantsOutput = z.infer<
  typeof SuggestNewPlantsOutputSchema
>;

export async function suggestNewPlants(
  input: SuggestNewPlantsInput
): Promise<SuggestNewPlantsOutput> {
  return suggestNewPlantsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewPlantsPrompt',
  input: { schema: SuggestNewPlantsInputSchema },
  output: { schema: SuggestNewPlantsOutputSchema },
  prompt: `Você é um especialista em jardinagem. Um usuário tem a seguinte coleção de plantas e preferências. Responda em português do Brasil.

Coleção: {{{userCollection}}}
Preferências: {{{userPreferences}}}

Sugira de 3 a 5 plantas novas que o usuário possa gostar. Para cada planta, forneça o nome e uma descrição muito breve (1-2 frases). Foque em plantas que prosperam em condições semelhantes e complementam a coleção existente do usuário. Formate a saída como uma única string com cada sugestão em uma nova linha.`,
});

const suggestNewPlantsFlow = ai.defineFlow(
  {
    name: 'suggestNewPlantsFlow',
    inputSchema: SuggestNewPlantsInputSchema,
    outputSchema: SuggestNewPlantsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
