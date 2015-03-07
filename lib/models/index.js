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

module.exports = {
	Color: require("./Color")(bookshelfInstance),
	User: require("./User")(bookshelfInstance),
	Session: require("./Session")(bookshelfInstance),
	Word: require("./Word")(bookshelfInstance),
	Question: require("./Question")(bookshelfInstance),
	Answer: require("./Answer")(bookshelfInstance),
	words: require("./words")
};
