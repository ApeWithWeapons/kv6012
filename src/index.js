// src/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import * as dataModule from './controllers/dataModule.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Confirm env vars
console.log('→ PROJECTS_DB:', process.env.PROJECTS_DB ? '[FOUND]' : '[MISSING]');
console.log('→ OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? '[FOUND]' : '[MISSING]');
console.log('→ MAP_API_KEY:', process.env.MAP_API_KEY ? '[FOUND]' : '[MISSING]');

const app = express();
const port = process.env.PORT || 3000;

// Log every request
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});
app.use(morgan('dev'));
app.use(express.json());

// Projects endpoint
app.get('/api/projects', async (req, res) => {
  console.log('— handling GET /api/projects');
  if (!process.env.PROJECTS_DB) {
    console.error('Missing PROJECTS_DB');
    return res.status(500).json({ error: 'Database string missing' });
  }
  try {
    const projects = await dataModule.getProjects();
    console.log('— got projects:', projects.length, 'rows');
    return res.json(projects);
  } catch (err) {
    console.error('— route error:', err.message || err);
    return res.status(500).json({ error: 'DB failure' });
  }
});

// Serve static files
app.use(express.static(path.resolve(__dirname, '../public')));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
