import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  FileCode,
  Layers,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { ScenarioManifest, FolderExplanationNode } from '@varia/core';
import { colorTokens } from '@varia/ui';

interface ScenarioFolderStructureProps {
  scenario: ScenarioManifest;
}

const DEFAULT_FOLDERS: FolderExplanationNode[] = [
  {
    path: 'src/main/java/.../domain',
    name: 'domain',
    layer: 'domain',
    purpose: 'Core Business Entities, State Machines & Hexagonal Invariants',
    description:
      'Pure, side-effect-free Java 21 records and sealed interfaces. Contains zero framework dependencies (no Spring, no Hibernate, no Kafka). All domain state transitions, calculations, and invariants are self-contained here.',
    patternTags: ['#State', '#Strategy', '#AbstractFactory'],
    keyFiles: [
      'OrderState.java — Sealed interface modeling valid lifecycle transitions (Draft -> Paid -> Shipped)',
      'Order.java — Aggregate root enforcing stock claim and order validation rules',
      'DiscountStrategy.java — Strategy pattern interface for promotional discounts',
    ],
  },
  {
    path: 'src/main/java/.../application',
    name: 'application',
    layer: 'application',
    purpose: 'Use Cases, Command Handlers & Distributed Sagas',
    description:
      'Orchestrates domain objects to satisfy application workflows. Coordinates Sagas, manages transaction boundaries, and delegates to outbound ports without coupling to specific databases or message brokers.',
    patternTags: ['#Saga', '#Command'],
    keyFiles: [
      'OrderSagaOrchestrator.java — Coordinates multi-step asynchronous saga state and compensating actions',
      'SubmitOrderUseCase.java — Application service handling the checkout command pipeline',
    ],
  },
  {
    path: 'src/main/java/.../infrastructure/ports',
    name: 'infrastructure/ports',
    layer: 'infrastructure',
    purpose: 'Inbound & Outbound Hexagonal Contracts',
    description:
      'Defines the interfaces that the application core requires from the outside world (e.g. PaymentGatewayPort, InventoryStorePort, EventPublisherPort).',
    patternTags: ['#Adapter'],
    keyFiles: [
      'PaymentGatewayPort.java — Decoupled interface implemented by third-party bank adapters',
      'OutboxRepositoryPort.java — Contract for reliable domain event persistence',
    ],
  },
  {
    path: 'src/main/java/.../infrastructure/adapters',
    name: 'infrastructure/adapters',
    layer: 'infrastructure',
    purpose: 'Framework Implementations (Spring Boot, Redis, Kafka, WireMock)',
    description:
      'The actual implementations of the ports. Houses HTTP controllers, Spring Data JPA repositories, Redis Lua scripts, Kafka producers/consumers, and WireMock stubs.',
    patternTags: ['#ChainOfResponsibility', '#TransactionalOutbox', '#Adapter'],
    keyFiles: [
      'OrderInspectionChain.java — Chain of Responsibility checking anti-bot tokens and user quotas',
      'RedisInventoryClaimAdapter.java — Sub-millisecond atomic token bucket stock claim via Lua',
      'PostgresOutboxStore.java — Transactional Outbox pattern writer preventing dual-write bugs',
    ],
  },
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml & configs',
    layer: 'configuration',
    purpose: 'Local Multi-Service Topology & Infrastructure Mocks',
    description:
      'Defines the complete local runtime: PostgreSQL 16 with automated Flyway/Liquibase schema migrations, Redis 7 Alpine, Kafka broker, and WireMock external banking stubs.',
    keyFiles: [
      'docker-compose.yml — Multi-container services declaration',
      'application.yml — Declarative configuration profiles',
      'build.gradle — Java 21 toolchain and Gradle dependency graph',
    ],
  },
  {
    path: 'src/test/java',
    name: 'src/test',
    layer: 'tests',
    purpose: 'Unit, Architecture & Testcontainers Integration Suites',
    description:
      'Verifies architecture rules (e.g. ArchUnit ensuring domain never imports infrastructure) and validates multi-pattern interactions using real Testcontainers instances.',
    keyFiles: [
      'OrderSagaIntegrationTest.java — Tests end-to-end saga recovery under simulated bank failure',
      'ArchitectureRulesTest.java — ArchUnit tests enforcing Clean/Hexagonal boundaries',
    ],
  },
];

