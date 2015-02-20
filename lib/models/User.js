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

			var user = new this({'email': email});

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
		},
		loginSocial: function (accessToken, refreshToken, profile, done) {


			// User.findOne({ oauthID: profile.id }, function(err, user) {
			// 	if(err) { console.log(err); }
			// 	if (!err && user != null) {
			// 		done(null, user);
			// 	} else {
			// 		var user = new User({
			// 		oauthID: profile.id,
			// 		name: profile.displayName,
			// 		created: Date.now()
			// 		});
			// 		user.save(function(err) {
			// 		if(err) {
			// 			console.log(err);
			// 		} else {
			// 			console.log("saving user ...");
			// 			done(null, user);
			// 		};
			// 		});
			// 	};
			// 	});
		}
	});
	return User;
};
