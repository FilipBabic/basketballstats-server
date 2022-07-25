const { db } = require('../util/admin');

exports.getNextGames = (req, res) => {
    db.collection(`nextgames`)
        .orderBy('gameTime', 'asc').get()
        .then(data => {
            let nextGames = [];
            data.forEach(doc => {
                nextGames.push({
                    nextGameID: doc.id,
                    firstTeam: doc.data().firstTeam,
                    secondTeam: doc.data().secondTeam,
                    firstImage: doc.data().firstImage,
                    secondImage: doc.data().secondImage,
                    userHandle: doc.data().userHandle,
                    gameTime: doc.data().gameTime,
                    gameLocation: doc.data().gameLocation,
                    liveStream: doc.data().liveStream,
                    leagueName: doc.data().leagueName
                });
            });
            return res.status(200).json(nextGames);
        })
        .catch(err => {
            res.status(500).json('something went wrong');
            console.error(err);
        });
}

exports.arrangeGame = (req, res) => {
    const newGame = {
        firstTeam: req.body.firstTeam,
        secondTeam: req.body.secondTeam,
        arrangedBy: req.user.handle,
        time: req.body.time,
        location: req.body.location,
        leagueID: req.params.leagueID
    };
    let gameID;
    db.collection(`nextgames`).add(newGame)
        .then(doc => {
            gameID = doc.id
        })
        .then(() => {
            let teams = {
                firstTeam: {},
                secondTeam: {},
                leagueID: req.params.leagueID,
                time: req.body.time,
                location: req.body.location
            }
            db.doc(`/gamestats/${gameID}`).set(teams)
            return res.status(200).json("successfully");
        })
        .catch(err => {
            res.status(500).json('something went wrong');
            console.error(err);
        });

};

exports.getGame = (req, res) => {
    let gameData;
    db.doc(`/gamestats/${req.params.gameID}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Game not found' });
            }
            else {
                gameData = {
                    time: doc.data().gameTime,
                    location: doc.data().gameLocation,
                    firstTeam: doc.data().firstTeam,
                    secondTeam: doc.data().secondTeam
                }
                return res.status(200).json(gameData)
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}

exports.startGame = (req, res) => {
    db.doc(`/nextgames/${req.params.gameID}`).get()
        .then((doc) => {
            let liveGame = {
                firstTeam: doc.data().firstTeam,
                secondTeam: doc.data().secondTeam,
                firstTeamPoints: 0,
                secondTeamPoints: 0
            }
            db.doc(`/livegame/${req.params.gameID}`).set(liveGame)
            db.doc(`/nextgames/${req.params.gameID}`).delete()
            return res.status(200).json({ message: `game ${doc.id} started successfully` })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.finishGame = (req, res) => {
    let gameData = {
        time: req.body.time,
        location: req.body.location,
        firstTeam: req.body.firstTeam,
        secondTeam: req.body.secondTeam,
        leagueID: req.body.leagueID
    }
    db.doc(`/gamestats/${req.params.gameID}`).set(gameData)
        .then(() => {
            return res.status(200).json('game successfully saved')
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}

exports.getAllGamesForLeague = (req, res) => {
    let gamesData = []
    db.collection('gamestats').where('leagueID', '==', req.params.leagueID).get()
        .then(data => {
            data.forEach(doc => {
                let game = {
                    location: doc.data().location,
                    time: doc.data().time,
                    firstTeam: doc.data().firstTeam.name,
                    secondTeam: doc.data().secondTeam.name,
                    firstScore: doc.data().firstTeam.points,
                    secondScore: doc.data().secondTeam.points,
                    gameID: doc.id
                }
                gamesData.push(game);
            })
            return res.status(200).json(gamesData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}