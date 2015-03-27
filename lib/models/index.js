"use strict";

var bookshelf = require('bookshelf'),
	knex = require('knex'),
	config = require('../config'),
	bookshelfInstance = bookshelf(knex({
		client: 'pg',
		connection: {
			host: config.pg_host,
			port: config.pg_port,
			user: config.pg_user,
			database: config.pg_database,
			charset: config.pg_charset
		}
	}));

var models = module.exports = {};

models.Color = require("./Color")(bookshelfInstance);
models.User = require("./User")(bookshelfInstance);
models.Session = require("./Session")(bookshelfInstance);
models.Word = require("./Word")(bookshelfInstance);
models.Answer = require("./Answer")(bookshelfInstance);
models.UserAnswer = require("./UserAnswer")(bookshelfInstance);
models.Question = require("./Question")(bookshelfInstance);
models.Game = require("./Game")(bookshelfInstance);
models.GameUser = require("./GameUser")(bookshelfInstance);
models.GameWord = require("./GameWord")(bookshelfInstance);
models.Pick = require("./Pick")(bookshelfInstance);
models.words = require("./words");
