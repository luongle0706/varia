import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type AudioConversionOptions,
  type AudioFormat,
  type BatchItem,
  type TranscodeResult,
  generateUuidV4,
} from '@varia/core';
import { FfmpegClient } from '@varia/wasm-ffmpeg';

export interface UseAudioConverterReturn {
  // State
  queue: BatchItem[];
  activeItem: BatchItem | null;
  activeAudioBuffer: AudioBuffer | null;
  activeAudioUrl: string | null;
  isConverting: boolean;
  engineLoading: boolean;
  engineLoadProgress: number;
  engineLoadStage: string;
  options: AudioConversionOptions;
  latestResult: TranscodeResult | null;
  latestResultUrl: string | null;
  errorMessage: string | null;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  selectActiveItem: (id: string) => Promise<void>;
  removeQueueItem: (id: string) => void;
  clearQueue: () => void;
  updateOptions: (newOptions: AudioConversionOptions) => void;
  updateItemFormat: (id: string, format: AudioFormat) => void;
  updateTrimRegion: (start: number, end: number) => void;
  convertActiveItem: () => Promise<void>;
  convertAllQueue: () => Promise<void>;
  cancelCurrentConversion: () => void;
  downloadResult: (result: TranscodeResult) => void;
  downloadAllZip: () => Promise<void>;
  resetActiveSession: () => void;
}

