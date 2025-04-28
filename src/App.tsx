import React from 'react';
import { Container, Typography, Box, ThemeProvider, createTheme } from '@mui/material';
import PropertyTable from './components/PropertyTable';

// Crear un tema personalizado con colores claros
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2', // Azul suave
    },
    secondary: {
      main: '#50c878', // Verde suave
    },
    background: {
      default: '#f5f7fa', // Gris muy claro
      paper: '#ffffff', // Blanco
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4
      }}>
        <Container maxWidth="xl">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Buscador de Propiedades
          </Typography>
          <PropertyTable />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 