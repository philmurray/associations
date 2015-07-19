"use strict";
var Promise = require("bluebird"),
	models = require("../models");
/*
* This is the model representation of the games_users table. It represents a players status for a game
*/
var GAME_LENGTH = 60; // a bit more than is configured on the ui

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
						gameRunning = !gameCompleted && (new Date() - gameUser.get('start_time')) < 1000*GAME_LENGTH,
						gamePastDue = !gameCompleted && gameStarted && !gameRunning,
						gameHasWords = Boolean(gameUser.get('word'));

					return {
						gameUser: gameUser,
						completed: gameCompleted,
						started: gameStarted,
						pending: gamePending,
						running: gameRunning,
						pastDue: gamePastDue,
						hasWords: gameHasWords
					};
				});
		}
	});

	var GameUser = bookshelf.Model.extend({
		tableName: "games_users",
		idAttribute: null
	},{
		completeGame: function(user, gameId, decline){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return bookshelf.transaction(function(t){
				if (decline) {
					return new GameUser().where(gameUserQuery).save({'declined': true}, {method: 'update', transacting: t});
				} else {
					return ScoredGameUser.get(gameUserQuery).then(function(model){
						if (model.running && model.hasWords){
							return new models.Pick({
								from: model.gameUser.get('word'),
								to: null,
								user_id: user.id,
								game_id: gameId,
								time_taken: 0
							})
							.save(null, {transacting: t});
						}
					})
					.then(function(){
						return new GameUser().where(gameUserQuery).save({'completed': true}, {method: 'update', transacting: t});
					})
					.then(function(){
						return user.updateLevel(t);
					});
				}
			})
			.then(function(){
				return models.Game.getGame(user, gameId);
			})
			.then(function(game){
				if (game.players.every(function(player){return player.completed;})){
					var winners = game.players.filter(function(player){return player.winner;});

					winners.forEach(function(winner){
						new GameUser().where({game_id: gameId, user_id: winner.id}).save({'won': true}, {method: 'update'});
					});

					models.Game.completeGame(gameId).then(function(completed){
						if (completed){
							var players = winners.map(function(player){ return player.alias;});
							if (players.length) {
								var winnerText = players.length > 1 ? " have won the game!" : " has won the game!";
								models.Chat.addChat(null, gameId, {word: players.join(" and ") + winnerText}).then(function(){
									return GameUser.updateChatViewed(user, gameId);
								});
							}
						}
					});
				}
				return game;
			});
		},

		stopGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return ScoredGameUser.get(gameUserQuery).then(function(model){
				if (!model.completed){
					return GameUser.completeGame(user, gameId);
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
						GameUser.completeGame(user, gameId);
					}, 1000*GAME_LENGTH);

					return model.gameUser.toJSON();
				});
			}).nodeify(callback);
		},

		declineGame: function(user, gameId, callback){
			return GameUser.completeGame(user, gameId, true).then(function(){
				models.Chat.addChat(null, gameId, {word: user.get('alias') + " has declined to play :-("});
				return true;
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

		updateChatViewed: function(user, gameId){
			return new GameUser().where({game_id: gameId, user_id: user.id}).save({'chat_viewed_time': new Date()}, {method: 'update'});
		},

		submitWord: function(user, gameId, wordData, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return ScoredGameUser.get(gameUserQuery).then(function(model){
				if (model.running && model.hasWords){
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
