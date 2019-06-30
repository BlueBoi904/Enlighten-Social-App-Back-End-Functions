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