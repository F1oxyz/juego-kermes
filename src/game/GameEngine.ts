import { createFalconSprites, drawWoodenPost, OaxacaBackground, type FalconSprites } from './pixelArt';
import { soundManager } from '../utils/audio';

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;

  // Virtual game dimensions (400 x 640 logical pixels)
  public readonly V_WIDTH = 400;
  public readonly V_HEIGHT = 640;
  public readonly GROUND_HEIGHT = 90;

  // Falcon state
  private falconX = 90;
  private falconY = 260;
  private falconVy = 0;
  private falconRotation = 0;
  private animFrame = 0;
  private animTimer = 0;

  // Physics constants (gentler, easier, delta-time normalized to 60fps)
  private readonly GRAVITY = 0.30;
  private readonly JUMP_STRENGTH = -6.3;
  private readonly MAX_FALL_SPEED = 7.8;
  private readonly PIPE_SPEED = 2.05;
  private readonly PIPE_GAP = 168;
  private readonly PIPE_SPACING = 235;

  // Game state
  private isRunning = false;
  private isDead = false;
  private isWaiting = false;
  private waitTimer = 0;
  private lastFlapTime = 0;
  private score = 0;
  private pipes: Pipe[] = [];
  private particles: Particle[] = [];

  private background: OaxacaBackground;
  private falconSprites: FalconSprites;
  private animationId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.background = new OaxacaBackground();
    this.falconSprites = createFalconSprites(2.6);
  }

  public prepare() {
    this.stop();
    this.reset();
    this.isRunning = true;
    this.isDead = false;
    this.isWaiting = true;
    this.waitTimer = 0;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop);
  }

  public start() {
    this.prepare();
  }

  public flap() {
    if (!this.isRunning || this.isDead) return;

    const now = performance.now();
    if (now - this.lastFlapTime < 110) return;
    this.lastFlapTime = now;

    if (this.isWaiting) {
      this.isWaiting = false;
      this.lastTime = now;
    }

    this.falconVy = this.JUMP_STRENGTH;
    this.falconRotation = -0.45; // ~ -25 deg
    this.animFrame = 2; // Upstroke wing frame
    soundManager.playFlap();

    // Spawn tiny feather flutter particles
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.falconX + 10,
        y: this.falconY + 16,
        vx: (Math.random() - 0.5) * 1.5 - 1,
        vy: (Math.random() - 0.5) * 1.5 + 1,
        size: Math.floor(Math.random() * 3) + 2,
        color: Math.random() > 0.5 ? '#b87333' : '#fffbf0',
        alpha: 0.9,
        life: 25,
      });
    }
  }

  public reset() {
    this.falconY = 260;
    this.falconVy = 0;
    this.falconRotation = 0;
    this.score = 0;
    this.callbacks.onScoreUpdate(0);
    this.isDead = false;
    this.pipes = [];
    this.particles = [];

    // Pre-populate initial pipes spaced comfortably further right
    const firstPipeX = this.V_WIDTH + 120;
    this.createPipe(firstPipeX);
    this.createPipe(firstPipeX + this.PIPE_SPACING);
  }

  public stop() {
    this.isRunning = false;
    this.isWaiting = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private createPipe(x: number) {
    const playArea = this.V_HEIGHT - this.GROUND_HEIGHT - this.PIPE_GAP - 120;
    const minHeight = 60;
    const topHeight = minHeight + Math.floor(Math.random() * playArea);
    const bottomY = topHeight + this.PIPE_GAP;

    this.pipes.push({
      x,
      topHeight,
      bottomY,
      passed: false,
    });
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const dt = this.lastTime > 0 ? Math.min((currentTime - this.lastTime) / 16.667, 2.5) : 1;
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    if (this.isRunning) {
      this.animationId = requestAnimationFrame(this.loop);
    }
  };

  private update(dt: number) {
    if (this.isWaiting) {
      // Gentle idle hover while waiting for first tap
      this.waitTimer += dt * 0.08;
      this.falconY = 260 + Math.sin(this.waitTimer) * 7;
      this.falconRotation = 0;

      this.animTimer += dt;
      if (this.animTimer > 7) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
      }

      this.background.update(this.PIPE_SPEED * 0.45 * dt);
      return;
    }

    // 1. Update falcon physics
    this.falconVy += this.GRAVITY * dt;
    if (this.falconVy > this.MAX_FALL_SPEED) {
      this.falconVy = this.MAX_FALL_SPEED;
    }
    this.falconY += this.falconVy * dt;

    // Smooth rotation: tilt upwards on jump, dive when falling
    if (this.falconVy < 0) {
      this.falconRotation = Math.max(this.falconRotation - 0.08 * dt, -0.45);
    } else {
      this.falconRotation = Math.min(this.falconRotation + 0.038 * dt, 1.1); // dives down
    }

    // Ceiling bound
    if (this.falconY < 0) {
      this.falconY = 0;
      this.falconVy = 0;
    }

    // Wing flap animation frame cycling
    this.animTimer += dt;
    if (this.animTimer > 5) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 3;
    }

    // 2. Check ground collision
    const groundY = this.V_HEIGHT - this.GROUND_HEIGHT;
    const falconHeight = this.falconSprites.height;
    if (this.falconY + falconHeight >= groundY) {
      this.falconY = groundY - falconHeight;
      this.triggerDeath();
      return;
    }

    if (!this.isDead) {
      // 3. Move & manage pipes
      this.background.update(this.PIPE_SPEED * dt);

      const pipeWidth = 58;
      for (let i = 0; i < this.pipes.length; i++) {
        const pipe = this.pipes[i];
        pipe.x -= this.PIPE_SPEED * dt;

        // Check score trigger
        if (!pipe.passed && pipe.x + pipeWidth < this.falconX) {
          pipe.passed = true;
          this.score += 1;
          soundManager.playScore();
          this.callbacks.onScoreUpdate(this.score);
        }

        // Collision check
        if (this.checkCollision(pipe, pipeWidth)) {
          this.triggerDeath();
          return;
        }
      }

      // Recycle offscreen pipes
      if (this.pipes.length > 0 && this.pipes[0].x < -pipeWidth - 10) {
        this.pipes.shift();
        const lastPipe = this.pipes[this.pipes.length - 1];
        const nextX = lastPipe ? lastPipe.x + this.PIPE_SPACING : this.V_WIDTH + 50;
        this.createPipe(nextX);
      }
    }

    // 4. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 25);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private checkCollision(pipe: Pipe, pipeWidth: number): boolean {
    const falconW = this.falconSprites.width;
    const falconH = this.falconSprites.height;

    // Forgiving hitbox (padding 8px on sides, 7px top/bottom)
    const hitBox = {
      x: this.falconX + 8,
      y: this.falconY + 7,
      w: falconW - 16,
      h: falconH - 14,
    };

    // Check top stick
    const inPipeX = hitBox.x + hitBox.w > pipe.x && hitBox.x < pipe.x + pipeWidth;
    if (inPipeX) {
      if (hitBox.y < pipe.topHeight) {
        return true;
      }
      if (hitBox.y + hitBox.h > pipe.bottomY) {
        return true;
      }
    }

    return false;
  }

  private triggerDeath() {
    if (this.isDead) return;
    this.isDead = true;
    soundManager.playHit();

    // Death explosion of feathers
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.falconX + 15,
        y: this.falconY + 15,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        size: Math.floor(Math.random() * 4) + 3,
        color: ['#b87333', '#6b3819', '#fffbf0', '#f59e0b'][Math.floor(Math.random() * 4)],
        alpha: 1,
        life: 35,
      });
    }

    // Stop and notify after a short impact delay
    setTimeout(() => {
      this.stop();
      this.callbacks.onGameOver(this.score);
    }, 600);
  }

  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // 1. Draw Oaxaca Cerro background
    this.background.draw(ctx, this.V_WIDTH, this.V_HEIGHT, this.GROUND_HEIGHT);

    // 2. Draw Brown wooden sticks / posts ("palitos cafecitos")
    const pipeWidth = 58;
    for (const pipe of this.pipes) {
      // Top post
      drawWoodenPost(ctx, pipe.x, 0, pipeWidth, pipe.topHeight, true);
      // Bottom post
      const bottomHeight = this.V_HEIGHT - this.GROUND_HEIGHT - pipe.bottomY;
      drawWoodenPost(ctx, pipe.x, pipe.bottomY, pipeWidth, bottomHeight, false);
    }

    // 3. Draw Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    // 4. Draw Falcon (Halcón)
    ctx.save();
    ctx.translate(this.falconX + this.falconSprites.width / 2, this.falconY + this.falconSprites.height / 2);
    ctx.rotate(this.falconRotation);

    const frameCanvas = this.falconSprites.frames[this.animFrame] || this.falconSprites.frames[0];
    ctx.drawImage(
      frameCanvas,
      -this.falconSprites.width / 2,
      -this.falconSprites.height / 2,
      this.falconSprites.width,
      this.falconSprites.height
    );
    ctx.restore();

    // 5. In-game Score Display (Pixel HUD at top center)
    if (this.isRunning && !this.isDead) {
      this.drawScoreHUD(ctx, this.score);
      if (this.isWaiting) {
        this.drawWaitingOverlay(ctx);
      }
    }
  }

  private drawWaitingOverlay(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const boxW = 300;
    const boxH = 115;
    const boxX = (this.V_WIDTH - boxW) / 2;
    const boxY = 340;

    // Drop shadow
    ctx.fillStyle = '#0f0803';
    ctx.fillRect(boxX + 5, boxY + 5, boxW, boxH);

    // Main card background
    ctx.fillStyle = 'rgba(43, 20, 6, 0.92)';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Gold pixel border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.textAlign = 'center';

    // Bouncing prompt text
    const bounceY = Math.sin(this.waitTimer * 1.6) * 3;

    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('👆 TOCA LA PANTALLA', this.V_WIDTH / 2, boxY + 42 + bounceY);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('PARA COMENZAR', this.V_WIDTH / 2, boxY + 72 + bounceY);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#d6d3d1';
    ctx.fillText('(O PRESIONA ESPACIO)', this.V_WIDTH / 2, boxY + 98);

    ctx.restore();
  }

  private drawScoreHUD(ctx: CanvasRenderingContext2D, score: number) {
    ctx.save();
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';

    const text = String(score);
    const x = this.V_WIDTH / 2;
    const y = 75;

    // Pixel shadow / outline
    ctx.fillStyle = '#1c1917';
    ctx.fillText(text, x + 3, y + 3);
    ctx.fillText(text, x - 2, y + 2);
    ctx.fillText(text, x + 2, y - 2);

    // Glowing main score
    ctx.fillStyle = score >= 11 ? '#4ade80' : score >= 5 ? '#facc15' : '#ffffff';
    ctx.fillText(text, x, y);

    // Subtle helper badge
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    if (score < 5) {
      ctx.fillText(`FALTAN ${5 - score} PTS PARA CUPÓN`, x, y + 28);
    } else if (score <= 10) {
      ctx.fillText(`¡CUPÓN GANADO! (+${11 - score} PARA AMBOS)`, x, y + 28);
    } else {
      ctx.fillStyle = '#86efac';
      ctx.fillText('¡¡AMBOS CUPONES GANADOS!!', x, y + 28);
    }

    ctx.restore();
  }
}
