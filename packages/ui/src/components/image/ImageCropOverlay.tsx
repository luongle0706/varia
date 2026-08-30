import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Crop,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Circle,
  Maximize2,
} from 'lucide-react';
import type { AspectRatioPreset, CropRect, ImageDimensions } from '@varia/core';
import { calculateAspectCropRect } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { StudioSectionCard } from './StudioSectionCard';

export interface ImageCropOverlayProps {
  dimensions: ImageDimensions;
  activePreset: AspectRatioPreset;
  cropRect?: CropRect;
  onPresetChange: (preset: AspectRatioPreset, rect: CropRect) => void;
  onResetCrop: () => void;
  onOpenCropMode?: () => void;
  isCropMode?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const ImageCropOverlay: React.FC<ImageCropOverlayProps> = ({
  dimensions,
  activePreset,
  cropRect,
  onPresetChange,
  onResetCrop,
  onOpenCropMode,
  isCropMode = false,
  collapsible = true,
  defaultExpanded = true,
}) => {
  const presets: { id: AspectRatioPreset; label: string; icon: React.ReactNode; tooltip: string }[] = [
    {
      id: 'freeform',
      label: 'Full Frame',
      icon: <Maximize2 size={13} />,
      tooltip: 'Full original image bounds (uncropped)',
    },
    {
      id: '1:1',
      label: '1:1 Square',
      icon: <Square size={13} />,
      tooltip: 'Square (Instagram Post, Profile Avatar)',
    },
    {
      id: '16:9',
      label: '16:9 Landscape',
      icon: <RectangleHorizontal size={13} />,
      tooltip: 'Landscape (YouTube Thumbnail, Desktop)',
    },
    {
      id: '9:16',
      label: '9:16 Story / Reel',
      icon: <RectangleVertical size={13} />,
      tooltip: 'Portrait (Stories, TikTok, Reels)',
    },
    {
      id: '4:5',
      label: '4:5 Portrait',
      icon: <RectangleVertical size={13} />,
      tooltip: 'Instagram Portrait Feed',
    },
    {
      id: '4:3',
      label: '4:3 Standard',
      icon: <RectangleHorizontal size={13} />,
      tooltip: 'Standard Photo Frame',
    },
    {
      id: 'circular',
      label: 'Circle (Avatar)',
      icon: <Circle size={13} />,
      tooltip: 'Circular profile crop cutout',
    },
  ];

  const handleSelectPreset = (preset: AspectRatioPreset) => {
    if (preset === 'freeform') {
      onResetCrop();
      return;
    }
    const newRect = calculateAspectCropRect(dimensions.width, dimensions.height, preset);
    onPresetChange(preset, newRect);
    if (onOpenCropMode && !isCropMode) {
      onOpenCropMode();
    }
  };

  const handleWidthChange = (newW: number) => {
    const w = Math.min(dimensions.width, Math.max(10, newW));
    let h = cropRect?.height || dimensions.height;

    if (activePreset === '1:1' || activePreset === 'circular') {
      h = w;
    } else if (activePreset === '16:9') {
      h = Math.round((w * 9) / 16);
    } else if (activePreset === '9:16') {
      h = Math.round((w * 16) / 9);
    } else if (activePreset === '4:5') {
      h = Math.round((w * 5) / 4);
    } else if (activePreset === '4:3') {
      h = Math.round((w * 3) / 4);
    }

    h = Math.min(dimensions.height, Math.max(10, h));
    const x = Math.max(0, Math.min(cropRect?.x || 0, dimensions.width - w));
    const y = Math.max(0, Math.min(cropRect?.y || 0, dimensions.height - h));

    onPresetChange(activePreset, { x, y, width: w, height: h });
  };

  const handleHeightChange = (newH: number) => {
    const h = Math.min(dimensions.height, Math.max(10, newH));
    let w = cropRect?.width || dimensions.width;

    if (activePreset === '1:1' || activePreset === 'circular') {
      w = h;
    } else if (activePreset === '16:9') {
      w = Math.round((h * 16) / 9);
    } else if (activePreset === '9:16') {
      w = Math.round((h * 9) / 16);
    } else if (activePreset === '4:5') {
      w = Math.round((h * 4) / 5);
    } else if (activePreset === '4:3') {
      w = Math.round((h * 4) / 3);
    }

    w = Math.min(dimensions.width, Math.max(10, w));
    const x = Math.max(0, Math.min(cropRect?.x || 0, dimensions.width - w));
    const y = Math.max(0, Math.min(cropRect?.y || 0, dimensions.height - h));

    onPresetChange(activePreset, { x, y, width: w, height: h });
  };

  const handlePositionChange = (xPos?: number, yPos?: number) => {
    if (!cropRect) return;
    const currentW = cropRect.width;
    const currentH = cropRect.height;
    const x =
      xPos !== undefined
        ? Math.max(0, Math.min(dimensions.width - currentW, xPos))
        : cropRect.x;
    const y =
      yPos !== undefined
        ? Math.max(0, Math.min(dimensions.height - currentH, yPos))
        : cropRect.y;

    onPresetChange(activePreset, { ...cropRect, x, y });
  };

  const isCropActive = activePreset !== 'freeform' && Boolean(cropRect);
  const activeW = cropRect ? Math.round(cropRect.width) : dimensions.width;
  const activeH = cropRect ? Math.round(cropRect.height) : dimensions.height;
  const activeX = cropRect ? Math.round(cropRect.x) : 0;
  const activeY = cropRect ? Math.round(cropRect.y) : 0;

  return (
    <StudioSectionCard
      title="Crop & Aspect Ratio"
      icon={<Crop size={18} color={colorTokens.accent.violetLight} />}
      infoTooltip="Crop image to standard social media aspect ratios or custom dimensions"
      badge={
        <Stack direction="row" spacing={1} alignItems="center">
          {isCropMode && (
            <Chip
              label="Editing on Canvas"
              size="small"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: colorTokens.accent.violetLight,
                border: `1px solid ${colorTokens.accent.violet}`,
              }}
            />
          )}

          <Chip
            label={`${activeW} × ${activeH} px`}
            size="small"
            sx={{
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: colorTokens.accent.violetLight,
            }}
          />
        </Stack>
      }
      showReset={isCropActive}
      onReset={onResetCrop}
      isHighlighted={isCropMode}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      {/* Interactive Canvas Crop Mode Button */}
      {onOpenCropMode && !isCropMode && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<Crop size={15} />}
          onClick={onOpenCropMode}
          sx={{
            mb: 2,
            py: 0.9,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'none',
            borderColor: colorTokens.accent.violet,
            color: colorTokens.accent.violetLight,
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            '&:hover': {
              borderColor: colorTokens.accent.violetLight,
              backgroundColor: 'rgba(139, 92, 246, 0.16)',
            },
          }}
        >
          {isCropActive ? 'Adjust Crop on Canvas' : 'Interactive Crop on Canvas'}
        </Button>
      )}

      {/* Aspect Ratio Preset Buttons */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 1,
          mb: isCropActive ? 2.5 : 0,
        }}
      >
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
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  py: 0.7,
                  px: 1,
                  whiteSpace: 'nowrap',
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
      </Box>

      {/* Active Crop Box Dimension Inputs */}
      {isCropActive && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            border: `1px solid rgba(139, 92, 246, 0.25)`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: colorTokens.accent.violetLight, fontWeight: 700, display: 'block', mb: 1.5 }}
          >
            Crop Dimensions ({activeW} × {activeH} px)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              size="small"
              label="Width (px)"
              type="number"
              value={activeW}
              onChange={e => handleWidthChange(parseInt(e.target.value, 10) || 10)}
              inputProps={{ min: 10, max: dimensions.width }}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
              }}
            />
            <TextField
              size="small"
              label="Height (px)"
              type="number"
              value={activeH}
              onChange={e => handleHeightChange(parseInt(e.target.value, 10) || 10)}
              inputProps={{ min: 10, max: dimensions.height }}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
              }}
            />
            <TextField
              size="small"
              label="X Position (px)"
              type="number"
              value={activeX}
              onChange={e => handlePositionChange(parseInt(e.target.value, 10) || 0, undefined)}
              inputProps={{ min: 0, max: dimensions.width - activeW }}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
              }}
            />
            <TextField
              size="small"
              label="Y Position (px)"
              type="number"
              value={activeY}
              onChange={e => handlePositionChange(undefined, parseInt(e.target.value, 10) || 0)}
              inputProps={{ min: 0, max: dimensions.height - activeH }}
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
              }}
            />
          </Box>
        </Box>
      )}
    </StudioSectionCard>
  );
};
