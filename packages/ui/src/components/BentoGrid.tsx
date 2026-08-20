import React, { type ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';

export interface BentoGridProps extends BoxProps {
  children: ReactNode;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 3 },
  sx,
  ...props
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs ?? 1}, 1fr)`,
          sm: `repeat(${columns.sm ?? 2}, 1fr)`,
          md: `repeat(${columns.md ?? 3}, 1fr)`,
          lg: `repeat(${columns.lg ?? 3}, 1fr)`,
        },
        gap: 2.5,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
