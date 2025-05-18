// src/index.js

import express from 'express';
import morgan from 'morgan';
import sql from 'mssql';
import axios from 'axios';
import dotenv from 'dotenv';
import * as dataModule from './controllers/dataModule.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// HTTP request logging
app.use(morgan('dev'));

// Serve static assets
app.use(express.static('../public'));

// Endpoint: root returns projects JSON
app.get('/', async (req, res) => {
  try {
    const projects = await dataModule.getProjects();
    return res.json({ projects });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).send('Failed to load data');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
