import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIZE = 256;
const root = process.cwd();
const outRoot = path.join(root, "public", "assets", "game", "shared");

const colors = {
  gold: [245, 158, 11, 255],
  goldLight: [254, 240, 138, 255],
  goldDark: [180, 83, 9, 255],
  amber: [251, 191, 36, 255],
  cyan: [34, 211, 238, 255],
  cyanLight: [165, 243, 252, 255],
  cyanDark: [8, 145, 178, 255],
  blue: [59, 130, 246, 255],
  blueDark: [30, 64, 175, 255],
  green: [34, 197, 94, 255],
  greenDark: [21, 128, 61, 255],
  red: [239, 68, 68, 255],
  redDark: [185, 28, 28, 255],
  orange: [249, 115, 22, 255],
  purple: [139, 92, 246, 255],
  purpleLight: [196, 181, 253, 255],
  pink: [236, 72, 153, 255],
  slate: [51, 65, 85, 255],
  slateLight: [148, 163, 184, 255],
  white: [255, 255, 255, 255],
  black: [15, 23, 42, 255],
};

function makeCanvas() {
  return new Uint8ClampedArray(SIZE * SIZE * 4);
}

function blend(buf, x, y, rgba, alpha = 1) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  const a = (rgba[3] / 255) * alpha;
  const inv = 1 - a;
  buf[i] = rgba[0] * a + buf[i] * inv;
  buf[i + 1] = rgba[1] * a + buf[i + 1] * inv;
  buf[i + 2] = rgba[2] * a + buf[i + 2] * inv;
  buf[i + 3] = 255 * (a + (buf[i + 3] / 255) * inv);
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ];
}

function circle(buf, cx, cy, r, fill, opts = {}) {
  const { stroke, strokeWidth = 0, light, shadow = false } = opts;
  if (shadow) circle(buf, cx + 7, cy + 10, r, [0, 0, 0, 70]);
  const minX = Math.floor(cx - r - strokeWidth - 2);
  const maxX = Math.ceil(cx + r + strokeWidth + 2);
  const minY = Math.floor(cy - r - strokeWidth - 2);
  const maxY = Math.ceil(cy + r + strokeWidth + 2);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (stroke && d <= r + strokeWidth && d >= r - strokeWidth) {
        blend(buf, x, y, stroke, Math.max(0, Math.min(1, r + strokeWidth - d)));
      } else if (d <= r) {
        const aa = Math.min(1, r - d + 1);
        const grad = light ? Math.max(0, Math.min(1, (d / r + (y - cy) / r * 0.2))) : 0;
        blend(buf, x, y, light ? mix(light, fill, grad) : fill, aa);
      }
    }
  }
}

function rect(buf, x, y, w, h, r, fill, opts = {}) {
  const { stroke, strokeWidth = 0, shadow = false } = opts;
  if (shadow) rect(buf, x + 7, y + 10, w, h, r, [0, 0, 0, 65]);
  for (let py = Math.floor(y - strokeWidth - 2); py <= Math.ceil(y + h + strokeWidth + 2); py++) {
    for (let px = Math.floor(x - strokeWidth - 2); px <= Math.ceil(x + w + strokeWidth + 2); px++) {
      const qx = Math.max(x + r, Math.min(px + 0.5, x + w - r));
      const qy = Math.max(y + r, Math.min(py + 0.5, y + h - r));
      const d = Math.hypot(px + 0.5 - qx, py + 0.5 - qy) - r;
      if (stroke && d <= strokeWidth && d >= -strokeWidth) {
        blend(buf, px, py, stroke, Math.max(0, Math.min(1, strokeWidth - Math.abs(d) + 0.8)));
      } else if (d <= 0) {
        blend(buf, px, py, fill, Math.max(0, Math.min(1, -d + 1)));
      }
    }
  }
}

function polygon(buf, points, fill, opts = {}) {
  const { stroke, strokeWidth = 0, shadow = false } = opts;
  if (shadow) polygon(buf, points.map(([x, y]) => [x + 7, y + 10]), [0, 0, 0, 60]);
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  for (let y = Math.floor(Math.min(...ys)) - 2; y <= Math.ceil(Math.max(...ys)) + 2; y++) {
    for (let x = Math.floor(Math.min(...xs)) - 2; x <= Math.ceil(Math.max(...xs)) + 2; x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0], yi = points[i][1], xj = points[j][0], yj = points[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) blend(buf, x, y, fill);
    }
  }
  if (stroke) {
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      line(buf, a[0], a[1], b[0], b[1], stroke, strokeWidth || 4);
    }
  }
}

