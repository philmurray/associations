"use strict";

/*
* This is the model representation of the top words table.
*/
module.exports = function(bookshelf){
	var TopWord = bookshelf.Model.extend({
		tableName: "game_top_words"
	},{

	});
	return TopWord;
};
