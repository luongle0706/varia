import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Copy, Check, Terminal, PlayCircle, Server } from 'lucide-react';
import type { ScenarioManifest } from '@varia/core';
import { colorTokens } from '@varia/ui';

interface DockerRunGuideProps {
  scenario: ScenarioManifest;
}

export const DockerRunGuide: React.FC<DockerRunGuideProps> = ({ scenario }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Container Services Grid */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          backgroundColor: 'rgba(24, 24, 27, 0.5)',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Server size={18} color="#06b6d4" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Containerized Services in Docker Compose
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {scenario.dockerServices.map(svc => (
            <Box
              key={svc.name}
              sx={{
                p: 1.8,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${colorTokens.bg.border}`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                  {svc.name}
                </Typography>
                <Chip
                  label={svc.port}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#a1a1aa',
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: '#71717a', display: 'block', mb: 0.5, fontFamily: 'monospace' }}
              >
                {svc.image}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d4d4d8', fontSize: '0.8rem' }}>
                {svc.purpose}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 3-Step Quickstart */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          backgroundColor: 'rgba(24, 24, 27, 0.5)',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <Terminal size={18} color="#8b5cf6" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Terminal Quickstart Workflow
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {/* Step 1 */}
          <Box>
            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              STEP 1: Navigate to Scenario Directory
            </Typography>
            <Box
              sx={{
                mt: 0.8,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#09090b',
                border: `1px solid ${colorTokens.bg.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
                color: '#38bdf8',
              }}
            >
              <span>{scenario.runCommands.cloneAndNavigate}</span>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() => handleCopyCommand(scenario.runCommands.cloneAndNavigate, 101)}
                  sx={{ color: colorTokens.text.secondary }}
                >
                  {copiedIndex === 101 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Step 2 */}
          <Box>
            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              STEP 2: Boot Services via Docker Compose
            </Typography>
            <Box
              sx={{
                mt: 0.8,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#09090b',
                border: `1px solid ${colorTokens.bg.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
                color: '#38bdf8',
              }}
            >
              <span>{scenario.runCommands.startDocker}</span>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() => handleCopyCommand(scenario.runCommands.startDocker, 102)}
                  sx={{ color: colorTokens.text.secondary }}
                >
                  {copiedIndex === 102 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Step 3 */}
          <Box>
            <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              STEP 3: Run Java 21 Tests & Pattern Validations
            </Typography>
            <Box
              sx={{
                mt: 0.8,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#09090b',
                border: `1px solid ${colorTokens.bg.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
                color: '#38bdf8',
              }}
            >
              <span>{scenario.runCommands.runTests}</span>
              <Tooltip title="Copy">
                <IconButton
                  size="small"
                  onClick={() => handleCopyCommand(scenario.runCommands.runTests, 103)}
                  sx={{ color: colorTokens.text.secondary }}
                >
                  {copiedIndex === 103 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Curl Test Commands */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          backgroundColor: 'rgba(24, 24, 27, 0.5)',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <PlayCircle size={18} color="#10b981" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Simulated Curl Triggers & Verification Commands
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {scenario.runCommands.sampleCurlTriggers.map((trig, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#08080c',
                border: `1px solid ${colorTokens.bg.border}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e4e4e7', mb: 0.5 }}>
                {trig.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#a1a1aa', fontSize: '0.825rem', mb: 1.5 }}>
                {trig.description}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: '#050508',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  color: '#34d399',
                  overflowX: 'auto',
                }}
              >
                <code>{trig.command}</code>
                <Tooltip title="Copy Curl Command">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyCommand(trig.command, idx)}
                    sx={{ color: colorTokens.text.secondary, ml: 1, flexShrink: 0 }}
                  >
                    {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
