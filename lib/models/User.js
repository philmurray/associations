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
				.catch(function(err){
					if (err.code == '23505'){
						return callback({"message":"Email address already exists."});
					}
					return callback(err);
				});
		},
		updateLevel: function(t){
			var self = this;
			return Promise.props({
				levels: new models.Level().query(function(qb){
					qb.orderBy('level');
				}).fetchAll({transacting:t}),
				picks: new models.Pick().query(function(qb){
					qb.where({user_id:self.id});
					qb.count('to');
				}).fetch({transacting:t})
			}).then(function(props){
				var level = 20,
					level_progress = 1,
					prevRequirement = 0,
					picks = parseInt(props.picks.get('count'),10);

				var l, i = 0;
				while((l = props.levels.at(i++))) {
					var requirement = l.get('requirement');
					if (requirement >= picks) {
						level = l.get('level') - 1;
						level_progress = (picks - prevRequirement) / (requirement - prevRequirement);
						break;
					}
					prevRequirement = requirement;
				}
				return self.save({
					'seen_instructions':true,
					'level':level,
					'level_progress':level_progress
				}, {transacting: t});
			});
		}
	},{
		search: function(user, searchTerm, numRecords, done){
			return User.query(function(qb) {
				qb.where('id', '<>', user.id);
				qb.andWhere('alias', 'ILIKE', '%' + searchTerm + '%');
				qb.orderBy('alias', 'asc');
				if (numRecords) qb.limit(numRecords);
			})
			.fetchAll({withRelated:['color']})
				.then(function(collection) {
					return collection.map(function(model){
						return {
							id: model.get('id'),
							alias: model.get('alias'),
							color: model.related('color').toJSON()
						};
					});
				})
				.nodeify(done);
		},
		recentPlayers: function(user, callback){
			return new User().where({id:user.id}).fetch({'withRelated':[
				{'games':function(qb){
					qb.orderBy('create_time', 'desc');
					qb.limit(25);
				}}, 'games.players', 'games.players.color']})
				.then(function(user){
					var otherPlayers = {};
					user.related('games').forEach(function(game){
						game.related('players').forEach(function(player){
							if (player.get('id') === user.get('id')) return;
							var gp = otherPlayers[player.get('id')];
							if (!gp) {
								gp = otherPlayers[player.get('id')] = {
									alias: player.get('alias'),
									color: player.related('color').toJSON()
								};
							}
							if (!gp.lastPlayed || gp.lastPlayed < game.get('create_time')){
								gp.lastPlayed = game.get('create_time');
							}
						});
					});

					return Object.keys(otherPlayers).map(function(id){
						return {id:id, alias:otherPlayers[id].alias, color:otherPlayers[id].color, lastPlayed:otherPlayers[id].lastPlayed};
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
