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
		words: function() {
			return this.belongsToMany(models.Word, 'games_words', 'game_id', 'word');
		},
		safeModel: function() {
			var returnModel = this.toJSON();
			returnModel.players = this.players.map(function(player){ return player.safeModel();});
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
		getGame: function(gameId, callback){
			return new Game({id: gameId}).fetch({withRelated: ['players']}).then(function(model){
				return callback(null, model.safeModel);
			}).catch(callback);
		}
	});
	return Game;
};
