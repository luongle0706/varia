import {
  buildFfmpegAudioArgs,
  parseFfmpegProgress,
  SUPPORTED_AUDIO_FORMATS,
} from '@varia/core';
import type {
  WorkerInMessage,
  WorkerOutMessage,
  TranscodeRequest,
} from './types';

// Minimal interface for Emscripten createFFmpegCore module
interface FFmpegCoreModule {
  exec: (...args: string[]) => number;
  FS: {
    writeFile: (path: string, data: Uint8Array) => void;
    readFile: (path: string, options?: { encoding?: 'binary' | 'utf8' }) => Uint8Array;
    unlink: (path: string) => void;
  };
  setLogger: (logger: (data: { type: string; message: string }) => void) => void;
  setProgress: (handler: (data: { progress: number; time: number }) => void) => void;
}

type CreateFFmpegCoreFn = (options?: {
  mainScriptUrlOrBlob?: string;
  locateFile?: (path: string, prefix: string) => string;
  print?: (msg: string) => void;
  printErr?: (msg: string) => void;
}) => Promise<FFmpegCoreModule>;

let core: FFmpegCoreModule | null = null;
let currentJobId: string | null = null;
let isCancelled = false;

async function initEngine(coreBaseUrl = '/ffmpeg') {
  if (core) {
    console.log('[Varia:WASM-Worker] Media engine already initialized and warm.');
    self.postMessage({ type: 'ENGINE_LOADED' } satisfies WorkerOutMessage);
    return;
  }

  console.log('[Varia:WASM-Worker] Initializing media engine from:', coreBaseUrl);

  self.postMessage({
    type: 'ENGINE_LOAD_PROGRESS',
    progress: { stage: 'Fetching media engine runtime', progress: 30 },
  } satisfies WorkerOutMessage);

  const origin = self.location.origin;
  const candidateUrls = [
    coreBaseUrl.startsWith('http') ? coreBaseUrl : `${origin}${coreBaseUrl}`,
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm',
    'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm',
  ];

  let lastError: Error | null = null;

  for (const baseUrl of candidateUrls) {
    try {
      const jsUrl = `${baseUrl}/ffmpeg-core.js`;
      const wasmUrl = `${baseUrl}/ffmpeg-core.wasm`;

      console.log(`[Varia:WASM-Worker] Loading core module from: ${jsUrl}`);
      const module = await import(/* @vite-ignore */ jsUrl);
      const createFFmpegCore: CreateFFmpegCoreFn = module.default || module;

      if (typeof createFFmpegCore !== 'function') {
        throw new Error(`createFFmpegCore is not a function (got ${typeof createFFmpegCore})`);
      }

      self.postMessage({
        type: 'ENGINE_LOAD_PROGRESS',
        progress: { stage: 'Compiling WebAssembly binary', progress: 70 },
      } satisfies WorkerOutMessage);

      console.log(`[Varia:WASM-Worker] Compiling WASM binary from: ${wasmUrl}`);
      const payload = btoa(JSON.stringify({ wasmURL: wasmUrl, workerURL: '' }));

      core = await createFFmpegCore({
        mainScriptUrlOrBlob: `${jsUrl}#${payload}`,
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) return wasmUrl;
          return prefix + path;
        },
        print: (msg: string) => console.log('[Varia:FFmpeg-stdout]', msg),
        printErr: (msg: string) => console.warn('[Varia:FFmpeg-stderr]', msg),
      });

      console.log('[Varia:WASM-Worker] Media Engine successfully compiled and loaded!');

      self.postMessage({
        type: 'ENGINE_LOAD_PROGRESS',
        progress: { stage: 'Engine Ready', progress: 100 },
      } satisfies WorkerOutMessage);

      self.postMessage({ type: 'ENGINE_LOADED' } satisfies WorkerOutMessage);
      return;
    } catch (err) {
      console.warn(`[Varia:WASM-Worker] Candidate ${baseUrl} failed:`, err);
      if (err instanceof Error && err.stack) {
        console.warn('[Varia:WASM-Worker] Stack trace:', err.stack);
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  console.error('[Varia:WASM-Worker] All candidate sources failed to load FFmpeg engine:', lastError);
  self.postMessage({
    type: 'ENGINE_ERROR',
    error: `Failed to initialize FFmpeg engine: ${lastError?.message || 'Unknown error'}`,
  } satisfies WorkerOutMessage);
}

async function handleTranscode(req: TranscodeRequest) {
  if (!core) {
    self.postMessage({
      type: 'ERROR',
      jobId: req.jobId,
      error: 'FFmpeg engine is not loaded yet',
    } satisfies WorkerOutMessage);
    return;
  }

  currentJobId = req.jobId;
  isCancelled = false;

  console.log(`[Varia:WASM-Worker] Starting conversion: ${req.inputName} (${req.inputBuffer.byteLength} bytes) -> ${req.options.format.toUpperCase()}`);
  console.time(`[Varia:WASM-Worker] Transcode ${req.jobId}`);

  const targetExt = SUPPORTED_AUDIO_FORMATS[req.options.format]?.extension || `.${req.options.format}`;
  const inputExt = req.inputName.slice(req.inputName.lastIndexOf('.')) || '.mp4';
  const virtualInputName = `input_${req.jobId}${inputExt}`;
  const virtualOutputName = `output_${req.jobId}${targetExt}`;

  // Log listener for progress parsing
  core.setLogger(({ message }) => {
    if (isCancelled) return;
    const progress = parseFfmpegProgress(message, req.durationSeconds);
    if (progress) {
      self.postMessage({
        type: 'PROGRESS',
        progress: {
          jobId: req.jobId,
          percent: progress.percent,
          timeSeconds: progress.timeSeconds,
          totalDuration: req.durationSeconds,
        },
      } satisfies WorkerOutMessage);
    }
  });

  try {
    // 1. Write input file to virtual filesystem
    core.FS.writeFile(virtualInputName, new Uint8Array(req.inputBuffer));

    if (isCancelled) {
      safeDelete(virtualInputName);
      self.postMessage({ type: 'CANCELLED', jobId: req.jobId } satisfies WorkerOutMessage);
      return;
    }

    // 2. Build FFmpeg command arguments
    const args = buildFfmpegAudioArgs(virtualInputName, virtualOutputName, req.options, req.durationSeconds);
    console.log('[Varia:WASM-Worker] Executing FFmpeg command:', args.join(' '));

    // 3. Execute conversion
    const exitCode = core.exec(...args);
    console.log('[Varia:WASM-Worker] FFmpeg completed with exit code:', exitCode);

    if (isCancelled) {
      safeDelete(virtualInputName);
      safeDelete(virtualOutputName);
      self.postMessage({ type: 'CANCELLED', jobId: req.jobId } satisfies WorkerOutMessage);
      return;
    }

    if (exitCode !== 0) {
      throw new Error(`FFmpeg transcoding failed with exit code ${exitCode}`);
    }

    // 4. Read output file from virtual filesystem
    const rawOutput = core.FS.readFile(virtualOutputName);
    const outputBuffer = rawOutput.buffer.slice(rawOutput.byteOffset, rawOutput.byteOffset + rawOutput.byteLength) as ArrayBuffer;

    safeDelete(virtualInputName);
    safeDelete(virtualOutputName);

    const formatInfo = SUPPORTED_AUDIO_FORMATS[req.options.format];
    const baseName = req.inputName.replace(/\.[^/.]+$/, '');
    const finalOutputName = `${baseName}${formatInfo?.extension || targetExt}`;

    console.timeEnd(`[Varia:WASM-Worker] Transcode ${req.jobId}`);
    console.log(`[Varia:WASM-Worker] Result generated: ${finalOutputName} (${outputBuffer.byteLength} bytes)`);

    // 5. Transfer result back to main thread
    self.postMessage(
      {
        type: 'COMPLETE',
        result: {
          jobId: req.jobId,
          outputBuffer,
          outputName: finalOutputName,
          format: req.options.format,
          mimeType: formatInfo?.mimeType || 'audio/mpeg',
          originalSize: req.inputBuffer.byteLength,
          outputSize: outputBuffer.byteLength,
        },
      } satisfies WorkerOutMessage,
      [outputBuffer],
    );
  } catch (error) {
    safeDelete(virtualInputName);
    safeDelete(virtualOutputName);
    console.error('[Varia:WASM-Worker] Transcoding error:', error);
    if (error instanceof Error && error.stack) {
      console.error('[Varia:WASM-Worker] Transcoding error stack:', error.stack);
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    self.postMessage({
      type: 'ERROR',
      jobId: req.jobId,
      error: `Conversion failed: ${errorMsg}`,
    } satisfies WorkerOutMessage);
  } finally {
    if (currentJobId === req.jobId) {
      currentJobId = null;
    }
  }
}

function safeDelete(path: string) {
  if (!core) return;
  try {
    core.FS.unlink(path);
  } catch {
    // Ignore if file doesn't exist
  }
}

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'LOAD_ENGINE':
      await initEngine(msg.coreBaseUrl);
      break;
    case 'TRANSCODE':
      await handleTranscode(msg.payload);
      break;
    case 'CANCEL':
      if (currentJobId === msg.jobId) {
        isCancelled = true;
      }
      break;
  }
};
