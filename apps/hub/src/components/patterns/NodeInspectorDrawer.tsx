import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  X,
  ExternalLink,
  GitPullRequest,
  AlertTriangle,
  Code2,
  BookOpen,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import type { ScenarioFlowNode } from '@varia/core';
import { colorTokens } from '@varia/ui';

interface NodeInspectorDrawerProps {
  node: ScenarioFlowNode | null;
  open: boolean;
  onClose: () => void;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  open,
  onClose,
}) => {
  if (!node) return null;
  const { detail } = node;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540 },
          backgroundColor: '#0f0f13',
          borderLeft: `1px solid ${colorTokens.bg.border}`,
          color: colorTokens.text.primary,
          p: 3,
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.7)',
        },
      }}
    >
      {/* Drawer Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#ffffff' }}>
              {node.label}
            </Typography>
            {node.patternTag && (
              <Chip
                label={node.patternTag}
                size="small"
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Stack>
          {node.subLabel && (
            <Typography variant="body2" sx={{ color: colorTokens.text.secondary }}>
              {node.subLabel}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: colorTokens.text.secondary }}>
          <X size={20} />
        </IconButton>
      </Stack>

      <Divider sx={{ borderColor: colorTokens.bg.border, mb: 3 }} />

      {/* Role & Responsibility */}
      <Box mb={3}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            color: '#8b5cf6',
          }}
        >
          Component Role & Responsibility
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.8, color: '#e4e4e7', lineHeight: 1.65, fontSize: '0.9rem' }}>
          {detail.role}
        </Typography>
        {detail.className && (
          <Box
            sx={{
              mt: 1.2,
              p: 1,
              borderRadius: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colorTokens.bg.border}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              color: '#38bdf8',
            }}
          >
            class {detail.className}
          </Box>
        )}
      </Box>

      {/* Pattern Reference & Refactoring Guru Link */}
      {detail.pattern && (
        <Box
          mb={3}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BookOpen size={16} color="#c084fc" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#c084fc' }}>
                {detail.pattern.name} ({detail.pattern.category})
              </Typography>
            </Stack>
            {detail.pattern.guruUrl && (
              <Button
                href={detail.pattern.guruUrl}
                target="_blank"
                size="small"
                endIcon={<ExternalLink size={14} />}
                sx={{
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  p: 0,
                  '&:hover': { background: 'transparent', textDecoration: 'underline' },
                }}
              >
                Guru Docs
              </Button>
            )}
          </Stack>
          <Typography variant="body2" sx={{ color: '#d4d4d8', fontSize: '0.84rem', lineHeight: 1.5 }}>
            {detail.pattern.summary}
          </Typography>
        </Box>
      )}

      {/* Collaboration in the Flow */}
      <Box mb={3}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
          }}
        >
          <GitPullRequest size={14} /> Collaboration in this Flow
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.8, color: '#d4d4d8', lineHeight: 1.65, fontSize: '0.88rem' }}>
          {detail.contextJustification}
        </Typography>
      </Box>

      {/* Data Contract (Input / Output) */}
      {(detail.receives || detail.emits) && (
        <Box
          mb={3}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: '#0c0c10',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              color: '#38bdf8',
              display: 'block',
              mb: 1.5,
            }}
          >
            Data Contract (Input & Output)
          </Typography>

          {detail.receives && (
            <Box mb={1.5} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <ArrowDownRight size={15} color="#34d399" style={{ flexShrink: 0, marginTop: 3 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#34d399', fontWeight: 700, display: 'block', fontSize: '0.72rem' }}>
                  RECEIVES (INPUT):
                </Typography>
                <Typography variant="body2" sx={{ color: '#e4e4e7', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  {detail.receives}
                </Typography>
              </Box>
            </Box>
          )}

          {detail.emits && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <ArrowUpRight size={15} color="#38bdf8" style={{ flexShrink: 0, marginTop: 3 }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', fontSize: '0.72rem' }}>
                  EMITS / CALLS (OUTPUT):
                </Typography>
                <Typography variant="body2" sx={{ color: '#e4e4e7', fontSize: '0.84rem', lineHeight: 1.5 }}>
                  {detail.emits}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Trade-offs & Implementation Consequences */}
      {detail.tradeOffs && detail.tradeOffs.length > 0 && (
        <Box mb={3}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <AlertTriangle size={14} /> Implementation Notes & Considerations
          </Typography>
          <Stack spacing={1} mt={1}>
            {detail.tradeOffs.map((item, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{ color: '#a1a1aa', fontSize: '0.84rem', lineHeight: 1.55 }}
              >
                • {item}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}

      {/* Java 21 Code Snippet */}
      {detail.javaSnippet && (
        <Box mb={2}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <Code2 size={16} color="#38bdf8" />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#38bdf8',
              }}
            >
              Java 21 Implementation Snippet
            </Typography>
          </Stack>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#09090b',
              border: `1px solid ${colorTokens.bg.border}`,
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              lineHeight: 1.55,
              color: '#cbd5e1',
              m: 0,
            }}
          >
            <code>{detail.javaSnippet}</code>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
