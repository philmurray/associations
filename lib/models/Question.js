"use strict";
var Promise = require('bluebird'),
	models = require('../models');

/*
* This is the model representation of the questions table. It represents a single question.
*/
module.exports = function(bookshelf){
	var Question = bookshelf.Model.extend({
		tableName: "questions",
		answers: function() {
			return this.hasMany(models.Answer);
		},
		userAnswers: function() {
			return this.hasMany(models.UserAnswer, 'question_id');
		}
	},{
		getAllQuestions: function(user, done){
			new Question().fetchAll({withRelated:[
					"answers",
					{"userAnswers": function(qb){
						qb.where('user_id', user.id);
					}}
				]}).then(function(questions){
					var resp = {};

					questions.forEach(function(question){
						var q = resp[question.id] = question.toJSON();
						delete q.userAnswers;
						delete q.id;
						q.answers = {};
						question.related('answers').forEach(function(answer){
							var a = q.answers[answer.id] = answer.toJSON();
							delete a.id;
							delete a.question_id;
						});
						question.related('userAnswers').forEach(function(userAnswer){
							var answer = q.answers[userAnswer.get('answer_id')];
							if (answer) {
								answer.selected = true;
							}
						});
					});
					return resp;
				}).nodeify(done);
		},
		saveUserAnswers: function(user, questions, done){
			var UserAnswer = models.UserAnswer,
				promises = [];

			return bookshelf.transaction(function(t){
				for (var question_id in questions){
					var question = questions[question_id];
					for (var answer_id in question.answers){
						var answer = question.answers[answer_id];
						if (answer.selected){
							promises.push(UserAnswer.upsert(user.id, question_id, answer_id, t));
						}
					}
				}

				return Promise.all(promises);
			}).nodeify(done);
		}
	});
	return Question;
};
