module.exports = {
	pg_host: '192.168.1.100' || process.env.PG_DB_HOST,
	pg_port: 5433 || process.env.PG_DB_PORT,
	pg_user: 'associations_dbuser' || process.env.PG_DB_USER,
	pg_database: 'associations' || process.env.PG_DB_NAME,
	pg_charset: 'utf8',
	session_secret: 'astride battling pretentiously passageway'
};
