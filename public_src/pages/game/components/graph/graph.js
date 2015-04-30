"use strict";

angular.module('associations.pages.game.components.graph', [
	'associations.components.graph.defaults'
])
.constant("GameGraphDefaults", {
})
.directive("gameGraph", ["$window", "GraphDefaults", "GameGraphDefaults", "$timeout", "$document", "$location", function ($window, GraphDefaults, GameGraphDefaults, $timeout, $document, $location) {
	return {
		restrict: 'EA',
		scope: {
			model:'=graphModel',
			config:'=graphConfig',
			playing:'=graphPlaying'
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

			$scope.config = angular.extend({}, GraphDefaults, GameGraphDefaults, $scope.config || {});

			//TODO: put somewhere common
			var shadeColor = function (color, percent) {
			    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
			    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
			};

			var viewModel,
				nodes,
				edges,
				createViewModel = function(){
					var vm = {
						picksArray: []
					};
					var picks = {},
						biggest = [];
					$scope.model.players.forEach(function(player){
						if (player.active) vm.active = player;
						if (!player.picks) return;

						if (player.picks.length > biggest.length) biggest = player.picks;
						player.picks.forEach(function (pick){
							if (!picks[pick.from]) picks[pick.from] = [];
							if (pick.to) {
								picks[pick.from].push({
									to: pick.to,
									normal: pick.normal,
									score: pick.score,
									player: player
								});
							}
						});
					});
					biggest.forEach(function(pick){
						if (picks[pick.from].length){
							vm.picksArray.push({
								from: pick.from,
								value: picks[pick.from]
							});
						}
					});
					return vm;
				},
				updateModel = function(){
					if (!$scope.model) return;

					var newViewModel = createViewModel();
					if (viewModel) {
						if (newViewModel.picksArray.length > viewModel.picksArray.length){
							for (var i = viewModel.picksArray.length; i < newViewModel.picksArray.length; i++){
								addNode(newViewModel.picksArray[i]);
							}
						}
						if (viewModel.active !== newViewModel.active){
							updateNodes(newViewModel.picksArray);
						}
					} else {
						for (var j = 0; j < newViewModel.picksArray.length; j++){
							addNode(newViewModel.picksArray[j]);
						}
					}
					viewModel = newViewModel;
				},
				updateNodes = function(picks){
					picks.forEach(function(pick){
						var to = nodes.get("to_" + pick.from),
							edge = edges.get("edge_" + pick.from),
							value = pick.value.filter(function(value){ return value.player.active && value.to; })[0];

						if (!value && to && edge) {
							nodes.remove(to.id);
							edges.remove(edge.id);
						} else if (value && !to && !edge) {
							addConnectedValue(pick, value);
						} else if (value && to && edge) {
							setConnectedValueStyle(to, edge, value);
							nodes.update(to);
							edges.update(edge);
						}

					});
				},
				addNode = function (pick){
					nodes.add({
						id: "from_" + pick.from,
						label: pick.from
					});
					pick.value.forEach(function(value){
						if (value.player.active && value.to){
							addConnectedValue(pick, value);
						}
					});
				},
				addConnectedValue = function(pick, value) {
					var to = {
							id: "to_" + pick.from
						},
						edge = {
							id: "edge_" + pick.from,
							from: "from_" + pick.from,
							to: "to_" + pick.from
						};

					setConnectedValueStyle(to, edge, value);
					nodes.add(to);
					edges.add(edge);
				},
				setConnectedValueStyle = function(to, edge, value){
					to.label = value.to;
					to.fontColor = shadeColor(value.player.color.hex, 0.50);
					to.value = value.score;

					edge.value = value.normal;
					edge.color = value.player.color.hex;
					edge.style = value.normal === 0 ? 'dash-line' : 'arrow';
				},
				onClick = function(selected){
					if (selected.nodes && selected.nodes.length) {
						var node = nodes.get(selected.nodes[0]);
						//expand node, collapse others
					} else {
						//collapse all nodes
					}
				},
				onDoubleClick = function(selected){
					if (selected.nodes && selected.nodes.length) {
						var node = nodes.get(selected.nodes[0]);
						//navigate to explore page for node
					}
				};

			var setGraphSize = function(){
				$scope.graph.setSize('100%', (w[0].innerHeight-32)+'px');	//todo: make this less stupid
				$scope.graph.redraw();
			};

			var initGraph = function(){
				nodes = new vis.DataSet();
				edges = new vis.DataSet();

				updateModel($scope.model);

				$scope.graph = new vis.Network(element, {nodes:nodes, edges:edges}, $scope.config);
				$scope.graph.on('click', onClick);
				$scope.graph.on('doubleClick', onDoubleClick);

				setGraphSize();
				$scope.graph.zoomExtent({
					duration: 0
				});
			};

			$scope.$watch('model', updateModel, true);
			$scope.$watch('playing', function(n, o){
				if ($scope.graph){
					$scope.graph.setOptions({
						dragNodes: !Boolean(n),
						dragNetwork: !Boolean(n),
						zoomable: !Boolean(n),
						keyboard: !Boolean(n),
					});
					if (!n && o){
						$scope.graph.zoomExtent();
					}
				}
			}, true);

			$scope.render = function() {
				if (!$scope.graph){
					initGraph();
				} else {
					setGraphSize();

				}
			};
		}
	};
}]);
