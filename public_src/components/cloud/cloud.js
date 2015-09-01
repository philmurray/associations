"use strict";

angular.module('associations.components.cloud', [
	'associations.components.windowResize'
])
.directive('cloud', ["windowResize", function(windowResize) {
	return {
		restrict: 'EA',
		scope: {
			data: "=cloudData",
			textAttr: "=cloudTextAttr",
			sizeAttr: "=cloudSizeAttr",
			height: "=cloudHeight"
		},
		link: function($scope, $element, attrs) {

			$scope.viewModel = {
				element: $element[0]
			};

			$scope.render = function(){
				$scope.viewModel.width = $scope.viewModel.element.offsetWidth;
				$scope.viewModel.height = $scope.height || 300;

				d3.select($scope.viewModel.element).select('svg').remove();

				$scope.viewModel.svg = d3.select($scope.viewModel.element)
					.append('svg:svg')
						.attr('class', 'pie-chart center-block')
						.attr('width', $scope.viewModel.width)
						.attr('height', $scope.viewModel.height)
					.append("g")
						.attr("transform", "translate(" + $scope.viewModel.width / 2 + "," + $scope.viewModel.height / 2 + ")");

				$scope.update();
			};

			$scope.update = function(){
				$scope.viewModel.svg.selectAll("text").remove();

				if (!$scope.data) return;

				var max = 0,
					words = $scope.data.map(function(d) {
						var r = {
							text: d[$scope.textAttr],
							size: parseFloat(d[$scope.sizeAttr], 10)
						};
						if (r.size > max) max = r.size;

						return r;
					});
				words.forEach(function(d){
					d.size = Math.round((d.size/max)*72);
				});

				var layout = d3.layout.cloud()
					.size([$scope.viewModel.width, $scope.viewModel.height])
					.words(words)
					.padding(5)
					.rotate(function() { return ~~(Math.random() * 2) * 90; })
					.font("Impact")
					.fontSize(function(d) { return d.size; })
					.on("end", function(d){
						$scope.viewModel.svg.selectAll("text").data(d).enter()
							.append("text")
								.style("font-size", function(d) { return d.size + "px"; })
								.style("font-family", "Impact")
								.style("fill", "white")
								.attr("text-anchor", "middle")
								.attr("transform", function(d) {
									return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
								})
								.text(function(d) { return d.text; });
					});

				layout.start();
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
