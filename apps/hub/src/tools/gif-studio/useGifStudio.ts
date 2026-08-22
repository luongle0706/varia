import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type GifConversionOptions,
  type StructuredError,
  type TranscodeResult,
  validateGifOptions,
  generateUuidV4,
} from '@varia/core';
import { FfmpegClient } from '@varia/wasm-ffmpeg';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export interface UseGifStudioReturn {
  // State
  videoFile: File | null;
  videoUrl: string | null;
  videoMeta: VideoMetadata | null;
  options: GifConversionOptions;
  isConverting: boolean;
  progress: number;
  stage: string;
  result: TranscodeResult | null;
  resultGifUrl: string | null;
  error: StructuredError | null;

  // Actions
  handleVideoSelect: (file: File) => Promise<void>;
  updateOptions: (newOptions: Partial<GifConversionOptions>) => void;
  updateTrim: (start: number, end: number) => void;
  startConversion: () => Promise<void>;
  cancelConversion: () => void;
  handleErrorAction: (actionType: string) => void;
  dismissError: () => void;
  resetSession: () => void;
}

export function useGifStudio(): UseGifStudioReturn {
  const clientRef = useRef<FfmpegClient | null>(null);
  const activeJobIdRef = useRef<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);

  const [options, setOptions] = useState<GifConversionOptions>({
    fps: 15,
    scalePreset: 'original',
    speed: 1.0,
    rotate: 0,
    loopCount: 0,
    dither: 'bayer',
    bayerScale: 2,
    maxColors: 128,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing Engine');
  const [result, setResult] = useState<TranscodeResult | null>(null);
  const [resultGifUrl, setResultGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<StructuredError | null>(null);

  // Initialize FFmpeg WASM client
  useEffect(() => {
    clientRef.current = new FfmpegClient();
    return () => {
      if (clientRef.current) {
        clientRef.current.terminate();
      }
    };
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (resultGifUrl) URL.revokeObjectURL(resultGifUrl);
    };
  }, [videoUrl, resultGifUrl]);

  /**
   * Handle video file selection and load metadata
   */
  const handleVideoSelect = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setResult(null);
        if (resultGifUrl) {
          URL.revokeObjectURL(resultGifUrl);
          setResultGifUrl(null);
        }

        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }

        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);

        // Extract duration and natural dimensions
        const videoEl = document.createElement('video');
        videoEl.src = url;
        videoEl.preload = 'metadata';

        await new Promise<void>((resolve, reject) => {
          videoEl.onloadedmetadata = () => {
            const duration = videoEl.duration || 5;
            const width = videoEl.videoWidth || 640;
            const height = videoEl.videoHeight || 360;

            setVideoMeta({ duration, width, height });
            setOptions(prev => ({
              ...prev,
              trimStart: 0,
              trimEnd: Math.min(10, duration), // Default to first 10 seconds or full video
            }));
            resolve();
          };
          videoEl.onerror = () => {
            reject(new Error('Could not parse video metadata. Format may be unsupported.'));
          };
        });
      } catch (err) {
        setError({
          category: 'user_validation',
          title: 'Video Ingestion Failed',
          message: err instanceof Error ? err.message : 'Failed to read video file',
          field: 'file',
        });
      }
    },
    [videoUrl, resultGifUrl],
  );

  const updateOptions = useCallback(
    (newOptions: Partial<GifConversionOptions>) => {
      setOptions(prev => {
        const updated = { ...prev, ...newOptions };
        // Real-time validation warning check if videoMeta exists
        if (videoMeta) {
          const valError = validateGifOptions(updated, videoMeta);
          if (valError && valError.category === 'user_validation') {
            setError(valError);
          } else if (error?.category === 'user_validation') {
            setError(null);
          }
        }
        return updated;
      });
    },
    [videoMeta, error],
  );

  const updateTrim = useCallback(
    (start: number, end: number) => {
      setOptions(prev => ({
        ...prev,
        trimStart: start,
        trimEnd: end,
      }));
      if (error?.field === 'trim') {
        setError(null);
      }
    },
    [error],
  );

  /**
   * Execute GIF Conversion
   */
  const startConversion = useCallback(async () => {
    if (!videoFile || !clientRef.current) return;

    // Validate options
    const validationError = validateGifOptions(options, videoMeta || undefined);
    if (validationError) {
      setError(validationError);
      if (validationError.category === 'user_validation') {
        return;
      }
    }

    try {
      setIsConverting(true);
      setProgress(0);
      setStage('Loading video into memory...');
      setError(null);

      const buffer = await videoFile.arrayBuffer();
      const jobId = generateUuidV4();
      activeJobIdRef.current = jobId;

      setStage('Compiling palette & rendering frames...');

      const res = await clientRef.current.transcodeGif(
        {
          jobId,
          inputBuffer: buffer,
          inputName: videoFile.name,
          mode: 'gif',
          gifOptions: options,
          durationSeconds:
            options.trimEnd && typeof options.trimStart === 'number'
              ? Math.max(0.1, options.trimEnd - options.trimStart)
              : videoMeta?.duration,
        },
        prog => {
          setProgress(prog.percent);
          if (prog.percent < 40) {
            setStage('Analyzing colors & building palette...');
          } else if (prog.percent < 90) {
            setStage('Applying dither & rendering GIF frames...');
          } else {
            setStage('Packaging GIF output...');
          }
        },
      );

      const blob = new Blob([res.outputBuffer], { type: 'image/gif' });
      const gifBlobUrl = URL.createObjectURL(blob);

      setResult(res);
      setResultGifUrl(gifBlobUrl);
      setProgress(100);
      setStage('Complete');
    } catch (err) {
      console.error('[Varia:GIF-Studio] Conversion error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      const isMemory = msg.toLowerCase().includes('memory') || msg.toLowerCase().includes('oom');

      setError({
        category: isMemory ? 'memory_limit' : 'system_runtime',
        title: isMemory ? 'Browser Memory Limit Exceeded' : 'Conversion Failed',
        message: isMemory
          ? 'The video clip or resolution is too large for WebAssembly memory. Try lowering the FPS or trimming a shorter clip.'
          : msg,
        technicalDetails: msg,
        actionType: 'reset_settings',
        actionLabel: 'Reset to Safe Settings',
      });
    } finally {
      setIsConverting(false);
      activeJobIdRef.current = null;
    }
  }, [videoFile, options, videoMeta]);

  const cancelConversion = useCallback(() => {
    if (activeJobIdRef.current && clientRef.current) {
      clientRef.current.cancelJob(activeJobIdRef.current);
      setIsConverting(false);
      setProgress(0);
      setStage('Cancelled');
    }
  }, []);

  const handleErrorAction = useCallback(
    (actionType: string) => {
      if (actionType === 'clamp_trim' && videoMeta) {
        setOptions(prev => ({
          ...prev,
          trimStart: 0,
          trimEnd: Math.min(10, videoMeta.duration),
        }));
        setError(null);
      } else if (actionType === 'reset_crop') {
        setOptions(prev => ({ ...prev, crop: undefined }));
        setError(null);
      } else if (actionType === 'reset_settings') {
        setOptions({
          fps: 15,
          scalePreset: '360p',
          speed: 1.0,
          rotate: 0,
          loopCount: 0,
          dither: 'bayer',
          bayerScale: 2,
          maxColors: 256,
          trimStart: 0,
          trimEnd: Math.min(6, videoMeta?.duration || 6),
        });
        setError(null);
      } else if (actionType === 'retry') {
        startConversion();
      }
    },
    [videoMeta, startConversion],
  );

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const resetSession = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (resultGifUrl) URL.revokeObjectURL(resultGifUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setResult(null);
    setResultGifUrl(null);
    setError(null);
    setIsConverting(false);
    setProgress(0);
  }, [videoUrl, resultGifUrl]);

  return {
    videoFile,
    videoUrl,
    videoMeta,
    options,
    isConverting,
    progress,
    stage,
    result,
    resultGifUrl,
    error,
    handleVideoSelect,
    updateOptions,
    updateTrim,
    startConversion,
    cancelConversion,
    handleErrorAction,
    dismissError,
    resetSession,
  };
}
