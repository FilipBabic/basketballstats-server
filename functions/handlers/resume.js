//Like resume
const { app } = require('firebase-functions');
const { db } = require('../util/admin');
exports.likeResume = (req, res) => {
    let resumeLikesCount = 0;
    let likesCount = db.collection('resumeLikes').doc('countResumeLikes').get()
        .then((doc) => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                resumeLikesCount = doc.data().countLikes;
                return resumeLikesCount
            }
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
    const likeDocument = db.collection('resumeLikes').where('userHandle', '==', req.user.handle).limit(1);
    likeDocument.get().
        then(doc => {
            if (!doc.empty) {
                db.collection('resumeLikes').doc(`${doc.docs[0].id}`).delete()
                    .then(() => {
                        resumeLikesCount--
                        db.collection('resumeLikes').doc('countResumeLikes').update({ countLikes: resumeLikesCount })
                            .then(() => {
                                return res.status(200).json({ message: `Resume unliked` });
                            })
                            .catch(err => {
                                console.error(err);
                                res.status(500).json({ error: err.code });
                            })
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: err.code });
                    });
            } else {
                db.collection('resumeLikes').add({
                    userHandle: req.user.handle,
                })
                    .then(() => {
                        resumeLikesCount++
                        db.collection('resumeLikes').doc('countResumeLikes').update({ countLikes: resumeLikesCount })
                            .then(() => {
                                return res.status(200).json({ message: `${req.user.handle} thank you for like! ${resumeLikesCount} people also liked this resume!` });
                            })
                            .catch(err => {
                                console.error(err);
                                res.status(500).json({ error: err.code });
                            })
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: err.code });
                    })
            }
        })
}

exports.isLiked = (req, res) => {
    const likeDocument = db.collection('resumeLikes').where('userHandle', '==', req.user.handle).limit(1);
    likeDocument.get().
        then(doc => {
            if (!doc.empty) {
                return res.status(200).json({ isLiked: true })
            } else {
                return res.status(200).json({ isLiked: false });
            }
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        })
}