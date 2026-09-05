import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  BookOpen,
  Activity,
  FolderTree,
  Terminal,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { colorTokens } from '@varia/ui';
import type {
  ScenarioFlowNode,
  DomainCategory,
  ScaleArchetype,
} from '@varia/core';
import { REGISTERED_SCENARIOS } from '../../registry/patterns';
import { ScenarioArchitectureContext } from './ScenarioArchitectureContext';
import { ScenarioTopologyFlow } from './ScenarioTopologyFlow';
import { NodeInspectorDrawer } from './NodeInspectorDrawer';
import { ScenarioFolderStructure } from './ScenarioFolderStructure';
import { DockerRunGuide } from './DockerRunGuide';

interface PatternsStudioProps {
  onBackToTools?: () => void;
  initialScenarioId?: string;
}

export const PatternsStudio: React.FC<PatternsStudioProps> = ({
  initialScenarioId,
  onBackToTools,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    initialScenarioId || REGISTERED_SCENARIOS[0]?.id || '',
  );
  const [domainFilter, setDomainFilter] = useState<DomainCategory | 'all'>('all');
  const [scaleFilter, setScaleFilter] = useState<ScaleArchetype | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'context' | 'flow' | 'structure' | 'docker'>('context');
  const [inspectedNode, setInspectedNode] = useState<ScenarioFlowNode | null>(null);

  const activeScenario = useMemo(() => {
    return (
      REGISTERED_SCENARIOS.find(s => s.id === selectedScenarioId) || REGISTERED_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  const filteredScenarios = useMemo(() => {
    return REGISTERED_SCENARIOS.filter(scenario => {
      if (domainFilter !== 'all' && scenario.domain !== domainFilter) return false;
      if (scaleFilter !== 'all' && scenario.scaleArchetype !== scaleFilter) return false;
      return true;
    });
  }, [domainFilter, scaleFilter]);

  if (!activeScenario) {
    return <Typography color={colorTokens.text.primary}>No scenarios found.</Typography>;
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, backgroundColor: '#09090b', color: '#ffffff' }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, pt: 3 }}>
        {/* Studio Header */}
        <Box sx={{ mb: 3 }}>
          {onBackToTools && (
            <Button
              size="small"
              onClick={onBackToTools}
              startIcon={<ArrowLeft size={15} />}
              sx={{
                mb: 1.5,
                color: '#a1a1aa',
                textTransform: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                px: 1.2,
                py: 0.4,
                borderRadius: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Back to Daily Tools
            </Button>
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Enterprise Design Patterns Lab
          </Typography>
          <Typography variant="body2" sx={{ color: colorTokens.text.secondary }}>
            Context-driven architectures and multi-pattern orchestrations calibrated for concrete business scales and constraints.
          </Typography>
        </Box>

        {/* Master-Detail Two-Column Studio Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '310px minmax(0, 1fr)' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: SCENARIO CATALOG                                            */}
          {/* ========================================================================= */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: '#111116',
              border: `1px solid ${colorTokens.bg.border}`,
              position: { lg: 'sticky' },
              top: { lg: 88 },
              minWidth: 0,
            }}
          >
            {/* Catalog Title */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Layers size={16} color="#8b5cf6" />
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 800,
                  color: colorTokens.text.secondary,
                }}
              >
                Scenario Catalog ({filteredScenarios.length})
              </Typography>
            </Stack>

            {/* Filter by Domain */}
            <Box mb={1.8}>
              <Typography
                variant="caption"
                sx={{ color: '#71717a', fontSize: '0.72rem', display: 'block', mb: 0.8, fontWeight: 700 }}
              >
                DOMAIN
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {(['all', 'ecommerce', 'fintech'] as const).map(dom => (
                  <Chip
                    key={dom}
                    label={dom === 'all' ? 'All' : dom.toUpperCase()}
                    onClick={() => setDomainFilter(dom)}
                    clickable
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor:
                        domainFilter === dom ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                      color: domainFilter === dom ? '#ffffff' : colorTokens.text.secondary,
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Filter by Scale */}
            <Box mb={2.5}>
              <Typography
                variant="caption"
                sx={{ color: '#71717a', fontSize: '0.72rem', display: 'block', mb: 0.8, fontWeight: 700 }}
              >
                OPERATIONAL SCALE
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {(['all', 'marketplace_hyperscale', 'd2c_enterprise'] as const).map(scale => (
                  <Chip
                    key={scale}
                    label={
                      scale === 'all'
                        ? 'All'
                        : scale === 'marketplace_hyperscale'
                        ? 'Hyperscale'
                        : 'D2C Brand'
                    }
                    onClick={() => setScaleFilter(scale)}
                    clickable
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor:
                        scaleFilter === scale ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                      color: scaleFilter === scale ? '#ffffff' : colorTokens.text.secondary,
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Scenario Items List */}
            <Stack spacing={1.5}>
              {filteredScenarios.map(scen => {
                const isSelected = scen.id === activeScenario.id;
                const isHyperscale = scen.scaleArchetype === 'marketplace_hyperscale';

                return (
                  <Box
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? 'rgba(139, 92, 246, 0.12)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1.5px solid ${
                        isSelected ? '#8b5cf6' : 'rgba(255, 255, 255, 0.06)'
                      }`,
                      transition: 'all 0.18s ease',
                      borderLeft: isSelected ? '4px solid #8b5cf6' : undefined,
                      '&:hover': {
                        backgroundColor: isSelected
                          ? 'rgba(139, 92, 246, 0.16)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isSelected ? '#a78bfa' : 'rgba(255, 255, 255, 0.15)',
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                      <Chip
                        label={isHyperscale ? 'Hyperscale' : 'D2C Enterprise'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: isHyperscale
                            ? 'rgba(244, 63, 94, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                          color: isHyperscale ? '#fb7185' : '#34d399',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#71717a' }}
                      >
                        {scen.businessCapability.replace(/_/g, ' ')}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: isSelected ? '#ffffff' : '#e4e4e7',
                        fontSize: '0.85rem',
                        lineHeight: 1.3,
                        mb: 0.6,
                      }}
                    >
                      {scen.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: colorTokens.text.secondary,
                        fontSize: '0.72rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                      }}
                    >
                      {scen.tagline}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* ========================================================================= */}
          {/* RIGHT MAIN AREA: ACTIVE SCENARIO WORKSPACE                                */}
          {/* ========================================================================= */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              backgroundColor: '#111116',
              border: `1px solid ${colorTokens.bg.border}`,
              minWidth: 0,
            }}
          >
            {/* Scenario Header: Metadata Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center" mb={1.2}>
              <Chip
                label={`Domain: ${activeScenario.domain.toUpperCase()}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              />
              <Chip
                label={`Scale Archetype: ${activeScenario.scaleArchetype === 'marketplace_hyperscale' ? 'Hyperscale Marketplace' : 'Enterprise D2C'}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor:
                    activeScenario.scaleArchetype === 'marketplace_hyperscale'
                      ? 'rgba(244, 63, 94, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                  color:
                    activeScenario.scaleArchetype === 'marketplace_hyperscale'
                      ? '#fb7185'
                      : '#34d399',
                  border: `1px solid ${
                    activeScenario.scaleArchetype === 'marketplace_hyperscale'
                      ? 'rgba(244, 63, 94, 0.25)'
                      : 'rgba(16, 185, 129, 0.25)'
                  }`,
                }}
              />
              <Chip
                label={`Capability: ${activeScenario.businessCapability.replace(/_/g, ' ').toUpperCase()}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  color: '#71717a',
                  ml: 0.5,
                }}
              >
                ID: {activeScenario.id}
              </Typography>
            </Stack>

            {/* Scenario Title & Tagline */}
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.8 }}>
              {activeScenario.title}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#c084fc', fontWeight: 600, fontSize: '0.88rem', mb: 1.2 }}>
              {activeScenario.tagline}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.65, mb: 2, maxWidth: 960 }}
            >
              {activeScenario.description}
            </Typography>

            {/* Design Patterns Combined */}
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap alignItems="center" mb={2.5}>
              <Typography
                variant="caption"
                sx={{ color: '#71717a', fontWeight: 700, textTransform: 'uppercase', mr: 0.5, fontSize: '0.7rem' }}
              >
                Patterns Combined:
              </Typography>
              {activeScenario.patternsUsed.map(pat => (
                <Chip
                  key={pat.name}
                  label={pat.name}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#e4e4e7',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </Stack>

            {/* Educational View Tabs (Full Width) */}
            <Box sx={{ borderBottom: `1px solid ${colorTokens.bg.border}`, mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': { backgroundColor: '#8b5cf6', height: 3 },
                }}
              >
                <Tab
                  value="context"
                  label={
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <BookOpen size={16} />
                      <span>Architecture & Concepts</span>
                    </Stack>
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: colorTokens.text.secondary,
                    '&.Mui-selected': { color: '#ffffff' },
                  }}
                />
                <Tab
                  value="flow"
                  label={
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Activity size={16} />
                      <span>Interactive Topology Flow</span>
                    </Stack>
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: colorTokens.text.secondary,
                    '&.Mui-selected': { color: '#ffffff' },
                  }}
                />
                <Tab
                  value="structure"
                  label={
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <FolderTree size={16} />
                      <span>Package & Layer Structure</span>
                    </Stack>
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: colorTokens.text.secondary,
                    '&.Mui-selected': { color: '#ffffff' },
                  }}
                />
                <Tab
                  value="docker"
                  label={
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Terminal size={16} />
                      <span>Local Verification & Docker</span>
                    </Stack>
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: colorTokens.text.secondary,
                    '&.Mui-selected': { color: '#ffffff' },
                  }}
                />
              </Tabs>
            </Box>

            {/* Tab Workspace Panels */}
            {activeTab === 'context' && (
              <ScenarioArchitectureContext scenario={activeScenario} />
            )}

            {activeTab === 'flow' && (
              <ScenarioTopologyFlow
                scenario={activeScenario}
                onSelectNode={node => setInspectedNode(node)}
              />
            )}

            {activeTab === 'structure' && <ScenarioFolderStructure scenario={activeScenario} />}

            {activeTab === 'docker' && <DockerRunGuide scenario={activeScenario} />}

            {/* Slide-out Node Inspector Drawer */}
            <NodeInspectorDrawer
              node={inspectedNode}
              open={Boolean(inspectedNode)}
              onClose={() => setInspectedNode(null)}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
