# PRZ Modules Integration Guide

This document provides examples and guidance for integrating the PRZ foundational modules into the existing Super Reality OS Dashboard components.

## Integration Overview

The PRZ modules should be integrated at three key points:

1. **UserInputForm** - Pre-submit validation and loop detection
2. **actions.ts** - Resonance measurement and state management during pipeline execution
3. **ResultsDisplay** - Display resonance feedback and crystallization status

## 1. UserInputForm Integration

### Adding GOOSEGUARD Loop Detection

Add action history tracking and loop detection before form submission:

```typescript
// src/components/prz/UserInputForm.tsx
'use client';

import { useState, useRef } from 'react';
import { beforeAction, type Action } from '@/lib/prz';
// ... other imports

export function UserInputForm({ setIsLoading, setResult, setError, isLoading }: UserInputFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      request: '',
    },
  });
  
  // Track action history for GOOSEGUARD
  const actionHistoryRef = useRef<Action[]>([]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Create new action
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: 'query',
      payload: data.request,
      timestamp: Date.now(),
    };
    
    // Check for loops with GOOSEGUARD
    const gooseguardResult = beforeAction(newAction, actionHistoryRef.current);
    
    if (!gooseguardResult.shouldProceed) {
      // Loop detected - show warning
      toast({
        title: 'Loop Detected',
        description: gooseguardResult.suggestedPivot,
        variant: 'destructive',
      });
      setError(gooseguardResult.reason);
      return;
    }
    
    // Add to history
    actionHistoryRef.current = [...actionHistoryRef.current, newAction];
    
    // Keep only last 10 actions
    if (actionHistoryRef.current.length > 10) {
      actionHistoryRef.current = actionHistoryRef.current.slice(-10);
    }
    
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await runPrzPipeline({ userRequest: data.request });
      setResult(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // ... rest of component
}
```

## 2. actions.ts Integration

### Adding Resonance Measurement and State Management

Integrate ResonanceEngine and StateManager into the pipeline:

```typescript
// src/app/actions.ts
'use server';

import {
  measureResonance,
  shouldCrystallize,
  createIdea,
  checkCrystallization,
  type Pulse,
  type Context,
  type Idea,
} from '@/lib/prz';
// ... other imports

export type PrzPipelineOutput = {
  intentResult: IntentDecoderOutput;
  deliverable: string;
  validationResult: PrzValidationOutput;
  mintingResult: MintZakEchoOutput;
  // Add new fields
  resonanceResult?: {
    resonance: number;
    shouldCrystallize: boolean;
    ideaState: string;
  };
  idea?: Idea;
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
    throw new Error('Could not decode intent with high confidence.');
  }

  // 2. Create Pulse from user request
  const pulse: Pulse = {
    content: userRequest,
    // Convert intent to direction vector (simplified)
    direction: [intentResult.confidenceScore, 0, 0],
    magnitude: intentResult.confidenceScore,
    frequency: 0.5, // Could be calculated from user history
  };

  // 3. Define system context
  const context: Context = {
    state: 'active',
    patterns: [0.7, 0.8, 0.75], // Historical quality scores
    expectedDirection: [0.8, 0.1, 0.1],
    systemFrequency: 0.6,
  };

  // 4. Measure resonance
  const resonance = measureResonance(pulse, context);
  
  // 5. Create idea in vapor state
  let idea = createIdea({ content: userRequest }, {
    intent: intentResult.intent,
    domain: intentResult.domain,
  });

  // 6. Complete Deliverable (existing logic)
  const deliverable = `**Task: ${intentResult.intent}**\n\n...`;

  // 7. PRZ Validation
  const validationResult = await przValidation({
    response: deliverable,
    taskDomain: intentResult.domain,
  });

  // 8. Check crystallization based on resonance
  idea = checkCrystallization(idea, resonance);

  // 9. ZAK Echo Minting
  const mintingResult = await mintZakEcho({
    flowScore: validationResult.flow,
    taskDescription: `User request: "${userRequest}"`,
  });

  // 10. Return everything including resonance data
  return {
    intentResult,
    deliverable,
    validationResult,
    mintingResult,
    resonanceResult: {
      resonance: resonance.score,
      shouldCrystallize: shouldCrystallize(resonance),
      ideaState: idea.state,
    },
    idea,
  };
}
```

## 3. ResultsDisplay Integration

### Showing Resonance Metrics and Crystallization Status

Add a new tab or section to display resonance information:

