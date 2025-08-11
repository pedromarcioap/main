'use server';

/**
 * @fileOverview AI flow for analyzing a plant image and providing care recommendations.
 *
 * - analyzePlantImage - The main function to analyze a plant image.
 * - AnalyzePlantImageInput - The input type for the analyzePlantImage function.
 * - AnalyzePlantImageOutput - The output type for the analyzePlantImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlantImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});

export type AnalyzePlantImageInput = z.infer<typeof AnalyzePlantImageInputSchema>;

const AnalyzePlantImageOutputSchema = z.object({
  species: z.string().describe('The identified species of the plant.'),
  health: z.string().describe('An assessment of the plant\'s health.'),
  potentialProblems: z.string().describe('Any potential problems the plant may have, such as diseases or pests.'),
  wateringFrequency: z.string().describe('Recommended watering frequency for the plant.'),
  sunlightNeeds: z.string().describe('The plant\'s sunlight requirements.'),
  expertTips: z.string().describe('Expert tips for caring for the plant.'),
  treatments: z.string().describe('Recommended treatments for any identified problems.'),
  fullCarePlan: z.string().describe('A comprehensive care plan for the plant, including watering, sunlight, fertilization, and pruning.'),
  potentialPestsAndDiseases: z.string().describe('A list of potential pests and diseases that may affect the plant.'),
});

export type AnalyzePlantImageOutput = z.infer<typeof AnalyzePlantImageOutputSchema>;

export async function analyzePlantImage(input: AnalyzePlantImageInput): Promise<AnalyzePlantImageOutput> {
  return analyzePlantImageFlow(input);
}

const analyzePlantImagePrompt = ai.definePrompt({
  name: 'analyzePlantImagePrompt',
  input: {schema: AnalyzePlantImageInputSchema},
  output: {schema: AnalyzePlantImageOutputSchema},
  prompt: `Analyze the provided image of a plant and provide information about its species, health, potential problems, and care recommendations.

   Photo: {{media url=photoDataUri}}

   Specifically, return the following information:

   - Species: The identified species of the plant.
   - Health: An assessment of the plant\'s health.
   - Potential Problems: Any potential problems the plant may have, such as diseases or pests.
   - Watering Frequency: Recommended watering frequency for the plant.
   - Sunlight Needs: The plant\'s sunlight requirements.
   - Expert Tips: Expert tips for caring for the plant.
   - Treatments: Recommended treatments for any identified problems.
   - Full Care Plan: A comprehensive care plan for the plant, including watering, sunlight, fertilization, and pruning.
   - Potential Pests and Diseases: A list of potential pests and diseases that may affect the plant.`,
});

const analyzePlantImageFlow = ai.defineFlow(
  {
    name: 'analyzePlantImageFlow',
    inputSchema: AnalyzePlantImageInputSchema,
    outputSchema: AnalyzePlantImageOutputSchema,
  },
  async input => {
    const {output} = await analyzePlantImagePrompt(input);
    return output!;
  }
);

