"use strict";

/*
* This is the model representation of the picks_scored view. It represents a single scored pick.
*/
module.exports = function(bookshelf){
	var ScoredPick = bookshelf.Model.extend({
		tableName: "picks_scored"
	},{

	});
	return ScoredPick;
};
