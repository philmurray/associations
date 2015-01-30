"use strict";

angular.module('associations.pages.main', ["associations.components.diagram"])

.controller("MainController", ["$scope", function($scope) {
	$scope.config = {};
	$scope.model = {
		nodes: [{
			word:true,
			id: 'Play',
			text: "Play",
			initial: {
				x: 0,
				y: -0.5
			}
		}, {
			word:true,
			id: 'Explore',
			text: "Explore",
			initial: {
				x: -0.5,
				y: 0.5
			}
		}, {
			word:true,
			id: 'Me',
			text: "Me",
			initial: {
				x: 0.5,
				y: 0.5
			}
		}, {
			link:true,
			id: "playerProfile",
			href: "#/playerProfile",
			text: "Profile",
			initial: {
				x: 1,
				y: 1
			},
			anchor: ""
		}, {
			link:true,
			id: "playerStatistics",
			href: "#/playerStatistics",
			text: "Statistics",
			initial: {
				x: 1,
				y: 0.75
			}
		}, {
			link:true,
			id: "exploreWords",
			href: "#/exploreWords",
			text: "Words",
			initial: {
				x: -1,
				y: 1
			}
		}, {
			link:true,
			id: "exploreStatistics",
			href: "#/globalStatistics",
			text: "Statistics",
			initial: {
				x: -1,
				y: 0.75
			}
		}, {
			link:true,
			id: "singleGame",
			href: "#/singleGame",
			text: "Single",
			initial: {
				x: -0.5,
				y: -0.5
			}
		}, {
			link:true,
			id: "multiGame",
			href: "#/multiGame",
			text: "Multiplayer",
			initial: {
				x: 0.5,
				y: -0.5
			}
		}, {
			title:true,
			id: "Associations",
			text: "Associations",
			initial: {
				x: 0,
				y: 0
			},
			fixed: true
		}],
		links: [{
			from: {
				id: "Associations",
				anchor: "Top"
			},
			to: {
				id: "Play",
				anchor: "Bottom"
			}
		}, {
			from: {
				id: "Associations",
				anchor: "Left"
			},
			to: {
				id: "Explore",
				anchor: "Right"
			}
		}, {
			from: {
				id: "Associations",
				anchor: "Right"
			},
			to: {
				id: "Me",
				anchor: "Left"
			}
		}, {
			from: {
				id: "Explore",
				anchor: "Bottom"
			},
			to: {
				id: "exploreWords",
				anchor: "Top"
			}
		}, {
			from: {
				id: "Explore",
				anchor: "Left"
			},
			to: {
				id: "exploreStatistics",
				anchor: "Right"
			}
		}, {
			from: {
				id: "Me",
				anchor: "Bottom"
			},
			to: {
				id: "playerProfile",
				anchor: "Top"
			}
		}, {
			from: {
				id: "Me",
				anchor: "Right"
			},
			to: {
				id: "playerStatistics",
				anchor: "Left"
			}
		}, {
			from: {
				id: "Play",
				anchor: "Top"
			},
			to: {
				id: "singleGame",
				anchor: "Bottom"
			}
		}, {
			from: {
				id: "Play",
				anchor: "Top"
			},
			to: {
				id: "multiGame",
				anchor: "Bottom"
			}
		}]
	};
}]);
