/**
 * High Quality Melodic Audio Engine
 * Features soft acoustic chime harmonics, warm piano chords, and soothing Happy Birthday melody.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.customAudio = new Audio();
    this.customAudio.loop = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.customAudio) this.customAudio.pause();
      this.stopSynthesizedBgm();
    } else {
      if (this.customAudio && this.customAudio.src && this.customAudio.src !== window.location.href) {
        this.customAudio.play().catch(() => {});
      } else {
        this.playSynthesizedBgm();
      }
    }
    return this.isMuted;
  }

  // Soft warm acoustic bell/piano tone
  playWarmNote(freq, time, duration = 1.2, volume = 0.15) {
    if (this.isMuted || !this.ctx) return;

    // Fundamental + gentle harmonics
    const harmonics = [1, 2, 3];
    const weights = [1, 0.35, 0.1];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine/triangle for acoustic warmth
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq * h, time);

      // Lowpass filter for smooth, non-harsh sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3, time);

      const noteVol = volume * weights[idx];
      gain.gain.setValueAtTime(0.001, time);
      // Soft gentle attack
      gain.gain.exponentialRampToValueAtTime(noteVol, time + 0.04);
      // Warm exponential decay
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.1);
    });
  }

  // Sweet gentle opening chime
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + 0.05;
    // Pentatonic ascending chime (C5, D5, E5, G5, A5, C6)
    const chord = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    chord.forEach((freq, i) => {
      this.playWarmNote(freq, now + i * 0.07, 1.4, 0.12);
    });
  }

  // Candle blowing soft wind sound
  playBlow() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

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
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.55);
  }

  // Soft celebratory sparkle sound
  playSparkle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playWarmNote(freq, now + idx * 0.06, 1.0, 0.08);
    });
  }

  // Soft distant firework pop
  playFirework() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Soothing, Emotional Acoustic "Happy Birthday" Melody
  playSynthesizedBgm() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.bgmPlaying = true;

    // Frequencies (F Major / D minor warmth)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25, D5 = 587.33;
    const F3 = 174.61, C3 = 130.81, Bb3 = 233.08, A3 = 220.00;

    const melody = [
      // Phrase 1: Happy Birthday to you
      { note: C4, base: F3, dur: 0.35, pause: 0.05 },
      { note: C4, base: null, dur: 0.25, pause: 0.05 },
      { note: D4, base: null, dur: 0.6, pause: 0.05 },
      { note: C4, base: null, dur: 0.6, pause: 0.05 },
      { note: F4, base: A3, dur: 0.6, pause: 0.05 },
      { note: E4, base: C3, dur: 1.2, pause: 0.3 },

      // Phrase 2: Happy Birthday to you
      { note: C4, base: C3, dur: 0.35, pause: 0.05 },
      { note: C4, base: null, dur: 0.25, pause: 0.05 },
      { note: D4, base: null, dur: 0.6, pause: 0.05 },
      { note: C4, base: null, dur: 0.6, pause: 0.05 },
      { note: G4, base: Bb3, dur: 0.6, pause: 0.05 },
      { note: F4, base: F3, dur: 1.2, pause: 0.3 },

      // Phrase 3: Happy Birthday dear friend
      { note: C4, base: F3, dur: 0.35, pause: 0.05 },
      { note: C4, base: null, dur: 0.25, pause: 0.05 },
      { note: C5, base: A3, dur: 0.6, pause: 0.05 },
      { note: A4, base: null, dur: 0.6, pause: 0.05 },
      { note: F4, base: Bb3, dur: 0.6, pause: 0.05 },
      { note: E4, base: null, dur: 0.6, pause: 0.05 },
      { note: D4, base: Bb3, dur: 1.1, pause: 0.3 },

      // Phrase 4: Happy Birthday to you
      { note: Bb4, base: Bb3, dur: 0.35, pause: 0.05 },
      { note: Bb4, base: null, dur: 0.25, pause: 0.05 },
      { note: A4, base: F3, dur: 0.6, pause: 0.05 },
      { note: F4, base: null, dur: 0.6, pause: 0.05 },
      { note: G4, base: C3, dur: 0.6, pause: 0.05 },
      { note: F4, base: F3, dur: 1.6, pause: 0.8 }
    ];

    let totalDuration = 0;
    melody.forEach(m => totalDuration += (m.dur + m.pause));

    const playLoop = () => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
      let offset = this.ctx.currentTime + 0.1;

      melody.forEach(item => {
        // Play melody note
        this.playWarmNote(item.note, offset, item.dur + 0.4, 0.14);
        
        // Play soft acoustic bass chord if present
        if (item.base) {
          this.playWarmNote(item.base, offset, item.dur + 0.8, 0.08);
        }

        offset += (item.dur + item.pause);
      });

      this.bgmTimer = setTimeout(() => {
        if (this.bgmPlaying) playLoop();
      }, totalDuration * 1000);
    };

    playLoop();
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

window.soundEngine = new SoundEngine();
