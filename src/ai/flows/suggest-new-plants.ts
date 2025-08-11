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
    .describe('A description of the user existing plant collection.'),
  userPreferences: z
    .string()
    .describe('The user preferences like lighting conditions, care level, etc.'),
});
export type SuggestNewPlantsInput = z.infer<typeof SuggestNewPlantsInputSchema>;

const SuggestNewPlantsOutputSchema = z.object({
  suggestedPlants: z
    .string()
    .describe('A list of plant suggestions with descriptions.'),
});
export type SuggestNewPlantsOutput = z.infer<typeof SuggestNewPlantsOutputSchema>;

export async function suggestNewPlants(input: SuggestNewPlantsInput): Promise<SuggestNewPlantsOutput> {
  return suggestNewPlantsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewPlantsPrompt',
  input: {schema: SuggestNewPlantsInputSchema},
  output: {schema: SuggestNewPlantsOutputSchema},
  prompt: `You are a gardening expert. A user has the following plant collection and preferences:

Collection: {{{userCollection}}}
Preferences: {{{userPreferences}}}

Suggest some new plants that the user might like. Return the plant suggestions with a short description. Consider suggesting plants that thrive in similar conditions and complement the user's existing collection. Focus on plants that would expand the garden with compatible species.`,
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
