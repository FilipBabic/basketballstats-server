const { db } = require('../util/admin');

exports.addTeam = (req,res) => {
    if(req.body.teamName.trim() === '')return res.status(400).json({error: 'Must not be empty'});
    const newTeam = {
        teamName: req.body.teamName,
        //userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    console.log(req.body);
    db.collection(`leagues`).doc.id.collection(`teams`).add(newTeam)
    .then(doc => {
        res.json({ message: `team with id: ${doc.id} created successfully`});
    })
    .catch(err => { 
        res.status(500).json('something went wrong');
        console.error(err);
    });
}