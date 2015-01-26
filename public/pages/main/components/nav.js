"use strict";

angular.module('associations.pages.main.components.nav',[])

.directive("mainNavigation", ["$window", "$timeout", function ($window, $timeout) {
	return {
		restrict: 'EA',
		templateUrl: "pages/main/components/nav.html",
		scope: {
			model: "=navModel"
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

			var MyForceDirected = function() {
				Springy.Layout.ForceDirected.apply(this, Array.prototype.slice.call(arguments, 0));
			};
			MyForceDirected.prototype = Object.create(Springy.Layout.ForceDirected.prototype, {constructor:{value:MyForceDirected}});

			MyForceDirected.prototype.updateVelocity = function(timestep) {
				this.eachNode(function(node, point) {
					if (!node.data.fixed){
						point.v = point.v.add(point.a.multiply(timestep)).multiply(this.damping);
					}
					point.a = new Springy.Vector(0,0);
				});
			};

			MyForceDirected.prototype.point = function(node) {
				if (!(node.id in this.nodePoints)) {
					var mass = (node.data.mass !== undefined) ? node.data.mass : 1.0;
					var point = node.data.initial || Springy.Vector.random();
					this.nodePoints[node.id] = new Springy.Layout.ForceDirected.Point(point, mass);
				}

				return this.nodePoints[node.id];
			};

			jsPlumb.ready(function(){
			});

			$scope.render = function() {
				var toScreen = function(p) {
					var sx = element.offsetWidth/2 + (element.offsetWidth/10) * p.x;
					var sy = element.offsetHeight/2 + (element.offsetHeight/10) * p.y;
					return new Springy.Vector(sx, sy);
				},
				plumbInstance,
				render = function render() {
					$scope.layout.eachNode(function(node, point) {
						var ele = node.data.element,
						p = toScreen(point.p);

						ele.style.left = (p.x - ele.offsetWidth/2) + 'px';
						ele.style.top = (p.y - ele.offsetHeight/2) + 'px';
					});
					plumbInstance.repaintEverything();
				};

				// make a new graph
				if (!$scope.layout){
					$timeout(function(){
						plumbInstance = plumbInstance || jsPlumb.getInstance({
							Container:element.querySelector('#navContainer'),
							Connector: "StateMachine",
							Endpoints: [["Dot",{radius:7, cssClass:"endpoint"}],"Blank"],
							Overlays: [["PlainArrow", {cssClass:"arrow", width: 15, length: 15, location:1}]]
						});

						$scope.graph = new Springy.Graph();

						//add nodes
						var nodes = {};
						var addNode = function(node){
							nodes[node.id] = $scope.graph.newNode({
								element: element.querySelector('#' + node.id),
								initial: node.initial ? new Springy.Vector(node.initial.x, node.initial.y) : undefined,
								fixed: node.fixed
							});
						};
						addNode($scope.model.title,true);
						$scope.model.words.forEach(addNode);
						$scope.model.links.forEach(addNode);


						$scope.model.connections.forEach(function(connection){
							$scope.graph.newEdge(nodes[connection.from.id], nodes[connection.to.id]);
							plumbInstance.connect({
								source:nodes[connection.from.id].data.element,
								target:nodes[connection.to.id].data.element,
								anchor:[connection.from.anchor, connection.to.anchor]
							});
						});

						$scope.layout = new MyForceDirected($scope.graph,50.0, 10.0, 0.85, 0.07);
						$scope.layout.start(render);

					});
				} else {
					$scope.layout.start(render);
				}


			};


		}};
}]);
