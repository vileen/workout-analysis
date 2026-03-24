import { useState, useCallback, useEffect, useRef } from 'react';
import { CameraFeed } from '../Camera/CameraFeed';
import type { Pose, Rep } from '../../types/pose';
import { useWorkoutStore } from '../../stores/workoutStore';
import { getExerciseById } from '../../data/exercises';
import { audioFeedback } from '../../utils/audioFeedback';
import { useTranslation } from '../../i18n';

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
import { analyzeKettleFloorPress, detectKettleFloorPressRep, getInitialKettleFloorPressState } from '../../engines/kettleFloorPressAnalyzer';
import type { KettleFloorPressState } from '../../engines/kettleFloorPressAnalyzer';
import { analyzeKettleOverheadPress, detectKettleOverheadPressRep, getInitialKettleOverheadPressState } from '../../engines/kettleOverheadPressAnalyzer';
import type { KettleOverheadPressState } from '../../engines/kettleOverheadPressAnalyzer';
import { analyzePushup, detectPushupRep, getInitialPushupState } from '../../engines/pushupAnalyzer';
import type { PushupState } from '../../engines/pushupAnalyzer';
import { analyzeKettleUprightRow, detectKettleUprightRowRep, getInitialKettleUprightRowState } from '../../engines/kettleUprightRowAnalyzer';
import type { KettleUprightRowState } from '../../engines/kettleUprightRowAnalyzer';
import { analyzeTricepsExtension, detectTricepsExtensionRep, getInitialTricepsExtensionState } from '../../engines/tricepsExtensionAnalyzer';
import type { TricepsExtensionState } from '../../engines/tricepsExtensionAnalyzer';

interface ExerciseViewProps {
  exerciseId: string;
  targetReps: number;
  onFinish: () => void;
}

type ExerciseState = SquatState | GobletSquatState | KettleSwingState | KettleRowState | KettlePressState | RussianTwistState | KettleFloorPressState | KettleOverheadPressState | PushupState | KettleUprightRowState | TricepsExtensionState;

