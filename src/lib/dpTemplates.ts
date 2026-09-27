import type { DpState, TemplateId } from '../state/types';

export const DP_SIZE = 1080;

export const TEMPLATES: { id: TemplateId; name: string; colors: [string, string] }[] = [
  { id: 'royal', name: 'Royal Announce', colors: ['#5B2C8E', '#FF6B35'] },
  { id: 'festival', name: 'Festival Vibes', colors: ['#6B21A8', '#FF1493'] },
  { id: 'night', name: 'Night Event', colors: ['#0A0A1A', '#7B2FBE'] },
  { id: 'polaroid', name: 'Creative Frame', colors: ['#0B3C49', '#F77F00'] },
];

export const DP_FONTS = ['700 64px Oswald', '400 64px "Bebas Neue"', '700 64px Caveat', '800 64px Inter', '500 64px Inter'];

export interface DpContent {
  eventName: string;
  category: string;
  dateText: string;
  placeText: string;
  dp: DpState;
  photo: HTMLImageElement | null;
  qr: HTMLCanvasElement | null;
}

type Ctx = CanvasRenderingContext2D;

function spacing(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

function circlePath(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

function hexPath(ctx: Ctx, cx: number, cy: number, r: number) {
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawPhoto(ctx: Ctx, content: DpContent, box: { x: number; y: number; w: number; h: number }, clip: (ctx: Ctx) => void) {
  const { photo, dp } = content;
  ctx.save();
  ctx.beginPath();
  clip(ctx);
  ctx.clip();
  ctx.fillStyle = '#d9d4ce';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  if (photo && photo.width) {
    const scale = Math.max(box.w / photo.width, box.h / photo.height) * (dp.zoom / 100);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, box.x + (box.w - dw) / 2 + dp.offsetX, box.y + (box.h - dh) / 2 + dp.offsetY, dw, dh);
  }
  ctx.restore();
}

/** Shrinks the font until the text fits on at most `maxLines` lines. Returns the lines and chosen size. */
function fitLines(ctx: Ctx, text: string, font: (size: number) => string, maxWidth: number, start: number, min: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let size = start; size >= min; size -= 2) {
    ctx.font = font(size);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxWidth)) return { lines, size };
  }
  ctx.font = font(min);
  return { lines: [text], size: min };
}

function centerText(ctx: Ctx, lines: string[], y: number, lineHeight: number) {
  lines.forEach((line, i) => ctx.fillText(line, DP_SIZE / 2, y + i * lineHeight));
  return y + (lines.length - 1) * lineHeight;
}

function namePill(ctx: Ctx, name: string, cy: number, bg: string, color: string) {
  if (!name.trim()) return;
  ctx.font = '700 38px Inter';
  spacing(ctx, 0);
  const w = Math.min(640, ctx.measureText(name).width + 80);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(DP_SIZE / 2 - w / 2, cy - 36, w, 72, 36);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(name, DP_SIZE / 2, cy + 2, 560);
  ctx.textBaseline = 'alphabetic';
}

function watermark(ctx: Ctx, color: string) {
  ctx.font = '600 24px Inter';
  spacing(ctx, 1);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.fillText('Made on ShowRave DP Studio', 48, DP_SIZE - 44);
  ctx.textAlign = 'center';
  spacing(ctx, 0);
}

function details(ctx: Ctx, content: DpContent, y: number, color: string) {
  ctx.font = '500 32px Inter';
  spacing(ctx, 0);
  ctx.fillStyle = color;
  ctx.fillText(`${content.dateText}  ·  ${content.placeText}`, DP_SIZE / 2, y, 900);
}

