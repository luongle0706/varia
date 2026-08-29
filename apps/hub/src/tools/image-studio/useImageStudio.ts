import { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import type {
  AspectRatioPreset,
  BatchImageItem,
  CropRect,
  ImageFilterConfig,
  ImageProcessResult,
  ImageStudioPipelineConfig,
  ImageTransformConfig,
  MemeTextConfig,
  ImageCompressionConfig,
} from '@varia/core';
import {
  generateUuidV4,
  loadImageElement,
  processImagePipeline,
} from '@varia/core';

export type StudioTabMode = 'quick' | 'studio';

export const DEFAULT_TRANSFORM: ImageTransformConfig = {
  rotate: 0,
  flipHorizontal: false,
  flipVertical: false,
};

export const DEFAULT_CROP: { preset: AspectRatioPreset; rect?: CropRect; circular?: boolean } = {
  preset: 'freeform',
  rect: undefined,
  circular: false,
};

export const DEFAULT_FILTERS: ImageFilterConfig = {
  preset: 'none',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  sharpen: 0,
};

export const DEFAULT_MEME: MemeTextConfig = {
  topText: '',
  bottomText: '',
  bannerText: '',
  style: 'classic',
  align: 'center',
  fontFamily: 'Impact',
  fontSize: 36,
  uppercase: true,
  textColor: '#ffffff',
  outlineColor: '#000000',
  outlineWidth: 3,
  bannerBgColor: '#ffffff',
  bannerTextColor: '#000000',
};

export const DEFAULT_COMPRESSION: ImageCompressionConfig = {
  smartMode: true,
  format: 'webp',
  quality: 85,
  targetSizeKb: null,
  maxColors: 256,
  stripExif: true,
};

export function useImageStudio() {
  const [activeMode, setActiveMode] = useState<StudioTabMode>('quick');

  // Single Active Image State
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Pipeline Configuration State
  const [transform, setTransform] = useState<ImageTransformConfig>(DEFAULT_TRANSFORM);
  const [cropPreset, setCropPreset] = useState<AspectRatioPreset>('freeform');
  const [cropRect, setCropRect] = useState<CropRect | undefined>(undefined);
  const [filters, setFilters] = useState<ImageFilterConfig>(DEFAULT_FILTERS);
  const [meme, setMeme] = useState<MemeTextConfig>(DEFAULT_MEME);
  const [compression, setCompression] = useState<ImageCompressionConfig>(DEFAULT_COMPRESSION);

  // Live Output & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveResult, setLiveResult] = useState<ImageProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batch Processing State
  const [batchItems, setBatchItems] = useState<BatchImageItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Registry for revoking object URLs safely
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const registerObjectUrl = useCallback((url: string) => {
    objectUrlsRef.current.add(url);
    return url;
  }, []);

  const revokeUrl = useCallback((url: string | null) => {
    if (url && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  }, []);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  /**
   * Loads a single image file as active target
   */
  const handleSelectImage = useCallback(
    async (file: File) => {
      try {
        setErrorMessage(null);
        setIsProcessing(true);

        if (activeImageUrl) {
          revokeUrl(activeImageUrl);
        }

        const rawUrl = registerObjectUrl(URL.createObjectURL(file));
        const img = await loadImageElement(file);

        setActiveFile(file);
        setActiveImageUrl(rawUrl);
        setImageElement(img);
        setDimensions({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });

        // Reset editing parameters for new image
        setTransform(DEFAULT_TRANSFORM);
        setCropPreset('freeform');
        setCropRect(undefined);
        setFilters(DEFAULT_FILTERS);
        setMeme(DEFAULT_MEME);

        // Run initial live pipeline
        const initialConfig: ImageStudioPipelineConfig = {
          transform: DEFAULT_TRANSFORM,
          crop: { preset: 'freeform', rect: undefined },
          filters: DEFAULT_FILTERS,
          meme: DEFAULT_MEME,
          compression,
        };

        const result = await processImagePipeline(
          img,
          initialConfig,
          file.size,
          file.name,
        );
        registerObjectUrl(result.url);
        setLiveResult(result);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setIsProcessing(false);
      }
    },
    [activeImageUrl, compression, registerObjectUrl, revokeUrl],
  );

  /**
   * Handles multiple files selection for batch processing
   */
  const handleSelectFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      if (files.length === 1 && files[0]) {
        await handleSelectImage(files[0]);
        return;
      }

      // Multiple files dropped -> Populate batch queue and set active first image
      const newItems: BatchImageItem[] = [];

      for (const file of files) {
        try {
          const img = await loadImageElement(file);
          const previewUrl = registerObjectUrl(URL.createObjectURL(file));
          newItems.push({
            id: generateUuidV4(),
            file,
            previewUrl,
            originalSize: file.size,
            dimensions: {
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
            },
            status: 'pending',
            progress: 0,
          });
        } catch {
          // Skip invalid files
        }
      }

      setBatchItems(prev => [...prev, ...newItems]);

      if (!activeFile && files[0]) {
        await handleSelectImage(files[0]);
      }
    },
    [activeFile, handleSelectImage, registerObjectUrl],
  );

  /**
   * Live Pipeline Debounced Re-computation
   */
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerLiveRender = useCallback(async () => {
    if (!imageElement || !activeFile) return;

    try {
      setIsProcessing(true);
      const pipelineConfig: ImageStudioPipelineConfig = {
        transform,
        crop: {
          preset: cropPreset,
          rect: cropRect,
          circular: cropPreset === 'circular',
        },
        filters,
        meme,
        compression,
      };

      const result = await processImagePipeline(
        imageElement,
        pipelineConfig,
        activeFile.size,
        activeFile.name,
      );

      if (liveResult?.url) {
        revokeUrl(liveResult.url);
      }

      registerObjectUrl(result.url);
      setLiveResult(result);
      setErrorMessage(null);

      // If target size was specified, sync the calculated effective quality to quality slider
      if (
        compression.targetSizeKb &&
        result.effectiveQuality &&
        result.effectiveQuality !== compression.quality
      ) {
        setCompression(prev => ({
          ...prev,
          quality: result.effectiveQuality,
        }));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error rendering live preview');
    } finally {
      setIsProcessing(false);
    }
  }, [
    imageElement,
    activeFile,
    transform,
    cropPreset,
    cropRect,
    filters,
    meme,
    compression,
    liveResult,
    registerObjectUrl,
    revokeUrl,
  ]);

  // Debounced effect for live edits
  useEffect(() => {
    if (!imageElement || !activeFile) return;

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      triggerLiveRender();
    }, 60);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [
    imageElement,
    activeFile,
    transform,
    cropPreset,
    cropRect,
    filters,
    meme,
    compression,
    triggerLiveRender,
  ]);

  /**
   * Process all pending batch items sequentially
   */
  const runBatchProcessing = useCallback(async () => {
    if (batchItems.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]!;
      if (item.status === 'done') continue;

      setBatchItems(prev =>
        prev.map(it => (it.id === item.id ? { ...it, status: 'processing', progress: 30 } : it)),
      );

      try {
        const pipelineConfig: ImageStudioPipelineConfig = {
          transform: DEFAULT_TRANSFORM,
          crop: { preset: 'freeform' },
          filters: DEFAULT_FILTERS,
          meme: DEFAULT_MEME,
          compression,
        };

        const result = await processImagePipeline(
          item.file,
          pipelineConfig,
          item.originalSize,
          item.file.name,
        );

        registerObjectUrl(result.url);

        setBatchItems(prev =>
          prev.map(it =>
            it.id === item.id
              ? { ...it, status: 'done', progress: 100, result }
              : it,
          ),
        );
      } catch (err: unknown) {
        setBatchItems(prev =>
          prev.map(it =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'error',
                  progress: 0,
                  errorMessage: err instanceof Error ? err.message : 'Compression failed',
                }
              : it,
          ),
        );
      }
    }

    setIsProcessingBatch(false);
  }, [batchItems, isProcessingBatch, compression, registerObjectUrl]);

  // Auto-run batch when items are added or compression settings change
  useEffect(() => {
    const hasPending = batchItems.some(i => i.status === 'pending');
    if (hasPending && !isProcessingBatch) {
      runBatchProcessing();
    }
  }, [batchItems, isProcessingBatch, runBatchProcessing]);

  /**
   * Handlers for crop preset change
   */
  const handleCropPresetChange = (preset: AspectRatioPreset, rect: CropRect) => {
    setCropPreset(preset);
    setCropRect(preset === 'freeform' ? undefined : rect);
  };

  const handleResetCrop = () => {
    setCropPreset('freeform');
    setCropRect(undefined);
  };

  /**
   * Download single active result
   */
  const downloadResult = () => {
    if (!liveResult) return;
    const a = document.createElement('a');
    a.href = liveResult.url;
    a.download = liveResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Download single batch item
   */
  const downloadBatchItem = (item: BatchImageItem) => {
    if (!item.result) return;
    const a = document.createElement('a');
    a.href = item.result.url;
    a.download = item.result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * Download all batch items as a bundled ZIP archive
   */
  const downloadBatchZip = async () => {
    const doneItems = batchItems.filter(i => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    for (const item of doneItems) {
      if (item.result) {
        zip.file(item.result.fileName, item.result.blob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = 'varia_compressed_images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(zipUrl);
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(i => i.id !== id));
  };

  const clearAllBatch = () => {
    setBatchItems([]);
  };

  const resetAll = () => {
    if (activeImageUrl) revokeUrl(activeImageUrl);
    if (liveResult?.url) revokeUrl(liveResult.url);
    setActiveFile(null);
    setActiveImageUrl(null);
    setImageElement(null);
    setLiveResult(null);
    setTransform(DEFAULT_TRANSFORM);
    setCropPreset('freeform');
    setCropRect(undefined);
    setFilters(DEFAULT_FILTERS);
    setMeme(DEFAULT_MEME);
    setBatchItems([]);
  };

  const originalFormat = activeFile
    ? activeFile.name.split('.').pop()?.toUpperCase() || 'JPG'
    : 'JPG';

  return {
    // Mode
    activeMode,
    setActiveMode,

    // Active File State
    activeFile,
    activeImageUrl,
    originalFormat,
    imageElement,
    dimensions,

    // Pipeline Configs
    transform,
    setTransform,
    cropPreset,
    cropRect,
    handleCropPresetChange,
    handleResetCrop,
    filters,
    setFilters,
    meme,
    setMeme,
    compression,
    setCompression,

    // Live State
    isProcessing,
    liveResult,
    errorMessage,

    // Batch State
    batchItems,
    isProcessingBatch,

    // Actions
    handleSelectImage,
    handleSelectFiles,
    downloadResult,
    downloadBatchItem,
    downloadBatchZip,
    removeBatchItem,
    clearAllBatch,
    resetAll,
  };
}
