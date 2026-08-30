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
import { StudioSectionCard } from './StudioSectionCard';

export interface CompressionOptionsPanelProps {
  compression: ImageCompressionConfig;
  onChange: (newConfig: ImageCompressionConfig) => void;
  showAdvancedOnly?: boolean;
  currentSizeKb?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const CompressionOptionsPanel: React.FC<CompressionOptionsPanelProps> = ({
  compression,
  onChange,
  showAdvancedOnly = false,
  currentSizeKb,
  collapsible = showAdvancedOnly,
  defaultExpanded = !showAdvancedOnly,
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
    if (!isNaN(val) && val > 0) {
      let estimatedQuality = compression.quality;
      if (currentSizeKb && currentSizeKb > 0) {
        const ratio = val / currentSizeKb;
        estimatedQuality = Math.max(5, Math.min(100, Math.round(compression.quality * ratio)));
      }

      onChange({
        ...compression,
        targetSizeKb: val,
        quality: estimatedQuality,
        smartMode: false,
      });
    } else {
      onChange({
        ...compression,
        targetSizeKb: null,
      });
    }
  };

  return (
    <StudioSectionCard
      title={showAdvancedOnly ? 'Advanced Compression & Encoding' : 'Compression & Output Format'}
      icon={<HardDrive size={18} color={colorTokens.accent.violetLight} />}
      infoTooltip="Optimize file size, select modern formats (WebP, AVIF, JPEG, PNG), adjust quality, or set a target file size ceiling"
      badge={
        <Chip
          label={`${compression.format.toUpperCase()} • ${compression.quality}%`}
          size="small"
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: colorTokens.accent.violetLight,
          }}
        />
      }
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      {/* Smart Mode Optimizer Toggle */}
      <Box
        sx={{
          p: 1.8,
          borderRadius: 2,
          backgroundColor: compression.smartMode
            ? 'rgba(16, 185, 129, 0.08)'
            : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${
            compression.smartMode ? 'rgba(16, 185, 129, 0.3)' : colorTokens.bg.border
          }`,
          mb: 2.5,
          transition: 'all 0.2s ease',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Sparkles
              size={18}
              color={compression.smartMode ? '#34d399' : colorTokens.text.muted}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: compression.smartMode ? '#34d399' : colorTokens.text.primary,
                  fontSize: '0.85rem',
                }}
              >
                Smart Visual Lossless Optimizer
              </Typography>
            </Box>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={compression.smartMode}
                onChange={e => handleSmartModeToggle(e.target.checked)}
                color="success"
              />
            }
            label=""
            sx={{ m: 0 }}
          />
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: colorTokens.text.secondary, display: 'block', mt: 0.5, pl: 4 }}
        >
          Automatically achieves maximum compression with zero visible quality loss
        </Typography>
      </Box>

      {/* Output Format Dropdown */}
      <Box mb={2.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
              Output Format
            </Typography>
            <Tooltip title="WebP and AVIF offer up to 70% better compression than traditional JPEG and PNG" arrow>
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
                fontWeight: 600,
                width: 140,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 2,
                '& .MuiSelect-select': { py: 0.5, px: 1.2 },
              }}
            >
              <MenuItem value="webp">WEBP (Recommended)</MenuItem>
              <MenuItem value="avif">AVIF (Ultra Tiny)</MenuItem>
              <MenuItem value="jpeg">JPEG (Universal)</MenuItem>
              <MenuItem value="png">PNG (Lossless)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Manual Quality Slider & Number Input */}
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
    </StudioSectionCard>
  );
};
