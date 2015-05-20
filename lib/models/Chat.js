"use strict";
var Promise = require("bluebird");

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
				user_id:user.id,
				text:chat.word
			}).save().nodeify(callback);
		}
	});
	return Chat;
};
