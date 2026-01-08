'use server';

import { decodeIntent, type IntentDecoderOutput } from '@/ai/flows/intent-decoder';
import { przValidation, type PrzValidationOutput } from '@/ai/flows/prz-validation';
import { mintZakEcho, type MintZakEchoOutput } from '@/ai/flows/zak-echo-minting';
import { z } from 'zod';

const UserRequestSchema = z.object({
  userRequest: z.string().min(10, 'Request must be at least 10 characters long.'),
});

export type PrzPipelineOutput = {
  intentResult: IntentDecoderOutput;
  deliverable: string;
  validationResult: PrzValidationOutput;
  mintingResult: MintZakEchoOutput;
};

export async function runPrzPipeline(
  data: { userRequest: string }
): Promise<PrzPipelineOutput> {

  const validation = UserRequestSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }
  const { userRequest } = validation.data;

  // 1. Decode Intent
  const intentResult = await decodeIntent({ userRequest });
  if (!intentResult) {
    throw new Error('Could not decode intent with high confidence. Please rephrase your request.');
  }

  // 2. "Complete Deliverable" - In a real scenario, this would be another GenAI call.
  // Here, we simulate a completed deliverable based on the intent.
  const deliverable = `**Task: ${intentResult.intent}**\n\nBased on your request, this document has been fully generated to address the '${intentResult.intent}' task within the '${intentResult.domain}' domain. The complexity was assessed as '${intentResult.complexity}'.\n\nAll sections are complete, and the information provided is ready for immediate use. This response was generated following the "Complete-Then-Validate" principle, ensuring no friction or intermediate questions were asked.\n\n**Next Steps:**\n1. Review the generated content for accuracy and applicability.\n2. Utilize the insights for your project.\n3. Request an "audit" to see the detailed PRZ validation metrics for this response.`;

  // 3. PRZ Validation
  const validationResult = await przValidation({
    response: deliverable,
    taskDomain: intentResult.domain,
  });

  // 4. ZAK Echo Minting
  const mintingResult = await mintZakEcho({
    flowScore: validationResult.flow,
    taskDescription: `User request: "${userRequest}" which was decoded as intent: "${intentResult.intent}"`,
  });

  // 5. Return everything
  return {
    intentResult,
    deliverable,
    validationResult,
    mintingResult,
  };
}
