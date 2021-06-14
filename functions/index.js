const functions = require("firebase-functions");
const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors());
const FBAuth = require('./util/fbAuth');

const { getAllLeagues, createOneLeague, getLeague } = require('./handlers/leagues');
const { signup, login, uploadImage, addUserDetails, getUser} = require('./handlers/users');
const { addTeam } = require('./handlers/teams');
//league routes
app.get('/leagues',getAllLeagues);
app.post('/createleague', FBAuth, createOneLeague);
app.get('/league/:leagueId', getLeague )
//teams routes
// app.get('/teams', FBAuth, getAllTeams);
app.post('/leagues/:leagueId/teams', FBAuth, addTeam);
//user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getUser);
exports.api = functions.region('europe-west1').https.onRequest(app);