export const ScenarioFolderStructure: React.FC<ScenarioFolderStructureProps> = ({ scenario }) => {
  const folders = scenario.folderStructure && scenario.folderStructure.length > 0
    ? scenario.folderStructure
    : DEFAULT_FOLDERS;

  const [selectedPath, setSelectedPath] = useState<string>(folders[0]?.path ?? '');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (folders.length > 0 && folders[0]) {
      setSelectedPath(folders[0].path);
    }
  }, [scenario.id, folders]);

  const activeFolder = folders.find(f => f.path === selectedPath) || folders[0];

  const handleCopyCli = (path: string) => {
    const cmd = `code practices/java21/${scenario.id}/${path}`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'domain':
        return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'application':
        return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' };
      case 'infrastructure':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'configuration':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'tests':
        return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.3)' };
      default:
        return { color: '#a1a1aa', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  if (!activeFolder) return null;
  const layerMeta = getLayerColor(activeFolder.layer);

  return (
    <Box>
      {/* IDE Explorer Tip Banner */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          backgroundColor: 'rgba(24, 24, 27, 0.5)',
          border: `1px solid ${colorTokens.bg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Terminal size={18} color="#38bdf8" />
          <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
            <b>Inspect in IDE:</b> You can open the full codebase in your local IDE (IntelliJ, VS Code).
            Use this interactive map to understand the architectural layer boundaries and where each pattern lives.
          </Typography>
        </Stack>

        <Button
          size="small"
          onClick={() => handleCopyCli(activeFolder.path)}
          startIcon={copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          sx={{
            color: '#38bdf8',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            textTransform: 'none',
            fontSize: '0.78rem',
            fontFamily: "'JetBrains Mono', monospace",
            '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.18)' },
          }}
        >
          {copied ? 'Copied IDE command' : `code practices/java21/${scenario.id}`}
        </Button>
      </Box>

      {/* Two-Column Explorer Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)', md: '270px minmax(0, 1fr)' },
          gap: 2.5,
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `1px solid ${colorTokens.bg.border}`,
          backgroundColor: '#0a0a0f',
        }}
      >
        {/* Left: Package Directory Tree */}
        <Box
          sx={{
            p: 2,
            borderRight: { md: `1px solid ${colorTokens.bg.border}` },
            borderBottom: { xs: `1px solid ${colorTokens.bg.border}`, md: 'none' },
            backgroundColor: 'rgba(24, 24, 27, 0.35)',
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: colorTokens.text.secondary,
              display: 'block',
              mb: 1.5,
            }}
          >
            Architecture Package Tree
          </Typography>

          <Stack spacing={1}>
            {folders.map(folder => {
              const isSelected = folder.path === activeFolder.path;
              const meta = getLayerColor(folder.layer);

              return (
                <Box
                  key={folder.path}
                  onClick={() => setSelectedPath(folder.path)}
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.14)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(139, 92, 246, 0.4)' : 'transparent'}`,
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? 'rgba(139, 92, 246, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={0.6}
                    mb={0.5}
                  >
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                      sx={{ minWidth: 0, flex: '1 1 140px' }}
                    >
                      {isSelected ? (
                        <FolderOpen size={15} color="#8b5cf6" style={{ flexShrink: 0 }} />
                      ) : (
                        <Folder size={15} color="#a1a1aa" style={{ flexShrink: 0 }} />
                      )}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#ffffff' : '#d4d4d8',
                          fontSize: '0.78rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          wordBreak: 'break-all',
                        }}
                      >
                        {folder.name}
                      </Typography>
                    </Stack>

                    <Chip
                      label={folder.layer}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        backgroundColor: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="caption"
                    sx={{ color: '#71717a', fontSize: '0.72rem', display: 'block', pl: 2.8 }}
                  >
                    {folder.purpose}
                  </Typography>

                  {folder.patternTags && folder.patternTags.length > 0 && (
                    <Stack direction="row" spacing={0.6} mt={0.8} pl={2.8} flexWrap="wrap">
                      {folder.patternTags.map(tag => (
                        <Typography
                          key={tag}
                          variant="caption"
                          sx={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 600 }}
                        >
                          {tag}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Right: Detailed Package Blueprint */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
            mb={2.5}
            pb={2}
            borderBottom={`1px solid ${colorTokens.bg.border}`}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                <Layers size={18} color={layerMeta.color} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  {activeFolder.name}
                </Typography>
                <Chip
                  label={`${activeFolder.layer.toUpperCase()} LAYER`}
                  size="small"
                  sx={{
                    backgroundColor: layerMeta.bg,
                    color: layerMeta.color,
                    border: `1px solid ${layerMeta.border}`,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8' }}
              >
                {activeFolder.path}
              </Typography>
            </Box>

            <Tooltip title="Copy path to clipboard">
              <IconButton
                onClick={() => handleCopyCli(activeFolder.path)}
                sx={{
                  color: colorTokens.text.secondary,
                  border: `1px solid ${colorTokens.bg.border}`,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Architectural Responsibility */}
          <Box mb={3}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: layerMeta.color,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 1,
              }}
            >
              <CheckCircle2 size={14} /> Architectural Responsibility & Invariants
            </Typography>
            <Typography variant="body2" sx={{ color: '#e4e4e7', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {activeFolder.description}
            </Typography>
          </Box>

          {/* Patterns Implemented in this Package */}
          {activeFolder.patternTags && activeFolder.patternTags.length > 0 && (
            <Box mb={3}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  mb: 1,
                }}
              >
                <Sparkles size={14} /> Design Patterns Encapsulated Here
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {activeFolder.patternTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    sx={{
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      color: '#c084fc',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Key Classes and Files */}
          {activeFolder.keyFiles && activeFolder.keyFiles.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  mb: 1.5,
                }}
              >
                <FileCode size={14} /> Key Classes & Artifacts in this Package
              </Typography>
              <Stack spacing={1.2}>
                {activeFolder.keyFiles.map((kf, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${colorTokens.bg.border}`,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5,
                    }}
                  >
                    • {kf}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
