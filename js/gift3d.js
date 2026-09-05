/**
 * 3D Gift Box Animation Controller
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
        const rotateY = (x / rect.width) * 20;
        const rotateX = -(y / rect.height) * 20;
        const gift3d = this.boxElement.querySelector(".gift3d");
        if (gift3d) {
          gift3d.style.transform = `rotateX(${rotateX - 10}deg) rotateY(${rotateY + 20}deg)`;
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

    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playChime();
    }

    this.boxElement.classList.add("opening");

    setTimeout(() => {
      this.boxElement.classList.add("opened");
      this.spawnBoxParticles();
      
      if (window.soundEngine) {
        window.soundEngine.playBackgroundMusic();
      }
    }, 600);

    setTimeout(() => {
      if (this.onOpened) {
        this.onOpened();
      }
    }, 2200);
  }

  spawnBoxParticles() {
    const rect = this.boxElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const colors = ["#ff4d88", "#ffb703", "#8338ec", "#3a86ff", "#fb5607", "#06d6a0", "#ffd166"];
    const emojis = ["✨", "💖", "🎉", "⭐", "🎈", "🌸", "🍰"];

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("div");
      particle.className = "box-sparkle-particle";
      
      if (Math.random() > 0.5) {
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.fontSize = `${14 + Math.random() * 16}px`;
      } else {
        particle.style.width = `${6 + Math.random() * 8}px`;
        particle.style.height = `${6 + Math.random() * 8}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      }

      particle.style.position = "fixed";
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "9999";

      const angle = (Math.PI * 2 * i) / 35 + (Math.random() - 0.5) * 0.5;
      const distance = 80 + Math.random() * 160;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 80;

      particle.style.transition = "all 1.2s cubic-bezier(0.12, 0.8, 0.32, 1)";
      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${tx}px, ${ty}px) scale(${Math.random() * 1.5 + 0.5}) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = "0";
      });

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 1300);
    }
  }
}

window.GiftBoxController = GiftBoxController;
