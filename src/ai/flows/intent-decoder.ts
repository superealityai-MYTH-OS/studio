'use server';
/**
 * @fileOverview A flow to decode user intent with a confidence score of 0.90+.
 *
 * - decodeIntent - A function that handles the intent decoding process.
 * - IntentDecoderInput - The input type for the decodeIntent function.
 * - IntentDecoderOutput - The return type for the decodeIntent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntentDecoderInputSchema = z.object({
  userRequest: z.string().describe('The user request to decode.'),
});
export type IntentDecoderInput = z.infer<typeof IntentDecoderInputSchema>;

const IntentDecoderOutputSchema = z.object({
  intent: z.string().describe('The decoded intent of the user request.'),
  confidenceScore: z
    .number()
    .describe(
      'The confidence score (0.0-1.0) that the intent was correctly decoded.'
    ),
  intentClassification: z
    .string()
    .describe('Classification of the intent (e.g. immediate, standard, exploratory).'),
  domain: z
    .string()
    .describe('The domain of the request (e.g. medical, legal, technical, creative, general).'),
  complexity: z
    .string()
    .describe('The complexity of the request (e.g. simple, medium, complex).'),
});
export type IntentDecoderOutput = z.infer<typeof IntentDecoderOutputSchema>;

export async function decodeIntent(input: IntentDecoderInput): Promise<
  | (IntentDecoderOutput & {
      confidenceScore: number;
    }) //ensure confidenceScore
  | undefined
> {
  const result = await decodeIntentFlow(input);

  // Ensure confidence score is greater than 0.90
  if (result && result.confidenceScore >= 0.9) {
    return result;
  }
  return undefined;
}

const intentDecoderPrompt = ai.definePrompt({
  name: 'intentDecoderPrompt',
  input: {schema: IntentDecoderInputSchema},
  output: {schema: IntentDecoderOutputSchema},
  prompt: `You are an AI agent responsible for decoding the intent of user requests.

Analyze the following user request and extract the intent, confidence score (0.0-1.0), intent classification, domain, and complexity.

User Request: {{{userRequest}}}

Ensure the confidence score is above 0.90 before proceeding.

Output the results in JSON format.

Intent: {intent}
Confidence Score: {confidenceScore}
Intent Classification: {intentClassification}
Domain: {domain}
Complexity: {complexity}`,
});

const decodeIntentFlow = ai.defineFlow(
  {
    name: 'decodeIntentFlow',
    inputSchema: IntentDecoderInputSchema,
    outputSchema: IntentDecoderOutputSchema,
  },
  async input => {
    const {output} = await intentDecoderPrompt(input);
    return output!;
  }
);
