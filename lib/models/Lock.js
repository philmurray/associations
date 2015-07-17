"use strict";

/*
* This is the model representation of the locks table.
*/
module.exports = function(bookshelf){
	var Lock = bookshelf.Model.extend({
		tableName: "locks"
	},{

	});
	return Lock;
};
