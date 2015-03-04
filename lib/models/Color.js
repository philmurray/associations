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
			new Promise(function(resolve){
				if (user){
					resolve(user.related('color').fetch());
				} else {
					resolve();
				}
			}).then(function(color){
				if (color) return color;
				return new Color({'is_default': true}).fetch();
			}).then(function(color){
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
