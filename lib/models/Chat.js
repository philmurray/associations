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
		addChat: function(user, gameId, chat, callback, t){
			return new Chat({
					game_id:gameId,
					user_id:user ? user.id : null,
					text:chat.word
				})
				.save(null, {transacting: t})
				.then(function(){
					if (user) {
						return Chat.getChats(user,gameId,callback, t);
					}
				});
		},
		getChats: function(user, gameId, callback, t){
			var chats;
			new Chat()
				.query(function(qb){
					qb.where({game_id:gameId})
						.orderBy('create_time', 'ASC');
				})
				.fetchAll({transacting: t})
			.then(function(models){
				chats = models.map(function(model){
					return {
						message: model.get('text'),
						player: model.get('user_id')
					};
				});
			})
			.then(function(){
				return models.GameUser.updateChatViewed(user, gameId, t);
			})
			.then(function(){
				return chats;
			})
			.nodeify(callback);
		}
	});
	return Chat;
};
