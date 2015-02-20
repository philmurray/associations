"use strict";

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GoogleStrategy = require('passport-google').Strategy,
	config = require('./config'),
	models = require('./models'),
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
			.catch(function(err){
				done(err);
			});
	});

	// passport/login.js
	passport.use('localLogin', new LocalStrategy({
			usernameField: 'email'
		},
		User.loginLocal
	));

	passport.use(new FacebookStrategy({
			clientID: config.authIds.facebook.clientID,
			clientSecret: config.authIds.facebook.clientSecret,
			callbackURL: config.authIds.facebook.callbackURL
		},
		User.loginSocial
	));

	passport.use(new TwitterStrategy({
			consumerKey: config.authIds.twitter.consumerKey,
			consumerSecret: config.authIds.twitter.consumerSecret,
			callbackURL: config.authIds.twitter.callbackURL
		},
		User.loginSocial
	));

	passport.use(new GoogleStrategy({
			returnURL: config.authIds.google.returnURL,
			realm: config.authIds.google.realm
		},
		User.loginSocial
	));

};
