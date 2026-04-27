'use server';

/**
 * @fileOverview A flow to recommend additional equipment based on a user's quote request.
 *
 * - recommendAdditionalEquipment - A function that handles the recommendation process.
 * - RecommendAdditionalEquipmentInput - The input type for the recommendAdditionalEquipment function.
 * - RecommendAdditionalEquipmentOutput - The return type for the recommendAdditionalEquipment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendAdditionalEquipmentInputSchema = z.object({
  equipmentList: z
    .string()
    .describe('A comma-separated list of equipment requested by the user.'),
});
export type RecommendAdditionalEquipmentInput = z.infer<
  typeof RecommendAdditionalEquipmentInputSchema
>;

const RecommendAdditionalEquipmentOutputSchema = z.object({
  recommendedEquipment: z
    .string()
    .describe(
      'A comma-separated list of equipment that is recommended based on the user request.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the equipment recommendations.'),
});
export type RecommendAdditionalEquipmentOutput = z.infer<
  typeof RecommendAdditionalEquipmentOutputSchema
>;

export async function recommendAdditionalEquipment(
  input: RecommendAdditionalEquipmentInput
): Promise<RecommendAdditionalEquipmentOutput> {
  return recommendAdditionalEquipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendAdditionalEquipmentPrompt',
  input: {schema: RecommendAdditionalEquipmentInputSchema},
  output: {schema: RecommendAdditionalEquipmentOutputSchema},
  prompt: `You are an expert equipment rental advisor. A user is requesting equipment for a project.

Based on the equipment they are requesting, recommend additional equipment that they may need to complete their project successfully. Provide a clear reason for each recommendation.

Equipment List: {{{equipmentList}}}

Format your output as follows:

Recommended Equipment: <comma separated list of recommended equipment>
Reasoning: <explanation of why the equipment is recommended>`,
});

const recommendAdditionalEquipmentFlow = ai.defineFlow(
  {
    name: 'recommendAdditionalEquipmentFlow',
    inputSchema: RecommendAdditionalEquipmentInputSchema,
    outputSchema: RecommendAdditionalEquipmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
