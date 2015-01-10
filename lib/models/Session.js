"use strict";

/*
* This is the model representation of the Session table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	var Session = bookshelf.Model.extend({
		tableName: "session",
		idAttribute: "sid"
	},{
		get: function(sid, cb) {
			this.forge({sid: sid}).fetch().then(function(model) {
				try {
					cb(null, model && model.get('sess'));
				} catch (err) {
					cb(err);
				}
			}).catch(cb);
		},

		set: function(sid, session, cb) {
			var model = this.forge({sid: sid}),
				maxAge = session.cookie.maxAge,
				ttl = maxAge + Date.now();

			model.fetch().then(function(existing) {
				model = existing || model;
				return model.save({'sess': session, expire: new Date(ttl)}, {method:existing?"update":"insert"}).then(function() {
					cb();
				});
			}).catch(cb);
		},

		destroy: function(sid, cb) {
			this.query().where({sid: sid}).del()
				.then(function() { cb && cb(); }).catch(cb);
		}
	});
	return Session;
};
