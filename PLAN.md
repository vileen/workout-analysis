# Home Workout Form Analyzer - App Plan

## Overview
Real-time exercise form analysis app for iPhone. Place phone on tripod, camera analyzes your movement, gives instant feedback on form quality.

---

## Tech Stack

### Frontend (iPhone PWA)
- **Framework:** React + TypeScript (Vite)
- **Pose Detection:** MediaPipe Pose (runs on-device, no cloud)
- **Camera:** getUserMedia API (back camera for tripod setup)
- **UI:** TailwindCSS (mobile-first)
- **State:** Zustand (lightweight)
- **Storage:** localStorage + optional backend sync

### Backend (optional, for history)
- **Runtime:** Node.js + Express or Fastify
- **DB:** SQLite (local) or PostgreSQL (if cloud sync needed)
- **API:** REST or tRPC

---

## Core Features

### 1. Exercise Detection (Phase 1)
Target 3-5 fundamental exercises:
1. **Squats** (depth, knee valgus, back angle)
2. **Push-ups** (depth, hip sag, elbow flare)
3. **Plank** (hip height, shoulder alignment)
4. **Lunges** (knee angle, balance)
5. **Deadlifts** (back straightness, hip hinge)

### 2. Real-time Form Analysis
MediaPipe Pose provides 33 landmarks:
```
Key joints for analysis:
- 11/12: Shoulders
- 13/14: Elbows
- 15/16: Wrists
- 23/24: Hips
- 25/26: Knees
- 27/28: Ankles
```

**Calculated metrics per exercise:**
- Joint angles (knee, hip, elbow)
- Body alignment (vertical/horizontal)
- Range of motion
- Rep counting
- Tempo/timing

### 3. Feedback System
**Visual:**
- Skeleton overlay on video
- Color-coded joints (green = good, red = fix)
- Angle display near joints
- Progress bar for rep depth

**Audio:**
- "Good rep!" on success
- "Go deeper" on shallow squat
- "Knees out" on valgus
- Rep counting voice

**Haptic:**
- Vibration on rep completion
- Warning buzz on bad form

### 4. Workout Modes

#### Mode A: Guided Set
- Choose exercise
- Set target reps
- Real-time feedback
- Form score per rep
- Set summary

#### Mode B: Free Workout
- Multi-exercise routine
- Auto-exercise detection (harder, v2)
- Timer-based or rep-based
- Full workout summary

#### Mode C: Practice Mode
- No counting, just form tips
- Good for learning

---

## Architecture

```
┌─────────────────────────────────────────┐
│  iPhone (PWA)                           │
│  ┌─────────────────────────────────────┐│
│  │  Camera Stream                      ││
│  │  ↓                                  ││
│  │  MediaPipe Pose (on-device)         ││
│  │  ↓                                  ││
│  │  Form Analyzer Engine               ││
│  │  - Angle calculator                 ││
│  │  - Rep detector                     ││
│  │  - Form validator                   ││
│  │  ↓                                  ││
│  │  Feedback Renderer                  ││
│  │  - Skeleton overlay                 ││
│  │  - Audio cues                       ││
│  │  - Score display                    ││
│  └─────────────────────────────────────┘│
│              ↓                          │
│  Local Storage (workout history)        │
│  (Optional: sync to backend)            │
└─────────────────────────────────────────┘
```

---

## Form Analysis Rules (Examples)

### Squat Analysis
```typescript
interface SquatCriteria {
  minDepth: 90;        // Hip below knee (angle < 90°)
  maxKneeValgus: 15;   // Knee angle vs foot direction
  minTorsoAngle: 30;   // Back not too vertical
  maxTorsoAngle: 60;   // Back not too horizontal
}

// Checklist per rep:
// 1. Depth: hip_knee_ankle angle < 90°
// 2. Knee tracking: knee aligns with toe direction
// 3. Back angle: torso lean 30-60° from vertical
// 4. Symmetry: left/right knee angles within 10°
```

