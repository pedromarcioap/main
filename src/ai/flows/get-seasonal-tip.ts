'use server';
/**
 * @fileOverview AI flow to get a seasonal gardening tip.
 *
 * - getSeasonalTip - A function that returns a seasonal tip.
 * - GetSeasonalTipInput - The input type for the getSeasonalTip function.
 * - GetSeasonalTipOutput - The return type for the getSeasonalTip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetSeasonalTipInputSchema = z.object({
  season: z.string().describe('A estação atual (ex: Verão, Inverno).'),
});
export type GetSeasonalTipInput = z.infer<typeof GetSeasonalTipInputSchema>;

const GetSeasonalTipOutputSchema = z.object({
  tip: z
    .string()
    .describe('Uma dica de jardinagem sazonal curta e acionável.'),
});
export type GetSeasonalTipOutput = z.infer<typeof GetSeasonalTipOutputSchema>;

export async function getSeasonalTip(
  input: GetSeasonalTipInput
): Promise<GetSeasonalTipOutput> {
  return getSeasonalTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSeasonalTipPrompt',
  input: { schema: GetSeasonalTipInputSchema },
  output: { schema: GetSeasonalTipOutputSchema },
  prompt: `Você é um botânico especialista. Forneça uma dica de jardinagem curta (1-2 frases), acionável e criativa em português do Brasil para a seguinte estação: {{{season}}}. A dica deve ser geral e útil para proprietários de plantas de interior.`,
});

const getSeasonalTipFlow = ai.defineFlow(
  {
    name: 'getSeasonalTipFlow',
    inputSchema: GetSeasonalTipInputSchema,
    outputSchema: GetSeasonalTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
