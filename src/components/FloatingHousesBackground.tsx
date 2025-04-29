import React from 'react';
import { Box, keyframes } from '@mui/material';

const moveGrid = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
`;

const FloatingHousesBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f6f5f4 0%, #ffffff 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
            linear-gradient(0deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px),
            linear-gradient(0deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px, 40px 40px, 40px 40px',
          animation: `${moveGrid} 20s linear infinite`,
          opacity: 0.5,
          zIndex: 1,
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(90deg, rgba(38, 162, 105, 0.3) 2px, transparent 2px),
            linear-gradient(0deg, rgba(38, 162, 105, 0.3) 2px, transparent 2px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
            linear-gradient(0deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '160px 160px, 160px 160px, 80px 80px, 80px 80px',
          animation: `${moveGrid} 30s linear infinite reverse`,
          opacity: 0.3,
          zIndex: 1,
          }
        }}
      />
  );
};

export default FloatingHousesBackground; 