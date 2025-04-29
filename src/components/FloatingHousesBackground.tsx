import React from 'react';
import { Box, keyframes } from '@mui/material';

const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
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
        backgroundColor: 'background.default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(245,247,250,0.8) 0%, rgba(255,255,255,0.9) 100%)',
          zIndex: 1,
        }
      }}
    >
      {/* Casa 1 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          animation: `${float} 6s ease-in-out infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%234a90e2\' d=\'M50 0L0 50h100z\'/%3E%3Crect fill=\'%23ffffff\' x=\'20\' y=\'50\' width=\'60\' height=\'50\'/%3E%3Crect fill=\'%2350c878\' x=\'40\' y=\'70\' width=\'20\' height=\'30\'/%3E%3C/svg%3E")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }
        }}
      />

      {/* Casa 2 */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '120px',
          height: '120px',
          animation: `${float} 8s ease-in-out infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%2350c878\' d=\'M50 0L0 50h100z\'/%3E%3Crect fill=\'%23ffffff\' x=\'20\' y=\'50\' width=\'60\' height=\'50\'/%3E%3Crect fill=\'%234a90e2\' x=\'40\' y=\'70\' width=\'20\' height=\'30\'/%3E%3C/svg%3E")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }
        }}
      />

      {/* Casa 3 */}
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: '80px',
          height: '80px',
          animation: `${float} 7s ease-in-out infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%234a90e2\' d=\'M50 0L0 50h100z\'/%3E%3Crect fill=\'%23ffffff\' x=\'20\' y=\'50\' width=\'60\' height=\'50\'/%3E%3Crect fill=\'%2350c878\' x=\'40\' y=\'70\' width=\'20\' height=\'30\'/%3E%3C/svg%3E")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }
        }}
      />

      {/* Casa 4 */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '20%',
          width: '90px',
          height: '90px',
          animation: `${float} 9s ease-in-out infinite`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%2350c878\' d=\'M50 0L0 50h100z\'/%3E%3Crect fill=\'%23ffffff\' x=\'20\' y=\'50\' width=\'60\' height=\'50\'/%3E%3Crect fill=\'%234a90e2\' x=\'40\' y=\'70\' width=\'20\' height=\'30\'/%3E%3C/svg%3E")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          }
        }}
      />
    </Box>
  );
};

export default FloatingHousesBackground; 