import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const app = express();
const port = 3002;

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Endpoint to run all scripts and get results
app.get('/api/results', async (req, res) => {
  try {
    console.log('Running scripts...');
    
    // Run the scripts
    await execAsync('node scriptArgenProp.js');
    await execAsync('node scriptZonaProp.js');

    console.log('Scripts executed successfully');

    // Read the results files
    const argenPropData = await fs.readFile('./argenPropResults.js', 'utf8');
    const zonaPropData = await fs.readFile('./zonaPropResults.js', 'utf8');

    const argenPropResults = JSON.parse(argenPropData);
    const zonaPropResults = JSON.parse(zonaPropData);

    console.log('Results loaded:', {
      argenProp: argenPropResults.length || 0,
      zonaProp: zonaPropResults.length || 0
    });

    // Combine and format results
    const results = {
      argenProp: argenPropResults || [],
      zonaProp: zonaPropResults || []
    };

    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch results',
      details: error.message 
    });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Test endpoint available at http://localhost:${port}/api/test`);
  console.log(`Frontend should be running at http://localhost:5173`);
}); 