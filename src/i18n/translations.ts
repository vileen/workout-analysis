export type Language = 'pl' | 'en';

export interface Translations {
  // Common
  appName: string;
  appSubtitle: string;
  
  // Exercise selector
  allLevels: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  beforeWorkout: string;
  setupPhone: string;
  goodLighting: string;
  enableSound: string;
  tightClothing: string;
  testAudio: string;
  audioWorks: string;
  
  // Exercise view
  endWorkout: string;
  reps: string;
  ofReps: string;
  form: string;
  kneeAngle: string;
  hipHinge: string;
  elbow: string;
  torso: string;
  lean: string;
  rotation: string;
  arms: string;
  
  // Instructions
  setup: string;
  execution: string;
  muscles: string;
  tips: string;
  commonMistakes: string;
  targetReps: string;
  startWorkout: string;
  watchVideo: string;
  videoTutorial: string;
  
  // Audio feedback
  start: string;
  first: string;
  second: string;
  third: string;
  halfWay: string;
  lastRep: string;
  workoutComplete: string;
  
  // Form cues - Squat
  squat: {
    depth: string;
    kneesOut: string;
    torsoUpright: string;
    goodRep: string;
  };
  
  // Form cues - Swing
  swing: {
    hingeMore: string;
    straightArms: string;
    hipsForward: string;
    goodRep: string;
  };
  
  // Form cues - Row
  row: {
    pullToHip: string;
    straightBack: string;
    elbowClose: string;
    goodRep: string;
  };
  
  // Form cues - Press
  press: {
    lockout: string;
    straightTorso: string;
    tightCore: string;
    goodRep: string;
  };
  
  // Form cues - Twist
  twist: {
    rotateMore: string;
    leanBack: string;
    shouldersLevel: string;
    goodRep: string;
  };

  // Form cues - Pushup
  pushup: {
    bodyLine: string;
    elbowTuck: string;
    symmetry: string;
    goodRep: string;
  };

  // Muscle groups
  triceps: string;

  // Form metrics
  symmetry: string;

  // Update notification
  newVersion: string;
  updateToSeeNew: string;
  update: string;
  iosTip: string;
  
  // Errors
  exerciseNotFound: string;
  cameraAccessError: string;
  skeletonNotVisible: string;
}

