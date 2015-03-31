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
			return this.belongsToMany(models.User).withPivot(['completed', 'start_time']);
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

						var playerIds = "(" + players.map(function(p){return "'" + p.id + "'";}).join(', ') + ")",
							query = "text not in (select \"from\" from picks where user_id in " + playerIds + ")";
						promises.push(new models.Word()
							.query()
							.debug()
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
			return new Game({id: gameId}).fetch({withRelated: ['players', 'players.color', 'picks']})
				.then(function(model){

					var returnModel = model.toJSON();

					returnModel.players = model.related('players').map(function(player, index){
						var picks = model.related('picks').where({user_id: player.id});
						if (user && user.id === player.id){
							returnModel.player = index;
						}
						return {
							alias: player.get('alias'),
							color: player.related('color').toJSON(),
							completed: player.pivot.get('completed'),
							startTime: player.pivot.get('start_time'),
							picks: picks
						};
					});
					return returnModel;
				}).nodeify(callback);
		}
	});
	return Game;
};
