"use strict";
var Promise = require("bluebird"),
	models = require("../models");
/*
* This is the model representation of the games_users table. It represents a players status for a game
*/
module.exports = function(bookshelf){

	var ScoredGameUser = bookshelf.Model.extend({
		tableName: "games_users_scored",
		idAttribute: null
	},
	{
		get: function(gameUserQuery){
			return new ScoredGameUser().where(gameUserQuery).fetch()
				.then(function (model){
					if (!model){ return Promise.reject(new Error("player cannot update this game"));}

					var gameUser = model,
						gameCompleted = gameUser.get('completed'),
						gameStarted = gameUser.get('start_time'),
						gamePending = !gameCompleted && !gameStarted,
						gameRunning = !gameCompleted && (new Date() - gameUser.get('start_time')) < 1000*45,
						gamePastDue = !gameCompleted && gameStarted && !gameRunning;

					return {
						gameUser: gameUser,
						completed: gameCompleted,
						started: gameStarted,
						pending: gamePending,
						running: gameRunning,
						pastDue: gamePastDue
					};
				});
		}
	});

	var GameUser = bookshelf.Model.extend({
		tableName: "games_users",
		idAttribute: null
	},{
		completeGame: function(query){
			return new GameUser().where(query).save({'completed': true}, {method: 'update'})
				.then(function(){
					return new GameUser().where({game_id:query.game_id}).fetchAll();
				})
				.then(function(gameUsers){
					if (gameUsers.every(function(model){ return model.get('completed');})){
						return new models.Game({id: query.game_id}).related('words').detach();
					}
				});
		},

		stopGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return ScoredGameUser.get(gameUserQuery).then(function(model){
				if (!model.completed){
					return GameUser.completeGame(gameUserQuery).then(function(){
						return models.Game.getGame(user, gameId);
					});
				} else {
					return models.Game.getGame(user, gameId);
				}
			}).nodeify(callback);
		},

		startGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return ScoredGameUser.get(gameUserQuery).then(function(model){
				if (!model.pending){
					return Promise.reject(new Error('Game already started'));
				}
				model.gameUser.set('start_time', new Date());
				return new GameUser().where(gameUserQuery).save({'start_time': model.gameUser.get('start_time')}, {method: 'update'}).then(function(){
					setTimeout(function(){
						GameUser.completeGame(gameUserQuery);
					}, 1000*45);

					return model.gameUser.toJSON();
				});
			}).nodeify(callback);
		},

		resumeGame: function(user, gameId, callback){
			return ScoredGameUser.get({game_id: gameId, user_id: user.id}).then(function(model){
				if (model.running){
					return model.gameUser.toJSON();
				} else {
					return Promise.reject(new Error('Game not running'));
				}
			}).nodeify(callback);
		},

		submitWord: function(user, gameId, wordData, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return ScoredGameUser.get(gameUserQuery).then(function(model){
				if (model.running){
					return bookshelf.transaction(function(t){
						return Promise.all([
							new models.Pick({
								from: model.gameUser.get('word'),
								to: wordData.word,
								user_id: user.id,
								game_id: gameId,
								time_taken: wordData.timeTaken
							})
							.save(null, {transacting: t}),
							new GameUser()
								.query()
								.where(gameUserQuery)
								.increment('current_word', 1)
								.transacting(t)
						]);
					})
					.then(function(){
						return Promise.props({
							game: ScoredGameUser.get(gameUserQuery).then(function(model){
								return model.gameUser.toJSON();
							}),
							word: new models.ScoredPick({
								game_id: gameId,
								user_id: user.id,
								from: model.gameUser.get('word'),
								to: wordData.word
							}).fetch()
						});
					});
				} else {
					return Promise.reject(new Error('Game not running'));
				}
			}).nodeify(callback);
		}
	});
	return GameUser;
};
