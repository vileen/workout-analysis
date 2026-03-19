import { useState } from 'react';
import { EXERCISES } from '../../data/exercises';
import { EXERCISE_INSTRUCTIONS } from '../../data/instructions';
import type { Exercise, ExerciseInstructions } from '../../types/pose';
import { audioFeedback } from '../../utils/audioFeedback';
import { useTranslation } from '../../i18n';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise, targetReps: number) => void;
  onViewSchedule?: () => void;
}

export function ExerciseSelector({ onSelect, onViewSchedule }: ExerciseSelectorProps) {
  const { t, language, setLanguage } = useTranslation();
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

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return t.beginner;
      case 'intermediate': return t.intermediate;
      case 'advanced': return t.advanced;
      default: return t.allLevels;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {!showInstructions ? (
        <div className="h-full flex flex-col max-w-md mx-auto">
          {/* Header - fixed */}
          <div className="text-center pt-6 pb-2 px-4 flex-shrink-0">
            {/* Language selector and Schedule button */}
            <div className="flex justify-between items-center mb-2">
              {onViewSchedule && (
                <button
                  onClick={onViewSchedule}
                  className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  📅 {t.weeklySchedule || 'Plan tygodniowy'}
                </button>
              )}
              <div className="flex bg-gray-800 rounded-lg overflow-hidden ml-auto">
                <button
                  onClick={() => setLanguage('pl')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    language === 'pl' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  PL
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t.appName}</h1>
            <p className="text-gray-400">{t.appSubtitle}</p>
          </div>

          {/* Difficulty filter - fixed */}
          <div className="flex gap-2 justify-center flex-wrap px-4 pb-4 flex-shrink-0">
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
                {getDifficultyLabel(level)}
              </button>
            ))}
          </div>

          {/* Exercise list - scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
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
                    <h3 className="font-bold text-lg">{language === 'pl' ? exercise.namePl : exercise.name}</h3>
                    <p className="text-sm text-gray-400">{language === 'pl' ? exercise.name : exercise.namePl}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    exercise.difficulty === 'beginner' ? 'bg-green-900 text-green-400' :
                    exercise.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{language === 'pl' ? exercise.descriptionPl : exercise.description}</p>
              </button>
            ))}

            {/* Setup instructions */}
            <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400 mt-4">
              <h4 className="font-medium text-white mb-2">{t.beforeWorkout}</h4>
              <ul className="space-y-1 list-disc list-inside mb-4">
                <li>{t.setupPhone}</li>
                <li>{t.goodLighting}</li>
                <li>{t.enableSound}</li>
                <li>{t.tightClothing}</li>
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
                {audioTested ? t.audioWorks : t.testAudio}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Instructions View */
        <div className="h-full flex flex-col max-w-md mx-auto">
          <div className="bg-gray-800 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-green-900/30 border-b border-green-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{language === 'pl' ? selectedExercise?.namePl : selectedExercise?.name}</h2>
                  <p className="text-sm text-gray-400">{language === 'pl' ? selectedExercise?.name : selectedExercise?.namePl}</p>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {instructions && (
                <>
                  {/* Video Link */}
                  {instructions.videoUrl && (
                    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                      <a
                        href={instructions.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <span className="text-xl">🎬</span>
                        <span className="font-semibold">{t.watchVideo}</span>
                        <span className="ml-auto text-xs text-gray-500">↗</span>
                      </a>
                    </div>
                  )}

                  {/* Setup */}
                  <div>
                    <h3 className="font-semibold text-green-400 mb-2">{t.setup}</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {(language === 'pl' ? instructions.setup : instructions.setupEn || instructions.setup).map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-500">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Execution */}
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">{t.execution}</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {(language === 'pl' ? instructions.execution : instructions.executionEn || instructions.execution).map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-blue-500">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Muscles */}
                  <div>
                    <h3 className="font-semibold text-purple-400 mb-2">{t.muscles}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(language === 'pl' ? instructions.muscles : instructions.musclesEn || instructions.muscles).map((muscle, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
                    <h3 className="font-semibold text-green-400 mb-2">{t.tips}</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {(language === 'pl' ? instructions.tips : instructions.tipsEn || instructions.tips).map((tip, i) => (
                        <li key={i} className="flex gap-2">
                          <span>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Mistakes */}
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                    <h3 className="font-semibold text-red-400 mb-2">{t.commonMistakes}</h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {(language === 'pl' ? instructions.commonMistakes : instructions.commonMistakesEn || instructions.commonMistakes).map((mistake, i) => (
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
                  {t.targetReps}
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
                {t.startWorkout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
