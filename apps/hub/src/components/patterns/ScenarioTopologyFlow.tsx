import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Info,
  Layers,
  Sparkles,
  Server,
  Zap,
  Terminal,
  Activity,
} from 'lucide-react';
import type { ScenarioManifest, ScenarioFlowNode, NodeKind } from '@varia/core';
import { colorTokens } from '@varia/ui';

interface ScenarioTopologyFlowProps {
  scenario: ScenarioManifest;
  onSelectNode: (node: ScenarioFlowNode) => void;
}

export const ScenarioTopologyFlow: React.FC<ScenarioTopologyFlowProps> = ({
  scenario,
  onSelectNode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTrace, setShowTrace] = useState<boolean>(true);

  const steps = scenario.simulationSteps;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Reset simulation state when scenario changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [scenario.id]);

  // Auto-play simulation interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev + 1 >= steps.length) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevStep = () => {
    setCurrentStepIndex(prev => (prev - 1 + steps.length) % steps.length);
  };

  const handleNextStep = () => {
    setCurrentStepIndex(prev => (prev + 1) % steps.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const getNodeKindMeta = (kind: NodeKind) => {
    switch (kind) {
      case 'pattern_anchor':
        return {
          label: 'Pattern Anchor',
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.15)',
          border: 'rgba(139, 92, 246, 0.4)',
          icon: <Sparkles size={12} color="#c084fc" />,
        };
      case 'interface_port':
        return {
          label: 'Port / Gateway',
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.4)',
          icon: <Zap size={12} color="#38bdf8" />,
        };
      case 'infrastructure_service':
        return {
          label: 'Infra / Service',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          icon: <Server size={12} color="#34d399" />,
        };
      default:
        return {
          label: 'Concrete Class',
          color: '#e4e4e7',
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.15)',
          icon: <Layers size={12} color="#a1a1aa" />,
        };
    }
  };

  return (
    <Box>
      {/* Educational Flow Overview & Legend */}
      <Box
        sx={{
          p: 2.2,
          mb: 2,
          borderRadius: 2,
          backgroundColor: '#111116',
          border: `1px solid ${colorTokens.bg.border}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 1.5,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.4}>
            <Activity size={16} color="#8b5cf6" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
              RUNTIME COLLABORATION & EXECUTION FLOW
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: colorTokens.text.secondary, fontSize: '0.84rem' }}>
            Observe how data travels across component boundaries. Click any node to inspect its specific role, data contracts, and code.
          </Typography>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip
            icon={<Sparkles size={11} color="#c084fc" />}
            label="Pattern Anchor"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 600,
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              color: '#c084fc',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          />
          <Chip
            icon={<Zap size={11} color="#38bdf8" />}
            label="Port / Ingress"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 600,
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          />
          <Chip
            icon={<Server size={11} color="#34d399" />}
            label="Infra Service"
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 600,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        </Stack>
      </Box>

      {/* Sleek Simulation Control Strip */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          backgroundColor: '#18181d',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          {/* Step Info */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={`Step ${currentStepIndex + 1}/${steps.length}`}
              size="small"
              sx={{
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {currentStep?.title ?? 'Request Simulation'}
              </Typography>
              <Typography variant="body2" sx={{ color: colorTokens.text.secondary, fontSize: '0.8rem' }}>
                {currentStep?.description}
              </Typography>
            </Box>
          </Stack>

          {/* Controls */}
          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            {currentStep?.dataPayloadSnippet && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowTrace(!showTrace)}
                startIcon={<Terminal size={14} />}
                sx={{
                  borderColor: colorTokens.bg.border,
                  color: showTrace ? '#38bdf8' : colorTokens.text.secondary,
                  backgroundColor: showTrace ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  '&:hover': { borderColor: colorTokens.bg.borderHover },
                }}
              >
                {showTrace ? 'Hide Trace' : 'Show Trace'}
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              onClick={handleTogglePlay}
              startIcon={isPlaying ? <Pause size={15} /> : <Play size={15} />}
              sx={{
                backgroundColor: isPlaying ? '#f59e0b' : '#8b5cf6',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.8,
                '&:hover': {
                  backgroundColor: isPlaying ? '#d97706' : '#7c3aed',
                },
              }}
            >
              {isPlaying ? 'Pause' : 'Play Flow'}
            </Button>

            <Tooltip title="Previous Step">
              <IconButton
                size="small"
                onClick={handlePrevStep}
                sx={{
                  border: `1px solid ${colorTokens.bg.border}`,
                  color: colorTokens.text.primary,
                  p: 0.8,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <SkipBack size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next Step">
              <IconButton
                size="small"
                onClick={handleNextStep}
                sx={{
                  border: `1px solid ${colorTokens.bg.border}`,
                  color: colorTokens.text.primary,
                  p: 0.8,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <SkipForward size={16} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset Flow">
              <IconButton
                size="small"
                onClick={handleReset}
                sx={{
                  border: `1px solid ${colorTokens.bg.border}`,
                  color: colorTokens.text.secondary,
                  p: 0.8,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <RotateCcw size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Collapsible Slim Data Trace Strip */}
        {showTrace && currentStep?.dataPayloadSnippet && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.2,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.78rem',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              overflowX: 'auto',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#71717a', fontWeight: 700, flexShrink: 0, textTransform: 'uppercase' }}
            >
              Data Trace:
            </Typography>
            <code style={{ whiteSpace: 'nowrap' }}>{currentStep.dataPayloadSnippet}</code>
          </Box>
        )}
      </Box>

      {/* Visual Canvas - Full and Spacious */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 520, md: 560 },
          backgroundColor: '#0a0a0f',
          borderRadius: 2.5,
          border: `1px solid ${colorTokens.bg.border}`,
          overflow: 'hidden',
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 80%), radial-gradient(#27272a 1px, transparent 1px)',
          backgroundSize: '100% 100%, 24px 24px',
        }}
      >
        {/* SVG Connector Lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edge-active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {scenario.edges.map(edge => {
            const sourceNode = scenario.nodes.find(n => n.id === edge.source);
            const targetNode = scenario.nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isActive = currentStep?.activeEdgeIds.includes(edge.id);

            return (
              <g key={edge.id}>
                <line
                  x1={`${sourceNode.x}%`}
                  y1={`${sourceNode.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke={isActive ? 'url(#edge-active-gradient)' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isActive ? 3.5 : 1.5}
                  strokeDasharray={isActive ? '6 4' : undefined}
                />
                {edge.label && (
                  <text
                    x={`${(sourceNode.x + targetNode.x) / 2}%`}
                    y={`${(sourceNode.y + targetNode.y) / 2 - 2}%`}
                    fill={isActive ? '#38bdf8' : '#71717a'}
                    fontSize="11"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fontWeight={isActive ? 700 : 500}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {scenario.nodes.map(node => {
          const isActive = currentStep?.activeNodeIds.includes(node.id);
          const meta = getNodeKindMeta(node.kind);

          return (
            <Box
              key={node.id}
              onClick={() => onSelectNode(node)}
              sx={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.03)',
                },
              }}
            >
              <Box
                sx={{
                  minWidth: 165,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isActive ? '#141419' : '#18181d',
                  border: `1.5px solid ${isActive ? '#38bdf8' : meta.border}`,
                  boxShadow: isActive ? '0 0 18px rgba(56, 189, 248, 0.35)' : 'none',
                }}
              >
                {/* Header Badge */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    {meta.icon}
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.68rem', fontWeight: 700, color: meta.color }}
                    >
                      {meta.label}
                    </Typography>
                  </Stack>
                  <Tooltip title="Inspect Architecture Role & Java 21 Code">
                    <IconButton
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectNode(node);
                      }}
                      sx={{ p: 0.3, color: colorTokens.text.secondary, '&:hover': { color: '#ffffff' } }}
                    >
                      <Info size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Node Label */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    lineHeight: 1.3,
                    mb: 0.2,
                  }}
                >
                  {node.label}
                </Typography>

                {node.subLabel && (
                  <Typography
                    variant="caption"
                    sx={{ color: colorTokens.text.secondary, fontSize: '0.7rem', display: 'block' }}
                  >
                    {node.subLabel}
                  </Typography>
                )}

                {/* Pattern Tag */}
                {node.patternTag && (
                  <Chip
                    label={node.patternTag}
                    size="small"
                    sx={{
                      mt: 0.8,
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      color: '#c084fc',
                    }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
