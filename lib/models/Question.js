"use strict";

/*
* This is the model representation of the questions table. It represents a single question.
*/
module.exports = function(bookshelf){
	var Question = bookshelf.Model.extend({
		tableName: "questions",
		answers: function() {
			var Answer = require('../models').Answer;
			return this.hasMany(Answer);
		}
	},{
		getAllQuestions: function(done){
			return new Question().fetchAll({withRelated:"answers"}).then(function (questions){
				return done(null, questions.toJSON());
			}).catch(done);
		}
	});
	return Question;
};
