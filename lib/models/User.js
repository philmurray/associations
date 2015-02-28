"use strict";

var bCrypt = require('bcrypt-nodejs');
/*
* This is the model representation of the Users table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	var User = bookshelf.Model.extend({
		tableName: "users",
		idAttribute: "id",
		initialize: function() {
			this.on('saving', this.validateSave);
		},
		validateSave: function() {
			//run some validation
		},
		safeModel: function(){
			return {
				alias: this.get('alias'),
				email: this.get('email'),
				hasPassword: Boolean(this.get('password')),
				provider: this.get('oauth_provider'),
				color: this.get('color')
			};
		},
		updateUser: function(attr, callback){
			this.set('alias', attr.alias);
			this.set('color', attr.color);

			if (attr.email) {
				this.set('email', attr.email);
			}

			if (attr.password) {
				var self = this;
				return bCrypt.genSalt(10, function(err, salt) {
					if (err) return callback(err);
				    bCrypt.hash(attr.password, salt, null,function(err, hash) {
						if (err) return callback(err);
						self.set('password', hash);
						self.save().then(function(){callback();}).catch(callback);
				    });
				});
			}
			this.save().then(function(){callback();}).catch(callback);
		}
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
						user.save({
								alias: email.substr(0, email.indexOf("@"))
							})
							.then(function(model){
								done(null, model);
							})
							.catch(done);
					}
				})
				.catch(done);
		},
		loginSocial: function (accessToken, refreshToken, profile, done) {
			var user = new User({
				'oauth_id': profile.id,
				'oauth_provider': profile.provider
			});

			user.fetch()
				.then(function(model) {
					if (model){
						return done(null, model);
					} else {
						//todo: validate email
						user.save({
								alias: profile.displayName
							})
							.then(function(model){
								done(null, model);
							})
							.catch(done);
					}
				})
				.catch(done);
		}
	});
	return User;
};
