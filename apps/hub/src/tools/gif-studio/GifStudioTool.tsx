import React from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
} from '@mui/material';
import { ArrowLeft, Film, Wand2, RotateCcw, X } from 'lucide-react';
import {
  MediaDropzone,
  GifVideoTrimmer,
  GifAdvancedOptionsDrawer,
  GifErrorBanner,
  GifPreviewCard,
  GlassCard,
  colorTokens,
} from '@varia/ui';
import { COMMON_GIF_FPS, type GifScalePreset } from '@varia/core';
import { useGifStudio } from './useGifStudio';

export interface GifStudioToolProps {
  onBack?: () => void;
}

export const GifStudioTool: React.FC<GifStudioToolProps> = ({ onBack }) => {
  const {
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
  } = useGifStudio();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0 && files[0]) {
      handleVideoSelect(files[0]);
    }
  };

  const quickScalePresets: GifScalePreset[] = ['480p', '360p', '240p', 'original'];

  return (
    <Box sx={{ minHeight: '100vh', pb: 12, pt: 3 }}>
      <Container maxWidth="lg">
        {/* Navigation Bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
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

          {videoFile && (
            <Button
              startIcon={<RotateCcw size={16} />}
              onClick={resetSession}
              sx={{
                color: '#71717a',
                fontSize: '0.85rem',
                '&:hover': { color: '#ec4899' },
              }}
            >
              Start New
            </Button>
          )}
        </Stack>

        {/* Header Title */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Film size={26} color="#ec4899" />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                letterSpacing: '-0.025em',
                color: '#f4f4f5',
              }}
            >
              GIF Studio & Video to GIF
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ color: '#a1a1aa', maxWidth: 600, mx: 'auto' }}>
            High-quality two-pass palette generation, crop, resize, reverse, speed, and custom
            dithering.
          </Typography>
        </Box>

        {/* Error Banner */}
        <GifErrorBanner error={error} onAction={handleErrorAction} onDismiss={dismissError} />

        {/* Result Preview Card */}
        {result && resultGifUrl && (
          <Box sx={{ mb: 4 }}>
            <GifPreviewCard result={result} gifUrl={resultGifUrl} onReset={resetSession} />
          </Box>
        )}

        {/* Ingestion / Main Workspace */}
        {!videoFile ? (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <MediaDropzone onFilesSelected={handleFilesSelected} multiple={false} />
          </Box>
        ) : (
          <Box>
            {/* Main Basic Convert Section */}
            {videoUrl && videoMeta && (
              <Box sx={{ mb: 4 }}>
                <GifVideoTrimmer
                  videoUrl={videoUrl}
                  duration={videoMeta.duration}
                  videoWidth={videoMeta.width}
                  videoHeight={videoMeta.height}
                  trimStart={options.trimStart ?? 0}
                  trimEnd={options.trimEnd ?? videoMeta.duration}
                  onTrimChange={updateTrim}
                  speed={options.speed}
                  crop={options.crop}
                  onCropChange={crop => updateOptions({ crop })}
                />

                {/* Primary Quick Controls & Launch Button */}
                <GlassCard sx={{ p: 2.5, mb: 4 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2.5}
                  >
                    {/* Frame Rate Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colorTokens.text.secondary,
                          fontWeight: 700,
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        Frame Rate (FPS)
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {COMMON_GIF_FPS.map(fps => {
                          const isSelected = (options.fps || 15) === fps;
                          return (
                            <Button
                              key={fps}
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              onClick={() => updateOptions({ fps })}
                              sx={{
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                minWidth: 44,
                                ...(isSelected
                                  ? {
                                      backgroundColor: '#ec4899',
                                      '&:hover': { backgroundColor: '#db2777' },
                                    }
                                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
                              }}
                            >
                              {fps}
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>

                    {/* Quick Resolution Selector */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colorTokens.text.secondary,
                          fontWeight: 700,
                          mb: 1,
                          display: 'block',
                        }}
                      >
                        Size Preset
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {quickScalePresets.map(preset => {
                          const isSelected = (options.scalePreset || 'original') === preset;
                          const label =
                            preset === 'original' && videoMeta
                              ? `Original (${videoMeta.width}×${videoMeta.height})`
                              : preset;
                          return (
                            <Button
                              key={preset}
                              size="small"
                              variant={isSelected ? 'contained' : 'outlined'}
                              onClick={() =>
                                updateOptions({
                                  scalePreset: preset,
                                  customWidth: undefined,
                                  customHeight: undefined,
                                })
                              }
                              sx={{
                                borderRadius: 2,
                                fontSize: '0.75rem',
                                ...(isSelected
                                  ? {
                                      backgroundColor: '#ec4899',
                                      '&:hover': { backgroundColor: '#db2777' },
                                    }
                                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
                              }}
                            >
                              {label}
                            </Button>
                          );
                        })}
                      </Stack>
                    </Box>

                    {/* Convert Button */}
                    <Button
                      variant="contained"
                      onClick={startConversion}
                      disabled={isConverting}
                      startIcon={<Wand2 size={18} />}
                      sx={{
                        minWidth: { xs: '100%', md: 200 },
                        height: 50,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                        color: '#ffffff !important',
                        boxShadow: '0 0 24px rgba(236, 72, 153, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
                        },
                      }}
                    >
                      Convert to GIF
                    </Button>
                  </Stack>
                </GlassCard>

                {/* Advanced Options Accordion Section Below */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#f4f4f5' }}>
                  Advanced Editing & Creative Controls
                </Typography>
                <GifAdvancedOptionsDrawer
                  options={options}
                  onChange={updateOptions}
                  videoWidth={videoMeta.width}
                  videoHeight={videoMeta.height}
                  clipDuration={Math.max(
                    0.1,
                    (options.trimEnd ?? videoMeta.duration) - (options.trimStart ?? 0),
                  )}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Progress Dialog */}
        <Dialog
          open={isConverting}
          disableScrollLock
          PaperProps={{
            sx: {
              backgroundColor: '#121217',
              backgroundImage: 'none',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: 3,
              p: 2,
              minWidth: { xs: 300, sm: 420 },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#ffffff', pb: 1 }}>
            Creating High-Quality GIF...
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 2 }}>
              {stage}
            </Typography>
            <LinearProgress
              variant={progress > 0 ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
                },
                mb: 3,
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: '#ec4899', fontWeight: 700 }}>
                {progress > 0 ? `${progress}%` : 'Processing'}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={cancelConversion}
                startIcon={<X size={14} />}
                sx={{
                  borderRadius: 2,
                  color: colorTokens.text.secondary,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                }}
              >
                Cancel
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GifStudioTool;