### Push-up Analysis
```typescript
interface PushupCriteria {
  minDepth: 90;        // Elbow angle < 90°
  maxHipSag: 10;       // Hip not below shoulders/heels line
  maxHipPike: 15;      // Hip not above shoulders/heels
  elbowFlareMax: 75;   // Elbow angle from body < 75°
}

// Checklist per rep:
// 1. Depth: shoulder_elbow_wrist angle < 90°
// 2. Body line: hip between shoulder and heel vertically
// 3. Elbow tuck: elbows not flaring > 75° from body
```

---

## UI/UX Design

### Screen 1: Setup
- Camera permission request
- Back camera activation
- Tripod placement guide (overlay showing ideal position)
- Exercise selector

### Screen 2: Live Analysis
```
┌─────────────────────────────┐
│  [Camera Feed]              │
│  [Skeleton Overlay]         │
│                             │
│  ○──○──○                    │
│  │  │  │                    │
│  ○  ○  ○  ← Landmarks       │
│  │  │  │                    │
│  ○  ○  ○                    │
│                             │
├─────────────────────────────┤
│  Reps: 8/10  │  Form: 85%   │
│  [████████░░]               │
├─────────────────────────────┤
│  Last rep: Good depth! ✓    │
│  Tip: Keep knees out        │
└─────────────────────────────┘
```

### Screen 3: Set Summary
- Total reps
- Good rep percentage
- Breakdown by criteria
- Personal record alerts

---

## Implementation Phases

### Phase 1: MVP (1-2 weeks)
- [ ] Basic React PWA setup
- [ ] Camera access + MediaPipe integration
- [ ] One exercise (squats)
- [ ] Basic angle calculation
- [ ] Rep counting
- [ ] Simple visual feedback

### Phase 2: Polish (1 week)
- [ ] Audio feedback
- [ ] Haptic feedback
- [ ] Score system
- [ ] Workout history
- [ ] 3 exercises total

### Phase 3: Advanced (2 weeks)
- [ ] All 5 exercises
- [ ] Better form algorithms
- [ ] Backend for progress tracking
- [ ] Statistics/charts
- [ ] Export data (Apple Health?)

---

## Technical Challenges

### 1. iPhone Performance
- MediaPipe runs at 15-30 FPS on modern iPhones
- Need to balance accuracy vs performance
- May need to lower camera resolution

### 2. Lighting/Environment
- Works best with good lighting
- May struggle in dark rooms
- Consider flashlight feature

### 3. Camera Angle
- Tripod placement critical
- Different heights affect angles
- Need calibration per user height

### 4. Clothing
- Tight clothing works better
- Baggy clothes obscure joints
- May need to warn user

---

## File Structure

```
workout-form-analyzer/
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   │   ├── CameraFeed.tsx
│   │   │   └── SkeletonOverlay.tsx
│   │   ├── Exercise/
│   │   │   ├── ExerciseSelector.tsx
│   │   │   ├── RepCounter.tsx
│   │   │   └── FormScore.tsx
│   │   └── Feedback/
│   │       ├── AudioFeedback.tsx
│   │       └── VisualHints.tsx
│   ├── hooks/
│   │   ├── useMediaPipe.ts
│   │   ├── usePoseAnalysis.ts
│   │   ├── useRepCounter.ts
│   │   └── useWorkoutSession.ts
│   ├── engines/
│   │   ├── angleCalculator.ts
│   │   ├── squatAnalyzer.ts
│   │   ├── pushupAnalyzer.ts
│   │   └── plankAnalyzer.ts
│   ├── types/
│   │   └── pose.ts
│   ├── utils/
│   │   └── math.ts
│   └── App.tsx
├── public/
│   └── manifest.json (PWA)
└── package.json
```

---

## Dependencies

```json
{
  "@mediapipe/pose": "^0.5.1675469404",
  "@mediapipe/camera_utils": "^0.3.1675466862",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "zustand": "^4.5.0",
  "tailwindcss": "^3.4.0"
}
```

---

## Next Steps

1. **Validate approach** - Check if this plan meets your needs
2. **Choose scope** - Start with 1 exercise or go multi?
3. **Create repo** - Initialize project
4. **MediaPipe spike** - Test performance on your iPhone first
5. **Build MVP** - Start with just camera + skeleton

Want me to create the initial project structure?