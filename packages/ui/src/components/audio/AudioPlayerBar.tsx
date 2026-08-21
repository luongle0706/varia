import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Stack, IconButton, Slider, Button } from '@mui/material';
import { Play, Pause, Download, CheckCircle2 } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import { formatBytes, formatTimecode } from '@varia/core';

export interface AudioPlayerBarProps {
  audioUrl: string;
  fileName: string;
  format: string;
  originalSize?: number;
  outputSize?: number;
  onDownload?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioUrl,
  fileName,
  format,
  originalSize,
  outputSize,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    if (audioRef.current && typeof time === 'number') {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const compressionRatio =
    originalSize && outputSize && originalSize > outputSize
      ? Math.round(((originalSize - outputSize) / originalSize) * 100)
      : null;

  return (
    <Box
      sx={{
        backgroundColor: '#121217',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 3.5,
        p: 2.5,
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
        {/* Left: File Metadata */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <CheckCircle2 size={22} />
          </Box>

          <Box>
            <Typography noWrap variant="subtitle2" sx={{ fontWeight: 700, maxWidth: 280 }}>
              {fileName}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ color: colorTokens.text.secondary }}>
                {format.toUpperCase()}
              </Typography>
              {outputSize && (
                <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                  • {formatBytes(outputSize)}
                </Typography>
              )}
              {compressionRatio !== null && (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  ({compressionRatio}% smaller)
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Center: Audio Player Controls */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: '45%' } }}>
          <IconButton
            onClick={togglePlay}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              p: 1.2,
              '&:hover': {
                backgroundColor: colorTokens.accent.violet,
              },
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
          </IconButton>

          <Typography variant="caption" sx={{ fontFamily: 'monospace', minWidth: 40 }}>
            {formatTimecode(currentTime)}
          </Typography>

          <Slider
            value={currentTime}
            min={0}
            max={duration || 100}
            onChange={handleSeek}
            sx={{
              color: '#10b981',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.16)',
                },
              },
            }}
          />

          <Typography variant="caption" sx={{ fontFamily: 'monospace', minWidth: 40, color: colorTokens.text.muted }}>
            {formatTimecode(duration)}
          </Typography>
        </Stack>

        {/* Right: Download CTA */}
        {onDownload && (
          <Button
            variant="contained"
            color="success"
            startIcon={<Download size={16} />}
            onClick={onDownload}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            Download {format.toUpperCase()}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
