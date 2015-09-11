"use strict";

angular.module('associations.components.barchart', [
	'associations.components.windowResize'
])
.directive('barchart', ["windowResize", function(windowResize) {
	return {
		restrict: 'EA',
		scope: {
			data: "=barData",
			options: "=barOptions"
		},
		link: function($scope, $element, attrs) {

			$scope.viewModel = {
				element: $element[0],
				margin: {top: 20, right: 20, bottom: 30, left: 40}
			};

			$scope.render = function(){
				$scope.viewModel.width = $scope.viewModel.element.offsetWidth;
				$scope.viewModel.height = $scope.options.height || 500;

				d3.select($scope.viewModel.element).select('svg').remove();

				$scope.viewModel.svg = d3.select($scope.viewModel.element)
					.append('svg:svg')
						.attr('class', 'bar-chart center-block')
						.attr('width', $scope.viewModel.width)
						.attr('height', $scope.viewModel.height)
					.append("g")
						.attr("transform", "translate(" + $scope.viewModel.margin.left + "," + $scope.viewModel.margin.top + ")");

				$scope.viewModel.chartWidth = $scope.viewModel.width - $scope.viewModel.margin.left - $scope.viewModel.margin.right;
				$scope.viewModel.chartHeight = $scope.viewModel.height - $scope.viewModel.margin.top - $scope.viewModel.margin.bottom;

				$scope.viewModel.x = d3.scale.ordinal()
					.rangeRoundBands([0, $scope.viewModel.chartWidth], 0.1);

				$scope.viewModel.y = d3.scale.linear()
					.range([$scope.viewModel.chartHeight, 0]);

				$scope.viewModel.xAxis = d3.svg.axis()
					.scale($scope.viewModel.x)
					.orient("bottom");

				$scope.update();
			};

			$scope.update = function(){
				if ($scope.data && $scope.data.length){
					$scope.viewModel.x.domain($scope.data.map(function(d) { return d.key; }));
					$scope.viewModel.y.domain([0, d3.max($scope.data, function(d) { return d.value; })]);

					$scope.viewModel.svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + $scope.viewModel.height + ")")
						.call($scope.viewModel.xAxis);

					var bar = $scope.viewModel.svg.selectAll(".bar").data($scope.data),
						newBar = bar.enter()
							.append("rect")
							.attr("class", "bar");

					bar.attr("x", function(d) { return $scope.viewModel.x(d.key); })
						.attr("width", $scope.viewModel.x.rangeBand())
						.attr("y", function(d) { return $scope.viewModel.y(d.value); })
						.attr("height", function(d) { return $scope.viewModel.chartHeight - $scope.viewModel.y(d.value); });
				}
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
