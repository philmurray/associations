"use strict";

var Promise = require('bluebird'),
	bCrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
/*
* This is the model representation of the Users table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	var User = bookshelf.Model.extend({
		tableName: "users",
		idAttribute: "id",
		color: function() {
			var Color = require('../models').Color;
			return this.belongsTo(Color);
		},
		initialize: function() {
			this.on('saving', this.validateSave);
		},
		validateSave: function() {
			//run some validation
		},
		safeModel: function() {
			return {
				alias: this.get('alias'),
				email: this.get('email'),
				hasPassword: Boolean(this.get('password')),
				provider: this.get('oauth_provider'),
				colorId: this.get('color_id')
			};
		},
		updateUser: function(attr, callback){
			this.set('alias', attr.alias);
			this.set('color_id', attr.colorId);

			if (attr.email) {
				this.set('email', attr.email);
			}

			var self = this,
				p = Promise.resolve();

			if (attr.password){
				p = bCrypt.genSaltAsync(10)
					.then(function(salt){
						return bCrypt.hashAsync(attr.password, salt, null);
					})
					.then(function(hash){
						self.set('password', hash);
					});
			}

			return p.then(function(){
					return self.save();
				})
				.then(function(){
					callback();
				})
				.catch(callback);
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
						return model;
					} else {
						return user.save({
							alias: profile.displayName
						});
					}
				})
				.then(function(model){
					return done(null, model);
				})
				.catch(done);
		}
	});
	return User;
};
