import express from 'express';
import path from 'path';
import { 
  fileExistsForPath, 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
  getRandomInt } from './utils.js'

/**
 * VARS and CONSTS
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
app.get('/', async (req, resp) => { 
    let data;
    try {
      data = await getDB();  
      const randConcertLink = data.externallinks[getRandomInt(data.externallinks.length - 1)];

      resp.render('index.ejs', {
        concertLink: randConcertLink
      });
        

    } catch (error) {
      resp.status(500).send(`
        The following error occurred when reading the file at ${DB_PATH}: 
        ${error.message}
    `);
    }
});

app.get('/:name', async (req, resp, next) => {
    let routePath = req.params.name;
    const fileExists = await fileExistsForPath(path.resolve(__dirname, '../public', `${routePath}.html`));

    if (!fileExists) {
        next();
    } else {
      resp.sendFile(path.resolve(__dirname, '../public', `${routePath}.html`));
    }
})

app.get('/:name', async (req, resp) => {
    let routePath = req.params.name;
    const fileExists = await fileExistsForPath(path.resolve(__dirname, '../ssr', `${routePath}.html`));

    if (!fileExists) {
        console.log("no dir ", routePath);
        
        resp.statusCode = 404;
        resp.end("Route not found")
    } else {
      resp.sendFile(path.resolve(__dirname, '../ssr', `${routePath}.html`));
    }
})

app.get('/api/random-concert', async (req, resp) => {
  const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2';

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

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})