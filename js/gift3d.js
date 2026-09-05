/**
 * Spectacular 3D Gift Box Opening & Confetti Explosion
 */
class GiftBoxController {
  constructor(elementId, onOpened) {
    this.boxElement = document.getElementById(elementId);
    this.onOpened = onOpened;
    this.isOpened = false;
    this.init();
  }

  init() {
    if (!this.boxElement) return;

    this.boxElement.addEventListener("click", () => this.openBox());
    this.boxElement.addEventListener("touchstart", (e) => {
      // Immediate response on mobile
      this.openBox();
    }, { passive: true });

    this.boxElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        this.openBox();
      }
    });

    const container = document.querySelector(".gift-container");
    if (container) {
      container.addEventListener("mousemove", (e) => {
        if (this.isOpened) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateY = (x / rect.width) * 18;
        const rotateX = -(y / rect.height) * 18;
        const gift3d = this.boxElement.querySelector(".gift3d");
        if (gift3d) {
          gift3d.style.transform = `rotateX(${rotateX - 12}deg) rotateY(${rotateY + 25}deg)`;
        }
      });

      container.addEventListener("mouseleave", () => {
        if (this.isOpened) return;
        const gift3d = this.boxElement.querySelector(".gift3d");
        if (gift3d) {
          gift3d.style.transform = "rotateX(-12deg) rotateY(25deg)";
        }
      });
    }
  }

  openBox() {
    if (this.isOpened) return;
    this.isOpened = true;

    // Instant sound trigger & bgm start
    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playChime();
      window.soundEngine.playSparkle();
      window.soundEngine.playBackgroundMusic();
    }

    // Instant visual trigger
    this.boxElement.classList.add("opening");
    this.boxElement.classList.add("opened");

    // Launch spectacular golden confetti & emoji fountain
    this.spawnExplosionFountain();

    // Fast, satisfying transition (950ms instead of 2.2s)
    setTimeout(() => {
      if (this.onOpened) {
        this.onOpened();
      }
    }, 950);
  }

  spawnExplosionFountain() {
    const rect = this.boxElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = ["#ffd700", "#ff4081", "#ff80ab", "#00f0ff", "#ffea00", "#c77dff", "#ffffff"];
    const icons = ["✨", "💖", "🎉", "⭐", "🎀", "🌸", "🎊", "💕", "🎂"];

    // 1. Central Light Flash Orb
    const flash = document.createElement("div");
    flash.className = "gift-flash-orb";
    flash.style.left = `${centerX}px`;
    flash.style.top = `${centerY}px`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    // 2. 60+ Flying Confetti & Sparkles
    for (let i = 0; i < 55; i++) {
      const p = document.createElement("div");
      p.className = "unboxing-particle";

      const isIcon = Math.random() > 0.45;
      if (isIcon) {
        p.textContent = icons[Math.floor(Math.random() * icons.length)];
        p.style.fontSize = `${16 + Math.random() * 20}px`;
      } else {
        const sizeW = 8 + Math.random() * 10;
        const sizeH = 12 + Math.random() * 14;
        p.style.width = `${sizeW}px`;
        p.style.height = `${sizeH}px`;
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = Math.random() > 0.6 ? "50%" : "3px";
        p.style.boxShadow = `0 0 10px ${colors[Math.floor(Math.random() * colors.length)]}`;
      }

      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;

      // Explosive upward fountain physics
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4; // upward spread
      const velocity = 140 + Math.random() * 220;
      const tx = Math.cos(angle) * velocity * (0.8 + Math.random() * 0.6);
      const ty = Math.sin(angle) * velocity - (60 + Math.random() * 80);
      const rot = (Math.random() - 0.5) * 720;
      const duration = 0.7 + Math.random() * 0.5;

      p.style.transition = `all ${duration}s cubic-bezier(0.12, 0.85, 0.32, 1)`;
      document.body.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${Math.random() * 1.4 + 0.6})`;
        p.style.opacity = "0";
      });

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, duration * 1000 + 100);
    }
  }
}

window.GiftBoxController = GiftBoxController;
