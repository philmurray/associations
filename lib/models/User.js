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
		locks: function(){
			return this.belongsToMany(models.Lock);
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
				color: this.related('color').toJSON(),
				level: this.get('level')
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
				locks: new models.Lock().query(function(qb){
					qb.whereNotIn('id', self.related('locks').map(function(lock){return lock.id;}));
				}).fetchAll({transacting: t}),
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
					if (requirement > picks) {
						level = l.get('level') - 1;
						level_progress = (picks - prevRequirement) / (requirement - prevRequirement);
						break;
					}
					prevRequirement = requirement;
				}

				var unlocked = props.locks.filter(function(lock){
					return lock.get('level') <= level;
				}).map(function(lock){
					return lock.id;
				});

				return Promise.all([
					self.save({
						'seen_instructions':true,
						'level':level,
						'level_progress':level_progress
					}, {transacting: t}),
					self.related('locks').attach(unlocked, {transacting: t})
				]);
			});
		}
	},{
		getNotifications: function(user, callback){
			return Promise.props({
				pendingGames: new models.GameUser({user_id: user.id, completed: false, declined: false}).fetch().then(function(m){
					return Boolean(m);
				}),
				unlocked: new models.LockUser({user_id: user.id, seen: false}).fetch().then(function(m){
					return Boolean(m);
				})
			})
			.nodeify(callback);
		},
		search: function(user, searchTerm, numRecords, done){
			return User.query(function(qb) {
				qb.where('id', '<>', user.id);
				qb.andWhere(function(){
					this.where('alias', 'ILIKE', '%' + searchTerm + '%')
						.orWhere('email', 'ILIKE', '%' + searchTerm + '%')
						.orWhere('oauth_displayname', 'ILIKE', '%' + searchTerm + '%');
				});
				qb.orderBy('alias', 'asc');
				if (numRecords) qb.limit(numRecords);
			})
			.fetchAll({withRelated:['color']})
				.then(function(collection) {
					return collection.map(function(model){
						return {
							id: model.get('id'),
							alias: model.get('alias'),
							real: model.get('email') || model.get('oauth_displayname'),
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
									color: player.related('color').toJSON(),
									real: player.get('email') || player.get('oauth_displayname')
								};
							}
							if (!gp.lastPlayed || gp.lastPlayed < game.get('create_time')){
								gp.lastPlayed = game.get('create_time');
							}
						});
					});

					return Object.keys(otherPlayers).map(function(id){
						return {id:id, alias:otherPlayers[id].alias, color:otherPlayers[id].color, real:otherPlayers[id].real, lastPlayed:otherPlayers[id].lastPlayed};
					});
				})
				.nodeify(callback);
		},
		loginLocal: function(email, password, done){
			email = email.toLowerCase();

			var user = new User({'email': email});

			return bookshelf.transaction(function(t){
				return user.fetch({transacting: t})
					.then(function(model) {
						if (model){
							var passwordHash = model.get("password");
							if (passwordHash && (password === '-' || !bCrypt.compareSync(password, passwordHash))) {
								return false;
							}
							return model;
						} else {
							//todo: validate email
							return user.save({
								alias: email.substr(0, email.indexOf("@"))
							}, {transacting: t});
						}
					});
			}).nodeify(done);
		},
		loginSocial: function (accessToken, refreshToken, profile, done) {
			var user = new User({
				'oauth_id': profile.id,
				'oauth_provider': profile.provider
			});

			return bookshelf.transaction(function(t){
				return user.fetch({transacting: t})
					.then(function(model) {
						if (model){
							return model;
						} else {
							return user.save({
								alias: profile.displayName,
								oauth_displayname: profile.displayName
							}, {transacting: t});
						}
					});
			}).nodeify(done);
		}
	});
	return User;
};
