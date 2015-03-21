"use strict";

/*
* This is the model representation of the Word table. It represents a single word.
*/
module.exports = function(bookshelf){
	var Word = bookshelf.Model.extend({
		tableName: "words",
		idAttribute: "text"
	},{
		search: function search(searchTerm, numRecords, done){
			return Word.query(function(qb) {
				qb.where('text', 'ILIKE', searchTerm + '%');
				qb.orderBy('text', 'asc');
				if (numRecords) qb.limit(numRecords);
			})
			.fetchAll()
				.then(function(collection) {
					return done(null, collection.map(function(model){return model.get('text');}));
				})
				.catch(done);
		}
	});
	return Word;
};
