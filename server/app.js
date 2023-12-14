import fs from 'node:fs/promises';
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { 
  fileExistsForPath, 
  getDB, 
  saveDB, 
  DB_PATH, 
  __dirname,
   __filename,
  isConcertLink } from './utils.js'

/**
 * VARS and CONSTS
 */
const app = express();
const port = 3000;

/** 
 * MIDDLEWARE
 */
app.use(express.static(path.resolve(__dirname, '../public')));

/**
 * ROUTES
 */
app.get('/', (req, resp) => {
    resp.sendFile(path.resolve(__dirname, '../public', 'index.html'));
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

app.get('/api/random-concert', async (req, res) => {
  const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2';

  // How will we be using dates to check if data is too old or is stale?
  // const now = new Date(Date.now().toString());

  // Can we use async/await to clean up code and catch errors appropriately?
  let cachedData;
  try {
    cachedData = await getDB();
  } catch (error) {
    res.status(500).send(`
      The following error occurred when reading the file at ${DB_PATH}: 
      ${error.message}
    `);
  }

  if (!cachedData?.isDataStale) {
    console.log('data is FRESH');
    const filteredLinks = cachedData?.externallinks.filter(isConcertLink);

    res.send(filteredLinks);
  
  } else {
    console.log('data is STALE')

    const wikipediaRes = await fetch(URL);
    const fetchedData = await wikipediaRes.json();
    const filteredLinks = fetchedData.parse.externallinks.filter(isConcertLink);

    // // Useful for debugging...
    // console.log(Object.keys(fetchedData.parse));
    // console.log(Object.keys(fetchedData.parse.categories));

    const dataToCacheAndSend = {
      isDataStale: false, 
      externallinks: [...filteredLinks]
    };

    const db = await saveDB(dataToCacheAndSend);
    res.send(db.externallinks);
  
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})