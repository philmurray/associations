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
			return new Game({id: gameId}).fetch({withRelated: ['scoredPlayers', 'scoredPlayers.color', 'scoredPicks']})
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
		}
	});
	return Game;
};
