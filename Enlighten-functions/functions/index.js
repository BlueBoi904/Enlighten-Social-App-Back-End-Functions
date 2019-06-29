const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();


app.get('/whispers', (req,res) => {
    admin
        .firestore()
        .collection('whispers')
        .get()
        .then(data => {
            let whispers = [];
            data.forEach(doc => {
                whispers.push(doc.data());
            });
            return res.json(whispers);
        })
        .catch(err => console.error(err));
})

app.post('/whisper', (req, res) => {
    const newWhisper = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection('whispers')
        .add(newWhisper)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully`}) 
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'})
            console.error(err);
        });
})

exports.api = functions.https.onRequest(app);
