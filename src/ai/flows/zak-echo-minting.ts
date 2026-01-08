'use server';

/**
 * @fileOverview This file defines the Genkit flow for minting new ZAK Echoes.
 *
 * The flow takes a flow score and a task description as input, and if the flow score is high enough,
 * it mints a new ZAK Echo and stores it in the permanent registry.
 *
 * @exports mintZakEcho - The main function to mint a new ZAK Echo.
 * @exports MintZakEchoInput - The input type for the mintZakEcho function.
 * @exports MintZakEchoOutput - The output type for the mintZakEcho function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MintZakEchoInputSchema = z.object({
  flowScore: z.number().describe('The flow score of the task.'),
  taskDescription: z.string().describe('The description of the task.'),
});
export type MintZakEchoInput = z.infer<typeof MintZakEchoInputSchema>;

const MintZakEchoOutputSchema = z.object({
  echoMinted: z.boolean().describe('Whether a new ZAK Echo was minted.'),
  echoId: z.string().optional().describe('The ID of the minted ZAK Echo, if any.'),
});
export type MintZakEchoOutput = z.infer<typeof MintZakEchoOutputSchema>;

export async function mintZakEcho(input: MintZakEchoInput): Promise<MintZakEchoOutput> {
  return mintZakEchoFlow(input);
}

const mintZakEchoPrompt = ai.definePrompt({
  name: 'mintZakEchoPrompt',
  input: {schema: MintZakEchoInputSchema},
  output: {schema: MintZakEchoOutputSchema},
  prompt: `You are a ZAK Echo minting agent. Your task is to determine whether to mint a new ZAK Echo based on the flow score of a recent task.

  The goal is to capture the insights of successful tasks into a permanent registry for repeated use.

  If the flow score is >= 0.90, mint a new ZAK Echo. The pattern format should be "When [condition], do [action]".

  If the flow score is less than 0.90, do not mint a new ZAK Echo.

  Task Description: {{{taskDescription}}}
  Flow Score: {{{flowScore}}}

  Output the echoMinted as true if a new ZAK Echo was created and false otherwise. If a new ZAK Echo was created, then also output the echoId.
`,
});

const mintZakEchoFlow = ai.defineFlow(
  {
    name: 'mintZakEchoFlow',
    inputSchema: MintZakEchoInputSchema,
    outputSchema: MintZakEchoOutputSchema,
  },
  async input => {
    const {output} = await mintZakEchoPrompt(input);
    return output!;
  }
);
