"use strict";

/*
* This is the model representation of the _Global_stats table.
*/
module.exports = function(bookshelf){
	var GlobalCommonCount = bookshelf.Model.extend({
			tableName: "global_common_count"
		},{
			get: function(callback){
				return new GlobalCommonCount().fetchAll().nodeify(callback);
			}
		}),
		GlobalPosCount = bookshelf.Model.extend({
			tableName: "global_pos_count"
		},{
			get: function(callback){
				return new GlobalPosCount().fetchAll().nodeify(callback);
			}
		}),
		GlobalToCount = bookshelf.Model.extend({
			tableName: "global_to_count"
		},{
			get: function(limit, callback){
				return new GlobalToCount().query(function(qb){
					qb.limit(limit);
				})
				.fetchAll()
				.nodeify(callback);
			}
		});
	return {
		Common: GlobalCommonCount,
		Pos: GlobalPosCount,
		To: GlobalToCount
	};
};
