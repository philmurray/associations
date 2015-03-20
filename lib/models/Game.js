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
		}
	},{
		createGame: function(initiatingPlayer, otherPlayers, callback){
			var game;
			new Game().save()
				.then(function(model){
					game = model;
					var players = (otherPlayers || []).map(function(player){ return new models.User(player);});
					players.unshift(initiatingPlayer);
					return game.related('players').attach(players);
				})
				.then(function(){


					return callback(null,game);
				}).catch(callback);
		}
	});
	return Game;
};
