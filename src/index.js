// src/index.js
import dotenv from 'dotenv';
dotenv.config();

const express = require('express');
const morgan = require('morgan');
const dataModule = require('./data');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));

app.get('/', async (req, res, next) => {
  try {
    const projects = await dataModule.getProjects();
    // Send raw JSON for testing
    return res.json({ projects });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).send('Failed to load data');
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
