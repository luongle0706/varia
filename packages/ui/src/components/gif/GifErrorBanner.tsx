import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  Stack,
  IconButton,
} from '@mui/material';
import {
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wrench,
} from 'lucide-react';
import type { StructuredError } from '@varia/core';
import { GlassCard } from '../GlassCard';

export interface GifErrorBannerProps {
  error: StructuredError | null;
  onAction?: (actionType: string) => void;
  onDismiss?: () => void;
}

export const GifErrorBanner: React.FC<GifErrorBannerProps> = ({ error, onAction, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const isUserError = error.category === 'user_validation';
  const isMemoryLimit = error.category === 'memory_limit';

  if (isUserError) {
    return (
      <Alert
        severity="warning"
        icon={<AlertTriangle size={20} color="#f59e0b" />}
        onClose={onDismiss}
        action={
          error.actionType && error.actionLabel && onAction ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => onAction(error.actionType!)}
              startIcon={<Wrench size={14} />}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 2,
                px: 1.5,
                color: '#fcd34d',
                '&:hover': {
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                },
              }}
            >
              {error.actionLabel}
            </Button>
          ) : undefined
        }
        sx={{
          mb: 3,
          borderRadius: 3,
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: '#fef3c7',
          alignItems: 'center',
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', mb: 0.2 }}>
          {error.title}
        </AlertTitle>
        <Typography variant="body2" sx={{ color: '#fef3c7', fontSize: '0.85rem' }}>
          {error.message}
        </Typography>
      </Alert>
    );
  }

  // System runtime / memory limit card
  return (
    <GlassCard
      sx={{
        mb: 3,
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${isMemoryLimit ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        background: isMemoryLimit
          ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, rgba(18, 18, 23, 0.9) 100%)'
          : 'linear-gradient(180deg, rgba(239, 68, 68, 0.1) 0%, rgba(18, 18, 23, 0.9) 100%)',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: isMemoryLimit
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${isMemoryLimit ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              mt: 0.2,
            }}
          >
            <AlertCircle size={20} color={isMemoryLimit ? '#fbbf24' : '#ef4444'} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: isMemoryLimit ? '#fbbf24' : '#fca5a5', mb: 0.5 }}
            >
              {error.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#d4d4d8', fontSize: '0.85rem', lineHeight: 1.5 }}
            >
              {error.message}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {error.actionType && onAction && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onAction(error.actionType!)}
              startIcon={<RefreshCw size={14} />}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#ffffff',
                },
              }}
            >
              {error.actionLabel || 'Retry'}
            </Button>
          )}

          {error.technicalDetails && (
            <IconButton
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ color: '#a1a1aa' }}
            >
              {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          )}
        </Stack>
      </Stack>

      {error.technicalDetails && (
        <Collapse in={showDetails}>
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#09090b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#a1a1aa',
              maxHeight: 140,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {error.technicalDetails}
          </Box>
        </Collapse>
      )}
    </GlassCard>
  );
};
