import React from 'react';
import { Box, keyframes } from '@mui/material';

const converge = keyframes`
  0% {
    transform: translate(var(--startX), var(--startY)) rotate(var(--startRotation));
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--endX), var(--endY)) rotate(0deg);
    opacity: 1;
  }
`;

const colors = [
  'rgba(99, 102, 241, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(38, 162, 105, 0.8)'
];

const generateSquarePositions = () => {
  const positions = [];
  const centerX = 0;
  const centerY = 0;
  const radius = 200; // Radio de la distribución inicial
  const numSquares = 16; // 4x4 grid

  for (let i = 0; i < numSquares; i++) {
    const angle = (i / numSquares) * Math.PI * 2;
    const startX = Math.cos(angle) * radius;
    const startY = Math.sin(angle) * radius;
    
    // Posición final en el grid 4x4
    const gridX = (i % 4) * 50 - 75; // -75 para centrar el grid
    const gridY = Math.floor(i / 4) * 50 - 75;

    positions.push({
      startX,
      startY,
      endX: gridX,
      endY: gridY,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: i * 0.1
    });
  }

  return positions;
};

const BrickLoader: React.FC = () => {
  const squares = generateSquarePositions();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      {squares.map((square, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            backgroundColor: square.color,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            '--startX': `${square.startX}px`,
            '--startY': `${square.startY}px`,
            '--endX': `${square.endX}px`,
            '--endY': `${square.endY}px`,
            '--startRotation': `${square.rotation}deg`,
            animation: `${converge} 1s ease-out ${square.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </Box>
  );
};

export default BrickLoader; 