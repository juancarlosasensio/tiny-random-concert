import fs from 'node:fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { getDatabase, ref, set, child, get } from "firebase/database";

//FILESYSTEM
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

//CONSTANTS
  export const URL = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=List_of_Tiny_Desk_Concerts&formatversion=2';
  export const DB_PATH = path.resolve(__dirname, '../data', 'externalLinks.json');

// UTILS
export const isConcertLink = (link) => (
  (link.includes('tiny-desk-concert') || link.includes('tiny-desk-home-concert')) && 
  link.startsWith('https://www.npr.org/') &&
  (!link.includes('series') &&
  !link.includes('sections') && 
  !link.includes('story.php'))
);

export const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

export const fileExistsForPath = async (path) => !!(await fs.stat(path).catch(e => false));

//DATABASE
export const getDB = async () => {
  console.log('from getDB fn')
  try {
    const data = await (getCachedDB());

    if (!data?.isDataStale) {
    console.log('data is FRESH');

    return data;
  
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

      return (db)
    }
  } catch (error) {
    console.log('Error is will be thrown from getDB() function call')
    throw new Error(error.message);
  }
}

export const getCachedDB = async () => {
  console.log('from getCachedDB...')
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');

    // console.log('from getCachedDB...', JSON.parse(data));

    return JSON.parse(data);
    
  } catch (error) {
    throw new Error(error.message);
  }
}

export const saveDB = async (db) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}

export const getAllConcertLinks = async () => {
  const data = await getDB();

  return data?.externallinks;
}

// export const getRandomConcert = async () => {
//   const concertLinks = await getAllConcertLinks();
//   const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];
  
//   return  randConcertLink;
// }

export const insertConcertUrl = async (data) => {
  const db = await getDB();
  db.externallinks.push(data);
  await saveDB(db);

  return data 
}

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

export async function fetchRandomConcert() {
  try {
    // Fetch concert data from Firebase Realtime Database
    const concertData = await firebaseGetAllConcertLinks();

    // Return a random concert
    return getRandomConcert(concertData);
  } catch (error) {
    console.error('Error fetching concert data:', error);
    throw error;
  }
}

// Function to get a random concert from the provided data
function getRandomConcert(concertData) {
  const randomIndex = Math.floor(Math.random() * concertData.length);
  return concertData[randomIndex];
}

export function generateHtmlPage(link) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Random Concert of the Week</title>
      </head>
      <body>
        <h1>Random Concert of the Week</h1>
        <p><strong>Link:</strong> <a href="${link}" target="_blank">${link}</a></p>
      </body>
    </html>
  `
}