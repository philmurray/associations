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
			return this.belongsToMany(models.User).withPivot(['completed', 'declined']);
		},
		scoredPlayers: function() {
			return this.belongsToMany(models.User, "games_users_scored").withPivot(['completed', 'start_time', 'score', 'normal', 'unread_chats']);
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
		topWords: function() {
			return this.hasMany(models.TopWord);
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
							.limit(40)
							.select('text')
							.transacting(t)
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
		getGame: function(user, gameId, callback, t){
			return new Game({id: gameId}).fetch({transacting: t, withRelated: ['topWords', 'scoredPlayers', 'scoredPlayers.color', {'scoredPicks':function(qb){
				qb.orderBy('create_time');
			}}]})
				.then(function(model){

					var returnModel = {
						create_time: model.get('create_time'),
						id: model.id
					};

					var activePlayer = user && model.related('scoredPlayers').findWhere({id: user.id}),
						getAll = !activePlayer || activePlayer.pivot.get('completed'),
						winnerScore = 0,
						allDone = true;

					returnModel.players = model.related('scoredPlayers').map(function(player, index){
						var fullModel = getAll,
							playerModel = {
								id: player.id,
								alias: player.get('alias'),
								color: player.related('color').toJSON(),
								completed: player.pivot.get('completed'),
								level: player.get('level')
							};
						if (player === activePlayer){
							returnModel.player = index;
							playerModel.startTime = player.pivot.get('start_time');
							returnModel.seenInstructions = player.get('seen_instructions');
							returnModel.unreadChats = player.pivot.get('unread_chats');
							returnModel.level = {
								level: player.get('level'),
								progress: player.get('level_progress') * 100
							};
							fullModel = true;
						}
						if (fullModel){
							playerModel.score = player.pivot.get('score');
							playerModel.normal = player.pivot.get('normal');
							playerModel.picks = model.related('scoredPicks').where({user_id: player.id});
						}

						if (!playerModel.completed) allDone = false;
						if (playerModel.score > winnerScore) winnerScore = playerModel.score;

						return playerModel;
					});

					if (getAll) {
						returnModel.topWords = model.related('topWords');
					}

					if (allDone && returnModel.players.length > 1){
						returnModel.players.forEach(function(playerModel){
							if (playerModel.score >= winnerScore) playerModel.winner = true;
						});
					}


					return returnModel;
				}).nodeify(callback);
		},
		completeGame: function(game_id, t){

			return new Game({id: game_id, completed: false}).fetch({transacting: t, withRelated: ['picks']}).then(function(game){
				if (!game) return null;
				var promises = [
						game.related('words').detach(null, {transacting: t}),
						game.save({completed: true}, {transacting: t})
					],
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
		},
		getPendingGames: function(user, multi, limit, page, callback){
			return new Game().query(function(qb){
				qb.whereRaw("id in (select game_id from games_users where user_id = '" + user.id + "' and declined = false and completed = false)");
				qb.orderBy('create_time', 'desc');
				qb.limit(limit);
				qb.offset(page*limit);
			}).fetchAll({'withRelated':['players']})
			.then(function(games){
				var response = games.map(function(game){
					var g = {
						id: game.get('id'),
						time: game.get('create_time'),
						status: Game.GAME_STATUS.Pending,
						players: []
					};
					game.related('players').forEach(function(player){
						if (!player.pivot.get('declined')){
							var p = {
								id: player.get('id'),
								alias: player.get('alias'),
								completed: player.pivot.get('completed')
							};
							g.players.push(p);
						}
					});
					return g;
				});
				return response;
			})
			.nodeify(callback);
		},
		getPlayerHighScore: function(user){
			return new Game().query(function(qb){
				qb.whereRaw("id = (select game_id from games_users_scored where user_id = '" + user.id + "' and completed = true order by score desc limit 1)");
			}).fetch({'withRelated':['scoredPlayers']})
			.then(function(game){
				if (!game) return null;
				var g = {
					id: game.get('id'),
					time: game.get('create_time')
				};
				game.related('scoredPlayers').forEach(function(player){
					if (player.id === user.id) g.score = player.pivot.get('score');
				});
				return g;
			});
		},
		getPlayerMostPicks: function(user){
			return new Game().query(function(qb){
				qb.whereRaw("id = (select game_id from picks where user_id = '" + user.id + "' group by game_id order by count(*) desc limit 1)");
			}).fetch({'withRelated':['picks']})
			.then(function(game){
				if (!game) return null;
				var g = {
					id: game.get('id'),
					time: game.get('create_time'),
					picks: 0
				};
				game.related('picks').forEach(function(pick){
					if (pick.get('user_id') === user.id) g.picks++;
				});
				return g;
			});
		},
		getGames: function(user, multi, limit, page, callback){
			return new Game().query(function(qb){
				qb.whereRaw("id in (select game_id from games_users where user_id = '" + user.id + "' and declined = false and completed = true)");
				if (multi){
					qb.whereRaw("(select count(*) from games_users where game_id = id) > 1");
				} else {
					qb.whereRaw("(select count(*) from games_users where game_id = id) = 1");
				}
				qb.orderBy('create_time', 'desc');
				qb.limit(limit);
				qb.offset(page*limit);
			}).fetchAll({'withRelated':['scoredPlayers','picks']})
			.then(function(games){
				var response = games.map(Game.getGameDetails.bind(null,user));
				return response;
			})
			.nodeify(callback);
		},
		getGameDetails: function(user, game){
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
				if (p.id === user.id)
					g.unreadChats = player.pivot.get('unread_chats');

				if (winnerScore < p.score) winnerScore = p.score;

				if (!p.completed)
					g.status = Game.GAME_STATUS.Waiting;

				g.players.push(p);
			});

			if (g.status === Game.GAME_STATUS.Completed && g.players.length > 1){
				g.players.forEach(function(p){
					if (p.score === winnerScore) p.winner = true;
				});
			}

			var map = {};
			game.related('picks').forEach(function(pick){ map[pick.get('from')] = true; });
			g.picks = Object.keys(map);

			return g;
		}
	});
	return Game;
};
