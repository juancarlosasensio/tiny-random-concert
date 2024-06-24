import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { rateLimit } from 'express-rate-limit';
import { mw } from 'request-ip';
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
app.use(mw());

const limiter = rateLimit({
  windowMs: 24 * 3600 * 1000, // 24 hours
	limit: 5,
  keyGenerator: (req, res) => req.clientIp, // See: https://stackoverflow.com/questions/64188573/express-rate-limit-blocking-requests-from-all-users
  status: 200,
  handler: (req, res, next) => {
    res.TRCData = {};
    res.TRCData.message = `
      You've maxed out the number of random concerts for today. 
      Please try again tomorrow :)
    `
    next();
  }
})

/**
 * ROUTE HANDLERS
 */

// Cron job handler
app.use('/cron', cronRouteHandler);

// API router with basic auth middleware
app.use("/api", basicAuth({ users: { 'admin': process.env.API_PSWD }}), apiRouter);

// Content
app.get('/', limiter, async (req, res) => {
    if (res?.TRCData?.message) {
      res.render('index.ejs', {
        concertLink: null,
        serverMsg: res?.TRCData?.message
      });
    } else {
          try {
            const randLink = await getRandConcert();
            console.log('randLink', randLink);
            
            res.render('index.ejs', {
              concertLink: randLink,
              serverMsg: null
            });
          } catch (error) {
            res.status(500).send(`
              The following error occurred: ${error.message}
          `);
        }
    }
});

/**
 * LISTEN ON PORT
 */

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`)
})