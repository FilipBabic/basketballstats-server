const { app } = require('firebase-functions');
const { db } = require('../util/admin');

exports.getAllLeagues = (req, res) => {
    db.collection(`leagues`)
        .orderBy('createdAt', 'desc').get()
        .then(data => {
            let leagues = [];
            data.forEach(doc => {
                leagues.push({
                    leagueID: doc.id,
                    leagueName: doc.data().leagueName,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(leagues);
        })
        .catch(err => console.error(err));
};

exports.createLeague = (req, res) => {
    const newLeague = {
        leagueName: req.body.leagueName,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    const leagueID = newLeague.leagueName.split(' ').join('').toLowerCase()
    db.doc(`/leagues/${leagueID}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ error: `League name ${newLeague.leagueName} already exists` });
            } else {
                db.doc(`/leagues/${leagueID}`).set(newLeague)
                    .then(doc => {
                        return res.status(200).json({ message: `document ${leagueID} created successfully` });
                    })
                    .catch(err => {
                        res.status(500).json('something went wrong');
                        console.error(err);
                    });
            }
        })

};

exports.getLeague = (req, res) => {
    let leagueData;
    db.doc(`/leagues/${req.params.leagueID}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'league not found' });
            }
            leagueData = doc.data();
            return db.collection('teams').where('leagueID', '==', req.params.leagueID).get()
                .then(data => {
                    leagueData.teams = [];
                    data.forEach((doc) => {
                        leagueData.teams.push(doc.data());
                    })
                    console.log('LEAGUE DATA: ', leagueData);
                    return res.json(leagueData);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: err.code })
                })
        })
}

exports.leagueStandings = (req, res) => {
    const leagueStandings = db.collection('teams').where('leagueID', '==', req.params.leagueID).orderBy('points', 'desc');
    leagueStandings.get()
        .then(data => {
            let standings = [];
            let rankCount = 1
            data.forEach(doc => {
                standings.push({
                    teamName: doc.id,
                    points: doc.data().points,
                    gp: doc.data().gp,
                    gw: doc.data().gw,
                    rank: rankCount++
                });
            });
            return res.status(200).json(standings);
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}