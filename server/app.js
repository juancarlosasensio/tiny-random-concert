import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { __dirname, __filename } from './utils.js';
import { getRandConcert } from './db.js';
import { cron as cronRouteHandler } from './cron.js';
import { router as apiRouter } from './api.js';

/**
 * CONFIG/CONSTANTS
 */
dotenv.config();
const app = express();
const port = 3000;

/** 
 * MIDDLEWARE
 */
app.use(express.static(path.resolve(__dirname, '../public')));
app.set("views", path.resolve(__dirname, '../views'));
app.set('view engine', 'ejs');

/**
 * ROUTE HANDLERS
 */

// Cron job handler
app.use('/cron', cronRouteHandler);

// API router with basic auth middleware
app.use("/api", basicAuth({ users: { 'admin': process.env.API_PSWD }}), apiRouter);

// Content
app.get('/', async (req, res) => { 
    try {
      const randLink = await getRandConcert();
      
      res.render('index.ejs', {
        concertLink: randLink
      });
    } catch (error) {
      res.status(500).send(`
        The following error occurred: ${error.message}
    `);
    }
});

/**
 * LISTEN ON PORT
 */

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})