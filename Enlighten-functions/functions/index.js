const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const config = {
    apiKey: "AIzaSyBoxSyWeiwLLJlDFujJJjkkzs6S7yeRQIg",
    authDomain: "enlightened-d7a2f.firebaseapp.com",
    databaseURL: "https://enlightened-d7a2f.firebaseio.com",
    projectId: "enlightened-d7a2f",
    storageBucket: "enlightened-d7a2f.appspot.com",
    messagingSenderId: "457963252299",
    appId: "1:457963252299:web:1e67b5e285df201f"
  };


const firebase = require('firebase')
firebase.initializeApp(config)

const db = admin.firestore();

// Route to get all whispers
app.get('/whispers', (req, res) => {
        db
        .collection('whispers')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let whispers = [];
            data.forEach(doc => {
                whispers.push({
                    whisperId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data.createdAt
                });
            });
            return res.json(whispers);
        })
        .catch(err => console.error(err));
})

// Route to create new whisper
app.post('/whisper', (req, res) => {
    const newWhisper = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

        db
        .collection('whispers')
        .add(newWhisper)
        .then((doc) => {
            res.json({
                message: `document ${doc.id} created successfully`
            })
        })
        .catch(err => {
            res.status(500).json({
                error: 'something went wrong'
            })
            console.error(err);
        });
})

// Signup route
// Setting up new user object when the user signs up
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
        
    }
    // TODO validate data

    //Check for unique user handle
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists){
                return res.status(400).json({
                    handle: 'This handle is already taken'
                })
            } else {
                return firebase
                .auth()
                .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data =>{
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then (idToken =>{
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() =>{
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err)
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({email: 'Email is already in use'})
            } else {
                return res.status(500).json({error: err.code});
            }
        });
});

exports.api = functions.https.onRequest(app);