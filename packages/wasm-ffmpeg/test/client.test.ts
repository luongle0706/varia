import { describe, it, expect } from 'vitest';
import { FfmpegClient } from '../src/FfmpegClient';
import type { TranscodeResult } from '../src/types';

describe('FfmpegClient', () => {
  it('should instantiate properly and track loaded state', () => {
    const client = new FfmpegClient();
    expect(client.isEngineLoaded()).toBe(false);
  });

  it('should generate a valid ZIP blob from transcode results', async () => {
    const client = new FfmpegClient();

    const sampleResults: TranscodeResult[] = [
      {
        jobId: 'job-1',
        outputBuffer: new Uint8Array([1, 2, 3, 4]).buffer,
        outputName: 'audio1.mp3',
        format: 'mp3',
        mimeType: 'audio/mpeg',
        originalSize: 100,
        outputSize: 4,
      },
      {
        jobId: 'job-2',
        outputBuffer: new Uint8Array([5, 6, 7, 8]).buffer,
        outputName: 'audio2.wav',
        format: 'wav',
        mimeType: 'audio/wav',
        originalSize: 200,
        outputSize: 4,
      },
    ];

    const zipBlob = await client.createBatchZip(sampleResults);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);
    expect(zipBlob.type).toBe('application/zip');
  });

  it('should instantiate properly and track loaded state', () => {
    const client = new FfmpegClient();
    expect(client.isEngineLoaded()).toBe(false);
    client.terminate();
  });
});
