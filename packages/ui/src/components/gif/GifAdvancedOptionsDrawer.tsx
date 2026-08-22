import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Maximize2, RotateCw, Palette, Repeat, Sparkles } from 'lucide-react';
import type { GifConversionOptions, GifScalePreset, GifDitherMode } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export type AspectRatioPreset = 'full' | '1:1' | '16:9' | '9:16' | '4:3' | 'custom';

export interface GifAdvancedOptionsDrawerProps {
  options: GifConversionOptions;
  onChange: (newOptions: Partial<GifConversionOptions>) => void;
  videoWidth?: number;
  videoHeight?: number;
  clipDuration?: number;
}

export const GifAdvancedOptionsDrawer: React.FC<GifAdvancedOptionsDrawerProps> = ({
  options,
  onChange,
  videoWidth = 640,
  videoHeight = 360,
  clipDuration = 5,
}) => {
  const [tabIndex, setTabIndex] = useState<0 | 1 | 2 | 3>(0);
  const [activeRatioPreset, setActiveRatioPreset] = useState<AspectRatioPreset>(
    options.crop ? 'custom' : 'full',
  );

  const speedPresets = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];
  const scalePresets: GifScalePreset[] = ['original', '480p', '360p', '240p', '160p'];

  const getPresetResolutionLabel = (preset: GifScalePreset): string => {
    if (preset === 'original') {
      return videoWidth && videoHeight ? `Original (${videoWidth}×${videoHeight})` : 'Original';
    }
    return preset;
  };

  const handleAspectRatioPreset = (ratio: AspectRatioPreset) => {
    setActiveRatioPreset(ratio);

    if (ratio === 'full') {
      onChange({ crop: undefined });
      return;
    }

    if (ratio === 'custom') {
      if (!options.crop) {
        onChange({
          crop: { x: 0, y: 0, width: videoWidth, height: videoHeight },
        });
      }
      return;
    }

    let targetW = videoWidth;
    let targetH = videoHeight;

    if (ratio === '1:1') {
      const side = Math.min(videoWidth, videoHeight);
      targetW = side;
      targetH = side;
    } else if (ratio === '16:9') {
      if (videoWidth / videoHeight > 16 / 9) {
        targetW = Math.round((videoHeight * 16) / 9);
        targetH = videoHeight;
      } else {
        targetW = videoWidth;
        targetH = Math.round((videoWidth * 9) / 16);
      }
    } else if (ratio === '9:16') {
      if (videoWidth / videoHeight > 9 / 16) {
        targetW = Math.round((videoHeight * 9) / 16);
        targetH = videoHeight;
      } else {
        targetW = videoWidth;
        targetH = Math.round((videoWidth * 16) / 9);
      }
    } else if (ratio === '4:3') {
      if (videoWidth / videoHeight > 4 / 3) {
        targetW = Math.round((videoHeight * 4) / 3);
        targetH = videoHeight;
      } else {
        targetW = videoWidth;
        targetH = Math.round((videoWidth * 3) / 4);
      }
    }

    // Clamp
    targetW = Math.min(videoWidth, Math.max(10, targetW));
    targetH = Math.min(videoHeight, Math.max(10, targetH));

    const x = Math.max(0, Math.floor((videoWidth - targetW) / 2));
    const y = Math.max(0, Math.floor((videoHeight - targetH) / 2));

    onChange({
      crop: { x, y, width: targetW, height: targetH },
    });
  };

  const handleWidthChange = (newWidthVal: number) => {
    const w = Math.min(videoWidth, Math.max(10, newWidthVal));
    let h = options.crop?.height || videoHeight;

    if (activeRatioPreset === '1:1') {
      h = w;
    } else if (activeRatioPreset === '16:9') {
      h = Math.round((w * 9) / 16);
    } else if (activeRatioPreset === '9:16') {
      h = Math.round((w * 16) / 9);
    } else if (activeRatioPreset === '4:3') {
      h = Math.round((w * 3) / 4);
    }

    h = Math.min(videoHeight, Math.max(10, h));
    const x = Math.max(0, Math.min(options.crop?.x || 0, videoWidth - w));
    const y = Math.max(0, Math.min(options.crop?.y || 0, videoHeight - h));

    onChange({
      crop: { x, y, width: w, height: h },
    });
  };

  const handleHeightChange = (newHeightVal: number) => {
    const h = Math.min(videoHeight, Math.max(10, newHeightVal));
    let w = options.crop?.width || videoWidth;

    if (activeRatioPreset === '1:1') {
      w = h;
    } else if (activeRatioPreset === '16:9') {
      w = Math.round((h * 16) / 9);
    } else if (activeRatioPreset === '9:16') {
      w = Math.round((h * 9) / 16);
    } else if (activeRatioPreset === '4:3') {
      w = Math.round((h * 4) / 3);
    }

    w = Math.min(videoWidth, Math.max(10, w));
    const x = Math.max(0, Math.min(options.crop?.x || 0, videoWidth - w));
    const y = Math.max(0, Math.min(options.crop?.y || 0, videoHeight - h));

    onChange({
      crop: { x, y, width: w, height: h },
    });
  };

  const loopCount = options.loopCount ?? 0;
  const effectiveLoopDuration = loopCount > 0 ? (clipDuration * loopCount).toFixed(2) : null;

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      {/* Tab Navigation */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: colorTokens.text.secondary,
            minHeight: 44,
            '&.Mui-selected': {
              color: '#ec4899',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#ec4899',
            height: 2.5,
          },
        }}
      >
        <Tab icon={<Maximize2 size={16} />} iconPosition="start" label="Dimensions & Crop" />
        <Tab icon={<RotateCw size={16} />} iconPosition="start" label="Rotation, Flip & Speed" />
        <Tab icon={<Palette size={16} />} iconPosition="start" label="Color & Dithering" />
        <Tab icon={<Repeat size={16} />} iconPosition="start" label="Loop & Animation" />
      </Tabs>

      {/* Tab 0: Dimensions & Crop */}
      {tabIndex === 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Resolution Scaling
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
            {scalePresets.map(preset => {
              const isSelected = (options.scalePreset || 'original') === preset;
              return (
                <Button
                  key={preset}
                  size="small"
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() =>
                    onChange({
                      scalePreset: preset,
                      customWidth: undefined,
                      customHeight: undefined,
                    })
                  }
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    ...(isSelected
                      ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                      : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
                  }}
                >
                  {getPresetResolutionLabel(preset)}
                </Button>
              );
            })}
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Aspect Ratio & Crop Presets
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
            <Button
              size="small"
              variant={activeRatioPreset === 'full' && !options.crop ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('full')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === 'full' && !options.crop
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Full Frame
            </Button>
            <Button
              size="small"
              variant={activeRatioPreset === '1:1' ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('1:1')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === '1:1'
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              1:1 Square
            </Button>
            <Button
              size="small"
              variant={activeRatioPreset === '16:9' ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('16:9')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === '16:9'
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              16:9 Landscape
            </Button>
            <Button
              size="small"
              variant={activeRatioPreset === '9:16' ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('9:16')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === '9:16'
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              9:16 Story / Reel
            </Button>
            <Button
              size="small"
              variant={activeRatioPreset === '4:3' ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('4:3')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === '4:3'
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              4:3 Standard
            </Button>
            <Button
              size="small"
              variant={activeRatioPreset === 'custom' ? 'contained' : 'outlined'}
              onClick={() => handleAspectRatioPreset('custom')}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                ...(activeRatioPreset === 'custom'
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Custom (Freeform)
            </Button>
          </Stack>

          {options.crop && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#ec4899', fontWeight: 700, display: 'block', mb: 1.5 }}
              >
                Active Crop Box ({Math.round(options.crop.width)} ×{' '}
                {Math.round(options.crop.height)})
                {activeRatioPreset !== 'custom' && activeRatioPreset !== 'full' && (
                  <span style={{ color: '#a1a1aa', fontWeight: 500, marginLeft: 8 }}>
                    (Locked to {activeRatioPreset} ratio — editing width or height auto-scales the
                    other)
                  </span>
                )}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
                mb={1.5}
              >
                <TextField
                  size="small"
                  label="Width (px)"
                  type="number"
                  value={Math.round(options.crop.width)}
                  onChange={e => handleWidthChange(parseInt(e.target.value, 10) || 10)}
                  sx={{ width: 120 }}
                />
                <TextField
                  size="small"
                  label="Height (px)"
                  type="number"
                  value={Math.round(options.crop.height)}
                  onChange={e => handleHeightChange(parseInt(e.target.value, 10) || 10)}
                  sx={{ width: 120 }}
                />
                <TextField
                  size="small"
                  label="X Pos (px)"
                  type="number"
                  value={Math.round(options.crop.x)}
                  onChange={e => {
                    const x = Math.max(
                      0,
                      Math.min(videoWidth - options.crop!.width, parseInt(e.target.value, 10) || 0),
                    );
                    onChange({ crop: { ...options.crop!, x } });
                  }}
                  sx={{ width: 110 }}
                />
                <TextField
                  size="small"
                  label="Y Pos (px)"
                  type="number"
                  value={Math.round(options.crop.y)}
                  onChange={e => {
                    const y = Math.max(
                      0,
                      Math.min(
                        videoHeight - options.crop!.height,
                        parseInt(e.target.value, 10) || 0,
                      ),
                    );
                    onChange({ crop: { ...options.crop!, y } });
                  }}
                  sx={{ width: 110 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const x = Math.max(0, Math.floor((videoWidth - options.crop!.width) / 2));
                    const y = Math.max(0, Math.floor((videoHeight - options.crop!.height) / 2));
                    onChange({ crop: { ...options.crop!, x, y } });
                  }}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#d4d4d8',
                  }}
                >
                  Center Box
                </Button>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: colorTokens.text.muted, display: 'block' }}
              >
                💡 Tip: You can also <b>click & drag the pink crop box</b> directly on the video
                player above to reposition it!
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Tab 1: Rotation, Flip & Speed */}
      {tabIndex === 1 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Playback Speed: <b style={{ color: '#ec4899' }}>{(options.speed || 1.0).toFixed(2)}x</b>
          </Typography>

          {/* Quick Speed Pills */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
            {speedPresets.map(spd => {
              const isSelected = Math.abs((options.speed || 1.0) - spd) < 0.01;
              return (
                <Button
                  key={spd}
                  size="small"
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => onChange({ speed: spd })}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    ...(isSelected
                      ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                      : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
                  }}
                >
                  {spd}x
                </Button>
              );
            })}
          </Stack>

          {/* Continuous Speed Slider */}
          <Box sx={{ maxWidth: 450, mb: 3 }}>
            <Slider
              value={options.speed || 1.0}
              onChange={(_, val) => onChange({ speed: val as number })}
              min={0.1}
              max={4.0}
              step={0.05}
              valueLabelDisplay="auto"
              valueLabelFormat={v => `${v.toFixed(2)}x`}
              sx={{ color: '#ec4899' }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Orientation & Flip
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mb={3}>
            <Button
              size="small"
              variant={(options.rotate || 0) === 0 ? 'contained' : 'outlined'}
              onClick={() => onChange({ rotate: 0 })}
              sx={{ borderRadius: 2, fontSize: '0.8rem' }}
            >
              0°
            </Button>
            <Button
              size="small"
              variant={options.rotate === 90 ? 'contained' : 'outlined'}
              onClick={() => onChange({ rotate: 90 })}
              startIcon={<RotateCw size={14} />}
              sx={{ borderRadius: 2, fontSize: '0.8rem' }}
            >
              90° CW
            </Button>
            <Button
              size="small"
              variant={options.rotate === 180 ? 'contained' : 'outlined'}
              onClick={() => onChange({ rotate: 180 })}
              sx={{ borderRadius: 2, fontSize: '0.8rem' }}
            >
              180°
            </Button>
            <Button
              size="small"
              variant={options.rotate === 270 ? 'contained' : 'outlined'}
              onClick={() => onChange({ rotate: 270 })}
              sx={{ borderRadius: 2, fontSize: '0.8rem' }}
            >
              270° CCW
            </Button>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(options.reverse)}
                  onChange={e => onChange({ reverse: e.target.checked })}
                  color="secondary"
                />
              }
              label="Play Video in Reverse"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(options.flipHorizontal)}
                  onChange={e => onChange({ flipHorizontal: e.target.checked })}
                  color="secondary"
                />
              }
              label="Flip Horizontal"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(options.flipVertical)}
                  onChange={e => onChange({ flipVertical: e.target.checked })}
                  color="secondary"
                />
              }
              label="Flip Vertical"
            />
          </Stack>
        </Box>
      )}

      {/* Tab 2: Color & Dithering */}
      {tabIndex === 2 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Color Quantization (Palette Limit:{' '}
            <b style={{ color: '#ec4899' }}>{options.maxColors || 128} Colors</b>)
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colorTokens.text.secondary, mb: 1.5, display: 'block' }}
          >
            Video has 16.7 million colors, but GIF only supports 256. Reducing max colors to 128 or
            64 significantly shrinks file size.
          </Typography>
          <Box sx={{ maxWidth: 450, mb: 3 }}>
            <Slider
              value={options.maxColors || 128}
              onChange={(_, val) => onChange({ maxColors: val as number })}
              min={32}
              max={256}
              step={16}
              valueLabelDisplay="auto"
              sx={{ color: '#ec4899' }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                32 Colors (Smallest Size)
              </Typography>
              <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                128 Colors (Balanced)
              </Typography>
              <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                256 Colors (Max Quality)
              </Typography>
            </Stack>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Dithering Algorithm
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colorTokens.text.secondary, mb: 1.5, display: 'block' }}
          >
            Dithering blends adjacent pixel patterns to eliminate color banding and produce smooth
            gradients.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mb={3}>
            {(
              [
                {
                  id: 'bayer',
                  label: 'Bayer (Recommended - Fast & Sharp)',
                  desc: 'Clean ordered pattern, compresses efficiently.',
                },
                {
                  id: 'floyd_steinberg',
                  label: 'Floyd-Steinberg (Smooth gradients)',
                  desc: 'Error diffusion for smooth photorealism.',
                },
                {
                  id: 'sierra2_4a',
                  label: 'Sierra (Clean web animation)',
                  desc: 'Balanced matrix dither for illustrations.',
                },
                {
                  id: 'none',
                  label: 'None (Solid posterization)',
                  desc: 'No pixel blending, smallest possible file size.',
                },
              ] as const
            ).map(d => {
              const isSelected = (options.dither || 'bayer') === d.id;
              return (
                <Button
                  key={d.id}
                  size="small"
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => onChange({ dither: d.id as GifDitherMode })}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    ...(isSelected
                      ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                      : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
                  }}
                >
                  {d.label}
                </Button>
              );
            })}
          </Stack>

          {/* Educational File Size Tip Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#ec4899', fontWeight: 700, display: 'block', mb: 0.5 }}
            >
              💡 Why is the converted GIF larger than the source video?
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#a1a1aa', lineHeight: 1.6, display: 'block' }}
            >
              MP4 videos use modern inter-frame compression (only saving motion deltas). In
              contrast, the 1987 GIF format saves{' '}
              <b>every single frame as an individual uncompressed 256-color image</b>.
              <br />
              <b>Tips to reduce GIF size:</b> Trim to shorter clips (&lt;6s), lower FPS to 10–15,
              scale to 360p or 240p, or reduce Max Colors to 128.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tab 3: Loop & Animation */}
      {tabIndex === 3 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            GIF Loop Count
          </Typography>

          {/* Quick Presets */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2.5}>
            <Button
              size="small"
              variant={loopCount === 0 ? 'contained' : 'outlined'}
              onClick={() => onChange({ loopCount: 0 })}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                ...(loopCount === 0
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Infinite Loop (0)
            </Button>
            <Button
              size="small"
              variant={loopCount === 1 ? 'contained' : 'outlined'}
              onClick={() => onChange({ loopCount: 1 })}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                ...(loopCount === 1
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Play Once (1)
            </Button>
            <Button
              size="small"
              variant={loopCount === 2 ? 'contained' : 'outlined'}
              onClick={() => onChange({ loopCount: 2 })}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                ...(loopCount === 2
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Loop 2x (2)
            </Button>
            <Button
              size="small"
              variant={loopCount === 3 ? 'contained' : 'outlined'}
              onClick={() => onChange({ loopCount: 3 })}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                ...(loopCount === 3
                  ? { backgroundColor: '#ec4899', '&:hover': { backgroundColor: '#db2777' } }
                  : { borderColor: 'rgba(255, 255, 255, 0.1)', color: '#d4d4d8' }),
              }}
            >
              Loop 3x (3)
            </Button>
          </Stack>

          {/* Manual Numeric Input */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
            <TextField
              size="small"
              label="Custom Loop Count"
              type="number"
              value={loopCount}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                onChange({ loopCount: isNaN(val) ? 0 : Math.max(0, val) });
              }}
              helperText="0 = Infinite, 1 = Play Once, N = Repeat N times"
              sx={{ width: 220 }}
            />
          </Stack>

          {/* Dynamic Calculated Duration Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              backgroundColor: 'rgba(236, 72, 153, 0.08)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Sparkles size={18} color="#ec4899" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {loopCount === 0
                  ? `Continuous Infinite Replay (Base clip duration: ${clipDuration.toFixed(2)}s)`
                  : `Total Animation Playtime: ${effectiveLoopDuration}s (${loopCount} ${loopCount === 1 ? 'play' : 'loops'} × ${clipDuration.toFixed(2)}s)`}
              </Typography>
              <Typography variant="caption" sx={{ color: colorTokens.text.secondary }}>
                Base clip: {clipDuration.toFixed(2)}s.{' '}
                {loopCount === 0
                  ? 'GIF repeats forever in all viewers.'
                  : `GIF stops after ${loopCount} cycles.`}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </GlassCard>
  );
};
