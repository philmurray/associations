"use strict";
/*
* This is the model representation of the locks_users table. It represents a players status for a locked bit of data
*/
module.exports = function(bookshelf){
	var LockUser = bookshelf.Model.extend({
		tableName: "locks_users",
		idAttribute: null
	},{

	});
	return LockUser;
};
