import React, { useState } from 'react';
import { Box, Typography, Stack, Button, Chip, CircularProgress } from '@mui/material';
import { Download, Copy, Check, RotateCcw, Sparkles, HardDrive } from 'lucide-react';
import { formatBytes, type TranscodeResult } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface GifPreviewCardProps {
  result: TranscodeResult;
  gifUrl: string;
  onReset?: () => void;
}

export const GifPreviewCard: React.FC<GifPreviewCardProps> = ({ result, gifUrl, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = result.outputName || 'animated.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    try {
      setCopying(true);
      const res = await fetch(gifUrl);
      const blob = await res.blob();

      // Check if ClipboardItem supports image/gif, else render to canvas as PNG for clipboard
      if (typeof ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch {
          // Fallback: draw first frame to canvas and write as image/png
          const img = new Image();
          img.src = gifUrl;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async pngBlob => {
              if (pngBlob) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not copy image to clipboard:', err);
    } finally {
      setCopying(false);
    }
  };

  const sizeRatio =
    result.originalSize > 0
      ? Math.round(((result.originalSize - result.outputSize) / result.originalSize) * 100)
      : 0;

  return (
    <GlassCard
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        border: '1px solid rgba(236, 72, 153, 0.3)',
        background:
          'linear-gradient(180deg, rgba(236, 72, 153, 0.06) 0%, rgba(18, 18, 23, 0.8) 100%)',
      }}
    >
      {/* Header Row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        mb={3}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: 'rgba(236, 72, 153, 0.2)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#ec4899',
            }}
          >
            <Sparkles size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              GIF Successfully Created
            </Typography>
            <Typography variant="caption" sx={{ color: colorTokens.text.secondary }}>
              {result.outputName}
            </Typography>
          </Box>
        </Stack>

        {onReset && (
          <Button
            size="small"
            startIcon={<RotateCcw size={14} />}
            onClick={onReset}
            sx={{
              color: colorTokens.text.secondary,
              fontSize: '0.8rem',
              '&:hover': { color: '#ec4899' },
            }}
          >
            Convert Another
          </Button>
        )}
      </Stack>

      {/* GIF Viewport */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src={gifUrl}
            alt="Generated GIF"
            style={{
              maxWidth: '100%',
              maxHeight: 460,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      </Box>

      {/* Metrics Row */}
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          borderRadius: 2.5,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1} alignItems="center">
            <HardDrive size={16} color="#a1a1aa" />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffffff' }}>
              {formatBytes(result.outputSize)}
            </Typography>
            {result.originalSize > 0 && (
              <Chip
                label={sizeRatio >= 0 ? `−${sizeRatio}% vs video` : `+${Math.abs(sizeRatio)}%`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            onClick={handleCopy}
            disabled={copying}
            startIcon={
              copying ? (
                <CircularProgress size={14} sx={{ color: '#ffffff' }} />
              ) : copied ? (
                <Check size={16} color="#4ade80" />
              ) : (
                <Copy size={16} />
              )
            }
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: '0.85rem',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: copied ? '#4ade80' : '#ffffff',
              '&:hover': {
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              },
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<Download size={18} />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.5,
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: '#ffffff !important',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
              },
            }}
          >
            Download GIF
          </Button>
        </Stack>
      </Stack>
    </GlassCard>
  );
};
