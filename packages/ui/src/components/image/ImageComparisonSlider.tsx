import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import { Columns, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { formatBytes } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface ImageComparisonSliderProps {
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  width?: number;
  height?: number;
  format?: string;
  originalFormat?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalUrl,
  compressedUrl,
  originalSize,
  compressedSize,
  savingsPercentage,
  width,
  height,
  format = 'WEBP',
  originalFormat,
}) => {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  return (
    <GlassCard sx={{ p: 2, position: 'relative', overflow: 'hidden' }}>
      {/* Header Stats Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        mb={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Columns size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Before / After Comparison
          </Typography>
          {width && height && (
            <Chip
              label={`${width}×${height}px`}
              size="small"
              sx={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: colorTokens.text.muted,
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Savings Badge */}
          {savingsPercentage > 0 && (
            <Chip
              icon={<Sparkles size={14} color="#10b981" />}
              label={`-${savingsPercentage}% (${formatBytes(originalSize)} → ${formatBytes(compressedSize)})`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
              }}
            />
          )}

          <Tooltip title={`Zoom (${zoomLevel}x)`} arrow>
            <IconButton
              size="small"
              onClick={toggleZoom}
              sx={{
                color: zoomLevel > 1 ? colorTokens.accent.violetLight : colorTokens.text.muted,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              {zoomLevel > 1 ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Interactive Split Canvas Viewport */}
      <Box
        ref={containerRef}
        onMouseDown={e => {
          handleMouseDown();
          handleMove(e.clientX);
        }}
        onTouchStart={e => {
          if (e.touches[0]) {
            handleMouseDown();
            handleMove(e.touches[0].clientX);
          }
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 320, sm: 440, md: 520 },
          borderRadius: 2.5,
          overflow: 'hidden',
          cursor: isDragging ? 'ew-resize' : 'col-resize',
          backgroundColor: '#09090b',
          backgroundImage:
            'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          userSelect: 'none',
        }}
      >
        {/* Compressed (Right Image Background) */}
        <Box
          component="img"
          src={compressedUrl}
          alt="Compressed"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${sliderPos}% 50%`,
            pointerEvents: 'none',
          }}
        />

        {/* Original (Left Image with Clip-Path) */}
        <Box
          component="img"
          src={originalUrl}
          alt="Original"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${sliderPos}% 50%`,
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Draggable Divider Line & Handle */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: 2,
            backgroundColor: '#ffffff',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#18181b',
              border: `2px solid #ffffff`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            }}
          >
            <Columns size={16} />
          </Box>
        </Box>

        {/* Labels Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            px: 1.2,
            py: 0.4,
            borderRadius: 1.5,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#e4e4e7' }}>
            Original {originalFormat ? originalFormat.toUpperCase() + ' ' : ''}({formatBytes(originalSize)})
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            px: 1.2,
            py: 0.4,
            borderRadius: 1.5,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: colorTokens.accent.violetLight }}>
            Compressed {format.toUpperCase()} ({formatBytes(compressedSize)})
          </Typography>
        </Box>
      </Box>
    </GlassCard>
  );
};
