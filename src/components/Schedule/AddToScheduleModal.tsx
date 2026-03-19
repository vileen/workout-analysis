import React, { useState, useEffect } from 'react';
import { useScheduleStore, type DayOfWeek, type ScheduledExercise } from '../../stores/scheduleStore';
import { EXERCISES } from '../../data/exercises';
import { useTranslation } from '../../i18n';

interface AddToScheduleModalProps {
  day: DayOfWeek;
  exercise?: ScheduledExercise | null;
  onClose: () => void;
}

export const AddToScheduleModal: React.FC<AddToScheduleModalProps> = ({
  day,
  exercise,
  onClose,
}) => {
  const { t } = useTranslation();
  const { addExerciseToDay, updateExercise } = useScheduleStore();
  const isEditing = !!exercise;

  const [selectedExercise, setSelectedExercise] = useState<string>(exercise?.exerciseId || '');
  const [sets, setSets] = useState<number>(exercise?.sets || 3);
  const [reps, setReps] = useState<string>(exercise?.reps || '8-12');
  const [restSeconds, setRestSeconds] = useState<number>(exercise?.restSeconds || 90);
  const [notes, setNotes] = useState<string>(exercise?.notes || '');
  const [errors, setErrors] = useState<string[]>([]);

  const availableExercises = EXERCISES.filter((e) => 
    ['beginner', 'intermediate'].includes(e.difficulty)
  );

  useEffect(() => {
    if (!selectedExercise && availableExercises.length > 0) {
      setSelectedExercise(availableExercises[0].id);
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!selectedExercise) errs.push(t.selectExercise || 'Wybierz ćwiczenie');
    if (sets < 1) errs.push(t.minSets || 'Minimum 1 seria');
    if (sets > 10) errs.push(t.maxSets || 'Maksimum 10 serii');
    if (!reps.trim()) errs.push(t.enterReps || 'Podaj liczbę powtórzeń');
    if (restSeconds < 0) errs.push(t.positiveRest || 'Przerwa nie może być ujemna');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing && exercise) {
      updateExercise(day, exercise.id, {
        exerciseId: selectedExercise as any,
        sets,
        reps,
        restSeconds,
        notes: notes || undefined,
      });
    } else {
      addExerciseToDay(day, {
        exerciseId: selectedExercise as any,
        sets,
        reps,
        restSeconds,
        notes: notes || undefined,
      });
    }
    onClose();
  };

  const restPresets = [30, 60, 90, 120, 180];
  const repsPresets = ['5', '6-8', '8-10', '8-12', '10-15', '12-15', '15-20', 'max'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">
            {isEditing ? t.editExercise || 'Edytuj ćwiczenie' : t.addToSchedule || 'Dodaj do planu'}
          </h2>

          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3 mb-4">
              {errors.map((err, i) => (
                <p key={i} className="text-red-400 text-sm">{err}</p>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {/* Exercise selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.exercise || 'Ćwiczenie'}
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                disabled={isEditing}
              >
                <option value="" className="bg-gray-700">{t.selectExercise || 'Wybierz ćwiczenie...'}</option>
                {availableExercises.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-gray-700">
                    {ex.namePl || ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sets */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.sets || 'Serie'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSets(Math.max(1, sets - 1))}
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 font-medium text-gray-200"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-gray-200">{sets}</span>
                <button
                  onClick={() => setSets(Math.min(10, sets + 1))}
                  className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 font-medium text-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.reps || 'Powtórzenia'}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {repsPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setReps(preset)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      reps === preset
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder={t.repsPlaceholder || 'Np. 8-12 lub max'}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              />
            </div>

            {/* Rest */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.rest || 'Przerwa między seriami'}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {restPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setRestSeconds(preset)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      restSeconds === preset
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    {preset < 60 ? `${preset}s` : `${preset / 60}min`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={restSeconds}
                onChange={(e) => setRestSeconds(parseInt(e.target.value) || 0)}
                min={0}
                max={600}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t.notes || 'Notatki'} ({t.optional || 'opcjonalne'})
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder || 'Np. skup się na technice...'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-200"
            >
              {t.cancel || 'Anuluj'}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              {isEditing ? t.save || 'Zapisz' : t.add || 'Dodaj'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
