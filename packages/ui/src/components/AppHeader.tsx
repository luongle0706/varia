import React from 'react';
import { Box, Typography, Stack, Button, IconButton, Tooltip } from '@mui/material';
import { Search, Github, Sparkles } from 'lucide-react';
import { colorTokens } from '../theme/tokens';

export interface AppHeaderProps {
  onOpenSearch: () => void;
  toolCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch, toolCount }) => {
  return (
    <Box
      sx={{
        py: 2.5,
        px: { xs: 2, md: 4 },
        borderBottom: `1px solid ${colorTokens.bg.border}`,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(9, 9, 11, 0.75)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" maxWidth="1400px" mx="auto">
        {/* Logo */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                VARIA
              </Typography>
              {typeof toolCount === 'number' && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#a78bfa',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '999px',
                    px: 1,
                    py: 0.1,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {toolCount} Tools
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Search Bar Trigger & Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            onClick={onOpenSearch}
            variant="outlined"
            startIcon={<Search size={16} />}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: colorTokens.bg.border,
              color: colorTokens.text.secondary,
              fontSize: '0.85rem',
              px: 2,
              py: 0.8,
              borderRadius: 2,
              '&:hover': {
                borderColor: colorTokens.bg.borderHover,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Quick search...</span>
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                }}
              >
                Ctrl+K
              </Box>
            </Stack>
          </Button>

          <Tooltip title="View Source on GitHub">
            <IconButton
              href="https://github.com"
              target="_blank"
              sx={{
                border: `1px solid ${colorTokens.bg.border}`,
                borderRadius: 2,
                p: 1,
                color: colorTokens.text.secondary,
                '&:hover': {
                  color: colorTokens.text.primary,
                  borderColor: colorTokens.bg.borderHover,
                },
              }}
            >
              <Github size={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};
