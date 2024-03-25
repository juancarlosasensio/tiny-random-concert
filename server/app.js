import dotenv from 'dotenv'
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
  getRandomConcert} from './utils.js';
import admin from 'firebase-admin';

/**
 * VARS and CONSTS
 */
dotenv.config()
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
 * Firebase – DB
 */

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// TODO: read this. Very helpful!!!
// https://firebase.google.com/docs/database/admin/start

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://tiny-random-concert-default-rtdb.firebaseio.com/"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();


/**
 * ROUTES
 */
app.get('/', async (req, resp) => { 
    try {
      let concertLinks = [];
      
      const ref = db.ref("concerts/links/");
      await ref.once("value", function(snapshot) {
        concertLinks = snapshot.val();
        console.log(concertLinks.length )
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