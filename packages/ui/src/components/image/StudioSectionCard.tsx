import React, { useState } from 'react';
import { Box, Typography, Stack, Button, Tooltip, IconButton, Collapse } from '@mui/material';
import { ChevronDown, Info } from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface StudioSectionCardProps {
  title: string;
  icon: React.ReactNode;
  infoTooltip?: string;
  badge?: React.ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  isHighlighted?: boolean;
  children: React.ReactNode;
}

export const StudioSectionCard: React.FC<StudioSectionCardProps> = ({
  title,
  icon,
  infoTooltip,
  badge,
  onReset,
  resetLabel = 'Reset',
  showReset = false,
  collapsible = true,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
  isHighlighted = false,
  children,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (!collapsible) return;
    const next = !isExpanded;
    setInternalExpanded(next);
    onToggleExpand?.(next);
  };

  return (
    <GlassCard
      sx={{
        p: 2.5,
        border: isHighlighted ? `1px solid ${colorTokens.accent.violet}` : undefined,
        boxShadow: isHighlighted ? '0 0 20px rgba(139, 92, 246, 0.15)' : undefined,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={handleToggle}
        sx={{
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            {title}
          </Typography>
          {infoTooltip && (
            <Tooltip title={infoTooltip} arrow>
              <Box
                component="span"
                onClick={e => e.stopPropagation()}
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <Info size={14} color={colorTokens.text.muted} style={{ cursor: 'help' }} />
              </Box>
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {badge}

          {showReset && onReset && (
            <Button
              size="small"
              onClick={e => {
                e.stopPropagation();
                onReset();
              }}
              sx={{
                fontSize: '0.75rem',
                color: colorTokens.text.muted,
                '&:hover': { color: colorTokens.accent.rose },
              }}
            >
              {resetLabel}
            </Button>
          )}

          {collapsible && (
            <IconButton
              size="small"
              sx={{
                p: 0.3,
                color: colorTokens.text.muted,
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronDown size={16} />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* Collapsible Content */}
      <Collapse in={!collapsible || isExpanded} timeout="auto" unmountOnExit={false}>
        <Box pt={2}>{children}</Box>
      </Collapse>
    </GlassCard>
  );
};
