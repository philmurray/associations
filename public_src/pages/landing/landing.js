"use strict";
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

angular.module('associations.pages.landing', [
	'associations.components.login',
	'associations.pages.landing.components.pendingGames',
	'infinite-scroll'
])

.controller("LandingController", ["$scope", "authenticated", "LoginService", function($scope, authenticated, LoginService) {
	$scope.footer.visible = true;
	$scope.authenticated = {
		value:authenticated
	};
	$scope.logIn = function(){
		LoginService.login().then(function(){
			$scope.authenticated.value = true;
		});
	};

	$scope.page = function(){
		var currentSection = $scope.sections[$scope.sections.length - 1];

		if (!currentSection){
			$scope.sections.push(availableSections.shift());
		} else if (availableComponents.length) {
			if (availableComponents[0].length){
				currentSection.components.push(availableComponents[0].shift());
			} else {
				availableComponents.shift();
				if (availableSections.length){
					$scope.sections.push(availableSections.shift());
				}
			}
		}
	};

	$scope.sections = [];
	$scope.filterSections = function(value){
		return $scope.authenticated.value || !value.authRequired;
	};

	var availableSections = [
		{
			components:[],
			authRequired:true
		},
		// {
		// 	title: "Games",
		// 	subtitle: "For people who like a challenge",
		// 	components: [],
		// 	authRequired: true
		// },
		// {
		// 	title: "You",
		// 	subtitle: "Getting to know you",
		// 	components: [],
		// 	authRequired: true
		// },
		{
			components: []
		}
	],
	availableComponents = [
		[
			"pages/landing/components/pendingGames/pendingGames.html"
		],
		// [
		// 	"pages/landing/components/gamesLink/gamesLink.html"
		// ],
		// [
		// 	"pages/landing/components/profileLink/profileLink.html"
		// ],
		[
			"pages/landing/components/exploreLink/exploreLink.html"
		]
	];

	while (!$scope.sections.filter($scope.filterSections).length) {
		$scope.page();
	}
	$scope.page();

}]);
