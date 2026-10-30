// Pixel Art Sprite & Scenery Generator for Halcón del Cerro de Oaxaca

export interface FalconSprites {
  frames: HTMLCanvasElement[];
  width: number;
  height: number;
}

// 16x13 pixel falcon template for authentic retro look
// Palette:
// . = transparent
// B = Dark brown / Bark contour (#331b0e)
// M = Mid brown plumage (#663a1e)
// L = Light feather brown (#9c5b2d)
// W = Cream / white breast (#fbf7ee)
// G = Feather shadow / ochre (#d4a373)
// Y = Golden beak & eye ring (#f59e0b)
// D = Deep beak tip / pupil (#111827)
// T = Talon yellow (#d97706)

const FALCON_FRAME_0 = [
  '.....BBBBBB.....',
  '....BLLLLMMB....',
  '...BLLLYWMMMB...',
  '...BLLYDWMMMB...',
  '...BLLYYYYMMMB..',
  '..BLLWWWWMMMMB..',
  '.BLLMWWWWWMMMBB.',
  'BLLMMMWWWWWMMMB.',
  'BBLLMMWWWWWMMMB.',
  '.BBBLLMMMMMMMB..',
  '...BBBBBBBBMB...',
  '......TT.TT.....',
  '......TT.TT.....',
];

// Wing downstroke
const FALCON_FRAME_1 = [
  '.....BBBBBB.....',
  '....BLLLLMMB....',
  '...BLLLYWMMMB...',
  '...BLLYDWMMMB...',
  '...BLLYYYYMMMB..',
  '..BLLWWWWMMMMB..',
  '.BLLMWWWWWMMMBB.',
  'BLLMMMWWWWWMMMB.',
  '.BBBMMWWWWWMMMB.',
  '..BLLMMMMMMMB...',
  '...BLLBBBBBB....',
  '....TT..TT......',
  '....TT..TT......',
];

// Wing upstroke
const FALCON_FRAME_2 = [
  '...BBB..........',
  '..BLLLB.BBBB....',
  '.BLLLMBBLLMMB...',
  'BLLLMYWMMMMMB...',
  'BLLMYDWMMMMMB...',
  'BLLYYYYMMMMMMB..',
  '.BLLWWWWMMMMMB..',
  '.BLLMWWWWWMMBB..',
  '..BBMMWWWWWMMB..',
  '...BBBMMMMMMB...',
  '.....BBBBBBB....',
  '......TT.TT.....',
  '......TT.TT.....',
];

const COLOR_MAP: Record<string, string> = {
  B: '#2a160c',
  M: '#6b3819',
  L: '#9d582b',
  W: '#fffbf0',
  G: '#cfa276',
  Y: '#f59e0b',
  D: '#0f172a',
  T: '#d97706',
};

export function createFalconSprites(pixelScale = 3): FalconSprites {
  const framesData = [FALCON_FRAME_0, FALCON_FRAME_1, FALCON_FRAME_2];
  const frames: HTMLCanvasElement[] = [];

  const rawWidth = FALCON_FRAME_0[0].length;
  const rawHeight = FALCON_FRAME_0.length;
  const width = rawWidth * pixelScale;
  const height = rawHeight * pixelScale;

  for (const frameMap of framesData) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.imageSmoothingEnabled = false;

    for (let r = 0; r < frameMap.length; r++) {
      const line = frameMap[r];
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char !== '.' && COLOR_MAP[char]) {
          ctx.fillStyle = COLOR_MAP[char];
          ctx.fillRect(c * pixelScale, r * pixelScale, pixelScale, pixelScale);
        }
      }
    }
    frames.push(canvas);
  }

  return { frames, width, height };
}

