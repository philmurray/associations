"use strict";

angular.module('associations.components.piechart', [
	'associations.components.windowResize'
])
.directive('piechart', ["windowResize", function(windowResize) {
	return {
		restrict: 'EA',
		scope: {
			data: "=pieData"
		},
		link: function($scope, $element, attrs) {

			$scope.viewModel = {
				element: $element[0]
			};

			$scope.render = function(){
				$scope.viewModel.size = Math.min($scope.viewModel.element.offsetWidth, 300);
				$scope.viewModel.width = $scope.viewModel.size;
				$scope.viewModel.height = $scope.viewModel.size;
				$scope.viewModel.radius = Math.min($scope.viewModel.width, $scope.viewModel.height) / 2 - 50;

				d3.select($scope.viewModel.element).select('svg').remove();

				$scope.viewModel.svg = d3.select($scope.viewModel.element)
					.append('svg:svg')
						.attr('class', 'pie-chart center-block')
						.attr('width', $scope.viewModel.width)
						.attr('height', $scope.viewModel.height)
					.append("g")
						.attr("transform", "translate(" + $scope.viewModel.width / 2 + "," + $scope.viewModel.height / 2 + ")");

				$scope.viewModel.arc = d3.svg.arc()
					.outerRadius($scope.viewModel.radius - 10)
					.innerRadius(0);

				$scope.viewModel.arcLabel = d3.svg.arc()
					.outerRadius($scope.viewModel.radius + 50)
					.innerRadius($scope.viewModel.radius);

				$scope.viewModel.pie = d3.layout.pie()
					.sort(null)
					.value(function(d) { return d.value; });

				$scope.update();
			};

			$scope.update = function(){
				var arc = $scope.viewModel.svg.selectAll(".arc")
						.data($scope.viewModel.pie($scope.data)),
					newArc = arc.enter().append("g")
						.attr("class", "arc");

				newArc.append("path");

				arc.selectAll("path")
					.attr("d", $scope.viewModel.arc)
					.style("fill", function(d) { return d.data.color; });

				newArc.append("text")
					.attr("dy", ".35em")
					.attr("fill", "white")
					.style("text-anchor", "middle");

				arc.selectAll("text")
					.attr("transform", function(d) { return "translate(" + $scope.viewModel.arcLabel.centroid(d) + ")"; })
					.text(function(d) { return d.data.key; });
			};

			$scope.$watch("data", function(){
				if ($scope.viewModel.svg){
					$scope.update();
				} else {
					$scope.render();
				}
			});

			$scope.$on('$destroy', windowResize.register($scope.render));
		}};
	}
]);
