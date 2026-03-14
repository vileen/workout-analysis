import { useState, useEffect } from 'react';
import { ExerciseSelector } from './components/Exercise/ExerciseSelector';
import { ExerciseView } from './components/Exercise/ExerciseView';
import { UpdateNotification } from './components/UpdateNotification/UpdateNotification';
import { useServiceWorker, isStandalone } from './hooks/useServiceWorker';
import type { Exercise } from './types/pose';
import './App.css';

type AppView = 'selector' | 'exercise' | 'summary';

function App() {
  const [view, setView] = useState<AppView>('selector');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [targetReps, setTargetReps] = useState(10);
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
        <ExerciseSelector onSelect={handleExerciseSelect} />
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
