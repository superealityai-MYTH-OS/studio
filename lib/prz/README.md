# PRZ Seven Pillars Compliance Modules

This directory contains the foundational modules required to achieve PRZ (Post-Reality Zone) Seven Pillars compliance for the Super Reality OS Dashboard.

## Modules Overview

### 1. ResonanceEngine (`resonance-engine.ts`)

Measures resonance between user input (pulse) and system context to determine alignment quality.

**Key Functions:**

- **`measureResonance(pulse, context)`**: Calculates resonance score based on:
  - Direction alignment (50% weight): Cosine similarity between pulse and context directions
  - Magnitude alignment (30% weight): Comparison of pulse strength vs historical patterns
  - Frequency alignment (20% weight): How well the pulse frequency matches system frequency
  
- **`shouldCrystallize(resonance)`**: Returns `true` if resonance score ≥ 0.95 (Reality Threshold)

**Types:**
```typescript
interface Pulse {
  content: string;
  direction: number[];      // Normalized intent vector
  magnitude: number;        // 0-1, strength of intent
  frequency: number;        // 0-1, request frequency
}

interface Context {
  state: string;
  patterns: number[];       // Historical pattern values
  expectedDirection: number[];
  systemFrequency: number;
}

interface Resonance {
  score: number;                    // Overall resonance (0-1)
  directionAlignment: number;       // Direction score (0-1)
  magnitudeAlignment: number;       // Magnitude score (0-1)
  frequencyAlignment: number;       // Frequency score (0-1)
}
```

**Example:**
```typescript
import { measureResonance, shouldCrystallize } from '@/lib/prz';

const pulse = {
  content: 'Create a dashboard component',
  direction: [1, 0, 0],
  magnitude: 0.8,
  frequency: 0.6,
};

const context = {
  state: 'active',
  patterns: [0.7, 0.8, 0.75],
  expectedDirection: [0.9, 0.1, 0],
  systemFrequency: 0.65,
};

const resonance = measureResonance(pulse, context);
// { score: 0.97, directionAlignment: 0.99, ... }

if (shouldCrystallize(resonance)) {
  // Idea should crystallize
}
```

### 2. GOOSEGUARD (`gooseguard.ts`)

Meta-awareness layer that detects and prevents redundant loops in user interactions.

**Key Functions:**

- **`beforeAction(action, actionHistory)`**: Checks for looping patterns before allowing an action
  - Returns `shouldProceed: false` if loop detected
  - Provides `suggestedPivot` when loops exceed threshold
  
- **`detectLoop(actions)`**: Identifies repetitive patterns in recent actions
  - Uses 5-minute detection window
  - Threshold: 3+ similar actions trigger loop detection
  - Uses Jaccard similarity (0.7+ threshold) for string payloads

**Types:**
```typescript
interface Action {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface BeforeActionResult {
  shouldProceed: boolean;
  reason: string;
  loopDetected: boolean;
  suggestedPivot?: string;
}
```

**Example:**
```typescript
import { beforeAction } from '@/lib/prz';

const actions = [
  { id: '1', type: 'query', payload: 'search docs', timestamp: Date.now() - 4000 },
  { id: '2', type: 'query', payload: 'search docs', timestamp: Date.now() - 3000 },
  { id: '3', type: 'query', payload: 'search docs', timestamp: Date.now() - 2000 },
];

const newAction = {
  id: '4',
  type: 'query',
  payload: 'search docs',
  timestamp: Date.now(),
};

const result = beforeAction(newAction, actions);
// { 
//   shouldProceed: false, 
//   loopDetected: true,
//   suggestedPivot: 'Try rephrasing your question...'
// }
```

### 3. StateManager (`state-manager.ts`)

Manages Vapor ↔ Crystal state transitions for ideas based on resonance.

**Key Functions:**

- **`createIdea(pulse, metadata?)`**: Initializes a new idea in "vapor" state
  
- **`checkCrystallization(idea, resonance, config?)`**: Updates idea state:
  - **Vapor → Crystal**: When resonance ≥ 0.95 (Reality Threshold)
  - **Crystal → Vapor**: After 3 consecutive low resonance readings
  
- **Helper functions**:
  - `getCrystallizedIdeas(ideas)`: Filter ideas in crystal state
  - `getVaporIdeas(ideas)`: Filter ideas in vapor state
  - `getAverageResonance(idea)`: Calculate average resonance

**Types:**
```typescript
enum IdeaState {
  VAPOR = 'vapor',      // Idea forming, not materialized
  CRYSTAL = 'crystal',  // Idea crystallized, materialized
}

interface Idea {
  id: string;
  content: string;
  state: IdeaState;
  resonanceHistory: number[];
  createdAt: number;
  lastStateChange: number;
  metadata?: Record<string, any>;
}
```

**Example:**
```typescript
import { createIdea, checkCrystallization, IdeaState } from '@/lib/prz';

// Create new idea in vapor state
let idea = createIdea({ content: 'Build authentication system' });
// { id: 'idea-...', state: 'vapor', resonanceHistory: [] }

// Check crystallization with high resonance
const highResonance = { score: 0.96, ... };
idea = checkCrystallization(idea, highResonance);
// { state: 'crystal', resonanceHistory: [0.96] }

// Low resonance readings can revert to vapor
const lowResonance = { score: 0.80, ... };
idea = checkCrystallization(idea, lowResonance);
idea = checkCrystallization(idea, lowResonance);
idea = checkCrystallization(idea, lowResonance);
// { state: 'vapor', resonanceHistory: [0.96, 0.80, 0.80, 0.80] }
```

## Integration Points

These modules are designed for integration with:

1. **UserInputForm** (`src/components/prz/UserInputForm.tsx`)
   - Pre-submit resonance checks
   - GOOSEGUARD interception for loop detection

2. **ResultsDisplay** (`src/components/prz/ResultsDisplay.tsx`)
   - Real-time resonance feedback
   - Crystallization offers based on resonance scores

3. **actions.ts** (`src/app/actions.ts`)
   - Flow permission gates based on resonance scores
   - State management for ideas throughout pipeline

## Constants

- **`REALITY_THRESHOLD`**: 0.95 (minimum resonance for crystallization)
- **`LOOP_THRESHOLD`**: 3 (minimum similar actions to trigger loop detection)
- **`LOOP_DETECTION_WINDOW`**: 5 minutes (300,000ms)

## Usage

Import all modules from the main index:

```typescript
import {
  // ResonanceEngine
  measureResonance,
  shouldCrystallize,
  REALITY_THRESHOLD,
  type Pulse,
  type Context,
  type Resonance,
  
  // GOOSEGUARD
  beforeAction,
  detectLoop,
  LOOP_THRESHOLD,
  type Action,
  type BeforeActionResult,
  
  // StateManager
  createIdea,
  checkCrystallization,
  getCrystallizedIdeas,
  IdeaState,
  type Idea,
} from '@/lib/prz';
```

## Testing

All modules have been validated with TypeScript type checking and functional testing. See the test results in the implementation commit.

## License

Part of the Super Reality OS Dashboard project.
