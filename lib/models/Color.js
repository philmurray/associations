"use strict";
var Promise = require("bluebird");

/*
* This is the model representation of the colors table. It represents a single color.
*/
module.exports = function(bookshelf){
	var Color = bookshelf.Model.extend({
		tableName: "colors"
	},{
		getActiveColor: function getActiveColor(user, done){
			if (user) return done(null, user.related('color').toJSON());

			return new Color({'id': 0}).fetch().then(function(color){
				return done(null,color.toJSON());
			}).catch(done);
		},
		getAllColors: function getAllColors(done){
			return new Color().fetchAll().then(function(collection){
				return done(null, collection.map(function(model){ return model.toJSON(); }));
			}).catch(done);
		}
	});
	return Color;
};
