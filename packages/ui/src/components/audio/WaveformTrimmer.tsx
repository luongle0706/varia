import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import { Play, Pause, RotateCcw, Scissors } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import { formatTimecode } from '@varia/core';

export interface WaveformTrimmerProps {
  audioBuffer: AudioBuffer | null;
  audioUrl?: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  volumeBoost?: number;
}

export const WaveformTrimmer: React.FC<WaveformTrimmerProps> = ({
  audioBuffer,
  audioUrl,
  duration,
  trimStart,
  trimEnd,
  onTrimChange,
  volumeBoost = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(trimStart);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'scrub' | null>(null);
  const [hoverCursor, setHoverCursor] = useState<'default' | 'ew-resize' | 'crosshair'>('crosshair');

  // Sync audio element with audioUrl
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.currentTime >= trimEnd) {
          audio.pause();
          audio.currentTime = trimStart;
          setIsPlaying(false);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(trimStart);
      };

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl, trimStart, trimEnd]);

  // Adjust volume if volumeBoost is changed
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = Math.min(1.0, Math.max(0, volumeBoost));
    }
  }, [volumeBoost]);

  // Toggle Play / Pause
  const togglePlay = () => {
    const audio = audioElementRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.currentTime < trimStart || audio.currentTime >= trimEnd) {
        audio.currentTime = trimStart;
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleResetTrim = () => {
    onTrimChange(0, duration);
  };

  // Draw Waveform onto Canvas with Precise Logical DPI Handling
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Reset transform matrix and apply DPR scale cleanly
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (!audioBuffer || duration <= 0) {
      // Draw placeholder wave if decoding or empty
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
      const bars = 80;
      const barWidth = width / bars;
      for (let i = 0; i < bars; i++) {
        const h = Math.sin(i * 0.2) * (height * 0.3) + height * 0.2;
        ctx.fillRect(i * barWidth + 2, (height - h) / 2, barWidth - 4, h);
      }
      return;
    }

    const rawData = audioBuffer.getChannelData(0);
    const samples = 160;
    const blockSize = Math.floor(rawData.length / samples);
    const peaks: number[] = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j] || 0);
      }
      peaks.push(sum / blockSize);
    }

    const maxPeak = Math.max(...peaks, 0.01);
    const barWidth = width / samples;

    const startX = (trimStart / duration) * width;
    const endX = (trimEnd / duration) * width;
    const playheadX = (currentTime / duration) * width;

    // 1. Draw Inactive Dimmed Regions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);

    // 2. Draw Active Region Glow
    const activeGradient = ctx.createLinearGradient(startX, 0, endX, 0);
    activeGradient.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
    activeGradient.addColorStop(1, 'rgba(6, 182, 212, 0.12)');
    ctx.fillStyle = activeGradient;
    ctx.fillRect(startX, 0, endX - startX, height);

    // 3. Draw Waveform Bars
    peaks.forEach((peak, i) => {
      const x = i * barWidth;
      const barH = Math.max(4, (peak / maxPeak) * (height * 0.85));
      const y = (height - barH) / 2;

      const isInsideTrim = x >= startX && x <= endX;

      if (isInsideTrim) {
        const barGradient = ctx.createLinearGradient(0, y, 0, y + barH);
        barGradient.addColorStop(0, '#a78bfa');
        barGradient.addColorStop(1, '#06b6d4');
        ctx.fillStyle = barGradient;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      }

      ctx.beginPath();
      ctx.roundRect(x + 1.5, y, Math.max(2, barWidth - 3), barH, 2);
      ctx.fill();
    });

    // 4. Draw Trim Start Boundary Handle
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    // Start Handle Grab Tab
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.roundRect(startX - 6, height / 2 - 16, 12, 32, 4);
    ctx.fill();

    // Start Handle Tab Grip Lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX - 2, height / 2 - 8, 1.5, 16);
    ctx.fillRect(startX + 1, height / 2 - 8, 1.5, 16);

    // 5. Draw Trim End Boundary Handle
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();

    // End Handle Grab Tab
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(endX - 6, height / 2 - 16, 12, 32, 4);
    ctx.fill();

    // End Handle Tab Grip Lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(endX - 2, height / 2 - 8, 1.5, 16);
    ctx.fillRect(endX + 1, height / 2 - 8, 1.5, 16);

    // 6. Draw Playhead
    if (currentTime >= 0 && currentTime <= duration) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead Top Pointer
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playheadX, 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [audioBuffer, duration, trimStart, trimEnd, currentTime]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = rect.width * dpr;
        canvasRef.current.height = 120 * dpr;
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `120px`;
        drawWaveform();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Dragging interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const clickTime = ratio * duration;

    const startX = (trimStart / duration) * rect.width;
    const endX = (trimEnd / duration) * rect.width;

    // Capture pointer events for silky smooth outside-drag
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (Math.abs(x - startX) <= 14) {
      setIsDragging('start');
    } else if (Math.abs(x - endX) <= 14) {
      setIsDragging('end');
    } else {
      setIsDragging('scrub');
      setCurrentTime(clickTime);
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = clickTime;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const time = (x / rect.width) * duration;

    const startX = (trimStart / duration) * rect.width;
    const endX = (trimEnd / duration) * rect.width;

    // Update cursor style on hover when not dragging
    if (!isDragging) {
      if (Math.abs(x - startX) <= 14 || Math.abs(x - endX) <= 14) {
        setHoverCursor('ew-resize');
      } else {
        setHoverCursor('crosshair');
      }
      return;
    }

    if (isDragging === 'start') {
      const newStart = Math.min(time, trimEnd - 0.5);
      onTrimChange(Math.max(0, newStart), trimEnd);
    } else if (isDragging === 'end') {
      const newEnd = Math.max(time, trimStart + 0.5);
      onTrimChange(trimStart, Math.min(duration, newEnd));
    } else if (isDragging === 'scrub') {
      setCurrentTime(time);
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = time;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setIsDragging(null);
  };

  const trimDuration = Math.max(0, trimEnd - trimStart);

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colorTokens.bg.border}`,
        borderRadius: 3.5,
        p: 2.5,
        mb: 3,
      }}
    >
      {/* Header Info */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Scissors size={18} color={colorTokens.accent.violet} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Visual Waveform & Trimmer
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`Trimmed: ${formatTimecode(trimDuration, true)}`}
            size="small"
            sx={{
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Tooltip title="Reset Trim Region">
            <IconButton size="small" onClick={handleResetTrim} sx={{ color: colorTokens.text.secondary }}>
              <RotateCcw size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Interactive Waveform Canvas */}
      <Box
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        sx={{
          position: 'relative',
          height: 120,
          width: '100%',
          backgroundColor: '#09090b',
          borderRadius: 2.5,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: isDragging ? 'grabbing' : hoverCursor,
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </Box>

      {/* Playback Controls & Time Indicators */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={togglePlay}
            sx={{
              backgroundColor: colorTokens.accent.violet,
              color: '#ffffff',
              p: 1.2,
              '&:hover': {
                backgroundColor: '#7c3aed',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.5)',
              },
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
          </IconButton>

          <Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
              {formatTimecode(currentTime, true)}
            </Typography>
            <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
              Current Position
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, display: 'block' }}>
              Start: <b>{formatTimecode(trimStart, true)}</b>
            </Typography>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, display: 'block' }}>
              End: <b>{formatTimecode(trimEnd, true)}</b>
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
