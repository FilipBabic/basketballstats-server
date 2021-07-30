const { db } = require('../util/admin');

exports.addTeam = (req, res) => {
    if (req.body.teamName.trim() === '') return res.status(400).json({ error: 'Must not be empty' });
    const newTeam = {
        teamName: req.body.teamName,
        leagueID: req.params.leagueID,
        userHandle: req.user.handle,
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