/**
 * GOOSEGUARD - Meta-awareness layer to detect and prevent redundant loops
 * Part of PRZ Seven Pillars compliance for Super Reality OS Dashboard
 */

/**
 * Represents a user action
 */
export interface Action {
  /** Unique identifier for the action */
  id: string;
  /** Type of action */
  type: string;
  /** Action payload/content */
  payload: any;
  /** Timestamp when the action occurred */
  timestamp: number;
}

/**
 * Result of the beforeAction check
 */
export interface BeforeActionResult {
  /** Whether the action should proceed */
  shouldProceed: boolean;
  /** Reason for the decision */
  reason: string;
  /** Whether a loop was detected */
  loopDetected: boolean;
  /** Suggested alternative action if loop detected */
  suggestedPivot?: string;
}

/**
 * Loop detection result
 */
export interface LoopDetection {
  /** Whether a loop was detected */
  detected: boolean;
  /** Pattern of the loop if detected */
  pattern?: string;
  /** Number of repetitions in the loop */
  repetitions?: number;
}

/**
 * Threshold for loop detection (number of similar actions before flagging)
 */
export const LOOP_THRESHOLD = 3;

/**
 * Time window in milliseconds to consider for loop detection (5 minutes)
 */
export const LOOP_DETECTION_WINDOW = 5 * 60 * 1000;

/**
 * Similarity threshold for considering actions as similar (0-1)
 */
export const SIMILARITY_THRESHOLD = 0.7;

/**
 * Calculate similarity between two actions
 * Returns a value between 0 (completely different) and 1 (identical)
 */
function calculateActionSimilarity(action1: Action, action2: Action): number {
  // Type must match for similarity
  if (action1.type !== action2.type) {
    return 0;
  }
  
  // For string payloads, use simple string similarity
  if (typeof action1.payload === 'string' && typeof action2.payload === 'string') {
    const str1 = action1.payload.toLowerCase();
    const str2 = action2.payload.toLowerCase();
    
    // Calculate Jaccard similarity based on word sets
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  // For object payloads, check key overlap
  if (
    typeof action1.payload === 'object' && 
    action1.payload !== null &&
    typeof action2.payload === 'object' &&
    action2.payload !== null
  ) {
    const keys1 = Object.keys(action1.payload);
    const keys2 = Object.keys(action2.payload);
    
    const matchingKeys = keys1.filter(key => 
      keys2.includes(key) && 
      action1.payload[key] === action2.payload[key]
    );
    
    const totalKeys = new Set([...keys1, ...keys2]).size;
    return totalKeys > 0 ? matchingKeys.length / totalKeys : 0;
  }
  
  // Default: exact equality check
  return action1.payload === action2.payload ? 1 : 0;
}

/**
 * Detects repetitive patterns in recent user actions
 * 
 * @param actions - Array of recent actions to analyze
 * @returns LoopDetection result indicating if a loop was found
 */
export function detectLoop(actions: Action[]): LoopDetection {
  if (actions.length < LOOP_THRESHOLD) {
    return { detected: false };
  }
  
  // Get actions within the detection window
  const now = Date.now();
  const recentActions = actions.filter(
    action => now - action.timestamp <= LOOP_DETECTION_WINDOW
  );
  
  if (recentActions.length < LOOP_THRESHOLD) {
    return { detected: false };
  }
  
  // Check for similar consecutive actions
  const mostRecentAction = recentActions[recentActions.length - 1];
  let similarCount = 1;
  let pattern = mostRecentAction.type;
  
  // Count similar actions to the most recent one
  for (let i = recentActions.length - 2; i >= 0; i--) {
    const similarity = calculateActionSimilarity(mostRecentAction, recentActions[i]);
    
    // Consider actions similar if similarity exceeds threshold
    if (similarity > SIMILARITY_THRESHOLD) {
      similarCount++;
    }
  }
  
  // Detect loop if we have enough similar actions
  if (similarCount >= LOOP_THRESHOLD) {
    return {
      detected: true,
      pattern,
      repetitions: similarCount,
    };
  }
  
  return { detected: false };
}

/**
 * Generates a suggested pivot action when a loop is detected
 */
function generatePivotSuggestion(action: Action): string {
  switch (action.type.toLowerCase()) {
    case 'query':
    case 'search':
      return 'Try rephrasing your question or exploring a different aspect of the topic.';
    case 'create':
    case 'generate':
      return 'Consider refining your requirements or trying a different approach.';
    case 'update':
    case 'modify':
      return 'Try a different modification strategy or review the current state first.';
    case 'delete':
    case 'remove':
      return 'Verify the target exists and consider if removal is necessary.';
    default:
      return 'Consider taking a different approach or exploring alternative options.';
  }
}

/**
 * Checks for looping patterns before allowing an action to proceed
 * Suggests a pivot if loops exceed the threshold
 * 
 * @param action - The action about to be executed
 * @param actionHistory - History of recent actions (optional, uses internal history if not provided)
 * @returns BeforeActionResult indicating if the action should proceed
 */
export function beforeAction(
  action: Action,
  actionHistory: Action[] = []
): BeforeActionResult {
  // Add the current action to history for analysis
  const actionsToAnalyze = [...actionHistory, action];
  
  // Detect loops in the action history
  const loopDetection = detectLoop(actionsToAnalyze);
  
  if (loopDetection.detected) {
    return {
      shouldProceed: false,
      reason: `Loop detected: You've performed similar "${loopDetection.pattern}" actions ${loopDetection.repetitions} times recently.`,
      loopDetected: true,
      suggestedPivot: generatePivotSuggestion(action),
    };
  }
  
  return {
    shouldProceed: true,
    reason: 'No loops detected. Action may proceed.',
    loopDetected: false,
  };
}
