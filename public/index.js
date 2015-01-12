"use strict";

angular.module('associations',
	[
		'ngRoute',
		'associations.pages.main',
		'associations.pages.explore',
		'associations.pages.profile',
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
			.when('/profile', {
				templateUrl: 'pages/profile/profile.html',
				controller: 'ProfileController',
				resolve: authenticatedRoute
			})
			.when('/explore', {
				templateUrl: 'pages/explore/explore.html',
				controller: 'ExploreController'
			})
			.otherwise({redirectTo: '/'});

		$httpProvider.interceptors.push('LoginInterceptorService');
	}]);
