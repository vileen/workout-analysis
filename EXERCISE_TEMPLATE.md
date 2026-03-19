# Exercise Template

Template for adding new exercises to the workout-analysis project.

---

## Quick Checklist

- [ ] Add exercise ID to `ExerciseType` union in `src/types/pose.ts`
- [ ] Add exercise object to `EXERCISES` array in `src/data/exercises.ts`
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Test the app to verify exercise appears correctly

---

## File 1: `src/types/pose.ts`

### Add exercise ID to ExerciseType union

```typescript
export type ExerciseType = 
  | 'squat' 
  | 'pushup' 
  | 'plank' 
  | 'lunge' 
  | 'deadlift'
  | 'kettle-goblet-squat'
  | 'kettle-swing'
  | 'kettle-row'
  | 'kettle-press'
  | 'russian-twist'
  | 'kettle-floor-press'
  | 'kettle-overhead-press'
  | 'kettle-upright-row'
  | 'triceps-extension'
  | 'YOUR_NEW_EXERCISE';  // <-- ADD HERE
```

---

## File 2: `src/data/exercises.ts`

### Add exercise object to EXERCISES array

```typescript
{
  id: 'YOUR_NEW_EXERCISE' as ExerciseType,
  name: 'English Name',
  namePl: 'Polish Name',
  description: 'Short English description of the exercise.',
  descriptionPl: 'Krótki polski opis ćwiczenia.',
  difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  videoUrl: 'https://www.youtube.com/watch?v=XXXXXXXXXXX',
  instructions: {
    // Polish setup steps (3-5 items)
    setup: [
      'Krok 1 przygotowania',
      'Krok 2 przygotowania',
      'Krok 3 przygotowania',
    ],
    // Polish execution steps (3-5 items)
    execution: [
      'Krok 1 wykonania',
      'Krok 2 wykonania',
      'Krok 3 wykonania',
    ],
    // Common mistakes in Polish (3-4 items)
    commonMistakes: [
      'Częsty błąd 1',
      'Częsty błąd 2',
      'Częsty błąd 3',
    ],
    // Tips in Polish (2-3 items)
    tips: [
      'Wskazówka 1',
      'Wskazówka 2',
    ],
    // Target muscles in Polish
    muscles: ['Mięsień 1', 'Mięsień 2', 'Mięsień 3'],
    
    // English translations
    setupEn: [
      'Setup step 1',
      'Setup step 2',
      'Setup step 3',
    ],
    executionEn: [
      'Execution step 1',
      'Execution step 2',
      'Execution step 3',
    ],
    commonMistakesEn: [
      'Common mistake 1',
      'Common mistake 2',
      'Common mistake 3',
    ],
    tipsEn: [
      'Tip 1',
      'Tip 2',
    ],
    musclesEn: ['Muscle 1', 'Muscle 2', 'Muscle 3'],
  },
},
```

---

## Instructions Fields Reference

### setup / setupEn
3-5 steps describing starting position and preparation
- Body position
- Grip/hand placement
- Stance
- Engagement of core

### execution / executionEn
3-5 steps describing the movement
- Concentric phase (lifting/pressing)
- Full extension/peak position
- Eccentric phase (lowering)
- Breathing cues

### commonMistakes / commonMistakesEn
3-4 common errors to avoid
- Form issues
- Compensations
- Range of motion problems

### tips / tipsEn
2-3 pro tips for better execution
- Mental cues
- Technical refinements
- Safety reminders

### muscles / musclesEn
Target muscles worked (2-5 items)
- Primary movers
- Secondary muscles
- Stabilizers

---

## Example: Complete Exercise Entry

```typescript
{
  id: 'kettle-goblet-squat' as ExerciseType,
  name: 'Kettle Goblet Squat',
  namePl: 'Przysiad goblet z kettlebell',
  description: 'Squat with kettlebell held at chest. Keep torso upright and reach full depth.',
  descriptionPl: 'Przysiad z kettlebell trzymaną przy klatce piersiowej. Utrzymuj wyprostowany tułów i pełną głębokość.',
  difficulty: 'beginner',
  videoUrl: 'https://www.youtube.com/watch?v=example123',
  instructions: {
    setup: [
      'Stań w szerokim rozkroku, nogi nieco szerzej niż biodra',
      'Chwyć kettlebell oburącz przy klatce piersiowej',
      'Łokcie wąsko, wskazują w dół',
      'Plecy proste, klatka uniesiona',
    ],
    execution: [
      'Opuszczaj się w dół, zginając kolana i biodra',
      'Utrzymuj wyprostowany tułów, nie garb się',
      'Idź na pełną głębokość - biodra poniżej kolan',
      'Wstań naciskając przez pięty, prostując nogi',
    ],
    commonMistakes: [
      'Zgarbione plecy i opadająca klatka',
      'Unoszenie pięt z podłogi',
      'Niepełna głębokość - biodra powyżej kolan',
      'Kolana zapadające się do środka (valgus)',
    ],
    tips: [
      'Trzymaj łokcie wewnątrz ud - pomaga utrzymać prostą sylwetkę',
      'Wdech w dół, wydech w górę',
      'Wyobraź sobie, że siadasz na krześle za sobą',
    ],
    muscles: ['Czworogłowe uda', 'Pośladki', 'Core', 'Barki (stabilizacja)'],
    setupEn: [
      'Stand in wide stance, feet slightly wider than hips',
      'Hold kettlebell with both hands at chest',
      'Elbows narrow, pointing down',
      'Straight back, chest up',
    ],
    executionEn: [
      'Lower down by bending knees and hips',
      'Keep torso upright, don\'t slouch',
      'Go full depth - hips below knees',
      'Stand up pressing through heels, straightening legs',
    ],
    commonMistakesEn: [
      'Rounded back and dropping chest',
      'Heels lifting off floor',
      'Incomplete depth - hips above knees',
      'Knees caving inward (valgus)',
    ],
    tipsEn: [
      'Keep elbows inside thighs - helps maintain upright posture',
      'Inhale down, exhale up',
      'Imagine sitting back onto a chair behind you',
    ],
    musclesEn: ['Quadriceps', 'Glutes', 'Core', 'Shoulders (stabilization)'],
  },
},
```

---

## Testing Checklist

After adding the exercise:

1. **TypeScript compilation**
   ```bash
   npx tsc --noEmit
   ```

2. **App functionality**
   - [ ] Exercise appears in exercise list
   - [ ] Exercise details page loads
   - [ ] Instructions display correctly
   - [ ] Video URL is accessible (if real)

3. **UI/UX verification**
   - [ ] Polish text displays correctly (no encoding issues)
   - [ ] English translations are accurate
   - [ ] Layout looks good with new content

---

## Commit Message Template

```
feat: Add [Exercise Name] exercise

- Added [exercise-id] to ExerciseType
- Added exercise data with instructions and videoUrl
- Included Polish and English translations
```

---

## Notes

- Use meaningful exercise IDs (kebab-case): `kettle-goblet-squat`, `dumbbell-curl`
- Keep descriptions concise (1-2 sentences)
- YouTube video URLs can be placeholders during development
- Polish is the primary language (required), English is secondary
- Difficulty levels:
  - `beginner` - Simple movement patterns, low injury risk
  - `intermediate` - Requires coordination or moderate strength
  - `advanced` - Complex technique or high strength demands