```typescript
// src/components/prz/ResultsDisplay.tsx
import { Activity, Atom } from 'lucide-react';
// ... other imports

export function ResultsDisplay({ result }: { result: PrzPipelineOutput }) {
  const { 
    intentResult, 
    deliverable, 
    validationResult, 
    mintingResult,
    resonanceResult, // New field
    idea, // New field
  } = result;

  return (
    <Tabs defaultValue="validation" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="resonance">Resonance</TabsTrigger>
        <TabsTrigger value="deliverable">Deliverable</TabsTrigger>
        <TabsTrigger value="registry">ZAK Echo Registry</TabsTrigger>
      </TabsList>

      {/* Existing tabs... */}

      <TabsContent value="resonance" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="text-primary" />
                Resonance Analysis
              </CardTitle>
              <CardDescription>
                Alignment between your request and system context
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resonanceResult && (
                <div className="space-y-4">
                  <MetricCard
                    title="Resonance Score"
                    value={resonanceResult.resonance.toFixed(3)}
                    maxValue={1}
                    description="Overall alignment quality"
                    icon={Activity}
                  />
                  
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <Atom className={`h-8 w-8 ${
                      resonanceResult.shouldCrystallize 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`} />
                    <div>
                      <p className="font-semibold">
                        {resonanceResult.shouldCrystallize 
                          ? '✓ Crystallization Threshold Met' 
                          : 'Vapor State - Building Resonance'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current state: <Badge>{resonanceResult.ideaState}</Badge>
                      </p>
                    </div>
                  </div>
                  
                  {idea && (
                    <div className="text-sm space-y-2">
                      <p><strong>Idea ID:</strong> {idea.id}</p>
                      <p><strong>Resonance History:</strong></p>
                      <div className="flex gap-2">
                        {idea.resonanceHistory.map((score, i) => (
                          <Badge key={i} variant="outline">
                            {score.toFixed(3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Other existing tabs... */}
    </Tabs>
  );
}
```

## 4. Advanced Usage Patterns

### Pattern 1: Dynamic Threshold Adjustment

Adjust crystallization thresholds based on user experience level:

```typescript
import { checkCrystallization } from '@/lib/prz';

const config = {
  crystallizationThreshold: userExperience === 'beginner' ? 0.90 : 0.95,
  vaporRevertThreshold: 3,
};

const updatedIdea = checkCrystallization(idea, resonance, config);
```

### Pattern 2: Resonance-Based Flow Control

Gate operations based on resonance scores:

```typescript
import { measureResonance, REALITY_THRESHOLD } from '@/lib/prz';

const resonance = measureResonance(pulse, context);

if (resonance.score < REALITY_THRESHOLD * 0.8) {
  // Low resonance - ask for clarification
  return {
    status: 'needs_clarification',
    message: 'Could you provide more details?',
  };
} else if (resonance.score < REALITY_THRESHOLD) {
  // Medium resonance - proceed with monitoring
  return {
    status: 'monitored',
    message: 'Processing with additional validation...',
  };
} else {
  // High resonance - green lane
  return {
    status: 'green_lane',
    message: 'High quality input detected. Fast-tracking...',
  };
}
```

### Pattern 3: Persistent Action History

Store action history in local storage or database:

```typescript
// In UserInputForm or a custom hook
import { beforeAction, type Action } from '@/lib/prz';

function useActionHistory() {
  const [actions, setActions] = useState<Action[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prz_action_history');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const addAction = (action: Action) => {
    const updated = [...actions, action].slice(-20); // Keep last 20
    setActions(updated);
    localStorage.setItem('prz_action_history', JSON.stringify(updated));
  };

  const checkAction = (action: Action) => {
    return beforeAction(action, actions);
  };

  return { actions, addAction, checkAction };
}
```

## Testing Integration

Example test for integrated functionality:

```typescript
import { measureResonance, beforeAction, createIdea } from '@/lib/prz';

describe('PRZ Integration', () => {
  test('full pipeline with resonance and loop detection', () => {
    // Create pulse
    const pulse = {
      content: 'test request',
      direction: [1, 0, 0],
      magnitude: 0.8,
      frequency: 0.6,
    };
    
    // Measure resonance
    const resonance = measureResonance(pulse, context);
    expect(resonance.score).toBeGreaterThan(0);
    
    // Create and crystallize idea
    let idea = createIdea({ content: pulse.content });
    idea = checkCrystallization(idea, resonance);
    
    // Check loop detection
    const action = {
      id: '1',
      type: 'query',
      payload: pulse.content,
      timestamp: Date.now(),
    };
    const result = beforeAction(action, []);
    expect(result.shouldProceed).toBe(true);
  });
});
```

## Next Steps

1. Implement GOOSEGUARD in UserInputForm
2. Add resonance measurement to runPrzPipeline
3. Create new Resonance tab in ResultsDisplay
4. Add tests for integrated functionality
5. Monitor real-world usage and tune thresholds

## Configuration

Consider adding a configuration file for tuning PRZ parameters:

```typescript
// config/prz-config.ts
export const PRZ_CONFIG = {
  resonance: {
    realityThreshold: 0.95,
    defaultMagnitude: 0.5,
    directionWeight: 0.5,
    magnitudeWeight: 0.3,
    frequencyWeight: 0.2,
  },
  gooseguard: {
    loopThreshold: 3,
    detectionWindow: 5 * 60 * 1000, // 5 minutes
    similarityThreshold: 0.7,
  },
  stateManager: {
    vaporRevertThreshold: 3,
  },
};
```
