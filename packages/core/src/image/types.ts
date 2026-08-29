/**
 * Image Editing Studio - Core Types & Config Interfaces
 */

export type ImageOutputFormat = 'webp' | 'jpeg' | 'png' | 'avif';

export type AspectRatioPreset =
  | 'freeform'
  | '1:1'
  | '16:9'
  | '9:16'
  | '4:5'
  | '4:3'
  | 'circular';

export type TextAlignment = 'left' | 'center' | 'right';

export type MemeStyle = 'classic' | 'caption-banner';

export type PresetFilterName =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'cyberpunk'
  | 'high-contrast'
  | 'invert';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropConfig {
  preset: AspectRatioPreset;
  rect?: CropRect;
  circular?: boolean;
}

export interface ImageTransformConfig {
  rotate: number; // In degrees (-180 to 180 or 0, 90, 180, 270)
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface ImageFilterConfig {
  preset: PresetFilterName;
  brightness: number; // -100 to 100 (0 = default)
  contrast: number; // -100 to 100 (0 = default)
  saturation: number; // -100 to 100 (0 = default)
  blur: number; // 0 to 20px
  sharpen: number; // 0 to 100 (0 = default)
}

export interface MemeTextConfig {
  topText: string;
  bottomText: string;
  bannerText: string;
  style: MemeStyle;
  align: TextAlignment;
  fontFamily: string;
  fontSize: number;
  uppercase: boolean;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  bannerBgColor: string;
  bannerTextColor: string;
}

export interface ImageCompressionConfig {
  smartMode: boolean; // Auto perceptual lossless optimization
  format: ImageOutputFormat;
  quality: number; // 1 to 100 (default 85)
  lossless?: boolean;
  targetSizeKb?: number | null; // e.g. 500 for 500 KB target
  maxColors?: number | null; // Color quantization: 16, 32, 64, 128, 256
  stripExif: boolean;
}

export interface ImageStudioPipelineConfig {
  transform: ImageTransformConfig;
  crop: ImageCropConfig;
  filters: ImageFilterConfig;
  meme: MemeTextConfig;
  compression: ImageCompressionConfig;
}

export interface ImageProcessResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  savingsBytes: number;
  savingsPercentage: number;
  format: ImageOutputFormat;
  mimeType: string;
  fileName: string;
  effectiveQuality: number;
}

export interface BatchImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  dimensions: ImageDimensions;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  result?: ImageProcessResult;
  errorMessage?: string;
}