// Draw realistic rustic brown wooden stick / post ("palitos cafecitos")
export function drawWoodenPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isTop: boolean
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Main post body colors
  const woodBase = '#6b3c1b';
  const woodDark = '#48240f';
  const woodBorder = '#2b1406';
  const woodLight = '#925327';
  const woodHighlight = '#b06b3a';

  // Fill base
  ctx.fillStyle = woodBase;
  ctx.fillRect(x, y, width, height);

  // Pixel vertical bark lines
  ctx.fillStyle = woodDark;
  ctx.fillRect(x + 3, y, 4, height);
  ctx.fillRect(x + Math.floor(width * 0.45), y, 3, height);
  ctx.fillRect(x + width - 7, y, 4, height);

  // Wood highlights (grain)
  ctx.fillStyle = woodLight;
  ctx.fillRect(x + 8, y, 4, height);
  ctx.fillRect(x + Math.floor(width * 0.6), y, 5, height);

  ctx.fillStyle = woodHighlight;
  ctx.fillRect(x + 13, y, 2, height);

  // Wooden knots
  const knotY1 = isTop ? y + height - 50 : y + 45;
  const knotY2 = isTop ? y + height - 120 : y + 130;

  [knotY1, knotY2].forEach((ky) => {
    if (ky > y && ky < y + height - 20) {
      ctx.fillStyle = woodBorder;
      ctx.fillRect(x + Math.floor(width * 0.35), ky, 12, 10);
      ctx.fillStyle = woodDark;
      ctx.fillRect(x + Math.floor(width * 0.35) + 2, ky + 2, 8, 6);
      ctx.fillStyle = woodHighlight;
      ctx.fillRect(x + Math.floor(width * 0.35) + 3, ky + 3, 3, 2);
    }
  });

  // Outer border
  ctx.fillStyle = woodBorder;
  ctx.fillRect(x, y, 3, height);
  ctx.fillRect(x + width - 3, y, 3, height);

  // Cap at the end of the post facing the bird's flight gap
  const capHeight = 22;
  const capOverhang = 6;
  const capX = x - capOverhang;
  const capWidth = width + capOverhang * 2;
  const capY = isTop ? y + height - capHeight : y;

  // Cap border
  ctx.fillStyle = woodBorder;
  ctx.fillRect(capX, capY, capWidth, capHeight);

  // Cap main fill
  ctx.fillStyle = woodLight;
  ctx.fillRect(capX + 3, capY + 3, capWidth - 6, capHeight - 6);

  // Cap grain rings / rings of the cut timber
  ctx.fillStyle = woodDark;
  ctx.fillRect(capX + 6, capY + 5, capWidth - 12, 3);
  ctx.fillStyle = woodHighlight;
  ctx.fillRect(capX + 6, capY + capHeight - 8, capWidth - 12, 3);

  ctx.restore();
}

// Background: Cerro de Oaxaca (Monte Albán / Fortín with agaves and warm palette)
export class OaxacaBackground {
  private clouds: { x: number; y: number; speed: number; scale: number }[] = [];
  private mountainOffset = 0;
  private hillOffset = 0;
  private groundOffset = 0;

  constructor() {
    this.clouds = [
      { x: 50, y: 35, speed: 0.15, scale: 1.2 },
      { x: 220, y: 70, speed: 0.1, scale: 0.9 },
      { x: 380, y: 25, speed: 0.2, scale: 1.4 },
      { x: 520, y: 85, speed: 0.12, scale: 1.0 },
    ];
  }

  public update(gameSpeed: number) {
    this.mountainOffset = (this.mountainOffset + gameSpeed * 0.15) % 800;
    this.hillOffset = (this.hillOffset + gameSpeed * 0.45) % 800;
    this.groundOffset = (this.groundOffset + gameSpeed) % 40;

    for (const c of this.clouds) {
      c.x -= c.speed;
      if (c.x < -120) {
        c.x = 850;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, width: number, height: number, groundHeight: number) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. Sky Gradient - Warm Oaxaca Afternoon (rich blue into terracotta peach)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height - groundHeight);
    skyGrad.addColorStop(0, '#3a7bd5');
    skyGrad.addColorStop(0.35, '#689dd8');
    skyGrad.addColorStop(0.7, '#f4a261');
    skyGrad.addColorStop(1, '#e76f51');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Pixel Sun with soft golden halo
    const sunX = width * 0.78;
    const sunY = height * 0.18;
    ctx.fillStyle = 'rgba(255, 235, 160, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffef9f';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();

    // 3. Pixel Clouds
    for (const c of this.clouds) {
      this.drawPixelCloud(ctx, c.x, c.y, c.scale);
    }

    // 4. Distant Mountains (Monte Albán & Sierra Norte silhouettes - deep purple/indigo)
    this.drawDistantMountains(ctx, width, height - groundHeight - 60);

    // 5. Midground: Cerro de Oaxaca / Cerro del Fortín with green vegetation & agaves
    this.drawCerroOaxaca(ctx, width, height - groundHeight);

    // 6. Foreground Ground (Tierra roja / adobes / piedras)
    this.drawGround(ctx, width, height, groundHeight);

    ctx.restore();
  }

