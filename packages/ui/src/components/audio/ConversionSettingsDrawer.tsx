import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Slider,
  FormControl,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Settings2, Volume2, Sparkles, Sliders, ChevronDown } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import {
  type AudioConversionOptions,
  type AudioFormat,
  SUPPORTED_AUDIO_FORMATS,
} from '@varia/core';

export interface ConversionSettingsDrawerProps {
  options: AudioConversionOptions;
  onChange: (options: AudioConversionOptions) => void;
  disabled?: boolean;
}

export const ConversionSettingsDrawer: React.FC<ConversionSettingsDrawerProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  const handleFormatChange = (format: AudioFormat) => {
    const recommended = SUPPORTED_AUDIO_FORMATS[format].recommendedBitrates[2] || '192k';
    onChange({
      ...options,
      format,
      bitrate: recommended,
    });
  };

  const handlePreset = (preset: 'hq_mp3' | 'std_mp3' | 'lossless_wav' | 'voice_memo') => {
    switch (preset) {
      case 'hq_mp3':
        onChange({
          ...options,
          format: 'mp3',
          bitrate: '320k',
          bitrateMode: 'cbr',
          sampleRate: 48000,
          channels: 2,
        });
        break;
      case 'std_mp3':
        onChange({
          ...options,
          format: 'mp3',
          bitrate: '192k',
          bitrateMode: 'cbr',
          sampleRate: 44100,
          channels: 2,
        });
        break;
      case 'lossless_wav':
        onChange({
          ...options,
          format: 'wav',
          sampleRate: 48000,
          channels: 2,
        });
        break;
      case 'voice_memo':
        onChange({
          ...options,
          format: 'mp3',
          bitrate: '64k',
          bitrateMode: 'cbr',
          sampleRate: 44100,
          channels: 1,
          volumeBoost: 1.2,
        });
        break;
    }
  };

  const formats: AudioFormat[] = ['mp3', 'wav', 'aac', 'ogg', 'flac'];
  const bitrates = ['64k', '96k', '128k', '192k', '256k', '320k'];
  const sampleRates = [
    { label: 'Auto (Original)', value: 0 },
    { label: '44.1 kHz (CD Quality)', value: 44100 },
    { label: '48.0 kHz (Studio)', value: 48000 },
    { label: '96.0 kHz (High-Res)', value: 96000 },
  ];

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colorTokens.bg.border}`,
        borderRadius: 3.5,
        p: 2.5,
        mb: 3,
        transform: 'translateZ(0)',
      }}
    >
      {/* Title & Presets */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Settings2 size={18} color={colorTokens.accent.violet} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Audio Configuration & Presets
          </Typography>
        </Stack>

        {/* Quick Presets */}
        <Stack direction="row" spacing={0.8} flexWrap="wrap" mt={{ xs: 1, sm: 0 }}>
          <Chip
            icon={<Sparkles size={12} />}
            label="HQ MP3 (320k)"
            size="small"
            onClick={() => handlePreset('hq_mp3')}
            disabled={disabled}
            clickable
            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          />
          <Chip
            label="Standard (192k)"
            size="small"
            onClick={() => handlePreset('std_mp3')}
            disabled={disabled}
            clickable
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip
            label="Lossless WAV"
            size="small"
            onClick={() => handlePreset('lossless_wav')}
            disabled={disabled}
            clickable
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip
            label="Voice Memo"
            size="small"
            onClick={() => handlePreset('voice_memo')}
            disabled={disabled}
            clickable
            sx={{ fontSize: '0.75rem' }}
          />
        </Stack>
      </Stack>

      {/* Target Format Pills */}
      <Box mb={2.5}>
        <Typography
          variant="caption"
          sx={{ color: colorTokens.text.secondary, display: 'block', mb: 1, fontWeight: 600 }}
        >
          TARGET AUDIO FORMAT
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {formats.map(fmt => {
            const isSelected = options.format === fmt;
            return (
              <Chip
                key={fmt}
                label={fmt.toUpperCase()}
                onClick={() => handleFormatChange(fmt)}
                disabled={disabled}
                clickable
                sx={{
                  px: 1.2,
                  py: 2,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  backgroundColor: isSelected
                    ? colorTokens.accent.violet
                    : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : colorTokens.text.secondary,
                  border: `1px solid ${isSelected ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.06)'}`,
                  '&:hover': {
                    backgroundColor: isSelected ? '#7c3aed' : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Bitrate Selection (for lossy formats) */}
      {['mp3', 'aac', 'ogg'].includes(options.format) && (
        <Box mb={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              variant="caption"
              sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
            >
              AUDIO BITRATE ({options.bitrate?.toUpperCase() || '192K'})
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colorTokens.accent.violet, fontWeight: 600 }}
            >
              {options.bitrate === '320k'
                ? 'Audiophile Master'
                : options.bitrate === '192k'
                  ? 'High Quality'
                  : 'Standard'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {bitrates.map(br => {
              const isSelected = (options.bitrate || '192k') === br;
              return (
                <Chip
                  key={br}
                  label={br.toUpperCase()}
                  onClick={() => onChange({ ...options, bitrate: br })}
                  disabled={disabled}
                  clickable
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: isSelected
                      ? 'rgba(139, 92, 246, 0.2)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#a78bfa' : colorTokens.text.muted,
                    border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                    fontWeight: 600,
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Advanced Audio DSP Filters Accordion */}
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary expandIcon={<ChevronDown size={18} color={colorTokens.text.secondary} />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Sliders size={16} color={colorTokens.accent.cyan} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
              Advanced Audio DSP (Volume Boost, Fades, Sample Rate, Channels)
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 1, pb: 2.5 }}>
          {/* Volume Boost Slider */}
          <Box mb={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Volume2 size={14} color={colorTokens.accent.cyan} />
                <Typography
                  variant="caption"
                  sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
                >
                  Volume Boost
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: colorTokens.accent.cyan, fontWeight: 700 }}
              >
                {Math.round((options.volumeBoost ?? 1.0) * 100)}%
                {(options.volumeBoost ?? 1.0) > 1.0 &&
                  ` (+${(((options.volumeBoost ?? 1.0) - 1.0) * 6).toFixed(1)} dB)`}
              </Typography>
            </Stack>
            <Slider
              value={options.volumeBoost ?? 1.0}
              min={0.5}
              max={2.0}
              step={0.05}
              disabled={disabled}
              onChange={(_, val) => onChange({ ...options, volumeBoost: val as number })}
              sx={{ color: colorTokens.accent.cyan, height: 4 }}
            />
          </Box>

          {/* Fade In & Fade Out Sliders */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={2.5}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
                >
                  Fade In Duration
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {options.fadeIn ?? 0}s
                </Typography>
              </Stack>
              <Slider
                value={options.fadeIn ?? 0}
                min={0}
                max={10}
                step={0.5}
                disabled={disabled}
                onChange={(_, val) => onChange({ ...options, fadeIn: val as number })}
                sx={{ color: colorTokens.accent.violet, height: 4 }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography
                  variant="caption"
                  sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}
                >
                  Fade Out Duration
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {options.fadeOut ?? 0}s
                </Typography>
              </Stack>
              <Slider
                value={options.fadeOut ?? 0}
                min={0}
                max={10}
                step={0.5}
                disabled={disabled}
                onChange={(_, val) => onChange({ ...options, fadeOut: val as number })}
                sx={{ color: colorTokens.accent.violet, height: 4 }}
              />
            </Box>
          </Stack>

          {/* Sample Rate & Channels */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: colorTokens.text.secondary,
                  display: 'block',
                  mb: 0.8,
                  fontWeight: 600,
                }}
              >
                Sample Rate
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={options.sampleRate ?? 0}
                  disabled={disabled}
                  onChange={e =>
                    onChange({ ...options, sampleRate: Number(e.target.value) || undefined })
                  }
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2,
                    fontSize: '0.85rem',
                  }}
                >
                  {sampleRates.map(sr => (
                    <MenuItem key={sr.value} value={sr.value} sx={{ fontSize: '0.85rem' }}>
                      {sr.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: colorTokens.text.secondary,
                  display: 'block',
                  mb: 0.8,
                  fontWeight: 600,
                }}
              >
                Audio Channels
              </Typography>
              <ToggleButtonGroup
                value={options.channels ?? 2}
                exclusive
                disabled={disabled}
                onChange={(_, val) => val && onChange({ ...options, channels: val })}
                size="small"
                fullWidth
              >
                <ToggleButton value={2} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Stereo (2.0)
                </ToggleButton>
                <ToggleButton value={1} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Mono (1.0)
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
