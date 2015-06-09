"use strict";
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

angular.module('associations.pages.landing', ['associations.components.login', 'infinite-scroll'])

.controller("LandingController", ["$scope", "authenticated", "LoginService", function($scope, authenticated, LoginService) {
	$scope.footer.visible = true;
	$scope.authenticated = authenticated;
	$scope.logIn = function(){
		LoginService.login().then(function(){
			$scope.authenticated = true;
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
		return $scope.authenticated || !value.authRequired;
	};

	var availableSections = [
		{
			title: "You",
			subtitle: "Getting to know you",
			components: [],
			authRequired: true
		},
		{
			title: "Games",
			subtitle: "For people who like a challenge",
			components: [],
			authRequired: true
		},
		{
			title: "Explore",
			subtitle: "See what other people have on their minds",
			components: []
		}
	],
	availableComponents = [
		[
			"pages/landing/components/you/profile.html"
		],
		[
			"pages/landing/components/games/new.html"
		],
		[
			"pages/landing/components/explore/pageLink.html"
		]
	];

	while (!$scope.sections.filter($scope.filterSections).length) {
		$scope.page();
	}
	$scope.page();

}]);
