import express from 'express';
import path from 'path';
import { 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
  getRandomInt } from './utils.js';
import { getAllConcertLinks, getRandomConcert } from './db.js';

/**
 * Config and Constants
 */
const app = express();
const port = 3000;

/** 
 * MIDDLEWARE
 */
app.use(express.static(path.resolve(__dirname, '../public')));
app.set("views", path.resolve(__dirname, '../views'));
app.set('view engine', 'ejs');

/**
 * ROUTES
 */
app.get('/', async (req, res) => { 
    try {
      let concertLinks = await getAllConcertLinks();

      if (concertLinks.length) {
        const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];

        res.render('index.ejs', {
          concertLink: randConcertLink
        });
      }
    } catch (error) {
      res.status(500).send(`
        The following error occurred: ${error.message}
    `);
    }
});

app.get('/api/concerts', async (req, resp) => {
  // How will we be using dates to check if data is too old or is stale?
  // const now = new Date(Date.now().toString());

  // Can we use async/await to clean up code and catch errors appropriately?
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

app.get('/api/random-concert', async (req, resp) => {
  // How will we be using dates to check if data is too old or is stale?
  // const now = new Date(Date.now().toString());

  // Can we use async/await to clean up code and catch errors appropriately?
  try {
    resp.send(await getRandomConcert());
  } catch (error) {
    resp.status(500).send(`
      The following error occurred when reading the file at ${DB_PATH}: 
      ${error.message}
    `);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})