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
.directive("wordGraph", ["$window", "GraphDefaults", "$timeout", "$document", function ($window, GraphDefaults, $timeout, $document) {
	return {
		restrict: 'EA',
		scope: {
			model:'=graphModel',
			config:'=graphConfig',
			onClick:'&graphOnClick',
			wordId:'=',
			otherWordId:'='
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

			var wordElement = $document[0].getElementById($scope.wordId),
				otherWordElement = $document[0].getElementById($scope.otherWordId);

			var setAnchorNodePosition = function(node, ele){
				var pos = $scope.graph.DOMtoCanvas({
					x:ele.offsetLeft + ele.offsetWidth/2,
					y:ele.offsetTop + ele.offsetHeight/2}
				);
				node.x = pos.x;
				node.y = pos.y;
			};

			var styleAnchorNode = function(node, ele){
				if (node.label){
					setAnchorNodePosition(node,ele);
					node.mass = 15;
					node.label = "";
					node.shape = "image";
					node.image = "assets/img/selectWord.png";
					return true;
				}
				return false;
			};

			var styleNormalNode = function(node, label){
				if (!node.label){
					//I really really wish there were a way to delete properties on a DataSet node...
					$scope.nodes.remove(node);
					$scope.nodes.add({
						id:node.id,
						label:label
					});
				}
				return false;
			};

			var addNode = function (id){
				var node = $scope.nodes.get(id),
					update = false;
				if(!node){
					node = {
						id:id,
						label:$scope.model.nodes[id]
					};
					update = true;
				}
				if (id == $scope.model.word){
					update = styleAnchorNode(node,wordElement) || update;
				} else if (id == $scope.model.otherWord){
					update = styleAnchorNode(node,otherWordElement) || update;
				} else {
					update = styleNormalNode(node, $scope.model.nodes[id]) || update;
				}

				if (update){
					$scope.nodes.update(node);
				}

			};

			var mergeModel = function mergeModel(n,o){
				if (!$scope.nodes || !$scope.edges) return;
				if (!n){
					$scope.nodes.clear();
					$scope.edges.clear();
					return;
				}

				$scope.nodes.getIds().forEach(function(id){
					if (!(id in n.nodes)) $scope.nodes.remove(id);
				});
				$scope.edges.getIds().forEach(function(id){
					if (!(id in n.links)) $scope.edges.remove(id);
				});

				var timeoutDelay = 0,
					timeoutInterval = 75;

				if (n.word) addNode(n.word);
				if (n.otherWord) addNode(n.otherWord);
				if (o && o.word && o.word in n.nodes) addNode(o.word);
				if (o && o.otherWord && o.otherWord in n.nodes) addNode(o.otherWord);

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
					$scope.graph.moveTo({position:{x:0,y:0}});

					var node;
					if ($scope.model.word) {
						node = $scope.nodes.get($scope.model.word);
						if (node){
							setAnchorNodePosition(node, wordElement);
							$scope.nodes.update(node);
						}
					}
					if ($scope.model.otherWord) {
						node = $scope.nodes.get($scope.model.otherWord);
						if (node){
							setAnchorNodePosition(node, otherWordElement);
							$scope.nodes.update(node);
						}
					}
				}
			};
		}
	};
}]);
