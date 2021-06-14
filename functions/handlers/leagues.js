const { app } = require('firebase-functions');
const { db } = require('../util/admin');

exports.getAllLeagues = (req, res) =>{
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

exports.createOneLeague = (req, res) => {
    const newLeague = {
        leagueName: req.body.leagueName,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    db.collection(`leagues`).add(newLeague)
    .then(doc => {
        res.json({ message: `document ${doc.id} created successfully`});
    })
    .catch(err => { 
        res.status(500).json('something went wrong');
        console.error(err);
    });
};

exports.getLeague = (req, res) => {
    let leagueData = {};
    console.log('SOMETHING SMART',req.params.leagueId);
    db.doc(`/leagues/${req.params.leagueId}`).get()
    .then(doc => {
        if(!doc.exists) {
            return res.status(404).json({ error: 'league not found' });
        }
        leagueData = doc.data();
        leagueData.leagueId = doc.id;
        return db.collection('leagues').doc(doc.id).collection('teams').get()
        .then(data => {
            leagueData.teams = [];
            data.forEach((doc)=>{
                leagueData.teams.push(doc.data());
            })
            console.log('LEAGUE DATA: ', leagueData);
            return res.json(leagueData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code})
        })
    })
}