const translations: Record<Language, Translations> = {
  pl: {
    appName: 'Form Analyzer',
    appSubtitle: 'Analiza formy w czasie rzeczywistym',
    
    allLevels: 'Wszystkie',
    beginner: 'Początkujący',
    intermediate: 'Średni',
    advanced: 'Zaawansowany',
    beforeWorkout: 'Przed treningiem:',
    setupPhone: 'Ustaw telefon na statywie 2-3 metry od siebie',
    goodLighting: 'Upewnij się, że jest dobre świetlenie',
    enableSound: 'Włącz dźwięk dla wskazówek głosowych',
    tightClothing: 'Ubranie: dopasowane działa lepiej niż workowate',
    testAudio: '🔊 Testuj audio',
    audioWorks: '✓ Audio działa',
    
    endWorkout: 'Zakończ',
    reps: 'powtórzeń',
    ofReps: '/',
    form: 'forma',
    kneeAngle: 'kąt kolana',
    hipHinge: 'hip hinge',
    elbow: 'łokieć',
    torso: 'tułów',
    lean: 'odchylenie',
    rotation: 'rotacja',
    arms: 'ramiona',
    
    setup: '🎯 Ustawienie',
    execution: '▶️ Wykonanie',
    muscles: '💪 Mięśnie',
    tips: '💡 Wskazówki',
    commonMistakes: '⚠️ Typowe błędy',
    targetReps: 'Liczba powtórzeń',
    startWorkout: 'Rozpocznij trening',
    watchVideo: '🎬 Zobacz film instruktażowy',
    videoTutorial: 'Film instruktażowy',
    
    start: 'Start!',
    first: 'Pierwsze!',
    second: 'Drugie!',
    third: 'Trzecie!',
    halfWay: 'Połowa!',
    lastRep: 'Ostatnie!',
    workoutComplete: 'Trening ukończony! Brawo!',
    
    squat: {
      depth: 'Schodź głębiej',
      kneesOut: 'Kolana na zewnątrz',
      torsoUpright: 'Prostszy tułów',
      goodRep: 'Dobrze',
    },
    
    swing: {
      hingeMore: 'Większy hinge',
      straightArms: 'Proste ramiona',
      hipsForward: 'Biodra do przodu',
      goodRep: 'Mocny wymach',
    },
    
    row: {
      pullToHip: 'Do biodra',
      straightBack: 'Proste plecy',
      elbowClose: 'Łokieć przy ciele',
      goodRep: 'Kontrola',
    },
    
    press: {
      lockout: 'Zablokuj',
      straightTorso: 'Pionowy tułów',
      tightCore: 'Napięty brzuch',
      goodRep: 'Mocno',
    },
    
    twist: {
      rotateMore: 'Większa rotacja',
      leanBack: 'Do tyłu',
      shouldersLevel: 'Równe barki',
      goodRep: 'Rotacja',
    },
    
    newVersion: 'Nowa wersja dostępna!',
    updateToSeeNew: 'Zaktualizuj aby zobaczyć nowości',
    update: 'Aktualizuj',
    iosTip: '💡 Jeśli aktualizacja nie działa, zamknij aplikację i otwórz ponownie',
    
    exerciseNotFound: 'Nie znaleziono ćwiczenia',
    cameraAccessError: 'Brak dostępu do kamery. Upewnij się, że dałeś pozwolenie.',
    skeletonNotVisible: 'Ustaw się tak, by być widocznym w całości',
  },
  
  en: {
    appName: 'Form Analyzer',
    appSubtitle: 'Real-time form analysis',
    
    allLevels: 'All',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    beforeWorkout: 'Before workout:',
    setupPhone: 'Place your phone on a tripod 2-3 meters away',
    goodLighting: 'Make sure there is good lighting',
    enableSound: 'Enable sound for voice cues',
    tightClothing: 'Tight clothing works better than loose',
    testAudio: '🔊 Test audio',
    audioWorks: '✓ Audio works',
    
    endWorkout: 'End',
    reps: 'reps',
    ofReps: '/',
    form: 'form',
    kneeAngle: 'knee angle',
    hipHinge: 'hip hinge',
    elbow: 'elbow',
    torso: 'torso',
    lean: 'lean',
    rotation: 'rotation',
    arms: 'arms',
    
    setup: '🎯 Setup',
    execution: '▶️ Execution',
    muscles: '💪 Muscles',
    tips: '💡 Tips',
    commonMistakes: '⚠️ Common mistakes',
    targetReps: 'Target reps',
    startWorkout: 'Start workout',
    watchVideo: '🎬 Watch tutorial video',
    videoTutorial: 'Tutorial video',
    
    start: 'Start!',
    first: 'First!',
    second: 'Second!',
    third: 'Third!',
    halfWay: 'Halfway!',
    lastRep: 'Last one!',
    workoutComplete: 'Workout complete! Great job!',
    
    squat: {
      depth: 'Go deeper',
      kneesOut: 'Knees out',
      torsoUpright: 'Upright torso',
      goodRep: 'Good',
    },
    
    swing: {
      hingeMore: 'More hinge',
      straightArms: 'Straight arms',
      hipsForward: 'Hips forward',
      goodRep: 'Strong swing',
    },
    
    row: {
      pullToHip: 'To hip',
      straightBack: 'Straight back',
      elbowClose: 'Elbow close',
      goodRep: 'Control',
    },
    
    press: {
      lockout: 'Lock out',
      straightTorso: 'Vertical torso',
      tightCore: 'Tight core',
      goodRep: 'Strong',
    },
    
    twist: {
      rotateMore: 'More rotation',
      leanBack: 'Lean back',
      shouldersLevel: 'Level shoulders',
      goodRep: 'Rotation',
    },

    pushup: {
      bodyLine: 'Body in line',
      elbowTuck: 'Elbows close',
      symmetry: 'Symmetry',
      goodRep: 'Good',
    },

    triceps: 'triceps',
    symmetry: 'symmetry',

    newVersion: 'New version available!',
    updateToSeeNew: 'Update to see new features',
    update: 'Update',
    iosTip: '💡 If update doesn\'t work, close the app and reopen',
    
    exerciseNotFound: 'Exercise not found',
    cameraAccessError: 'Camera access denied. Please allow camera permission.',
    skeletonNotVisible: 'Position yourself to be fully visible',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
