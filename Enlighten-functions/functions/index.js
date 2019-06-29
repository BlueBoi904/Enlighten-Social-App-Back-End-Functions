const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello world");
});

exports.getWhispers = functions.https.onRequest((req, res) => {
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
});

exports.createWhisper = functions.https.onRequest((req, res) => {
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
            res.json({message: `document ${doc.id} created successfully`}) 
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'})
            console.error(err);
        });
});