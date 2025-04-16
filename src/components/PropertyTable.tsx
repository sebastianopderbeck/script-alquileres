import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  TableSortLabel,
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface Property {
  title: string;
  m2: number;
  rooms: number;
  expensas: number;
  price: number;
  total: number;
  location: string;
  permalink: string;
}

type Order = 'asc' | 'desc';

interface PropertyTableProps {
  properties: Property[];
  source: string;
}

const PropertyTable: React.FC<PropertyTableProps> = ({ properties, source }) => {
  const [orderBy, setOrderBy] = useState<keyof Property>('total');
  const [order, setOrder] = useState<Order>('desc');

  const handleRequestSort = (property: keyof Property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getPropertyType = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ph')) {
      return 'PH';
    }
    return 'Departamento';
  };

  const sortedProperties = React.useMemo(() => {
    return [...properties].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [properties, orderBy, order]);

  if (!properties || properties.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 30%, rgba(139, 92, 246, 0.1) 90%)' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {source}
        </Typography>
        <Typography>No hay propiedades disponibles</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 30%, rgba(139, 92, 246, 0.1) 90%)' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {source}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Tipo
                </TableSortLabel>
              </TableCell>
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
                  active={orderBy === 'expensas'}
                  direction={orderBy === 'expensas' ? order : 'asc'}
                  onClick={() => handleRequestSort('expensas')}
                >
                  Expensas
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
              <TableCell>Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProperties.map((prop, index) => (
              <TableRow key={index} hover>
                <TableCell>{getPropertyType(prop.title)}</TableCell>
                <TableCell align="right">{prop.m2}</TableCell>
                <TableCell align="right">{prop.rooms}</TableCell>
                <TableCell align="right">${prop.expensas.toLocaleString()}</TableCell>
                <TableCell align="right">${prop.price.toLocaleString()}</TableCell>
                <TableCell align="right">${prop.total.toLocaleString()}</TableCell>
                <TableCell>{prop.location}</TableCell>
                <TableCell>
                  <Button
                    href={prop.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="contained"
                    startIcon={<Search />}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PropertyTable; 