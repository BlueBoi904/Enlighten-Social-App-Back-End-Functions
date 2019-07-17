const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const { db } = require('./util/admin');


const FBAuth = require('./util/fbauth');

const { getAllWhispers,
        postOneWhisper,
        getWhisper,
        commentOnWhisper ,
        likeWhisper,
        unlikeWhisper,
        deleteWhisper
        } = require('./handlers/whispers');
const { signup, 
        login, 
        uploadImage, 
        addUserDetails, 
        getAuthenticatedUser,
        getUserDetails,
        markNotificationsRead 
    } = require('./handlers/users');


// Whisper ROUTES 
app.get('/whispers', getAllWhispers)
app.post('/whisper', FBAuth, postOneWhisper);
app.get('/whisper/:whisperId', getWhisper);
app.delete('/whisper/:whisperId', FBAuth, deleteWhisper);
app.get('/whisper/:whisperId/like', FBAuth, likeWhisper);
app.get('/whisper/:whisperId/unlike', FBAuth, unlikeWhisper);
app.post('/whisper/:whisperId/comment', FBAuth, commentOnWhisper);

// USER ROUTES
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user' , FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth ,markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/whispers/${snapshot.data().whisperId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            whisperId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });

  exports.deleteNotificationOnUnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

  exports.onUserImageChange = functions
  .region('us-central1')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('whispers')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const whisper = db.doc(`/whispers/${doc.id}`);
            batch.update(whisper, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

  exports.createNotificationOnComment = functions
  .region('us-central1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/whispers/${snapshot.data().whisperId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            whisperId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

  exports.onWhisperDelete = functions
  .region('us-central1')
  .firestore.document('/whispers/{whisperId}')
  .onDelete((snapshot, context) => {
    const whisperId = context.params.whisperId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('whisperId', '==', whisperId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('whisperId', '==', whisperId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('whisperId', '==', whisperId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });