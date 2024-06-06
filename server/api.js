import { getRandConcert, getAllData } from './db.js';
import { Router } from 'express';

export const router = Router();

router.get('/concerts', async (req, res) => {
  let data = {};
  try {
    data = {...await getAllData()}
    res.json(data);
  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
})

router.get('/random-concert', async (req, res) => {
  try {
    const randLink = await getRandConcert();
    res.json(randLink)

  } catch (error) {
    res.status(500).send(`
      The following error occurred: 
      ${error.message}
    `);
  }
})