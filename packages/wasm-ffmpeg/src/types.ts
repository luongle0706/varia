import type {
  AudioConversionOptions,
  GifConversionOptions,
  EngineLoadProgress,
  TranscodeProgress,
  TranscodeResult,
} from '@varia/core';

export type {
  EngineLoadProgress,
  TranscodeProgress,
  TranscodeResult,
  BatchItem,
  GifConversionOptions,
  GifCropRegion,
  GifScalePreset,
  GifDitherMode,
  StructuredError,
} from '@varia/core';

export interface TranscodeRequest {
  jobId: string;
  inputBuffer: ArrayBuffer;
  inputName: string;
  mode?: 'audio' | 'gif';
  options?: AudioConversionOptions;
  gifOptions?: GifConversionOptions;
  durationSeconds?: number;
}

export type WorkerInMessage =
  | { type: 'LOAD_ENGINE'; coreBaseUrl?: string }
  | { type: 'TRANSCODE'; payload: TranscodeRequest }
  | { type: 'CANCEL'; jobId: string };

export type WorkerOutMessage =
  | { type: 'ENGINE_LOAD_PROGRESS'; progress: EngineLoadProgress }
  | { type: 'ENGINE_LOADED' }
  | { type: 'ENGINE_ERROR'; error: string }
  | { type: 'PROGRESS'; progress: TranscodeProgress }
  | { type: 'COMPLETE'; result: TranscodeResult }
  | { type: 'ERROR'; jobId: string; error: string }
  | { type: 'CANCELLED'; jobId: string };
