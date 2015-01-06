var expressSession = require('express-session');

module.exports = function(app){
	app.use(expressSession({
		secret: 'astride battling pretentiously passageway',
		resave: false,
		saveUninitialized: false
	}));
};
