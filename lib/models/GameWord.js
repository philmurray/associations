"use strict";
/*
* This is the model representation of the games_users table. It represents a players status for a game
*/
module.exports = function(bookshelf){
	var GameWord = bookshelf.Model.extend({
		tableName: "games_words",
		idAttribute: null
	},{

	});
	return GameWord;
};
