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
    console.log('Properties:', properties);
    console.log('Source Filter:', sourceFilter);
    
    const filtered = properties.filter((property) => {
      // Filtro por texto
      const searchText = filter.toLowerCase();
      const matchesText = searchText === '' || 
        property.location.toLowerCase().includes(searchText);
      
      // Filtro por fuente (case insensitive)
      const propertySource = property.source.toLowerCase();
      const matchesSource = sourceFilter === 'all' || 
        (sourceFilter.toLowerCase() === 'argenprop' && propertySource === 'argenprop') ||
        (sourceFilter.toLowerCase() === 'zonaprop' && propertySource === 'zonaprop');
      
      // Filtro por rango de precios
      const matchesPriceRange = property.price >= 500000 && property.price <= 2000000;
      
      console.log('Property:', property.source, 'Matches Source:', matchesSource);
      
      return matchesText && matchesSource && matchesPriceRange;
    });

    console.log('Filtered Properties:', filtered);
    
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
      // La tabla se actualizará automáticamente cuando las propiedades cambien
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
          minHeight: '400px',
          gap: 2,
        }}
      >
        <BrickLoader />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            mt: 2
          }}
        >
          Cargando propiedades...
        </Typography>
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3
    }}>
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
              }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Fuente</InputLabel>
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
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={orderBy}
              label="Ordenar por"
              onChange={(e) => setOrderBy(e.target.value)}
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
              color: 'primary.main',
              backgroundColor: 'rgba(26, 95, 180, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(26, 95, 180, 0.2)'
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
              <TableCell align="right">m²</TableCell>
              <TableCell align="right">Ambientes</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Expensas</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedProperties.map((property) => (
              <TableRow 
                key={property.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(26, 95, 180, 0.02)'
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
                          ? 'rgba(26, 95, 180, 0.2)' 
                          : 'rgba(38, 162, 105, 0.2)',
                        '&:hover': {
                          backgroundColor: property.source === 'ArgenProp' 
                            ? 'rgba(26, 95, 180, 0.3)' 
                            : 'rgba(38, 162, 105, 0.3)',
                        }
                      },
                      '& .MuiChip-label': {
                        color: property.source === 'ArgenProp' 
                          ? '#1a5fb4' 
                          : '#26a269',
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
                      color: '#1a5fb4',
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