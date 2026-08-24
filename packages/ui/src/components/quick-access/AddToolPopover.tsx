import React, { memo, useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Search, Plus, Wand2 } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import type { VariaToolManifest } from '@varia/core';
import { TOOL_CATEGORIES } from '@varia/core';

export interface AddToolPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  availableTools: VariaToolManifest[];
  favoriteToolIds: string[];
  onAddTool: (toolId: string) => void;
}

export const AddToolPopover: React.FC<AddToolPopoverProps> = memo(
  ({ open, anchorEl, onClose, availableTools, favoriteToolIds, onAddTool }) => {
    const [search, setSearch] = useState('');

    const unpinnedTools = availableTools.filter(
      tool =>
        !favoriteToolIds.includes(tool.id) &&
        (tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.description.toLowerCase().includes(search.toLowerCase()) ||
          tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))),
    );

    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setSearch('');
          onClose();
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        disableScrollLock
        PaperProps={{
          sx: {
            mt: 1,
            width: { xs: 290, sm: 340 },
            maxHeight: 380,
            backgroundColor: '#121217',
            backgroundImage: 'none',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${colorTokens.bg.borderHover}`,
            borderRadius: 3,
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
            p: 1.5,
          },
        }}
      >
        <Stack spacing={1.2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 0.5, color: colorTokens.text.primary }}>
            Add Tool to Quick Access
          </Typography>

          <TextField
            autoFocus
            size="small"
            placeholder="Search tool..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color={colorTokens.text.secondary} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                '& fieldset': {
                  borderColor: colorTokens.bg.border,
                },
                '&:hover fieldset': {
                  borderColor: colorTokens.bg.borderHover,
                },
              },
            }}
          />

          <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
            {unpinnedTools.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: colorTokens.text.muted, fontSize: '0.85rem' }}>
                  {favoriteToolIds.length >= availableTools.length
                    ? 'All available tools are pinned! ⭐'
                    : 'No matching tools found'}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {unpinnedTools.map(tool => {
                  const categoryMeta = TOOL_CATEGORIES[tool.category];
                  return (
                    <ListItemButton
                      key={tool.id}
                      onClick={() => {
                        onAddTool(tool.id);
                        if (unpinnedTools.length <= 1) {
                          onClose();
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        py: 0.8,
                        px: 1,
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.12)',
                          '& .add-icon': {
                            color: colorTokens.accent.violet,
                            transform: 'scale(1.15)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Wand2 size={16} color={categoryMeta?.badgeColor || colorTokens.accent.violet} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {tool.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: colorTokens.text.secondary }} noWrap>
                            {categoryMeta?.name || tool.category}
                          </Typography>
                        }
                      />
                      <Box
                        className="add-icon"
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          color: colorTokens.text.muted,
                          transition: 'color 0.15s ease, transform 0.15s ease',
                        }}
                      >
                        <Plus size={16} />
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Stack>
      </Popover>
    );
  },
);

AddToolPopover.displayName = 'AddToolPopover';
