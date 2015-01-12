"use strict";

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
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
	passport.use('localLogin', new LocalStrategy(
		{
			usernameField: 'email'
		},
		User.loginLocal
	));

};
