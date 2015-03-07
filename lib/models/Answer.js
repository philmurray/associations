"use strict";

/*
* This is the model representation of the answers table. It represents a single answer.
*/
module.exports = function(bookshelf){
	var Answer = bookshelf.Model.extend({
		tableName: "answers"
	},{

	});
	return Answer;
};
