import { useState } from 'react';
import { ExerciseSelector } from './components/Exercise/ExerciseSelector';
import { ExerciseView } from './components/Exercise/ExerciseView';
import type { Exercise } from './types/pose';
import './App.css';

type AppView = 'selector' | 'exercise' | 'summary';

function App() {
  const [view, setView] = useState<AppView>('selector');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [targetReps, setTargetReps] = useState(10);

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
