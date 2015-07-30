"use strict";

var Promise = require('bluebird'),
	spell = require('spell');

/*
* This is the model representation of the Word table. It represents a single word.
*/
module.exports = function(bookshelf){
	var Word = bookshelf.Model.extend({
		tableName: "words",
		idAttribute: "text"
	},{
		check: function(word, done){
			return dictionary.then(function(dict){
				return dict.suggest(word.toLowerCase()).map(function(suggestion){return suggestion.word;}).slice(0,5);
			}).nodeify(done);
		}
	});

	var dictionary = new Word().fetchAll().then(function(models){
		var dict = spell();
		models.forEach(function(model){
			dict.add_word(model.get('text'), {score: models.length - model.get('rank')});
		});
		return dict;
	});

	return Word;
};
