import fs from 'node:fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { getDatabase, ref, set, child, get } from "firebase/database";
import axios from 'axios';
import * as cheerio from 'cheerio';

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

    const wikipediaRes = await fetch(URL);
    const fetchedData = await wikipediaRes.json();
    console.log(fetchedData)

    // const filteredLinks = fetchedData.parse.externallinks.filter(isConcertLink);

    // // // Useful for debugging...
    // // console.log(Object.keys(fetchedData.parse));
    // // console.log(Object.keys(fetchedData.parse.categories));

    // const dataToCacheAndSend = {
    //   isDataStale: false, 
    //   externallinks: [...filteredLinks]
    // };
    // const db = await saveDB(dataToCacheAndSend);

    return (fetchedData)    
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

export function writeConcertlinks(links) {
  const db = getDatabase();
  set(ref(db, 'concerts/'), {
    links: links
  });
}

export async function fetchAndParseConcertsPage() {
  try {
    // Make a request to Wikipedia for the "Tiny Desk Concerts" page
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_Tiny_Desk_Concerts');
    const $ = cheerio.load(response.data);
    
    // console.log($.html())

    const concertData = {years: [], concerts: []};

    const yearHeadlines = $('h3 > span.mw-headline');
    const tableRows = $('table.wikitable tbody tr');

    // console.log(tableRows)
        console.log(yearHeadlines.length)

    yearHeadlines.each((index, element) => {
      concertData.years.push($(element).text().trim())
    })

    // Select the relevant table and iterate over its rows
    tableRows.each((index, element) => {
      const columns = $(element).find('td');

      if (columns.length > 1) {
        // Working with dates...
        // https://stackoverflow.com/questions/19597361/parse-date-month-and-year-from-javascript-date-form

        const date = new Date( $(columns[0]).text().trim() );
        let year, month, day;
        if ( !!date.valueOf() ) { // Valid date
            year = date.getFullYear();
            month = date.toLocaleString('default', { month: 'long' });
            day = date.getDate();
        } else { 
          /* Invalid date */ 
        }

        const artist = $(columns[1]).text().trim();
        const link = $(columns[2]).find('a').attr('href'); // Assuming the link is in an anchor tag

        concertData.concerts.push({ artist, link, year, date: `${month}, ${day}` });
      }
    });

    // const totalConcerts = concertData.length;

    // Store the concert data in Firebase Realtime Database
    // const database = firebase.database();
    // await database.ref('/concerts').set({ concerts: concertData, count: totalConcerts });

    console.log('Concert data successfully saved to Firebase...');

    return concertData
  } catch (error) {
    console.error('Error caching concert data:', error);
  }
}