export function ExerciseView({ exerciseId, targetReps, onFinish }: ExerciseViewProps) {
  const { t, language } = useTranslation();
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
      case 'kettle-floor-press':
        setExerciseState(getInitialKettleFloorPressState());
        break;
      case 'kettle-overhead-press':
        setExerciseState(getInitialKettleOverheadPressState());
        break;
      case 'pushup':
        setExerciseState(getInitialPushupState());
        break;
      case 'kettle-upright-row':
        setExerciseState(getInitialKettleUprightRowState());
        break;
      case 'triceps-extension':
        setExerciseState(getInitialTricepsExtensionState());
        break;
      default:
        setExerciseState(getInitialSquatState());
    }
    
    startExercise(exercise, targetReps);
    
    // Initialize audio
    if (audioEnabled) {
      audioFeedback.enable();
      setTimeout(() => audioFeedback.speak(t.start, 'high'), 500);
    }
    
    return () => {
      endExercise();
    };
  }, [exercise, targetReps, startExercise, endExercise, audioEnabled]);

  // Use ref to track isActive to avoid stale closure issues
  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Handle pose detection based on exercise type
  const handlePoseDetected = useCallback((pose: Pose) => {
    if (!isActiveRef.current || !exercise || !exerciseState) return;

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
      case 'kettle-floor-press':
        formAnalysis = analyzeKettleFloorPress(pose);
        ({ newState, repCompleted } = detectKettleFloorPressRep(exerciseState as KettleFloorPressState, pose));
        break;
      case 'kettle-overhead-press':
        formAnalysis = analyzeKettleOverheadPress(pose);
        ({ newState, repCompleted } = detectKettleOverheadPressRep(exerciseState as KettleOverheadPressState, pose));
        break;
      case 'pushup':
        formAnalysis = analyzePushup(pose);
        ({ newState, repCompleted } = detectPushupRep(exerciseState as PushupState, pose));
        break;
      case 'kettle-upright-row':
        formAnalysis = analyzeKettleUprightRow(pose);
        ({ newState, repCompleted } = detectKettleUprightRowRep(exerciseState as KettleUprightRowState, pose));
        break;
      case 'triceps-extension':
        formAnalysis = analyzeTricepsExtension(pose);
        ({ newState, repCompleted } = detectTricepsExtensionRep(exerciseState as TricepsExtensionState, pose));
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
        // Rep count in selected language
        if (language === 'pl') {
          if (newRepCount === 1) audioFeedback.speak(t.first, 'high');
          else if (newRepCount === 2) audioFeedback.speak(t.second, 'high');
          else if (newRepCount === 3) audioFeedback.speak(t.third, 'high');
          else audioFeedback.speak(`${newRepCount}!`, 'high');
        } else {
          audioFeedback.speak(`${newRepCount}!`, 'high');
        }
        
        // Milestone announcements
        if (newRepCount === Math.floor(targetReps / 2)) {
          audioFeedback.speak(`${t.halfWay} ${targetReps / 2} ${t.reps}`, 'medium');
        } else if (newRepCount === targetReps - 1) {
          audioFeedback.speak(t.lastRep, 'high');
        } else if (newRepCount === targetReps) {
          audioFeedback.speak(t.workoutComplete, 'high');
        }
        
        // Form feedback after rep
        if (formAnalysis.score >= 80) {
          playGoodRepAudio(exercise.id);
        } else {
          playFormCorrectionAudio(exercise.id, formAnalysis);
        }
      }
    }
  }, [exercise, exerciseState, lastRepTime, addRep, updateFormFeedback]);

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
        audioFeedback.speak(t.squat.goodRep, 'low');
        break;
      case 'kettle-swing':
        audioFeedback.speak(t.swing.goodRep, 'low');
        break;
      case 'kettle-row':
        audioFeedback.speak(t.row.goodRep, 'low');
        break;
      case 'kettle-press':
      case 'kettle-floor-press':
      case 'kettle-overhead-press':
        audioFeedback.speak(t.press.goodRep, 'low');
        break;
      case 'russian-twist':
        audioFeedback.speak(t.twist.goodRep, 'low');
        break;
      case 'pushup':
        audioFeedback.speak(t.pushup?.goodRep || 'Dobra pompa!', 'low');
        break;
      case 'kettle-upright-row':
        audioFeedback.speak(t.row.goodRep, 'low');
        break;
      case 'triceps-extension':
        audioFeedback.speak(t.triceps?.goodRep || 'Mocne tricepsy!', 'low');
        break;
    }
  };

  const playFormCorrectionAudio = (exerciseId: string, formAnalysis: { details: Record<string, number | boolean> }) => {
    const details = formAnalysis.details;

    switch (exerciseId) {
      case 'squat':
      case 'kettle-goblet-squat':
        if (!details.depthOk) audioFeedback.speak(t.squat.depth, 'medium');
        else if (!details.symmetryOk) audioFeedback.speak(t.squat.kneesOut, 'medium');
        else if (!details.torsoOk) audioFeedback.speak(t.squat.torsoUpright, 'medium');
        break;
      case 'kettle-swing':
        if (!details.hingeOk) audioFeedback.speak(t.swing.hingeMore, 'medium');
        else if (!details.armsOk) audioFeedback.speak(t.swing.straightArms, 'medium');
        else if (!details.kneesOk) audioFeedback.speak(t.swing.hipsForward, 'medium');
        break;
      case 'kettle-row':
        if (!details.backOk) audioFeedback.speak(t.row.straightBack, 'medium');
        else if (!details.torsoOk) audioFeedback.speak(t.row.elbowClose, 'medium');
        break;
      case 'kettle-press':
      case 'kettle-floor-press':
      case 'kettle-overhead-press':
        if (!details.lockoutOk) audioFeedback.speak(t.press.lockout, 'medium');
        else if (!details.torsoOk) audioFeedback.speak(t.press.straightTorso, 'medium');
        else if (!details.coreOk) audioFeedback.speak(t.press.tightCore, 'medium');
        break;
      case 'russian-twist':
        if (!details.rotationOk) audioFeedback.speak(t.twist.rotateMore, 'medium');
        else if (!details.leanOk) audioFeedback.speak(t.twist.leanBack, 'medium');
        break;
      case 'pushup':
        if (!details.bodyLineOk) audioFeedback.speak('Ciało w linii!', 'medium');
        else if (!details.elbowTuckOk) audioFeedback.speak('Łokcie przy tułowiu!', 'medium');
        else if (!details.symmetryOk) audioFeedback.speak('Równie obiema stronami!', 'medium');
        break;
      case 'kettle-upright-row':
        if (!details.elbowHeightOk) audioFeedback.speak('Łokcie wyżej!', 'medium');
        else if (!details.shouldersOk) audioFeedback.speak('Opuszczaj barki!', 'medium');
        break;
      case 'triceps-extension':
        if (!details.elbowDriftOk) audioFeedback.speak('Łokcie w miejscu!', 'medium');
        else if (!details.torsoOk) audioFeedback.speak('Stabilny tułów!', 'medium');
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
    if (!exerciseState) return { primary: 0, secondary: 0, label: '', secondaryLabel: '' };

    switch (exercise.id) {
      case 'squat':
      case 'kettle-goblet-squat':
        return {
          primary: Math.round((exerciseState as SquatState).kneeAngle),
          secondary: Math.round((exerciseState as SquatState).torsoAngle),
          label: t.kneeAngle,
          secondaryLabel: t.torso,
        };
      case 'kettle-swing':
        return {
          primary: Math.round((exerciseState as KettleSwingState).hipAngle),
          secondary: Math.round((exerciseState as KettleSwingState).armAngle),
          label: t.hipHinge,
          secondaryLabel: t.arms,
        };
      case 'kettle-row':
        return {
          primary: Math.round((exerciseState as KettleRowState).elbowAngle),
          secondary: Math.round((exerciseState as KettleRowState).torsoAngle),
          label: t.elbow,
          secondaryLabel: t.torso,
        };
      case 'kettle-press':
      case 'kettle-floor-press':
      case 'kettle-overhead-press':
        return {
          primary: Math.round((exerciseState as KettlePressState).elbowAngle),
          secondary: Math.round((exerciseState as KettlePressState).torsoAngle),
          label: t.elbow,
          secondaryLabel: t.torso,
        };
      case 'russian-twist':
        return {
          primary: Math.round((exerciseState as RussianTwistState).torsoLean),
          secondary: Math.round((exerciseState as RussianTwistState).rotationAngle),
          label: t.lean,
          secondaryLabel: t.rotation,
        };
      case 'pushup':
        return {
          primary: Math.round((exerciseState as PushupState).elbowAngle),
          secondary: Math.round((exerciseState as PushupState).symmetryScore),
          label: t.elbow,
          secondaryLabel: t.symmetry,
        };
      case 'kettle-upright-row':
        return {
          primary: Math.round((exerciseState as KettleUprightRowState).elbowAngle),
          secondary: Math.round((exerciseState as KettleUprightRowState).elbowHeight * 100),
          label: t.elbow,
          secondaryLabel: 'Wysokość łokci',
        };
      case 'triceps-extension':
        return {
          primary: Math.round((exerciseState as TricepsExtensionState).elbowAngle),
          secondary: Math.round((exerciseState as TricepsExtensionState).torsoAngle),
          label: t.elbow,
          secondaryLabel: t.torso,
        };
      default:
        return { primary: 0, secondary: 0, label: '', secondaryLabel: '' };
    }
  };

  const display = getDisplayValue();

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pt-[env(safe-area-inset-top)] pb-2 px-4 bg-gray-800 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">{language === 'pl' ? exercise.namePl : exercise.name}</h1>
          <p className="text-sm text-gray-400">{language === 'pl' ? exercise.name : exercise.namePl}</p>
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
            {t.endWorkout}
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
            <p className="text-sm text-gray-400">{t.ofReps} {targetReps} {t.reps}</p>
          </div>
          
          {/* Form score */}
          <div className="text-center">
            <p className={`text-3xl font-bold ${
              currentFormScore >= 80 ? 'text-green-400' : 
              currentFormScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {currentFormScore}
            </p>
            <p className="text-sm text-gray-400">{t.form}</p>
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
