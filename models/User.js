/*
* This is the model representation of the Users table. It represents a single
* user.
*/

var Bookshelf = require('bookshelf').instance;

exports = Bookshelf.Model.extend({
	tableName: "users",
	idAttribute: "id"
});
