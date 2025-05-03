import React, { useState, useEffect } from 'react';
import { Box, keyframes } from '@mui/material';

const moveGrid = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
`;

const float = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(5deg);
  }
  50% {
    transform: translate(0, -20px) rotate(0deg);
  }
  75% {
    transform: translate(-10px, -10px) rotate(-5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
`;

interface Square {
  id: number;
  size: number;
  left: number;
  top: number;
  color: string;
  animationDuration: number;
  rotation: number;
}

const FloatingHousesBackground: React.FC = () => {
  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    const generateRandomSquares = () => {
      const newSquares: Square[] = [];
      const colors = [
        'rgba(99, 102, 241, 0.2)',
        'rgba(249, 115, 22, 0.2)',
        'rgba(38, 162, 105, 0.2)'
      ];

      for (let i = 0; i < 15; i++) {
        // Distribución más dispersa usando seno y coseno con diferentes frecuencias
        const angle = (i / 15) * Math.PI * 2;
        const radius = 30 + Math.random() * 20; // Radio en porcentaje
        const startX = Math.cos(angle * 1.5) * radius;
        const startY = Math.sin(angle * 2) * radius;
        
        newSquares.push({
          id: i,
          size: Math.floor(Math.random() * 30) + 20, // 20-50px
          left: 50 + startX, // Centrado en 50% + offset
          top: 50 + startY, // Centrado en 50% + offset
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDuration: Math.random() * 15 + 10, // 10-25s
          rotation: Math.random() * 360 // 0-360 degrees
        });
      }

      setSquares(newSquares);
    };

    generateRandomSquares();
  }, []);

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
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px',
          animation: `${moveGrid} 40s linear infinite`,
          opacity: 0.3,
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
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 2px, transparent 2px),
            linear-gradient(0deg, rgba(0, 0, 0, 0.1) 2px, transparent 2px)
          `,
          backgroundSize: '160px 160px, 160px 160px',
          animation: `${moveGrid} 60s linear infinite reverse`,
          opacity: 0.2,
          zIndex: 1,
        }
      }}
    >
      {squares.map((square) => (
        <Box
          key={square.id}
          sx={{
            position: 'absolute',
            width: `${square.size}px`,
            height: `${square.size}px`,
            backgroundColor: square.color,
            borderRadius: '8px',
            animation: `${float} ${square.animationDuration}s ease-in-out infinite`,
            left: `${square.left}%`,
            top: `${square.top}%`,
            zIndex: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transform: `rotate(${square.rotation}deg)`,
            opacity: 0.8,
          }}
        />
      ))}
    </Box>
  );
};

export default FloatingHousesBackground; 