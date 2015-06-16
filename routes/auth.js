"use strict";

var express = require('express'),
	router = express.Router(),
	passport = require('passport');

router.post('/local', passport.authenticate('local'), function(req, res){
	res.json(true);
});


router.get('/facebook/login/:route*?',function(req, res, next) {
	req.session.route = req.params.route;
	passport.authenticate('facebook')(req, res, next);
});
router.get('/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect('/#/' + req.session.route);
	});

router.get('/twitter/login/:route*?',function(req, res, next) {
	req.session.route = req.params.route;
	passport.authenticate('twitter')(req, res, next);
});
router.get('/twitter/callback',
	passport.authenticate('twitter', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect('/#/' + req.session.route);
	});

router.get('/google/login/:route*?',function(req, res, next) {
	req.session.route = req.params.route;
	passport.authenticate('google', {
		scope: "https://www.googleapis.com/auth/plus.login"
	})(req, res, next);
});
router.get('/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect('/#/' + req.session.route);
	});

/* Handle Logout */
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;
