"use strict";

/*
* This is the model representation of the Session table. It represents a single
* session.
*/
module.exports = function(bookshelf){
	var Session = bookshelf.Model.extend({
		tableName: "session",
		idAttribute: "sid"
	},{
		get: function(sid, cb) {
			return this.forge({sid: sid}).fetch().then(function(model) {
				return model && model.get('sess');
			}).nodeify(cb);
		},

		set: function(sid, session, cb) {
			var model = this.forge({sid: sid}),
				maxAge = session.cookie.maxAge,
				ttl = maxAge + Date.now();

			return bookshelf.transaction(function(t){
				return model.fetch().then(function(existing) {
					model = existing || model;
					return model.save({'sess': session, expire: new Date(ttl)}, {method:existing?"update":"insert"});
				});
			}).nodeify(cb);
		},

		destroy: function(sid, cb) {
			return this.query().where({sid: sid}).del().nodeify(cb);
		}
	});
	return Session;
};
