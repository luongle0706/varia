import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowLeft,
  Image as ImageIcon,
  Zap,
  Palette,
  RotateCcw,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import {
  MediaDropzone,
  ImageComparisonSlider,
  ImageCropOverlay,
  ImageTransformPanel,
  MemeEditorPanel,
  ImageAdjustmentsPanel,
  CompressionOptionsPanel,
  BatchImageTable,
  GlassCard,
  colorTokens,
} from '@varia/ui';
import { formatBytes } from '@varia/core';
import {
  useImageStudio,
  DEFAULT_TRANSFORM,
  DEFAULT_FILTERS,
  DEFAULT_MEME,
} from './useImageStudio';

export interface ImageStudioToolProps {
  onBack?: () => void;
}

export const ImageStudioTool: React.FC<ImageStudioToolProps> = ({ onBack }) => {
  const {
    activeMode,
    setActiveMode,
    activeFile,
    activeImageUrl,
    originalFormat,
    dimensions,
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
    liveResult,
    errorMessage,
    batchItems,
    isProcessingBatch,
    handleSelectFiles,
    downloadResult,
    downloadBatchItem,
    downloadBatchZip,
    removeBatchItem,
    clearAllBatch,
    resetAll,
  } = useImageStudio();

  const [copied, setCopied] = useState(false);

  const handleCopyImage = async () => {
    if (!liveResult) return;
    try {
      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ [liveResult.mimeType]: liveResult.blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 12, pt: 3 }}>
      <Container maxWidth="xl">
        {/* Navigation Bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          {onBack && (
            <Button
              startIcon={<ArrowLeft size={18} />}
              onClick={onBack}
              sx={{
                color: '#a1a1aa',
                fontWeight: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2.5,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                },
              }}
            >
              Back to Launchpad
            </Button>
          )}

          {activeFile && (
            <Button
              startIcon={<RotateCcw size={16} />}
              onClick={resetAll}
              sx={{
                color: '#71717a',
                fontSize: '0.85rem',
                '&:hover': { color: colorTokens.accent.rose },
              }}
            >
              Start New Image
            </Button>
          )}
        </Stack>

        {/* Header Title */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={26} color={colorTokens.accent.violetLight} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Image Editing Studio
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colorTokens.text.secondary }}>
            Smart visual lossless compressor, format converter, crop, rotate, meme generator, and creative filters.
          </Typography>
        </Box>

        {/* Mode Switcher Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tabs
            value={activeMode}
            onChange={(_, val) => setActiveMode(val)}
            sx={{
              backgroundColor: 'rgba(20, 20, 26, 0.7)',
              borderRadius: 3,
              p: 0.5,
              border: `1px solid ${colorTokens.bg.border}`,
              '& .MuiTabs-indicator': { display: 'none' },
            }}
          >
            <Tab
              value="quick"
              icon={<Zap size={16} />}
              iconPosition="start"
              label="Quick Compress & Convert"
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                minHeight: 40,
                px: 3,
                py: 1,
                transition: 'all 0.15s ease',
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                  color: 'inherit',
                },
                '&.Mui-selected': {
                  color: '#ffffff !important',
                  backgroundColor: `${colorTokens.accent.violet} !important`,
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
                },
                '&:not(.Mui-selected)': {
                  color: `${colorTokens.text.secondary} !important`,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    color: '#ffffff !important',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                },
              }}
            />
            <Tab
              value="studio"
              icon={<Palette size={16} />}
              iconPosition="start"
              label="Creative Studio & Editor"
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'none',
                minHeight: 40,
                px: 3,
                py: 1,
                transition: 'all 0.15s ease',
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                  color: 'inherit',
                },
                '&.Mui-selected': {
                  color: '#ffffff !important',
                  backgroundColor: `${colorTokens.accent.violet} !important`,
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
                },
                '&:not(.Mui-selected)': {
                  color: `${colorTokens.text.secondary} !important`,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    color: '#ffffff !important',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                },
              }}
            />
          </Tabs>
        </Box>

        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Initial Upload Dropzone View */}
        {!activeFile && (
          <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
            <MediaDropzone
              onFilesSelected={handleSelectFiles}
              multiple={true}
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.avif,.gif"
              formats={['PNG', 'JPEG', 'WEBP', 'AVIF', 'GIF']}
              title="Drag & drop images here"
              dragOverTitle="Drop your images here!"
              subtitle="or paste from clipboard (Ctrl+V) · 100% private, client-side zero server upload"
              buttonText="Select Images"
              icon={<UploadCloud size={32} />}
              validateFile={() => true}
            />
          </Box>
        )}

        {/* Active Image Workspace */}
        {activeFile && (
          <>
            {activeMode === 'quick' ? (
              /* TAB 1: QUICK COMPRESS & CONVERT */
              <Box>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
                  {/* Left Column: Comparison Slider */}
                  <Box sx={{ flex: 1, width: '100%' }}>
                    {activeImageUrl && liveResult && (
                      <ImageComparisonSlider
                        originalUrl={activeImageUrl}
                        compressedUrl={liveResult.url}
                        originalSize={liveResult.originalSize}
                        compressedSize={liveResult.compressedSize}
                        savingsPercentage={liveResult.savingsPercentage}
                        width={liveResult.width}
                        height={liveResult.height}
                        format={liveResult.format}
                        originalFormat={originalFormat}
                      />
                    )}
                  </Box>

                  {/* Right Column: Compression Options & Action Buttons */}
                  <Box sx={{ width: { xs: '100%', lg: 380 } }}>
                    <Stack spacing={2.5}>
                      <CompressionOptionsPanel
                        compression={compression}
                        onChange={setCompression}
                        currentSizeKb={liveResult ? liveResult.compressedSize / 1024 : undefined}
                      />

                      {/* Download Action Bar */}
                      <GlassCard sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                          <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<Download size={18} />}
                            disabled={!liveResult}
                            onClick={downloadResult}
                            sx={{
                              py: 1.4,
                              borderRadius: 2.5,
                              fontWeight: 800,
                              textTransform: 'none',
                              fontSize: '0.95rem',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                              color: '#ffffff',
                              boxShadow: 'none',
                              transition:
                                'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
                                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            {liveResult
                              ? `Download ${liveResult.format.toUpperCase()} (${formatBytes(liveResult.compressedSize)})`
                              : 'Download Image'}
                          </Button>

                          <Button
                            variant="outlined"
                            fullWidth
                            endIcon={<ArrowRight size={16} />}
                            onClick={() => setActiveMode('studio')}
                            sx={{
                              py: 1,
                              borderRadius: 2.5,
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '0.85rem',
                              borderColor: colorTokens.accent.violet,
                              color: colorTokens.accent.violetLight,
                              backgroundColor: 'rgba(139, 92, 246, 0.05)',
                              '&:hover': {
                                borderColor: colorTokens.accent.violetLight,
                                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                              },
                            }}
                          >
                            Open in Creative Studio
                          </Button>
                        </Stack>
                      </GlassCard>
                    </Stack>
                  </Box>
                </Stack>

                {/* Batch Queue Table */}
                <BatchImageTable
                  items={batchItems}
                  onDownloadItem={downloadBatchItem}
                  onDownloadAllZip={downloadBatchZip}
                  onRemoveItem={removeBatchItem}
                  onClearAll={clearAllBatch}
                  isProcessingBatch={isProcessingBatch}
                />
              </Box>
            ) : (
              /* TAB 2: CREATIVE STUDIO & EDITOR */
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
                {/* Left Column: Live Canvas Viewport */}
                <Box sx={{ flex: 1, width: '100%' }}>
                  <GlassCard sx={{ p: 2 }}>
                    {/* Viewport Header */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Palette size={18} color={colorTokens.accent.violetLight} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
                          Live Preview Canvas
                        </Typography>
                        {liveResult && (
                          <Chip
                            label={`${liveResult.width}×${liveResult.height}px`}
                            size="small"
                            sx={{
                              fontSize: '0.72rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: colorTokens.text.muted,
                            }}
                          />
                        )}
                      </Stack>

                      {liveResult && (
                        <Chip
                          icon={<Sparkles size={13} color="#10b981" />}
                          label={`-${liveResult.savingsPercentage}% (${formatBytes(liveResult.compressedSize)})`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                          }}
                        />
                      )}
                    </Stack>

                    {/* Canvas Image Container */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: { xs: 340, sm: 460, md: 540 },
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        backgroundColor: '#09090b',
                        backgroundImage:
                          'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {liveResult ? (
                        <Box
                          component="img"
                          src={liveResult.url}
                          alt="Edited Live Result"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <CircularProgress size={32} color="secondary" />
                      )}
                    </Box>

                    {/* Action Bar */}
                    <Stack direction="row" spacing={1.5} justifyContent="space-between" mt={2} flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<Download size={16} />}
                          onClick={downloadResult}
                          disabled={!liveResult}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                            color: '#ffffff',
                            boxShadow: 'none',
                            transition:
                              'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
                              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          Export & Download
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                          onClick={handleCopyImage}
                          disabled={!liveResult}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: colorTokens.bg.border,
                            color: colorTokens.text.primary,
                            '&:hover': { borderColor: colorTokens.accent.violet },
                          }}
                        >
                          {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                      </Stack>

                      <Button
                        size="small"
                        startIcon={<RotateCcw size={14} />}
                        onClick={() => {
                          setTransform(DEFAULT_TRANSFORM);
                          handleResetCrop();
                          setFilters(DEFAULT_FILTERS);
                          setMeme(DEFAULT_MEME);
                        }}
                        sx={{
                          color: colorTokens.text.muted,
                          '&:hover': { color: colorTokens.accent.rose },
                        }}
                      >
                        Reset All Edits
                      </Button>
                    </Stack>
                  </GlassCard>
                </Box>

                {/* Right Column: Modular Studio Edit Panels */}
                <Box sx={{ width: { xs: '100%', lg: 420 } }}>
                  <Stack spacing={2.5}>
                    {/* Crop Panel */}
                    <ImageCropOverlay
                      dimensions={dimensions}
                      activePreset={cropPreset}
                      cropRect={cropRect}
                      onPresetChange={handleCropPresetChange}
                      onResetCrop={handleResetCrop}
                    />

                    {/* Transform Panel */}
                    <ImageTransformPanel
                      transform={transform}
                      onChange={setTransform}
                      onReset={() => setTransform(DEFAULT_TRANSFORM)}
                    />

                    {/* Meme Generator Panel */}
                    <MemeEditorPanel
                      meme={meme}
                      onChange={setMeme}
                      onReset={() => setMeme(DEFAULT_MEME)}
                    />

                    {/* Filters & Adjustments Panel */}
                    <ImageAdjustmentsPanel
                      filters={filters}
                      onChange={setFilters}
                      onReset={() => setFilters(DEFAULT_FILTERS)}
                    />

                    {/* Advanced Compression Panel */}
                    <CompressionOptionsPanel
                      compression={compression}
                      onChange={setCompression}
                      showAdvancedOnly={true}
                      currentSizeKb={liveResult ? liveResult.compressedSize / 1024 : undefined}
                    />
                  </Stack>
                </Box>
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
export default ImageStudioTool;
