import { useState, useCallback, useEffect } from 'react';
import { CameraFeed } from '../Camera/CameraFeed';
import type { Pose, Rep } from '../../types/pose';
import { useWorkoutStore } from '../../stores/workoutStore';
import { getExerciseById } from '../../data/exercises';
import { audioFeedback } from '../../utils/audioFeedback';

// Import all analyzers
import { analyzeSquat, detectSquatRep, getInitialSquatState } from '../../engines/squatAnalyzer';
import type { SquatState } from '../../engines/squatAnalyzer';
import { analyzeGobletSquat, detectGobletSquatRep, getInitialGobletSquatState } from '../../engines/gobletSquatAnalyzer';
import type { GobletSquatState } from '../../engines/gobletSquatAnalyzer';
import { analyzeKettleSwing, detectKettleSwingRep, getInitialKettleSwingState } from '../../engines/kettleSwingAnalyzer';
import type { KettleSwingState } from '../../engines/kettleSwingAnalyzer';
import { analyzeKettleRow, detectKettleRowRep, getInitialKettleRowState } from '../../engines/kettleRowAnalyzer';
import type { KettleRowState } from '../../engines/kettleRowAnalyzer';
import { analyzeKettlePress, detectKettlePressRep, getInitialKettlePressState } from '../../engines/kettlePressAnalyzer';
import type { KettlePressState } from '../../engines/kettlePressAnalyzer';
import { analyzeRussianTwist, detectRussianTwistRep, getInitialRussianTwistState } from '../../engines/russianTwistAnalyzer';
import type { RussianTwistState } from '../../engines/russianTwistAnalyzer';

interface ExerciseViewProps {
  exerciseId: string;
  targetReps: number;
  onFinish: () => void;
}

type ExerciseState = SquatState | GobletSquatState | KettleSwingState | KettleRowState | KettlePressState | RussianTwistState;

