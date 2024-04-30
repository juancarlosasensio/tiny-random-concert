import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getRandomInt } from './utils.js';

dotenv.config();

// Setting up Firebase Admin SDK https://firebase.google.com/docs/database/admin/start
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
const FIREBASE_DB_URL = 'https://tiny-random-concert-default-rtdb.firebaseio.com/';

// Initialize the app with a service account, granting admin privileges
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: FIREBASE_DB_URL,
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

export const getRevid = async () => {
  let revid = '';  
  const ref = db.ref("concerts/revid/");
  
  await ref.once("value", function(snapshot) {
    revid = snapshot.val();
  });

  return revid;
};

export const setRevid = async (id) => {  
  // Consider setting this kind of validation in the Firebase Realtime DB Security rules
  // Can even request security rules as JSON: https://firebase.google.com/docs/reference/admin/node/firebase-admin.security-rules
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
  });

  return concertLinks;
};

export const getRandConcert = async () => {
  let parsedLinks = [];
  const data = await getAllData();
  const maxCount = data['concerts_count'];

  const randomIndex = getRandomInt(maxCount);

  // Get a random concert link –- absolutely hacky
  const countRef = db.ref('concerts/links');
  await countRef.once("value", function(snapshot) {
    snapshot.forEach(linkSnapshot => {
      parsedLinks.push(linkSnapshot.val())
    });
  })
  // return link
  return parsedLinks[randomIndex]
}

export const updateCount = async () => {
  const concertsCount = db.ref('concerts/concerts_count');
  
  concertsCount.transaction((current_value) => {
  
  return (current_value || 0) + 1;
  });
}

export const getCount = async () => {
  let count = 0;  
  const ref = db.ref("concerts/concerts_count");
  
  await ref.once("value", function(snapshot) {
    count = snapshot.val();
  });
  return count;
};

export const setCount = async (num) => {
    if (!num || typeof num !== 'number') {
    throw new Error('revid must be a valid number');
  } else {
    const countRef = db.ref('concerts/concerts_count');
    countRef.set(num)   
  }
}

// Export Firebase DB
export default db;

