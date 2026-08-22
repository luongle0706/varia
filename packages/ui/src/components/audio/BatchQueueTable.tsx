import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  FileArchive,
  FileAudio,
} from 'lucide-react';
import { colorTokens } from '../../theme/tokens';
import { formatBytes, type AudioFormat, type BatchItem } from '@varia/core';

export interface BatchQueueTableProps {
  items: BatchItem[];
  isConverting: boolean;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onConvertAll: () => void;
  onDownloadItem: (item: BatchItem) => void;
  onDownloadAllZip: () => void;
  onChangeFormat: (id: string, format: AudioFormat) => void;
}

export const BatchQueueTable: React.FC<BatchQueueTableProps> = ({
  items,
  isConverting,
  onRemoveItem,
  onClearAll,
  onConvertAll,
  onDownloadItem,
  onDownloadAllZip,
  onChangeFormat,
}) => {
  const completedCount = items.filter(i => i.status === 'done').length;
  const formats: AudioFormat[] = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

  if (items.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(24, 24, 27, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colorTokens.bg.border}`,
        borderRadius: 3.5,
        p: 2.5,
        mb: 3,
        transform: 'translateZ(0)',
      }}
    >
      {/* Table Header Controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FileAudio size={20} color={colorTokens.accent.violet} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Batch Conversion Queue ({completedCount}/{items.length} Completed)
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} mt={{ xs: 1, sm: 0 }}>
          {completedCount > 1 && (
            <Button
              size="small"
              variant="outlined"
              color="success"
              startIcon={<FileArchive size={14} />}
              onClick={onDownloadAllZip}
              sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}
            >
              Download All as ZIP
            </Button>
          )}

          <Button
            size="small"
            variant="contained"
            disabled={isConverting || completedCount === items.length}
            startIcon={<Play size={14} />}
            onClick={onConvertAll}
            sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 700 }}
          >
            {isConverting ? 'Processing Queue...' : 'Convert All Files'}
          </Button>

          <Tooltip title="Clear Queue">
            <span>
              <IconButton
                size="small"
                disabled={isConverting}
                onClick={onClearAll}
                sx={{ color: colorTokens.text.secondary }}
              >
                <Trash2 size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Queue Items List */}
      <Stack spacing={1.5}>
        {items.map(item => {
          const isDone = item.status === 'done';
          const isError = item.status === 'error';
          const isInProgress = item.status === 'converting' || item.status === 'loading';

          return (
            <Box
              key={item.id}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${
                  isDone
                    ? 'rgba(16, 185, 129, 0.25)'
                    : isError
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(255, 255, 255, 0.05)'
                }`,
                borderRadius: 2.5,
                p: 2,
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
              >
                {/* File Info */}
                <Box sx={{ minWidth: 220, maxWidth: { xs: '100%', md: 320 } }}>
                  <Typography noWrap variant="body2" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                    {formatBytes(item.size)}
                    {item.result && ` ➔ ${formatBytes(item.result.outputSize)}`}
                  </Typography>
                </Box>

                {/* Target Format Selector */}
                <Box>
                  <FormControl size="small">
                    <Select
                      value={item.options.format}
                      disabled={isConverting || isDone}
                      onChange={e => onChangeFormat(item.id, e.target.value as AudioFormat)}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        height: 32,
                        borderRadius: 1.5,
                      }}
                    >
                      {formats.map(fmt => (
                        <MenuItem key={fmt} value={fmt} sx={{ fontSize: '0.8rem' }}>
                          {fmt.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Progress / Status Badge */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 160 }, px: { md: 2 } }}>
                  {isInProgress ? (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography
                          variant="caption"
                          sx={{ color: colorTokens.accent.violet, fontWeight: 600 }}
                        >
                          {item.status === 'loading' ? 'Loading Engine...' : 'Transcoding...'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {item.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                          },
                        }}
                      />
                    </Box>
                  ) : isDone ? (
                    <Chip
                      icon={<CheckCircle2 size={12} />}
                      label="Done"
                      size="small"
                      color="success"
                      sx={{ fontSize: '0.75rem', fontWeight: 600, height: 24 }}
                    />
                  ) : isError ? (
                    <Chip
                      icon={<AlertCircle size={12} />}
                      label={item.error || 'Failed'}
                      size="small"
                      color="error"
                      sx={{ fontSize: '0.75rem', fontWeight: 600, height: 24 }}
                    />
                  ) : (
                    <Chip
                      icon={<Clock size={12} />}
                      label="Ready"
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        height: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      }}
                    />
                  )}
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {isDone && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<Download size={14} />}
                      onClick={() => onDownloadItem(item)}
                      sx={{ borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Save
                    </Button>
                  )}

                  <IconButton
                    size="small"
                    disabled={isConverting && isInProgress}
                    onClick={() => onRemoveItem(item.id)}
                    sx={{
                      color: colorTokens.text.muted,
                      '&:hover': { color: colorTokens.accent.rose },
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
