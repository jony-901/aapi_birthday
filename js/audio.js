/**
 * High Quality Melodic Audio Engine
 * Features acoustic piano harmonics, warm chords, master gain control,
 * and reliable mute/unmute toggle with browser autoplay unlock.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.customAudio = new Audio();
    this.customAudio.loop = true;
    this.customAudio.preload = "auto";
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Master Gain Node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // BGM Gain Node
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        // SFX Gain Node
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      // Fast smooth ramp to prevent audible clicks
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 1, now + 0.05);
    }

    // Handle custom audio stream if active
    if (this.customAudio && this.customAudio.src && !this.customAudio.src.endsWith("#")) {
      if (this.isMuted) {
        this.customAudio.pause();
      } else {
        this.customAudio.play().catch(() => {});
      }
    }

    // If unmuted and music was not active, start it immediately
    if (!this.isMuted) {
      if (!this.bgmPlaying) {
        this.playBackgroundMusic();
      }
    }

    return this.isMuted;
  }

  // Soft warm acoustic bell/piano tone
  playWarmNote(freq, time, duration = 1.2, volume = 0.15, isBgm = false) {
    if (!this.ctx) return;

    const targetGainNode = isBgm ? this.bgmGain : this.sfxGain;
    if (!targetGainNode) return;

    // Multi-harmonic warmth (fundamental + soft harmonics)
    const harmonics = [1, 2, 3];
    const weights = [1, 0.32, 0.08];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq * h, time);

      // Lowpass filter for smooth acoustic depth
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3.2, time);

      const noteVol = volume * weights[idx];
      noteGain.gain.setValueAtTime(0.0001, time);
      // Gentle attack
      noteGain.gain.exponentialRampToValueAtTime(Math.max(noteVol, 0.0001), time + 0.035);
      // Warm exponential piano decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(targetGainNode);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }

  // Sweet gentle opening chime
  playChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + 0.05;
    const chord = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    chord.forEach((freq, i) => {
      this.playWarmNote(freq, now + i * 0.065, 1.4, 0.14, false);
    });
  }

  // Candle blowing soft wind sound
  playBlow() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.45);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.55);
  }

  // Soft celebratory sparkle sound
  playSparkle() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      this.playWarmNote(freq, now + idx * 0.055, 1.1, 0.09, false);
    });
  }

  // Soft distant firework pop
  playFirework() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Soothing, Emotional Acoustic Piano "Happy Birthday" Melody
  playSynthesizedBgm() {
    this.init();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;

    this.bgmPlaying = true;

    // Frequencies (F Major warmth)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25, D5 = 587.33;
    const F3 = 174.61, C3 = 130.81, Bb3 = 233.08, A3 = 220.00, G3 = 196.00;

    const melody = [
      // Phrase 1: Happy Birthday to you
      { note: C4, base: F3, dur: 0.38, pause: 0.06 },
      { note: C4, base: null, dur: 0.26, pause: 0.06 },
      { note: D4, base: null, dur: 0.65, pause: 0.06 },
      { note: C4, base: null, dur: 0.65, pause: 0.06 },
      { note: F4, base: A3, dur: 0.65, pause: 0.06 },
      { note: E4, base: C3, dur: 1.3, pause: 0.35 },

      // Phrase 2: Happy Birthday to you
      { note: C4, base: C3, dur: 0.38, pause: 0.06 },
      { note: C4, base: null, dur: 0.26, pause: 0.06 },
      { note: D4, base: null, dur: 0.65, pause: 0.06 },
      { note: C4, base: null, dur: 0.65, pause: 0.06 },
      { note: G4, base: Bb3, dur: 0.65, pause: 0.06 },
      { note: F4, base: F3, dur: 1.3, pause: 0.35 },

      // Phrase 3: Happy Birthday dear Bisma Aapi
      { note: C4, base: F3, dur: 0.38, pause: 0.06 },
      { note: C4, base: null, dur: 0.26, pause: 0.06 },
      { note: C5, base: A3, dur: 0.65, pause: 0.06 },
      { note: A4, base: null, dur: 0.65, pause: 0.06 },
      { note: F4, base: Bb3, dur: 0.65, pause: 0.06 },
      { note: E4, base: null, dur: 0.65, pause: 0.06 },
      { note: D4, base: G3, dur: 1.2, pause: 0.35 },

      // Phrase 4: Happy Birthday to you
      { note: Bb4, base: Bb3, dur: 0.38, pause: 0.06 },
      { note: Bb4, base: null, dur: 0.26, pause: 0.06 },
      { note: A4, base: F3, dur: 0.65, pause: 0.06 },
      { note: F4, base: null, dur: 0.65, pause: 0.06 },
      { note: G4, base: C3, dur: 0.65, pause: 0.06 },
      { note: F4, base: F3, dur: 1.8, pause: 1.0 }
    ];

    let totalDuration = 0;
    melody.forEach(m => totalDuration += (m.dur + m.pause));

    const scheduleLoop = () => {
      if (!this.bgmPlaying || !this.ctx) return;
      let offset = this.ctx.currentTime + 0.08;

      melody.forEach(item => {
        // Play melody note
        this.playWarmNote(item.note, offset, item.dur + 0.45, 0.16, true);
        
        // Play soft acoustic bass note
        if (item.base) {
          this.playWarmNote(item.base, offset, item.dur + 0.9, 0.09, true);
        }

        offset += (item.dur + item.pause);
      });

      this.bgmTimer = setTimeout(() => {
        if (this.bgmPlaying) {
          scheduleLoop();
        }
      }, Math.max(1000, (totalDuration - 0.2) * 1000));
    };

    scheduleLoop();
  }

  stopSynthesizedBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBackgroundMusic(customUrl = null) {
    this.init();
    if (customUrl && customUrl.trim() !== "") {
      this.stopSynthesizedBgm();
      this.customAudio.src = customUrl;
      if (!this.isMuted) {
        this.customAudio.play().catch(() => {
          this.playSynthesizedBgm();
        });
      }
    } else {
      if (this.customAudio) {
        this.customAudio.pause();
        this.customAudio.src = "";
      }
      this.playSynthesizedBgm();
    }
  }
}

// Global instance
window.soundEngine = new SoundEngine();

// Auto-unlock Web Audio on ANY user interaction (mobile + desktop)
const handleFirstUserInteraction = () => {
  if (window.soundEngine) {
    window.soundEngine.init();
    if (!window.soundEngine.isMuted && !window.soundEngine.bgmPlaying) {
      window.soundEngine.playBackgroundMusic();
    }
  }
};

["click", "touchstart", "keydown", "pointerdown"].forEach(eventType => {
  document.addEventListener(eventType, handleFirstUserInteraction, { passive: true });
});
