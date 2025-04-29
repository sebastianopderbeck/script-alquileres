import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box } from '@mui/material';
import PropertyTable from './components/PropertyTable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4a90e2', // Azul suave
      light: '#6ba7e8',
      dark: '#3574b0',
    },
    secondary: {
      main: '#50c878', // Verde suave
      light: '#73d394',
      dark: '#3a8c56',
    },
    background: {
      default: '#f8fafc', // Gris muy claro
      paper: '#ffffff', // Blanco
    },
    text: {
      primary: '#1a202c', // Casi negro
      secondary: '#4a5568', // Gris oscuro
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
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#f8fafc',
          },
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              color: 'primary.main',
              textAlign: 'center',
              fontWeight: 600,
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
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