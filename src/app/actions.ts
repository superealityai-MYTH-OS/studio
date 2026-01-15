'use server';

import { decodeIntent, type IntentDecoderOutput } from '@/ai/flows/intent-decoder';
import { przValidation, type PrzValidationOutput } from '@/ai/flows/prz-validation';
import { mintZakEcho, type MintZakEchoOutput } from '@/ai/flows/zak-echo-minting';
import { searchZakEchoRegistry, type ZakEchoSearchOutput } from '@/ai/flows/zak-echo-search';
import { z } from 'zod';

const UserRequestSchema = z.object({
  userRequest: z.string().min(10, 'Request must be at least 10 characters long.'),
});

export type PrzPipelineOutput = {
  intentResult: IntentDecoderOutput;
  zakEchoSearchResult: ZakEchoSearchOutput;
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

  // 2. Search ZAK Echo Registry for matching patterns
  const zakEchoSearchResult = await searchZakEchoRegistry({
    userIntent: intentResult.intent,
    intentClassification: intentResult.intentClassification,
    domain: intentResult.domain,
  });

  // 3. "Complete Deliverable" - In a real scenario, this would be another GenAI call.
  // Here, we simulate a completed deliverable based on the intent.
  let deliverable = `**Task: ${intentResult.intent}**\n\nBased on your request, this document has been fully generated to address the '${intentResult.intent}' task within the '${intentResult.domain}' domain. The complexity was assessed as '${intentResult.complexity}'.\n\n`;
  
  // If a ZAK Echo pattern was applied, include it in the deliverable
  if (zakEchoSearchResult.appliedPattern) {
    deliverable += `**Applied Pattern from ZAK Echo Registry:**\n"${zakEchoSearchResult.appliedPattern}"\n\n`;
    deliverable += `This response leverages proven patterns from the permanent registry (Confidence: ${(zakEchoSearchResult.bestMatch!.matchConfidence * 100).toFixed(1)}%).\n\n`;
  }
  
  deliverable += `All sections are complete, and the information provided is ready for immediate use. This response was generated following the "Complete-Then-Validate" principle, ensuring no friction or intermediate questions were asked.\n\n**Next Steps:**\n1. Review the generated content for accuracy and applicability.\n2. Utilize the insights for your project.\n3. Request an "audit" to see the detailed PRZ validation metrics for this response.`;

  // 4. PRZ Validation
  const validationResult = await przValidation({
    response: deliverable,
    taskDomain: intentResult.domain,
  });

  // 5. ZAK Echo Minting
  const mintingResult = await mintZakEcho({
    flowScore: validationResult.flow,
    taskDescription: `User request: "${userRequest}" which was decoded as intent: "${intentResult.intent}"`,
  });

  // 6. Return everything
  return {
    intentResult,
    zakEchoSearchResult,
    deliverable,
    validationResult,
    mintingResult,
  };
}
