import React from 'react';
import { Box, keyframes } from '@mui/material';

const fall = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
`;

const brickStyle = {
  width: '40px',
  height: '20px',
  backgroundColor: 'rgba(99, 102, 241, 0.8)',
  margin: '2px',
  borderRadius: '4px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: 'rgba(99, 102, 241, 0.6)',
    transform: 'translateY(-50%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '50%',
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: 'rgba(99, 102, 241, 0.6)',
    transform: 'translateX(-50%)',
  }
};

const BrickLoader: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Primera fila */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.1s forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.2s forwards` }} />
        </Box>
        {/* Segunda fila */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.3s forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.4s forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.5s forwards` }} />
        </Box>
        {/* Tercera fila */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.6s forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.7s forwards` }} />
          <Box sx={{ ...brickStyle, animation: `${fall} 0.5s ease-out 0.8s forwards` }} />
        </Box>
      </Box>
    </Box>
  );
};

export default BrickLoader; 