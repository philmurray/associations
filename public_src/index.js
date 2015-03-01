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
		'ui.bootstrap.alert'
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
