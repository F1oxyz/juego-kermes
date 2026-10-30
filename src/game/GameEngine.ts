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

  // Physics constants
  private readonly GRAVITY = 0.36;
  private readonly JUMP_STRENGTH = -7.2;
  private readonly MAX_FALL_SPEED = 9.5;
  private readonly PIPE_SPEED = 2.3;
  private readonly PIPE_GAP = 145;
  private readonly PIPE_SPACING = 210;

  // Game state
  private isRunning = false;
  private isDead = false;
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

  public start() {
    this.reset();
    this.isRunning = true;
    this.isDead = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    this.flap();
  }

  public flap() {
    if (!this.isRunning || this.isDead) return;
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

    // Pre-populate initial pipes spaced comfortably
    const firstPipeX = this.V_WIDTH + 80;
    this.createPipe(firstPipeX);
    this.createPipe(firstPipeX + this.PIPE_SPACING);
  }

  public stop() {
    this.isRunning = false;
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

    this.update();
    this.render();

    this.lastTime = currentTime;
    this.animationId = requestAnimationFrame(this.loop);
  };

  private update() {
    // 1. Update falcon physics
    this.falconVy += this.GRAVITY;
    if (this.falconVy > this.MAX_FALL_SPEED) {
      this.falconVy = this.MAX_FALL_SPEED;
    }
    this.falconY += this.falconVy;

    // Smooth rotation: tilt upwards on jump, dive when falling
    if (this.falconVy < 0) {
      this.falconRotation = Math.max(this.falconRotation - 0.08, -0.45);
    } else {
      this.falconRotation = Math.min(this.falconRotation + 0.045, 1.2); // dives down
    }

    // Ceiling bound
    if (this.falconY < 0) {
      this.falconY = 0;
      this.falconVy = 0;
    }

    // Wing flap animation frame cycling
    this.animTimer++;
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
      this.background.update(this.PIPE_SPEED);

      const pipeWidth = 58;
      for (let i = 0; i < this.pipes.length; i++) {
        const pipe = this.pipes[i];
        pipe.x -= this.PIPE_SPEED;

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
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.alpha = p.life / 25;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private checkCollision(pipe: Pipe, pipeWidth: number): boolean {
    const falconW = this.falconSprites.width;
    const falconH = this.falconSprites.height;

    // Forgiving hitbox (padding 7px on sides, 5px top/bottom)
    const hitBox = {
      x: this.falconX + 6,
      y: this.falconY + 5,
      w: falconW - 12,
      h: falconH - 10,
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
    }
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
