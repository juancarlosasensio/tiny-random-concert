import dotenv from 'dotenv';
import {google} from 'googleapis';
import admin from 'firebase-admin';
import { getRandomInt } from './utils.js';

dotenv.config();

// Setting up Firebase Admin SDK https://firebase.google.com/docs/database/admin/start
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tiny-random-concert-default-rtdb.firebaseio.com/'
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
const db = admin.database();

// TODO: read this https://firebase.google.com/docs/database/rest/auth
// Figure out how to authenticate DB read/write operations 


// Define the required scopes.
var scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/firebase.database"
];

// Authenticate a JWT client with the service account.
var jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  scopes
);

// Use the JWT client to generate an access token.
jwtClient.authorize(async function(error, tokens) {
  if (error) {
    console.log("Error making request to generate access token:", error);
  } else if (tokens.access_token === null) {
    console.log("Provided service account does not have permission to generate access tokens");
  } else {
    var accessToken = tokens.access_token;

    const linksEndpoint = `https://tiny-random-concert-default-rtdb.firebaseio.com/concerts/links.json?access_token=${accessToken}`;
    
    const res = await fetch(linksEndpoint);
    const links = await res.json();

    console.log({links})

  }
});
















// Exported CRUD methods that interact with Firebase DB
export const getAllConcertLinks = async () => {
  let concertLinks = [];
  
  const ref = db.ref("concerts/links/");
  await ref.once("value", function(snapshot) {
    concertLinks = snapshot.val();

    console.log(concertLinks)
  });

  return concertLinks;
};

export const getRandomConcert = async () => {
  const concertLinks = await getAllConcertLinks();
  const randConcertLink = concertLinks[getRandomInt(concertLinks.length - 1)];
  
  return  randConcertLink;
}

// Export Firebase DB
export default db;

