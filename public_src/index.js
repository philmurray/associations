"use strict";

angular.module('associations',
	[
		'templates',
		'ngAnimate',
		'ngRoute',
		'associations.pages.main',
		'associations.pages.exploreWords',
		'associations.pages.playerProfile',
		'associations.components.login',
	])
	.config(['$routeProvider', '$httpProvider',
	function($routeProvider, $httpProvider) {
		var authenticatedRoute = {
			user: ["LoginService", function(LoginService){
				return LoginService.isLoggedIn();
			}]
		};

		$routeProvider
			.when('/', {
				templateUrl: 'pages/main/main.html',
				controller: 'MainController'
			})
			.when('/playerProfile', {
				templateUrl: 'pages/playerProfile/playerProfile.html',
				controller: 'PlayerProfileController',
				resolve: authenticatedRoute
			})
			.when('/exploreWords', {
				templateUrl: 'pages/exploreWords/exploreWords.html',
				controller: 'ExploreWordsController',
				reloadOnSearch: false
			})
			.otherwise({redirectTo: '/'});

		$httpProvider.interceptors.push('LoginInterceptorService');
	}]);
