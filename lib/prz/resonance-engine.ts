/**
 * ResonanceEngine - Measures resonance between user input (pulse) and system context
 * Part of PRZ Seven Pillars compliance for Super Reality OS Dashboard
 */

/**
 * Represents a user input pulse
 */
export interface Pulse {
  /** The core content of the user input */
  content: string;
  /** Direction vector (normalized intent vector) */
  direction: number[];
  /** Magnitude of the pulse (0-1, strength of intent) */
  magnitude: number;
  /** Frequency (0-1, how often this type of request occurs) */
  frequency: number;
}

/**
 * Represents the system context
 */
export interface Context {
  /** Current system state */
  state: string;
  /** Historical patterns */
  patterns: number[];
  /** Expected direction alignment */
  expectedDirection: number[];
  /** Current system frequency */
  systemFrequency: number;
}

/**
 * Represents the resonance measurement result
 */
export interface Resonance {
  /** Overall resonance score (0-1) */
  score: number;
  /** Direction alignment score (0-1) */
  directionAlignment: number;
  /** Magnitude alignment score (0-1) */
  magnitudeAlignment: number;
  /** Frequency alignment score (0-1) */
  frequencyAlignment: number;
}

/**
 * Reality Threshold - Ideas above this threshold should crystallize
 */
export const REALITY_THRESHOLD = 0.95;

/**
 * Calculate dot product of two vectors
 */
function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Normalize a vector
 */
function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => val / magnitude);
}

/**
 * Measures resonance between user input (pulse) and system context
 * Calculates resonance score based on direction, magnitude, and frequency alignment
 * 
 * @param pulse - The user input pulse containing direction, magnitude, and frequency
 * @param context - The system context for comparison
 * @returns Resonance object with overall score and component alignments
 */
export function measureResonance(pulse: Pulse, context: Context): Resonance {
  // Normalize directions for comparison
  const normalizedPulseDirection = normalize(pulse.direction);
  const normalizedContextDirection = normalize(context.expectedDirection);
  
  // Calculate direction alignment using cosine similarity
  // Range: -1 to 1, convert to 0 to 1
  const directionDot = dotProduct(normalizedPulseDirection, normalizedContextDirection);
  const directionAlignment = (directionDot + 1) / 2;
  
  // Calculate magnitude alignment
  // Assumes pulse.magnitude and context.patterns average should align
  const contextMagnitude = context.patterns.length > 0
    ? context.patterns.reduce((sum, val) => sum + val, 0) / context.patterns.length
    : 0.5;
  const magnitudeAlignment = 1 - Math.abs(pulse.magnitude - contextMagnitude);
  
  // Calculate frequency alignment
  const frequencyAlignment = 1 - Math.abs(pulse.frequency - context.systemFrequency);
  
  // Calculate overall resonance score
  // Weighted average: direction is most important, then magnitude, then frequency
  const score = (
    directionAlignment * 0.5 +
    magnitudeAlignment * 0.3 +
    frequencyAlignment * 0.2
  );
  
  return {
    score,
    directionAlignment,
    magnitudeAlignment,
    frequencyAlignment,
  };
}

/**
 * Determines if an idea should crystallize based on resonance
 * Ideas crystallize when resonance exceeds the Reality Threshold (0.95)
 * 
 * @param resonance - The resonance measurement result
 * @returns true if the idea should crystallize, false otherwise
 */
export function shouldCrystallize(resonance: Resonance): boolean {
  return resonance.score >= REALITY_THRESHOLD;
}
