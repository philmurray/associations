/*
* This is the model representation of the Users table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	return bookshelf.Model.extend({
		tableName: "users",
		idAttribute: "id"
	});
}
