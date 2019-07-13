const { db } = require ('../util/admin')

exports.getAllWhispers = (req, res) => {
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
}

exports.postOneWhisper = (req, res) => {
    
    if (req.body.body.trim() === ''){
        return res.status(400).json({body: 'Body must not be empty'});
    }


    const newWhisper = {
        body: req.body.body,
        userHandle: req.user.handle,
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
}

// Grabing a whisper and its comments
//
exports.getWhisper = (req,res) => {
    let whisperData = {};
    db.doc(`/whispers/${req.params.whisperId}`).get()
        .then(doc => {
            if (!doc.exists){
                return res.status(404).json({error: 'Whisper not found'})
            } 
            whisperData = doc.data();
            whisperData.screamId = doc.id;
            return db
            .collection('comments')
            .orderBy('createdAt','desc')
            .where('whisperid','==', req.params.whisperId)
            .get();
        })
        .then(data => {
            whisperData.comments = [];
            data.forEach(doc => {
                whisperData.comments.push(doc.data())
            });
            return res.json(whisperData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: err.code});
        });
}
// Comment on a comment
exports.commentOnWhisper = (req, res) => {
    if (req.body.body.trim() === '') return res.status(400).json({ error: 'Must no be empty'});

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        whisperid: req.params.whisperId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/whispers/${req.params.whisperId}`).get()
        .then(doc => {
            if (!doc.exists){
                return res.status(404).json({error: 'Whisper not found'});
            }

            return db.collection('comments').add(newComment);
        })
        .then(()=> {
            res.json(newComment);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: 'Something went wrong'});
        })

}
