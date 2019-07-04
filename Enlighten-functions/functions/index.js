const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const FBAuth = require('./util/fbauth');

const { getAllWhispers, postOneWhisper } = require('./handlers/whispers');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require('./handlers/users');


// Whisper ROUTES 
app.get('/whispers', getAllWhispers)
app.post('/whisper', FBAuth, postOneWhisper);

// USER ROUTES
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user' , FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);