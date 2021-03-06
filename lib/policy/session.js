"use strict";

var expressSession = require('express-session'),
	models = require('../models'),
	config = require('../config'),
	Session = models.Session,
	Store = expressSession.Store;

module.exports = function(app){
	var store = new Store();
	['get','set','destroy'].forEach(function(key){
		store[key] = Session[key].bind(Session);
	});

	app.use(expressSession({
		store: store,
		secret: config.session_secret,
		cookie: { path: '/', httpOnly: true, secure: false, maxAge: 1000*60*60*24*7 },
		saveUninitialized: false,
		resave: false
	}));
};
