"use strict";

angular.module('associations.components.diagram', [])

.constant("plumbDefaults",{
	Connector: ["StateMachine",{proximityLimit:30}],
	Endpoints: ["Blank","Blank"],
	Overlays: [["PlainArrow", {cssClass:"arrow", width: 15, length: 15, location:1}]]
})

.constant("springyDefaults",{
	stiffness: 50.0,
	repulsion: 10.0,
	damping: 0.85,
	minEnergyThreshold: 0.07
})

.factory('MyForceDirected', [function(){

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
			var point = node.data.initial || new Springy.Vector(5.0 * (Math.random() - 0.5), 5.0 * (Math.random() - 0.5));
			this.nodePoints[node.id] = new Springy.Layout.ForceDirected.Point(point, mass);
		}

		return this.nodePoints[node.id];
	};

	return MyForceDirected;
}])

.directive("diagram", ["$window", "$timeout", "plumbDefaults", "springyDefaults", "MyForceDirected", function ($window, $timeout, plumbDefaults, springyDefaults, MyForceDirected) {
	return {
		restrict: 'EA',
		transclude: true,
		replace: true,
		scope: {
			model:'=diagramModel',
			config:"=diagramConfig"
		},
		template: '<div style="position:relative; width:100%; height:100%">' +
			'<ng-transclude></ng-transclude>' +
			'</div>',
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

			$scope.config = $scope.config || {};
			$scope.config.jsPlumb = angular.extend(angular.copy(plumbDefaults), $scope.config.jsPlumb || {});
			$scope.config.jsPlumb.Container = element;
			$scope.config.springy = angular.extend(angular.copy(springyDefaults), $scope.config.springy || {});

			var toScreen = function(p) {
				var sx = element.offsetWidth/2 + (element.offsetWidth/10) * p.x;
				var sy = element.offsetHeight/2 + (element.offsetHeight/10) * p.y;
				return new Springy.Vector(sx, sy);
			};

			var render = function render() {
				$scope.layout.eachNode(function(node, point) {
					var ele = node.data.element,
					p = toScreen(point.p);

					ele.style.left = (p.x - ele.offsetWidth/2) + 'px';
					ele.style.top = (p.y - ele.offsetHeight/2) + 'px';
				});
				$scope.plumbInstance.repaintEverything();
			};

			var mergeModel = function(newModel, oldModel){

				if (!$scope.plumbInstance) return;

				$scope.graph = new Springy.Graph();

				// nodes
				angular.forEach(newModel.nodes, function(data, id){
					var node = new Springy.Node(id, {
						element: element.querySelector('#' + id),
						initial: data.initial ? new Springy.Vector(data.initial.x, data.initial.y) : undefined,
						fixed: data.fixed
					});
					$scope.graph.addNode(node);
				});

				$scope.plumbInstance.reset();
				// edges
				angular.forEach(newModel.links, function(link){
					var edge = new Springy.Edge(link.source.id + "_" + link.target.id, link.source, link.target, {});
					edge.data.connection = $scope.plumbInstance.connect({
						source:link.source.id,
						target:link.target.id,
						anchor:[link.source.anchor, link.target.anchor]
					});
					$scope.graph.addEdge(edge);
				});

				if ($scope.layout) {
					$scope.layout.graph = $scope.graph;
					$scope.layout.start(render);
				}
			};

			var initDiagram = function(){
				jsPlumb.ready(function(){
					$scope.plumbInstance = $scope.plumbInstance || jsPlumb.getInstance($scope.config.jsPlumb);

					mergeModel($scope.model);

					$scope.layout = new MyForceDirected(
						$scope.graph,
						$scope.config.springy.stiffness,
						$scope.config.springy.repulsion,
						$scope.config.springy.damping,
						$scope.config.springy.minEnergyThreshold);

					$scope.layout.start(render);
				});
			};

			$scope.$watch('model', function (n,o){
				$timeout(mergeModel.bind(null,n,o),100);
			});

			$scope.render = function() {
				if (!$scope.layout){
					$timeout(initDiagram);
				} else {
					$scope.layout.start(render);
				}
			};


		}};
	}]);