function royal(ctx: Ctx, c: DpContent) {
  ctx.fillStyle = '#5B2C8E';
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  const glow = ctx.createRadialGradient(540, 360, 40, 540, 360, 700);
  glow.addColorStop(0, 'rgba(255,255,255,0.18)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(260, 0); ctx.lineTo(0, 260); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(DP_SIZE, DP_SIZE); ctx.lineTo(DP_SIZE - 300, DP_SIZE); ctx.lineTo(DP_SIZE, DP_SIZE - 300); ctx.closePath(); ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = '600 30px Inter';
  spacing(ctx, 8);
  ctx.fillStyle = '#FFB38F';
  ctx.fillText(c.category.toUpperCase(), 540, 108);

  ctx.beginPath(); circlePath(ctx, 540, 380, 232); ctx.fillStyle = '#FF6B35'; ctx.fill();
  ctx.beginPath(); circlePath(ctx, 540, 380, 218); ctx.fillStyle = '#ffffff'; ctx.fill();
  drawPhoto(ctx, c, { x: 330, y: 170, w: 420, h: 420 }, (x) => circlePath(x, 540, 380, 208));
  namePill(ctx, c.dp.name, 612, '#ffffff', '#5B2C8E');

  ctx.fillStyle = '#FF6B35';
  const msg = fitLines(ctx, c.dp.message.toUpperCase(), (s) => `700 ${s}px Oswald`, 900, 104, 60, 1);
  spacing(ctx, 3);
  centerText(ctx, msg.lines, 760, msg.size);
  ctx.fillStyle = '#ffffff';
  spacing(ctx, 1);
  const name = fitLines(ctx, c.eventName.toUpperCase(), (s) => `600 ${s}px Oswald`, 760, 64, 36, 2);
  const end = centerText(ctx, name.lines, 845, name.size * 1.05);
  details(ctx, c, end + 60, 'rgba(255,255,255,0.82)');

  if (c.qr) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.roundRect(904, 40, 136, 136, 16); ctx.fill();
    ctx.drawImage(c.qr, 912, 48, 120, 120);
  }
  watermark(ctx, 'rgba(255,255,255,0.6)');
}

function festival(ctx: Ctx, c: DpContent) {
  const bg = ctx.createLinearGradient(0, 0, DP_SIZE, DP_SIZE);
  bg.addColorStop(0, '#6B21A8');
  bg.addColorStop(1, '#FF1493');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  const colors = ['#FFD600', '#ffffff', '#22D3EE', '#FF8A00'];
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 283) % DP_SIZE;
    const y = (i * 157 + (i % 7) * 61) % DP_SIZE;
    if (y > 150 && y < 640 && x > 260 && x < 820) continue;
    if (y > 660 && y < 1000 && x > 60 && x < 1020) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.85;
    if (i % 3 === 0) ctx.fillRect(-9, -4, 18, 8);
    else if (i % 3 === 1) { ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, 7); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  ctx.beginPath(); hexPath(ctx, 540, 390, 262); ctx.fillStyle = '#FFD600'; ctx.fill();
  ctx.beginPath(); hexPath(ctx, 540, 390, 246); ctx.fillStyle = '#ffffff'; ctx.fill();
  drawPhoto(ctx, c, { x: 310, y: 160, w: 460, h: 460 }, (x) => hexPath(x, 540, 390, 234));
  namePill(ctx, c.dp.name, 650, '#FFD600', '#6B21A8');

  ctx.textAlign = 'center';
  const msg = fitLines(ctx, c.dp.message.toUpperCase(), (s) => `400 ${s}px "Bebas Neue"`, 920, 150, 80, 1);
  spacing(ctx, 4);
  ctx.fillStyle = '#FFD600';
  centerText(ctx, msg.lines, 808, msg.size);
  ctx.fillStyle = '#ffffff';
  centerText(ctx, msg.lines, 802, msg.size);
  spacing(ctx, 0);
  const name = fitLines(ctx, c.eventName, (s) => `800 ${s}px Inter`, 860, 54, 34, 2);
  const end = centerText(ctx, name.lines, 880, name.size * 1.1);
  details(ctx, c, end + 56, 'rgba(255,255,255,0.9)');
  watermark(ctx, 'rgba(255,255,255,0.7)');
}

