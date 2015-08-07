"use strict";

var express = require('express'),
	router = express.Router(),
	models = require('../lib/models');

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).send('Not logged in.');
};

router.get('/authenticated', function(req, res, next){
	res.send(req.isAuthenticated());
});
router.get('/user', isAuthenticated, function(req, res, next){
	res.json(req.user.safeModel());
});


router.post('/user', isAuthenticated, function(req, res, next){
	req.user.updateUser(req.body, function(err){
		if (err){ return next(err); }
		res.send(true);
	});
});

router.get('/user/notifications', isAuthenticated, function(req, res, next){
	models.User.getNotifications(req.user, function(err, notifications){
		if (err){ return next(err); }
		res.json(notifications);
	});
});

router.get('/users', isAuthenticated, function(req, res, next){
	models.User.search(req.user, req.query.search || "", 15, function(err, users){
		if (err){ return next(err); }
		res.json(users);
	});
});
router.get('/recentUsers', isAuthenticated, function(req, res, next){
	models.User.recentPlayers(req.user, function(err, users){
		if (err){ return next(err); }
		res.json(users);
	});
});
router.get('/questions', isAuthenticated, function(req, res, next){
	models.Question.getAllQuestions(req.user, function(err, questions){
		if (err){ return next(err); }
		res.json(questions);
	});
});

router.post('/questions', isAuthenticated, function(req, res, next){
	models.Question.saveUserAnswers(req.user, req.body, function(err){
		if (err){ return next(err); }
		res.send(true);
	});
});

router.get('/lock/:data', isAuthenticated, function(req, res, next){
	models.Lock.get(req.user, req.params.data, function(err, data){
		if (err){ return next(err); }
		res.json(data);
	});
});

router.get('/color', function(req, res, next){
	models.Color.getActiveColor(req.user, function(err, color){
		if (err){ return next(err); }
		res.json(color);
	});
});

router.get('/colorlist', function(req, res, next){
	models.Color.getAllColors(function(err, colors){
		if (err){ return next(err); }
		res.json(colors);
	});
});

router.get('/games', isAuthenticated, function(req, res, next){
	var method = req.query.pending ? models.Game.getPendingGames : models.Game.getGames;

	method(req.user, req.query.multi, req.query.pageSize || 10, req.query.page || 0, function(err, game){
		if (err){ return next(err); }
		res.json(game);
	});
});
router.post('/game', isAuthenticated, function(req, res, next){
	models.Game.createGame(req.user, req.body.players, function(err, game){
		if (err){ return next(err); }
		res.json(game);
	});
});
router.get('/game/:gameId', function(req, res, next){
	models.Game.getGame(req.user, req.params.gameId, function(err, game){
		if (err){ return next(err); }
		res.json(game);
	});
});
router.post('/game/:gameId/start', isAuthenticated, function(req, res, next){

	models.GameUser.startGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});
router.post('/game/:gameId/stop', isAuthenticated, function(req, res, next){

	models.GameUser.stopGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});
router.post('/game/:gameId/decline', isAuthenticated, function(req, res, next){

	models.GameUser.declineGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});
router.get('/game/:gameId/resume', isAuthenticated, function(req, res, next){

	models.GameUser.resumeGame(req.user, req.params.gameId, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});
router.post('/game/:gameId/submitWord', isAuthenticated, function(req, res, next){

	models.GameUser.submitWord(req.user, req.params.gameId, req.body, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});

router.put('/game/:gameId/chat', isAuthenticated, function(req, res, next){
	models.Chat.addChat(req.user, req.params.gameId, req.body, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});
router.get('/game/:gameId/chats', isAuthenticated, function(req, res, next){
	models.Chat.getChats(req.user, req.params.gameId, function(err, ret){
		if (err){ return next(err); }
		res.json(ret);
	});
});

router.get('/word/:word', function(req, res, next){
	models.Word.check(req.params.word, function(err, words){
		if (err){ return next(err); }
		res.json(words);
	});
});

router.get('/wordGraph/:word', function(req, res, next){
	models.words.getWordGraph(req.params.word,function(err, graph){
		if (err){ return next(err); }
		res.json(graph);
	});
});

router.get('/wordPath/:from/:to', function(req, res, next){
	models.words.getWordPath(req.params.from,req.params.to,function(err, graph){
		if (err){ return next(err); }
		res.json(graph);
	});
});

module.exports = router;
