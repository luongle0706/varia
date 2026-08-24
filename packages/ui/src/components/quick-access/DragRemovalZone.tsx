import React, { memo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import type { VariaToolManifest } from '@varia/core';

export interface DragRemovalZoneProps {
  isDragging: boolean;
  draggedTool: VariaToolManifest | null;
}

export const DragRemovalZone: React.FC<DragRemovalZoneProps> = memo(
  ({ isDragging, draggedTool }) => {
    if (!isDragging || !draggedTool) {
      return null;
    }

    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          backgroundColor: 'rgba(9, 9, 11, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pb: { xs: 4, md: 5 },
          px: 2,
          willChange: 'opacity',
        }}
      >
        {/* Glowing Trash Target Bar */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 1.5,
            borderRadius: 3.5,
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: `1.5px dashed ${colorTokens.accent.rose}`,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(244, 63, 94, 0.3)',
            userSelect: 'none',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 0.8,
                borderRadius: 1.5,
                backgroundColor: 'rgba(244, 63, 94, 0.25)',
                color: colorTokens.accent.rose,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={20} />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: colorTokens.accent.rose,
                  letterSpacing: '-0.01em',
                }}
              >
                Release to remove &quot;{draggedTool.name}&quot;
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#fca5a5',
                  fontSize: '0.72rem',
                  display: 'block',
                }}
              >
                Drop outside shelf to remove from Quick Access
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  },
);

DragRemovalZone.displayName = 'DragRemovalZone';
