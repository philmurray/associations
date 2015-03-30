"use strict";
var Promise = require("bluebird"),
	models = require("../models");
/*
* This is the model representation of the games_users table. It represents a players status for a game
*/
module.exports = function(bookshelf){
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

			return GameUser.updateGame(user, gameId, function(gameUser, gameState){
				if (!gameState.completed){
					return GameUser.completeGame(gameUserQuery).then(function(){
						return false;
					});
				} else {
					return false;
				}
			}).nodeify(callback);
		},

		startGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return GameUser.updateGame(user, gameId, function(gameUser, gameState){
				if (!gameState.pending){
					return Promise.reject(new Error('Game already started'));
				}
				return new GameUser().where(gameUserQuery).save({'start_time': new Date()}, {method: 'update'}).then(function(){
					setTimeout(function(){
						GameUser.completeGame(gameUserQuery);
					}, 1000*45);

					return true;
				});
			}).nodeify(callback);
		},

		currentWord: function(user, gameId, callback){
			return GameUser.updateGame(user, gameId, function(gameUser, gameState){
				if (gameState.running){
					return true;
				} else {
					return Promise.reject(new Error('Game not running'));
				}
			}).nodeify(callback);
		},

		submitWord: function(user, gameId, wordData, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};


			return GameUser.updateGame(user, gameId, function(gameUser, gameState){
				if (gameState.running){
					return new models.GameWord()
						.where({
							game_id:gameUser.get('game_id'),
							order:gameUser.get('current_word')
						})
						.fetch()
						.then(function(model){
							gameUser.set('current_word', gameUser.get('current_word')+1);
							return bookshelf.transaction(function(t){
								return Promise.all([
									new models.Pick({
										from: model.get('word'),
										to: wordData.word,
										user_id: user.id,
										game_id: gameId,
										time_taken: wordData.timeTaken
									})
									.save(null, {transacting: t}),
									new GameUser()
										.where(gameUserQuery)
										.save({'current_word': gameUser.get('current_word')}, {method: 'update', transacting: t})
								]);
							})
							.then(function(){
								return true;
							});
						});
				} else {
					return Promise.reject(new Error('Game not running'));
				}
			}).nodeify(callback);
		},

		updateGame: function(user, gameId, action){
			var gameUser;

			return new GameUser().where({game_id: gameId, user_id: user.id}).fetch()
				.then(function (model){
					if (!model){ return Promise.reject(new Error("player cannot update this game"));}

					gameUser = model;
					var gameCompleted = gameUser.get('completed'),
						gameStarted = gameUser.get('start_time'),
						gamePending = !gameCompleted && !gameStarted,
						gameRunning = !gameCompleted && (new Date() - gameUser.get('start_time')) < 1000*45,
						gamePastDue = !gameCompleted && gameStarted && !gameRunning;

					return action(gameUser, {
						completed: gameCompleted,
						started: gameStarted,
						pending: gamePending,
						running: gameRunning,
						pastDue: gamePastDue
					});
				})
				.then(function(getNextWord){
					var ret = {};
					if (getNextWord){
						return new models.GameWord().where({
								game_id:gameUser.get('game_id'),
								order:gameUser.get('current_word')
							}).fetch().then(function(model){
								if (model) return {
									next: model.get('word')
								};
								if (!model){ return Promise.reject(new Error("could not get next word"));}
							});
					}
					return ret;
				});
		}
	});
	return GameUser;
};
