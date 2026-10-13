import { writeFileSync } from 'node:fs';

const W = 640, H = 360, FRAMES = 24;
const out = [];
const C = [
  [17, 12, 10], [53, 30, 18], [97, 54, 27], [0, 0, 0],
  [54, 48, 49], [8, 8, 10], [83, 46, 17], [150, 99, 33],
  [232, 192, 104], [239, 89, 81], [218, 174, 88], [255, 238, 190],
  [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
];

function u16(v) { out.push(v & 255, (v >> 8) & 255); }
function px(a, x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) a[y * W + x] = c; }
function rect(a, x, y, w, h, c) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(a, xx, yy, c); }
function line(a, x0, y0, x1, y1, c, t = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) { rect(a, x0 - Math.floor(t / 2), y0 - Math.floor(t / 2), t, t, c); if (x0 === x1 && y0 === y1) break; const e = err * 2; if (e >= dy) { err += dy; x0 += sx; } if (e <= dx) { err += dx; y0 += sy; } }
}
function poly(a, points, fill, stroke = fill, thickness = 1) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minY = Math.max(0, Math.floor(Math.min(...ys))), maxY = Math.min(H - 1, Math.ceil(Math.max(...ys)));
  for (let y = minY; y <= maxY; y++) {
    const hits = [];
    for (let i = 0; i < points.length; i++) { const p = points[i], q = points[(i + 1) % points.length]; if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) hits.push(p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1])); }
    hits.sort((x, z) => x - z); for (let i = 0; i < hits.length; i += 2) for (let x = Math.ceil(hits[i]); x <= Math.floor(hits[i + 1]); x++) px(a, x, y, fill);
  }
  for (let i = 0; i < points.length; i++) line(a, points[i][0], points[i][1], points[(i + 1) % points.length][0], points[(i + 1) % points.length][1], stroke, thickness);
}
function circle(a, cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(a, cx + x, cy + y, c); }
function lzw(data) {
  const min = 4, clear = 1 << min, end = clear + 1, size = min + 1, bytes = []; let bits = 0, nbits = 0;
  const emit = v => { bits |= v << nbits; nbits += size; while (nbits >= 8) { bytes.push(bits & 255); bits >>= 8; nbits -= 8; } };
  for (const v of data) { emit(clear); emit(v); } emit(end); if (nbits) bytes.push(bits & 255);
  const blocks = [min]; for (let i = 0; i < bytes.length; i += 255) blocks.push(Math.min(255, bytes.length - i), ...bytes.slice(i, i + 255)); blocks.push(0); return blocks;
}
function ease(t) { return t * t * (3 - 2 * t); }
function projected(x, depth, height) { return [x + depth * .22, 226 - height + depth * .08]; }
function render(n) {
  const a = new Uint8Array(W * H); a.fill(0);
  rect(a, 0, 238, W, H - 238, 1); for (let y = 242; y < H; y += 20) line(a, 0, y, W, y - 4, 2, 1);
  line(a, 0, 238, W, 238, 8, 3);
  const p = n < 5 ? 0 : n > 18 ? 1 : ease((n - 5) / 13);
  const theta = -p * Math.PI * 2 / 3;
  const axisL = 150, axisR = 500, r = 75;
  const verts = Array.from({ length: 3 }, (_, k) => {
    const q = theta + Math.PI / 2 + k * Math.PI * 2 / 3;
    return { d: Math.cos(q) * r, h: Math.sin(q) * r };
  });
  const faces = Array.from({ length: 3 }, (_, k) => {
    const u = verts[k], v = verts[(k + 1) % 3];
    return { k, depth: (u.d + v.d) / 2, pts: [projected(axisL, u.d, u.h), projected(axisR, u.d, u.h), projected(axisR, v.d, v.h), projected(axisL, v.d, v.h)] };
  }).sort((x, y) => x.depth - y.depth);
  // Back-to-front faces: face 0 carries the maintenance engraving, face 1 is deliberately blank, face 2 is the customer-side notice.
  for (const f of faces) {
    // At 0° face 2 points toward the player; after the reversed 120° roll face 0 is the player-facing blank face.
    const isMaintenance = f.k === 2, isBlank = f.k === 0;
    poly(a, f.pts, f.depth < 0 ? 5 : 4, 7, 4);
    const [p0, p1, p2, p3] = f.pts;
    const inset = .11, inner = [
      [p0[0] * (1 - inset) + (p1[0] + p3[0]) * inset / 2, p0[1] * (1 - inset) + (p1[1] + p3[1]) * inset / 2],
      [p1[0] * (1 - inset) + (p0[0] + p2[0]) * inset / 2, p1[1] * (1 - inset) + (p0[1] + p2[1]) * inset / 2],
      [p2[0] * (1 - inset) + (p1[0] + p3[0]) * inset / 2, p2[1] * (1 - inset) + (p1[1] + p3[1]) * inset / 2],
      [p3[0] * (1 - inset) + (p0[0] + p2[0]) * inset / 2, p3[1] * (1 - inset) + (p0[1] + p2[1]) * inset / 2]
    ];
    line(a, inner[0][0], inner[0][1], inner[1][0], inner[1][1], 10, 1); line(a, inner[1][0], inner[1][1], inner[2][0], inner[2][1], 10, 1); line(a, inner[2][0], inner[2][1], inner[3][0], inner[3][1], 10, 1); line(a, inner[3][0], inner[3][1], inner[0][0], inner[0][1], 10, 1);
    // Engraving markers are used only to identify each surface in this geometry check GIF.
    if (isMaintenance) for (let i = -1; i <= 1; i++) { const y = (p0[1] + p3[1] + p1[1] + p2[1]) / 4 + i * 14; line(a, (p0[0] + p3[0]) / 2 + 72, y, (p1[0] + p2[0]) / 2 - 72, y, 8, 3); }
    if (!isBlank && !isMaintenance) for (let i = -1; i <= 1; i++) circle(a, (p0[0] + p1[0] + p2[0] + p3[0]) / 4 + i * 18, (p0[1] + p1[1] + p2[1] + p3[1]) / 4, 5, 9);
  }
  // Rotation guide: only in the middle part of the animation.
  if (n >= 4 && n <= 19) {
    const cx = 133, cy = 227; for (let k = 0; k < 20; k++) { const t = k / 20 * Math.PI * 1.6 - 2.4; circle(a, cx + Math.cos(t) * 96, cy + Math.sin(t) * 96, 3, 9); }
    const t = .7; const ax = cx + Math.cos(t) * 96, ay = cy + Math.sin(t) * 96; line(a, ax, ay, ax + 16, ay - 3, 9, 4); line(a, ax, ay, ax + 2, ay - 17, 9, 4);
  }
  return a;
}

out.push(...Buffer.from('GIF89a')); u16(W); u16(H); out.push(0xF3, 0, 0); for (const rgb of C) out.push(...rgb);
// Infinite loop: helps inspect the direction and face order repeatedly.
out.push(0x21, 0xFF, 0x0B, ...Buffer.from('NETSCAPE2.0'), 0x03, 0x01, 0, 0, 0);
for (let n = 0; n < FRAMES; n++) {
  out.push(0x21, 0xF9, 0x04, 0x04); u16(n === FRAMES - 1 ? 70 : 6); out.push(0, 0);
  out.push(0x2C); u16(0); u16(0); u16(W); u16(H); out.push(0);
  for (const byte of lzw(render(n))) out.push(byte);
}
out.push(0x3B);
writeFileSync('output/ProjectUT_lobby_plaque_turn_demo.gif', Buffer.from(out));
