"use strict";

angular.module('associations.pages.main.components.nav',['associations.components.diagram'])

.directive("mainNavigation", ["$window", "$timeout", "DiagramService", function ($window, $timeout, DiagramService) {
	return {
		restrict: 'EA',
		templateUrl: "pages/main/components/nav.html",
		scope: {
			model: "=navModel"
		},
		link: function($scope, $element, attrs) {
			var w = angular.element($window),
				element = $element[0],
				container = element.querySelector('#navContainer');

			// Browser onresize event
			w.bind('resize', function () {
				$scope.$apply();
			});

			// Watch for resize event
			$scope.$watch(function() {
				return {
					width: w[0].innerWidth,
					height: w[0].innerHeight
				};
			}, function() {
				$scope.render();
			},true);

			$scope.render = function() {
				// make a new graph
				if (!$scope.graph){
					$timeout(function(){
						jsPlumb.ready(function(){
							var plumbInstance = plumbInstance || jsPlumb.getInstance({
								Container:container,
								Connector: "StateMachine",
								Endpoints: [["Dot",{radius:7, cssClass:"endpoint"}],"Blank"],
								Overlays: [["PlainArrow", {cssClass:"arrow", width: 15, length: 15, location:1}]]
							});

							var nodes = [].concat($scope.model.words, $scope.model.links, [$scope.model.title]);

							$scope.graph = DiagramService.getGraph(container, nodes, $scope.model.connections, plumbInstance);

							$scope.model.connections.forEach(function(connection){
								plumbInstance.connect({
									source:connection.from.id,
									target:connection.to.id,
									anchor:[connection.from.anchor, connection.to.anchor]
								});
							});

							$scope.graph.start();

						});
					});
				} else {
					$scope.graph.start();
				}


			};


		}};
}]);
