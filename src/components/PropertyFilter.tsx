import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

interface PropertyFilterProps {
  filter: string;
  sourceFilter: string;
  onFilterChange: (value: string) => void;
  onSourceFilterChange: (value: string) => void;
}

const PropertyFilter: React.FC<PropertyFilterProps> = ({
  filter,
  sourceFilter,
  onFilterChange,
  onSourceFilterChange,
}) => {
  const handleSourceChange = (event: SelectChangeEvent) => {
    onSourceFilterChange(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <TextField
        label="Buscar por ubicación"
        variant="outlined"
        size="small"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Buscar por ubicación"
        sx={{ flex: 1 }}
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Fuente</InputLabel>
        <Select
          value={sourceFilter}
          label="Fuente"
          onChange={handleSourceChange}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="ArgenProp">ArgenProp</MenuItem>
          <MenuItem value="ZonaProp">ZonaProp</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default PropertyFilter; 