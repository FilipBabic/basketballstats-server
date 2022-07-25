const { db } = require('../util/admin');

exports.getGamePlayers = (req, res) => {
    db.collection('players').where('teamID', '==', req.params.teamID).get()
        .then(data => {
            let players = [];
            data.forEach(doc => {
                players.push({
                    name: doc.data().name
                });
            });
            return res.status(200).json(players);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        })
}