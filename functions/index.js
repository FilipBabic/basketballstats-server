const functions = require("firebase-functions");
const express = require('express');
var cors = require('cors');
const app = express();
app.use(cors());
const FBAuth = require('./util/fbAuth');

const { getAllLeagues, createLeague, getLeague, leagueStandings } = require('./handlers/leagues');
const { signup, login, uploadImage, addUserDetails, getUser } = require('./handlers/users');
const { addTeam, createTeam, getTeam, convertTeamNameToImage } = require('./handlers/teams');
const { likeResume, isLiked } = require('./handlers/resume');
const { getNextGames, arrangeGame, getGame, startGame, finishGame, getAllGamesForLeague } = require('./handlers/games');
const { getGamePlayers } = require('./handlers/players');
const { addKatanPlayer, katanStandings, addGame } = require('./handlers/katanplayers');
//league routes
app.get('/leagues', getAllLeagues);
app.post('/createleague', FBAuth, createLeague);
app.get('/leagues/:leagueID', getLeague);
//teams routes
app.post('/addteam/:leagueID', FBAuth, addTeam);
app.post('/createteam/:leagueID', FBAuth, createTeam);
app.get('/:leagueID/standings', leagueStandings);
app.get('/team/:teamName', getTeam);
app.get('/convertimage/:teamName', convertTeamNameToImage)
//game routes
app.get('/nextgames', getNextGames);
app.get('/game/:gameID', getGame);
app.delete('/startgame/:gameID', startGame)
app.get('/games/:leagueID', getAllGamesForLeague)
app.post('/arrangegame/:leagueID', FBAuth, arrangeGame);
app.post('/finishgame/:gameID', FBAuth, finishGame)
//player routes
app.get('/gameplayers/:teamID', FBAuth, getGamePlayers);
//katan routes
app.post('/addkatanplayer', FBAuth, addKatanPlayer);
app.get('/katanstandings', FBAuth, katanStandings);
app.post('/addkatangame', addGame);
//user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getUser);
app.get('/likeresume', FBAuth, likeResume);
app.get('/isliked', FBAuth, isLiked);
exports.api = functions.region('europe-west1').https.onRequest(app);