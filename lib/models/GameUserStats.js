"use strict";

/*
* This is the model representation of the game_user_stats table.
*/
module.exports = function(bookshelf){
	var GameUserStats = bookshelf.Model.extend({
		tableName: "user_game_stats"
	},{
	});
	return GameUserStats;
};
