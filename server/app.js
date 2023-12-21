import express from 'express';
import path from 'path';
import { 
  fileExistsForPath, 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
  getRandomInt, 
  getAllConcertLinks,
  getRandomConcert} from './utils.js'
 import fs from 'node:fs/promises';
 import pkg from 'fs-extra';
const { writeFile } = pkg;

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
    let concertLinks;
    try {
      concertLinks = await getAllConcertLinks();  
      const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];

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

app.get('/api/increase-counter', async (req, resp) => {
  try {
    const file = await fs.readFile(path.resolve(__dirname, '../data', `counter.json`), { encoding: 'utf8' });
    const data = JSON.parse(file);

    const newCounter = Number(data.counter) + 1;
    console.log(newCounter)
    
    let newData = {
      counter: newCounter
    }
    console.log("Trying to save ", path.resolve(__dirname, '../data', 'counter.json'), newData);
    try {
        writeFile(path.resolve(__dirname, '../data', 'counter.json'), JSON.stringify(newData))

    resp.send(newData)
  } catch (err) {
    resp.statusCode = 404;
    resp.end(err)
  }
} catch(error) {
  resp.statusCode = 404;
  resp.end("Error while reading file", error.message)
}})

app.get('/api/get-counter', async (req, resp) => {
  console.log('hello')
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../data', `counter.json`), { encoding: 'utf8' });
    console.log(data);
    resp.send(data)
  } catch (err) {
    resp.statusCode = 404;
    resp.end(err)
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

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})