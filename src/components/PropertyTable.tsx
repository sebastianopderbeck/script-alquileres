import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Box,
  Chip,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import BrickLoader from './BrickLoader';
import PropertyFilter from './PropertyFilter';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Property {
  price: number;
  expensas: number;
  total: number;
  rooms: number;
  m2: number;
  location: string;
  permalink: string;
  id: string;
  title: string;
  source: string;
}

type Order = 'asc' | 'desc';

function PropertyTable() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<keyof Property>('total');
  const [order, setOrder] = useState<Order>('asc');
  const [filter, setFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3002/api/properties');
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        setProperties(data);
        setLoading(false);
        
        // Simular un tiempo mínimo de carga inicial
        setTimeout(() => {
          setInitialLoading(false);
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestSort = (property: keyof Property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = properties;
    
    if (filter) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(property => 
        property.source.toLowerCase() === sourceFilter.toLowerCase()
      );
    }

    return [...filtered].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      return order === 'asc' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [properties, filter, sourceFilter, order, orderBy]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/api/search');
      if (!response.ok) {
        throw new Error('Error al recargar las propiedades');
      }
      // Mostrar el loader por 6 segundos
      await new Promise(resolve => setTimeout(resolve, 6000));
    } catch (error) {
      console.error('Error al recargar:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (initialLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          minWidth: '100%',
        }}
      >
        <BrickLoader />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      position: 'relative',
      marginTop: '20px'
    }}>
      {isRefreshing && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 2,
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <BrickLoader />
          </Box>
        </>
      )}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '90vw',
        maxWidth: '1600px',
        backgroundColor: 'background.paper',
        p: 2,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ 
              width: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
              '& .MuiInputLabel-root': {
                color: '#3f0e6e',
              }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#3f0e6e' }}>Fuente</InputLabel>
            <Select
              value={sourceFilter}
              label="Fuente"
              onChange={(e) => setSourceFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="zonaProp">ZonaProp</MenuItem>
              <MenuItem value="argenProp">ArgenProp</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#3f0e6e' }}>Ordenar por</InputLabel>
            <Select
              value={orderBy}
              label="Ordenar por"
              onChange={(e) => setOrderBy(e.target.value as keyof Property)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="price">Precio</MenuItem>
              <MenuItem value="expensas">Expensas</MenuItem>
              <MenuItem value="total">Total</MenuItem>
              <MenuItem value="rooms">Ambientes</MenuItem>
              <MenuItem value="m2">Metros cuadrados</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Tooltip title="Recargar propiedades">
          <IconButton 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            sx={{ 
              color: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(124, 58, 237, 0.2)'
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '90vw',
          maxWidth: '1600px',
          overflowX: 'auto',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                align="right" 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('m2')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'm2'}
                  direction={orderBy === 'm2' ? order : 'asc'}
                >
                  m²
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('rooms')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'rooms'}
                  direction={orderBy === 'rooms' ? order : 'asc'}
                >
                  Ambientes
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('price')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                >
                  Precio
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('expensas')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'expensas'}
                  direction={orderBy === 'expensas' ? order : 'asc'}
                >
                  Expensas
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('total')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'total'}
                  direction={orderBy === 'total' ? order : 'asc'}
                >
                  Total
                </TableSortLabel>
              </TableCell>
              <TableCell 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('location')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'location'}
                  direction={orderBy === 'location' ? order : 'asc'}
                >
                  Ubicación
                </TableSortLabel>
              </TableCell>
              <TableCell 
                sx={{ color: '#3f0e6e', fontWeight: 600 }}
                onClick={() => handleRequestSort('source')}
                style={{ cursor: 'pointer' }}
              >
                <TableSortLabel
                  active={orderBy === 'source'}
                  direction={orderBy === 'source' ? order : 'asc'}
                >
                  Fuente
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#3f0e6e', fontWeight: 600 }}>
                Link
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedProperties.map((property, index) => (
              <TableRow 
                key={`${property.id}-${index}`}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'rgba(189, 145, 217, 0.1)' : 'rgba(196, 196, 196, 0.1)',
                  '&:hover': {
                    backgroundColor: index % 2 === 0 ? 'rgba(189, 145, 217, 0.2)' : 'rgba(196, 196, 196, 0.2)'
                  }
                }}
              >
                <TableCell align="right">{property.m2}</TableCell>
                <TableCell align="right">{property.rooms}</TableCell>
                <TableCell align="right">{formatCurrency(property.price)}</TableCell>
                <TableCell align="right">{formatCurrency(property.expensas)}</TableCell>
                <TableCell align="right">{formatCurrency(property.total)}</TableCell>
                <TableCell>{property.location}</TableCell>
                <TableCell>
                  <Chip 
                    label={property.source} 
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      '&.MuiChip-root': {
                        backgroundColor: property.source === 'ArgenProp' 
                          ? 'rgba(38, 162, 105, 0.2)' 
                          : 'rgba(249, 115, 22, 0.2)',
                        '&:hover': {
                          backgroundColor: property.source === 'ArgenProp' 
                            ? 'rgba(38, 162, 105, 0.3)' 
                            : 'rgba(249, 115, 22, 0.3)',
                        }
                      },
                      '& .MuiChip-label': {
                        color: property.source === 'ArgenProp' 
                          ? '#1c1b1f' 
                          : '#f97316',
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <a 
                    href={property.permalink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Ver
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
        Total de propiedades: {filteredAndSortedProperties.length}
      </Typography>
    </Box>
  );
}

export default PropertyTable;