"use strict";

var express = require('express'),
	router = express.Router(),
	passport = require('passport');

router.post('/local', passport.authenticate('local'), function(req, res){
	res.json(true);
});

router.get('/facebook/:route*',function(req, res, next) {
	passport.authenticate('facebook', {
		callbackURL: '/auth/facebook/callback/' + req.params.route
	})(req, res, next);
});
router.get('/facebook/callback/:route*',
	passport.authenticate('facebook', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect('/#/' + req.params.route);
	});

router.get('/twitter/:route*',function(req, res, next) {
	passport.authenticate('twitter', {
		callbackURL: '/auth/twitter/callback/' + req.params.route
	})(req, res, next);
});
router.get('/twitter/callback/:route*',
	passport.authenticate('twitter', {
		failureRedirect: '/'
	}),
	function(req, res) {
		res.redirect('/#/' + req.params.route);
	});

router.get('/google/:route*',function(req, res, next) {
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
		if (req.isAuthenticated())
			res.redirect('/#/' + req.session.route);
			return next();
	});

/* Handle Logout */
router.get('/logout', function(req, res) {
	req.logout();
	res.json(true);
});

module.exports = router;
