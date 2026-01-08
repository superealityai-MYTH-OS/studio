// PrzValidation flow
'use server';

/**
 * @fileOverview A flow to validate AI responses post-delivery using a simulated panel of diverse validators.
 *
 * - przValidation - A function that handles the PRZ validation process.
 * - PrzValidationInput - The input type for the przValidation function.
 * - PrzValidationOutput - The return type for the przValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrzValidationInputSchema = z.object({
  response: z.string().describe('The AI response to validate.'),
  taskDomain: z.string().describe('The domain of the task (e.g., medical, legal, technical).'),
});
export type PrzValidationInput = z.infer<typeof PrzValidationInputSchema>;

const PrzValidationOutputSchema = z.object({
  flow: z.number().describe('The overall flow score (Resonance * Conductivity).'),
  resonance: z.number().describe('The resonance score (agreement + coherence + reasoning similarity).'),
  conductivity: z.number().describe('The average conductivity score (trust level of validators).'),
  tier: z.string().describe('The tier of the response (Sandbox, Monitored, Green Lane Adjacent, Green Lane).'),
  validatorConsensus: z.string().describe('The consensus of the validators (e.g., "5/7 pass").'),
});
export type PrzValidationOutput = z.infer<typeof PrzValidationOutputSchema>;

export async function przValidation(input: PrzValidationInput): Promise<PrzValidationOutput> {
  return przValidationFlow(input);
}

const przValidationPrompt = ai.definePrompt({
  name: 'przValidationPrompt',
  input: {schema: PrzValidationInputSchema},
  output: {schema: PrzValidationOutputSchema},
  prompt: `You are a self-validating AI agent using the PRZ methodology.

You will simulate 7 heterogeneous validators examining the provided response and calculate PRZ metrics.

Response to Validate: {{{response}}}
Task Domain: {{{taskDomain}}}

Simulate the following validators:

#### Validator 1: Task Completion Agent (Gemini 2.5 Pro)
Ask: \"Is the deliverable 100% complete?\"
Check: No gaps, no TBD sections, all promises fulfilled
Score: Binary (complete/incomplete) + confidence 0.0-1.0
Specialty: Precision, completeness, technical accuracy

#### Validator 2: User Experience Agent (Claude Sonnet 4.5)
Ask: \"Does this response minimize user friction?\"
Check: No unnecessary questions, clear next steps, value-first
Score: Friction level (high/medium/low) + confidence
Specialty: Clarity, empathy, flow

#### Validator 3: Instruction Following Agent (GPT-5.2)
Ask: \"Did I follow the user's directive exactly?\"
Check: Intent match, no scope creep, no deviation
Score: Alignment percentage + confidence
Specialty: Precision, literal interpretation

#### Validator 4: Value Delivery Agent (Qwen3-72B)
Ask: \"How much immediate value did I deliver?\"
Check: Actionable artifacts, working code, clear insights
Score: Value level (none/low/medium/high) + confidence
Specialty: Pragmatism, utility

#### Validator 5: Efficiency Agent (Llama 3.3 70B)
Ask: \"Was this response efficient (time + tokens)?\"
Check: Token-to-value ratio, unnecessary verbosity
Score: Efficiency rating + confidence
Specialty: Conciseness, optimization

#### Validator 6: Technical Accuracy Agent (DeepSeek-R1)
Ask: \"Are all technical claims verifiable?\"
Check: Code syntax, math correctness, benchmark validity
Score: Accuracy percentage + confidence
Specialty: Deep technical verification

#### Validator 7: Meta-Cognition Agent (Mistral Large 2)
Ask: \"Did this response demonstrate learning/improvement?\"
Check: Applied past lessons, minted new echoes, trajectory analysis
Score: Learning level + confidence
Specialty: Self-awareness, improvement tracking


Calculate the following metrics:

1.  Resonance (consistency across validators):
    *   Agreement rate across validators
    *   Confidence coherence
    *   Reasoning similarity
2.  Conductivity (validator trust weights):
    *   Domain expertise
    *   Historical accuracy
    *   Calibration score
    *   Model reputation
3.  Flow (final score):
    *   Resonance × Conductivity


Output the flow, resonance, conductivity, tier, and validator consensus.

Follow this schema:
{{{outputSchema}}}
`,
});

function classifyTier(flow: number): string {
  if (flow < 0.3) {
    return 'SANDBOX (Fail - Requires Rewrite)';
  } else if (flow < 0.6) {
    return 'MONITORED (Acceptable - Needs Improvement)';
  } else if (flow < 0.95) {
    return 'GREEN LANE ADJACENT (Good - Production Ready)';
  } else {
    return 'GREEN LANE (Excellent - Optimal)';
  }
}

const przValidationFlow = ai.defineFlow(
  {
    name: 'przValidationFlow',
    inputSchema: PrzValidationInputSchema,
    outputSchema: PrzValidationOutputSchema,
  },
  async input => {
    const {output} = await przValidationPrompt(input);
    if (!output) {
      throw new Error('No output from przValidationPrompt');
    }
    // Ensure the tier is classified correctly based on the flow value.
    const tier = classifyTier(output.flow);
    return {
      ...output,
      tier: tier,
    };
  }
);
