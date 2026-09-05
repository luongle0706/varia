import React from 'react';
import { Box, Typography, Stack, Button, IconButton, Tooltip } from '@mui/material';
import { Search, Github, Layers, Network } from 'lucide-react';
import { colorTokens } from '../theme/tokens';

export type HeaderNavigationTab = 'tools' | 'patterns';

export interface AppHeaderProps {
  onOpenSearch: () => void;
  toolCount?: number;
  activeTab?: HeaderNavigationTab;
  onSelectTab?: (tab: HeaderNavigationTab) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenSearch,
  activeTab = 'tools',
  onSelectTab,
}) => {
  return (
    <Box
      sx={{
        py: 2,
        px: { xs: 2, md: 4 },
        borderBottom: `1px solid ${colorTokens.bg.border}`,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(9, 9, 11, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transform: 'translateZ(0)',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="1400px"
        mx="auto"
      >
        {/* Logo + Navigation Links */}
        <Stack direction="row" spacing={{ xs: 2, md: 4 }} alignItems="center">
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => onSelectTab?.('tools')}
          >
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
              <Layers size={20} color="#ffffff" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                  color: colorTokens.text.primary,
                }}
              >
                VARIA
              </Typography>
            </Box>
          </Stack>

          {/* Navigation Tabs */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              onClick={() => onSelectTab?.('tools')}
              variant="text"
              startIcon={<Layers size={16} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 0.8,
                borderRadius: 2,
                color: activeTab === 'tools' ? '#ffffff' : colorTokens.text.secondary,
                backgroundColor:
                  activeTab === 'tools' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                border: `1px solid ${
                  activeTab === 'tools' ? 'rgba(139, 92, 246, 0.4)' : 'transparent'
                }`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor:
                    activeTab === 'tools'
                      ? 'rgba(139, 92, 246, 0.22)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                },
              }}
            >
              Digital Tools
            </Button>

            <Button
              onClick={() => onSelectTab?.('patterns')}
              variant="text"
              startIcon={<Network size={16} />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 0.8,
                borderRadius: 2,
                color: activeTab === 'patterns' ? '#ffffff' : colorTokens.text.secondary,
                backgroundColor:
                  activeTab === 'patterns' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                border: `1px solid ${
                  activeTab === 'patterns' ? 'rgba(6, 182, 212, 0.4)' : 'transparent'
                }`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor:
                    activeTab === 'patterns'
                      ? 'rgba(6, 182, 212, 0.22)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                },
              }}
            >
              Design Patterns
            </Button>
          </Stack>
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
              transition: 'border-color 0.15s ease, background-color 0.15s ease',
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
              href="https://github.com/luongle0706/varia"
              target="_blank"
              sx={{
                border: `1px solid ${colorTokens.bg.border}`,
                borderRadius: 2,
                p: 1,
                color: colorTokens.text.secondary,
                transition: 'color 0.15s ease, border-color 0.15s ease',
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
