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
			return this.belongsToMany(models.User);
		},
		scoredPlayers: function() {
			return this.belongsToMany(models.User, "games_users_scored").withPivot(['completed', 'start_time', 'score', 'normal']);
		},
		words: function() {
			return this.belongsToMany(models.Word, 'games_words', 'game_id', 'word').withPivot('order');
		},
		scoredPicks: function() {
			return this.hasMany(models.ScoredPick);
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
		GAME_STATUS: {
			Completed: 1,
			Waiting: 2,
			Pending: 3
		},

		createGame: function(initiatingPlayer, otherPlayers, callback){
			var game;
			bookshelf.transaction(function (t){
				return new Game().save()
					.then(function(model){
						game = model;
						var promises = [];

						var hasPlayer,
							players = (otherPlayers || []).map(function(player){
								if (player === initiatingPlayer.id) hasPlayer = true;
								return new models.User({id:player});
							});
						if (!hasPlayer) players.unshift(initiatingPlayer);

						promises.push(game.related('players').attach(players, {transacting:t}));

						var playerIds = "(" + players.map(function(p){return "'" + p.id + "'";}).join(', ') + ")",
							query = "text not in (select \"from\" from picks where user_id in " + playerIds + ") and ";
						query += "text not in (SELECT word FROM games_words where game_id in (select game_id from games_users where user_id in " + playerIds + "))";
						promises.push(new models.Word()
							.query()
							.whereRaw(query)
							.orderBy('play_order','asc')
							.limit(60)
							.select('text')
							.then(function(resp){
								return game.related('words').attach(resp.map(function(row, index){return {word: row.text, order: index};}), {transacting:t});
							}));
						return Promise.all(promises);
					});
			})
			.then(function(){
				return game;
			})
			.nodeify(callback);
		},
		getGame: function(user, gameId, callback){
			return new Game({id: gameId}).fetch({withRelated: ['scoredPlayers', 'scoredPlayers.color', {'scoredPicks':function(qb){
				qb.orderBy('create_time');
			}}]})
				.then(function(model){

					var returnModel = {
						create_time: model.get('create_time'),
						id: model.id
					};

					var activePlayer = user && model.related('scoredPlayers').findWhere({id: user.id}),
						getAll = !activePlayer || activePlayer.pivot.get('completed');

					returnModel.players = model.related('scoredPlayers').map(function(player, index){
						var fullModel = getAll,
							playerModel = {
								alias: player.get('alias'),
								color: player.related('color').toJSON(),
								completed: player.pivot.get('completed')
							};
						if (player === activePlayer){
							returnModel.player = index;
							playerModel.startTime = player.pivot.get('start_time');
							fullModel = true;
						}
						if (fullModel){
							playerModel.score = player.pivot.get('score');
							playerModel.normal = player.pivot.get('normal');
							playerModel.picks = model.related('scoredPicks').where({user_id: player.id});
						}

						return playerModel;
					});
					return returnModel;
				}).nodeify(callback);
		},
		completeGame: function(game_id){

			return new Game({id: game_id}).fetch({withRelated: ['picks']}).then(function(game){
				return bookshelf.transaction(function(t){
					var promises = [game.related('words').detach(null, {transacting: t})],
						words = {},
						players = {};
					game.related('picks').forEach(function(pick){
						var player = pick.get('user_id'),
							word = pick.get('from');
						if (!words[word]) words[word] = [];
						words[word].push(player);
						players[player] = true;
					});
					for (var player in players){
						for (var word in words){
							if (words[word].indexOf(player) === -1){
								promises.push(new models.Pick({
									from: word,
									to: null,
									user_id: player,
									game_id: game_id,
									time_taken: 0
								})
								.save(null, {transacting: t}));
							}
						}
					}
					return Promise.all(promises);
				});
			});
		},
		getGames: function(user, callback){
			return new Game().query(function(qb){
				qb.whereRaw("id in (select game_id from games_users where user_id = '" + user.id + "')");
				qb.orderBy('create_time', 'desc');
				qb.limit(25);
			}).fetchAll({'withRelated':'scoredPlayers'})
			.then(function(games){
				var response = {
					singleGames:[],
					multiGames:[]
				};

				games.forEach(function(game){
					var g = {
						id: game.get('id'),
						time: game.get('create_time'),
						status: Game.GAME_STATUS.Completed,
						players: []
					},
					winnerScore = 0;
					game.related('scoredPlayers').forEach(function(player){
						var p = {
							id: player.get('id'),
							alias: player.get('alias'),
							completed: player.pivot.get('completed'),
							score: player.pivot.get('score'),
							normal: player.pivot.get('normal')
						};
						if (winnerScore < p.score) winnerScore = p.score;

						if (!p.completed){
							if (p.id === user.id) g.status = Game.GAME_STATUS.Pending;
							else if (g.status === Game.GAME_STATUS.Completed) g.status = Game.GAME_STATUS.Waiting;
						}
						g.players.push(p);
					});

					if (g.status === Game.GAME_STATUS.Completed){
						g.players.forEach(function(p){
							if (p.score === winnerScore) p.winner = true;
						});
					}
					if (g.players.length === 1){
						response.singleGames.push(g);
					} else {
						response.multiGames.push(g);
					}
				});
				return response;
			})
			.nodeify(callback);
		}
	});
	return Game;
};
