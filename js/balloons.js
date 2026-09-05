/**
 * Balloon Popping Mini-Game
 */
class BalloonGame {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.reasons = options.reasons || [
      "Your smile lights up every room you walk into ✨",
      "You always know how to make me laugh even on tough days 😂",
      "Your kind heart and endless empathy ❤️",
      "All the crazy midnight conversations we share 🌙",
      "You are simply irreplaceable and one-in-a-million 🌟"
    ];
    this.poppedCount = 0;
    this.totalBalloons = this.reasons.length;
    this.onAllPopped = options.onAllPopped;
    this.colors = ["#ff4d88", "#7000ff", "#00d2ff", "#ff9e00", "#ff0055", "#00f0aa", "#ffcc00"];
    this.init();
  }

  setReasons(newReasons) {
    if (Array.isArray(newReasons) && newReasons.length > 0) {
      this.reasons = newReasons;
      this.totalBalloons = newReasons.length;
      this.reset();
    }
  }

  init() {
    if (!this.container) return;
    this.reset();
  }

  reset() {
    this.poppedCount = 0;
    this.container.innerHTML = "";

    const counter = document.getElementById("balloon-counter");
    if (counter) {
      counter.textContent = `0 / ${this.totalBalloons} Popped`;
    }

    const nextBtn = document.getElementById("balloons-next-btn");
    if (nextBtn) nextBtn.classList.add("hidden");

    this.renderBalloons();
  }

  renderBalloons() {
    this.reasons.forEach((reason, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "balloon-wrapper";
      wrapper.style.animationDelay = `${index * 0.2}s`;

      const color = this.colors[index % this.colors.length];
      
      const balloon = document.createElement("div");
      balloon.className = "balloon";
      balloon.style.backgroundColor = color;
      balloon.style.boxShadow = `inset -8px -8px 16px rgba(0,0,0,0.25), inset 8px 8px 16px rgba(255,255,255,0.4), 0 10px 25px ${color}66`;

      const string = document.createElement("div");
      string.className = "balloon-string";

      const label = document.createElement("div");
      label.className = "balloon-label";
      label.textContent = `#${index + 1}`;

      balloon.appendChild(label);
      wrapper.appendChild(balloon);
      wrapper.appendChild(string);

      wrapper.addEventListener("click", () => this.popBalloon(wrapper, balloon, reason, index));
      this.container.appendChild(wrapper);
    });
  }

  popBalloon(wrapper, balloon, reason, index) {
    if (wrapper.classList.contains("popped")) return;
    wrapper.classList.add("popped");

    if (window.soundEngine) {
      window.soundEngine.playPop();
    }

    this.spawnPopParticles(balloon);

    // Show revealed card
    this.showReasonCard(reason, index + 1);

    this.poppedCount++;
    const counter = document.getElementById("balloon-counter");
    if (counter) {
      counter.textContent = `${this.poppedCount} / ${this.totalBalloons} Popped`;
    }

    if (this.poppedCount >= this.totalBalloons) {
      if (window.soundEngine) {
        setTimeout(() => window.soundEngine.playChime(), 300);
      }
      const nextBtn = document.getElementById("balloons-next-btn");
      if (nextBtn) {
        setTimeout(() => {
          nextBtn.classList.remove("hidden");
          nextBtn.classList.add("animate-bounce-in");
        }, 800);
      }
      if (this.onAllPopped) {
        this.onAllPopped();
      }
    }
  }

  spawnPopParticles(balloon) {
    const rect = balloon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const bg = window.getComputedStyle(balloon).backgroundColor;

    for (let i = 0; i < 16; i++) {
      const p = document.createElement("div");
      p.className = "pop-particle";
      p.style.backgroundColor = bg;
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;

      const angle = (Math.PI * 2 * i) / 16;
      const dist = 30 + Math.random() * 50;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      document.body.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
        p.style.opacity = "0";
      });

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 500);
    }
  }

  showReasonCard(reason, index) {
    const modal = document.getElementById("reason-modal");
    const modalText = document.getElementById("reason-modal-text");
    const modalTitle = document.getElementById("reason-modal-title");

    if (modal && modalText && modalTitle) {
      modalTitle.textContent = `✨ Reason #${index} Why You Are Special ✨`;
      modalText.textContent = reason;
      modal.classList.add("active");
    }
  }
}

window.BalloonGame = BalloonGame;
