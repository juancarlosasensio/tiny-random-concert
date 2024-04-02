import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { 
  __dirname,
   __filename,
  getWikipediaData } from '../utils.js';
import {  
  getRandConcert, 
  getAllData,
  setConcertsLinks,
  setRevid } from '../db.js';
import { cron } from './cron.js';

/**
 * Config and Constants
 */
dotenv.config();
const app = express();
const port = 3000;

/** 
 * MIDDLEWARE
 */
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/cron', cron);
app.set("views", path.resolve(__dirname, './views'));
app.set('view engine', 'ejs');

/**
 * Routes
 */
app.get('/', async (req, res) => { 
    try {
      const randLink = await getRandConcert();
      
      res.render('index.ejs', {
        concertLink: randLink
      });
    } catch (error) {
      res.status(500).send(`
        The following error occurred: ${error.message}
    `);
    }
});

app.get('/api/concerts', async (req, res) => {
  let data = {};
  try {
    data = {...await getAllData()}
    
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(data, null, 4));

  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
})

app.get('/api/random-concert', async (req, res) => {
  try {
    const randLink = await getRandConcert();
    res.json(randLink)

  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})