"use strict";

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	config = require('../config'),
	models = require('../models'),
	User = models.User;

module.exports = function(app){

	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
		done(null, user.get("id"));
	});

	passport.deserializeUser(function(id, done) {
		new User({'id': id}).fetch()
			.then(function(model) {
				done(null,model);
			})
			.catch(done);
	});

	// passport/login.js
	passport.use('local', new LocalStrategy({
			usernameField: 'email'
		},
		User.loginLocal
	));

	passport.use('facebook', new FacebookStrategy({
			clientID: config.authIds.facebook.clientID,
			clientSecret: config.authIds.facebook.clientSecret,
			callbackURL: '/auth/facebook/callback'
		},
		User.loginSocial
	));

	passport.use('twitter', new TwitterStrategy({
			consumerKey: config.authIds.twitter.consumerKey,
			consumerSecret: config.authIds.twitter.consumerSecret,
			callbackURL: '/auth/twitter/callback'
		},
		User.loginSocial
	));

	passport.use('google', new GoogleStrategy({
			clientID: config.authIds.google.consumerKey,
			clientSecret: config.authIds.google.consumerSecret,
			callbackURL: '/auth/google/callback'
		},
		User.loginSocial
	));

};
