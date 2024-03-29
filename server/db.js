import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getRandomInt } from './utils.js';

dotenv.config();

// Setting up Firebase Admin SDK https://firebase.google.com/docs/database/admin/start
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the app with a service account, granting admin privileges
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://tiny-random-concert-default-rtdb.firebaseio.com/',
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_AUTH_UID
  }
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = getDatabase(app);

// Useful link about security rules: https://medium.com/@juliomacr/10-firebase-realtime-database-rule-templates-d4894a118a98

// Exported CRUD methods that interact with Firebase DB
export const getAllData = async () => {
  let allData = '';  
  const ref = db.ref("concerts/");
  
  await ref.once("value", function(snapshot) {
    allData = snapshot.val();
  });

  return allData;
};

export const getCurrentRevId = async () => {
  let revid = '';  
  const ref = db.ref("concerts/revid/");
  
  await ref.once("value", function(snapshot) {
    revid = snapshot.val();
  });

  return revid;
};

export const setRevid = async (id) => {  
  if (!id || typeof id !== 'number') {
    throw new Error('revid must be a valid number');
  } else {
    const revidRef = db.ref('concerts/revid');
    revidRef.set(id)   
  }
};

export const setConcertsLinks = async (concertsLinks) => {  
  if (!Array.isArray(concertsLinks) || !concertsLinks.length) {
    throw new Error('concerts/links must be non-empty array');
  } else {
    const linksRef = db.ref('concerts/links');
    concertsLinks.forEach(link => linksRef.push(link))   
  }
};

export const addNewConcertLink = async (link) => {  
  if (!link || typeof link !== 'string') {
    throw new Error('concerts/links must be valid string');
  } else {
    const linksRef = db.ref('concerts/links');
    linksRef.push(link)   
  }
};



export const getAllConcertLinks = async () => {
  let concertLinks = [];
  
  const ref = db.ref("concerts/links/");
  await ref.once("value", function(snapshot) {
    concertLinks = snapshot.val();

    console.log('loading from firebase db', concertLinks)
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

