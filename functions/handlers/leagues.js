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
                    createdAt: doc.data().createdAt,
                    logoUrl: doc.data().logoUrl,
                    country: doc.data().country,
                    region: doc.data().region,
                    about: doc.data().about,
                    seasonStatus: doc.data().status,
                    statisticians: doc.data().statisticians,
                    owner: doc.data().owner,
                    isPro: doc.data().isPro
                });
            });
            return res.json(leagues);
        })
        .catch(err => console.error(err));
};

exports.createLeague = (req, res) => {
    const newLeague = {
        leagueName: req.body.leagueName,
        userHandle: req.user.email,
        owner: req.user.email,
        about: req.body.about || "",
        country: req.body.country,
        region: req.body.region,
        logoUrl: req.body.logoUrl || "defined logo url",
        status: req.body.status || "regular",
        isPro: req.body.isPro || false,
        statisticians: req.body.statisticians || [`${req.user.email}`],
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
                        return res.status(200).json({ message: `League Name ${newLeague.leagueName} with document id: ${leagueID} created successfully` });
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
                    image: doc.data().image,
                    points: doc.data().points,
                    p: doc.data().seasons[0].stats[0],
                    gw: doc.data().seasons[0].stats[1],
                    gl: doc.data().seasons[0].stats[2],
                    ps: doc.data().seasons[0].stats[3],
                    pr: doc.data().seasons[0].stats[4],
                    pr2: doc.data().seasons[0].stats[5],
                    pr3: doc.data().seasons[0].stats[6],
                    pr4: doc.data().seasons[0].stats[7],
                    pr5: doc.data().seasons[0].stats[8],
                    pr6: doc.data().seasons[0].stats[9],
                    pr7: doc.data().seasons[0].stats[10],
                    pr8: doc.data().seasons[0].stats[11],
                    pr9: doc.data().seasons[0].stats[12],
                    pr10: doc.data().seasons[0].stats[13],
                    pr11: doc.data().seasons[0].stats[14],
                    pr12: doc.data().seasons[0].stats[15],
                    rank: rankCount++
                });
            });
            return res.status(200).json(standings);
        }).catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code })
        })
}