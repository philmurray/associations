"use strict";

angular.module('associations',
	[
		'templates',
		'ngAnimate',
		'ngRoute',
		'associations.pages.main',
		'associations.pages.exploreWords',
		'associations.pages.playerProfile',
		'associations.pages.playLanding',
		'associations.pages.playMulti',
		'associations.pages.game',
		'associations.components.login',
		'associations.components.data.color',
		'associations.components.data.user',
		'associations.components.data.game',
		'ui.bootstrap.alert'
	])
	.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
		var ColorResolver = ['ColorService', function(ColorService){
				return ColorService.getUserColor().then(function(response){return response.data;});
			}],
			AutheticationResolver = ['UserService', 'ColorService', function(UserService, ColorService){
				var auth = {};
				return UserService.get()
					.then(function(response){
						auth.user = response.data;
						return ColorService.getUserColor().then(function(response){
							auth.color = response.data;
							return auth;
						});
					});
			}],
			GameResolver = ['GameService', '$route', function(GameService, $route){
				return GameService.get($route.current.params.gameId).then(function(response){return response.data;});
			}];

		$routeProvider
			.when('/', {
				templateUrl: 'pages/main/main.html',
				controller: 'MainController',
				resolve: {
					color: ColorResolver
				}
			})
			.when('/playerProfile', {
				templateUrl: 'pages/playerProfile/playerProfile.html',
				controller: 'PlayerProfileController',
				resolve: {
					authenticated: AutheticationResolver
				}
			})
			.when('/playLanding', {
				templateUrl: 'pages/playLanding/playLanding.html',
				controller: 'PlayLandingController',
				resolve: {
					authenticated: AutheticationResolver
				}
			})
			.when('/playMulti', {
				templateUrl: 'pages/playMulti/playMulti.html',
				controller: 'PlayMultiController',
				resolve: {
					authenticated: AutheticationResolver
				}
			})
			.when('/game/:gameId', {
				templateUrl: 'pages/game/game.html',
				controller: 'GameController',
				resolve: {
					color: ColorResolver,
					game: GameResolver
				}
			})
			.when('/exploreWords', {
				templateUrl: 'pages/exploreWords/exploreWords.html',
				controller: 'ExploreWordsController',
				reloadOnSearch: false,
				resolve: {
					color: ColorResolver
				}
			})
			.otherwise({redirectTo: '/'});

		$httpProvider.interceptors.push('LoginInterceptorService');
	}])
	.controller("AppController", ["$scope", "$timeout", function($scope, $timeout){
		$scope.alerts = [];

		$scope.addAlert = function(alert) {
			$scope.alerts.push(alert);
			$timeout(function(){
				var i = $scope.alerts.indexOf(alert);
				if (i !== -1){
					$scope.alerts.splice(i,1);
				}
			}, 2500);
		};

		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};
	}]);
