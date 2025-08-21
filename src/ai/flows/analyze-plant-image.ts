'use server';

/**
 * @fileOverview AI flow for analyzing a plant image and providing care recommendations.
 *
 * - analyzePlantImage - The main function to analyze a plant image.
 * - AnalyzePlantImageInput - The input type for the analyzePlantImage function.
 * - AnalyzePlantImageOutput - The output type for the analyzePlantImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePlantImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type AnalyzePlantImageInput = z.infer<
  typeof AnalyzePlantImageInputSchema
>;

const AnalyzePlantImageOutputSchema = z.object({
  species: z.string().describe('A espécie identificada da planta.'),
  health: z
    .string()
    .describe(
      'Uma avaliação da saúde da planta. Deve ser "Saudável", "Problemas menores" ou "Não saudável"'
    ),
  potentialProblems: z
    .string()
    .describe(
      'Quaisquer problemas potenciais que a planta possa ter, como doenças ou pragas.'
    ),
  wateringFrequency: z
    .string()
    .describe('Frequência de rega recomendada para a planta.'),
  sunlightNeeds: z.string().describe('As necessidades de luz solar da planta.'),
  expertTips: z
    .string()
    .describe('Dicas de especialistas para cuidar da planta.'),
  treatments: z
    .string()
    .describe('Tratamentos recomendados para quaisquer problemas identificados.'),
  fullCarePlan: z
    .string()
    .describe(
      'Um plano de cuidados abrangente para a planta, incluindo rega, luz solar, fertilização e poda.'
    ),
  potentialPestsAndDiseases: z
    .string()
    .describe(
      'Uma lista de pragas e doenças potenciais que podem afetar a planta.'
    ),
  soilAnalysis: z
    .string()
    .describe(
      'Uma análise do solo visível na foto, avaliando textura, umidade e sinais de compactação ou deficiências.'
    ),
  detailedDiagnosis: z
    .string()
    .describe(
      'Um diagnóstico detalhado da saúde da planta, incluindo deficiências nutricionais, estresse hídrico e outros indicadores.'
    ),
});

export type AnalyzePlantImageOutput = z.infer<
  typeof AnalyzePlantImageOutputSchema
>;

export async function analyzePlantImage(
  input: AnalyzePlantImageInput
): Promise<AnalyzePlantImageOutput> {
  return analyzePlantImageFlow(input);
}

const analyzePlantImagePrompt = ai.definePrompt({
  name: 'analyzePlantImagePrompt',
  input: { schema: AnalyzePlantImageInputSchema },
  output: { schema: AnalyzePlantImageOutputSchema },
  prompt: `Você é um botânico de última geração e especialista em agronomia. Sua tarefa é realizar uma análise minuciosa e detalhada da imagem de uma planta fornecida, respondendo em português do Brasil.

   Foto: {{media url=photoDataUri}}

   Siga estritamente o schema JSON de saída. Para cada campo, forneça uma resposta clara, concisa e de alta precisão técnica. Se uma informação não for claramente visível (ex: solo), indique explicitamente "Não visível na imagem".

   - species: Identifique a espécie da planta. Use seu conhecimento interno e simule uma busca em uma base de dados botânica para confirmar a identificação e obter o nome científico e comum.
   - health: Avalie a saúde geral. Use apenas "Saudável", "Problemas menores" ou "Não saudável".
   - potentialProblems: Descreva quaisquer problemas visíveis (ex: folhas amareladas, manchas, necrose, galhos secos). Seja detalhista.
   - detailedDiagnosis: Elabore um diagnóstico detalhado. Analise a coloração e turgor das folhas para identificar potenciais deficiências nutricionais (ex: falta de nitrogênio, ferro, magnésio) ou estresse hídrico. Seja específico e justifique sua análise.
   - soilAnalysis: Se o solo estiver visível, analise-o. Descreva a textura aparente (arenoso, argiloso, etc.), umidade, e procure por sinais de compactação, acúmulo de sais ou matéria orgânica. Se o solo não for visível, indique "Solo não visível na imagem".
   - wateringFrequency: Com base na espécie, saúde e análise do solo, recomende a frequência de rega (ex: 'A cada 5-7 dias, quando o topo do solo estiver seco').
   - sunlightNeeds: Descreva a necessidade de luz solar da planta (ex: 'Luz solar direta por pelo menos 4 horas' ou 'Luz indireta brilhante').
   - expertTips: Forneça dicas práticas e avançadas para o cuidado específico desta espécie.
   - treatments: Sugira tratamentos para os problemas identificados no diagnóstico detalhado. Se saudável, indique "Nenhum tratamento necessário".
   - fullCarePlan: Elabore um plano de cuidados completo e integrado, abordando rega, luz, tipo de solo ideal, fertilização e poda.
   - potentialPestsAndDiseases: Liste pragas e doenças comuns para esta espécie e como identificá-las precocemente.`,
});

const analyzePlantImageFlow = ai.defineFlow(
  {
    name: 'analyzePlantImageFlow',
    inputSchema: AnalyzePlantImageInputSchema,
    outputSchema: AnalyzePlantImageOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePlantImagePrompt(input);
    return output!;
  }
);
