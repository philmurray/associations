"use strict";

angular.module('associations.components.diagram', [])
.factory('DiagramService', [function(){

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

	return {
		getGraph: function(element, words, links, plumbInstance){

			var toScreen = function(p) {
					var sx = element.offsetWidth/2 + (element.offsetWidth/10) * p.x;
					var sy = element.offsetHeight/2 + (element.offsetHeight/10) * p.y;
					return new Springy.Vector(sx, sy);
				},
				render = function render() {
					layout.eachNode(function(node, point) {
						var ele = node.data.element,
						p = toScreen(point.p);

						ele.style.left = (p.x - ele.offsetWidth/2) + 'px';
						ele.style.top = (p.y - ele.offsetHeight/2) + 'px';
					});
					plumbInstance && plumbInstance.repaintEverything();
				};

			var graph = new Springy.Graph();

			//add nodes
			var nodes = {};
			var addNode = function(node){
				nodes[node.id] = graph.newNode({
					element: element.querySelector('#' + node.id),
					initial: node.initial ? new Springy.Vector(node.initial.x, node.initial.y) : undefined,
					fixed: node.fixed
				});
			};
			words.forEach(addNode);

			links.forEach(function(connection){
				graph.newEdge(nodes[connection.from.id], nodes[connection.to.id]);
			});

			var layout = new MyForceDirected(graph,50.0, 10.0, 0.85, 0.07);

			return {
				layout: layout,
				graph: graph,
				start: layout.start.bind(layout, render)
			};
		}
	};
}]);
