"use strict";

var express = require('express'),
	router = express.Router(),
	models = require('../lib/models');

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).send('Not logged in.');
};

router.get('/authenticated', function(req, res){
	res.send(req.isAuthenticated());
});
router.get('/user', isAuthenticated, function(req, res){
	res.json(req.user.safeModel());
});


router.post('/user', isAuthenticated, function(req, res){
	req.user.updateUser(req.body, function(err){
		if (err){ return res.status(500).json(err); }
		res.send(true);
	});
});

router.get('/users', isAuthenticated, function(req,res){
	models.User.search(req.user, req.query.search || "", 15, function(err, users){
		if (err){ return res.status(500).send(err.message); }
		res.json(users);
	});
});
router.get('/recentUsers', isAuthenticated, function(req,res){
	models.User.recentPlayers(req.user, function(err, users){
		if (err){ return res.status(500).send(err.message); }
		res.json(users);
	});
});
router.get('/questions', isAuthenticated, function(req,res){
	models.Question.getAllQuestions(req.user, function(err, questions){
		if (err){ return res.status(500).send(err.message); }
		res.json(questions);
	});
});

router.post('/questions', isAuthenticated, function(req,res){
	models.Question.saveUserAnswers(req.user, req.body, function(err){
		if (err){ return res.status(500).send(err.message); }
		res.send(true);
	});
});

router.get('/color', function(req,res){
	models.Color.getActiveColor(req.user, function(err, color){
		if (err){ return res.status(500).send(err.message); }
		res.json(color);
	});
});

router.get('/colorlist', function(req,res){
	models.Color.getAllColors(function(err, colors){
		if (err){ return res.status(500).send(err.message); }
		res.json(colors);
	});
});

router.get('/games', isAuthenticated, function(req,res){
	var method = req.query.pending ? models.Game.getPendingGames : models.Game.getGames;

	method(req.user, req.query.pageSize || 10, req.query.page || 0, function(err, game){
		if (err){ return res.status(500).send(err.message); }
		res.json(game);
	});
});
router.post('/game', isAuthenticated, function(req,res){
	models.Game.createGame(req.user, req.body.players, function(err, game){
		if (err){ return res.status(500).send(err.message); }
		res.json(game);
	});
});
router.get('/game/:gameId', function(req,res){
	models.Game.getGame(req.user, req.params.gameId, function(err, game){
		if (err){ return res.status(500).send(err.message); }
		res.json(game);
	});
});
router.post('/game/:gameId/start', isAuthenticated, function(req,res){

	models.GameUser.startGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});
router.post('/game/:gameId/stop', isAuthenticated, function(req,res){

	models.GameUser.stopGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});
router.post('/game/:gameId/decline', isAuthenticated, function(req,res){

	models.GameUser.declineGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});
router.get('/game/:gameId/resume', isAuthenticated, function(req,res){

	models.GameUser.resumeGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});
router.post('/game/:gameId/submitWord', isAuthenticated, function(req,res){

	models.GameUser.submitWord(req.user, req.params.gameId, req.body, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});

router.put('/game/:gameId/chat', isAuthenticated, function(req, res){
	models.Chat.addChat(req.user, req.params.gameId, req.body, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});
router.get('/game/:gameId/chats', isAuthenticated, function(req, res){
	models.Chat.getChats(req.user, req.params.gameId, function(err, ret){
		if (err){ return res.status(500).send(err.message); }
		res.json(ret);
	});
});

router.get('/word', function(req,res){
	models.Word.search(req.query.text || "", 150, function(err, words){
		if (err){ return res.status(500).send(err.message); }
		res.json(words);
	});
});

router.get('/wordGraph/:word', function(req,res){
	models.words.getWordGraph(req.params.word,function(err, graph){
		if (err){ return res.status(500).send(err.message); }
		res.json(graph);
	});
});

router.get('/wordPath/:from/:to', function(req,res){
	models.words.getWordPath(req.params.from,req.params.to,function(err, graph){
		if (err){ return res.status(500).send(err.message); }
		res.json(graph);
	});
});

module.exports = router;
