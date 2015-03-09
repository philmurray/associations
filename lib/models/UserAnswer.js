"use strict";

/*
* This is the model representation of the answers table. It represents a single answer.
*/
module.exports = function(bookshelf){
	var UserAnswer = bookshelf.Model.extend({
		tableName: "answers_users",
		idAttribute: null
	},{
		upsert: function(user_id, question_id, answer_id){
			var userAnswer = new UserAnswer({question_id: question_id, user_id: user_id});
			return userAnswer.fetch().then(function(model){
				if (model) {
					return new UserAnswer().where({question_id: question_id, user_id: user_id}).save({answer_id:answer_id}, {method:'update'});
				} else {
					return userAnswer.save({answer_id:answer_id}, {method:'insert'});
				}
			});
		}
	});
	return UserAnswer;
};
