import { getAllData } from "./db";

// TODO: setup endpoint to be requested by cron job only when new wikipedia data is available
// It should: PUSH only the new concert links from wikipedia, update revid and concerts_count correctly
// Vercel cron jobs: https://vercel.com/docs/cron-jobs/quickstart

export default async function handler(request, response) {
  try { 
    
    const dbData = await getAllData();

    if (dbData) {
      return response.json({ 'message': 'Database updated successfully' });   
    } else {
      return response.send({ 'message': 'No data' })
    }
  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
};