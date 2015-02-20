"use strict";

module.exports = {
	pg_host: '192.168.1.100' || process.env.PG_DB_HOST,
	pg_port: 5433 || process.env.PG_DB_PORT,
	pg_user: 'associations_dbuser' || process.env.PG_DB_USER,
	pg_database: 'associations' || process.env.PG_DB_NAME,
	pg_charset: 'utf8',
	neo4j_url: 'http://192.168.1.100:7474' || process.env.NEO4J_URL,
	session_secret: 'astride battling pretentiously passageway',
	authIds: {
		facebook: {
			clientID: 'get_your_own',
			clientSecret: 'get_your_own',
			callbackURL: 'http://127.0.0.1:1337/auth/facebook/callback'
		},
		twitter: {
			consumerKey: 'get_your_own',
			consumerSecret: 'get_your_own',
			callbackURL: "http://127.0.0.1:1337/auth/twitter/callback"
		},
		google: {
			returnURL: 'http://127.0.0.1:1337/auth/google/callback',
			realm: 'http://127.0.0.1:1337'
		}
	}
};
