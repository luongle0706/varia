import React, { memo } from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import {
  GripVertical,
  X,
  FileAudio,
  Film,
  Code2,
  Activity,
  Download,
  FileText,
  Key,
  ShieldCheck,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import type { VariaToolManifest } from '@varia/core';
import { TOOL_CATEGORIES } from '@varia/core';

const ICON_MAP: Record<string, React.ReactNode> = {
  audio: <FileAudio size={18} color={colorTokens.accent.violet} />,
  gif: <Film size={18} color="#ec4899" />,
  image: <ImageIcon size={18} color="#ec4899" />,
  uuid: <Key size={18} color={colorTokens.accent.violet} />,
  hash: <ShieldCheck size={18} color={colorTokens.accent.cyan} />,
  speed: <Activity size={18} color={colorTokens.accent.cyan} />,
  social: <Download size={18} color={colorTokens.accent.amber} />,
  code: <Code2 size={18} color={colorTokens.accent.violet} />,
  text: <FileText size={18} color={colorTokens.accent.emerald} />,
  default: <Wand2 size={18} color={colorTokens.accent.violet} />,
};

export interface QuickAccessItemProps {
  tool: VariaToolManifest;
  index: number;
  isBeingDragged?: boolean;
  onSelect: (tool: VariaToolManifest) => void;
  onRemove: (toolId: string) => void;
  onStartDrag: (e: React.PointerEvent, index: number) => void;
}

export const QuickAccessItem: React.FC<QuickAccessItemProps> = memo(
  ({
    tool,
    index,
    isBeingDragged = false,
    onSelect,
    onRemove,
    onStartDrag,
  }) => {
    const categoryMeta = TOOL_CATEGORIES[tool.category];
    const icon = ICON_MAP[tool.icon] || ICON_MAP.default;

    return (
      <Box
        data-quick-access-item
        data-index={index}
        onClick={() => onSelect(tool)}
        sx={{
          flex: '0 0 auto',
          minWidth: { xs: 170, sm: 200 },
          maxWidth: { xs: 220, sm: 240 },
          backgroundColor: isBeingDragged
            ? 'rgba(139, 92, 246, 0.05)'
            : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          border: isBeingDragged
            ? `1.5px dashed ${colorTokens.accent.violet}`
            : `1px solid ${colorTokens.bg.border}`,
          borderRadius: 2.5,
          p: 1.5,
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
          opacity: isBeingDragged ? 0.35 : 1,
          transform: 'translate3d(0, 0, 0)',
          transition:
            'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
          willChange: 'transform, opacity',
          '&:hover': {
            borderColor: isBeingDragged ? colorTokens.accent.violet : colorTokens.bg.borderHover,
            backgroundColor: 'rgba(255, 255, 255, 0.055)',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.12)',
            transform: isBeingDragged ? 'none' : 'translate3d(0, -2px, 0)',
            '& .quick-remove-btn': {
              opacity: 1,
            },
            '& .drag-grip-handle': {
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
        }}
      >
        {/* Glow Accent Background */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${
              categoryMeta?.badgeColor || colorTokens.accent.violet
            } 0%, transparent 70%)`,
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          {/* Left: 6-Dots Drag Handle + Icon + Title */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
            {/* 6-Dots Immediate Drag Handle */}
            <Tooltip title="Hold and drag to reorder" placement="top">
              <Box
                className="drag-grip-handle"
                onPointerDown={e => {
                  e.stopPropagation();
                  onStartDrag(e, index);
                }}
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                  opacity: 0.45,
                  color: colorTokens.text.muted,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'grab',
                  touchAction: 'none',
                  transition: 'opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease',
                  '&:hover': {
                    opacity: 1,
                    color: colorTokens.accent.violetLight,
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  },
                  '&:active': {
                    cursor: 'grabbing',
                  },
                }}
              >
                <GripVertical size={16} />
              </Box>
            </Tooltip>

            <Box
              sx={{
                p: 0.8,
                borderRadius: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: colorTokens.text.primary,
                  letterSpacing: '-0.01em',
                }}
              >
                {tool.name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: 'block',
                  color: colorTokens.text.secondary,
                  fontSize: '0.72rem',
                }}
              >
                {categoryMeta?.name || tool.category}
              </Typography>
            </Box>
          </Stack>

          {/* Right: Quick Remove Button (Hover) */}
          <Tooltip title="Remove from Quick Access" placement="top">
            <IconButton
              size="small"
              className="quick-remove-btn"
              onClick={e => {
                e.stopPropagation();
                onRemove(tool.id);
              }}
              sx={{
                opacity: { xs: 0.7, md: 0 },
                p: 0.4,
                color: colorTokens.text.muted,
                transition: 'opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                '&:hover': {
                  color: colorTokens.accent.rose,
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                },
              }}
            >
              <X size={14} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    );
  },
);

QuickAccessItem.displayName = 'QuickAccessItem';
