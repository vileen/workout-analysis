import React, { useState, useCallback } from 'react';
import { useScheduleStore, type DayOfWeek } from '../../stores/scheduleStore';
import { EXERCISES } from '../../data/exercises';
import { ExerciseView } from '../Exercise/ExerciseView';
import { useTranslation } from '../../i18n';

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

  const currentScheduledExercise = exercises[currentIndex];
  const currentExercise = currentScheduledExercise
    ? EXERCISES.find((e) => e.id === currentScheduledExercise.exerciseId)
    : null;

  const totalExercises = exercises.length;
  const isComplete = currentIndex >= totalExercises;

  const handleExerciseComplete = useCallback(() => {
    if (currentScheduledExercise) {
      setCompletedExercises((prev) => [...prev, currentScheduledExercise.id]);
    }
    setCurrentIndex((prev) => prev + 1);
  }, [currentScheduledExercise]);

  const handleSkipExercise = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
      <div className="bg-gray-800 pt-[env(safe-area-inset-top)] p-4">
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

      {/* Exercise view */}
      <div className="flex-1 relative">
        <ExerciseView
          exerciseId={currentExercise.id}
          targetReps={parseInt(String(currentScheduledExercise.reps)) || 10}
          onFinish={handleExerciseComplete}
        />
      </div>

      {/* Navigation buttons overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2 safe-bottom">
        {currentIndex > 0 && (
          <button
            onClick={handlePreviousExercise}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg font-medium"
          >
            ← {t.previous || 'Poprzednie'}
          </button>
        )}
        <button
          onClick={handleSkipExercise}
          className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium"
        >
          {t.skip || 'Pomiń'} →
        </button>
      </div>
    </div>
  );
};
