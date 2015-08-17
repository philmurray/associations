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
models.ScoredPick = require("./ScoredPick")(bookshelfInstance);
models.TopWord = require("./TopWord")(bookshelfInstance);
models.Chat = require("./Chat")(bookshelfInstance);
models.Level = require("./Level")(bookshelfInstance);
models.Lock = require("./Lock")(bookshelfInstance);
models.LockUser = require("./LockUser")(bookshelfInstance);
models.GameUserStats = require("./GameUserStats")(bookshelfInstance);
models.UserStats = require("./UserStats")(bookshelfInstance);
models.words = require("./words");

//
// var pg = require('pg');
// pg.connect(bookshelfInstance.knex.client.connectionSettings, function(err, client){
	// if(err) {
	// console.log(err);
	// }
	// client.on('notification', function(msg) {
	// console.log(msg);
	// });
	// var query = client.query("LISTEN watchers");
// });
