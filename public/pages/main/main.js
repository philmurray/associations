"use strict";

angular.module('associations.pages.main', ["associations.components.diagram"])

.controller("MainController", ["$scope", function($scope) {
	$scope.words = {
		Play: {
			text: "Play",
			initial: {
				x: 0,
				y: -0.5
			}
		},
		Explore: {
			text: "Explore",
			initial: {
				x: -0.5,
				y: 0.5
			}
		},
		Me: {
			word: true,
			text: "Me",
			initial: {
				x: 0.5,
				y: 0.5
			}
		}
	};
	$scope.links = {
		playerProfile: {
			href: "#/playerProfile",
			text: "Profile",
			initial: {
				x: 1,
				y: 1
			},
			anchor: ""
		},
		playerStatistics: {
			href: "#/playerStatistics",
			text: "Statistics",
			initial: {
				x: 1,
				y: 0.75
			}
		},
		exploreWords: {
			href: "#/exploreWords",
			text: "Words",
			initial: {
				x: -1,
				y: 1
			}
		},
		exploreStatistics: {
			href: "#/globalStatistics",
			text: "Statistics",
			initial: {
				x: -1,
				y: 0.75
			}
		},
		singleGame: {
			href: "#/singleGame",
			text: "Single",
			initial: {
				x: -0.5,
				y: -0.5
			}
		},
		multiGame: {
			href: "#/multiGame",
			text: "Multiplayer",
			initial: {
				x: 0.5,
				y: -0.5
			}
		}
	};

	$scope.title = {
		Associations: {
			text: "Associations",
			initial: {
				x: 0,
				y: 0
			},
			fixed: true
		}
	};

	$scope.config = {};
	$scope.model = {
		nodes: {
		},
		links: [{
			source: {
				id: "Associations",
				anchor: "Top"
			},
			target: {
				id: "Play",
				anchor: "Bottom"
			}
		},
		{
			source: {
				id: "Associations",
				anchor: "Left"
			},
			target: {
				id: "Explore",
				anchor: "Right"
			}
		},
		{
			source: {
				id: "Associations",
				anchor: "Right"
			},
			target: {
				id: "Me",
				anchor: "Left"
			}
		},
		{
			source: {
				id: "Explore",
				anchor: "Bottom"
			},
			target: {
				id: "exploreWords",
				anchor: "Top"
			}
		},
		{
			source: {
				id: "Explore",
				anchor: "Left"
			},
			target: {
				id: "exploreStatistics",
				anchor: "Right"
			}
		},
		{
			source: {
				id: "Me",
				anchor: "Bottom"
			},
			target: {
				id: "playerProfile",
				anchor: "Top"
			}
		},
		{
			source: {
				id: "Me",
				anchor: "Right"
			},
			target: {
				id: "playerStatistics",
				anchor: "Left"
			}
		},
		{
			source: {
				id: "Play",
				anchor: "Top"
			},
			target: {
				id: "singleGame",
				anchor: "Bottom"
			}
		},
		{
			source: {
				id: "Play",
				anchor: "Top"
			},
			target: {
				id: "multiGame",
				anchor: "Bottom"
			}
		}]
	};
	angular.extend($scope.model.nodes,$scope.words,$scope.links,$scope.title);
}]);
