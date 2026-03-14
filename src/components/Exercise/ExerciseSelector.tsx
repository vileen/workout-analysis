import { useState } from 'react';
import { EXERCISES } from '../../data/exercises';
import { Exercise } from '../../types/pose';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise, targetReps: number) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [targetReps, setTargetReps] = useState(10);
  const [difficulty, setDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredExercises = EXERCISES.filter(e => 
    difficulty === 'all' || e.difficulty === difficulty
  );

  const handleStart = () => {
    if (selectedExercise) {
      onSelect(selectedExercise, targetReps);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">Form Analyzer</h1>
          <p className="text-gray-400">Analiza formy w czasie rzeczywistym</p>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 justify-center">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                difficulty === level
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {level === 'all' ? 'Wszystkie' : 
               level === 'beginner' ? 'Początkujący' : 
               level === 'intermediate' ? 'Średni' : 'Zaawansowany'}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedExercise?.id === exercise.id
                  ? 'bg-green-600 ring-2 ring-green-400'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{exercise.namePl}</h3>
                  <p className="text-sm text-gray-400">{exercise.name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  exercise.difficulty === 'beginner' ? 'bg-green-900 text-green-400' :
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-400' :
                  'bg-red-900 text-red-400'
                }`}>
                  {exercise.difficulty === 'beginner' ? 'Początkujący' :
                   exercise.difficulty === 'intermediate' ? 'Średni' : 'Zaawansowany'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-300">{exercise.description}</p>
            </button>
          ))}
        </div>

        {/* Target reps selector */}
        {selectedExercise && (
          <div className="bg-gray-800 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Liczba powtórzeń
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={targetReps}
                onChange={(e) => setTargetReps(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl font-bold w-16 text-center">{targetReps}</span>
            </div>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!selectedExercise}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedExercise
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Rozpocznij trening
        </button>

        {/* Setup instructions */}
        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
          <h4 className="font-medium text-white mb-2">Przed treningiem:</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ustaw iPhone na statywie</li>
            <li>Staw się 2-3 metry od kamery</li>
            <li>Upewnij się, że jest dobre światło</li>
            <li>Włącz dźwięk dla wskazówek głosowych</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
