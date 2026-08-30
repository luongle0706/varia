import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Rotate3d,
} from 'lucide-react';
import type { ImageTransformConfig } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { StudioSectionCard } from './StudioSectionCard';
import { StudioSliderControl } from './StudioSliderControl';

export interface ImageTransformPanelProps {
  transform: ImageTransformConfig;
  onChange: (newTransform: ImageTransformConfig) => void;
  onReset: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const ImageTransformPanel: React.FC<ImageTransformPanelProps> = ({
  transform,
  onChange,
  onReset,
  collapsible = true,
  defaultExpanded = true,
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

  const hasTransform =
    transform.rotate !== 0 || transform.flipHorizontal || transform.flipVertical;

  return (
    <StudioSectionCard
      title="Transform & Rotate"
      icon={<Rotate3d size={18} color={colorTokens.accent.violetLight} />}
      infoTooltip="Rotate 90 degrees, flip axes, or apply custom precision angle rotation"
      showReset={hasTransform}
      onReset={onReset}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      {/* Symmetrical 4-Column Transform Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          mb: 2.5,
        }}
      >
        <Tooltip title="Rotate 90° Counter-Clockwise" arrow>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RotateCcw size={14} />}
            onClick={() => handleRotate90('ccw')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.8,
              px: 0.5,
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
            startIcon={<RotateCw size={14} />}
            onClick={() => handleRotate90('cw')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.8,
              px: 0.5,
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
            startIcon={<FlipHorizontal size={14} />}
            onClick={handleFlipH}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.8,
              px: 0.5,
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

        <Tooltip title="Flip Vertically (Invert)" arrow>
          <Button
            variant={transform.flipVertical ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FlipVertical size={14} />}
            onClick={handleFlipV}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              py: 0.8,
              px: 0.5,
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
      </Box>

      {/* Free Rotate Slider using generic StudioSliderControl */}
      <StudioSliderControl
        label="Free Rotate Angle"
        value={transform.rotate}
        min={-180}
        max={180}
        step={1}
        unit="°"
        tooltip="Fine-tune rotation angle with slider or direct degrees input"
        onChange={val => onChange({ ...transform, rotate: val })}
      />
    </StudioSectionCard>
  );
};
