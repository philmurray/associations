"use strict";
var Promise = require("bluebird"),
	models = require("../models");

/*
* This is the model representation of the games table. It represents a single game.
*/
module.exports = function(bookshelf){
	var Game = bookshelf.Model.extend({
		tableName: "games",
		players: function() {
			return this.belongsToMany(models.User).withPivot(['completed', 'start_time', 'current_word']);
		},
		words: function() {
			return this.belongsToMany(models.Word, 'games_words', 'game_id', 'word').withPivot('order');
		},
		picks: function() {
			return this.hasMany(models.Pick);
		},
		safeModel: function() {
			var returnModel = this.toJSON();
			returnModel.players = this.related('players').map(function(player){ return player.safeModel();});
			return returnModel;
		}
	},{
		createGame: function(initiatingPlayer, otherPlayers, callback){
			var game;
			bookshelf.transaction(function (t){
				return new Game().save()
					.then(function(model){
						game = model;
						var promises = [];

						var players = (otherPlayers || []).map(function(player){ return new models.User({id:player});});
						players.unshift(initiatingPlayer);

						promises.push(game.related('players').attach(players, {transacting:t}));

						var query = "text not in (select \"from\" from picks where user_id not in (" + players.map(function(p){return "'" + p.id + "'";}).join(', ') + "))";
						promises.push(new models.Word()
							.query()
							.whereRaw(query)
							.orderBy('play_order','asc')
							.limit(50)
							.select('text')
							.then(function(resp){
								return game.related('words').attach(resp.map(function(row, index){return {word: row.text, order: index};}), {transacting:t});
							}));
						return Promise.all(promises);
					});
			})
			.then(function(){
				return callback(null,game);
			})
			.catch(callback);
		},
		getGame: function(user, gameId, callback){
			var defaultColor;
			return new models.Color({'is_default': true}).fetch()
				.then(function(model){defaultColor = model.toJSON();})
				.then(function(){
					return new Game({id: gameId}).fetch({withRelated: ['players', 'players.color', 'picks']});
				})
				.then(function(model){

					var returnModel = model.toJSON();

					returnModel.players = [];
					model.related('players').forEach(function(player){
						var picks = model.related('picks').where({user_id: player.id});
						if (user && user.id === player.id){
							returnModel.player = {
								alias: player.get('alias'),
								completed: player.pivot.get('completed'),
								startTime: player.pivot.get('start_time'),
								picks: picks
							};
						} else {
							var color = player.related('color').toJSON();
							if (!Object.keys(color).length) color = defaultColor;
							returnModel.players.push({
								alias: player.get('alias'),
								color: color,
								completed: player.pivot.get('completed'),
								picks: picks
							});
						}
					});
					return callback(null, returnModel);
				}).catch(callback);
		},
		updateGame: function(user, gameId, options, callback){
			var userQuery = function(qb) {qb.where('user_id', user.id);},
				game,
				player;

			return new Game({id: gameId}).fetch({withRelated: [
				{'players': userQuery},
				'words'
			]}).then(function (model){
				game = model;
				player = game.related('players').models[0];
				if (!player){ return Promise.reject(new Error("player cannot update this game"));}

				var gameCompleted = player.pivot.get('completed'),
					gameStarted = player.pivot.get('start_time'),
					gamePending = !gameCompleted && !gameStarted,
					gameRunning = !gameCompleted && (new Date() - player.pivot.get('start_time')) < 1000*45,
					gamePastDue = !gameCompleted && gameStarted && !gameRunning;

				console.log({
					gameCompleted:gameCompleted,
					gameStarted:gameStarted,
					gamePending:gamePending,
					gameRunning:gameRunning,
					gamePastDue:gamePastDue
				});
				if (options.startGame){
					if (!gamePending){
						return callback(new Error('Game already started'));
					}
					return game.related('players').updatePivot({'start_time': new Date()}, {query: userQuery}).then(function(){
						//TODO: start a timer to 'complete the game after 30 seconds'
						return true;
					});
				}
			})
			.then(function(getNextWord){
				var ret = {};
				if (getNextWord){
					var playerWord = player.pivot.get('current_word'),
						word = game.related('words')
						.find(function(word){return word.pivot.get("order") === playerWord;});
					ret.next = word.get('text');
				}
				return ret;
			})
			.then(function(resp){return callback(null, resp);})
			.catch(callback);
		}
	});
	return Game;
};
