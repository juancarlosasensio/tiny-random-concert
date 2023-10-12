const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.get('/random-concert', async (req, res) => {
  // const tinyDeskWikipediaURL = 'https://en.wikipedia.org/wiki/List_of_Tiny_Desk_Concerts';

  const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2'

  const wikipediaRes = await fetch(URL);
  const data = await wikipediaRes.json();

  const dataProperties = Object.keys(data.parse);

  // const regex = /https\:\/\/www.npr.org\/\d{4}\/\d{2}\/\d{2}\//g

  const externalLinks = data.parse.externallinks.filter(link => link.includes('tiny-desk-concert') && link.startsWith('https://www.npr.org/'));

  res.send(externalLinks)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})