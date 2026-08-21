import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { type YouTubeVideoInfo } from '@varia/core';
import { User, Eye } from 'lucide-react';
import { GlassCard } from '../GlassCard';

export interface YouTubeMediaCardProps {
  info: YouTubeVideoInfo;
}

export const YouTubeMediaCard: React.FC<YouTubeMediaCardProps> = ({ info }) => {
  return (
    <GlassCard
      sx={{
        p: { xs: 2, md: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2.5,
        alignItems: 'center',
      }}
    >
      {/* Thumbnail Container with Duration Overlay */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 240 },
          height: { xs: 180, sm: 135 },
          flexShrink: 0,
          borderRadius: 2.5,
          overflow: 'hidden',
          backgroundColor: '#0a0a0c',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={info.thumbnail}
          alt={info.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            px: 1,
            py: 0.3,
            borderRadius: 1.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {info.durationFormatted}
        </Box>
      </Box>

      {/* Video Details */}
      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', md: '1.15rem' },
            color: '#f4f4f5',
            lineHeight: 1.35,
            mb: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={info.title}
        >
          {info.title}
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          sx={{ color: '#a1a1aa' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <User size={14} color="#ef4444" />
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#e4e4e7', fontSize: '0.85rem' }}
            >
              {info.author}
            </Typography>
          </Box>

          {typeof info.viewCount === 'number' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Eye size={14} color="#71717a" />
              <Typography variant="caption" sx={{ color: '#a1a1aa' }}>
                {info.viewCount.toLocaleString()} views
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </GlassCard>
  );
};
