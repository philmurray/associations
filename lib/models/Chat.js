"use strict";
var Promise = require("bluebird"),
	models = require("../models");

/*
* This is the model representation of the chats table. It represents a single chat message.
*/
module.exports = function(bookshelf){
	var Chat = bookshelf.Model.extend({
		tableName: "chats"
	},{
		addChat: function(user, gameId, chat, callback){
			return new Chat({
					game_id:gameId,
					user_id:user ? user.id : null,
					text:chat.word
				})
				.save()
				.then(function(){
					if (user) {
						return Chat.getChats(user,gameId,callback);
					}
				});
		},
		addGameCompletedChat: function(gameId, players){
			var chat = new Chat({game_id:gameId, user_id:null});
			return chat.fetch().then(function(model){
				if (!model) {
					var winnerText = players.length > 1 ? " have won the game!" : " has won the game!";
					chat.save({text: players.join(" and ") + winnerText});
				}
			});
		},
		getChats: function(user, gameId, callback){
			var chats;
			new Chat()
				.query(function(qb){
					qb.where({game_id:gameId})
						.orderBy('create_time', 'ASC');
				})
				.fetchAll()
			.then(function(models){
				chats = models.map(function(model){
					return {
						message: model.get('text'),
						player: model.get('user_id')
					};
				});
			})
			.then(function(){
				return new models.GameUser().where({game_id: gameId, user_id: user.id}).save({'chat_viewed_time': new Date()}, {method: 'update'});
			})
			.then(function(){
				return chats;
			})
			.nodeify(callback);
		}
	});
	return Chat;
};
