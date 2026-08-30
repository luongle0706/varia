import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Download,
  Trash2,
  Sparkles,
  FileArchive,
  Layers,
} from 'lucide-react';
import { formatBytes, type BatchImageItem } from '@varia/core';
import { colorTokens } from '../../theme/tokens';
import { GlassCard } from '../GlassCard';

export interface BatchImageTableProps {
  items: BatchImageItem[];
  onDownloadItem: (item: BatchImageItem) => void;
  onDownloadAllZip: () => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  isProcessingBatch?: boolean;
}

export const BatchImageTable: React.FC<BatchImageTableProps> = ({
  items,
  onDownloadItem,
  onDownloadAllZip,
  onRemoveItem,
  onClearAll,
  isProcessingBatch = false,
}) => {
  if (items.length === 0) return null;

  const totalOriginalBytes = items.reduce((acc, item) => acc + item.originalSize, 0);
  const totalCompressedBytes = items.reduce(
    (acc, item) => acc + (item.result?.compressedSize || item.originalSize),
    0,
  );
  const totalSavingsPercentage =
    totalOriginalBytes > 0
      ? Math.max(
          0,
          Math.round(
            ((totalOriginalBytes - totalCompressedBytes) / totalOriginalBytes) * 1000,
          ) / 10,
        )
      : 0;

  const completedCount = items.filter(i => i.status === 'done').length;

  return (
    <GlassCard sx={{ p: 2.5, mt: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
        mb={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Layers size={18} color={colorTokens.accent.violetLight} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colorTokens.text.primary }}>
            Batch Processing Queue ({completedCount}/{items.length})
          </Typography>
          {totalSavingsPercentage > 0 && (
            <Chip
              icon={<Sparkles size={14} color="#10b981" />}
              label={`Total Saved: -${totalSavingsPercentage}% (${formatBytes(totalOriginalBytes)} → ${formatBytes(totalCompressedBytes)})`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileArchive size={16} />}
            onClick={onDownloadAllZip}
            disabled={completedCount === 0 || isProcessingBatch}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            }}
          >
            Download All (.ZIP)
          </Button>

          <Button
            size="small"
            onClick={onClearAll}
            sx={{
              color: colorTokens.text.muted,
              fontSize: '0.8rem',
              '&:hover': { color: colorTokens.accent.rose },
            }}
          >
            Clear All
          </Button>
        </Stack>
      </Stack>

      {/* Table Container */}
      <TableContainer sx={{ maxHeight: 380, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                Image
              </TableCell>
              <TableCell sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                File Name
              </TableCell>
              <TableCell sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                Original
              </TableCell>
              <TableCell sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                Compressed
              </TableCell>
              <TableCell sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                Savings
              </TableCell>
              <TableCell align="right" sx={{ backgroundColor: '#121216', color: colorTokens.text.muted, fontWeight: 700 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => {
              const isDone = item.status === 'done';
              const isProcessing = item.status === 'processing';
              const isError = item.status === 'error';

              return (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                    borderBottom: `1px solid ${colorTokens.bg.border}`,
                  }}
                >
                  {/* Thumbnail */}
                  <TableCell sx={{ py: 1 }}>
                    <Box
                      component="img"
                      src={item.previewUrl}
                      alt={item.file.name}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </TableCell>

                  {/* File Name & Dimensions */}
                  <TableCell sx={{ py: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colorTokens.text.primary,
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.file.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                      {item.dimensions.width}×{item.dimensions.height}px
                    </Typography>
                    {isProcessing && (
                      <LinearProgress
                        sx={{
                          mt: 0.5,
                          height: 3,
                          borderRadius: 1.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: colorTokens.accent.violet,
                          },
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Original Size */}
                  <TableCell sx={{ color: colorTokens.text.secondary, py: 1 }}>
                    {formatBytes(item.originalSize)}
                  </TableCell>

                  {/* Compressed Size */}
                  <TableCell sx={{ py: 1 }}>
                    {isDone && item.result ? (
                      <Typography variant="body2" sx={{ fontWeight: 700, color: colorTokens.accent.violetLight }}>
                        {formatBytes(item.result.compressedSize)}
                      </Typography>
                    ) : isProcessing ? (
                      <Typography variant="caption" sx={{ color: colorTokens.accent.amber }}>
                        Optimizing...
                      </Typography>
                    ) : isError ? (
                      <Typography variant="caption" sx={{ color: colorTokens.accent.rose }}>
                        Failed
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: colorTokens.text.muted }}>
                        Pending
                      </Typography>
                    )}
                  </TableCell>

                  {/* Savings % */}
                  <TableCell sx={{ py: 1 }}>
                    {isDone && item.result && item.result.savingsPercentage > 0 ? (
                      <Chip
                        label={`-${item.result.savingsPercentage}%`}
                        size="small"
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>

                  {/* Action Buttons */}
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {isDone && item.result && (
                        <Tooltip title="Download compressed image" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onDownloadItem(item)}
                            sx={{
                              color: colorTokens.accent.violetLight,
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.2)' },
                            }}
                          >
                            <Download size={15} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Remove" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onRemoveItem(item.id)}
                          sx={{
                            color: colorTokens.text.muted,
                            '&:hover': { color: colorTokens.accent.rose },
                          }}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
};
