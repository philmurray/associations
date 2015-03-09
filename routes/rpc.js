"use strict";

var express = require('express'),
	router = express.Router(),
	models = require('../lib/models');

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).send('Not logged in.');
};

router.get('/user', isAuthenticated, function(req, res){
	res.json(req.user.safeModel());
});


router.post('/user', isAuthenticated, function(req, res){
	req.user.updateUser(req.body, function(err){
		if (err){ return res.status(500).json(err); }
		res.send(true);
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

router.get('/word', function(req,res){
	models.Word.search(req.query.text || "", 10, function(err, words){
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
