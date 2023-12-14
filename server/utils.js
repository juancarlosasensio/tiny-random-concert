import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

//FILESYSTEM

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// UTILS
export const isConcertLink = (link) => (
  (link.includes('tiny-desk-concert') || link.includes('tiny-desk-home-concert')) && 
  link.startsWith('https://www.npr.org/') &&
  (!link.includes('series') &&
  !link.includes('sections') && 
  !link.includes('story.php'))
);

export const fileExistsForPath = async (path) => !!(await fs.stat(path).catch(e => false));

//DATABASE

export const DB_PATH = path.resolve(__dirname, '../data', 'externalLinks.json');

export const getDB = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
    
  } catch (error) {
    throw new Error(error.message);
  }
};

export const saveDB = async (db) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}