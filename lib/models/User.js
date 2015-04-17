"use strict";

var Promise = require('bluebird'),
	checkit = require('checkit'),
	bCrypt = Promise.promisifyAll(require('bcrypt-nodejs')),
	models = require('../models');
/*
* This is the model representation of the Users table. It represents a single
* user.
*/
module.exports = function(bookshelf){
	var rules = {
		email: ['email'],
		alias: 'required'
	};

	var User = bookshelf.Model.extend({
		tableName: "users",
		idAttribute: "id",
		games: function() {
			return this.belongsToMany(models.Game);
		},
		color: function() {
			return this.belongsTo(models.Color);
		},
		pick: function() {
			return this.hasMany(models.Pick);
		},
		initialize: function() {
			this.on('saving', this.validateSave);
		},
		validateSave: function() {
			return checkit(rules).run(this.attributes);
		},
		safeModel: function() {
			return {
				id: this.get('id'),
				alias: this.get('alias'),
				email: this.get('email'),
				hasPassword: Boolean(this.get('password')),
				provider: this.get('oauth_provider'),
				color: this.related('color').toJSON()
			};
		},
		updateUser: function(attr, callback){
			this.set('alias', attr.alias);
			this.set('color_id', attr.color.id);

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
		search: function(user, searchTerm, numRecords, done){
			return User.query(function(qb) {
				qb.where('id', '<>', user.id);
				qb.andWhere('alias', 'ILIKE', '%' + searchTerm + '%');
				qb.orderBy('alias', 'asc');
				if (numRecords) qb.limit(numRecords);
			})
			.fetchAll()
				.then(function(collection) {
					return collection.map(function(model){
						return {
							id: model.get('id'),
							alias: model.get('alias')
						};
					});
				})
				.nodeify(done);
		},
		recentPlayers: function(user, callback){
			return new User().where({id:user.id}).fetch({'withRelated':[
				{'games.players':function(qb){
					qb.where('create_time', '>', new Date(new Date().getTime() - 1000*60*60*24*7*2));
				}}]})
				.then(function(user){
					var otherPlayers = {};
					user.related('games').forEach(function(game){
						game.related('players').forEach(function(player){
							var gp = otherPlayers[player.get('id')];
							if (!gp) {
								gp = otherPlayers[player.get('id')] = {alias: player.get('alias')};
							}
							if (!gp.lastPlayed || gp.lastPlayed < game.get('create_time')){
								gp.lastPlayed = game.get('create_time');
							}
						});
					});

					return Object.keys(otherPlayers).map(function(id){
						return {id:id, alias:otherPlayers[id].alias, lastPlayed:otherPlayers[id].lastPlayed};
					});
				})
				.nodeify(callback);
		},
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
