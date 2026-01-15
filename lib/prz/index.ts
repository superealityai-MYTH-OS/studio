/**
 * PRZ Seven Pillars Compliance Modules
 * Foundational modules for Super Reality OS Dashboard
 */

// ResonanceEngine exports
export {
  measureResonance,
  shouldCrystallize,
  REALITY_THRESHOLD,
  type Pulse,
  type Context,
  type Resonance,
} from './resonance-engine';

// GOOSEGUARD exports
export {
  beforeAction,
  detectLoop,
  LOOP_THRESHOLD,
  LOOP_DETECTION_WINDOW,
  SIMILARITY_THRESHOLD,
  type Action,
  type BeforeActionResult,
  type LoopDetection,
} from './gooseguard';

// StateManager exports
export {
  createIdea,
  checkCrystallization,
  getCrystallizedIdeas,
  getVaporIdeas,
  getAverageResonance,
  IdeaState,
  type Idea,
  type StateTransitionConfig,
} from './state-manager';
