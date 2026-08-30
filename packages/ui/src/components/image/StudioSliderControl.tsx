import React from 'react';
import { Box, Typography, Stack, Slider, TextField, Tooltip } from '@mui/material';
import { Info } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';

export interface StudioSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  displayValueFormatter?: (val: number) => string;
  onChange: (val: number) => void;
  tooltip?: string;
  icon?: React.ReactNode;
  defaultValue?: number;
  inputWidth?: number;
}

export const StudioSliderControl: React.FC<StudioSliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  displayValueFormatter,
  onChange,
  tooltip,
  icon,
  defaultValue,
  inputWidth = 72,
}) => {
  const displayVal = displayValueFormatter
    ? displayValueFormatter(value)
    : `${value > 0 && min < 0 ? '+' : ''}${value}${unit}`;

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    } else if (e.target.value === '' && defaultValue !== undefined) {
      onChange(defaultValue);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Stack direction="row" spacing={0.8} alignItems="center">
          {icon}
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow>
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Info size={12} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
              </Box>
            </Tooltip>
          )}
        </Stack>

        <Typography variant="caption" sx={{ color: colorTokens.accent.violetLight, fontWeight: 700, fontSize: '0.75rem' }}>
          {displayVal}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleSliderChange}
          sx={{
            flex: 1,
            color: colorTokens.accent.violet,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: '#ffffff',
            },
          }}
        />

        <TextField
          size="small"
          type="number"
          value={value}
          onChange={handleInputChange}
          inputProps={{ min, max, step }}
          sx={{
            width: inputWidth,
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
              py: 0.5,
              px: 0.8,
              textAlign: 'center',
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
          }}
        />
      </Stack>
    </Box>
  );
};
