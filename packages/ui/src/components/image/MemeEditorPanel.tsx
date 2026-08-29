import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  ButtonGroup,
  Slider,
  Switch,
  FormControlLabel,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import type { MemeTextConfig, MemeStyle, TextAlignment } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface MemeEditorPanelProps {
  meme: MemeTextConfig;
  onChange: (newMeme: MemeTextConfig) => void;
  onReset: () => void;
}

export const MemeEditorPanel: React.FC<MemeEditorPanelProps> = ({
  meme,
  onChange,
  onReset,
}) => {
  const fontSizes = [24, 36, 48, 64, 72];

  const handleStyleChange = (style: MemeStyle) => {
    onChange({ ...meme, style });
  };

  const handleAlignChange = (align: TextAlignment) => {
    onChange({ ...meme, align });
  };

  const handleFontSizeSlider = (_: Event, val: number | number[]) => {
    onChange({ ...meme, fontSize: Number(val) });
  };

  const handleFontSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange({ ...meme, fontSize: Math.max(12, Math.min(140, val)) });
    }
  };

  const hasMemeContent =
    meme.topText.trim() !== '' ||
    meme.bottomText.trim() !== '' ||
    meme.bannerText.trim() !== '';

  return (
    <GlassCard sx={{ p: 2.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Type size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Meme & Caption Generator
          </Typography>
          <Tooltip title="Create classic Impact outline memes or modern Twitter/Reddit caption banner boxes" arrow>
            <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
          </Tooltip>
        </Stack>

        {hasMemeContent && (
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
            Clear Text
          </Button>
        )}
      </Stack>

      {/* Style Switcher (Classic Meme vs Caption Banner) */}
      <Stack direction="row" spacing={1} mb={2.5}>
        <Button
          variant={meme.style === 'classic' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStyleChange('classic')}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            backgroundColor: meme.style === 'classic' ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
            borderColor: meme.style === 'classic' ? colorTokens.accent.violet : colorTokens.bg.border,
            color: meme.style === 'classic' ? '#ffffff' : colorTokens.text.primary,
            '&:hover': {
              borderColor: colorTokens.accent.violet,
              backgroundColor: meme.style === 'classic' ? colorTokens.accent.violetLight : 'rgba(139, 92, 246, 0.1)',
            },
          }}
        >
          Classic Impact
        </Button>

        <Button
          variant={meme.style === 'caption-banner' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStyleChange('caption-banner')}
          sx={{
            flex: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            backgroundColor: meme.style === 'caption-banner' ? colorTokens.accent.violet : 'rgba(255, 255, 255, 0.03)',
            borderColor: meme.style === 'caption-banner' ? colorTokens.accent.violet : colorTokens.bg.border,
            color: meme.style === 'caption-banner' ? '#ffffff' : colorTokens.text.primary,
            '&:hover': {
              borderColor: colorTokens.accent.violet,
              backgroundColor: meme.style === 'caption-banner' ? colorTokens.accent.violetLight : 'rgba(139, 92, 246, 0.1)',
            },
          }}
        >
          Caption Banner
        </Button>
      </Stack>

      {/* Text Inputs */}
      {meme.style === 'classic' ? (
        <Stack spacing={1.5} mb={2.5}>
          <TextField
            label="Top Text"
            placeholder="WHEN YOU DEPLOY ON FRIDAY..."
            size="small"
            fullWidth
            value={meme.topText}
            onChange={e => onChange({ ...meme, topText: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              },
            }}
          />

          <TextField
            label="Bottom Text"
            placeholder="AND EVERYTHING PASSES"
            size="small"
            fullWidth
            value={meme.bottomText}
            onChange={e => onChange({ ...meme, bottomText: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              },
            }}
          />
        </Stack>
      ) : (
        <Box mb={2.5}>
          <TextField
            label="Banner Caption"
            placeholder="Nobody:\nLiterally nobody:"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={meme.bannerText}
            onChange={e => onChange({ ...meme, bannerText: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              },
            }}
          />
        </Box>
      )}

      {/* Alignment & Uppercase Controls */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600, mr: 1 }}>
            Align:
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={meme.align === 'left' ? 'contained' : 'outlined'}
              onClick={() => handleAlignChange('left')}
              sx={{
                p: 0.5,
                minWidth: 32,
                backgroundColor: meme.align === 'left' ? colorTokens.accent.violet : undefined,
              }}
            >
              <AlignLeft size={14} />
            </Button>
            <Button
              variant={meme.align === 'center' ? 'contained' : 'outlined'}
              onClick={() => handleAlignChange('center')}
              sx={{
                p: 0.5,
                minWidth: 32,
                backgroundColor: meme.align === 'center' ? colorTokens.accent.violet : undefined,
              }}
            >
              <AlignCenter size={14} />
            </Button>
            <Button
              variant={meme.align === 'right' ? 'contained' : 'outlined'}
              onClick={() => handleAlignChange('right')}
              sx={{
                p: 0.5,
                minWidth: 32,
                backgroundColor: meme.align === 'right' ? colorTokens.accent.violet : undefined,
              }}
            >
              <AlignRight size={14} />
            </Button>
          </ButtonGroup>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={meme.uppercase}
              onChange={e => onChange({ ...meme, uppercase: e.target.checked })}
              color="primary"
            />
          }
          label={<Typography variant="caption" sx={{ fontWeight: 600 }}>ALL CAPS</Typography>}
        />
      </Stack>

      {/* Font Size (Slider + Number Input + Preset Pills) */}
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
            Font Size
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              type="number"
              value={meme.fontSize}
              onChange={handleFontSizeInput}
              inputProps={{ min: 12, max: 140, step: 2 }}
              sx={{
                width: 65,
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
              px
            </Typography>
          </Stack>
        </Stack>

        <Slider
          value={meme.fontSize}
          min={14}
          max={120}
          step={2}
          onChange={handleFontSizeSlider}
          sx={{
            color: colorTokens.accent.violet,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              backgroundColor: '#ffffff',
            },
          }}
        />

        {/* Preset Pills */}
        <Stack direction="row" spacing={0.8} mt={0.5}>
          {fontSizes.map(size => (
            <Chip
              key={size}
              label={`${size}px`}
              size="small"
              onClick={() => onChange({ ...meme, fontSize: size })}
              sx={{
                fontSize: '0.7rem',
                cursor: 'pointer',
                backgroundColor:
                  meme.fontSize === size ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: meme.fontSize === size ? colorTokens.accent.violet : 'transparent',
                borderWidth: 1,
                borderStyle: 'solid',
                color: meme.fontSize === size ? colorTokens.accent.violetLight : colorTokens.text.muted,
              }}
            />
          ))}
        </Stack>
      </Box>
    </GlassCard>
  );
};
