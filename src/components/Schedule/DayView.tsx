import React, { useState } from 'react';
import { useScheduleStore, type DayOfWeek, type ScheduledExercise } from '../../stores/scheduleStore';
import { EXERCISES } from '../../data/exercises';
import { useTranslation } from '../../i18n';
import { AddToScheduleModal } from './AddToScheduleModal';

interface DayViewProps {
  day: DayOfWeek;
  dayName: string;
  isToday: boolean;
}

export const DayView: React.FC<DayViewProps> = ({ day, dayName, isToday }) => {
  const { t } = useTranslation();
  const { schedule, removeExerciseFromDay, clearDay } = useScheduleStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ScheduledExercise | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const exercises = schedule[day] || [];

  const getExerciseName = (exerciseId: string): string => {
    const exercise = EXERCISES.find((e) => e.id === exerciseId);
    return exercise?.namePl || exercise?.name || exerciseId;
  };

  const formatRest = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}min`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {dayName}
            {isToday && (
              <span className="ml-2 text-sm font-normal text-blue-500">
                {t.today || '(dziś)'}
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-sm">
            {exercises.length === 0
              ? t.noExercises || 'Brak ćwiczeń'
              : `${exercises.length} ${exercises.length === 1 ? t.exercise : t.exercises}`}
          </p>
        </div>
        <div className="flex gap-2">
          {exercises.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 text-red-500 hover:bg-red-900/30 rounded-lg text-sm"
            >
              {t.clearDay || 'Wyczyść dzień'}
            </button>
          )}
          <button
            onClick={() => {
              setEditingExercise(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
          >
            {t.addExercise || 'Dodaj ćwiczenie'}
          </button>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">{t.emptyDay || 'Dzień wolny'}</p>
          <p className="text-sm">{t.addExerciseHint || 'Kliknij "Dodaj ćwiczenie" aby zaplanować trening'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{getExerciseName(exercise.exerciseId)}</p>
                  <p className="text-sm text-gray-500">
                    {exercise.sets} {t.sets || 'serii'} × {exercise.reps} {t.reps || 'powt.'}
                    {exercise.restSeconds > 0 && ` • ${t.rest || 'przerwa'} ${formatRest(exercise.restSeconds)}`}
                  </p>
                  {exercise.notes && (
                    <p className="text-xs text-gray-400 mt-1">{exercise.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingExercise(exercise);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                  title={t.edit || 'Edytuj'}
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeExerciseFromDay(day, exercise.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg"
                  title={t.remove || 'Usuń'}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showAddModal && (
        <AddToScheduleModal
          day={day}
          exercise={editingExercise}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {t.clearDayConfirm || 'Wyczyścić dzień?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t.clearDayWarning?.replace('{day}', dayName) || `To usunie wszystkie ćwiczenia z ${dayName}.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-200"
              >
                {t.cancel || 'Anuluj'}
              </button>
              <button
                onClick={() => {
                  clearDay(day);
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {t.clear || 'Wyczyść'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
};
