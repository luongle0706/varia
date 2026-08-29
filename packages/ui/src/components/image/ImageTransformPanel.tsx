import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Slider,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Rotate3d,
  Info,
  RotateCcw as ResetIcon,
} from 'lucide-react';
import type { ImageTransformConfig } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface ImageTransformPanelProps {
  transform: ImageTransformConfig;
  onChange: (newTransform: ImageTransformConfig) => void;
  onReset: () => void;
}

export const ImageTransformPanel: React.FC<ImageTransformPanelProps> = ({
  transform,
  onChange,
  onReset,
}) => {
  const handleRotate90 = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    let newAngle = (transform.rotate + delta) % 360;
    if (newAngle > 180) newAngle -= 360;
    if (newAngle < -180) newAngle += 360;
    onChange({ ...transform, rotate: newAngle });
  };

  const handleFlipH = () => {
    onChange({ ...transform, flipHorizontal: !transform.flipHorizontal });
  };

  const handleFlipV = () => {
    onChange({ ...transform, flipVertical: !transform.flipVertical });
  };

  const handleAngleSlider = (_: Event, val: number | number[]) => {
    onChange({ ...transform, rotate: Number(val) });
  };

  const handleAngleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(-180, Math.min(180, val));
      onChange({ ...transform, rotate: clamped });
    }
  };

  const hasTransform =
    transform.rotate !== 0 || transform.flipHorizontal || transform.flipVertical;

  return (
    <GlassCard sx={{ p: 2.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Rotate3d size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Transform & Rotate
          </Typography>
          <Tooltip title="Rotate 90 degrees, flip axes, or apply custom precision angle rotation" arrow>
            <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>

        {hasTransform && (
          <Button
            size="small"
            startIcon={<ResetIcon size={12} />}
            onClick={onReset}
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

      {/* Static Transform Icon Buttons */}
      <Stack direction="row" spacing={1.5} mb={2.5} flexWrap="wrap">
        <Tooltip title="Rotate 90° Counter-Clockwise" arrow>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RotateCcw size={16} />}
            onClick={() => handleRotate90('ccw')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: colorTokens.bg.border,
              color: colorTokens.text.primary,
              '&:hover': {
                borderColor: colorTokens.accent.violet,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            -90°
          </Button>
        </Tooltip>

        <Tooltip title="Rotate 90° Clockwise" arrow>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RotateCw size={16} />}
            onClick={() => handleRotate90('cw')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: colorTokens.bg.border,
              color: colorTokens.text.primary,
              '&:hover': {
                borderColor: colorTokens.accent.violet,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            +90°
          </Button>
        </Tooltip>

        <Tooltip title="Flip Horizontally (Mirror)" arrow>
          <Button
            variant={transform.flipHorizontal ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FlipHorizontal size={16} />}
            onClick={handleFlipH}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              backgroundColor: transform.flipHorizontal ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
              borderColor: transform.flipHorizontal ? colorTokens.accent.violet : colorTokens.bg.border,
              color: transform.flipHorizontal ? '#ffffff' : colorTokens.text.primary,
              '&:hover': {
                borderColor: colorTokens.accent.violet,
                backgroundColor: transform.flipHorizontal ? colorTokens.accent.violetLight : 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            Flip H
          </Button>
        </Tooltip>

        <Tooltip title="Flip Vertically" arrow>
          <Button
            variant={transform.flipVertical ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FlipVertical size={16} />}
            onClick={handleFlipV}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              backgroundColor: transform.flipVertical ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
              borderColor: transform.flipVertical ? colorTokens.accent.violet : colorTokens.bg.border,
              color: transform.flipVertical ? '#ffffff' : colorTokens.text.primary,
              '&:hover': {
                borderColor: colorTokens.accent.violet,
                backgroundColor: transform.flipVertical ? colorTokens.accent.violetLight : 'rgba(139, 92, 246, 0.1)',
              },
            }}
          >
            Flip V
          </Button>
        </Tooltip>
      </Stack>

      {/* Free Rotate Slider + Number Input */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
            Free Rotate Angle
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={transform.rotate}
              onChange={handleAngleInput}
              inputProps={{ min: -180, max: 180, step: 1 }}
              sx={{
                width: 70,
                '& .MuiInputBase-input': {
                  py: 0.3,
                  px: 0.8,
                  fontSize: '0.8rem',
                  textAlign: 'right',
                  color: colorTokens.text.primary,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                },
              }}
            />
            <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
              °
            </Typography>
          </Stack>
        </Stack>

        <Slider
          value={transform.rotate}
          min={-180}
          max={180}
          step={1}
          onChange={handleAngleSlider}
          sx={{
            color: colorTokens.accent.violet,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: '#ffffff',
            },
          }}
        />
      </Box>
    </GlassCard>
  );
};
