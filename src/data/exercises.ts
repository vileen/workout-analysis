import type { Exercise, ExerciseType } from '../types/pose';

export const EXERCISES: Exercise[] = [
  {
    id: 'kettle-goblet-squat' as ExerciseType,
    name: 'Kettle Goblet Squat',
    namePl: 'Przysiad goblet z kettlebell',
    description: 'Squat with kettlebell held at chest. Keep torso upright and reach full depth.',
    descriptionPl: 'Przysiad z kettlebell trzymaną przy klatce piersiowej. Utrzymuj wyprostowany tułów i pełną głębokość.',
    difficulty: 'beginner',
  },
  {
    id: 'kettle-swing' as ExerciseType,
    name: 'Kettlebell Swing',
    namePl: 'Wymach kettlebell dwurącz',
    description: 'Hip hinge + kettlebell swing to horizontal position. Drive from hips, not arms.',
    descriptionPl: 'Hip hinge + wymach kettlebell do pozycji poziomej. Napęd z bioder, nie z ramion.',
    difficulty: 'intermediate',
  },
  {
    id: 'kettle-row' as ExerciseType,
    name: 'Kettlebell Row',
    namePl: 'Wiosłowanie kettlebell jednorącz',
    description: 'Row with bench support option. Movement plane close to torso.',
    descriptionPl: 'Wiosłowanie z opcją podparcia ławeczki. Płaszczyzna ruchu przy tułowiu.',
    difficulty: 'beginner',
  },
  {
    id: 'kettle-press' as ExerciseType,
    name: 'Kettlebell Single-Arm Press',
    namePl: 'Wyciskanie kettlebell jednorącz',
    description: 'Press kettlebell overhead with one arm. Torso and shoulder stabilization.',
    descriptionPl: 'Wyciskanie kettlebell nad głowę jedną ręką. Stabilizacja tułowia i barku.',
    difficulty: 'intermediate',
  },
  {
    id: 'russian-twist' as ExerciseType,
    name: 'Russian Twist',
    namePl: 'Russian twist z kettlebell',
    description: 'Torso rotation with kettlebell. Legs lifted or on floor.',
    descriptionPl: 'Rotacja tułowia z kettlebell. Nogi uniesione lub na podłodze.',
    difficulty: 'beginner',
  },
];

export function getExerciseById(id: ExerciseType): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
  return EXERCISES.filter(e => e.difficulty === difficulty);
}
