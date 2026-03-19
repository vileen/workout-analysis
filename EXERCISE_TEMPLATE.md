# Exercise Addition Template

Use this checklist when adding new exercises to the workout-analysis app.

## Files to Modify

### 1. `src/types/pose.ts`
Add new ExerciseType to the union type:

```typescript
export type ExerciseType = 
  | 'squat' 
  | 'pushup'
  | 'your-new-exercise'  // <-- ADD HERE
  ;
```

### 2. `src/data/exercises.ts`
Add Exercise object to EXERCISES array:

```typescript
{
  id: 'your-new-exercise' as ExerciseType,
  name: 'Exercise Name',
  namePl: 'Nazwa ćwiczenia (PL)',
  description: 'English description',
  descriptionPl: 'Opis po polsku',
  difficulty: 'beginner', // or 'intermediate' or 'advanced'
  videoUrl: 'https://www.youtube.com/watch?v=...', // optional
  instructions: {
    setup: ['Setup step 1', 'Setup step 2'],
    execution: ['Execution step 1', 'Execution step 2'],
    commonMistakes: ['Mistake 1', 'Mistake 2'],
    tips: ['Tip 1', 'Tip 2'],
    muscles: ['Muscle 1', 'Muscle 2'],
    setupEn: ['English setup 1', 'English setup 2'],
    executionEn: ['English execution 1', 'English execution 2'],
    commonMistakesEn: ['English mistake 1', 'English mistake 2'],
    tipsEn: ['English tip 1', 'English tip 2'],
    musclesEn: ['English muscle 1', 'English muscle 2'],
  },
}
```

### 3. `src/engines/yourExerciseAnalyzer.ts` (NEW FILE)
Create analyzer engine:

```typescript
import type { Pose, FormAnalysis, RepState } from '../types/pose';
import { POSE_LANDMARKS } from '../types/pose';
import { 
  calculateJointAngle,
  areAllVisible,
  getAverage,
} from '../utils/math';

const CRITERIA = {
  minAngle: 90,
  maxAngle: 170,
  // Add your criteria
};

export interface YourExerciseState {
  repState: RepState;
  repCount: number;
  // Add state fields
}

export function analyzeYourExercise(pose: Pose): FormAnalysis {
  // Form analysis logic
  return {
    isValid: true,
    score: 100,
    feedback: [],
    details: {},
  };
}

export function detectYourExerciseRep(
  currentState: YourExerciseState,
  pose: Pose
): { newState: YourExerciseState; repCompleted: boolean } {
  // Rep detection logic
  return { newState: currentState, repCompleted: false };
}

export function getInitialYourExerciseState(): YourExerciseState {
  return {
    repState: 'up',
    repCount: 0,
    // Initial values
  };
}
```

### 4. `src/i18n/translations.ts`
Add form cues to Translations interface:

```typescript
yourExercise: {
  cue1: string;
  cue2: string;
  goodRep: string;
};
```

Add translations for both PL and EN in the `translations` object.

### 5. `src/components/Exercise/ExerciseView.tsx`
Add imports:
```typescript
import { analyzeYourExercise, detectYourExerciseRep, getInitialYourExerciseState } from '../../engines/yourExerciseAnalyzer';
import type { YourExerciseState } from '../../engines/yourExerciseAnalyzer';
```

Add to ExerciseState type union:
```typescript
type ExerciseState = 
  | SquatState 
  | YourExerciseState  // <-- ADD
  ;
```

Add to switch statements (4 places):
- Exercise initialization
- Pose detection/form analysis
- Audio feedback (rep completion)
- Form correction audio
- Display values

Example:
```typescript
case 'your-new-exercise':
  setExerciseState(getInitialYourExerciseState());
  break;
```

## Testing Checklist

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Exercise appears in exercise list
- [ ] Can start workout with new exercise
- [ ] Form analysis provides feedback
- [ ] Rep counting works correctly
- [ ] Audio feedback plays
- [ ] Polish translations display correctly

## Example: Adding "Kettle Floor Press"

See commits:
- `28a5fb0` - feat: Add 5 upper body exercises
- `6678ee3` - fix: Correct triceps type and add Polish translations

For reference implementations, see:
- `src/engines/kettleFloorPressAnalyzer.ts`
- `src/engines/pushupAnalyzer.ts`
