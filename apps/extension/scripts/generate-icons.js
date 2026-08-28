// Generate crisp PNG icons without external dependencies using Node.js zlib and PNG spec
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPNG(size) {
  // Simple PNG generator with gradient background and link symbol
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(height * (width * 4 + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    buffer[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Normalized coordinates from center (-1 to 1)
      const nx = (x - width / 2) / (width / 2);
      const ny = (y - height / 2) / (height / 2);
      const r = Math.sqrt(nx * nx + ny * ny);

      // Rounded rect mask
      const cornerRadius = 0.25;
      const qx = Math.max(0, Math.abs(nx) - (1 - cornerRadius));
      const qy = Math.max(0, Math.abs(ny) - (1 - cornerRadius));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);
      const insideBox = (Math.abs(nx) <= 1 && Math.abs(ny) <= 1) && (cornerDist <= cornerRadius);

      if (!insideBox) {
        // Transparent
        buffer[pxOffset] = 0;
        buffer[pxOffset + 1] = 0;
        buffer[pxOffset + 2] = 0;
        buffer[pxOffset + 3] = 0;
        continue;
      }

      // Violet-Cyan gradient background
      const grad = (x + y) / (width + height);
      let red = Math.round(99 + grad * (6 - 99));     // 6366f1 to 06b6d4
      let green = Math.round(102 + grad * (182 - 102));
      let blue = Math.round(241 + grad * (212 - 241));
      let alpha = 255;

      // Draw stylized link/bolt icon in center
      const angle = Math.PI / 4; // 45 deg
      const rx = nx * Math.cos(angle) - ny * Math.sin(angle);
      const ry = nx * Math.sin(angle) + ny * Math.cos(angle);

      // Two rounded link capsules
      const inLink1 = (Math.abs(rx - 0.22) < 0.28 && Math.abs(ry) < 0.16) && (Math.abs(rx - 0.22) > 0.12 || Math.abs(ry) > 0.06);
      const inLink2 = (Math.abs(rx + 0.22) < 0.28 && Math.abs(ry) < 0.16) && (Math.abs(rx + 0.22) > 0.12 || Math.abs(ry) > 0.06);
      const inCenterBar = Math.abs(rx) < 0.18 && Math.abs(ry) < 0.05;

      if (inLink1 || inLink2 || inCenterBar) {
        red = 255;
        green = 255;
        blue = 255;
      }

      buffer[pxOffset] = red;
      buffer[pxOffset + 1] = green;
      buffer[pxOffset + 2] = blue;
      buffer[pxOffset + 3] = alpha;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crcBuffer = Buffer.concat([Buffer.from(type), data]);
  const crcValue = crc32(crcBuffer);
  chunk.writeInt32BE(crcValue, 8 + length);
  return chunk;
}

// CRC32 table & calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) | 0;
}

const outDir = path.resolve(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  const filePath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated: ${filePath}`);
}
