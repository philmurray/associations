var bookshelf = require('bookshelf'),
	knex = require('knex'),
	bookshelfInstance = bookshelf(knex({
		client: 'pg',
		connection: {
			host     : '192.168.1.100' || process.env.PG_DB_HOST,
			port	 : 5433 || process.env.PG_DB_PORT,
			user     : 'associations_dbuser' || process.env.PG_DB_USER,
			password : 'password1' || process.env.PG_DB_PASSWORD,
			database : 'associations' || process.env.PG_DB_NAME,
			charset  : 'utf8'
		}
	}));

module.exports = {
	User: require("./User")(bookshelfInstance),
	Session: require("./Session")(bookshelfInstance)
};
