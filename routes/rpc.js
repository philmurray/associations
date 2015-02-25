"use strict";

var express = require('express'),
	router = express.Router(),
	Word = require('../lib/models').Word,
	graph = require('../lib/graph');

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.status(401).send('Not logged in.');
};

router.get('/user', isAuthenticated, function(req, res){
	res.json(req.user.safeModel());
});

router.get('/word', function(req,res){
	Word.search(req.query.text || "", 10, function(err, words){
		if (err){ return res.status(500).send(err.message); }
		res.json(words);
	});
});

router.get('/wordGraph/:word', function(req,res){
	graph.getWordGraph(req.params.word,function(err, graph){
		if (err){ return res.status(500).send(err.message); }
		res.json(graph);
	});
});

router.get('/wordPath/:from/:to', function(req,res){
	graph.getWordPath(req.params.from,req.params.to,function(err, graph){
		if (err){ return res.status(500).send(err.message); }
		res.json(graph);
	});
});

module.exports = router;