export function useAudioConverter(): UseAudioConverterReturn {
  const clientRef = useRef<FfmpegClient | null>(null);
  const activeAudioContextRef = useRef<AudioContext | null>(null);

  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAudioBuffer, setActiveAudioBuffer] = useState<AudioBuffer | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);

  const [isConverting, setIsConverting] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineLoadProgress, setEngineLoadProgress] = useState(0);
  const [engineLoadStage, setEngineLoadStage] = useState('');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const [options, setOptions] = useState<AudioConversionOptions>({
    format: 'mp3',
    bitrate: '192k',
    bitrateMode: 'cbr',
    volumeBoost: 1.0,
    fadeIn: 0,
    fadeOut: 0,
    trimStart: 0,
    trimEnd: 0,
  });

  const [latestResult, setLatestResult] = useState<TranscodeResult | null>(null);
  const [latestResultUrl, setLatestResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize FfmpegClient instance
  useEffect(() => {
    const client = new FfmpegClient();
    clientRef.current = client;

    return () => {
      client.terminate();
    };
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl);
      if (latestResultUrl) URL.revokeObjectURL(latestResultUrl);
    };
  }, [activeAudioUrl, latestResultUrl]);

  // Decode audio buffer for WaveformTrimmer
  const decodeAudioForWaveform = useCallback(async (file: File) => {
    try {
      if (!activeAudioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        activeAudioContextRef.current = new AudioCtx();
      }

      const arrayBuffer = await file.slice(0, 50 * 1024 * 1024).arrayBuffer(); // Slice first 50MB for fast wave decoding
      const audioBuffer = await activeAudioContextRef.current.decodeAudioData(arrayBuffer);
      setActiveAudioBuffer(audioBuffer);
      setOptions(prev => ({
        ...prev,
        trimStart: 0,
        trimEnd: audioBuffer.duration,
      }));
    } catch {
      // If native browser decoder fails (e.g. video container MKV/AVI), placeholder wave will render
      setActiveAudioBuffer(null);
    }
  }, []);

  // Add files to batch queue
  const addFiles = useCallback(
    async (files: File[]) => {
      const newItems: BatchItem[] = files.map(file => ({
        id: generateUuidV4(),
        file,
        name: file.name,
        size: file.size,
        options: { ...options },
        status: 'idle',
        progress: 0,
      }));

      setQueue(prev => [...prev, ...newItems]);

      // If no active item, select the first one added
      if (!activeId && newItems[0]) {
        const firstItem = newItems[0];
        setActiveId(firstItem.id);
        const url = URL.createObjectURL(firstItem.file);
        setActiveAudioUrl(url);
        await decodeAudioForWaveform(firstItem.file);
      }
    },
    [activeId, decodeAudioForWaveform, options],
  );

  // Select active item for single studio mode
  const selectActiveItem = useCallback(
    async (id: string) => {
      const item = queue.find(q => q.id === id);
      if (!item) return;

      setActiveId(id);
      if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
      }
      const url = URL.createObjectURL(item.file);
      setActiveAudioUrl(url);
      setOptions({ ...item.options });
      await decodeAudioForWaveform(item.file);
    },
    [queue, activeAudioUrl, decodeAudioForWaveform],
  );

  const removeQueueItem = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    setActiveId(prev => (prev === id ? null : prev));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setActiveId(null);
    if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl);
    if (latestResultUrl) URL.revokeObjectURL(latestResultUrl);
    setActiveAudioUrl(null);
    setLatestResultUrl(null);
    setLatestResult(null);
    setActiveAudioBuffer(null);
  }, [activeAudioUrl, latestResultUrl]);

  const updateOptions = useCallback((newOptions: AudioConversionOptions) => {
    setOptions(newOptions);
  }, []);

  const updateItemFormat = useCallback((id: string, format: AudioFormat) => {
    setQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, options: { ...item.options, format } } : item,
      ),
    );
  }, []);

  const updateTrimRegion = useCallback((start: number, end: number) => {
    setOptions(prev => ({
      ...prev,
      trimStart: start,
      trimEnd: end,
    }));
  }, []);

  // Convert Single Active Item
  const convertActiveItem = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    const activeItem = queue.find(q => q.id === activeId);
    if (!activeItem) return;

    setIsConverting(true);
    setErrorMessage(null);
    const jobId = generateUuidV4();
    setCurrentJobId(jobId);

    try {
      // 1. Ensure engine is loaded
      if (!client.isEngineLoaded()) {
        setEngineLoading(true);
        await client.loadEngine(p => {
          setEngineLoadProgress(p.progress);
          setEngineLoadStage(p.stage);
        });
        setEngineLoading(false);
      }

      // 2. Read array buffer
      const inputBuffer = await activeItem.file.arrayBuffer();

      // 3. Transcode
      const result = await client.transcodeAudio(
        {
          jobId,
          inputBuffer,
          inputName: activeItem.file.name,
          options,
          durationSeconds: activeAudioBuffer?.duration,
        },
        progress => {
          setQueue(prev =>
            prev.map(item =>
              item.id === activeItem.id ? { ...item, progress: progress.percent, status: 'converting' } : item,
            ),
          );
        },
      );

      // 4. Update result state
      const blob = new Blob([result.outputBuffer], { type: result.mimeType });
      if (latestResultUrl) URL.revokeObjectURL(latestResultUrl);
      const url = URL.createObjectURL(blob);

      setLatestResult(result);
      setLatestResultUrl(url);

      setQueue(prev =>
        prev.map(item =>
          item.id === activeItem.id ? { ...item, status: 'done', progress: 100, result } : item,
        ),
      );
    } catch (err) {
      console.error('[Varia:AudioStudio] convertActiveItem failed:', err);
      if (err instanceof Error && err.stack) {
        console.error('[Varia:AudioStudio] Stack trace:', err.stack);
      }
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setQueue(prev =>
        prev.map(item =>
          item.id === activeItem.id ? { ...item, status: 'error', error: msg } : item,
        ),
      );
    } finally {
      setIsConverting(false);
      setEngineLoading(false);
      setCurrentJobId(null);
    }
  }, [activeId, queue, options, activeAudioBuffer, latestResultUrl]);

  // Convert All Queue Items Sequentially
  const convertAllQueue = useCallback(async () => {
    const client = clientRef.current;
    if (!client || queue.length === 0) return;

    setIsConverting(true);
    setErrorMessage(null);

    try {
      if (!client.isEngineLoaded()) {
        setEngineLoading(true);
        await client.loadEngine(p => {
          setEngineLoadProgress(p.progress);
          setEngineLoadStage(p.stage);
        });
        setEngineLoading(false);
      }

      for (const item of queue) {
        if (item.status === 'done') continue;

        const jobId = generateUuidV4();
        setCurrentJobId(jobId);

        setQueue(prev =>
          prev.map(q => (q.id === item.id ? { ...q, status: 'converting', progress: 0 } : q)),
        );

        const inputBuffer = await item.file.arrayBuffer();

        const result = await client.transcodeAudio(
          {
            jobId,
            inputBuffer,
            inputName: item.file.name,
            options: item.options,
          },
          progress => {
            setQueue(prev =>
              prev.map(q => (q.id === item.id ? { ...q, progress: progress.percent } : q)),
            );
          },
        );

        setQueue(prev =>
          prev.map(q => (q.id === item.id ? { ...q, status: 'done', progress: 100, result } : q)),
        );
      }
    } catch (err) {
      console.error('[Varia:AudioStudio] convertAllQueue failed:', err);
      if (err instanceof Error && err.stack) {
        console.error('[Varia:AudioStudio] Stack trace:', err.stack);
      }
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsConverting(false);
      setEngineLoading(false);
      setCurrentJobId(null);
    }
  }, [queue]);

  const cancelCurrentConversion = useCallback(() => {
    if (currentJobId && clientRef.current) {
      clientRef.current.cancelJob(currentJobId);
      setIsConverting(false);
      setEngineLoading(false);
    }
  }, [currentJobId]);

  const downloadResult = useCallback((res: TranscodeResult) => {
    const blob = new Blob([res.outputBuffer], { type: res.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = res.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const downloadAllZip = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    const completedResults = queue
      .map(item => item.result)
      .filter((res): res is TranscodeResult => Boolean(res));

    if (completedResults.length === 0) return;

    const zipBlob = await client.createBatchZip(completedResults);
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'varia-audio-bundle.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [queue]);

  const resetActiveSession = useCallback(() => {
    setLatestResult(null);
    if (latestResultUrl) URL.revokeObjectURL(latestResultUrl);
    setLatestResultUrl(null);
    setErrorMessage(null);
  }, [latestResultUrl]);

  const activeItem = queue.find(q => q.id === activeId) || null;

  return {
    queue,
    activeItem,
    activeAudioBuffer,
    activeAudioUrl,
    isConverting,
    engineLoading,
    engineLoadProgress,
    engineLoadStage,
    options,
    latestResult,
    latestResultUrl,
    errorMessage,
    addFiles,
    selectActiveItem,
    removeQueueItem,
    clearQueue,
    updateOptions,
    updateItemFormat,
    updateTrimRegion,
    convertActiveItem,
    convertAllQueue,
    cancelCurrentConversion,
    downloadResult,
    downloadAllZip,
    resetActiveSession,
  };
}
