"use strict";

angular.module('associations.pages.exploreWords.components.graph', [])

.constant("GraphDefaults",{
	dragNetwork: false,
	zoomable: false,
	edges: {
		style: 'arrow',
		widthMax: 8,
		arrowScaleFactor: 0.75,
		color: 'blueviolet'
	},
	nodes: {
		shape: 'box',
		borderWidth: 2,
		borderWidthSelected: 2,
		color: {
			border: 'white',
			background: 'black',
			highlight: {
				background: "#222"
			}
		},
		fontColor: 'white',
		fontSize: 18

	}
})
.directive("wordGraph", ["$window", "GraphDefaults", "$timeout", function ($window, GraphDefaults, $timeout) {
	return {
		restrict: 'EA',
		scope: {
			model:'=graphModel',
			config:'=graphConfig',
			onClick:'&graphOnClick'
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
				var prevFocusId = $scope.focusId;
				if (prevFocusId){
					$scope.nodes.remove(prevFocusId);
				}

				$scope.nodes.getIds().forEach(function(id){
					if (!(id in n.nodes)) $scope.nodes.remove(id);
				});
				$scope.edges.getIds().forEach(function(id){
					if (!(id in n.links)) $scope.edges.remove(id);
				});

				var timeoutDelay = 0,
					timeoutInterval = 75,
					addNode = function (id){
						var node = $scope.nodes.get(id),
							update = false;
						if(!node){
							node = {
								id:id,
								label:n.nodes[id]
							};
							update = true;
						}
						if (n.nodes[id] === n.word && $scope.focusId !== id){
							node.x = 0;
							node.y = 0;
							node.mass = 15;
							node.label = "";
							node.shape = "image";
							node.image = "assets/img/selectWord.png";

							$scope.focusId = id;
							update = true;
						}
						if (update){
							$scope.nodes.update(node);
						}

					};

				angular.forEach(n.links, function(data, id){
					var existing = $scope.edges.get(id);
					if(!existing){
						$timeout(function(){
							addNode(data.from);
							addNode(data.to);
							$scope.edges.add({
								id: id,
								from: data.from,
								to: data.to,
								value: data.value
							});
						}, (timeoutDelay += timeoutInterval));
					}
				});
			};

			var initGraph = function(){
				$scope.nodes = new vis.DataSet();
				$scope.edges = new vis.DataSet();

				$scope.graph = new vis.Network(element, {nodes:$scope.nodes, edges:$scope.edges}, $scope.config);
				$scope.graph.on('doubleClick', function(event){
					if (event.nodes.length === 1){
						$scope.onClick({word:$scope.model.nodes[event.nodes[0]]});
					}
				});

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
