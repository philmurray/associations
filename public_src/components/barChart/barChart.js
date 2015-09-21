"use strict";

angular.module('associations.components.barchart', [
	'associations.components.windowResize'
])
.constant("BAR_CHART_DEFAULTS", {
	height: 500,
	axisColor: "#333",
	fontColor: "#f2f2f2",
	barColor: "#f2f2f2",
	margin: {top: 20, right: 40, bottom: 100, left: 20}
})
.directive('barchart', ["windowResize", "BAR_CHART_DEFAULTS", function(windowResize, BAR_CHART_DEFAULTS) {
	return {
		restrict: 'EA',
		scope: {
			data: "=barData",
			options: "=barOptions"
		},
		link: function($scope, $element, attrs) {


			$scope.options = angular.extend({}, BAR_CHART_DEFAULTS, $scope.options || {});

			$scope.viewModel = {
				element: $element[0],
				margin: $scope.options.margin
			};

			$scope.$on('$destroy', function(){
				if ($scope.viewModel.tip){
					$scope.viewModel.tip.destroy();
				}
			});

			$scope.render = function(){
				$scope.viewModel.width = $scope.viewModel.element.offsetWidth;
				$scope.viewModel.height = $scope.options.height;

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
					.outerTickSize(3)
					.orient("bottom");

				$scope.viewModel.xAxisG = $scope.viewModel.svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + $scope.viewModel.chartHeight + ")")
					.call($scope.viewModel.xAxis);

				$scope.viewModel.xAxisG.selectAll('path')
					.attr("fill", $scope.options.axisColor);

				$scope.viewModel.tip = $scope.viewModel.tip || d3.tip()
					.attr('class', 'd3-tip')
					.html(function(d) { return d.description; })
					.offset([-10, 0]);
				$scope.viewModel.svg.call($scope.viewModel.tip);

				$scope.update();
			};

			$scope.update = function(){
				if ($scope.data && $scope.data.length){
					$scope.viewModel.x.domain($scope.data.map(function(d) { return d.key; }));
					$scope.viewModel.y.domain([0, d3.max($scope.data, function(d) { return d.value; })]);

					$scope.viewModel.xAxisG
						.call($scope.viewModel.xAxis)
						.selectAll("text")
							.attr("y", 9)
							.attr("x", 9)
							.attr("fill", $scope.options.fontColor)
							.attr("dy", ".35em")
							.attr("transform", "rotate(45)")
							.style("text-anchor", "start");

					var bar = $scope.viewModel.svg.selectAll(".bar").data($scope.data),
						newBar = bar.enter()
							.append("rect")
							.attr("class", "bar svg-link")
							.on('mouseover', $scope.viewModel.tip.show)
							.on('mouseout', $scope.viewModel.tip.hide);

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
