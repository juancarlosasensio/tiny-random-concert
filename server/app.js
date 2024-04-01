import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
  getRandomInt,
  getWikipediaData } from './utils.js';
import { 
  getAllConcertLinks, 
  getRandConcert, 
  getAllData,
  setConcertsLinks,
  setRevid } from './db.js';

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
app.set("views", path.resolve(__dirname, '../views'));
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

app.get('/api/concerts', async (req, resp) => {
  let data;
  try {
    data = await getDB();
    resp.send(data.externallinks);
  } catch (error) {
    resp.status(500).send(`
      The following error occurred when reading the file at ${DB_PATH}: 
      ${error.message}
    `);
  }
})

app.get('/api/update-concert-data', async (req, res) => { 
    try {
      const newWikipediaData = await getWikipediaData();
      const dbData = await getAllData();

      console.log(newWikipediaData.externallinks[newWikipediaData.externallinks.length - 1]);

      // updateConcertsLinks(newWikipediaData.externallinks[newWikipediaData.externallinks.length - 1])

      console.log('logging newWikipediaData.externallinks', newWikipediaData.externallinks)

      setConcertsLinks(newWikipediaData.externallinks);

      if (newWikipediaData.revid === dbData.revid) {
        res.json(dbData);
      } else {
        setRevid(newWikipediaData.revid);
        res.json(dbData);
      }

    } catch (error) {
      res.status(500).send(`
        The following error occurred: ${error.message}
    `);
    }
});

app.get('/api/random-concert', async (req, res) => {
  try {
    const randLink = await getRandConcert();
    res.json(randLink)

  } catch (error) {
    res.status(500).send(`
      The following error occurred when reading the file at ${DB_PATH}: 
      ${error.message}
    `);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})