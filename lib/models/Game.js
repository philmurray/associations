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

						var playerIds = "(" + players.map(function(p){return "'" + p.id + "'";}).join(', ') + ")",
							query = "text not in (select \"from\" from picks where user_id in " + playerIds + ")";
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
		}
	});
	return Game;
};
