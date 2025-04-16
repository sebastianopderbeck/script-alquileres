import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { fetchProperties, checkServerConnection } from './store/propertiesSlice';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import PropertyTable from './components/PropertyTable';
import BrickLoader from './components/BrickLoader';
import './App.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { argenProp, zonaProp, loading, error, serverStatus } = useSelector(
    (state: RootState) => state.properties
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: {
            main: '#6366f1',
          },
          secondary: {
            main: '#8b5cf6',
          },
          background: {
            default: '#f8fafc',
            paper: '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              },
              contained: {
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
          },
        },
      }),
    [],
  );

  useEffect(() => {
    console.log('App mounted, checking server connection...');
    const checkConnection = async () => {
      try {
        const result = await dispatch(checkServerConnection()).unwrap();
        console.log('Server connection result:', result);
        if (serverStatus === 'connected') {
          console.log('Server connected, fetching properties...');
          await dispatch(fetchProperties()).unwrap();
        }
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    };
    checkConnection();
  }, [dispatch]);

  const handleRefresh = async () => {
    try {
      await dispatch(fetchProperties()).unwrap();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const renderContent = () => {
    if (serverStatus === 'error') {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 30%, rgba(139, 92, 246, 0.1) 90%)' }}>
          <Typography variant="h4" gutterBottom color="error">
            Error de conexión
          </Typography>
          <Typography paragraph>
            No se pudo conectar con el servidor. Por favor, verifica que el servidor esté ejecutándose.
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(checkServerConnection())}
            startIcon={<Refresh />}
          >
            Reintentar conexión
          </Button>
        </Paper>
      );
    }

    if (loading) {
      return <BrickLoader />;
    }

    if (error) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 30%, rgba(139, 92, 246, 0.1) 90%)' }}>
          <Typography variant="h4" gutterBottom color="error">
            Error
          </Typography>
          <Typography paragraph>{error}</Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Reintentar
          </Button>
        </Paper>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1">
            Script Alquileres
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Actualizar
          </Button>
        </Box>
        <PropertyTable properties={argenProp} source="ArgenProp" />
        <PropertyTable properties={zonaProp} source="ZonaProp" />
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          minHeight: '100vh',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 