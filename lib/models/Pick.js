"use strict";

/*
* This is the model representation of the picks table. It represents a single pick.
*/
module.exports = function(bookshelf){
	var Pick = bookshelf.Model.extend({
		tableName: "picks"
	},{

	});
	return Pick;
};
