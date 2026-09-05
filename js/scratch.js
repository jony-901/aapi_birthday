/**
 * HTML5 Canvas Scratch-Off Cards Engine
 */
class ScratchCard {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.coverColor = options.coverColor || "#c0c0c0";
    this.onRevealed = options.onRevealed;
    this.isDrawing = false;
    this.isRevealed = false;
    this.brushRadius = options.brushRadius || 26;
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.drawCover();
    this.bindEvents();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth || 280;
    this.canvas.height = parent.clientHeight || 170;
  }

  drawCover() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Metallic glitter gradient
    const grad = this.ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#d8d8d8");
    grad.addColorStop(0.3, "#f4f4f4");
    grad.addColorStop(0.5, "#a8a8a8");
    grad.addColorStop(0.7, "#eaeaea");
    grad.addColorStop(1, "#bfbfbf");

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Sparkle text
    this.ctx.fillStyle = "#555555";
    this.ctx.font = "bold 14px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("✨ Scratch Here to Reveal ✨", w / 2, h / 2);
  }

  bindEvents() {
    const start = (e) => {
      if (this.isRevealed) return;
      this.isDrawing = true;
      this.scratch(e);
    };

    const move = (e) => {
      if (!this.isDrawing || this.isRevealed) return;
      this.scratch(e);
    };

    const stop = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.checkPercentage();
    };

    this.canvas.addEventListener("mousedown", start);
    this.canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) start(e.touches[0]);
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.touches && e.touches[0]) move(e.touches[0]);
    }, { passive: false });

    window.addEventListener("touchend", stop);
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.pageX || 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.pageY || 0);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  scratch(e) {
    const pos = this.getPos(e);
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, this.brushRadius, 0, Math.PI * 2, false);
    this.ctx.fill();

    if (window.soundEngine && Math.random() > 0.4) {
      window.soundEngine.playScratch();
    }
  }

  checkPercentage() {
    if (this.isRevealed) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w <= 0 || h <= 0) return;
    
    try {
      const imgData = this.ctx.getImageData(0, 0, w, h);
      let transparentPixels = 0;
      const totalPixels = imgData.data.length / 4;

      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = (transparentPixels / (totalPixels / 4)) * 100;
      if (percent > 35) {
        this.revealAll();
      }
    } catch (e) {
      console.warn("Scratch check err:", e);
    }
  }

  revealAll() {
    this.isRevealed = true;
    this.canvas.style.transition = "opacity 0.6s ease";
    this.canvas.style.opacity = "0";
    setTimeout(() => {
      this.canvas.style.display = "none";
      const card = this.canvas.closest(".coupon-card");
      if (card) {
        card.classList.add("revealed");
        const stamp = card.querySelector(".coupon-stamp");
        if (stamp) stamp.classList.add("stamped");
      }
      if (window.soundEngine) {
        window.soundEngine.playChime();
      }
      if (this.onRevealed) this.onRevealed();
    }, 600);
  }
}

window.ScratchCard = ScratchCard;
