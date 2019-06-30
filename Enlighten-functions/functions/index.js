const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const FBAuth = require('./util/fbauth');

const { getAllWhispers, postOneWhisper } = require('./handlers/whispers');
const { signup, login } = require('./handlers/users');


// Whisper ROUTES 
app.get('/whispers', getAllWhispers)
app.post('/whisper', FBAuth, postOneWhisper);

// USER ROUTES
app.post('/signup', signup);
app.post('/login', login)


exports.api = functions.https.onRequest(app);