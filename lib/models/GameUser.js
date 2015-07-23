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
		get: function(gameUserQuery, t){
			return new ScoredGameUser().where(gameUserQuery).fetch({transacting: t})
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
		completeGame: function(user, gameId, decline, t){
			var gameUserQuery = {game_id: gameId, user_id: user.id},
				p;

			if (decline) {
				p = new GameUser().where(gameUserQuery).save({'declined': true}, {method: 'update', transacting: t});
			} else {
				p = ScoredGameUser.get(gameUserQuery, t).then(function(model){
					if (!model.completed && model.hasWords){
						return new models.Pick({
							from: model.gameUser.get('word'),
							to: null,
							user_id: user.id,
							game_id: gameId,
							time_taken: 0
						})
						.save() //intentionally not part of the transaction
						.catch(function(err){

						});
					}
				})
				.then(function(){
					return new GameUser().where(gameUserQuery).save({'completed': true}, {method: 'update', transacting: t});
				})
				.then(function(){
					return user.updateLevel(t);
				});
			}

			return p.then(function(){
				return models.Game.getGame(user, gameId, null, t);
			})
			.then(function(game){
				if (game.players.every(function(player){return player.completed;})){
					var winners = game.players.filter(function(player){return player.winner;}),
						promises = [];

					winners.forEach(function(winner){
						promises.push(new GameUser().where({game_id: gameId, user_id: winner.id}).save({'won': true}, {transacting: t, method: 'update'}));
					});

					return Promise.all(promises)
						.then(function(){
							return models.Game.completeGame(gameId, t);
						})
						.then(function(completed){
							if (completed){
								var players = winners.map(function(player){ return player.alias;});
								if (players.length) {
									var winnerText = players.length > 1 ? " have won the game!" : " has won the game!";
									return models.Chat.addChat(null, gameId, {word: players.join(" and ") + winnerText}, null, t)
										.then(function(){
											return GameUser.updateChatViewed(user, gameId, t);
										})
										.then(function(){
											return game;
										});
								}
							}
							return game;
						});
				}
				return game;
			});
		},

		stopGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return bookshelf.transaction(function(t){
				return ScoredGameUser.get(gameUserQuery, t).then(function(model){
					if (!model.completed){
						return GameUser.completeGame(user, gameId, false, t);
					} else {
						return models.Game.getGame(user, gameId, null, t);
					}
				});
			}).nodeify(callback);
		},

		startGame: function(user, gameId, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return bookshelf.transaction(function(t){
				return ScoredGameUser.get(gameUserQuery, t).then(function(model){
					if (!model.pending){
						return Promise.reject(new Error('Game already started'));
					}
					model.gameUser.set('start_time', new Date());
					return new GameUser().where(gameUserQuery).save({'start_time': model.gameUser.get('start_time')}, {transacting: t, method: 'update'}).then(function(){
						setTimeout(function(){
							return bookshelf.transaction(function(tt){
								return GameUser.completeGame(user, gameId, false, tt);
							});
						}, 1000*GAME_LENGTH);

						return model.gameUser.toJSON();
					});
				});
			}).nodeify(callback);
		},

		declineGame: function(user, gameId, callback){
			return bookshelf.transaction(function(t){
				return GameUser.completeGame(user, gameId, true, t).then(function(){
					models.Chat.addChat(null, gameId, {word: user.get('alias') + " has declined to play :-("}, null, t);
					return true;
				});
			}).nodeify(callback);
		},

		resumeGame: function(user, gameId, callback){
			return bookshelf.transaction(function(t){
				return ScoredGameUser.get({game_id: gameId, user_id: user.id}, t).then(function(model){
					if (model.running){
						return model.gameUser.toJSON();
					} else {
						return Promise.reject(new Error('Game not running'));
					}
				});
			}).nodeify(callback);
		},

		updateChatViewed: function(user, gameId, t){
			return new GameUser().where({game_id: gameId, user_id: user.id}).save({'chat_viewed_time': new Date()}, {transacting: t, method: 'update'});
		},

		submitWord: function(user, gameId, wordData, callback){
			var gameUserQuery = {game_id: gameId, user_id: user.id};

			return bookshelf.transaction(function(t){
				return ScoredGameUser.get(gameUserQuery, t).then(function(model){
					if (model.running && model.hasWords){
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
						])
						.then(function(){
							return Promise.props({
								game: ScoredGameUser.get(gameUserQuery, t).then(function(model){
									return model.gameUser.toJSON();
								}),
								word: new models.ScoredPick({
									game_id: gameId,
									user_id: user.id,
									from: model.gameUser.get('word'),
									to: wordData.word
								}).fetch({transacting: t})
							});
						});
					} else {
						return Promise.reject(new Error('Game not running'));
					}
				});
			}).nodeify(callback);
		}
	});
	return GameUser;
};
