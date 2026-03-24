import React, { useState, useCallback } from 'react';
import { useScheduleStore, type DayOfWeek } from '../../stores/scheduleStore';
import { EXERCISES } from '../../data/exercises';
import { EXERCISE_INSTRUCTIONS } from '../../data/instructions';
import { ExerciseView } from '../Exercise/ExerciseView';
import { useTranslation } from '../../i18n';
import type { ExerciseInstructions } from '../../types/pose';

interface ScheduledWorkoutProps {
  day: DayOfWeek;
  onFinish: () => void;
  onCancel: () => void;
}

export const ScheduledWorkout: React.FC<ScheduledWorkoutProps> = ({
  day,
  onFinish,
  onCancel,
}) => {
  const { t, language } = useTranslation();
  const { schedule } = useScheduleStore();
  const exercises = schedule[day] || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const currentScheduledExercise = exercises[currentIndex];
  const currentExercise = currentScheduledExercise
    ? EXERCISES.find((e) => e.id === currentScheduledExercise.exerciseId)
    : null;

  const instructions: ExerciseInstructions | null = currentExercise 
    ? (EXERCISE_INSTRUCTIONS[currentExercise.id] || null) 
    : null;

  const totalExercises = exercises.length;
  const isComplete = currentIndex >= totalExercises;

  const handleExerciseComplete = useCallback(() => {
    if (currentScheduledExercise) {
      setCompletedExercises((prev) => [...prev, currentScheduledExercise.id]);
    }
    setCurrentIndex((prev) => prev + 1);
    setShowInstructions(true); // Show instructions for next exercise
  }, [currentScheduledExercise]);

  const handleSkipExercise = () => {
    setCurrentIndex((prev) => prev + 1);
    setShowInstructions(true); // Show instructions for next exercise
  };

  const handleStartExercise = () => {
    setShowInstructions(false);
  };

  const handleSkipInstructions = () => {
    setShowInstructions(false);
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowInstructions(true); // Show instructions for previous exercise
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-4">
            {t.workoutComplete || 'Trening ukończony!'}
          </h1>
          <p className="text-gray-400 mb-2">
            {t.completedExercises?.replace('{count}', String(completedExercises.length)) ||
              `Ukończono ${completedExercises.length} ćwiczeń`}
          </p>
          <p className="text-gray-500 mb-8">
            {t.greatJob || 'Świetna robota!'}
          </p>
          <button
            onClick={onFinish}
            className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-colors"
          >
            {t.finish || 'Zakończ'}
          </button>
        </div>
      </div>
    );
  }

  if (!currentExercise || !currentScheduledExercise) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p className="text-gray-400">{t.noExercisesFound || 'Nie znaleziono ćwiczeń'}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg"
        >
          {t.back || 'Wróć'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Progress header */}
      <div className="bg-gray-800 pt-[env(safe-area-inset-top)] pb-2 px-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            ✕ {t.cancelWorkout || 'Anuluj'}
          </button>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {totalExercises}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / totalExercises) * 100}%` }}
          />
        </div>

        {/* Exercise info */}
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">
            {language === 'pl' 
              ? (currentExercise.namePl || currentExercise.name)
              : (currentExercise.name || currentExercise.namePl)}
          </h2>
          <p className="text-gray-400 text-sm">
            {currentScheduledExercise.sets} {t.sets || 'serii'} × {currentScheduledExercise.reps} {t.reps || 'powt.'}
          </p>
          {currentScheduledExercise.notes && (
            <p className="text-xs text-gray-500 mt-1">{currentScheduledExercise.notes}</p>
          )}
        </div>
      </div>

      {/* Content - Instructions or Exercise */}
      {showInstructions && instructions ? (
        /* Instructions View */
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

          {/* Spacer for bottom buttons */}
          <div className="h-20" />
        </div>
      ) : (
        /* Exercise View */
        <div className="flex-1 relative">
          <ExerciseView
            exerciseId={currentExercise.id}
            targetReps={parseInt(String(currentScheduledExercise.reps)) || 10}
            onFinish={handleExerciseComplete}
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2 safe-bottom">
        {currentIndex > 0 && (
          <button
            onClick={handlePreviousExercise}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg font-medium"
          >
            ← {t.previous || 'Poprzednie'}
          </button>
        )}
        {showInstructions && instructions ? (
          <>
            <button
              onClick={handleSkipInstructions}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium"
            >
              {t.skip || 'Pomiń'}
            </button>
            <button
              onClick={handleStartExercise}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold"
            >
              ▶ {t.startWorkout}
            </button>
          </>
        ) : (
          <button
            onClick={handleSkipExercise}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium"
          >
            {t.skip || 'Pomiń'} →
          </button>
        )}
      </div>
    </div>
  );
};
