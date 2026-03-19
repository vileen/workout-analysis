import React, { useState } from 'react';
import { useScheduleStore, DAYS_OF_WEEK, type DayOfWeek } from '../../stores/scheduleStore';
import { useTranslation } from '../../i18n';
import { DayView } from './DayView';

export const WeeklySchedule: React.FC = () => {
  const { t } = useTranslation();
  const { schedule, clearAll } = useScheduleStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const dayNames: Record<DayOfWeek, string> = {
    monday: t.monday || 'Poniedziałek',
    tuesday: t.tuesday || 'Wtorek',
    wednesday: t.wednesday || 'Środa',
    thursday: t.thursday || 'Czwartek',
    friday: t.friday || 'Piątek',
    saturday: t.saturday || 'Sobota',
    sunday: t.sunday || 'Niedziela',
  };

  const getToday = (): DayOfWeek => {
    const day = new Date().getDay();
    const map: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return map[day];
  };

  const today = getToday();
  const totalExercises = Object.values(schedule).reduce((sum, day) => sum + day.length, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.weeklySchedule || 'Plan tygodniowy'}</h1>
        {totalExercises > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-red-500 text-sm hover:underline"
          >
            {t.clearAll || 'Wyczyść wszystko'}
          </button>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === today;
          const exerciseCount = schedule[day]?.length || 0;
          const isSelected = day === selectedDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
              `}
            >
              <span>{dayNames[day]}</span>
              {exerciseCount > 0 && (
                <span className={`ml-2 text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  ({exerciseCount})
                </span>
              )}
              {isToday && (
                <span className={`ml-1 text-xs ${isSelected ? 'text-blue-100' : 'text-blue-500'}`}>
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day view */}
      <DayView day={selectedDay} dayName={dayNames[selectedDay]} isToday={selectedDay === today} />

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">
              {t.clearAllConfirm || 'Wyczyścić cały plan?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t.clearAllWarning || 'To usunie wszystkie zaplanowane ćwiczenia.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t.cancel || 'Anuluj'}
              </button>
              <button
                onClick={() => {
                  clearAll();
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
