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
                    createdAt: doc.data.createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
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
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db
        .collection('whispers')
        .add(newWhisper)
        .then((doc) => {
            const resWhisper = newWhisper;
            resWhisper.whisperId = doc.id;
            res.json({resWhisper});
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
            whisperData.whisperId = doc.id;
            return db
            .collection('comments')
            .orderBy('createdAt','desc')
            .where('whisperId','==', req.params.whisperId)
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
        whisperId: req.params.whisperId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/whispers/${req.params.whisperId}`).get()
        .then(doc => {
            if (!doc.exists){
                return res.status(404).json({error: 'Whisper not found'});
            }

            return doc.ref.update({ commentCount: doc.data().commentCount + 1});
        })
        .then(() => {
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

exports.likeWhisper = (req,res) => {
    //Check if a like document exists or not
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
      .where('whisperId', '==', req.params.whisperId).limit(1);

      const whisperDocument = db.doc(`/whispers/${req.params.whisperId}`);

      let whisperData;

      whisperDocument.get()
        .then(doc =>{
            if (doc.exists){
                whisperData = doc.data();
                whisperData.whisperId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({error: 'Whisper not found'});
            }
        })
        .then(data => {
            if(data.empty){
                return db.collection('likes').add({
                    whisperId: req.params.whisperId,
                    userHandle: req.user.handle
                })
                .then(() => {
                    whisperData.likeCount ++;
                    return whisperDocument.update({likeCount: whisperData.likeCount});
                })
                .then(() => {
                    return res.json(whisperData);
                })
            } else {
                return res.status(400).json({error: 'Whisper already liked'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err.code})
        });
};

exports.unlikeWhisper = (req, res) => {
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
      .where('whisperId', '==', req.params.whisperId).limit(1);

      const whisperDocument = db.doc(`/whispers/${req.params.whisperId}`);

      let whisperData;

      whisperDocument.get()
        .then(doc =>{
            if (doc.exists){
                whisperData = doc.data();
                whisperData.whisperId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({error: 'Whisper not found'});
            }
        })
        .then(data => {
            if(data.empty){
                return res.status(400).json({error: 'Whisper not liked'});
                
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                  .then(()=> {
                      whisperData.likeCount --;
                      return whisperDocument.update({likeCount: whisperData.likeCount});
                  })
                  .then(() => {
                      res.json(whisperData);
                  })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err.code})
        }); 
};

// Delete a whisper

exports.deleteWhisper = (req,res) => {
    const document = db.doc(`/whispers/${req.params.whisperId}`);
    document.get()
      .then(doc => {
        if (!doc.exists){
            return res.status(404).json({error: 'Whisper not found'});
        } 
        if (doc.data().userHandle !== req.user.handle){
            return res.status(403).json({error: 'Unauthorized'});
        } else {
            return document.delete();
        }
      })
    .then( ()=> {
        res.json({ message: 'Whisper deleted successfully'});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
    })
}