function night(ctx: Ctx, c: DpContent) {
  ctx.fillStyle = '#0A0A1A';
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  const glow = ctx.createRadialGradient(540, 330, 50, 540, 330, 620);
  glow.addColorStop(0, 'rgba(123,47,190,0.75)');
  glow.addColorStop(1, 'rgba(123,47,190,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  for (let i = 0; i < 90; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`;
    ctx.fillRect((i * 397) % DP_SIZE, (i * 211) % 560, 3, 3);
  }
  ctx.strokeStyle = 'rgba(236,72,153,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 16; i += 1) {
    ctx.beginPath(); ctx.moveTo(540, 700); ctx.lineTo(-400 + i * 118, DP_SIZE); ctx.stroke();
  }
  for (let i = 0; i < 6; i += 1) {
    const y = 700 + (i * i * 11) + i * 20;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(DP_SIZE, y); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(10,10,26,0.7)';
  ctx.fillRect(0, 700, DP_SIZE, 380);

  const ring = ctx.createLinearGradient(330, 130, 750, 550);
  ring.addColorStop(0, '#7B2FBE');
  ring.addColorStop(1, '#EC4899');
  ctx.save();
  ctx.shadowColor = '#B15CFF';
  ctx.shadowBlur = 60;
  ctx.beginPath(); circlePath(ctx, 540, 340, 214); ctx.fillStyle = ring; ctx.fill();
  ctx.restore();
  drawPhoto(ctx, c, { x: 340, y: 140, w: 400, h: 400 }, (x) => circlePath(x, 540, 340, 200));
  namePill(ctx, c.dp.name, 572, '#ffffff', '#0A0A1A');

  ctx.textAlign = 'center';
  ctx.font = '700 44px Oswald';
  spacing(ctx, 12);
  ctx.fillStyle = '#E9A8FF';
  ctx.fillText(c.dp.message.toUpperCase(), 540, 690, 960);
  spacing(ctx, 2);
  ctx.fillStyle = '#ffffff';
  ctx.save();
  ctx.shadowColor = '#EC4899';
  ctx.shadowBlur = 24;
  const name = fitLines(ctx, c.eventName.toUpperCase(), (s) => `700 ${s}px Oswald`, 920, 100, 50, 2);
  const end = centerText(ctx, name.lines, 800, name.size * 1.02);
  ctx.restore();
  details(ctx, c, end + 70, 'rgba(233,168,255,0.95)');
  watermark(ctx, 'rgba(255,255,255,0.5)');
}

function polaroid(ctx: Ctx, c: DpContent) {
  ctx.fillStyle = '#0B3C49';
  ctx.fillRect(0, 0, DP_SIZE, DP_SIZE);
  ctx.fillStyle = '#F77F00';
  ctx.beginPath(); ctx.arc(900, 170, 230, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 12; i += 1) {
    ctx.beginPath(); ctx.arc(120, 900, 60 + i * 38, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.stroke();
  }

  ctx.save();
  ctx.translate(540, 360);
  ctx.rotate(-0.06);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-250, -290, 500, 590);
  ctx.shadowColor = 'transparent';
  drawPhoto(ctx, c, { x: -222, y: -262, w: 444, h: 444 }, (x) => x.rect(-222, -262, 444, 444));
  ctx.fillStyle = '#1b1b1b';
  ctx.textAlign = 'center';
  ctx.font = '700 58px Caveat';
  ctx.fillText(c.dp.name || ' ', 0, 256, 440);
  ctx.fillStyle = 'rgba(247,127,0,0.85)';
  ctx.fillRect(-70, -312, 140, 44);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#F77F00';
  const msg = fitLines(ctx, c.dp.message.toUpperCase(), (s) => `700 ${s}px Oswald`, 900, 76, 44, 1);
  spacing(ctx, 6);
  centerText(ctx, msg.lines, 776, msg.size);
  spacing(ctx, 0);
  ctx.fillStyle = '#ffffff';
  const name = fitLines(ctx, c.eventName, (s) => `800 ${s}px Inter`, 880, 60, 34, 2);
  const end = centerText(ctx, name.lines, 860, name.size * 1.1);
  details(ctx, c, end + 58, 'rgba(255,255,255,0.8)');
  watermark(ctx, 'rgba(255,255,255,0.55)');
}

const DRAW: Record<TemplateId, (ctx: Ctx, content: DpContent) => void> = { royal, festival, night, polaroid };

export function drawDp(canvas: HTMLCanvasElement, content: DpContent) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.clearRect(0, 0, DP_SIZE, DP_SIZE);
  ctx.textAlign = 'center';
  DRAW[content.dp.template](ctx, content);
  ctx.restore();
}
