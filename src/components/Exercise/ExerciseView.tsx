import { useState, useCallback, useEffect } from 'react';
import { CameraFeed } from '../Camera/CameraFeed';
import { Pose, Rep } from '../../types/pose';
import { useWorkoutStore } from '../../stores/workoutStore';
import { analyzeSquat, detectSquatRep, getInitialSquatState, SquatState } from '../../engines/squatAnalyzer';
import { getExerciseById } from '../../data/exercises';

interface ExerciseViewProps {
  exerciseId: string;
  targetReps: number;
  onFinish: () => void;
}

export function ExerciseView({ exerciseId, targetReps, onFinish }: ExerciseViewProps) {
  const exercise = getExerciseById(exerciseId as any);
  const [squatState, setSquatState] = useState<SquatState>(getInitialSquatState());
  const [lastRepTime, setLastRepTime] = useState<number>(0);
  
  const { 
    isActive, 
    repCount, 
    formFeedback, 
    currentFormScore,
    startExercise, 
    endExercise, 
    addRep,
    updateFormFeedback,
  } = useWorkoutStore();

  // Start exercise on mount
  useEffect(() => {
    if (exercise) {
      startExercise(exercise, targetReps);
    }
    
    return () => {
      endExercise();
    };
  }, [exercise, targetReps, startExercise, endExercise]);

  // Handle pose detection
  const handlePoseDetected = useCallback((pose: Pose) => {
    if (!isActive) return;

    // Analyze form
    const formAnalysis = analyzeSquat(pose);
    updateFormFeedback(formAnalysis.feedback, formAnalysis.score);

    // Detect reps
    const { newState, repCompleted } = detectSquatRep(squatState, pose);
    setSquatState(newState);

    if (repCompleted) {
      const rep: Rep = {
        id: Date.now(),
        timestamp: Date.now(),
        duration: Date.now() - lastRepTime,
        formScore: formAnalysis.score,
        feedback: formAnalysis.feedback,
      };
      addRep(rep);
      setLastRepTime(Date.now());
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }
  }, [isActive, squatState, lastRepTime, addRep, updateFormFeedback]);

  // Auto-finish when target reached
  useEffect(() => {
    if (repCount >= targetReps && isActive) {
      setTimeout(() => {
        endExercise();
        onFinish();
      }, 1000);
    }
  }, [repCount, targetReps, isActive, endExercise, onFinish]);

  if (!exercise) {
    return <div>Nie znaleziono ćwiczenia</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <div>
          <h1 className="text-xl font-bold">{exercise.namePl}</h1>
          <p className="text-sm text-gray-400">{exercise.name}</p>
        </div>
        <button
          onClick={onFinish}
          className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium"
        >
          Zakończ
        </button>
      </div>

      {/* Camera */}
      <div className="flex-1 relative">
        <CameraFeed
          onPoseDetected={handlePoseDetected}
          isActive={isActive}
          showSkeleton={true}
        />
      </div>

      {/* Stats Panel */}
      <div className="p-4 bg-gray-800 space-y-4">
        {/* Rep counter */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-4xl font-bold">{repCount}</p>
            <p className="text-sm text-gray-400">/ {targetReps} powtórzeń</p>
          </div>
          
          {/* Form score */}
          <div className="text-center">
            <p className={`text-3xl font-bold ${
              currentFormScore >= 80 ? 'text-green-400' : 
              currentFormScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {currentFormScore}
            </p>
            <p className="text-sm text-gray-400">forma</p>
          </div>
          
          {/* Knee angle */}
          <div className="text-center">
            <p className="text-3xl font-bold">{Math.round(squatState.kneeAngle)}°</p>
            <p className="text-sm text-gray-400">kąt kolana</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(repCount / targetReps) * 100}%` }}
          />
        </div>

        {/* Feedback */}
        <div className="min-h-[3rem]">
          {formFeedback.length > 0 && (
            <p className={`text-center font-medium ${
              currentFormScore >= 80 ? 'text-green-400' : 
              currentFormScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formFeedback[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