  private drawPixelCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    const s = 4 * scale;
    // Cloud pixel blocks
    ctx.fillRect(x + 3 * s, y, 6 * s, 3 * s);
    ctx.fillRect(x + 1 * s, y + 2 * s, 11 * s, 3 * s);
    ctx.fillRect(x, y + 4 * s, 14 * s, 3 * s);
    ctx.fillStyle = 'rgba(240, 230, 240, 0.85)';
    ctx.fillRect(x + 1 * s, y + 6 * s, 12 * s, 2 * s);
    ctx.restore();
  }

  private drawDistantMountains(ctx: CanvasRenderingContext2D, width: number, baseY: number) {
    ctx.save();
    ctx.fillStyle = '#4a3f6b';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 90);

    // Mountain peaks using repetitive silhouette with offset
    const peakInterval = 140;
    const totalPeaks = Math.ceil(width / peakInterval) + 3;

    for (let i = -1; i < totalPeaks; i++) {
      const peakX = i * peakInterval - (this.mountainOffset % peakInterval);
      const peakY = baseY - (i % 2 === 0 ? 55 : 35);
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + peakInterval * 0.5, baseY + 20);
    }

    ctx.lineTo(width, baseY + 120);
    ctx.lineTo(0, baseY + 120);
    ctx.closePath();
    ctx.fill();

    // Secondary lighter ridge
    ctx.fillStyle = '#654f73';
    ctx.beginPath();
    ctx.moveTo(0, baseY + 110);
    for (let i = -1; i < totalPeaks; i++) {
      const peakX = i * peakInterval * 0.85 - ((this.mountainOffset * 1.3) % (peakInterval * 0.85));
      const peakY = baseY - 20 + ((i % 3) * 12);
      ctx.lineTo(peakX, peakY);
      ctx.lineTo(peakX + 60, baseY + 40);
    }
    ctx.lineTo(width, baseY + 120);
    ctx.lineTo(0, baseY + 120);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawCerroOaxaca(ctx: CanvasRenderingContext2D, width: number, groundY: number) {
    ctx.save();

    // Earthy Oaxacan hill (terracotta/clay & agave olive greens)
    ctx.fillStyle = '#476241';
    ctx.beginPath();
    ctx.moveTo(0, groundY);

    const hillInterval = 180;
    const totalHills = Math.ceil(width / hillInterval) + 3;

    for (let i = -1; i < totalHills; i++) {
      const hx = i * hillInterval - (this.hillOffset % hillInterval);
      const hy = groundY - 50 - (Math.sin(i * 1.5) * 20);
      ctx.quadraticCurveTo(hx + hillInterval * 0.5, hy - 25, hx + hillInterval, groundY);
    }
    ctx.lineTo(width, groundY);
    ctx.lineTo(0, groundY);
    ctx.closePath();
    ctx.fill();

    // Terracotta earth bands
    ctx.fillStyle = '#804831';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let i = -1; i < totalHills; i++) {
      const hx = i * hillInterval - (this.hillOffset % hillInterval);
      ctx.quadraticCurveTo(hx + 60, groundY - 20, hx + hillInterval, groundY);
    }
    ctx.lineTo(width, groundY);
    ctx.lineTo(0, groundY);
    ctx.closePath();
    ctx.fill();

    // Draw Agaves (Maguey de Oaxaca) along the ridge
    ctx.fillStyle = '#2f5742';
    for (let i = -1; i < totalHills * 2; i++) {
      const ax = i * 90 - ((this.hillOffset * 1.1) % 90);
      const ay = groundY - 6;
      this.drawAgave(ctx, ax, ay);
    }

    ctx.restore();
  }

  private drawAgave(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Pixel agave leaves (rosette shape with spiked blades)
    ctx.save();
    ctx.fillStyle = '#3a6b52';
    // Center stem (quiote)
    ctx.fillRect(x, y - 18, 2, 18);
    ctx.fillRect(x - 2, y - 20, 6, 3);

    // Leaves
    ctx.fillRect(x - 8, y - 6, 18, 3);
    ctx.fillRect(x - 6, y - 10, 3, 6);
    ctx.fillRect(x + 5, y - 10, 3, 6);
    ctx.fillRect(x - 12, y - 3, 5, 3);
    ctx.fillRect(x + 9, y - 3, 5, 3);

    // Base highlight
    ctx.fillStyle = '#528a6c';
    ctx.fillRect(x - 3, y - 4, 8, 4);
    ctx.restore();
  }

  private drawGround(ctx: CanvasRenderingContext2D, width: number, height: number, groundHeight: number) {
    ctx.save();
    const groundY = height - groundHeight;

    // Top grass / moss band
    ctx.fillStyle = '#557a46';
    ctx.fillRect(0, groundY, width, 12);

    // Grass blades
    ctx.fillStyle = '#739e5b';
    for (let x = -20; x < width + 20; x += 10) {
      const gx = x - this.groundOffset;
      ctx.fillRect(gx, groundY - 4, 3, 5);
      ctx.fillRect(gx + 4, groundY - 2, 2, 3);
    }

    // Dirt base
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, groundY + 12, width, groundHeight - 12);

    // Cobblestones / clay bricks
    ctx.fillStyle = '#653e1b';
    for (let row = 0; row < 3; row++) {
      const rowY = groundY + 18 + row * 16;
      const rowOffset = (row % 2) * 16;
      for (let col = -30; col < width + 30; col += 32) {
        const bx = col - this.groundOffset + rowOffset;
        ctx.fillRect(bx, rowY, 26, 10);
        // Highlight top of brick
        ctx.fillStyle = '#9e6938';
        ctx.fillRect(bx + 1, rowY + 1, 24, 2);
        ctx.fillStyle = '#653e1b';
      }
    }

    // Bottom dark bedrock
    ctx.fillStyle = '#3c210e';
    ctx.fillRect(0, height - 12, width, 12);

    ctx.restore();
  }
}
