import { Exercise, ExerciseType } from '../types/pose';

export const EXERCISES: Exercise[] = [
  {
    id: 'squat' as ExerciseType,
    name: 'Squat',
    namePl: 'Przysiad',
    description: 'Klasyczny przysiad ze sztangą lub bez. Pamiętaj o pełnej głębokości i kolanach na zewnątrz.',
    difficulty: 'beginner',
  },
  {
    id: 'pushup' as ExerciseType,
    name: 'Push-up',
    namePl: 'Pompka',
    description: 'Klasyczna pompka. Dbaj o prostą linię ciała i głębokie opuszczanie.',
    difficulty: 'beginner',
  },
  {
    id: 'plank' as ExerciseType,
    name: 'Plank',
    namePl: 'Deska',
    description: 'Statyczne ćwiczenie na mięśnie brzucha. Utrzymuj prostą linię od głowy do pięt.',
    difficulty: 'beginner',
  },
  {
    id: 'lunge' as ExerciseType,
    name: 'Lunge',
    namePl: 'Wykrok',
    description: 'Wykrok w przód. Kolano nie powinno wykraczać za linię palców.',
    difficulty: 'intermediate',
  },
  {
    id: 'deadlift' as ExerciseType,
    name: 'Deadlift',
    namePl: 'Martwy ciąg',
    description: 'Podnoszenie ciężaru z podłogi. Plecy proste, napięty brzuch.',
    difficulty: 'advanced',
  },
];

export function getExerciseById(id: ExerciseType): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
  return EXERCISES.filter(e => e.difficulty === difficulty);
}
