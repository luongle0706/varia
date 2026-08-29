import React from 'react';
import {
  Typography,
  Stack,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import { Crop, Info, Square, RectangleHorizontal, RectangleVertical, Circle } from 'lucide-react';
import type { AspectRatioPreset, CropRect, ImageDimensions } from '@varia/core';
import { calculateAspectCropRect } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface ImageCropOverlayProps {
  dimensions: ImageDimensions;
  activePreset: AspectRatioPreset;
  cropRect?: CropRect;
  onPresetChange: (preset: AspectRatioPreset, rect: CropRect) => void;
  onResetCrop: () => void;
}

export const ImageCropOverlay: React.FC<ImageCropOverlayProps> = ({
  dimensions,
  activePreset,
  cropRect,
  onPresetChange,
  onResetCrop,
}) => {
  const presets: { id: AspectRatioPreset; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'freeform',
      label: 'Free',
      icon: <Crop size={14} />,
      tooltip: 'Unconstrained original image bounds',
    },
    {
      id: '1:1',
      label: '1:1',
      icon: <Square size={14} />,
      tooltip: 'Square (Instagram Post, Profile Avatar)',
    },
    {
      id: '16:9',
      label: '16:9',
      icon: <RectangleHorizontal size={14} />,
      tooltip: 'Landscape (YouTube Thumbnail, Desktop)',
    },
    {
      id: '9:16',
      label: '9:16',
      icon: <RectangleVertical size={14} />,
      tooltip: 'Portrait (Stories, TikTok, Reels)',
    },
    {
      id: '4:5',
      label: '4:5',
      icon: <RectangleVertical size={14} />,
      tooltip: 'Instagram Portrait Feed',
    },
    {
      id: '4:3',
      label: '4:3',
      icon: <RectangleHorizontal size={14} />,
      tooltip: 'Standard Photo Frame',
    },
    {
      id: 'circular',
      label: 'Circle',
      icon: <Circle size={14} />,
      tooltip: 'Circular profile crop cutout',
    },
  ];

  const handleSelectPreset = (preset: AspectRatioPreset) => {
    const newRect = calculateAspectCropRect(dimensions.width, dimensions.height, preset);
    onPresetChange(preset, newRect);
  };

  const currentW = cropRect ? cropRect.width : dimensions.width;
  const currentH = cropRect ? cropRect.height : dimensions.height;

  return (
    <GlassCard sx={{ p: 2.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Crop size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Crop & Aspect Ratio
          </Typography>
          <Tooltip title="Crop image to standard social media aspect ratios or custom dimensions" arrow>
            <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${currentW} × ${currentH} px`}
            size="small"
            sx={{
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: colorTokens.accent.violetLight,
            }}
          />
          {activePreset !== 'freeform' && (
            <Button
              size="small"
              onClick={onResetCrop}
              sx={{
                fontSize: '0.75rem',
                color: colorTokens.text.muted,
                '&:hover': { color: colorTokens.accent.rose },
              }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Aspect Ratio Preset Buttons */}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {presets.map(p => {
          const isActive = activePreset === p.id;
          return (
            <Tooltip key={p.id} title={p.tooltip} arrow>
              <Button
                variant={isActive ? 'contained' : 'outlined'}
                size="small"
                startIcon={p.icon}
                onClick={() => handleSelectPreset(p.id)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.6,
                  backgroundColor: isActive ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? colorTokens.accent.violet : colorTokens.bg.border,
                  color: isActive ? '#ffffff' : colorTokens.text.secondary,
                  '&:hover': {
                    backgroundColor: isActive ? colorTokens.accent.violetLight : 'rgba(255, 255, 255, 0.08)',
                    borderColor: colorTokens.accent.violet,
                  },
                }}
              >
                {p.label}
              </Button>
            </Tooltip>
          );
        })}
      </Stack>
    </GlassCard>
  );
};
