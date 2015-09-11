"use strict";

angular.module('associations.components.piechart', [
	'associations.components.windowResize'
])
.constant('PIE_DEFAULT_OPTIONS', {
	"header": {
		"title": {
			"text": "",
			"color": "#ffffff",
			"fontSize": 31,
			"font": '"Helvetica Neue", Helvetica, Arial, sans-serif'
		}
	},
	"footer": {
		"text": 	  "",
		"color":    "#ffffff",
		"fontSize": 18,
		"font":     '"Helvetica Neue", Helvetica, Arial, sans-serif',
		"location": "left"
	},
	"size": {
		"pieOuterRadius": "90%"
	},
	"data": {
		"sortOrder": "value-desc",
		"smallSegmentGrouping": {
			"enabled": true
		}
	},
	"labels": {
		"outer": {
			"pieDistance": 18
		},
		"inner": {
			"format": "none"
		},
		"mainLabel": {
			"color": "#ffffff",
			"fontSize": 18
		},
		"lines": {
			"enabled": true
		},
		"truncation": {
			"enabled": true
		}
	},
	"effects": {
		"load": {
			"effect": "none"
		},
		"highlightSegmentOnMouseover": false
	},
	"misc": {
		"colors": {
			"segments": [ //TODO: get these from the database
				"#AAFE00",
				"#9D08FB",
				"#00FBD8",
				"#FD008F",
				"#FF6A00",
				"#FFFC00",
				d3.rgb("#AAFE00").darker(5),
				d3.rgb("#9D08FB").darker(5),
				d3.rgb("#00FBD8").darker(5),
				d3.rgb("#FD008F").darker(5),
				d3.rgb("#FF6A00").darker(5),
				d3.rgb("#FFFC00").darker(5)
			]
		}
	}
})
.directive('piechart', ["windowResize", 'PIE_DEFAULT_OPTIONS', function(windowResize, PIE_DEFAULT_OPTIONS) {
	return {
		restrict: 'EA',
		scope: {
			data: "=pieData",
			options: "=?pieOptions"
		},
		link: function($scope, $element, attrs) {

			$scope.options = angular.extend({}, PIE_DEFAULT_OPTIONS, $scope.options || {});

			$scope.render = function(){
				if ($scope.pie){
					$scope.pie.destroy();
				}

				if (!$scope.data || !$scope.data.length) return;

				$scope.options.size.canvasWidth = $element[0].offsetWidth;

				$scope.options.data.content = $scope.data.map(function(d){
					return {
						label: d.key,
						value: parseFloat(d.value, 10),
						color: d.color
					};
				});

				$scope.pie = new d3pie($element[0], $scope.options);
			};

			$scope.$watch("data", $scope.render);

			$scope.$on('$destroy', windowResize.register($scope.render));
		}};
	}
]);
