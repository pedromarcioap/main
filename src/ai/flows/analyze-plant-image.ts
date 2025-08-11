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
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."      
    ),
});

export type AnalyzePlantImageInput = z.infer<typeof AnalyzePlantImageInputSchema>;

const AnalyzePlantImageOutputSchema = z.object({
  species: z.string().describe('A espécie identificada da planta.'),
  health: z.string().describe('Uma avaliação da saúde da planta. Deve ser "Saudável", "Problemas menores" ou "Não saudável"'),
  potentialProblems: z.string().describe('Quaisquer problemas potenciais que a planta possa ter, como doenças ou pragas.'),
  wateringFrequency: z.string().describe('Frequência de rega recomendada para a planta.'),
  sunlightNeeds: z.string().describe('As necessidades de luz solar da planta.'),
  expertTips: z.string().describe('Dicas de especialistas para cuidar da planta.'),
  treatments: z.string().describe('Tratamentos recomendados para quaisquer problemas identificados.'),
  fullCarePlan: z.string().describe('Um plano de cuidados abrangente para a planta, incluindo rega, luz solar, fertilização e poda.'),
  potentialPestsAndDiseases: z.string().describe('Uma lista de pragas e doenças potenciais que podem afetar a planta.'),
});

export type AnalyzePlantImageOutput = z.infer<typeof AnalyzePlantImageOutputSchema>;

export async function analyzePlantImage(input: AnalyzePlantImageInput): Promise<AnalyzePlantImageOutput> {
  return analyzePlantImageFlow(input);
}

const analyzePlantImagePrompt = ai.definePrompt({
  name: 'analyzePlantImagePrompt',
  input: {schema: AnalyzePlantImageInputSchema},
  output: {schema: AnalyzePlantImageOutputSchema},
  prompt: `Analise a imagem fornecida de uma planta e forneça informações sobre suas espécies, saúde, problemas potenciais e recomendações de cuidados em português do Brasil.

   Foto: {{media url=photoDataUri}}

   Especificamente, retorne as seguintes informações:

   - Espécie: A espécie identificada da planta.
   - Saúde: Uma avaliação da saúde da planta. Deve ser "Saudável", "Problemas menores" ou "Não saudável".
   - Problemas Potenciais: Quaisquer problemas potenciais que a planta possa ter, como doenças ou pragas.
   - Frequência de Rega: Frequência de rega recomendada para a planta.
   - Necessidades de Luz Solar: As necessidades de luz solar da planta.
   - Dicas de Especialista: Dicas de especialistas para cuidar da planta.
   - Tratamentos: Tratamentos recomendados para quaisquer problemas identificados.
   - Plano de Cuidados Completo: Um plano de cuidados abrangente para a planta, incluindo rega, luz solar, fertilização e poda.
   - Pragas e Doenças Potenciais: Uma lista de pragas e doenças potenciais que podem afetar a planta.`,
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
