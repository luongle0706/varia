import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { colorTokens } from '../theme/tokens';
import type { VariaToolManifest } from '@varia/core';
import { TOOL_CATEGORIES } from '@varia/core';
import {
  Wand2,
  FileAudio,
  Film,
  Code2,
  Activity,
  Download,
  FileText,
  Key,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  audio: <FileAudio size={22} color={colorTokens.accent.violet} />,
  gif: <Film size={22} color="#ec4899" />,
  uuid: <Key size={22} color={colorTokens.accent.violet} />,
  hash: <ShieldCheck size={22} color={colorTokens.accent.cyan} />,
  speed: <Activity size={22} color={colorTokens.accent.cyan} />,
  social: <Download size={22} color={colorTokens.accent.amber} />,
  code: <Code2 size={22} color={colorTokens.accent.violet} />,
  text: <FileText size={22} color={colorTokens.accent.emerald} />,
  default: <Wand2 size={22} color={colorTokens.accent.violet} />,
};

export interface ToolCardProps {
  tool: VariaToolManifest;
  onClick?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const categoryMeta = TOOL_CATEGORIES[tool.category];
  const icon = ICON_MAP[tool.icon] || ICON_MAP.default;

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: colorTokens.bg.surface,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${colorTokens.bg.border}`,
        borderRadius: 3,
        p: 2.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 180,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: colorTokens.bg.borderHover,
          boxShadow: `0 8px 30px rgba(139, 92, 246, 0.15)`,
          transform: 'translateY(-3px)',
          '& .tool-card-icon': {
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      {/* Background Subtle Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: categoryMeta?.badgeColor || colorTokens.accent.violet,
          opacity: 0.08,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <Box>
        {/* Top Header Row */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box
            className="tool-card-icon"
            sx={{
              p: 1.2,
              borderRadius: 2.5,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.25s ease',
            }}
          >
            {icon}
          </Box>

          <Stack direction="row" spacing={0.8} alignItems="center">
            {tool.isOfflineReady && (
              <Chip
                label="Offline"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              />
            )}
            {tool.wasmRequired && (
              <Chip
                icon={<Cpu size={11} style={{ marginLeft: 4 }} />}
                label="WASM"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(236, 72, 153, 0.12)',
                  color: '#ec4899',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 0.5 }}>
          {tool.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: colorTokens.text.secondary,
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tool.description}
        </Typography>
      </Box>

      {/* Footer Tags */}
      <Stack direction="row" spacing={0.6} mt={2} flexWrap="wrap" useFlexGap>
        {tool.tags.slice(0, 3).map(tag => (
          <Typography
            key={tag}
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              color: colorTokens.text.muted,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              px: 1,
              py: 0.3,
              borderRadius: 1,
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            #{tag}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};
