import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box } from '@mui/material';
import PropertyTable from './components/PropertyTable';
import FloatingHousesBackground from './components/FloatingHousesBackground';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a5fb4', // Azul más oscuro
      light: '#3584e4',
      dark: '#0d52bf',
    },
    secondary: {
      main: '#26a269', // Verde más oscuro
      light: '#33d17a',
      dark: '#1f7a4a',
    },
    background: {
      default: '#f6f5f4', // Gris muy claro
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1b1f', // Casi negro
      secondary: '#4e4e4e', // Gris oscuro
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f6f5f4',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FloatingHousesBackground />
      <Container maxWidth="xl">
        <Box sx={{ 
          my: 6,
          position: 'relative',
          zIndex: 1,
        }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom
            sx={{
              color: '#7c3aed',
              textAlign: 'center',
              fontWeight: 700,
              mb: 4,
            }}
          >
            Buscador de Propiedades
          </Typography>
          <PropertyTable />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 