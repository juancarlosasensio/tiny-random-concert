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
  windowMs: 12 * 3600 * 1000, // 12 hours
	limit: 5,
  keyGenerator: (req, res) => req.clientIp, // See: https://stackoverflow.com/questions/64188573/express-rate-limit-blocking-requests-from-all-users
  status: 200,
  handler: (req, res, next) => {
    res.TRCData = {};
    res.TRCData.message = `
      You've reached the limit of random concerts for now. 
      Please try again later :)
    `
    next(); // See: https://dev.to/brunohgv/limiting-node-js-api-calls-with-express-rate-limit-11kl#:~:text=const%20apiRequestLimiter%20%3D%20rateLimit(%7B%0A%20%20%20%20windowMs%3A%201%20*%2060%20*%201000%2C%20//%201%20minute%0A%20%20%20%20max%3A%202%2C%20//%20limit%20each%20IP%20to%202%20requests%20per%20windowMs%0A%20%20%20%20handler%3A%20function%20(req%2C%20res%2C%20next)%20%7B%0A%20%20%20%20%20%20applyFeesForConsumer()%0A%20%20%20%20%20%20next()%0A%20%20%20%20%7D%0A%7D)
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