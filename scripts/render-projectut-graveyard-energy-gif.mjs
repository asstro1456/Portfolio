import { writeFileSync } from 'node:fs';

const isBanish = process.argv.includes('--banish');
const isMulti = process.argv.includes('--multi');
const hasBothPiles = process.argv.includes('--both');
const isShuffle = process.argv.includes('--shuffle');
const W = 960, H = 540, FRAMES = isShuffle ? 30 : isMulti ? 29 : 20;
const outputPath = isShuffle
  ? 'output/ProjectUT_deck_rebuild_demo.gif'
  : hasBothPiles
  ? isBanish
    ? 'output/ProjectUT_banish_with_graveyard_energy_demo.gif'
    : 'output/ProjectUT_graveyard_with_banish_energy_demo.gif'
  : isBanish
    ? 'output/ProjectUT_banish_energy_demo.gif'
    : isMulti
      ? 'output/ProjectUT_graveyard_multi_energy_demo.gif'
      : 'output/ProjectUT_graveyard_energy_demo.gif';
const INITIAL_DECK_COUNT = 30;
const BAR_CENTER_Y = 331;
const BAR_SIDE_TRAVEL = 150;
const C = [
  [12, 10, 18], [28, 22, 35], [56, 42, 57], [100, 72, 32],
  [181, 132, 43], [237, 202, 116], [58, 41, 78], [103, 52, 163],
  [151, 77, 227], [210, 149, 255], [245, 232, 255], [23, 18, 30],
  [43, 34, 52], [128, 118, 145], [203, 194, 210], [0, 0, 0]
];
const out = [];

