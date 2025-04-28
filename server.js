import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const app = express();
const DEFAULT_PORT = 3002;

// Configurar CORS para permitir todas las solicitudes durante el desarrollo
app.use(cors({
  origin: '*',  // Permitir todos los orígenes
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Función para ejecutar un script de Python
async function runPythonScript(scriptName) {
    try {
        console.log(`Ejecutando script ${scriptName}...`);
        const { stdout, stderr } = await execAsync(`python ${scriptName}`);
        if (stderr) console.error(`Error en ${scriptName}:`, stderr);
        console.log(`Script ${scriptName} completado`);
        return true;
    } catch (error) {
        console.error(`Error ejecutando ${scriptName}:`, error);
        return false;
    }
}

// Función para leer los resultados de ArgenProp
async function readArgenPropResults() {
    try {
        const data = await fs.readFile('argenPropResults.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo argenPropResults.json:', error);
        return [];
    }
}

// Función para leer los resultados de ZonaProp
async function readZonaPropResults() {
    try {
        const data = await fs.readFile('zonaPropResults.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo zonaPropResults.json:', error);
        return [];
    }
}

// Endpoint para buscar propiedades
app.post('/api/search', async (req, res) => {
    try {
        console.log('Iniciando búsqueda de propiedades...');
        
        // Ejecutar ambos scripts de Python en paralelo
        const [argenPropSuccess, zonaPropSuccess] = await Promise.all([
            runPythonScript('scriptArgenProp.py'),
            runPythonScript('scriptZonaProp.py')
        ]);

        if (!argenPropSuccess && !zonaPropSuccess) {
            throw new Error('Error al ejecutar los scripts de búsqueda');
        }

        // Leer los resultados actualizados
        const [argenPropResults, zonaPropResults] = await Promise.all([
            readArgenPropResults(),
            readZonaPropResults()
        ]);

        // Combinar y normalizar los resultados
        const combinedResults = [
            ...argenPropResults.map(prop => ({
                ...prop,
                source: 'ArgenProp'
            })),
            ...zonaPropResults.map(prop => ({
                ...prop,
                source: 'ZonaProp'
            }))
        ];

        res.json(combinedResults);
    } catch (error) {
        console.error('Error en /api/search:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para obtener todos los resultados combinados
app.get('/api/properties', async (req, res) => {
    try {
        const [argenPropResults, zonaPropResults] = await Promise.all([
            readArgenPropResults(),
            readZonaPropResults()
        ]);
        
        // Combinar y normalizar los resultados
        const combinedResults = [
            ...argenPropResults.map(prop => ({
                ...prop,
                source: 'ArgenProp'
            })),
            ...zonaPropResults.map(prop => ({
                ...prop,
                source: 'ZonaProp'
            }))
        ];
        
        res.json(combinedResults);
    } catch (error) {
        console.error('Error en /api/properties:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Función para iniciar el servidor en un puerto disponible
async function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .on('error', async (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying port ${port + 1}`);
          server.close();
          resolve(startServer(port + 1));
        } else {
          reject(err);
        }
      })
      .on('listening', () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Test endpoint available at http://localhost:${port}/api/test`);
        console.log(`Frontend should be running at http://localhost:5173`);
        resolve(server);
      });
  });
}

// Iniciar el servidor
startServer(DEFAULT_PORT).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 