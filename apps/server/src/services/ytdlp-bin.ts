import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.resolve(__dirname, '../../bin');
const IS_WINDOWS = os.platform() === 'win32';
const IS_MAC = os.platform() === 'darwin';

const BINARY_NAME = IS_WINDOWS ? 'yt-dlp.exe' : 'yt-dlp';
const BINARY_PATH = path.join(BIN_DIR, BINARY_NAME);

/**
 * Get download URL for the standalone platform executable
 */
function getDownloadUrl(): string {
  if (IS_WINDOWS) {
    return 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
  }
  if (IS_MAC) {
    return 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
  }
  return 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
}

let ensurePromise: Promise<string> | null = null;

/**
 * Ensure the standalone yt-dlp binary is installed and executable
 */
export async function ensureYtDlpBinary(): Promise<string> {
  if (fs.existsSync(BINARY_PATH)) {
    return BINARY_PATH;
  }

  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    if (!fs.existsSync(BIN_DIR)) {
      fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    const downloadUrl = getDownloadUrl();
    console.log(`[Varia:Server-YTDLP] Fetching standalone binary from: ${downloadUrl}`);

    const res = await fetch(downloadUrl);
    if (!res.ok || !res.body) {
      throw new Error(`Failed to download yt-dlp binary (${res.status} ${res.statusText})`);
    }

    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(BINARY_PATH, Buffer.from(arrayBuffer));

    if (!IS_WINDOWS) {
      fs.chmodSync(BINARY_PATH, 0o755);
    }

    console.log(`[Varia:Server-YTDLP] Standalone binary installed at: ${BINARY_PATH}`);
    return BINARY_PATH;
  })();

  return ensurePromise;
}

/**
 * Execute yt-dlp safely with vector array arguments (zero shell injection)
 */
export async function execYtDlp(args: string[]): Promise<string> {
  const binPath = await ensureYtDlpBinary();

  return new Promise((resolve, reject) => {
    execFile(
      binPath,
      args,
      {
        maxBuffer: 50 * 1024 * 1024,
        shell: false,
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[Varia:Server-YTDLP] Error executing yt-dlp:', stderr || error.message);
          return reject(new Error(stderr || error.message));
        }
        resolve(stdout);
      },
    );
  });
}

/**
 * Spawn yt-dlp for direct pipeline streaming
 */
export async function spawnYtDlp(args: string[]): Promise<ChildProcess> {
  const binPath = await ensureYtDlpBinary();

  return spawn(binPath, args, {
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
