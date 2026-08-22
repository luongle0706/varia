import React, { type ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';
import { colorTokens } from '../theme/tokens';

export interface GlassCardProps extends BoxProps {
  children: ReactNode;
  glowOnHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowOnHover = false,
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        backgroundColor: colorTokens.bg.glass,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colorTokens.bg.border}`,
        borderRadius: 3,
        p: 2.5,
        transform: 'translateZ(0)',
        transition:
          'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease',
        willChange: glowOnHover ? 'transform, box-shadow' : 'auto',
        ...(glowOnHover && {
          '&:hover': {
            borderColor: colorTokens.bg.borderHover,
            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.12)',
            transform: 'translateY(-2px)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
