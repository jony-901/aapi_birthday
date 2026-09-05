/**
 * Fullscreen Fireworks & Sky Lanterns Engine
 */
class FireworksEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.fireworks = [];
    this.particles = [];
    this.lanterns = [];
    this.isRunning = false;
    this.autoTimer = null;
    this.colors = [
      "#ff1493", "#ff69b4", "#00ffff", "#ffd700", 
      "#ff4500", "#7fff00", "#9932cc", "#ffffff"
    ];
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Click canvas to trigger firework
    this.canvas.addEventListener("click", (e) => {
      this.createFirework(e.clientX, e.clientY);
      if (window.soundEngine) window.soundEngine.playFirework();
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();

    // Periodic automatic firework bursts
    this.autoTimer = setInterval(() => {
      if (!this.isRunning) return;
      const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
      const y = Math.random() * (this.canvas.height * 0.5) + 60;
      this.createFirework(x, y);
      if (window.soundEngine && Math.random() > 0.4) {
        window.soundEngine.playFirework();
      }
    }, 900);
  }

  stop() {
    this.isRunning = false;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  createFirework(targetX, targetY) {
    const startX = targetX + (Math.random() * 80 - 40);
    const startY = this.canvas.height;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    this.fireworks.push({
      x: startX,
      y: startY,
      targetX,
      targetY,
      color,
      speed: 12 + Math.random() * 4,
      angle: Math.atan2(targetY - startY, targetX - startX),
      distanceToTarget: Math.hypot(targetX - startX, targetY - startY),
      distanceTraveled: 0,
      trail: []
    });
  }

  explode(x, y, color) {
    const isHeart = Math.random() > 0.6;
    const count = isHeart ? 50 : 65;

    for (let i = 0; i < count; i++) {
      let vx, vy;
      if (isHeart) {
        // Heart curve parametric formula: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
        const t = (Math.PI * 2 * i) / count;
        const scale = 0.22 + Math.random() * 0.08;
        vx = scale * (16 * Math.pow(Math.sin(t), 3));
        vy = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      }

      this.particles.push({
        x,
        y,
        vx,
        vy,
        color,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012,
        gravity: 0.06,
        friction: 0.96
      });
    }
  }

  addLantern(wishText = "") {
    const x = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
    this.lanterns.push({
      x,
      y: this.canvas.height + 40,
      targetSpeedY: -(0.8 + Math.random() * 0.6),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03,
      size: 26 + Math.random() * 10,
      text: wishText,
      alpha: 1
    });

    if (window.soundEngine) window.soundEngine.playChime();
  }

  loop() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.loop());

    // Fade trail background
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = "lighter";

    // Update fireworks rockets
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      const vx = Math.cos(fw.angle) * fw.speed;
      const vy = Math.sin(fw.angle) * fw.speed;

      fw.distanceTraveled = Math.hypot(fw.x - (fw.targetX - Math.cos(fw.angle) * fw.distanceToTarget), fw.y - (fw.targetY - Math.sin(fw.angle) * fw.distanceToTarget));

      fw.x += vx;
      fw.y += vy;

      // Rocket trail
      this.ctx.beginPath();
      this.ctx.arc(fw.x, fw.y, 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = fw.color;
      this.ctx.fill();

      if (fw.y <= fw.targetY || Math.hypot(fw.targetX - fw.x, fw.targetY - fw.y) < 15) {
        this.explode(fw.targetX, fw.targetY, fw.color);
        this.fireworks.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update lanterns
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.y += l.targetSpeedY;
      l.wobbleOffset += l.wobbleSpeed;
      const currentX = l.x + Math.sin(l.wobbleOffset) * 12;

      // Draw glowing lantern
      this.ctx.save();
      this.ctx.globalAlpha = l.alpha;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#ff9e00";

      // Lantern body
      this.ctx.fillStyle = "rgba(255, 170, 50, 0.9)";
      this.ctx.beginPath();
      this.ctx.roundRect(currentX - l.size / 2, l.y, l.size, l.size * 1.3, 6);
      this.ctx.fill();

      // Inner flame glow
      this.ctx.fillStyle = "#fff8db";
      this.ctx.beginPath();
      this.ctx.arc(currentX, l.y + l.size * 0.7, l.size * 0.25, 0, Math.PI * 2);
      this.ctx.fill();

      // Wish text
      if (l.text) {
        this.ctx.font = "12px sans-serif";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "center";
        this.ctx.fillText(l.text, currentX, l.y - 8);
      }

      this.ctx.restore();

      if (l.y < -100) {
        this.lanterns.splice(i, 1);
      }
    }
  }
}

window.FireworksEngine = FireworksEngine;
