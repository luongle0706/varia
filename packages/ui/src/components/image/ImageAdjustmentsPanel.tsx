import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Slider,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material';
import { Sliders, Info, RotateCcw } from 'lucide-react';
import type { ImageFilterConfig, PresetFilterName } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface ImageAdjustmentsPanelProps {
  filters: ImageFilterConfig;
  onChange: (newFilters: ImageFilterConfig) => void;
  onReset: () => void;
}

export const ImageAdjustmentsPanel: React.FC<ImageAdjustmentsPanelProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const presets: { id: PresetFilterName; label: string }[] = [
    { id: 'none', label: 'Normal' },
    { id: 'grayscale', label: 'B&W' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'cyberpunk', label: 'Cyber' },
    { id: 'high-contrast', label: 'Vivid' },
    { id: 'invert', label: 'Invert' },
  ];

  const handleSliderChange = (key: keyof ImageFilterConfig, val: number) => {
    onChange({ ...filters, [key]: val });
  };

  const handleInputChange = (
    key: keyof ImageFilterConfig,
    min: number,
    max: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange({ ...filters, [key]: Math.max(min, Math.min(max, val)) });
    }
  };

  const hasAdjustments =
    filters.preset !== 'none' ||
    filters.brightness !== 0 ||
    filters.contrast !== 0 ||
    filters.saturation !== 0 ||
    filters.blur !== 0 ||
    filters.sharpen !== 0;

  return (
    <GlassCard sx={{ p: 2.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Sliders size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Filters & Adjustments
          </Typography>
          <Tooltip title="Fine-tune lighting, color saturation, blur, sharpen, or apply 1-click creative presets" arrow>
            <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>

        {hasAdjustments && (
          <Button
            size="small"
            startIcon={<RotateCcw size={12} />}
            onClick={onReset}
            sx={{
              fontSize: '0.75rem',
              color: colorTokens.text.muted,
              '&:hover': { color: colorTokens.accent.rose },
            }}
          >
            Reset All
          </Button>
        )}
      </Stack>

      {/* 1-Click Filter Presets */}
      <Box mb={2.5}>
        <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600, display: 'block', mb: 1 }}>
          Filter Presets
        </Typography>
        <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.5}>
          {presets.map(p => {
            const isActive = filters.preset === p.id;
            return (
              <Chip
                key={p.id}
                label={p.label}
                size="small"
                onClick={() => onChange({ ...filters, preset: p.id })}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isActive ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? colorTokens.accent.violet : colorTokens.bg.border,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: isActive ? '#ffffff' : colorTokens.text.secondary,
                  '&:hover': {
                    borderColor: colorTokens.accent.violet,
                    backgroundColor: isActive ? colorTokens.accent.violetLight : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Sliders with Number Inputs */}
      <Stack spacing={1.8}>
        {/* Brightness */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Brightness
            </Typography>
            <TextField
              size="small"
              type="number"
              value={filters.brightness}
              onChange={e => handleInputChange('brightness', -100, 100, e as React.ChangeEvent<HTMLInputElement>)}
              inputProps={{ min: -100, max: 100, step: 5 }}
              sx={{
                width: 60,
                '& .MuiInputBase-input': { py: 0.2, px: 0.6, fontSize: '0.75rem', textAlign: 'right' },
              }}
            />
          </Stack>
          <Slider
            size="small"
            value={filters.brightness}
            min={-100}
            max={100}
            onChange={(_, val) => handleSliderChange('brightness', Number(val))}
            sx={{ color: colorTokens.accent.violet }}
          />
        </Box>

        {/* Contrast */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Contrast
            </Typography>
            <TextField
              size="small"
              type="number"
              value={filters.contrast}
              onChange={e => handleInputChange('contrast', -100, 100, e as React.ChangeEvent<HTMLInputElement>)}
              inputProps={{ min: -100, max: 100, step: 5 }}
              sx={{
                width: 60,
                '& .MuiInputBase-input': { py: 0.2, px: 0.6, fontSize: '0.75rem', textAlign: 'right' },
              }}
            />
          </Stack>
          <Slider
            size="small"
            value={filters.contrast}
            min={-100}
            max={100}
            onChange={(_, val) => handleSliderChange('contrast', Number(val))}
            sx={{ color: colorTokens.accent.violet }}
          />
        </Box>

        {/* Saturation */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Saturation
            </Typography>
            <TextField
              size="small"
              type="number"
              value={filters.saturation}
              onChange={e => handleInputChange('saturation', -100, 100, e as React.ChangeEvent<HTMLInputElement>)}
              inputProps={{ min: -100, max: 100, step: 5 }}
              sx={{
                width: 60,
                '& .MuiInputBase-input': { py: 0.2, px: 0.6, fontSize: '0.75rem', textAlign: 'right' },
              }}
            />
          </Stack>
          <Slider
            size="small"
            value={filters.saturation}
            min={-100}
            max={100}
            onChange={(_, val) => handleSliderChange('saturation', Number(val))}
            sx={{ color: colorTokens.accent.violet }}
          />
        </Box>

        {/* Blur & Sharpen */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
                Blur
              </Typography>
              <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                {filters.blur}px
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={filters.blur}
              min={0}
              max={20}
              onChange={(_, val) => handleSliderChange('blur', Number(val))}
              sx={{ color: colorTokens.accent.cyan }}
            />
          </Box>

          <Box flex={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
                Sharpen
              </Typography>
              <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                {filters.sharpen}%
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={filters.sharpen}
              min={0}
              max={100}
              onChange={(_, val) => handleSliderChange('sharpen', Number(val))}
              sx={{ color: colorTokens.accent.emerald }}
            />
          </Box>
        </Stack>
      </Stack>
    </GlassCard>
  );
};
