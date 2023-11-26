const fs = require('fs');
const util = require('util');
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

/**
 * VARIABLES
 */

/**
 * HELPER METHODS
 */

const pathToData = path.resolve(__dirname, '../data', 'externalLinks.json');

// const readFile = (callback, returnJson = false, filePath = pathToData, encoding = 'utf8') => {
//     fs.readFile(filePath, encoding, (err, data) => {
//         if (err) {
//             throw err;
//         }

//         callback(returnJson ? JSON.parse(data) : data);
//     });

// };

const writeFile = (fileData, callback, filePath = pathToData, encoding = 'utf8') => {

    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }

        callback();
    });
};

const readFile = util.promisify(fs.readFile);

const getCachedData = async () => {
  try {
    const data = await readFile(pathToData);
    return JSON.parse(data);
    
  } catch (error) {
    res.status(500).send(`
      The following error occurred when reading the file at ${pathToData}: 
      ${error.message}
    `);
  }
};

const isConcertLink = (link) => (
  (link.includes('tiny-desk-concert') || link.includes('tiny-desk-concert')) && 
  link.startsWith('https://www.npr.org/') &&
  !link.includes('series') &&
  !link.includes('sections')
);

/** 
 * MIDDLEWARE
 */

app.use(express.static(path.resolve(__dirname, '../public')));


/**
 * ROUTES
 */

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.get('/random-concert', async (req, res) => {
  const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2';

  // Useful for debugging...
  // console.log(data.parse.externallinks);

  // How will we be using dates to check if data is too old or is stale?
  // const now = new Date(Date.now().toString());

  // Can we use async/await to clean up code and catch errors appropriately?
  const cachedData = await getCachedData();

  if (!cachedData?.isDataStale) {
    console.log('data is FRESH');
    const filteredLinks = cachedData?.externallinks.filter(isConcertLink);

    res.send(filteredLinks);
  
  } else {
    console.log('data is STALE')

    const wikipediaRes = await fetch(URL);
    const fetchedData = await wikipediaRes.json();

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

/**
 *  
 * 
 *  Fetch-and-set step: 
 *  Fetch wikipedia data...
 *  store it in a file
 *  Time stamp that file
 *  
 *  Request-handle step:
 *  When request comes in, check if data is stale (this can be optional for now)
 *  If data is not stale: get data from file in memory...
 *  Else: do Fetch-and-set
 * 
 *  Response step:
 * 
 *  Return non-stale data in response
 *  
 * 
 *    
 */

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})