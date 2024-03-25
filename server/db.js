import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getRandomInt } from './utils.js';

dotenv.config();

// Setting up Firebase Admin SDK https://firebase.google.com/docs/database/admin/start
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const FIREBASE_DB_URL = toString(process.env.FIREBASE_DB_URL);

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: toString(FIREBASE_DB_URL)
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();


// Exported CRUD methods that interact with Firebase DB
export const getAllConcertLinks = async () => {
  let concertLinks = [];
  
  const ref = db.ref("concerts/links/");
  await ref.once("value", function(snapshot) {
    concertLinks = snapshot.val();

    console.log(concertLinks)
  });

  return concertLinks;
};

export const getRandomConcert = async () => {
  const concertLinks = await getAllConcertLinks();
  const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];
  
  return  randConcertLink;
}

// Export Firebase DB
export default db;

