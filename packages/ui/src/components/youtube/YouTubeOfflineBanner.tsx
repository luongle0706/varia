import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { Terminal, ShieldAlert, Copy, Check } from 'lucide-react';
import { GlassCard } from '../GlassCard';

export const YouTubeOfflineBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const command = 'pnpm dev';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard
      sx={{
        p: { xs: 2.5, md: 3.5 },
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background:
          'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(18, 18, 23, 0.8) 100%)',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
        <ShieldAlert size={22} color="#f59e0b" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.1rem' }}>
          Local Companion Engine Required
        </Typography>
        <Chip
          label="Self-Hosted / Local Only"
          size="small"
          sx={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fcd34d',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontWeight: 700,
            fontSize: '0.7rem',
          }}
        />
      </Stack>

      <Typography variant="body2" sx={{ color: '#d4d4d8', lineHeight: 1.6, mb: 2.5 }}>
        To extract high-resolution video streams (1080p / 4K) and bypass browser CORS limitations
        without public server costs, the YouTube Downloader runs through your local Varia companion
        engine.
      </Typography>

      <Box
        sx={{
          backgroundColor: '#0a0a0c',
          borderRadius: 2.5,
          p: 2,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Terminal size={18} color="#a1a1aa" />
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: '#34d399',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {command}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={handleCopy}
          startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
          sx={{
            borderRadius: 2,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            color: copied ? '#34d399' : '#e4e4e7',
          }}
        >
          {copied ? 'Copied' : 'Copy Command'}
        </Button>
      </Box>
    </GlassCard>
  );
};
