import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';

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

interface PropertiesState {
  argenProp: Property[];
  zonaProp: Property[];
  loading: boolean;
  error: string | null;
  serverStatus: 'idle' | 'connected' | 'error';
}

const initialState: PropertiesState = {
  argenProp: [],
  zonaProp: [],
  loading: false,
  error: null,
  serverStatus: 'idle'
};

// Thunk para verificar la conexión con el servidor
export const checkServerConnection = createAsyncThunk(
  'properties/checkServerConnection',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Checking server connection...');
      const response = await axios.get(`${API_BASE_URL}/api/test`);
      console.log('Server connection successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Server connection failed:', error);
      return rejectWithValue('No se pudo conectar con el servidor');
    }
  }
);

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching properties...');
      const response = await axios.get(`${API_BASE_URL}/api/results`);
      console.log('Properties fetched successfully:', {
        argenProp: response.data.argenProp?.length || 0,
        zonaProp: response.data.zonaProp?.length || 0
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      return rejectWithValue(error.response?.data?.error || 'Error al cargar los resultados');
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Check server connection
      .addCase(checkServerConnection.fulfilled, (state) => {
        state.serverStatus = 'connected';
        state.error = null;
      })
      .addCase(checkServerConnection.rejected, (state, action) => {
        state.serverStatus = 'error';
        state.error = action.payload as string;
      })
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.argenProp = action.payload.argenProp || [];
        state.zonaProp = action.payload.zonaProp || [];
        state.error = null;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default propertiesSlice.reducer; 