export function ExerciseView({ exerciseId, targetReps, onFinish }: ExerciseViewProps) {
  const exercise = getExerciseById(exerciseId as any);
  const [exerciseState, setExerciseState] = useState<ExerciseState | null>(null);
  const [lastRepTime, setLastRepTime] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
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

  // Initialize exercise state based on exercise type
  useEffect(() => {
    if (!exercise) return;
    
    switch (exercise.id) {
      case 'squat':
        setExerciseState(getInitialSquatState());
        break;
      case 'kettle-goblet-squat':
        setExerciseState(getInitialGobletSquatState());
        break;
      case 'kettle-swing':
        setExerciseState(getInitialKettleSwingState());
        break;
      case 'kettle-row':
        setExerciseState(getInitialKettleRowState());
        break;
      case 'kettle-press':
        setExerciseState(getInitialKettlePressState());
        break;
      case 'russian-twist':
        setExerciseState(getInitialRussianTwistState());
        break;
      default:
        setExerciseState(getInitialSquatState());
    }
    
    startExercise(exercise, targetReps);
    
    // Initialize audio
    if (audioEnabled) {
      audioFeedback.enable();
      setTimeout(() => audioFeedback.speak('Start!', 'high'), 500);
    }
    
    return () => {
      endExercise();
    };
  }, [exercise, targetReps, startExercise, endExercise, audioEnabled]);

  // Handle pose detection based on exercise type
  const handlePoseDetected = useCallback((pose: Pose) => {
    if (!isActive || !exercise || !exerciseState) return;

    let formAnalysis;
    let newState: ExerciseState;
    let repCompleted = false;

    switch (exercise.id) {
      case 'squat':
        formAnalysis = analyzeSquat(pose);
        ({ newState, repCompleted } = detectSquatRep(exerciseState as SquatState, pose));
        break;
      case 'kettle-goblet-squat':
        formAnalysis = analyzeGobletSquat(pose);
        ({ newState, repCompleted } = detectGobletSquatRep(exerciseState as GobletSquatState, pose));
        break;
      case 'kettle-swing':
        formAnalysis = analyzeKettleSwing(pose);
        ({ newState, repCompleted } = detectKettleSwingRep(exerciseState as KettleSwingState, pose));
        break;
      case 'kettle-row':
        formAnalysis = analyzeKettleRow(pose);
        ({ newState, repCompleted } = detectKettleRowRep(exerciseState as KettleRowState, pose));
        break;
      case 'kettle-press':
        formAnalysis = analyzeKettlePress(pose);
        ({ newState, repCompleted } = detectKettlePressRep(exerciseState as KettlePressState, pose));
        break;
      case 'russian-twist':
        formAnalysis = analyzeRussianTwist(pose);
        ({ newState, repCompleted } = detectRussianTwistRep(exerciseState as RussianTwistState, pose));
        break;
      default:
        formAnalysis = analyzeSquat(pose);
        ({ newState, repCompleted } = detectSquatRep(exerciseState as SquatState, pose));
    }

    setExerciseState(newState);
    updateFormFeedback(formAnalysis.feedback, formAnalysis.score);

    if (repCompleted) {
      const newRepCount = repCount + 1;
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
      
      // Audio feedback
      if (audioEnabled) {
        audioFeedback.repCompleted(newRepCount);
        
        // Milestone announcements
        if (newRepCount === Math.floor(targetReps / 2)) {
          audioFeedback.halfWay(targetReps);
        } else if (newRepCount === targetReps - 1) {
          audioFeedback.lastRep();
        } else if (newRepCount === targetReps) {
          audioFeedback.workoutComplete();
        }
        
        // Form feedback after rep
        if (formAnalysis.score >= 80) {
          playGoodRepAudio(exercise.id);
        } else {
          playFormCorrectionAudio(exercise.id, formAnalysis);
        }
      }
    }
  }, [isActive, exercise, exerciseState, lastRepTime, addRep, updateFormFeedback]);

  // Auto-finish when target reached
  useEffect(() => {
    if (repCount >= targetReps && isActive) {
      setTimeout(() => {
        endExercise();
        onFinish();
      }, 1000);
    }
  }, [repCount, targetReps, isActive, endExercise, onFinish]);

  // Audio helper functions
  const playGoodRepAudio = (exerciseId: string) => {
    switch (exerciseId) {
      case 'squat':
      case 'kettle-goblet-squat':
        audioFeedback.squat.goodRep();
        break;
      case 'kettle-swing':
        audioFeedback.swing.goodRep();
        break;
      case 'kettle-row':
        audioFeedback.row.goodRep();
        break;
      case 'kettle-press':
        audioFeedback.press.goodRep();
        break;
      case 'russian-twist':
        audioFeedback.twist.goodRep();
        break;
    }
  };

  const playFormCorrectionAudio = (exerciseId: string, formAnalysis: { details: Record<string, number | boolean> }) => {
    const details = formAnalysis.details;
    
    switch (exerciseId) {
      case 'squat':
      case 'kettle-goblet-squat':
        if (!details.depthOk) audioFeedback.squat.depth();
        else if (!details.symmetryOk) audioFeedback.squat.kneesOut();
        else if (!details.torsoOk) audioFeedback.squat.torsoUpright();
        break;
      case 'kettle-swing':
        if (!details.hingeOk) audioFeedback.swing.hingeMore();
        else if (!details.armsOk) audioFeedback.swing.straightArms();
        else if (!details.kneesOk) audioFeedback.swing.hipsForward();
        break;
      case 'kettle-row':
        if (!details.backOk) audioFeedback.row.straightBack();
        else if (!details.torsoOk) audioFeedback.row.elbowClose();
        break;
      case 'kettle-press':
        if (!details.lockoutOk) audioFeedback.press.lockout();
        else if (!details.torsoOk) audioFeedback.press.straightTorso();
        else if (!details.coreOk) audioFeedback.press.tightCore();
        break;
      case 'russian-twist':
        if (!details.rotationOk) audioFeedback.twist.rotateMore();
        else if (!details.leanOk) audioFeedback.twist.leanBack();
        break;
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      audioFeedback.enable();
      audioFeedback.test();
    } else {
      audioFeedback.disable();
    }
  };

  if (!exercise) {
    return <div>Nie znaleziono ćwiczenia</div>;
  }

  // Get display values based on exercise type
  const getDisplayValue = () => {
    if (!exerciseState) return { primary: 0, secondary: 0, label: '' };
    
    switch (exercise.id) {
      case 'squat':
      case 'kettle-goblet-squat':
        return {
          primary: Math.round((exerciseState as SquatState).kneeAngle),
          secondary: Math.round((exerciseState as SquatState).torsoAngle),
          label: 'kąt kolana',
          secondaryLabel: 'tułów',
        };
      case 'kettle-swing':
        return {
          primary: Math.round((exerciseState as KettleSwingState).hipAngle),
          secondary: Math.round((exerciseState as KettleSwingState).armAngle),
          label: 'hip hinge',
          secondaryLabel: 'ramiona',
        };
      case 'kettle-row':
        return {
          primary: Math.round((exerciseState as KettleRowState).elbowAngle),
          secondary: Math.round((exerciseState as KettleRowState).torsoAngle),
          label: 'łokieć',
          secondaryLabel: 'tułów',
        };
      case 'kettle-press':
        return {
          primary: Math.round((exerciseState as KettlePressState).elbowAngle),
          secondary: Math.round((exerciseState as KettlePressState).torsoAngle),
          label: 'łokieć',
          secondaryLabel: 'tułów',
        };
      case 'russian-twist':
        return {
          primary: Math.round((exerciseState as RussianTwistState).torsoLean),
          secondary: Math.round((exerciseState as RussianTwistState).rotationAngle),
          label: 'odchylenie',
          secondaryLabel: 'rotacja',
        };
      default:
        return { primary: 0, secondary: 0, label: '', secondaryLabel: '' };
    }
  };

  const display = getDisplayValue();

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 safe-top">
        <div>
          <h1 className="text-xl font-bold">{exercise.namePl}</h1>
          <p className="text-sm text-gray-400">{exercise.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg text-lg transition-colors ${
              audioEnabled 
                ? 'bg-green-600 hover:bg-green-500' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={audioEnabled ? 'Audio włączone' : 'Audio wyłączone'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={onFinish}
            className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium"
          >
            Zakończ
          </button>
        </div>
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
      <div className="p-4 bg-gray-800 space-y-4 safe-bottom">
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
          
          {/* Primary metric */}
          <div className="text-center">
            <p className="text-3xl font-bold">{display.primary}°</p>
            <p className="text-sm text-gray-400">{display.label}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((repCount / targetReps) * 100, 100)}%` }}
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
