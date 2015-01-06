var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	models = require('./models'),
	bCrypt = require('bcrypt-nodejs'),
	User = models.User;

module.exports = function(app){

	app.use(passport.initialize());
	app.use(passport.session());

	passport.serializeUser(function(user, done) {
		done(null, user.get("id"));
	});

	passport.deserializeUser(function(id, done) {
		var User = require('./models/User');

		new User({'id': id}).fetch()
		.then(function(model) {
			done(model);
		})
		.catch(function(err){
			done(err);
		});
	});

	// passport/login.js
	passport.use('login', new LocalStrategy(
		{
			passwordField: 'password'
		},
		function(email, password, done) {
			email = email.toLowerCase();

			//TODO: move this logic to the User model
			var user = new User({'email': email});

			user.fetch()
			.then(function(model) {
				if (model){
					var passwordHash = model.get("password");
					if (passwordHash && !bCrypt.compareSync(password, passwordHash)){
						return done(null, false);
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
	));

};
