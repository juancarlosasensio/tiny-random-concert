const fs = require('fs');
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

/**
 * HELPER METHODS
 */

const pathToData = path.resolve(__dirname, '../data', 'externalLinks.json');

const readFile = (callback, returnJson = false, filePath = pathToData, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }

        callback(returnJson ? JSON.parse(data) : data);
    });

};

const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }

        callback();
    });
};

app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.get('/random-concert', async (req, res) => {
  const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2';
  const wikipediaRes = await fetch(URL);
  const data = await wikipediaRes.json();

  // Useful for debugging...
  // console.log(data.parse.externallinks);

  const now = new Date(Date.now().toString());

  const newData = readFile((data) => {
    res.send(data.externalLinks);
  }, true);

  // const externalLinks = 
  //   data.parse.externallinks
  //     .filter(link => (
  //       link.includes('tiny-desk-concert') && 
  //       link.startsWith('https://www.npr.org/')
  //   ));

  // res.send(externalLinks)
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