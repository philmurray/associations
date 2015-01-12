"use strict";

var bCrypt = require('bcrypt-nodejs');
/*
* This is the model representation of the Users table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	var User = bookshelf.Model.extend({
		tableName: "users",
		idAttribute: "id"
	},{
		loginLocal: function(email, password, done){
			email = email.toLowerCase();

			var user = new User({'email': email});

			user.fetch()
				.then(function(model) {
					if (model){
						var passwordHash = model.get("password");
						if (passwordHash) {
							if (password === '-'){
								return done(null, false, {message: "password required"});
							}
							if (!bCrypt.compareSync(password, passwordHash)){
								return done(null, false, {message: "password mismatch"});
							}
						}
						return done(null, model);
					} else {
						//todo: validate email
						user.save()
							.then(function(model){
								done(null, model);
							})
							.catch(function(err){
								done(err);
							});
					}
				})
				.catch(function(err){
					done(err);
				});
		}
	});
	return User;
};
