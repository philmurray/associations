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
		}
	},{
		createGame: function(initiatingPlayer, otherPlayers, callback){
			var game;
			bookshelf.transaction(function (t){
				return new Game().save()
					.then(function(model){
						game = model;
						var promises = [];

						var players = (otherPlayers || []).map(function(player){ return new models.User(player);});
						players.unshift(initiatingPlayer);
						promises.push(game.related('players').attach(players, {transacting:t}));

						promises.push(new models.Word()
							.query()
							.whereRaw("text not in (select \"from\" from picks where user_id not in (?))", players.map(function(p){return p.id;}).join(','))
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
		}
	});
	return Game;
};
