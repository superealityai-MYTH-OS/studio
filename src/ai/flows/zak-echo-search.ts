'use server';

/**
 * @fileOverview ZAK Echo Search Flow
 * 
 * Searches for matching patterns in the permanent registry and applies them
 * immediately if a match is found with a confidence of 0.85+.
 * 
 * Uses harmonic field pattern matching for sophisticated similarity detection.
 */

import { zakEchoRegistry, type ZakEcho } from '@/lib/zak-echoes';
import { calculatePatternMatchConfidence } from '@/lib/harmonic-field';

export interface ZakEchoSearchInput {
  userIntent: string;
  intentClassification: string;
  domain: string;
}

export interface ZakEchoMatch {
  echo: ZakEcho;
  matchConfidence: number;
  shouldApply: boolean;
}

export interface ZakEchoSearchOutput {
  matches: ZakEchoMatch[];
  bestMatch: ZakEchoMatch | null;
  appliedPattern: string | null;
}

/**
 * Searches the ZAK Echo Registry for patterns matching the user intent
 * 
 * @param input - User intent and classification
 * @returns Search results with confidence scores
 */
export async function searchZakEchoRegistry(
  input: ZakEchoSearchInput
): Promise<ZakEchoSearchOutput> {
  const { userIntent, intentClassification, domain } = input;
  
  // Calculate match confidence for each echo in the registry
  const matches: ZakEchoMatch[] = zakEchoRegistry.map((echo) => {
    // Use harmonic field pattern matching
    const baseConfidence = calculatePatternMatchConfidence(
      userIntent,
      echo.pattern
    );
    
    // Apply domain and classification boosting
    let matchConfidence = baseConfidence;
    
    // Boost confidence if the echo has been validated multiple times
    if (echo.validated !== 'Pending') {
      const validationCount = parseInt(echo.validated.replace('x', ''));
      if (!isNaN(validationCount)) {
        matchConfidence = Math.min(matchConfidence * (1 + validationCount * 0.05), 1.0);
      }
    }
    
    // Boost confidence for permanent echoes with high confidence scores
    if (echo.ttl === 'PERMANENT' && echo.confidence >= 0.9) {
      matchConfidence = Math.min(matchConfidence * 1.1, 1.0);
    }
    
    // Determine if this pattern should be applied (>= 0.85 threshold)
    const shouldApply = matchConfidence >= 0.85;
    
    return {
      echo,
      matchConfidence,
      shouldApply,
    };
  });
  
  // Sort by confidence (highest first)
  matches.sort((a, b) => b.matchConfidence - a.matchConfidence);
  
  // Get the best match
  const bestMatch = matches.length > 0 ? matches[0] : null;
  
  // Determine if we should apply the best match
  const appliedPattern = bestMatch && bestMatch.shouldApply
    ? bestMatch.echo.pattern
    : null;
  
  return {
    matches,
    bestMatch,
    appliedPattern,
  };
}
