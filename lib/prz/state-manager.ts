/**
 * StateManager - Manages Vapor ↔ Crystal state transitions for ideas
 * Part of PRZ Seven Pillars compliance for Super Reality OS Dashboard
 */

import type { Resonance } from './resonance-engine';
import { REALITY_THRESHOLD } from './resonance-engine';

/**
 * Idea state enum
 */
export enum IdeaState {
  /** Vapor state: idea is still forming, not yet materialized */
  VAPOR = 'vapor',
  /** Crystal state: idea has crystallized and is materialized */
  CRYSTAL = 'crystal',
}

/**
 * Represents an idea in the system
 */
export interface Idea {
  /** Unique identifier for the idea */
  id: string;
  /** Content of the idea */
  content: string;
  /** Current state of the idea */
  state: IdeaState;
  /** Resonance score history */
  resonanceHistory: number[];
  /** Timestamp when the idea was created */
  createdAt: number;
  /** Timestamp when the idea last changed state */
  lastStateChange: number;
  /** Metadata associated with the idea */
  metadata?: Record<string, any>;
}

/**
 * Configuration for state transitions
 */
export interface StateTransitionConfig {
  /** Minimum resonance to crystallize (default: REALITY_THRESHOLD) */
  crystallizationThreshold?: number;
  /** Number of low resonance readings before reverting to vapor */
  vaporRevertThreshold?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<StateTransitionConfig> = {
  crystallizationThreshold: REALITY_THRESHOLD,
  vaporRevertThreshold: 3,
};

/**
 * Generate a unique ID for an idea
 */
function generateIdeaId(): string {
  return `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initializes a new idea in the "vapor" state
 * 
 * @param pulse - The user input pulse that triggered the idea creation
 * @param metadata - Optional metadata to attach to the idea
 * @returns A new Idea object in vapor state
 */
export function createIdea(
  pulse: { content: string; [key: string]: any },
  metadata?: Record<string, any>
): Idea {
  const now = Date.now();
  
  return {
    id: generateIdeaId(),
    content: pulse.content,
    state: IdeaState.VAPOR,
    resonanceHistory: [],
    createdAt: now,
    lastStateChange: now,
    metadata: metadata || {},
  };
}

/**
 * Updates the idea state based on resonance
 * Either crystallizes (vapor → crystal) or reverts to vapor (crystal → vapor)
 * 
 * @param idea - The idea to check for crystallization
 * @param resonance - The current resonance measurement
 * @param config - Optional configuration for state transitions
 * @returns Updated idea with new state if changed
 */
export function checkCrystallization(
  idea: Idea,
  resonance: Resonance,
  config: StateTransitionConfig = {}
): Idea {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  
  // Add current resonance to history
  const updatedResonanceHistory = [...idea.resonanceHistory, resonance.score];
  
  // Create updated idea with new resonance history
  let updatedIdea: Idea = {
    ...idea,
    resonanceHistory: updatedResonanceHistory,
  };
  
  // Check for crystallization (vapor → crystal)
  if (
    idea.state === IdeaState.VAPOR &&
    resonance.score >= fullConfig.crystallizationThreshold
  ) {
    updatedIdea = {
      ...updatedIdea,
      state: IdeaState.CRYSTAL,
      lastStateChange: now,
    };
  }
  
  // Check for reversion to vapor (crystal → vapor)
  // This happens if we have multiple consecutive low resonance readings
  if (idea.state === IdeaState.CRYSTAL) {
    // Get the last N resonance readings
    const recentReadings = updatedResonanceHistory.slice(
      -fullConfig.vaporRevertThreshold
    );
    
    // Check if all recent readings are below threshold
    const allBelowThreshold = recentReadings.every(
      score => score < fullConfig.crystallizationThreshold
    );
    
    if (
      recentReadings.length >= fullConfig.vaporRevertThreshold &&
      allBelowThreshold
    ) {
      updatedIdea = {
        ...updatedIdea,
        state: IdeaState.VAPOR,
        lastStateChange: now,
      };
    }
  }
  
  return updatedIdea;
}

/**
 * Get all crystallized ideas from a collection
 * 
 * @param ideas - Array of ideas to filter
 * @returns Array of ideas in crystal state
 */
export function getCrystallizedIdeas(ideas: Idea[]): Idea[] {
  return ideas.filter(idea => idea.state === IdeaState.CRYSTAL);
}

/**
 * Get all vapor ideas from a collection
 * 
 * @param ideas - Array of ideas to filter
 * @returns Array of ideas in vapor state
 */
export function getVaporIdeas(ideas: Idea[]): Idea[] {
  return ideas.filter(idea => idea.state === IdeaState.VAPOR);
}

/**
 * Get average resonance for an idea
 * 
 * @param idea - The idea to calculate average resonance for
 * @returns Average resonance score or 0 if no history
 */
export function getAverageResonance(idea: Idea): number {
  if (idea.resonanceHistory.length === 0) {
    return 0;
  }
  
  const sum = idea.resonanceHistory.reduce((acc, score) => acc + score, 0);
  return sum / idea.resonanceHistory.length;
}
