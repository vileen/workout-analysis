# Form Analyzer - Workout Form Analysis

[![Deploy to GitHub Pages](https://github.com/vileen/workout-analysis/actions/workflows/deploy.yml/badge.svg)](https://github.com/vileen/workout-analysis/actions/workflows/deploy.yml)

Real-time exercise form analysis app using AI (MediaPipe Pose). Runs on iPhone as a PWA (Progressive Web App).

## 🚀 Live Demo

**GitHub Pages:** https://vileen.github.io/workout-analysis/

## 📱 How to Use

1. Open the link on iPhone in Safari
2. Tap "Share" → "Add to Home Screen"
3. Launch the app from your home screen
4. Place iPhone on a tripod 2-3 meters in front of you
5. Select an exercise and start your workout

## 🏋️ Supported Exercises

| Exercise | Level | Analyzes |
|-----------|--------|--------------|
| **Kettle Goblet Squat** | Beginner | Depth, torso angle, knee symmetry |
| **Kettle Swing** | Intermediate | Hip hinge, straight arms, knee bend |
| **Kettle Row** | Beginner | Torso lean, elbow range, straight back |
| **Kettle Press** | Intermediate | Vertical torso, hip stability, lockout |
| **Russian Twist** | Beginner | Torso lean, rotation, shoulder level |

## ✨ Features

- **Real-time analysis** - MediaPipe runs locally on device
- **Visual feedback** - Skeleton with color-coded cues
- **Audio feedback** - Voice commands in Polish
- **Rep counting** - Automatic detection
- **Form scoring** - Score 0-100 for each rep
- **Haptic feedback** - Vibration after each repetition
- **Instructions** - Detailed guidance for each exercise
- **PWA updates** - Automatic update notifications

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Pose Detection:** MediaPipe Pose (on-device)
- **Styling:** TailwindCSS
- **State:** Zustand
- **Deploy:** GitHub Pages

## 🔧 Development

```bash
# Clone repo
git clone https://github.com/vileen/workout-analysis.git
cd workout-analysis

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📋 Requirements

- iPhone with iOS 14+ (or Android with Chrome)
- Camera access
- Tripod or phone holder
- Good lighting (works best in daylight)

## 🔄 PWA Updates

The app automatically checks for updates every 5 minutes. When a new version is available, you'll see an "Update Available" banner. Tap "Update" to reload with the latest version.

**For iOS:** If the update doesn't work, close the app (swipe up) and reopen it.

## 📝 Roadmap

- [x] Basic analysis of 5 kettlebell exercises
- [x] Rep counting for all exercises
- [x] Visual feedback (skeleton)
- [x] Instructions for each exercise
- [x] Audio feedback (voice commands)
- [x] PWA update handling
- [ ] Workout history
- [ ] Progress statistics and charts
- [ ] More exercises (push-ups, plank, lunges)
- [ ] Camera calibration for height
- [ ] Apple Health export

## 🤝 Privacy

The app runs entirely on your device - your data never leaves your phone. MediaPipe processes video in real-time without sending it to the cloud.

---

Built with 💪 for kettlebell enthusiasts
