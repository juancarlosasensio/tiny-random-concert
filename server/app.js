import express from 'express';
import path from 'path';
import { 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
  getRandomInt, 
  getRandomConcert} from './utils.js';
  import db from './db.js';

/**
 * Config and Constants
 */
const app = express();
const port = 3000;
const ENV = process.env.NODE_ENV || 'development';

/** 
 * MIDDLEWARE
 */
app.use(express.static(path.resolve(__dirname, '../public')));
app.set("views", path.resolve(__dirname, '../views'));
app.set('view engine', 'ejs');

/**
 * ROUTES
 */
app.get('/', async (req, resp) => { 
    try {
      let concertLinks = [];
      
      const ref = db.ref("concerts/links/");
      await ref.once("value", function(snapshot) {
        concertLinks = snapshot.val();
      }); 

      if (concertLinks.length) {
        const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];

        resp.render('index.ejs', {
          concertLink: randConcertLink
        });
      }
    } catch (error) {
      resp.status(500).send(`
        The following error occurred when reading the file at ${DB_PATH}: 
        ${error.message}
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