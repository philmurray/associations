"use strict";

angular.module('associations.pages.game.components.graph', [
	'associations.components.graph.defaults'
])
.constant("GameGraphDefaults", {
})
.directive("gameGraph", ["$window", "GraphDefaults", "GameGraphDefaults", "$timeout", function ($window, GraphDefaults, GameGraphDefaults, $timeout) {
	return {
		restrict: 'EA',
		scope: {
			model:'=graphModel',
			config:'=graphConfig',
			playing:'=graphPlaying',
			selectedWord: '=graphSelected'
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
						picksArray: [],
						picks: {}
					};
					var biggest = [];
					$scope.model.players.forEach(function(player){
						if (player.active) vm.active = player;
						if (!player.picks) return;

						if (player.picks.length > biggest.length) biggest = player.picks;
						player.picks.forEach(function (pick){
							if (!vm.picks[pick.from]) vm.picks[pick.from] = [];
							if (pick.to) {
								vm.picks[pick.from].push({
									to: pick.to,
									normal: pick.normal,
									score: pick.score,
									player: player
								});
							}
						});
					});
					$scope.model.topWords.forEach(function(pick){
						if (!vm.picks[pick.from]) vm.picks[pick.from] = [];

						vm.picks[pick.from].push({
							to: pick.to,
							normal: pick.score,
							score: pick.rank == 1 ? 200 : 100
						});
					});
					biggest.forEach(function(pick){
						if (vm.picks[pick.from].length){
							vm.picksArray.push({
								from: pick.from,
								value: vm.picks[pick.from]
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
						var from = nodes.get("from_" + pick.from);
						if (from.expanded) return;

						var to = nodes.get("to_" + pick.from),
							edge = edges.get("edge_" + pick.from),
							value = pick.value.filter(function(value){ return value.player && value.player.active && value.to; })[0];

						if (!value && to && edge) {
							nodes.remove(to.id);
							edges.remove(edge.id);
						} else if (value && !to && !edge) {
							addValue(pick.from, value);
						} else if (value && to && edge) {
							updateValue(to, edge, value);
						}

					});
				},
				addNode = function (pick){
					nodes.add({
						id: "from_" + pick.from,
						label: pick.from,
						shape: 'circle',
						from: true
					});
					pick.value.forEach(function(value){
						if (value.player && value.player.active && value.to){
							addValue(pick.from, value);
						}
					});
				},
				addValue = function(from, value, expanded) {
					var toId = expanded ? "expanded_" + value.to : "to_" + from,
						to = nodes.get(toId) ? null : {
							id: toId
						};
					if (to) {
						var fromId = "from_" + from,
							position = $scope.graph && $scope.graph.getPositions(fromId)[fromId];
						if (position) {
							to.x = position.x + (Math.random() * 200 - 100);
							to.y = position.y + (Math.random() * 200 - 100);

							to.allowedToMoveX = true;
							to.allowedToMoveY = true;
						}
					} else if (!value.player) {
						return;
					}

					var edgeId = "edge_" + (expanded ? (value.player && value.player.id) + value.to : from),
						edge = {
							id: edgeId,
							from: "from_" + from,
							to: toId
						};

					setConnectedValueStyle(to, edge, value, expanded);

					if (to) {
						nodes.add(to);
					}
					edges.add(edge);
				},
				updateValue = function (to, edge, value, expanded) {
					setConnectedValueStyle(to, edge, value, expanded);
					to.x = undefined;
					to.y = undefined;

					nodes.update(to);
					edges.update(edge);
				},
				setConnectedValueStyle = function(to, edge, value, label){

					edge.value = value.normal;
					edge.color = value.player ? value.player.color.hex: '#888888';
					edge.style = value.normal === 0 ? 'dash-line' : 'arrow';
					edge.fontColor = edge.color;
					edge.label = label && value.player ? value.player.alias: '';

					if (edge.label) edge.length = 200;

					if (to) {
						to.label = value.to;

						if (value.score === 200) {
							to.color = {
								border: "white",
								background: "white"
							};
							to.fontColor = 'black';
						} else {
							to.color = {
								border: edge.label ? "white" : shadeColor(edge.color, 0.50),
								background: "black"
							};
							to.fontColor = edge.label ? "white" : shadeColor(edge.color, 0.50);
						}
					}
				},
				onSelect = function (selected) {
					$scope.selectedWord = selected && selected.nodes && selected.nodes.length && nodes.get(selected.nodes[0]);
					$scope.$apply();
				},
				expand = function(node){
					if (node.from) {
						node.expanded = true;
						nodes.update(node);

						var fromValue = node.label;
						nodes.remove("to_" + fromValue);
						edges.remove("edge_" + fromValue);


						var timeoutDelay = 0,
							timeoutInterval = 75;

						viewModel.picks[fromValue].forEach(function(value){
							$timeout(function(){
								addValue(fromValue, value, true);
							}, (timeoutDelay += timeoutInterval));
						});
					}
				},
				collapse = function(node){
					if (node.from) {
						node.expanded = false;
						nodes.update(node);
						var fromValue = node.label;

						$scope.graph.getConnectedNodes(node.id).forEach(function(nodeId){
							nodes.remove(nodeId);
						});
						viewModel.picks[fromValue].forEach(function(value){
							edges.remove("edge_" + (value.player && value.player.id) + value.to);
							if (value.player && value.player.active) {
								addValue(fromValue, value);
							}
						});
					}
				};

			var setGraphSize = function(){
				$scope.graph.setSize('100%', w[0].innerHeight+'px');
				$scope.graph.redraw();
			};

			var initGraph = function(){
				nodes = new vis.DataSet();
				edges = new vis.DataSet();

				updateModel($scope.model);

				$scope.graph = new vis.Network(element, {nodes:nodes, edges:edges}, $scope.config);
				$scope.graph.on('select', onSelect);

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
						keyboard: !Boolean(n)
					});
					if (!n && o){
						$scope.graph.zoomExtent();
					}
				}
			}, true);

			$scope.$watch('{id: selectedWord.id, expanded: selectedWord.expanded}', function(n, o){
				if (n.id === o.id && n.expanded !== o.expanded){
					if ($scope.selectedWord.expanded) {
						nodes.forEach(function(node){
							if (node !== $scope.selectedWord && node.expanded){
								collapse(node);
							}
						});
						expand($scope.selectedWord);
					}
					else collapse($scope.selectedWord);
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
