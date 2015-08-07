"use strict";

module.exports = function(app){

	var logErrors = function logErrors(err, req, res, next) {
		console.error(err.stack);
		next(err);
	};

	var errorHandler = function errorHandler(err, req, res, next) {
		res.status(500).send(err.message);
	};

	app.use(logErrors);
	app.use(errorHandler);
};
