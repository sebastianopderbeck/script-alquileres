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
} from '@mui/material';
import BrickLoader from './BrickLoader';
import PropertyFilter from './PropertyFilter';

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
    const filtered = properties.filter((property) => {
      // Filtro por texto
      const searchText = filter.toLowerCase();
      const matchesText = searchText === '' || 
        property.location.toLowerCase().includes(searchText);
      
      // Filtro por fuente
      const matchesSource = sourceFilter === 'all' || property.source === sourceFilter;
      
      // Filtro por rango de precios
      const matchesPriceRange = property.price >= 500000 && property.price <= 2000000;
      
      return matchesText && matchesSource && matchesPriceRange;
    });

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
    <Box sx={{ width: '100%', mb: 4 }}>
      <PropertyFilter
        filter={filter}
        sourceFilter={sourceFilter}
        onFilterChange={setFilter}
        onSourceFilterChange={setSourceFilter}
      />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'm2'}
                  direction={orderBy === 'm2' ? order : 'asc'}
                  onClick={() => handleRequestSort('m2')}
                >
                  m²
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'rooms'}
                  direction={orderBy === 'rooms' ? order : 'asc'}
                  onClick={() => handleRequestSort('rooms')}
                >
                  Ambientes
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleRequestSort('price')}
                >
                  Precio
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'expensas'}
                  direction={orderBy === 'expensas' ? order : 'asc'}
                  onClick={() => handleRequestSort('expensas')}
                >
                  Expensas
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'total'}
                  direction={orderBy === 'total' ? order : 'asc'}
                  onClick={() => handleRequestSort('total')}
                >
                  Total
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'location'}
                  direction={orderBy === 'location' ? order : 'asc'}
                  onClick={() => handleRequestSort('location')}
                >
                  Ubicación
                </TableSortLabel>
              </TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedProperties.map((property, index) => {
              const uniqueKey = `${property.source}-${property.id}-${property.location}-${index}`;
              return (
                <TableRow 
                  key={uniqueKey}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'background.default',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
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
                      color={property.source === 'ArgenProp' ? 'primary' : 'secondary'}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        '&.MuiChip-root': {
                          backgroundColor: property.source === 'ArgenProp' 
                            ? 'rgba(74, 144, 226, 0.1)' 
                            : 'rgba(80, 200, 120, 0.1)',
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
                        color: 'primary.main',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Ver
                    </a>
                  </TableCell>
                </TableRow>
              );
            })}
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