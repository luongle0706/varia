import JSZip from 'jszip';
import type {
  EngineLoadProgress,
  TranscodeProgress,
  TranscodeRequest,
  TranscodeResult,
  WorkerInMessage,
  WorkerOutMessage,
} from './types';

export interface FfmpegClientOptions {
  coreBaseUrl?: string;
  workerFactory?: () => Worker;
}

export class FfmpegClient {
  private worker: Worker | null = null;
  private workerFactory?: () => Worker;
  private coreBaseUrl?: string;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private progressCallbacks = new Map<string, (p: TranscodeProgress) => void>();
  private activeJobs = new Map<
    string,
    {
      resolve: (res: TranscodeResult) => void;
      reject: (err: Error) => void;
    }
  >();

  constructor(options: FfmpegClientOptions = {}) {
    this.coreBaseUrl = options.coreBaseUrl;
    this.workerFactory = options.workerFactory;
  }

  private getWorker(): Worker {
    if (!this.worker) {
      if (this.workerFactory) {
        this.worker = this.workerFactory();
      } else {
        console.log('[Varia:WASM-Client] Spawning dedicated Web Worker thread...');
        this.worker = new Worker(new URL('./ffmpeg.worker.ts', import.meta.url), {
          type: 'module',
        });
      }
      this.setupWorkerListeners(this.worker);
    }
    return this.worker;
  }

  private setupWorkerListeners(worker: Worker) {
    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data;
      switch (msg.type) {
        case 'PROGRESS': {
          const cb = this.progressCallbacks.get(msg.progress.jobId);
          if (cb) cb(msg.progress);
          break;
        }
        case 'COMPLETE': {
          console.log(`[Varia:WASM-Client] Job ${msg.result.jobId} completed successfully (${msg.result.outputName})`);
          const job = this.activeJobs.get(msg.result.jobId);
          if (job) {
            this.activeJobs.delete(msg.result.jobId);
            this.progressCallbacks.delete(msg.result.jobId);
            job.resolve(msg.result);
          }
          break;
        }
        case 'ERROR': {
          console.error(`[Varia:WASM-Client] Error reported for job ${msg.jobId}:`, msg.error);
          const job = this.activeJobs.get(msg.jobId);
          if (job) {
            this.activeJobs.delete(msg.jobId);
            this.progressCallbacks.delete(msg.jobId);
            job.reject(new Error(msg.error));
          }
          break;
        }
        case 'CANCELLED': {
          console.warn(`[Varia:WASM-Client] Job ${msg.jobId} was cancelled by user.`);
          const job = this.activeJobs.get(msg.jobId);
          if (job) {
            this.activeJobs.delete(msg.jobId);
            this.progressCallbacks.delete(msg.jobId);
            job.reject(new Error('Conversion was cancelled by user'));
          }
          break;
        }
      }
    };

    worker.onerror = err => {
      console.error('[Varia:WASM-Client] Worker runtime error caught:', err);
      for (const [jobId, job] of this.activeJobs.entries()) {
        job.reject(new Error(`Worker error: ${err.message || 'Unknown Web Worker error'}`));
        this.activeJobs.delete(jobId);
        this.progressCallbacks.delete(jobId);
      }
    };
  }

  /**
   * Check if engine is ready
   */
  public isEngineLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Load the FFmpeg WASM Core Engine
   */
  public async loadEngine(onProgress?: (p: EngineLoadProgress) => void): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    const worker = this.getWorker();

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const handleLoadMessage = (e: MessageEvent<WorkerOutMessage>) => {
        const msg = e.data;
        if (msg.type === 'ENGINE_LOAD_PROGRESS') {
          console.log(`[Varia:WASM-Client] Engine Status: ${msg.progress.stage} (${msg.progress.progress}%)`);
          if (onProgress) onProgress(msg.progress);
        } else if (msg.type === 'ENGINE_LOADED') {
          console.log('[Varia:WASM-Client] Engine initialization confirmed ready!');
          this.isLoaded = true;
          worker.removeEventListener('message', handleLoadMessage);
          resolve();
        } else if (msg.type === 'ENGINE_ERROR') {
          console.error('[Varia:WASM-Client] Engine initialization error:', msg.error);
          worker.removeEventListener('message', handleLoadMessage);
          this.loadPromise = null;
          reject(new Error(msg.error));
        }
      };

      worker.addEventListener('message', handleLoadMessage);
      worker.postMessage({
        type: 'LOAD_ENGINE',
        coreBaseUrl: this.coreBaseUrl,
      } satisfies WorkerInMessage);
    });

    return this.loadPromise;
  }

  /**
   * Transcode a media file buffer to the target audio format
   */
  public async transcodeAudio(
    request: TranscodeRequest,
    onProgress?: (p: TranscodeProgress) => void,
  ): Promise<TranscodeResult> {
    if (!this.isLoaded) {
      await this.loadEngine();
    }

    const worker = this.getWorker();

    if (onProgress) {
      this.progressCallbacks.set(request.jobId, onProgress);
    }

    return new Promise<TranscodeResult>((resolve, reject) => {
      this.activeJobs.set(request.jobId, { resolve, reject });

      worker.postMessage(
        {
          type: 'TRANSCODE',
          payload: request,
        } satisfies WorkerInMessage,
        [request.inputBuffer],
      );
    });
  }

  /**
   * Cancel an ongoing transcode job
   */
  public cancelJob(jobId: string): void {
    if (this.worker && this.activeJobs.has(jobId)) {
      this.worker.postMessage({
        type: 'CANCEL',
        jobId,
      } satisfies WorkerInMessage);
    }
  }

  /**
   * Bundle multiple transcode outputs into a downloadable ZIP archive
   */
  public async createBatchZip(results: TranscodeResult[]): Promise<Blob> {
    console.log(`[Varia:WASM-Client] Archiving ${results.length} files into ZIP bundle...`);
    const zip = new JSZip();

    for (const res of results) {
      zip.file(res.outputName, res.outputBuffer);
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    console.log(`[Varia:WASM-Client] ZIP bundle generated (${zipBlob.size} bytes).`);
    return zipBlob;
  }

  /**
   * Terminate the Web Worker and release memory
   */
  public terminate(): void {
    if (this.worker) {
      console.log('[Varia:WASM-Client] Terminating worker and freeing resources.');
      this.worker.terminate();
      this.worker = null;
      this.isLoaded = false;
      this.loadPromise = null;
      this.activeJobs.clear();
      this.progressCallbacks.clear();
    }
  }
}
