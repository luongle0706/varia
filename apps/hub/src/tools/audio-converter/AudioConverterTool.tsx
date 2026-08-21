import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import { ArrowLeft, FileAudio, Sparkles, Zap, Shield, Wand2, X, RotateCcw } from 'lucide-react';
import {
  colorTokens,
  MediaDropzone,
  WaveformTrimmer,
  ConversionSettingsDrawer,
  AudioPlayerBar,
  BatchQueueTable,
  GlassCard,
} from '@varia/ui';
import { formatBytes } from '@varia/core';
import { useAudioConverter } from './useAudioConverter';

export interface AudioConverterToolProps {
  onBack?: () => void;
}

export const AudioConverterTool: React.FC<AudioConverterToolProps> = ({ onBack }) => {
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);

  const {
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
  } = useAudioConverter();

  return (
    <Box sx={{ minHeight: '100vh', pb: 12, pt: 3 }}>
      <Container maxWidth="lg">
        {/* Navigation / Header Row */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" spacing={2} alignItems="center">
            {onBack && (
              <IconButton
                onClick={onBack}
                sx={{
                  border: `1px solid ${colorTokens.bg.border}`,
                  borderRadius: 2.5,
                  p: 1.2,
                  color: colorTokens.text.secondary,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  '&:hover': {
                    borderColor: colorTokens.accent.violet,
                    color: colorTokens.text.primary,
                  },
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(236, 72, 153, 0.35)',
                }}
              >
                <FileAudio size={24} color="#ffffff" />
              </Box>

              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Audio Studio & MP4 to MP3
                  </Typography>
                  <Chip
                    label="WASM"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(236, 72, 153, 0.15)',
                      color: '#ec4899',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                    }}
                  />
                  <Chip
                    label="100% Client-Side"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: colorTokens.text.secondary }}>
                  Extract, trim, normalize, boost volume and convert video & audio with
                  multi-threaded WebAssembly
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {queue.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RotateCcw size={14} />}
              onClick={clearQueue}
              sx={{
                borderRadius: 2,
                color: colorTokens.text.secondary,
                borderColor: colorTokens.bg.border,
                fontSize: '0.75rem',
              }}
            >
              Start New
            </Button>
          )}
        </Stack>

        {/* Error Alert */}
        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2.5 }}
            onClose={() => resetActiveSession()}
          >
            {errorMessage}
          </Alert>
        )}

        {/* View Mode 1: No Files Ingested Yet */}
        {queue.length === 0 ? (
          <Box>
            <MediaDropzone onFilesSelected={addFiles} />

            {/* Value Props & Feature Highlights */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} mt={4}>
              <GlassCard sx={{ flex: 1, p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Zap size={20} color={colorTokens.accent.violet} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Universal Format Support
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: colorTokens.text.secondary, fontSize: '0.85rem' }}
                >
                  Converts any video container (MP4, MKV, WebM, AVI, MOV, FLV) to pristine MP3, WAV,
                  AAC, OGG, and FLAC without format restrictions.
                </Typography>
              </GlassCard>

              <GlassCard sx={{ flex: 1, p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Shield size={20} color={colorTokens.accent.cyan} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Zero Cloud Uploads
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: colorTokens.text.secondary, fontSize: '0.85rem' }}
                >
                  All decoding and encoding happens directly on your machine inside isolated Web
                  Workers. Your files never touch any server.
                </Typography>
              </GlassCard>

              <GlassCard sx={{ flex: 1, p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Wand2 size={20} color="#ec4899" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Interactive Waveform Trimmer
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: colorTokens.text.secondary, fontSize: '0.85rem' }}
                >
                  Cut unwanted intro/outro, apply audio fade curves, and boost quiet audio up to
                  200% with visual live preview.
                </Typography>
              </GlassCard>
            </Stack>
          </Box>
        ) : (
          /* View Mode 2: Files Loaded in Workspace */
          <Box>
            {/* Mode Switching Tabs */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Tabs
                value={tabIndex}
                onChange={(_, v) => setTabIndex(v)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  p: 0.5,
                  borderRadius: 2.5,
                  border: `1px solid ${colorTokens.bg.border}`,
                  '& .MuiTabs-indicator': {
                    backgroundColor: colorTokens.accent.violet,
                    height: '100%',
                    borderRadius: 2,
                    zIndex: 0,
                  },
                }}
              >
                <Tab
                  label="Studio & Waveform Trimmer"
                  sx={{
                    zIndex: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: tabIndex === 0 ? '#ffffff' : colorTokens.text.secondary,
                    borderRadius: 2,
                  }}
                />
                <Tab
                  label={`Batch Queue (${queue.length})`}
                  sx={{
                    zIndex: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: tabIndex === 1 ? '#ffffff' : colorTokens.text.secondary,
                    borderRadius: 2,
                  }}
                />
              </Tabs>

              {/* Quick file switcher in Studio mode */}
              {tabIndex === 0 && queue.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  mt={{ xs: 1.5, sm: 0 }}
                  overflow="auto"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: colorTokens.text.muted, whiteSpace: 'nowrap' }}
                  >
                    Active File:
                  </Typography>
                  {queue.map(item => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      size="small"
                      onClick={() => selectActiveItem(item.id)}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: item.id === activeItem?.id ? 700 : 500,
                        backgroundColor:
                          item.id === activeItem?.id
                            ? 'rgba(139, 92, 246, 0.25)'
                            : 'rgba(255, 255, 255, 0.04)',
                        borderColor:
                          item.id === activeItem?.id ? colorTokens.accent.violet : 'transparent',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        maxWidth: 160,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>

            {/* TAB 0: Studio & Waveform Mode */}
            {tabIndex === 0 && (
              <Box>
                {/* Result Audio Player Banner if conversion finished */}
                {latestResult && latestResultUrl && (
                  <Box mb={3}>
                    <AudioPlayerBar
                      audioUrl={latestResultUrl}
                      fileName={latestResult.outputName}
                      format={latestResult.format}
                      originalSize={latestResult.originalSize}
                      outputSize={latestResult.outputSize}
                      onDownload={() => downloadResult(latestResult)}
                    />
                  </Box>
                )}

                {/* Active File Header */}
                {activeItem && (
                  <Box
                    mb={2}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {activeItem.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                        ({formatBytes(activeItem.size)})
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Interactive Waveform Canvas Trimmer */}
                {activeItem && (
                  <WaveformTrimmer
                    audioBuffer={activeAudioBuffer}
                    audioUrl={activeAudioUrl || undefined}
                    duration={activeAudioBuffer?.duration || 30}
                    trimStart={options.trimStart ?? 0}
                    trimEnd={options.trimEnd ?? (activeAudioBuffer?.duration || 30)}
                    onTrimChange={updateTrimRegion}
                    volumeBoost={options.volumeBoost}
                  />
                )}

                {/* Conversion Settings Drawer */}
                <ConversionSettingsDrawer
                  options={options}
                  onChange={updateOptions}
                  disabled={isConverting}
                />

                {/* Convert Button CTA */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  alignItems="center"
                  mt={3}
                >
                  <Button
                    variant="contained"
                    size="large"
                    disabled={isConverting || !activeItem}
                    startIcon={<Sparkles size={18} />}
                    onClick={convertActiveItem}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      boxShadow: '0 8px 30px rgba(139, 92, 246, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {isConverting
                      ? 'Converting Audio...'
                      : `Convert to ${options.format.toUpperCase()} (${options.bitrate?.toUpperCase() || '192K'})`}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* TAB 1: Batch Queue Mode */}
            {tabIndex === 1 && (
              <Box>
                <BatchQueueTable
                  items={queue}
                  isConverting={isConverting}
                  onRemoveItem={removeQueueItem}
                  onClearAll={clearQueue}
                  onConvertAll={convertAllQueue}
                  onDownloadItem={item => item.result && downloadResult(item.result)}
                  onDownloadAllZip={downloadAllZip}
                  onChangeFormat={updateItemFormat}
                />

                {/* Add More Files Dropzone */}
                <Box mt={3}>
                  <MediaDropzone onFilesSelected={addFiles} disabled={isConverting} />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Modal: Conversion Progress & WASM Engine Loader */}
        <Dialog
          open={isConverting || engineLoading}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#121217',
              borderRadius: 3.5,
              border: `1px solid ${colorTokens.bg.borderHover}`,
              p: 3,
              textAlign: 'center',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, p: 0, mb: 2 }}>
            {engineLoading ? 'Initializing Media Engine' : 'Transcoding Audio'}
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
                animation: 'pulse 2s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                  '50%': { transform: 'scale(1.05)', opacity: 1 },
                  '100%': { transform: 'scale(0.95)', opacity: 0.8 },
                },
              }}
            >
              <Zap size={28} color="#ffffff" />
            </Box>

            <Typography variant="body2" sx={{ color: colorTokens.text.secondary, mb: 2 }}>
              {engineLoading
                ? `${engineLoadStage} (${engineLoadProgress}%)`
                : 'Processing high-fidelity client-side audio stream...'}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={engineLoading ? engineLoadProgress : activeItem?.progress || 35}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                mb: 3,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                },
              }}
            />

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<X size={14} />}
              onClick={cancelCurrentConversion}
              sx={{
                borderRadius: 2,
                color: colorTokens.text.muted,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  borderColor: colorTokens.accent.rose,
                  color: colorTokens.accent.rose,
                },
              }}
            >
              Cancel Operation
            </Button>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AudioConverterTool;
