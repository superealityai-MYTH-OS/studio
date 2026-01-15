/**
 * Harmonic Field Pattern Matching Implementation
 * 
 * TypeScript implementation of harmonic field concepts from jules_coder_lib
 * for pattern matching in the ZAK Echo Registry.
 */

// Constants for harmonic embedding
const MAGNITUDE_BASE = 0.5;
const MAGNITUDE_SCALE = 500; // Scale factor for magnitude variation
const PHASE_SCALE = 10000; // Scale factor for phase distribution
const HARMONIC_SIMILARITY_WEIGHT = 0.7; // Weight for harmonic similarity in pattern matching
const KEYWORD_MATCH_WEIGHT = 0.3; // Weight for keyword matching in pattern matching

/**
 * Represents a complex number in polar form
 */
export interface ComplexPolar {
  magnitude: number;
  phase: number;
}

/**
 * Converts a string to a complex vector using harmonic embedding
 */
export function stringToHarmonicVector(text: string, dim: number = 128): ComplexPolar[] {
  const vector: ComplexPolar[] = [];
  
  // Simple hash-based embedding that distributes text features across dimensions
  for (let i = 0; i < dim; i++) {
    // Create pseudo-random but deterministic magnitude and phase from text and dimension
    const seed = hashString(text + i.toString());
    const magnitude = MAGNITUDE_BASE + (seed % MAGNITUDE_SCALE) / 1000; // Range [0.5, 1.5]
    const phase = ((seed % PHASE_SCALE) / PHASE_SCALE) * 2 * Math.PI - Math.PI; // Range [-π, π]
    
    vector.push({ magnitude, phase });
  }
  
  return vector;
}

/**
 * Simple string hashing function for deterministic pseudo-randomness
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Holographic Binding: Binds two complex vectors
 * Simplified version using element-wise multiplication in polar form:
 * multiply magnitudes and add phases (equivalent to complex multiplication)
 */
export function holographicBind(
  roleVector: ComplexPolar[],
  fillerVector: ComplexPolar[]
): ComplexPolar[] {
  if (roleVector.length !== fillerVector.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  const bound: ComplexPolar[] = [];
  const dim = roleVector.length;
  
  // Element-wise complex multiplication in polar form: multiply magnitudes, add phases
  for (let i = 0; i < dim; i++) {
    const magnitude = roleVector[i].magnitude * fillerVector[i].magnitude;
    let phase = roleVector[i].phase + fillerVector[i].phase;
    
    // Normalize phase to [-π, π]
    while (phase > Math.PI) phase -= 2 * Math.PI;
    while (phase < -Math.PI) phase += 2 * Math.PI;
    
    bound.push({ magnitude, phase });
  }
  
  return bound;
}

/**
 * Calculate harmonic similarity between two complex vectors
 * Returns a score between 0.0 and 1.0
 */
export function harmonicSimilarity(
  vector1: ComplexPolar[],
  vector2: ComplexPolar[]
): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let similaritySum = 0;
  const dim = vector1.length;
  
  for (let i = 0; i < dim; i++) {
    // Calculate magnitude similarity
    const magDiff = Math.abs(vector1[i].magnitude - vector2[i].magnitude);
    const magSim = 1 - Math.min(magDiff, 1);
    
    // Calculate phase similarity (circular distance)
    const phaseDiff = Math.abs(vector1[i].phase - vector2[i].phase);
    const circularDiff = Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
    const phaseSim = 1 - (circularDiff / Math.PI);
    
    // Combine magnitude and phase similarity
    similaritySum += (magSim * 0.5 + phaseSim * 0.5);
  }
  
  return similaritySum / dim;
}

/**
 * Calculate pattern match confidence for ZAK Echo search
 * 
 * @param userIntent - The user's decoded intent
 * @param echoPattern - A pattern from the ZAK Echo Registry
 * @returns confidence score between 0.0 and 1.0
 */
export function calculatePatternMatchConfidence(
  userIntent: string,
  echoPattern: string
): number {
  // Convert both to harmonic vectors
  const intentVector = stringToHarmonicVector(userIntent.toLowerCase());
  const patternVector = stringToHarmonicVector(echoPattern.toLowerCase());
  
  // Calculate base similarity
  const baseSimilarity = harmonicSimilarity(intentVector, patternVector);
  
  // Boost score for keyword matches
  const intentWords = new Set(userIntent.toLowerCase().split(/\s+/));
  const patternWords = new Set(echoPattern.toLowerCase().split(/\s+/));
  
  let keywordMatches = 0;
  let totalKeywords = 0;
  
  for (const word of patternWords) {
    if (word.length > 3) { // Only consider meaningful words
      totalKeywords++;
      if (intentWords.has(word)) {
        keywordMatches++;
      }
    }
  }
  
  const keywordBoost = totalKeywords > 0 ? keywordMatches / totalKeywords : 0;
  
  // Combine harmonic similarity with keyword boost using predefined weights
  return baseSimilarity * HARMONIC_SIMILARITY_WEIGHT + keywordBoost * KEYWORD_MATCH_WEIGHT;
}
