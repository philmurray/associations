"use strict";
var Promise = require("bluebird"),
	models = require("../models");

/*
* This is the model representation of the locks table.
*/
module.exports = function(bookshelf){
	var Lock = bookshelf.Model.extend({
		tableName: "locks",
		players: function() {
			return this.belongsToMany(models.User).withPivot(['seen']);
		}
	},{
		get: function(user, data, callback){
			return bookshelf.transaction(function (t) {
				return new Lock({data:data}).fetch({
					transacting: t,
					withRelated:[{
						'players':function(qb){
							qb.where('id', user.id);
						}
					}]})
					.then(function(model){
						if (!model) return null;

						var players = model.related('players');
						if (!players || !players.length){
							return {
								locked: true,
								level: model.get('level')
							};
						}

						return model.related('players').updatePivot({'seen': true}, {transacting: t, query: function(qb){qb.where('user_id', user.id);}})
							.then(function(){
								if (Lock[data]){
									return Lock[data](user);
								}
								return true;
							});
					});
			}).nodeify(callback);
		},
		playerGameStats: function(user){
			return Promise.props({
				highScoreGame: models.Game.getPlayerHighScore(user),
				mostPicksGame: models.Game.getPlayerMostPicks(user),
				mostObscureWord: new models.UserStats.RankWord({user_id: user.id}).fetch(),
				stats: new models.GameUserStats({user_id: user.id}).fetch()
			});
		},
		playerNormal: function(user){
			return new models.UserStats.Normal({user_id: user.id}).fetch();
		},
		playerAnalysis: function(user){
			return true; //TODO
		},
		questionAnalysis: function(user){
			return true;
		}
	});
	return Lock;
};
