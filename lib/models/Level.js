"use strict";

/*
* This is the model representation of the levels table.
*/
module.exports = function(bookshelf){
	var Level = bookshelf.Model.extend({
		tableName: "levels"
	},{

	});
	return Level;
};
