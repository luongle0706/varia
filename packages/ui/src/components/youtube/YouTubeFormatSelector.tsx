import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  type YouTubeVideoInfo,
  type YouTubeResolutionQuality,
  type YouTubeVideoCodec,
  type YouTubeAudioBitrate,
  type YouTubeJobProgress,
  YOUTUBE_VIDEO_CODECS,
  YOUTUBE_AUDIO_BITRATES,
} from '@varia/core';
import { Film, Music, Download, CheckCircle2, Cpu, Activity, Gauge, Clock } from 'lucide-react';
import { GlassCard } from '../GlassCard';

export interface YouTubeFormatSelectorProps {
  info: YouTubeVideoInfo;
  format: 'mp4' | 'mp3';
  selectedResolution: YouTubeResolutionQuality;
  selectedCodec: YouTubeVideoCodec;
  selectedBitrate: YouTubeAudioBitrate;
  progress?: YouTubeJobProgress | null;
  onFormatChange: (format: 'mp4' | 'mp3') => void;
  onResolutionChange: (res: YouTubeResolutionQuality) => void;
  onCodecChange: (codec: YouTubeVideoCodec) => void;
  onBitrateChange: (bitrate: YouTubeAudioBitrate) => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

export const YouTubeFormatSelector: React.FC<YouTubeFormatSelectorProps> = ({
  info,
  format,
  selectedResolution,
  selectedCodec,
  selectedBitrate,
  progress,
  onFormatChange,
  onResolutionChange,
  onCodecChange,
  onBitrateChange,
  onDownload,
  isDownloading = false,
}) => {
  const percent = progress?.percent ?? (isDownloading ? 10 : 0);
  const isMerging = progress?.stage === 'merging';
  const stageMessage =
    progress?.message || (isMerging ? 'Merging with FFmpeg...' : 'Downloading stream...');

  return (
    <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative' }}>
      {/* Format Toggle Segmented Tab */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }}>
        <Tabs
          value={format}
          onChange={(_, val) => !isDownloading && onFormatChange(val)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: format === 'mp4' ? '#ef4444' : '#8b5cf6',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            value="mp4"
            disabled={isDownloading}
            icon={<Film size={18} />}
            iconPosition="start"
            label="MP4 Video"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              color: format === 'mp4' ? '#ffffff' : '#71717a',
              '&.Mui-selected': { color: '#ffffff' },
            }}
          />
          <Tab
            value="mp3"
            disabled={isDownloading}
            icon={<Music size={18} />}
            iconPosition="start"
            label="MP3 Audio Only"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              color: format === 'mp3' ? '#ffffff' : '#71717a',
              '&.Mui-selected': { color: '#ffffff' },
            }}
          />
        </Tabs>
      </Box>

      {/* MP4 Video Options */}
      {format === 'mp4' && (
        <Box
          sx={{ opacity: isDownloading ? 0.6 : 1, pointerEvents: isDownloading ? 'none' : 'auto' }}
        >
          {/* Resolution Selection Grid */}
          <Typography variant="subtitle2" sx={{ color: '#a1a1aa', fontWeight: 600, mb: 1.5 }}>
            Select Video Resolution (Filtered to original {info.maxResolution} max):
          </Typography>

          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {info.availableResolutions.map(res => {
              const isSelected = selectedResolution === res.quality;
              return (
                <Grid item xs={6} sm={4} md={3} key={res.quality}>
                  <Box
                    onClick={() => onResolutionChange(res.quality)}
                    sx={{
                      px: { xs: 2, sm: 2.8 },
                      py: 1.8,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
                      backgroundColor: isSelected
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(255, 255, 255, 0.02)',
                      transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: isSelected ? '#ef4444' : 'rgba(239, 68, 68, 0.4)',
                        backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#e4e4e7' }}
                      >
                        {res.quality}
                      </Typography>
                      {isSelected && <CheckCircle2 size={16} color="#ef4444" />}
                    </Box>

                    <Typography variant="caption" sx={{ color: '#71717a', display: 'block' }}>
                      {res.label}
                    </Typography>

                    {res.isOriginalMax && (
                      <Chip
                        label="Max Quality"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: isSelected ? 40 : 24,
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Video Encoder / Codec Selection */}
          <Typography
            variant="subtitle2"
            sx={{
              color: '#a1a1aa',
              fontWeight: 600,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <Cpu size={16} color="#ef4444" />
            Video Encoder (Codec):
          </Typography>

          <Grid container spacing={1.5} sx={{ mb: 4 }}>
            {(Object.keys(YOUTUBE_VIDEO_CODECS) as YouTubeVideoCodec[]).map(codecKey => {
              const codec = YOUTUBE_VIDEO_CODECS[codecKey];
              const isSelected = selectedCodec === codecKey;
              return (
                <Grid item xs={12} sm={4} key={codecKey}>
                  <Box
                    onClick={() => onCodecChange(codecKey)}
                    sx={{
                      px: { xs: 2, sm: 2.8 },
                      py: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}`,
                      backgroundColor: isSelected
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(255, 255, 255, 0.02)',
                      transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#ef4444' : 'rgba(239, 68, 68, 0.4)',
                        backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: isSelected ? '#ffffff' : '#f4f4f5' }}
                      >
                        {codec.name}
                      </Typography>
                      {isSelected && <CheckCircle2 size={16} color="#ef4444" />}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: '#71717a', fontSize: '0.75rem', lineHeight: 1.3 }}
                    >
                      {codec.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* MP3 Audio Options */}
      {format === 'mp3' && (
        <Box
          sx={{
            mb: 4,
            opacity: isDownloading ? 0.6 : 1,
            pointerEvents: isDownloading ? 'none' : 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#a1a1aa', fontWeight: 600, mb: 1.5 }}>
            Select MP3 Audio Bitrate:
          </Typography>

          <Grid container spacing={1.5}>
            {(Object.keys(YOUTUBE_AUDIO_BITRATES) as YouTubeAudioBitrate[]).map(bitrateKey => {
              const bitrate = YOUTUBE_AUDIO_BITRATES[bitrateKey];
              const isSelected = selectedBitrate === bitrateKey;
              return (
                <Grid item xs={6} sm={3} key={bitrateKey}>
                  <Box
                    onClick={() => onBitrateChange(bitrateKey)}
                    sx={{
                      px: { xs: 2, sm: 2.8 },
                      py: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                      backgroundColor: isSelected
                        ? 'rgba(139, 92, 246, 0.12)'
                        : 'rgba(255, 255, 255, 0.02)',
                      transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#8b5cf6' : 'rgba(139, 92, 246, 0.4)',
                        backgroundColor: 'rgba(139, 92, 246, 0.06)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#e4e4e7' }}
                      >
                        {bitrate.name}
                      </Typography>
                      {isSelected && <CheckCircle2 size={16} color="#8b5cf6" />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#71717a', fontSize: '0.75rem' }}>
                      {bitrate.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Real-Time Live Download Progress Tracker */}
      {isDownloading && (
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity size={18} color={format === 'mp4' ? '#ef4444' : '#8b5cf6'} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#f4f4f5' }}>
                {stageMessage}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: format === 'mp4' ? '#f87171' : '#a78bfa',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
              }}
            >
              {Math.round(percent)}%
            </Typography>
          </Box>

          <LinearProgress
            variant={percent > 0 ? 'determinate' : 'indeterminate'}
            value={percent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background:
                  format === 'mp4'
                    ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                    : 'linear-gradient(90deg, #8b5cf6 0%, #c084fc 100%)',
                boxShadow:
                  format === 'mp4'
                    ? '0 0 12px rgba(239, 68, 68, 0.6)'
                    : '0 0 12px rgba(139, 92, 246, 0.6)',
              },
            }}
          />

          {/* Speed & ETA stats */}
          {(progress?.speed || progress?.eta || progress?.totalSize) && (
            <Stack direction="row" spacing={2} mt={1.5} alignItems="center" flexWrap="wrap" gap={1}>
              {progress.speed && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Gauge size={14} color="#a1a1aa" />
                  <Typography variant="caption" sx={{ color: '#d4d4d8', fontFamily: 'monospace' }}>
                    {progress.speed}
                  </Typography>
                </Box>
              )}
              {progress.eta && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Clock size={14} color="#a1a1aa" />
                  <Typography variant="caption" sx={{ color: '#d4d4d8', fontFamily: 'monospace' }}>
                    ETA: {progress.eta}
                  </Typography>
                </Box>
              )}
              {progress.totalSize && (
                <Chip
                  label={`Total: ${progress.totalSize}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#a1a1aa',
                  }}
                />
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* Main Download Trigger Button */}
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
        <Button
          variant="contained"
          size="large"
          onClick={onDownload}
          disabled={isDownloading}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            background:
              format === 'mp4'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#ffffff',
            boxShadow:
              format === 'mp4'
                ? '0 0 25px rgba(239, 68, 68, 0.35)'
                : '0 0 25px rgba(139, 92, 246, 0.35)',
            '&:hover': {
              background:
                format === 'mp4'
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#71717a',
            },
          }}
        >
          {isDownloading ? (
            <>
              <CircularProgress
                size={20}
                sx={{ color: format === 'mp4' ? '#ef4444' : '#8b5cf6', mr: 1.5 }}
              />
              {stageMessage} ({Math.round(percent)}%)
            </>
          ) : (
            <>
              <Download size={20} style={{ marginRight: 10 }} />
              {format === 'mp4'
                ? `Download MP4 (${selectedResolution} • ${YOUTUBE_VIDEO_CODECS[selectedCodec]?.name})`
                : `Download MP3 (${selectedBitrate})`}
            </>
          )}
        </Button>
      </Stack>
    </GlassCard>
  );
};
