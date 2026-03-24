import { useState, useEffect } from 'react';
import { ExerciseSelector } from './components/Exercise/ExerciseSelector';
import { ExerciseView } from './components/Exercise/ExerciseView';
import { WeeklySchedule } from './components/Schedule/WeeklySchedule';
import { ScheduledWorkout } from './components/Schedule/ScheduledWorkout';
import { UpdateNotification } from './components/UpdateNotification/UpdateNotification';
import { useServiceWorker, isStandalone } from './hooks/useServiceWorker';
import type { DayOfWeek } from './stores/scheduleStore';
import type { Exercise } from './types/pose';
import './App.css';

type AppView = 'selector' | 'exercise' | 'schedule' | 'scheduled-workout';

function App() {
  const [view, setView] = useState<AppView>('selector');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [targetReps, setTargetReps] = useState(10);
  const [scheduledWorkoutDay, setScheduledWorkoutDay] = useState<DayOfWeek | null>(null);
  const [isPwa, setIsPwa] = useState(false);
  
  useServiceWorker(); // Registers service worker and handles updates

  useEffect(() => {
    // Check if running as installed PWA
    setIsPwa(isStandalone());
    
    // Prevent double-tap zoom on iOS
    document.addEventListener('dblclick', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    // Prevent pull-to-refresh on iOS PWA
    if (isStandalone()) {
      document.body.style.overscrollBehavior = 'none';
    }
  }, []);

  const handleExerciseSelect = (exercise: Exercise, reps: number) => {
    setCurrentExercise(exercise);
    setTargetReps(reps);
    setView('exercise');
  };

  const handleExerciseFinish = () => {
    setView('selector');
  };

  const handleViewSchedule = () => {
    setView('schedule');
  };

  const handleBackToSelector = () => {
    setView('selector');
  };

  const handleStartScheduledWorkout = (day: DayOfWeek) => {
    setScheduledWorkoutDay(day);
    setView('scheduled-workout');
  };

  const handleScheduledWorkoutFinish = () => {
    setScheduledWorkoutDay(null);
    setView('schedule');
  };

  const handleScheduledWorkoutCancel = () => {
    setScheduledWorkoutDay(null);
    setView('schedule');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Update notification */}
      <UpdateNotification />
      
      {/* PWA indicator (for debugging) */}
      {isPwa && (
        <div className="fixed top-1 right-1 z-40">
          <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded">
            PWA
          </span>
        </div>
      )}
      
      {view === 'selector' && (
        <ExerciseSelector onSelect={handleExerciseSelect} onViewSchedule={handleViewSchedule} />
      )}

      {view === 'schedule' && (
        <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
          <div className="pt-[env(safe-area-inset-top)] p-4 bg-gray-800 flex justify-end flex-shrink-0">
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              ← Wróć do ćwiczeń
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WeeklySchedule onStartWorkout={handleStartScheduledWorkout} />
          </div>
        </div>
      )}

      {view === 'scheduled-workout' && scheduledWorkoutDay && (
        <ScheduledWorkout
          day={scheduledWorkoutDay}
          onFinish={handleScheduledWorkoutFinish}
          onCancel={handleScheduledWorkoutCancel}
        />
      )}
      
      {view === 'exercise' && currentExercise && (
        <ExerciseView
          exerciseId={currentExercise.id}
          targetReps={targetReps}
          onFinish={handleExerciseFinish}
        />
      )}
    </div>
  );
}

export default App;
