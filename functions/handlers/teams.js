const { db } = require('../util/admin');

exports.addTeam = (req, res) => {
    if (req.body.teamName.trim() === '') return res.status(400).json({ error: 'Must not be empty' });
    const newTeam = {
        teamName: req.body.teamName,
        leagueID: req.params.leagueID,
        userHandle: req.user.handle,
        gp: 0,
        gw: 0,
        points: 0,
        createdAt: new Date().toISOString()
    };
    console.log(req.body);

    db.doc(`/teams/${newTeam.teamName}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ error: `Team name ${newTeam.teamName} already exists` });
            } else {
                db.doc(`/teams/${newTeam.teamName}`).set(newTeam);
                return res.status(200).json({ message: `team with id: ${doc.id} created successfully` });
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json('something went wrong')
        });
}
exports.createTeam = (req, res) => {
    if (req.body.teamName.trim() === '') return res.status(400).json({ error: 'Must not be empty' });
    const newTeam = {
        teamName: req.body.teamName,
        leagueID: req.params.leagueID,
        userHandle: req.user.handle,
        image: req.body.image,
        points: req.body.points,
        seasons: req.body.seasons,
        createdAt: new Date().toISOString()
    };
    console.log(req.body);

    db.doc(`/teams/${newTeam.teamName}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ error: `Team name ${newTeam.teamName} already exists` });
            } else {
                db.doc(`/teams/${newTeam.teamName}`).set(newTeam);
                return res.status(200).json({ message: `team with id: ${doc.id} created successfully` });
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json('something went wrong')
        });
}
exports.getTeam = (req, res) => {
    let teamData;
    let leagueID;
    db.doc(`/teams/${req.params.teamName}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'team not found' });
            }
            leagueID = doc.data().leagueID
            teamData = {
                teamName: doc.data().teamName,
                image: doc.data().image,
                seasons: doc.data().seasons
            }
            return db.collection('players').where('teamID', '==', req.params.teamName).get()
        }).then(data => {
            teamData.players = [];
            data.forEach(doc => {
                let player = {
                    name: doc.data().name,
                    position: doc.data().position,
                    jersey: doc.data().jersey,
                    id: doc.id,
                }
                teamData.players.push(player);
            })
            return db.collection('gamestats').where('leagueID', '==', leagueID).get()
        }).then(data => {
            teamData.games = [];
            let teamName = req.params.teamName
            data.forEach(doc => {
                if (teamName == doc.data().firstTeam.name || teamName == doc.data().secondTeam.name) {
                    let games = {
                        time: doc.data().time,
                        location: doc.data().location,
                        firstTeam: doc.data().firstTeam.name,
                        secondTeam: doc.data().secondTeam.name,
                        score: `${doc.data().firstTeam.points}:${doc.data().secondTeam.points}`,
                        gameID: doc.id
                    }
                    teamData.games.push(games)
                }
            })
            return res.status(200).json(teamData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}
exports.convertTeamNameToImage = (req, res) => {
    let teamName = req.params.teamName
    db.doc(`/teams/${teamName}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'not found team with this name' });
            }
            let imageUrl = doc.data().image
            return res.status(200).json(imageUrl)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}