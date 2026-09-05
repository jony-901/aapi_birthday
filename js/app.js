/**
 * Streamlined Application Controller (Strict Passcode Verification)
 */
class BirthdayApp {
  constructor() {
    this.currentStageIndex = 0;
    this.stages = [
      "stage-pin",
      "stage-gift",
      "stage-cake",
      "stage-note"
    ];

    this.giftController = null;
    this.cakeController = null;
    this.fireworksEngine = null;
    this.customizer = null;
    this.typewriterTimeout = null;

    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  init() {
    this.customizer = new CustomizerStudio(this);
    this.applyData(this.customizer.data);

    this.bindGlobalControls();
    this.initPinStage();
    this.initGiftStage();
    this.initCakeStage();
    this.initNoteStage();

    this.goToStage(0);
  }

  bindGlobalControls() {
    const musicBtn = document.getElementById("music-toggle-btn");
    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        const isMuted = window.soundEngine.toggleMute();
        musicBtn.textContent = isMuted ? "🔇 Music: OFF" : "🎵 Music: ON";
        musicBtn.classList.toggle("muted", isMuted);
      });
    }
  }

  goToStage(index) {
    if (index < 0 || index >= this.stages.length) return;
    this.currentStageIndex = index;

    this.stages.forEach((stageId, i) => {
      const el = document.getElementById(stageId);
      if (el) {
        if (i === index) {
          el.classList.add("active");
          el.classList.remove("hidden");
        } else {
          el.classList.remove("active");
          el.classList.add("hidden");
        }
      }
    });

    this.updateProgressDots();
    this.onEnterStage(index);
  }

  nextStage() {
    this.goToStage(this.currentStageIndex + 1);
  }

  updateProgressDots() {
    const dotsContainer = document.getElementById("progress-dots");
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    this.stages.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = `progress-dot ${i === this.currentStageIndex ? "active" : ""} ${i < this.currentStageIndex ? "completed" : ""}`;
      dotsContainer.appendChild(dot);
    });
  }

  onEnterStage(index) {
    const stageId = this.stages[index];

    if (stageId === "stage-cake") {
      if (!this.cakeController) {
        this.cakeController = new CakeController({
          containerId: "cake-stage",
          onCompleted: () => this.nextStage()
        });
      }
      if (window.soundEngine) {
        window.soundEngine.playBackgroundMusic();
      }
    }

    if (stageId === "stage-note") {
      this.playNoteTypewriter();
      if (!this.fireworksEngine) {
        this.fireworksEngine = new FireworksEngine("fireworks-canvas");
      }
      this.fireworksEngine.start();
    } else if (this.fireworksEngine) {
      this.fireworksEngine.stop();
    }
  }

  applyData(data) {
    document.body.className = data.theme || "theme-lavender";

    document.querySelectorAll(".bind-recipient").forEach(el => {
      el.textContent = data.recipientName || "Bisma Aapi";
    });
    document.querySelectorAll(".bind-sender").forEach(el => {
      el.textContent = data.senderName || "Your Well-Wisher ❤️";
    });
    document.querySelectorAll(".bind-date").forEach(el => {
      el.textContent = data.birthdayDate || "Today";
    });

    const hintEl = document.getElementById("pin-hint-text");
    if (hintEl) hintEl.textContent = data.hint || `Passcode: ${data.pinCode || "2004"}`;

    if (data.musicUrl) {
      window.soundEngine.playBackgroundMusic(data.musicUrl);
    }
  }

  /* ---------------- STAGE 1: PIN (Strict 2004 Only) ---------------- */
  initPinStage() {
    const pinInput = document.getElementById("pin-input");
    const unlockBtn = document.getElementById("unlock-pin-btn");
    const errorMsg = document.getElementById("pin-error-msg");

    const checkPin = () => {
      const entered = pinInput ? pinInput.value.trim() : "";
      const expected = (this.customizer && this.customizer.data && this.customizer.data.pinCode) ? this.customizer.data.pinCode : "2004";

      // STRICT: Must strictly match 2004 / expected passcode
      if (entered !== "" && (entered === expected || entered === "2004")) {
        if (errorMsg) errorMsg.classList.add("hidden");
        if (window.soundEngine) window.soundEngine.playChime();
        this.nextStage();
      } else {
        if (errorMsg) {
          errorMsg.textContent = "Oops! Incorrect passcode. Please enter 2004!";
          errorMsg.classList.remove("hidden");
        }
        if (pinInput) {
          pinInput.classList.add("shake");
          setTimeout(() => pinInput.classList.remove("shake"), 500);
        }
      }
    };

    if (unlockBtn) unlockBtn.addEventListener("click", checkPin);
    if (pinInput) {
      pinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") checkPin();
      });
    }
  }

  /* ---------------- STAGE 2: 3D GIFT ---------------- */
  initGiftStage() {
    this.giftController = new GiftBoxController("gift-box-btn", () => {
      this.nextStage();
    });
  }

  /* ---------------- STAGE 3: CAKE ---------------- */
  initCakeStage() {
    const cakeNext = document.getElementById("cake-next-btn");
    if (cakeNext) {
      cakeNext.addEventListener("click", () => this.nextStage());
    }
  }

  /* ---------------- STAGE 4: NOTE & FINALE ---------------- */
  initNoteStage() {
    const replayBtn = document.getElementById("replay-journey-btn");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        this.goToStage(1); // Go back to gift box
      });
    }
  }

  playNoteTypewriter() {
    const letterBody = document.getElementById("typewriter-letter-body");
    if (!letterBody) return;
    letterBody.textContent = "";

    const fullText = this.customizer.getFormattedLetter();
    let charIndex = 0;
    const speed = 25;

    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);

    const type = () => {
      if (charIndex < fullText.length) {
        letterBody.textContent += fullText.charAt(charIndex);
        charIndex++;
        this.typewriterTimeout = setTimeout(type, speed);
      }
    };

    type();
  }
}

window.app = new BirthdayApp();
