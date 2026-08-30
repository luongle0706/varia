import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Sliders } from 'lucide-react';
import type { ImageFilterConfig, PresetFilterName } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { StudioSectionCard } from './StudioSectionCard';
import { StudioSliderControl } from './StudioSliderControl';

export interface ImageAdjustmentsPanelProps {
  filters: ImageFilterConfig;
  onChange: (newFilters: ImageFilterConfig) => void;
  onReset: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const PRESET_VALUES: Record<PresetFilterName, Omit<ImageFilterConfig, 'preset'>> = {
  none: { brightness: 0, contrast: 0, saturation: 0, blur: 0, sharpen: 0 },
  grayscale: { brightness: 0, contrast: 15, saturation: -100, blur: 0, sharpen: 0 },
  sepia: { brightness: -5, contrast: 20, saturation: -25, blur: 0, sharpen: 0 },
  vintage: { brightness: -10, contrast: 25, saturation: 20, blur: 0, sharpen: 10 },
  cyberpunk: { brightness: 10, contrast: 35, saturation: 50, blur: 0, sharpen: 20 },
  'high-contrast': { brightness: 5, contrast: 50, saturation: 25, blur: 0, sharpen: 15 },
  invert: { brightness: 0, contrast: 0, saturation: 0, blur: 0, sharpen: 0 },
};

export const ImageAdjustmentsPanel: React.FC<ImageAdjustmentsPanelProps> = ({
  filters,
  onChange,
  onReset,
  collapsible = true,
  defaultExpanded = false,
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

  const handleSelectPreset = (presetId: PresetFilterName) => {
    const values = PRESET_VALUES[presetId] || PRESET_VALUES.none;
    onChange({
      preset: presetId,
      ...values,
    });
  };

  const handleSliderChange = (key: keyof Omit<ImageFilterConfig, 'preset'>, val: number) => {
    onChange({
      ...filters,
      [key]: val,
      preset: 'none', // Manual edit unselects preset
    });
  };

  const hasAdjustments =
    filters.preset !== 'none' ||
    filters.brightness !== 0 ||
    filters.contrast !== 0 ||
    filters.saturation !== 0 ||
    filters.blur !== 0 ||
    filters.sharpen !== 0;

  return (
    <StudioSectionCard
      title="Filters & Adjustments"
      icon={<Sliders size={18} color={colorTokens.accent.violetLight} />}
      infoTooltip="Fine-tune lighting, color saturation, blur, sharpen, or apply 1-click creative presets"
      badge={
        filters.preset !== 'none' ? (
          <Chip
            label={presets.find(p => p.id === filters.preset)?.label || filters.preset}
            size="small"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: colorTokens.accent.violetLight,
            }}
          />
        ) : undefined
      }
      showReset={hasAdjustments}
      onReset={onReset}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      {/* Symmetrical 1-Click Filter Presets Grid */}
      <Box mb={2.5}>
        <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600, display: 'block', mb: 1 }}>
          Filter Presets
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
            gap: 0.8,
          }}
        >
          {presets.map(p => {
            const isActive = filters.preset === p.id;
            return (
              <Chip
                key={p.id}
                label={p.label}
                size="small"
                onClick={() => handleSelectPreset(p.id)}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  py: 0.5,
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
        </Box>
      </Box>

      {/* Sliders using generic StudioSliderControl */}
      <Stack spacing={2}>
        <StudioSliderControl
          label="Brightness"
          value={filters.brightness}
          min={-100}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSliderChange('brightness', val)}
        />
        <StudioSliderControl
          label="Contrast"
          value={filters.contrast}
          min={-100}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSliderChange('contrast', val)}
        />
        <StudioSliderControl
          label="Saturation"
          value={filters.saturation}
          min={-100}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSliderChange('saturation', val)}
        />
        <StudioSliderControl
          label="Sharpen"
          value={filters.sharpen}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={val => handleSliderChange('sharpen', val)}
        />
        <StudioSliderControl
          label="Blur"
          value={filters.blur}
          min={0}
          max={50}
          step={1}
          unit="px"
          onChange={val => handleSliderChange('blur', val)}
        />
      </Stack>
    </StudioSectionCard>
  );
};
