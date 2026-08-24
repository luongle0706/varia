import React, { useState, useEffect, memo } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Command, ArrowRight, Star } from 'lucide-react';
import { colorTokens } from '../theme/tokens';
import type { VariaToolManifest } from '@varia/core';

export interface SpotlightSearchProps {
  tools: VariaToolManifest[];
  favoriteToolIds?: string[];
  open: boolean;
  onClose: () => void;
  onSelectTool: (tool: VariaToolManifest) => void;
  onToggleFavorite?: (toolId: string) => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = memo(
  ({ tools, favoriteToolIds = [], open, onClose, onSelectTool, onToggleFavorite }) => {
    const [query, setQuery] = useState('');

    // Keyboard shortcut listener (Ctrl+K / Cmd+K)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          if (open) onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    const filteredTools = tools.filter(
      tool =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())),
    );

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        PaperProps={{
          sx: {
            backgroundColor: '#121217',
            backgroundImage: 'none',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${colorTokens.bg.borderHover}`,
            borderRadius: 3.5,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
            transform: 'translateZ(0)',
          },
        }}
      >
        <DialogContent sx={{ p: 2 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search mini tools, utilities, shortcuts... (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={colorTokens.text.secondary} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      label="ESC"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: colorTokens.text.muted,
                      }}
                    />
                  </Stack>
                </InputAdornment>
              ),
              sx: {
                color: colorTokens.text.primary,
                fontSize: '1rem',
                p: 1,
              },
            }}
          />

          <Box sx={{ mt: 1.5, maxHeight: 340, overflowY: 'auto' }}>
            {filteredTools.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ p: 3, textAlign: 'center', color: colorTokens.text.muted }}
              >
                No tools matching &quot;{query}&quot;
              </Typography>
            ) : (
              <List disablePadding>
                {filteredTools.map(tool => {
                  const isFav = favoriteToolIds.includes(tool.id);
                  return (
                    <ListItemButton
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool);
                        onClose();
                      }}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        p: 1.2,
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.12)',
                          '& .arrow-icon': {
                            opacity: 1,
                            transform: 'translateX(3px)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Command size={18} color={colorTokens.accent.violet} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {tool.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: colorTokens.text.secondary }}
                            noWrap
                          >
                            {tool.description}
                          </Typography>
                        }
                      />

                      <Stack direction="row" spacing={1} alignItems="center">
                        {onToggleFavorite && (
                          <Tooltip
                            title={isFav ? 'Remove from Quick Access' : 'Add to Quick Access'}
                          >
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                onToggleFavorite(tool.id);
                              }}
                              sx={{
                                color: isFav ? '#eab308' : colorTokens.text.muted,
                                p: 0.5,
                                '&:hover': {
                                  color: isFav ? '#fde047' : colorTokens.text.primary,
                                },
                              }}
                            >
                              <Star
                                size={16}
                                fill={isFav ? '#eab308' : 'none'}
                                strokeWidth={isFav ? 1.5 : 2}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Box
                          className="arrow-icon"
                          sx={{
                            opacity: 0,
                            transition: 'opacity 0.15s ease, transform 0.15s ease',
                            willChange: 'transform, opacity',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowRight size={16} color={colorTokens.accent.violet} />
                        </Box>
                      </Stack>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  },
);

SpotlightSearch.displayName = 'SpotlightSearch';
