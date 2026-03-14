type VoiceType = 'pl-PL' | 'en-US';

interface AudioCue {
  text: string;
  priority: 'high' | 'medium' | 'low';
  cooldown: number; // ms before same cue can play again
}

class AudioFeedback {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private lastPlayed: Map<string, number> = new Map();
  private isEnabled: boolean = true;
  private language: VoiceType = 'pl-PL';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
    }
  }

  private initVoice() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      // Try to find Polish voice, fallback to any voice
      this.voice = voices.find(v => v.lang.includes('pl-PL')) || 
                   voices.find(v => v.lang.includes('pl')) ||
                   voices[0];
    };

    // Voices load asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  setLanguage(lang: VoiceType) {
    this.language = lang;
    this.initVoice();
  }

  private canPlay(cue: AudioCue): boolean {
    const now = Date.now();
    const lastPlayed = this.lastPlayed.get(cue.text) || 0;
    
    if (now - lastPlayed < cue.cooldown) {
      return false;
    }
    
    this.lastPlayed.set(cue.text, now);
    return true;
  }

  speak(text: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.isEnabled || !this.synth) return;

    const cue: AudioCue = { text, priority, cooldown: this.getCooldown(priority) };
    
    if (!this.canPlay(cue)) return;

    // Cancel any ongoing speech for high priority
    if (priority === 'high') {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.lang = this.language;
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synth.speak(utterance);
  }

  private getCooldown(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3000;    // 3 seconds
      case 'medium': return 5000;  // 5 seconds
      case 'low': return 8000;     // 8 seconds
    }
  }

  // Pre-defined cues for exercises
  repCount(count: number) {
    this.speak(`${count}`, 'high');
  }

  repCompleted(count: number) {
    if (count === 1) this.speak('Pierwsze!', 'high');
    else if (count === 2) this.speak('Drugie!', 'high');
    else if (count === 3) this.speak('Trzecie!', 'high');
    else this.speak(`${count}!`, 'high');
  }

  // Form feedback cues
  squat = {
    depth: () => this.speak('Schodź głębiej', 'high'),
    kneesOut: () => this.speak('Kolana na zewnątrz', 'high'),
    torsoUpright: () => this.speak('Prostszy tułów', 'medium'),
    goodRep: () => this.speak('Dobrze', 'low'),
    standUp: () => this.speak('Wstawaj', 'low'),
  };

  swing = {
    hingeMore: () => this.speak('Większy hinge', 'high'),
    straightArms: () => this.speak('Proste ramiona', 'high'),
    hipsForward: () => this.speak('Biodra do przodu', 'medium'),
    goodRep: () => this.speak('Mocny wymach', 'low'),
  };

  row = {
    pullToHip: () => this.speak('Do biodra', 'high'),
    straightBack: () => this.speak('Proste plecy', 'high'),
    elbowClose: () => this.speak('Łokieć przy ciele', 'medium'),
    goodRep: () => this.speak('Kontrola', 'low'),
  };

  press = {
    lockout: () => this.speak('Zablokuj', 'high'),
    straightTorso: () => this.speak('Pionowy tułów', 'high'),
    tightCore: () => this.speak('Napięty brzuch', 'medium'),
    goodRep: () => this.speak('Mocno', 'low'),
  };

  twist = {
    rotateMore: () => this.speak('Większa rotacja', 'high'),
    leanBack: () => this.speak('Do tyłu', 'medium'),
    shouldersLevel: () => this.speak('Równe barki', 'medium'),
    goodRep: () => this.speak('Rotacja', 'low'),
  };

  // Workout events
  workoutComplete() {
    this.speak('Trening ukończony! Brawo!', 'high');
  }

  halfWay(total: number) {
    this.speak(`Połowa! ${total / 2} powtórzeń`, 'medium');
  }

  lastRep() {
    this.speak('Ostatnie!', 'high');
  }

  // Test audio (for settings)
  test() {
    this.speak('Audio działa. Gotowy do treningu!', 'high');
  }
}

// Singleton instance
export const audioFeedback = new AudioFeedback();

// React hook for audio feedback
import { useCallback } from 'react';

export function useAudioFeedback() {
  const speak = useCallback((text: string, priority?: 'high' | 'medium' | 'low') => {
    audioFeedback.speak(text, priority);
  }, []);

  const enable = useCallback(() => audioFeedback.enable(), []);
  const disable = useCallback(() => audioFeedback.disable(), []);
  const test = useCallback(() => audioFeedback.test(), []);

  return {
    speak,
    enable,
    disable,
    test,
    audioFeedback,
  };
}
