"use strict";

/*
* This is the model representation of the _user_stats table.
*/
module.exports = function(bookshelf){
	var UserStats = bookshelf.Model.extend({
			tableName: "user_stats"
		},{
		}),
		UserStatsNormal = bookshelf.Model.extend({
			tableName: "user_stats_normal"
		},{
		}),
		UserStatsTime = bookshelf.Model.extend({
			tableName: "user_stats_time"
		},{
		}),
		UserStatsRank = bookshelf.Model.extend({
			tableName: "user_stats_rank"
		},{
		}),
		UserStatsRankWord = bookshelf.Model.extend({
			tableName: "user_stats_rank_word"
		},{
		});
	return {
		All: UserStats,
		Normal: UserStatsNormal,
		Time: UserStatsTime,
		Rank: UserStatsRank,
		RankWord: UserStatsRankWord
	};
};
