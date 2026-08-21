import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Search, Command, ArrowRight } from 'lucide-react';
import { colorTokens } from '../theme/tokens';
import type { VariaToolManifest } from '@varia/core';

export interface SpotlightSearchProps {
  tools: VariaToolManifest[];
  open: boolean;
  onClose: () => void;
  onSelectTool: (tool: VariaToolManifest) => void;
}

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  tools,
  open,
  onClose,
  onSelectTool,
}) => {
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
      PaperProps={{
        sx: {
          backgroundColor: '#121217',
          backgroundImage: 'none',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${colorTokens.bg.borderHover}`,
          borderRadius: 3.5,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
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
              {filteredTools.map(tool => (
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
                    transition: 'all 0.15s ease',
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
                  <Box className="arrow-icon" sx={{ opacity: 0, transition: 'all 0.2s ease' }}>
                    <ArrowRight size={16} color={colorTokens.accent.violet} />
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
