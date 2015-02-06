"use strict";

angular.module('associations.pages.exploreWords.components.graph', [])

.constant("GraphDefaults",{
	dragNetwork: false,
	zoomable: false,
	edges: {
		style: 'arrow',
		widthMax: 8,
		arrowScaleFactor: 0.75
	}
})
.directive("wordGraph", ["$window", "GraphDefaults", function ($window, GraphDefaults) {
	return {
		restrict: 'EA',
		scope: {
			model:'=graphModel',
			config:'=graphConfig',
			staticElements:'=graphStatics'
		},
		link: function($scope, $element, attrs) {
			var w = angular.element($window),
			element = $element[0];

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

			$scope.config = angular.extend(angular.copy(GraphDefaults), $scope.config || {});

			var mergeModel = function mergeModel(n,o){
				if (!$scope.nodes || !$scope.edges) return;
				if (!n){
					$scope.nodes.clear();
					$scope.edges.clear();
					return;
				}
				angular.forEach(n.nodes, function(data,id){
					var existing = $scope.nodes.get(id);
					if(!existing){
						var newNode = {
							id:id,
							label:data
						};
						if (data === n.word){
							newNode.x = 0;
							newNode.y = 0;
							newNode.mass = 15;
							newNode.label = "                                                             \n                                                             \n                                                             \n";
							newNode.shape = "box";

							$scope.focusId = id;
						}
						$scope.nodes.add(newNode);
					} else {
						//unset x and y
					}
				});
				$scope.nodes.getIds().forEach(function(id){
					if (!(id in n.nodes)) $scope.nodes.remove(id);
				});
				angular.forEach(n.links, function(data, id){
					var existing = $scope.edges.get(id);
					if(!existing){
						$scope.edges.add({
							id: id,
							from: data.from,
							to: data.to,
							value: data.value
						});
					}
				});
				$scope.edges.getIds().forEach(function(id){
					if (!(id in n.links)) $scope.edges.remove(id);
				});
			};

			var initGraph = function(){
				$scope.nodes = new vis.DataSet();
				$scope.edges = new vis.DataSet();

				$scope.graph = new vis.Network(element, {nodes:$scope.nodes, edges:$scope.edges}, $scope.config);

				mergeModel($scope.model);
			};

			$scope.$watch('model', mergeModel);

			$scope.render = function() {
				if (!$scope.graph){
					initGraph();
				} else {
					$scope.graph.redraw();
					if ($scope.focusId){
						$scope.graph.focusOnNode($scope.focusId);
					}
				}
			};
		}
	};
}]);
