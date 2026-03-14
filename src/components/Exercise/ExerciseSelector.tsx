import { useState } from 'react';
import { EXERCISES } from '../../data/exercises';
import { EXERCISE_INSTRUCTIONS } from '../../data/instructions';
import type { Exercise, ExerciseInstructions } from '../../types/pose';
import { audioFeedback } from '../../utils/audioFeedback';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise, targetReps: number) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [targetReps, setTargetReps] = useState(10);
  const [difficulty, setDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showInstructions, setShowInstructions] = useState(false);
  const [audioTested, setAudioTested] = useState(false);

  const filteredExercises = EXERCISES.filter(e => 
    difficulty === 'all' || e.difficulty === difficulty
  );

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowInstructions(true);
  };

  const handleStart = () => {
    if (selectedExercise) {
      onSelect(selectedExercise, targetReps);
    }
  };

  const getInstructions = (exerciseId: string): ExerciseInstructions | null => {
    return EXERCISE_INSTRUCTIONS[exerciseId] || null;
  };

  const instructions = selectedExercise ? getInstructions(selectedExercise.id) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2">Form Analyzer</h1>
          <p className="text-gray-400">Analiza formy w czasie rzeczywistym</p>
        </div>

        {!showInstructions ? (
          <>
            {/* Difficulty filter */}
            <div className="flex gap-2 justify-center flex-wrap">
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
                  onClick={() => handleExerciseClick(exercise)}
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

            {/* Setup instructions */}
            <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
              <h4 className="font-medium text-white mb-2">Przed treningiem:</h4>
              <ul className="space-y-1 list-disc list-inside mb-4">
                <li>Ustaw iPhone na statywie 2-3 metry od siebie</li>
                <li>Upewnij się, że jest dobre świetlenie</li>
                <li>Włącz dźwięk dla wskazówek głosowych</li>
                <li>Ubranie: dopasowane działa lepiej niż workowate</li>
              </ul>
              <button
                onClick={() => {
                  audioFeedback.test();
                  setAudioTested(true);
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  audioTested 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {audioTested ? '✓ Audio działa' : '🔊 Testuj audio'}
              </button>
            </div>
          </>
        ) : (
          /* Instructions View */
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 bg-green-900/30 border-b border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedExercise?.namePl}</h2>
                  <p className="text-sm text-gray-400">{selectedExercise?.name}</p>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
              {instructions && (
                <>
                  {/* Setup */}
                  <div>
                    <h3 className="font-semibold text-green-400 mb-2">🎯 Ustawienie</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {instructions.setup.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-500">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Execution */}
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">▶️ Wykonanie</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {instructions.execution.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-500">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Muscles */}
                  <div>
                    <h3 className="font-semibold text-purple-400 mb-2">💪 Mięśnie</h3>
                    <div className="flex flex-wrap gap-2">
                      {instructions.muscles.map((muscle, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
                    <h3 className="font-semibold text-green-400 mb-2">💡 Wskazówki</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {instructions.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Mistakes */}
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                    <h3 className="font-semibold text-red-400 mb-2">⚠️ Typowe błędy</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {instructions.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Target reps selector */}
              <div className="border-t border-gray-700 pt-4">
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

              {/* Start button */}
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all"
              >
                Rozpocznij trening
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
