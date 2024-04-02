import { getWikipediaData } from "./utils";
import { getAllData } from "./db";

// TODO: setup endpoint to be requested by cron job only when new wikipedia data is available
// It should: PUSH only the new concert links from wikipedia, update revid and concerts_count correctly
// Vercel cron jobs: https://vercel.com/docs/cron-jobs/quickstart

export default async function handler(request, response) {
  try { 
    // const newWikipediaData = await getWikipediaData();
    // const dbData = await getAllData();
  
    return response.json("Database updated successfully"); 
  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
};