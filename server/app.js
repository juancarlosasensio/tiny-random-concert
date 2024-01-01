import express from 'express';
import path from 'path';
import { 
  fileExistsForPath, 
  getDB, 
  DB_PATH, 
  __dirname,
   __filename,
generateHtmlPage,
fetchRandomConcert,
fetchAndParseConcertsPage} from './utils.js';
import { getDatabase, ref, set, child, get } from "firebase/database";

async function firebaseGetAllConcertLinks () {
  const dbRef = ref(getDatabase());
  const snapshot = await get(child(dbRef, `concerts/links/`))
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return {};
    }
  }

/**
 * VARS, CONSTS and DB init
 */
const app = express();
const port = 3000;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJGaBVD8TLahpU4mWn8QgPD5erKpWSQxs",
  authDomain: "tiny-random-concert.firebaseapp.com",
  databaseURL: "https://tiny-random-concert-default-rtdb.firebaseio.com",
  projectId: "tiny-random-concert",
  storageBucket: "tiny-random-concert.appspot.com",
  messagingSenderId: "970694270511",
  appId: "1:970694270511:web:328bb525652cc667ac30da"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

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
    const randomConcert = await fetchRandomConcert();

    // Set Cache-Control headers for the HTML file
    resp.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate'); // 604800 seconds = 1 week

    resp.render('index', {
      concertLink: randomConcert
    });
  } catch (error) {
    console.error('Error retrieving and serving concert data:', error);
    resp.status(500).send('Internal Server Error');
  }
});

app.get('/api/test', async (req, resp) => { 
  try {
    // const data = await getDB();

    const data = await fetchAndParseConcertsPage();

    // Set Cache-Control headers for the HTML file
    resp.send(data);
  } catch (error) {
    console.error('Error retrieving and serving concert data:', error);
    resp.status(500).send('Internal Server Error');
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
    data = await firebaseGetAllConcertLinks();

    console.log(data)
    
    // TODO: add this to a POST/PUT request...
    // writeConcertlinks(data?.externallinks);


    resp.send(data);

  } catch (error) {
    resp.status(500).send(`
      The following error occurred when reading the file at ${DB_PATH}: 
      ${error.message}
    `);
  }
})

// app.get('/api/random-concert', async (req, resp) => {
//   // How will we be using dates to check if data is too old or is stale?
//   // const now = new Date(Date.now().toString());

//   // Can we use async/await to clean up code and catch errors appropriately?
//   try {
//     resp.send(await getRandomConcert());
//   } catch (error) {
//     resp.status(500).send(`
//       The following error occurred when reading the file at ${DB_PATH}: 
//       ${error.message}
//     `);
//   }
// })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})