function line(buf, x1, y1, x2, y2, color, width = 5) {
  const minX = Math.floor(Math.min(x1, x2) - width);
  const maxX = Math.ceil(Math.max(x1, x2) + width);
  const minY = Math.floor(Math.min(y1, y2) - width);
  const maxY = Math.ceil(Math.max(y1, y2) + width);
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
      const px = x1 + t * dx, py = y1 + t * dy;
      const d = Math.hypot(x - px, y - py);
      if (d <= width / 2) blend(buf, x, y, color, Math.max(0, Math.min(1, width / 2 - d + 0.8)));
    }
  }
}

function star(cx, cy, outer, inner, points = 5) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

const icons = {
  "currency/coin": (b) => {
    circle(b, 128, 128, 86, colors.gold, { stroke: colors.goldDark, strokeWidth: 7, light: colors.goldLight, shadow: true });
    circle(b, 128, 128, 58, [255, 255, 255, 35], { stroke: colors.amber, strokeWidth: 3 });
    rect(b, 100, 78, 56, 100, 12, [180, 83, 9, 170]);
    rect(b, 111, 58, 34, 128, 14, colors.goldLight);
  },
  "currency/diamond": (b) => {
    polygon(b, [[128, 28], [212, 92], [128, 226], [44, 92]], colors.cyan, { stroke: colors.cyanDark, strokeWidth: 6, shadow: true });
    polygon(b, [[128, 28], [96, 92], [160, 92]], colors.cyanLight);
    polygon(b, [[44, 92], [96, 92], [128, 226]], [14, 165, 233, 190]);
    polygon(b, [[212, 92], [160, 92], [128, 226]], [8, 145, 178, 210]);
    line(b, 96, 92, 128, 226, [255, 255, 255, 80], 3);
  },
  "currency/connection": (b) => {
    line(b, 78, 98, 178, 98, colors.goldLight, 13);
    line(b, 88, 154, 168, 154, colors.goldLight, 13);
    circle(b, 78, 98, 42, colors.orange, { stroke: colors.redDark, strokeWidth: 5, light: colors.goldLight, shadow: true });
    circle(b, 178, 98, 42, colors.amber, { stroke: colors.goldDark, strokeWidth: 5, light: colors.goldLight, shadow: true });
    circle(b, 128, 162, 42, colors.purple, { stroke: colors.blueDark, strokeWidth: 5, light: colors.purpleLight, shadow: true });
  },
  "nav/business": (b) => {
    rect(b, 44, 82, 168, 114, 18, [146, 64, 14, 255], { stroke: [120, 53, 15, 255], strokeWidth: 5, shadow: true });
    rect(b, 88, 56, 80, 42, 12, [120, 53, 15, 255]);
    rect(b, 101, 70, 54, 24, 8, [34, 20, 10, 255]);
    rect(b, 104, 122, 48, 34, 7, colors.goldLight);
  },
  "nav/upgrade": (b) => {
    polygon(b, [[128, 34], [210, 130], [164, 130], [164, 218], [92, 218], [92, 130], [46, 130]], colors.green, { stroke: colors.greenDark, strokeWidth: 6, shadow: true });
    polygon(b, [[128, 54], [184, 116], [150, 116], [150, 200], [106, 200], [106, 116], [72, 116]], [134, 239, 172, 150]);
  },
  "nav/manager": (b) => {
    circle(b, 92, 84, 34, colors.purpleLight, { stroke: colors.purple, strokeWidth: 5, shadow: true });
    rect(b, 48, 126, 88, 82, 30, colors.purple, { stroke: colors.blueDark, strokeWidth: 4 });
    circle(b, 168, 90, 30, colors.goldLight, { stroke: colors.goldDark, strokeWidth: 5, shadow: true });
    rect(b, 126, 132, 84, 76, 30, colors.amber, { stroke: colors.goldDark, strokeWidth: 4 });
  },
  "nav/prestige": (b) => icons["currency/connection"](b),
  "nav/shop": (b) => {
    line(b, 46, 72, 68, 72, colors.amber, 10);
    line(b, 64, 72, 90, 162, colors.amber, 10);
    polygon(b, [[84, 92], [214, 92], [190, 160], [102, 160]], [251, 191, 36, 255], { stroke: colors.goldDark, strokeWidth: 5, shadow: true });
    circle(b, 112, 204, 17, colors.goldDark);
    circle(b, 178, 204, 17, colors.goldDark);
  },
  "nav/achievement": (b) => {
    polygon(b, [[92, 38], [164, 38], [154, 96], [102, 96]], colors.blue, { stroke: colors.blueDark, strokeWidth: 5 });
    circle(b, 128, 132, 70, colors.amber, { stroke: colors.goldDark, strokeWidth: 6, light: colors.goldLight, shadow: true });
    polygon(b, star(128, 132, 38, 16), colors.goldLight, { stroke: colors.goldDark, strokeWidth: 3 });
  },
  "status/lock": (b) => {
    rect(b, 56, 106, 144, 104, 18, colors.slate, { stroke: colors.black, strokeWidth: 5, shadow: true });
    line(b, 86, 108, 86, 78, colors.black, 12);
    line(b, 170, 108, 170, 78, colors.black, 12);
    circle(b, 128, 78, 42, [0, 0, 0, 0], { stroke: colors.black, strokeWidth: 12 });
    circle(b, 128, 156, 16, colors.black);
  },
  "status/check": (b) => {
    circle(b, 128, 128, 86, colors.green, { stroke: colors.greenDark, strokeWidth: 7, shadow: true });
    line(b, 78, 130, 112, 164, colors.white, 16);
    line(b, 110, 164, 184, 88, colors.white, 16);
  },
  "status/cross": (b) => {
    circle(b, 128, 128, 86, colors.red, { stroke: colors.redDark, strokeWidth: 7, shadow: true });
    line(b, 82, 82, 174, 174, colors.white, 16);
    line(b, 174, 82, 82, 174, colors.white, 16);
  },
  "system/settings": (b) => {
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      circle(b, 128 + Math.cos(a) * 62, 128 + Math.sin(a) * 62, 22, colors.slateLight);
    }
    circle(b, 128, 128, 72, colors.slate, { stroke: colors.black, strokeWidth: 6, shadow: true });
    circle(b, 128, 128, 30, [15, 23, 42, 255]);
    circle(b, 128, 128, 16, colors.slateLight);
  },
  "boost/ad": (b) => {
    rect(b, 34, 54, 188, 126, 18, colors.slate, { stroke: colors.black, strokeWidth: 6, shadow: true });
    rect(b, 54, 74, 148, 84, 8, colors.blue);
    polygon(b, [[116, 92], [116, 142], [158, 117]], colors.white);
    line(b, 88, 184, 58, 218, colors.slateLight, 8);
    line(b, 168, 184, 198, 218, colors.slateLight, 8);
  },
  "boost/gift": (b) => {
    rect(b, 54, 102, 148, 106, 14, colors.red, { stroke: colors.redDark, strokeWidth: 5, shadow: true });
    rect(b, 38, 70, 180, 46, 12, colors.orange, { stroke: colors.redDark, strokeWidth: 4 });
    rect(b, 112, 70, 32, 138, 5, colors.goldLight);
    circle(b, 92, 64, 30, [0, 0, 0, 0], { stroke: colors.goldLight, strokeWidth: 11 });
    circle(b, 164, 64, 30, [0, 0, 0, 0], { stroke: colors.goldLight, strokeWidth: 11 });
  },
  "boost/fire": (b) => {
    polygon(b, [[128, 26], [172, 94], [190, 146], [168, 210], [128, 228], [84, 210], [62, 150], [86, 90]], colors.orange, { stroke: colors.redDark, strokeWidth: 6, shadow: true });
    polygon(b, [[128, 88], [154, 132], [158, 176], [128, 206], [98, 176], [104, 132]], colors.goldLight);
  },
  "boost/rocket": (b) => {
    polygon(b, [[128, 26], [176, 94], [154, 178], [102, 178], [80, 94]], colors.red, { stroke: colors.redDark, strokeWidth: 5, shadow: true });
    circle(b, 128, 100, 24, colors.cyanLight, { stroke: colors.blueDark, strokeWidth: 4 });
    polygon(b, [[102, 178], [82, 220], [120, 188]], colors.orange);
    polygon(b, [[154, 178], [174, 220], [136, 188]], colors.orange);
    polygon(b, [[114, 178], [128, 234], [142, 178]], colors.goldLight);
  },
  "boost/lightning": (b) => {
    polygon(b, [[142, 24], [70, 142], [116, 142], [104, 232], [190, 106], [140, 106]], colors.amber, { stroke: colors.goldDark, strokeWidth: 6, shadow: true });
    polygon(b, [[132, 58], [96, 124], [130, 124], [124, 182], [166, 118], [132, 118]], colors.goldLight);
  },
  "boost/timer": (b) => {
    rect(b, 108, 28, 40, 26, 8, colors.slateLight);
    circle(b, 128, 136, 82, colors.slate, { stroke: colors.black, strokeWidth: 7, shadow: true });
    circle(b, 128, 136, 58, [71, 85, 105, 255]);
    line(b, 128, 136, 128, 88, colors.amber, 8);
    line(b, 128, 136, 170, 136, colors.amber, 6);
    circle(b, 128, 136, 10, colors.goldLight);
  },
};

async function writeIcon(name, draw) {
  const buf = makeCanvas();
  draw(buf);
  const file = path.join(outRoot, `${name}.png`);
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(buf), { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toFile(file);
}

for (const [name, draw] of Object.entries(icons)) {
  await writeIcon(name, draw);
}

console.log(`Generated ${Object.keys(icons).length} shared PNG assets in ${outRoot}`);
