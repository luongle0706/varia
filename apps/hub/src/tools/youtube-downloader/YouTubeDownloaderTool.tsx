import React from 'react';
import { Container, Box, Typography, Button, Stack, Alert, AlertTitle } from '@mui/material';
import { ArrowLeft, Youtube, RefreshCw } from 'lucide-react';
import {
  YouTubeUrlInput,
  YouTubeMediaCard,
  YouTubeFormatSelector,
  YouTubeOfflineBanner,
} from '@varia/ui';
import { useYouTubeDownloader } from './useYouTubeDownloader';

export interface YouTubeDownloaderToolProps {
  onBack: () => void;
}

export const YouTubeDownloaderTool: React.FC<YouTubeDownloaderToolProps> = ({ onBack }) => {
  const {
    videoInfo,
    isLoadingInfo,
    isDownloading,
    progress,
    format,
    selectedResolution,
    selectedCodec,
    selectedBitrate,
    isServerOnline,
    errorMessage,
    setFormat,
    setSelectedResolution,
    setSelectedCodec,
    setSelectedBitrate,
    fetchVideoInfo,
    downloadMedia,
    clearSession,
  } = useYouTubeDownloader();

  return (
    <Box sx={{ minHeight: '100vh', pb: 12, pt: 3 }}>
      <Container maxWidth="lg">
        {/* Navigation Bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
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

          {videoInfo && (
            <Button
              startIcon={<RefreshCw size={16} />}
              onClick={clearSession}
              sx={{
                color: '#71717a',
                fontSize: '0.85rem',
                '&:hover': { color: '#ef4444' },
              }}
            >
              New Search
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
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Youtube size={26} color="#ef4444" />
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
              YouTube Video & Audio Downloader
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ color: '#a1a1aa', maxWidth: 600, mx: 'auto' }}>
            High-speed media extraction powered by yt-dlp. Download MP4 up to original maximum
            resolution with H.264 encoder or extract studio-quality MP3 audio.
          </Typography>
        </Box>

        {/* Offline Companion Notice */}
        {!isServerOnline && (
          <Box sx={{ mb: 4 }}>
            <YouTubeOfflineBanner />
          </Box>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2.5,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>Extraction Notice</AlertTitle>
            {errorMessage}
          </Alert>
        )}

        {/* Step 1: URL Input Box */}
        <Box sx={{ mb: 4 }}>
          <YouTubeUrlInput
            onFetch={url => fetchVideoInfo(url)}
            isLoading={isLoadingInfo}
            disabled={!isServerOnline}
          />
        </Box>

        {/* Step 2: Video Metadata Preview Card */}
        {videoInfo && (
          <Stack spacing={3}>
            <YouTubeMediaCard info={videoInfo} />

            {/* Step 3: Format, Resolution, and Codec Options */}
            <YouTubeFormatSelector
              info={videoInfo}
              format={format}
              selectedResolution={selectedResolution}
              selectedCodec={selectedCodec}
              selectedBitrate={selectedBitrate}
              progress={progress}
              onFormatChange={setFormat}
              onResolutionChange={setSelectedResolution}
              onCodecChange={setSelectedCodec}
              onBitrateChange={setSelectedBitrate}
              onDownload={downloadMedia}
              isDownloading={isDownloading}
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default YouTubeDownloaderTool;
