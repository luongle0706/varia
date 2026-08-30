import React from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import type { MemeTextConfig, MemeStyle, TextAlignment } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { StudioSectionCard } from './StudioSectionCard';
import { StudioSliderControl } from './StudioSliderControl';

export interface MemeEditorPanelProps {
  meme: MemeTextConfig;
  onChange: (newMeme: MemeTextConfig) => void;
  onReset: () => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const MemeEditorPanel: React.FC<MemeEditorPanelProps> = ({
  meme,
  onChange,
  onReset,
  collapsible = true,
  defaultExpanded = false,
}) => {
  const fontOptions = [
    { value: 'Impact', label: 'Impact (Classic Meme)' },
    { value: 'Inter', label: 'Inter (Modern Sans)' },
    { value: 'Montserrat', label: 'Montserrat (Bold Clean)' },
    { value: 'Roboto', label: 'Roboto (Standard Sans)' },
    { value: 'Bebas Neue', label: 'Bebas Neue (Tall Headline)' },
    { value: 'Comic Sans MS', label: 'Comic Sans (Playful)' },
    { value: 'Playfair Display', label: 'Playfair (Classic Serif)' },
    { value: 'Courier New', label: 'Courier (Monospace Retro)' },
    { value: 'Arial', label: 'Arial (Neutral)' },
  ];

  const handleStyleChange = (style: MemeStyle) => {
    onChange({ ...meme, style });
  };

  const handleAlignChange = (align: TextAlignment) => {
    onChange({ ...meme, align });
  };

  const hasMemeContent =
    meme.topText.trim() !== '' ||
    meme.bottomText.trim() !== '' ||
    meme.bannerText.trim() !== '';

  return (
    <StudioSectionCard
      title="Meme & Caption Generator"
      icon={<Type size={18} color={colorTokens.accent.violetLight} />}
      infoTooltip="Create classic Impact outline memes or modern Twitter/Reddit caption banner boxes"
      badge={
        hasMemeContent ? (
          <Chip
            label="Active Text"
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
      showReset={hasMemeContent}
      resetLabel="Clear"
      onReset={onReset}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
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
        <Stack spacing={1.5} mb={2}>
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
        <Box mb={2}>
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

      {/* Font Family Dropdown */}
      <Box mb={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" sx={{ color: colorTokens.text.secondary, fontWeight: 600 }}>
            Font Style
          </Typography>
          <FormControl size="small">
            <Select
              value={meme.fontFamily || 'Impact'}
              onChange={e => onChange({ ...meme, fontFamily: e.target.value })}
              MenuProps={{ disableScrollLock: true }}
              sx={{
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 600,
                width: 170,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 2,
                '& .MuiSelect-select': { py: 0.5, px: 1.2 },
              }}
            >
              {fontOptions.map(font => (
                <MenuItem key={font.value} value={font.value} sx={{ fontSize: '0.8rem', fontFamily: font.value }}>
                  {font.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

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

      {/* Font Size Slider using generic StudioSliderControl */}
      <StudioSliderControl
        label="Font Size"
        value={meme.fontSize}
        min={12}
        max={140}
        step={2}
        unit="px"
        onChange={val => onChange({ ...meme, fontSize: val })}
      />
    </StudioSectionCard>
  );
};
