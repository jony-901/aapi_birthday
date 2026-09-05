/**
 * Cake and Candle Blowing Mechanics (English + Auto Progression)
 */
class CakeController {
  constructor(options = {}) {
    this.container = document.getElementById(options.containerId || "cake-stage");
    this.candlesBlown = false;
    this.cakeCut = false;
    this.onCompleted = options.onCompleted;
    this.micStream = null;
    this.micInterval = null;
    this.init();
  }

  init() {
    if (!this.container) return;

    const blowBtn = document.getElementById("blow-candle-btn");
    const micBtn = document.getElementById("mic-blow-btn");
    const cutBtn = document.getElementById("cut-cake-btn");
    const cakeNextBtn = document.getElementById("cake-next-btn");
    const candles = this.container.querySelectorAll(".candle");

    if (blowBtn) {
      blowBtn.addEventListener("click", () => this.blowCandles());
    }

    if (micBtn) {
      micBtn.addEventListener("click", () => this.enableMicBlow());
    }

    if (cutBtn) {
      cutBtn.addEventListener("click", () => this.cutCake());
    }

    if (cakeNextBtn) {
      cakeNextBtn.addEventListener("click", () => {
        if (window.app) window.app.nextStage();
      });
    }

    candles.forEach(candle => {
      candle.addEventListener("click", () => this.blowCandles());
    });
  }

  blowCandles() {
    if (this.candlesBlown) return;
    this.candlesBlown = true;

    if (window.soundEngine) {
      window.soundEngine.playBlow();
      setTimeout(() => {
        window.soundEngine.playSparkle();
      }, 400);
    }

    const flames = this.container.querySelectorAll(".flame");
    flames.forEach((flame, index) => {
      setTimeout(() => {
        flame.classList.add("extinguished");
        this.spawnSmoke(flame);
      }, index * 80);
    });

    const blowActions = document.getElementById("blow-actions");
    const cutActions = document.getElementById("cut-actions");
    const wishBanner = document.getElementById("wish-banner");

    if (blowActions) blowActions.classList.add("hidden");
    if (wishBanner) {
      wishBanner.classList.remove("hidden");
      wishBanner.classList.add("animate-pop");
    }

    setTimeout(() => {
      if (cutActions) {
        cutActions.classList.remove("hidden");
        cutActions.classList.add("animate-fade-in");
      }
    }, 900);

    this.stopMic();
  }

  spawnSmoke(flameElement) {
    const rect = flameElement.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const smoke = document.createElement("div");
      smoke.className = "smoke-puff";
      smoke.style.left = `${rect.left + rect.width / 2 + (Math.random() * 8 - 4)}px`;
      smoke.style.top = `${rect.top}px`;
      document.body.appendChild(smoke);

      setTimeout(() => {
        if (smoke.parentNode) smoke.parentNode.removeChild(smoke);
      }, 1000);
    }
  }

  async enableMicBlow() {
    const micBtn = document.getElementById("mic-blow-btn");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.micStream = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const micSource = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        micSource.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);
        if (micBtn) {
          micBtn.innerHTML = "🎙️ Listening... Blow into mic!";
          micBtn.classList.add("listening-pulse");
        }

        this.micInterval = setInterval(() => {
          if (this.candlesBlown) {
            this.stopMic();
            return;
          }
          analyser.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
          }
          let avg = sum / buffer.length;
          if (avg > 45) {
            this.blowCandles();
          }
        }, 100);
      } else {
        alert("Microphone not supported on this browser. Tap the candles to blow them!");
      }
    } catch (e) {
      console.warn("Microphone access error:", e);
      alert("Microphone permission was not granted. Tap the candles or button to blow them!");
    }
  }

  stopMic() {
    if (this.micInterval) {
      clearInterval(this.micInterval);
      this.micInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
  }

  cutCake() {
    if (this.cakeCut) return;
    this.cakeCut = true;

    if (window.soundEngine) {
      window.soundEngine.playSparkle();
    }

    const knife = document.getElementById("cake-knife");
    const cakeSlice = document.getElementById("cake-slice");
    const cutBtn = document.getElementById("cut-cake-btn");
    const nextBtn = document.getElementById("cake-next-btn");

    if (knife) knife.classList.add("cutting");
    
    setTimeout(() => {
      if (cakeSlice) cakeSlice.classList.add("sliced");
      if (cutBtn) cutBtn.classList.add("hidden");
      if (nextBtn) {
        nextBtn.classList.remove("hidden");
        nextBtn.classList.add("animate-bounce-in");
      }

      // Automatically transition to the Letter stage after a brief joyful delay!
      setTimeout(() => {
        if (window.app) {
          window.app.nextStage();
        }
      }, 1400);

    }, 700);
  }
}

window.CakeController = CakeController;
