import fs from 'node:fs/promises';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

/**
 * VARIABLES
 */
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToData = path.resolve(__dirname, '../data', 'externalLinks.json');

/**
 * HELPER METHODS
 */
const fileExistsForPath = async (path) => !!(await fs.stat(path).catch(e => false));

const writeFile = (fileData, callback, filePath = pathToData, encoding = 'utf8') => {

    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }

        callback();
    });
};

const getCachedData = async () => {
  try {
    const data = await fs.readFile(pathToData);
    return JSON.parse(data);
    
  } catch (error) {
    throw new Error(error.message);
  }
};

const isConcertLink = (link) => (
  (link.includes('tiny-desk-concert') || link.includes('tiny-desk-home-concert')) && 
  link.startsWith('https://www.npr.org/') &&
  (!link.includes('series') &&
  !link.includes('sections') && 
  !link.includes('story.php'))
);

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
    cachedData = await getCachedData();
  } catch (error) {
    res.status(500).send(`
      The following error occurred when reading the file at ${pathToData}: 
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

    // // Useful for debugging...
    // console.log(Object.keys(fetchedData.parse));
    // console.log(Object.keys(fetchedData.parse.categories));

    const filteredLinks = fetchedData.parse.externallinks.filter(isConcertLink);

    const dataToCacheAndSend = {
      isDataStale: false, 
      externallinks: [...filteredLinks]
    };

    writeFile(JSON.stringify(dataToCacheAndSend, null, 2), () => {
      res.send(dataToCacheAndSend.externallinks);
    });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})