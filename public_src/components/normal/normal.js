"use strict";

angular.module('associations.components.normal', [
	'associations.components.windowResize'
])
.constant('NORMAL_RANGE_CHAR', ['fa-circle-o','fa-circle','fa-square-o', 'fa-square', 'fa-check-square-o', 'fa-check-square'])
.constant('NORMAL_RANGE_CLASS', ['\uf10c', '\uf111', '\uf096', '\uf0c8', '\uf046', '\uf14a'])
.constant('NORMAL_DOMAIN', [0,0.25])
.factory('NormalConverter', ["NORMAL_RANGE_CHAR", "NORMAL_RANGE_CLASS", "NORMAL_DOMAIN", function(NORMAL_RANGE_CHAR, NORMAL_RANGE_CLASS,NORMAL_DOMAIN){
	var scale = d3.scale.linear().domain(NORMAL_DOMAIN).rangeRound([0,NORMAL_RANGE_CHAR.length]).clamp(true);
	return {
		toChar: function(n){
			return NORMAL_RANGE_CHAR[scale(n)];
		},
		toClass: function(n){
			return NORMAL_RANGE_CLASS[scale(n)];
		}
	};
}])
.directive('normal', ["windowResize", "Gauge", function(windowResize, Gauge) {
	return {
		restrict: 'EA',
		scope: {
			value: "=normalValue",
			color: "=normalColor"
		},
		link: function($scope, $element, attrs) {

			var element = $element[0];

			var config = {
				size: 300,
				clipWidth: 300,
				clipHeight: 300,
				ringWidth: 60,
				maxValue: 1,
				transitionMs: 4000,
				arcColorFn: d3.interpolateHsl(d3.rgb($scope.color).darker(5), d3.rgb($scope.color))
			};

			var g = new Gauge(element, config);
			g.render(0);

			$scope.render = function(){

			};

			$scope.$watch("value", function(){
				g.update($scope.value);
			});

			$scope.$on('$destroy', windowResize.register($scope.render));
		}};
	}
])
.factory('Gauge', [function(){
	var gauge = function(container, configuration) {
		var that = {};
		var config = {
			size						: 200,
			clipWidth					: 200,
			clipHeight					: 110,
			ringInset					: 20,
			ringWidth					: 20,

			pointerWidth				: 10,
			pointerTailLength			: 5,
			pointerHeadLengthPercent	: 0.9,

			minValue					: 0,
			maxValue					: 10,

			minAngle					: -90,
			maxAngle					: 90,

			transitionMs				: 750,

			majorTicks					: 5,
			labelFormat					: d3.format(',g'),
			labelInset					: 10
		};
		var range;
		var r;
		var pointerHeadLength;
		var value = 0;

		var svg;
		var arc;
		var scale;
		var ticks;
		var tickData;
		var pointer;

		var donut = d3.layout.pie();

		function deg2rad(deg) {
			return deg * Math.PI / 180;
		}

		function newAngle(d) {
			var ratio = scale(d);
			return config.minAngle + (ratio * range);
		}

		function configure(configuration) {
			var prop;
			for ( prop in configuration ) {
				config[prop] = configuration[prop];
			}

			range = config.maxAngle - config.minAngle;
			r = config.size / 2;
			pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

			// a linear scale that maps domain values to a percent from 0..1
			scale = d3.scale.linear()
				.range([0,1])
				.domain([config.minValue, config.maxValue]);

			ticks = scale.ticks(config.majorTicks);
			tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

			arc = d3.svg.arc()
				.innerRadius(r - config.ringWidth - config.ringInset)
				.outerRadius(r - config.ringInset)
				.startAngle(function(d, i) {
					var ratio = d * i;
					return deg2rad(config.minAngle + (ratio * range));
				})
				.endAngle(function(d, i) {
					var ratio = d * (i+1);
					return deg2rad(config.minAngle + (ratio * range));
				});
		}
		that.configure = configure;

		function centerTranslation() {
			return 'translate('+r +','+ r +')';
		}

		function isRendered() {
			return (svg !== undefined);
		}
		that.isRendered = isRendered;

		function render(newValue) {
			svg = d3.select(container)
				.append('svg:svg')
					.attr('class', 'gauge center-block')
					.attr('width', config.clipWidth)
					.attr('height', config.clipHeight);

			var centerTx = centerTranslation();

			var arcs = svg.append('g')
					.attr('class', 'arc')
					.attr('transform', centerTx);

			arcs.selectAll('path')
					.data(tickData)
				.enter().append('path')
					.attr('fill', function(d, i) {
						return config.arcColorFn(d * i);
					})
					.attr('d', arc);

			var lg = svg.append('g')
					.attr('class', 'label')
					.attr('transform', centerTx);
			lg.selectAll('text')
					.data(ticks)
				.enter().append('text')
					.attr('transform', function(d) {
						var ratio = scale(d);
						var newAngle = config.minAngle + (ratio * range);
						return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
					})
					.text(config.labelFormat);

			var lineData = [ [config.pointerWidth / 2, 0],
							[0, -pointerHeadLength],
							[-(config.pointerWidth / 2), 0],
							[0, config.pointerTailLength],
							[config.pointerWidth / 2, 0] ];
			var pointerLine = d3.svg.line().interpolate('monotone');
			var pg = svg.append('g').data([lineData])
					.attr('class', 'pointer')
					.attr('transform', centerTx);

			pointer = pg.append('path')
				.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
				.attr('transform', 'rotate(' +config.minAngle +')');

			update(newValue === undefined ? 0 : newValue);
		}
		that.render = render;

		function update(newValue, newConfiguration) {
			if ( newConfiguration  !== undefined) {
				configure(newConfiguration);
			}
			var ratio = scale(newValue);
			var newAngle = config.minAngle + (ratio * range);
			pointer.transition()
				.duration(config.transitionMs)
				.ease('elastic')
				.attr('transform', 'rotate(' +newAngle +')');
		}
		that.update = update;

		configure(configuration);

		return that;
	};
	return gauge;
}]);
