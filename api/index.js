import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import {  
  getRandConcert, 
  getAllData,
} from '../db.js';
import { __dirname } from '../utils.js';
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
app.set("views", path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

/**
 * Routes
 */

// Cron controller
app.use('/cron', cron);

// Index page
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

// API Controllers
app.get('/api/concerts', async (req, res) => {
  let data = {};
  try {
    console.log(__dirname);
    console.log(path.join(__dirname, "/views"))

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