import fs from 'node:fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

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
    throw new Error(error.message);
  }
}

export const getCachedDB = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
    
  } catch (error) {
    throw new Error(error.message);
  }
}

export const saveDB = async (db) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}

export const insertConcertUrl = async (data) => {
  const db = await getDB();
  db.externallinks.push(data);
  await saveDB(db);

  return data 
}