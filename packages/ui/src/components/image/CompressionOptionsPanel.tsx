import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Slider,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Select,
  MenuItem,
  Chip,
  FormControl,
} from '@mui/material';
import {
  HardDrive,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import {
  type ImageCompressionConfig,
  type ImageOutputFormat,
  getSmartCompressionQuality,
} from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface CompressionOptionsPanelProps {
  compression: ImageCompressionConfig;
  onChange: (newConfig: ImageCompressionConfig) => void;
  showAdvancedOnly?: boolean;
  currentSizeKb?: number;
}

export const CompressionOptionsPanel: React.FC<CompressionOptionsPanelProps> = ({
  compression,
  onChange,
  showAdvancedOnly = false,
  currentSizeKb,
}) => {
  const qualityPresets = [60, 75, 85, 95];
  const colorPresets = [256, 128, 64, 32, 16];

  const handleSmartModeToggle = (checked: boolean) => {
    if (checked) {
      const smartQuality = getSmartCompressionQuality(compression.format);
      onChange({
        ...compression,
        smartMode: true,
        quality: smartQuality,
        targetSizeKb: null,
        maxColors: 256,
      });
    } else {
      onChange({
        ...compression,
        smartMode: false,
      });
    }
  };

  const handleFormatChange = (format: ImageOutputFormat) => {
    if (compression.smartMode) {
      const smartQuality = getSmartCompressionQuality(format);
      onChange({
        ...compression,
        format,
        quality: smartQuality,
        targetSizeKb: null,
      });
    } else {
      onChange({ ...compression, format });
    }
  };

  const handleQualitySlider = (_: Event, val: number | number[]) => {
    onChange({
      ...compression,
      quality: Number(val),
      targetSizeKb: null,
      smartMode: false,
    });
  };

  const handleQualityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange({
        ...compression,
        quality: Math.max(1, Math.min(100, val)),
        targetSizeKb: null,
        smartMode: false,
      });
    }
  };

  const handleTargetSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({
      ...compression,
      targetSizeKb: isNaN(val) || val <= 0 ? null : val,
      smartMode: false,
    });
  };

  return (
    <GlassCard sx={{ p: 2.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <HardDrive size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Compression & Output Format
          </Typography>
          <Tooltip title="Configure compression algorithm, target size, and output file format" arrow>
            <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>
      </Stack>

      {/* Smart Mode Switch */}
      {!showAdvancedOnly && (
        <Box
          sx={{
            p: 1.5,
            mb: 2.5,
            borderRadius: 2,
            backgroundColor: compression.smartMode
              ? 'rgba(139, 92, 246, 0.12)'
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${compression.smartMode ? colorTokens.accent.violet : colorTokens.bg.border}`,
            transition: 'all 0.2s ease',
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={compression.smartMode}
                onChange={e => handleSmartModeToggle(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Sparkles size={16} color={compression.smartMode ? colorTokens.accent.violetLight : colorTokens.text.muted} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
                  Smart Visual Lossless Optimizer
                </Typography>
                <Tooltip title="Automatically calculates the optimal compression curve to maximize file size reduction with zero perceptible quality loss" arrow>
                  <Info size={13} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
                </Tooltip>
              </Stack>
            }
          />
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, display: 'block', mt: 0.5, pl: 4 }}>
            {compression.smartMode
              ? 'Automatic perceptual quality tuning active'
              : 'Manual quality & target size tuning active'}
          </Typography>
        </Box>
      )}

      {/* Format Selector */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
            Output Format
          </Typography>
          <Tooltip title="WebP/AVIF offer highest compression; JPEG has maximum compatibility; PNG preserves sharp lines" arrow>
            <Info size={13} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>

        <FormControl size="small">
          <Select
            value={compression.format}
            onChange={e => handleFormatChange(e.target.value as ImageOutputFormat)}
            MenuProps={{ disableScrollLock: true }}
            sx={{
              height: 32,
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 2,
              '& .MuiSelect-select': { py: 0.5, px: 1.5 },
            }}
          >
            <MenuItem value="webp">WebP (Recommended)</MenuItem>
            <MenuItem value="avif">AVIF (Ultra Light)</MenuItem>
            <MenuItem value="jpeg">JPEG / JPG</MenuItem>
            <MenuItem value="png">PNG (Lossless)</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Manual Quality Slider & Number Input (when not in smart mode or in advanced mode) */}
      <Box mb={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Quality
            </Typography>
            <Tooltip title="Higher quality preserves fine textures but produces larger file sizes" arrow>
              <Info size={13} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={compression.quality}
              onChange={handleQualityInput}
              inputProps={{ min: 1, max: 100, step: 1 }}
              sx={{
                width: 60,
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
              %
            </Typography>
          </Stack>
        </Stack>

        <Slider
          value={compression.quality}
          min={1}
          max={100}
          step={1}
          onChange={handleQualitySlider}
          sx={{
            color: colorTokens.accent.violet,
            '& .MuiSlider-thumb': { width: 14, height: 14, backgroundColor: '#ffffff' },
          }}
        />

        {/* Preset Pills */}
        <Stack direction="row" spacing={0.8} mt={0.5}>
          {qualityPresets.map(q => (
            <Chip
              key={q}
              label={`${q}%`}
              size="small"
              onClick={() =>
                onChange({
                  ...compression,
                  quality: q,
                  targetSizeKb: null,
                  smartMode: false,
                })
              }
              sx={{
                fontSize: '0.7rem',
                cursor: 'pointer',
                backgroundColor:
                  compression.quality === q ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: compression.quality === q ? colorTokens.accent.violet : 'transparent',
                borderWidth: 1,
                borderStyle: 'solid',
                color: compression.quality === q ? colorTokens.accent.violetLight : colorTokens.text.muted,
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Target File Size KB */}
      <Box mb={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Target File Size Limit
            </Typography>
            <Tooltip title="Automatically calculates the optimal quality setting to keep file size strictly under your target limit" arrow>
              <Info size={13} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              type="number"
              placeholder={currentSizeKb ? `${Math.round(currentSizeKb)}` : 'e.g. 500'}
              value={
                compression.targetSizeKb !== null && compression.targetSizeKb !== undefined
                  ? compression.targetSizeKb
                  : currentSizeKb
                    ? Math.round(currentSizeKb)
                    : ''
              }
              onChange={handleTargetSizeInput}
              inputProps={{ min: 1, max: 20000, step: 10 }}
              sx={{
                width: 90,
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
              KB
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Color Quantization Palette Reduction */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Layers size={14} color={colorTokens.accent.violetLight} />
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Color Quantization (Dithered Palette)
            </Typography>
            <Tooltip title="Reduces color palette with Floyd-Steinberg error diffusion for extreme file size reduction" arrow>
              <Info size={13} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={0.8}>
          {colorPresets.map(colors => {
            const isSelected = (compression.maxColors ?? 256) === colors;
            return (
              <Chip
                key={colors}
                label={`${colors} Colors`}
                size="small"
                onClick={() =>
                  onChange({
                    ...compression,
                    maxColors: colors,
                  })
                }
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSelected ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: isSelected ? '#ffffff' : colorTokens.text.secondary,
                  '&:hover': {
                    backgroundColor: isSelected ? colorTokens.accent.violetLight : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>
    </GlassCard>
  );
};
