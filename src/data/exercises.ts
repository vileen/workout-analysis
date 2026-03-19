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
  {
    id: 'kettle-floor-press' as ExerciseType,
    name: 'Kettlebell Floor Press',
    namePl: 'Wyciskanie kettlebell leżąc',
    description: 'Press kettlebell from floor position. Keep kettle close to chest, elbows at 45°, stabilize shoulders.',
    descriptionPl: 'Wyciskanie kettlebell z pozycji leżącej. Trzymaj kettle blisko klatki, łokcie pod kątem 45°, stabilizuj barki.',
    difficulty: 'beginner',
  },
  {
    id: 'kettle-overhead-press' as ExerciseType,
    name: 'Kettlebell Overhead Press',
    namePl: 'Wyciskanie kettlebell nad głowę',
    description: 'Press kettlebell overhead standing or seated. Keep core tight, don\'t slouch, press to full extension.',
    descriptionPl: 'Wyciskanie kettlebell nad głowę stojąc lub siedząc. Napięty brzuch, bez garbienia, pełne wyciśnięcie.',
    difficulty: 'intermediate',
  },
  {
    id: 'pushup' as ExerciseType,
    name: 'Push-up',
    namePl: 'Pompki',
    description: 'Classic push-ups (standard, diamond, or knee push-ups). Keep body in line, elbows close to torso.',
    descriptionPl: 'Klasyczne pompki (standardowe, diamentowe lub na kolanach). Ciało w linii, łokcie przy tułowiu.',
    difficulty: 'beginner',
  },
  {
    id: 'kettle-upright-row' as ExerciseType,
    name: 'Kettlebell Upright Row',
    namePl: 'Wyciąganie kettlebell w górę',
    description: 'Pull kettlebell vertically along body. Lead with elbows high, keep shoulders down (don\'t let them go to ears).',
    descriptionPl: 'Pionowe wyciąganie kettlebell wzdłuż ciała. Łokcie wysoko, barki opuszczone (nie ciągnij do uszu).',
    difficulty: 'beginner',
  },
  {
    id: 'triceps-extension' as ExerciseType,
    name: 'Dumbbell Triceps Extension',
    namePl: 'Wyciskanie francuskie hantli',
    description: 'Triceps extension with dumbbell overhead or lying. Keep core tight, don\'t let elbows drift outward.',
    descriptionPl: 'Wyciskanie francuskie hantli nad głową lub leżąc. Napięty brzuch, nie rozchylaj łokci na zewnątrz.',
    difficulty: 'beginner',
  },
];

export function getExerciseById(id: ExerciseType): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
  return EXERCISES.filter(e => e.difficulty === difficulty);
}
