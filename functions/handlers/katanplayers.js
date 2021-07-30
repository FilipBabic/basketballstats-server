const { db } = require('../util/admin');

exports.addKatanPlayer = (req, res) => {
    const newPlayer = {
        name: req.body.name,
        userHandle: req.user.handle,
        pointsAverage: 0,
        pointsTotal: 0,
        positions: [0, 0, 0, 0, 0, 0],
        mmr: 0,
        createdAt: new Date().toISOString()
    };
    const katanPlayerID = newPlayer.name.split(' ').join('').toLowerCase()
    db.collection(`katanPlayers`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ error: `Player ${newPlayer.name} already exists` });
            } else {
                db.collection(`katanPlayers`).add(newPlayer)
                    .then(doc => {
                        console.log("uid", doc.uid)
                        console.log("id", doc.id)
                        return res.status(200).json({ message: `document ${katanPlayerID} created successfully` });
                    })
                    .catch(err => {
                        res.status(500).json('something went wrong');
                        console.error(err);
                    });
            }
        }).catch(err => {
            res.status(500).json('something went wrong');
            console.error(err);
        });
}

exports.katanStandings = (req, res) => {
    const docRef = db.collection("katanPlayers").orderBy('mmr', 'desc');
    docRef.get()
        .then(data => {
            let standings = [];
            let rankCount = 1
            data.forEach(doc => {
                standings.push({
                    playerName: doc.data().name,
                    rank: rankCount++,
                    mmr: doc.data().mmr,
                    pointsAverage: doc.data().pointsAverage,
                    pointsTotal: doc.data().pointsTotal,
                    positions: doc.data().positions,
                });
            });
            return res.status(200).json(standings);
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}

exports.addGame = (req, res) => {
    const tester = () => {
        let players = req.body.players;
        let points = req.body.points;
        players.forEach((player, i) => {
            console.log("Player NAme", player);
            console.log("POINTS", points[i]);
        })
    }
    tester();
    const katanGame = {
        players: req.body.players,
        gameDate: new Date().toISOString()
    }
    return db.collection('katanGames').add(katanGame)
        .then(doc => {
            console.log(doc);
            return res.status(200).json({ message: 'Game successfully added' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}