function u16(v) { out.push(v & 255, (v >> 8) & 255); }
function px(a, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) a[y * W + x] = c; }
function rect(a, x, y, w, h, c) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(a, xx, yy, c); }
function line(a, x0, y0, x1, y1, c, t = 1) {
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) { rect(a, x0 - Math.floor(t / 2), y0 - Math.floor(t / 2), t, t, c); if (x0 === x1 && y0 === y1) break; const e = 2 * err; if (e >= dy) { err += dy; x0 += sx; } if (e <= dx) { err += dx; y0 += sy; } }
}
function circle(a, cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(a, cx + x, cy + y, c); }
function ring(a, cx, cy, r, thickness, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d <= r * r && d >= (r - thickness) * (r - thickness)) px(a, cx + x, cy + y, c); } }
function rounded(a, x, y, w, h, r, c) { rect(a, x + r, y, w - r * 2, h, c); rect(a, x, y + r, w, h - r * 2, c); circle(a, x + r, y + r, r, c); circle(a, x + w - r - 1, y + r, r, c); circle(a, x + r, y + h - r - 1, r, c); circle(a, x + w - r - 1, y + h - r - 1, r, c); }
function lzw(data) {
  // Compatibility-first literal stream: larger than dictionary compression but decodes reliably everywhere.
  const min = 4, clear = 1 << min, end = clear + 1, codeSize = min + 1, bytes = [];
  let bits = 0, nbits = 0;
  const emit = v => { bits |= v << nbits; nbits += codeSize; while (nbits >= 8) { bytes.push(bits & 255); bits >>= 8; nbits -= 8; } };
  for (const color of data) { emit(clear); emit(color); }
  emit(end); if (nbits) bytes.push(bits & 255);
  const blocks = [min]; for (let i = 0; i < bytes.length; i += 255) blocks.push(Math.min(255, bytes.length - i), ...bytes.slice(i, i + 255)); blocks.push(0); return blocks;
}
function shuffleFrame(n) {
  const a = new Uint8Array(W * H); a.fill(0);
  const startGrave = 12, startBanish = 5;
  const q = Math.max(0, Math.min(1, (n - 4) / 16));
  const grave = startGrave * (1 - q);
  const dividerY = Math.round(BAR_CENTER_Y + ((grave - startBanish) / INITIAL_DECK_COUNT) * BAR_SIDE_TRAVEL);
  rounded(a, 18, 18, W - 36, H - 36, 12, 1); rounded(a, 22, 22, W - 44, H - 44, 10, 2);
  rect(a, 30, 30, 900, 440, 0); rect(a, 34, 34, 892, 432, 1); line(a, 30, 470, 930, 470, 4, 2); line(a, 30, 34, 930, 34, 4, 2);
  const pipe = [[235,84],[212,84],[190,89],[169,100],[152,114],[142,128],[127,128]];
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 11, 20);
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 13, 14);
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 14, 4);
  // Purple packets travel from the graveyard through the pipe into the deck header.
  const reversePipe = [...pipe].reverse();
  for (let p = 0; p < 4; p++) {
    const t = Math.max(0, Math.min(1, (n - 5 - p * 3) / 11));
    if (n < 5 + p * 3 || t >= 1) continue;
    const scaled = t * (reversePipe.length - 1), index = Math.floor(scaled), local = scaled - index;
    const from = reversePipe[index], to = reversePipe[Math.min(index + 1, reversePipe.length - 1)];
    const x = Math.round(from[0] + (to[0] - from[0]) * local), y = Math.round(from[1] + (to[1] - from[1]) * local);
    circle(a, x, y, 5, 7); circle(a, x, y, 3, 8); circle(a, x, y, 1, 10);
  }
  const gemPulse = n >= 16;
  rounded(a, 224, 61, 266, 47, 8, 4); rounded(a, 229, 66, 256, 37, 6, 11); rounded(a, 236, 72, 242, 25, 4, 1);
  if (gemPulse) {
    rounded(a, 296, 77, 156, 14, 4, 6); rounded(a, 300, 80, 148, 8, 3, 7);
    ring(a, 258, 84, 28 + (n % 3) * 2, 3, 7); ring(a, 258, 84, 22 + (n % 3), 2, 9);
  }
  line(a, 283, 71, 283, 98, 4, 2); circle(a, 258, 84, gemPulse ? 21 : 18, 4); circle(a, 258, 84, gemPulse ? 16 : 13, 6); circle(a, 258, 84, gemPulse ? 12 : 9, 8); circle(a, 258, 84, 5, 10);
  for (let i = 0; i < 3; i++) line(a, 315 + i * 28, 81 + ((n + i) % 3), 332 + i * 28, 81 + ((n + i) % 3), 4, 2);
  for (let i = 0; i < 7; i++) { rounded(a, 235, 150 + i * 42, 235, 32, 4, 5); rect(a, 243, 155 + i * 42, 205, 21, 3); circle(a, 452, 166 + i * 42, 10, 6); }
  rounded(a, 65, 116, 126, 354, 18, 3); rounded(a, 71, 122, 114, 342, 14, 4); rounded(a, 78, 128, 100, 330, 12, 11);
  rounded(a, 88, 150, 80, dividerY - 158, 8, 12); rounded(a, 88, dividerY + 16, 80, 446 - (dividerY + 16), 8, 11);
  line(a, 82, dividerY, 174, dividerY, 5, 5); line(a, 82, dividerY + 6, 174, dividerY + 6, 4, 2);
  const purpleLevel = Math.round((250 / INITIAL_DECK_COUNT) * grave), purpleTop = dividerY - 12 - purpleLevel;
  if (purpleLevel > 0) { rounded(a, 94, purpleTop, 68, purpleLevel, 4, 7); rounded(a, 98, purpleTop + 2, 60, Math.max(1, purpleLevel - 2), 3, 8); for (let x = 100; x < 157; x += 4) px(a, x, purpleTop + ((x + n) % 8 < 4 ? 0 : 2), 9); }
  // While the graveyard drains, particles rise through the vessel toward the pipe junction.
  for (let p = 0; p < 5; p++) {
    const t = Math.max(0, Math.min(1, (n - 4 - p * 2) / 12));
    if (n < 4 + p * 2 || t >= 1) continue;
    const startX = 128 + (p - 2) * 9, startY = dividerY - 20 - p * 5;
    const x = Math.round(startX + Math.sin(t * Math.PI * 2 + p) * 8), y = Math.round(startY + (140 - startY) * t);
    circle(a, x, y, 5, 7); circle(a, x, y, 3, 8); circle(a, x, y, 1, 10);
  }
  const darkLevel = Math.round((250 / INITIAL_DECK_COUNT) * startBanish), darkTop = 438 - darkLevel;
  if (darkLevel > 0) { rounded(a, 94, darkTop, 68, darkLevel, 4, 12); rounded(a, 98, darkTop + 2, 60, Math.max(1, darkLevel - 2), 3, 11); for (let x = 100; x < 157; x += 4) px(a, x, darkTop + ((x + n) % 8 < 4 ? 0 : 2), 13); }
  line(a, 83, 148, 83, 449, 14, 2); line(a, 174, 150, 174, 449, 13, 2); rounded(a, 58, 103, 140, 28, 10, 4); rounded(a, 63, 107, 130, 20, 7, 5); rounded(a, 56, 451, 144, 28, 10, 3); rounded(a, 62, 454, 132, 18, 7, 4);
  return a;
}
function frame(n) {
  if (isShuffle) return shuffleFrame(n);
  const a = new Uint8Array(W * H); a.fill(0);
  const cardStarts = isMulti ? [0, 3, 6] : [0];
  const cardCount = cardStarts.length;
  const energyStart = isMulti ? 22 : 16;
  const q = Math.max(0, Math.min(1, (n - energyStart) / 3));
  // Demo state: 0/0 -> 1/0 (or 0/1), or 5/5 -> 6/5 (or 5/6) when both piles exist.
  const startGrave = hasBothPiles ? 5 : 0, startBanish = hasBothPiles ? 5 : 0;
  const endGrave = startGrave + (isBanish ? 0 : cardCount);
  const endBanish = startBanish + (isBanish ? cardCount : 0);
  const startDifference = startGrave - startBanish, endDifference = endGrave - endBanish;
  const dividerY = Math.round(BAR_CENTER_Y + ((startDifference + (endDifference - startDifference) * q) / INITIAL_DECK_COUNT) * BAR_SIDE_TRAVEL);
  // Battlefield panel and simplified hand UI.
  rounded(a, 18, 18, W - 36, H - 36, 12, 1); rounded(a, 22, 22, W - 44, H - 44, 10, 2);
  rect(a, 30, 30, 900, 440, 0); rect(a, 34, 34, 892, 432, 1);
  line(a, 30, 470, 930, 470, 4, 2); line(a, 30, 34, 930, 34, 4, 2);
  // Simplified enemy target. The card is moved here before it converts into energy.
  rounded(a, 694, 188, 112, 170, 12, 12); rounded(a, 700, 194, 100, 158, 9, 13);
  circle(a, 750, 235, 23, 2); circle(a, 750, 230, 16, 13); rounded(a, 720, 255, 60, 70, 18, 2);
  line(a, 710, 180, 790, 180, 6, 4); line(a, 710, 365, 790, 365, 6, 4);
  // The editor pipe exits the deck header on the left, bends down, then joins the vessel cap.
  const pipe = [[235,84],[212,84],[190,89],[169,100],[152,114],[142,128],[127,128]];
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 11, 20);
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 13, 14);
  for (let i = 1; i < pipe.length; i++) line(a, pipe[i - 1][0], pipe[i - 1][1], pipe[i][0], pipe[i][1], 14, 4);
  circle(a, 235, 84, 10, 4); circle(a, 235, 84, 6, 13); circle(a, 127, 128, 10, 4); circle(a, 127, 128, 6, 13);
  // Deck header: black/gold panel and purple gem, positioned above the vessel as in the editor layout.
  rounded(a, 224, 61, 266, 47, 8, 4); rounded(a, 229, 66, 256, 37, 6, 11); rounded(a, 236, 72, 242, 25, 4, 1);
  line(a, 283, 71, 283, 98, 4, 2); circle(a, 258, 84, 18, 4); circle(a, 258, 84, 13, 6); circle(a, 258, 84, 9, 8); circle(a, 258, 84, 4, 10);
  const usedRows = isMulti ? new Set([2, 3, 4]) : new Set([2]);
  for (let i = 0; i < 7; i++) {
    if (usedRows.has(i)) continue;
    rounded(a, 235, 150 + i * 42, 235, 32, 4, 5); rect(a, 243, 155 + i * 42, 205, 21, 3); circle(a, 452, 166 + i * 42, 10, 6);
  }
  // Cards travel to the enemy first; no card becomes particles while still in the hand.
  cardStarts.forEach((start, i) => {
    if (n > start + 9) return;
    const cardStart = [235, 234 + i * 42], cardTarget = [708, 246];
    const cardTravel = Math.max(0, Math.min(1, (n - start - 2) / 5));
    const x = Math.round(cardStart[0] + (cardTarget[0] - cardStart[0]) * cardTravel);
    const y = Math.round(cardStart[1] + (cardTarget[1] - cardStart[1]) * cardTravel);
    const fade = n >= start + 8 ? n - (start + 7) : 0;
    const outer = [5, 4, 3][fade], inner = [3, 3, 2][fade];
    rounded(a, x, y, 62, 86, 5, outer); rect(a, x + 7, y + 9, 48, 59, 3, inner);
    line(a, x + 14, y + 28, x + 48, y + 28, 4); line(a, x + 14, y + 42, x + 48, y + 42, 4); circle(a, x + 31, y + 14, 6, 6);
  });
  // Container exterior.
  rounded(a, 65, 116, 126, 354, 18, 3); rounded(a, 71, 122, 114, 342, 14, 4); rounded(a, 78, 128, 100, 330, 12, 11);
  // The divider moves with the displayed graveyard/banish ratio.
  rounded(a, 88, 150, 80, dividerY - 158, 8, 12);
  rounded(a, 88, dividerY + 16, 80, 446 - (dividerY + 16), 8, 11);
  line(a, 82, dividerY, 174, dividerY, 5, 5); line(a, 82, dividerY + 6, 174, dividerY + 6, 4, 2);
  // Lower chamber stays black: makes the two areas readable.
  for (let y = dividerY + 26; y < 438; y += 10) line(a, 96, y, 160, y, 12, 1);
  // Purple particles are created at the enemy position after the card has arrived and vanished.
  cardStarts.forEach((start, cardIndex) => {
    const particleStart = start + 10, particleEnd = particleStart + 6;
    if (n < particleStart || n > particleEnd) return;
    const travel = Math.max(0, Math.min(1, (n - particleStart) / 6));
    for (let i = 0; i < 5; i++) {
      const startX = 738 + i * 8, startY = 286 + ((i % 2) * 9 - 4);
      const endX = 128 + (i - 2) * 5, endY = (isBanish ? 391 : 238) + ((i % 2) * 7 - 3) + (cardIndex - 1) * 3;
      const x = Math.round(startX + (endX - startX) * travel);
      const y = Math.round(startY + (endY - startY) * travel - Math.sin(travel * Math.PI) * (14 + i * 2));
      if (isBanish) { circle(a, x, y, 5, 13); circle(a, x, y, 3, 11); circle(a, x, y, 1, 14); }
      else { circle(a, x, y, 5, 7); circle(a, x, y, 3, 8); circle(a, x, y, 1, 10); }
    }
  });
  if (!isBanish) {
    const purpleLevel = Math.round((250 / INITIAL_DECK_COUNT) * (startGrave + cardCount * q)), purpleTop = dividerY - 12 - purpleLevel;
    if (purpleLevel > 0) {
      rounded(a, 94, purpleTop, 68, purpleLevel, 4, 7); rounded(a, 98, purpleTop + 2, 60, Math.max(1, purpleLevel - 2), 3, 8);
      for (let x = 100; x < 157; x += 4) px(a, x, purpleTop + ((x + n) % 8 < 4 ? 0 : 2), 9);
    }
    const darkLevel = Math.round((250 / INITIAL_DECK_COUNT) * startBanish), darkTop = 438 - darkLevel;
    if (darkLevel > 0) {
      rounded(a, 94, darkTop, 68, darkLevel, 4, 12); rounded(a, 98, darkTop + 2, 60, Math.max(1, darkLevel - 2), 3, 11);
      for (let x = 100; x < 157; x += 4) px(a, x, darkTop + ((x + n) % 8 < 4 ? 0 : 2), 13);
    }
  } else {
    const purpleLevel = Math.round((250 / INITIAL_DECK_COUNT) * startGrave), purpleTop = dividerY - 12 - purpleLevel;
    if (purpleLevel > 0) {
      rounded(a, 94, purpleTop, 68, purpleLevel, 4, 7); rounded(a, 98, purpleTop + 2, 60, Math.max(1, purpleLevel - 2), 3, 8);
      for (let x = 100; x < 157; x += 4) px(a, x, purpleTop + ((x + n) % 8 < 4 ? 0 : 2), 9);
    }
    const darkLevel = Math.round((250 / INITIAL_DECK_COUNT) * (startBanish + cardCount * q)), darkTop = 438 - darkLevel;
    if (darkLevel > 0) {
      rounded(a, 94, darkTop, 68, darkLevel, 4, 12); rounded(a, 98, darkTop + 2, 60, Math.max(1, darkLevel - 2), 3, 11);
      for (let x = 100; x < 157; x += 4) px(a, x, darkTop + ((x + n) % 8 < 4 ? 0 : 2), 13);
    }
  }
  // glass highlights and container caps.
  line(a, 83, 148, 83, 449, 14, 2); line(a, 174, 150, 174, 449, 13, 2); rounded(a, 58, 103, 140, 28, 10, 4); rounded(a, 63, 107, 130, 20, 7, 5); rounded(a, 56, 451, 144, 28, 10, 3); rounded(a, 62, 454, 132, 18, 7, 4);
  return a;
}

// GIF header and global palette.
out.push(...Buffer.from('GIF89a')); u16(W); u16(H); out.push(0xF3, 0, 0); for (const [r, g, b] of C) out.push(r, g, b);
// Infinite loop.
out.push(0x21, 0xFF, 0x0B, ...Buffer.from('NETSCAPE2.0'), 0x03, 0x01, 0, 0, 0);
for (let n = 0; n < FRAMES; n++) {
  out.push(0x21, 0xF9, 0x04, 0x04); u16(n === FRAMES - 1 ? 70 : 9); out.push(0, 0);
  out.push(0x2C); u16(0); u16(0); u16(W); u16(H); out.push(0);
  for (const byte of lzw(frame(n))) out.push(byte);
}
out.push(0x3B);
writeFileSync(outputPath, Buffer.from(out));
