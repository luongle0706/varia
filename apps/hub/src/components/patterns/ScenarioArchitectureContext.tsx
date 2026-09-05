import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Link,
} from '@mui/material';
import {
  Compass,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Layers,
} from 'lucide-react';
import type { ScenarioManifest, PatternReference } from '@varia/core';
import { colorTokens } from '@varia/ui';

interface ScenarioArchitectureContextProps {
  scenario: ScenarioManifest;
}

export const ScenarioArchitectureContext: React.FC<ScenarioArchitectureContextProps> = ({
  scenario,
}) => {
  const spec = scenario.contextSpec;

  if (!spec) {
    return (
      <Box sx={{ p: 3, color: colorTokens.text.secondary }}>
        No architecture specification provided for this scenario.
      </Box>
    );
  }

  // Helper to find guru link for pattern if present
  const findPatternMeta = (patternName: string): PatternReference | undefined => {
    return scenario.patternsUsed.find(
      p =>
        p.name.toLowerCase() === patternName.toLowerCase() ||
        patternName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(patternName.toLowerCase())
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. INTENT (Guru Section 1) */}
      {spec.intent && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2.5,
            backgroundColor: '#121218',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(18, 18, 24, 0.6) 100%)',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
            <Compass size={18} color="#a78bfa" />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#a78bfa',
              }}
            >
              Intent
            </Typography>
          </Stack>

          <Typography
            variant="body1"
            sx={{
              color: '#ffffff',
              fontWeight: 500,
              lineHeight: 1.65,
              fontSize: '1rem',
            }}
          >
            {spec.intent}
          </Typography>
        </Box>
      )}

      {/* 2. THE PROBLEM (Guru Section 2) */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2.5,
          backgroundColor: '#111116',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
          <HelpCircle size={18} color="#f43f5e" />
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              color: '#f43f5e',
            }}
          >
            The Problem
          </Typography>
        </Stack>

        {/* Narrative Story */}
        {spec.problemStory ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {spec.problemStory.split('\n\n').map((para, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{ color: '#d4d4d8', lineHeight: 1.75, fontSize: '0.92rem' }}
              >
                {para}
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: '#d4d4d8', lineHeight: 1.75, fontSize: '0.92rem' }}
          >
            {spec.businessProblem}
          </Typography>
        )}

        {/* Failure Mode in Traditional Code Callout */}
        {spec.realWorldScenario && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(244, 63, 94, 0.05)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              mt: 2.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#fb7185',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                mb: 0.6,
              }}
            >
              Where Traditional Code Breaks Down:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#fca5a5', lineHeight: 1.65, fontSize: '0.86rem' }}
            >
              {spec.realWorldScenario}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 3. REAL-WORLD ANALOGY (Guru Section 3) */}
      {spec.realWorldAnalogy && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2.5,
            backgroundColor: '#131210',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, rgba(19, 18, 16, 0.6) 100%)',
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" mb={1.2}>
            <Lightbulb size={18} color="#f59e0b" />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#f59e0b',
              }}
            >
              Real-World Analogy
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: '#fef3c7',
              lineHeight: 1.75,
              fontSize: '0.92rem',
              fontStyle: 'normal',
            }}
          >
            {spec.realWorldAnalogy}
          </Typography>
        </Box>
      )}

      {/* 4. THE SOLUTION (Guru Section 4) */}
      {spec.solutionOverview && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2.5,
            backgroundColor: '#111116',
            border: `1px solid ${colorTokens.bg.border}`,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center" mb={1.5}>
            <CheckCircle2 size={18} color="#10b981" />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#10b981',
              }}
            >
              The Architectural Solution
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: '#d4d4d8', lineHeight: 1.75, fontSize: '0.92rem' }}
          >
            {spec.solutionOverview}
          </Typography>
        </Box>
      )}

      {/* 5. HOW THE PATTERNS WORK TOGETHER (Guru Section 5) */}
      <Box
        sx={{
          p: 3,
          borderRadius: 2.5,
          backgroundColor: '#111116',
          border: `1px solid ${colorTokens.bg.border}`,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
          <Layers size={18} color="#8b5cf6" />
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 800,
              color: '#8b5cf6',
            }}
          >
            How the Design Patterns Combine
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: colorTokens.text.secondary, mb: 2.5, fontSize: '0.86rem' }}>
          In complex enterprise systems, a single design pattern rarely solves the entire problem alone. Here is how each pattern takes on a specific role:
        </Typography>

        <Stack spacing={2.5}>
          {spec.architecturalDecisions.map((dec, idx) => {
            const patternMeta = findPatternMeta(dec.pattern);

            // Parse rejected alternative vs selected approach
            const hasComparison = dec.whyChosenOverAlternatives.includes('Alternative Rejected:');
            let rejectedText = '';
            let selectedText = '';

            if (hasComparison) {
              const parts = dec.whyChosenOverAlternatives.split('Selected Approach:');
              const altPart = parts[0] ? parts[0].replace('Alternative Rejected:', '').trim() : '';
              rejectedText = altPart;
              selectedText = parts[1] ? parts[1].trim() : '';
            }

            return (
              <Box
                key={idx}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                {/* Pattern Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                  mb={1.5}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.98rem' }}
                  >
                    {dec.decision}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={dec.pattern}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#c084fc',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    />
                    {patternMeta?.guruUrl && (
                      <Link
                        href={patternMeta.guruUrl}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.72rem',
                          color: '#38bdf8',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <span>Guru Docs</span>
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </Stack>
                </Stack>

                {/* Specific Problem It Solves */}
                <Box mb={2}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#71717a', fontWeight: 700, textTransform: 'uppercase', mr: 1 }}
                  >
                    Specific Challenge:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: '#e4e4e7', fontSize: '0.88rem' }}
                  >
                    {dec.problemSolved}
                  </Typography>
                </Box>

                {/* Why Chosen over Alternatives */}
                {hasComparison ? (
                  <Stack spacing={1.2}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid rgba(239, 68, 68, 0.18)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.2,
                      }}
                    >
                      <XCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 3 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#f87171',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'block',
                            mb: 0.2,
                          }}
                        >
                          Why Not the Naive Alternative?
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#fca5a5', fontSize: '0.84rem', lineHeight: 1.6 }}
                        >
                          {rejectedText}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(16, 185, 129, 0.04)',
                        border: '1px solid rgba(16, 185, 129, 0.18)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.2,
                      }}
                    >
                      <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 3 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#34d399',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'block',
                            mb: 0.2,
                          }}
                        >
                          How This Pattern Resolves It:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#a7f3d0', fontSize: '0.84rem', lineHeight: 1.6 }}
                        >
                          {selectedText}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 1.5,
                      backgroundColor: '#0a0a0e',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.6 }}
                    >
                      {dec.whyChosenOverAlternatives}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* 6. APPLICABILITY (Guru Section 6) */}
      {spec.applicability && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          {/* When to Use */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              backgroundColor: '#111116',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <CheckCircle2 size={18} color="#38bdf8" />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Applicability (When to Use)
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 2 }}>
              Apply this architectural combination when:
            </Typography>

            <Stack spacing={1.5}>
              {spec.applicability.whenToUse.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                  <CheckCircle2 size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: 4 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#d4d4d8', fontSize: '0.86rem', lineHeight: 1.6 }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* When NOT to Use (Avoid / Overkill) */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2.5,
              backgroundColor: '#111116',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <ShieldAlert size={18} color="#fb7185" />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                When NOT to Use (Overkill)
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 2 }}>
              Do not use this architecture if:
            </Typography>

            <Stack spacing={1.5}>
              {spec.applicability.whenNotToUse.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                  <XCircle size={14} color="#fb7185" style={{ flexShrink: 0, marginTop: 4 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#d4d4d8', fontSize: '0.86rem', lineHeight: 1.6 }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* 7. PROS AND CONS (Guru Section 7) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Pros */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2.5,
            backgroundColor: '#111116',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <ThumbsUp size={18} color="#10b981" />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Pros (Advantages)
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            {spec.tradeOffs.pros.map((pro, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                <Typography
                  variant="body2"
                  sx={{ color: '#d4d4d8', fontSize: '0.86rem', lineHeight: 1.6 }}
                >
                  {pro}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Cons */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2.5,
            backgroundColor: '#111116',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <ThumbsDown size={18} color="#ef4444" />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Cons (Disadvantages)
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            {spec.tradeOffs.cons.map((con, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <XCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 4 }} />
                <Typography
                  variant="body2"
                  sx={{ color: '#d4d4d8', fontSize: '0.86rem', lineHeight: 1.6 }}
                >
                  {con}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
