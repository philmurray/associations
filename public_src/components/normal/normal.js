"use strict";

angular.module('associations.components.normal', [
	'associations.components.windowResize'
])
.constant('NORMAL_RANGE_CLASS', ['icon-nf_5','icon-nf_4','icon-nf_3','icon-nf_2','icon-nf_1','icon-nf_0'])
.constant('NORMAL_RANGE_CHAR', ['\uf10c', '\uf10b', '\uf10a', '\uf109', '\uf108', '\uf107'])
.constant('NORMAL_RANGE_TEXT', [
	'You are super normal',
	'You are normal',
	'You have some quirks',
	'You have some really weird traits',
	'You exist on the fringe of society',
	'You are probably not human'
])
.constant('NORMAL_DOMAIN', [0,0.25])
.factory('NormalConverter', ["NORMAL_RANGE_CHAR", "NORMAL_RANGE_CLASS", "NORMAL_DOMAIN", "NORMAL_RANGE_TEXT", function(NORMAL_RANGE_CHAR, NORMAL_RANGE_CLASS,NORMAL_DOMAIN,NORMAL_RANGE_TEXT){
	var scale = d3.scale.linear().domain(NORMAL_DOMAIN).rangeRound([0,NORMAL_RANGE_CHAR.length-1]).clamp(true);
	return {
		toChar: function(n){
			return NORMAL_RANGE_CHAR[scale(n)];
		},
		toClass: function(n){
			return NORMAL_RANGE_CLASS[scale(n)];
		},
		toText: function(n){
			return NORMAL_RANGE_TEXT[scale(n)];
		},
	};
}])
.directive('normal', ["windowResize", "Gauge", "NormalConverter", "NORMAL_RANGE_CHAR", "NORMAL_DOMAIN", function(windowResize, Gauge, NormalConverter, NORMAL_RANGE_CHAR, NORMAL_DOMAIN) {
	return {
		restrict: 'EA',
		scope: {
			value: "=normalValue",
			color: "=normalColor"
		},
		link: function($scope, $element, attrs) {

			var element = $element[0],
				g,
				config = {
					minValue: NORMAL_DOMAIN[1],
					maxValue: 0,
					arcColorFn: d3.interpolateHsl(d3.rgb($scope.color).darker(1), d3.rgb($scope.color).darker(7)),
					majorTicks: NORMAL_RANGE_CHAR.length-1,
					labelFormat: NormalConverter.toChar
				};

			$scope.render = function(){
				var size = Math.min(element.offsetWidth,300)-10;
				config.size = size;
				config.clipWidth = size;
				config.clipHeight = size/2+10;
				config.transitionMs = 0;

				g = new Gauge(element, config);
				g.render($scope.value);
			};

			$scope.$watch("value", function(){
				if (!g){
					$scope.render();
				} else {
					config.transitionMs = 1500;
					g.update($scope.value,config);
				}
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
			ringInset					: 55,
			ringWidth					: 10,

			pointerWidth				: 10,
			pointerTailLength			: 5,
			pointerHeadLengthPercent	: 0.65,

			minValue					: 0,
			maxValue					: 10,

			minAngle					: -90,
			maxAngle					: 90,

			transitionMs				: 750,

			majorTicks					: 5,
			labelFormat					: d3.format(',g'),
			labelInset					: 28
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
				.domain([config.minValue, config.maxValue])
				.clamp(true);

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
			d3.select(container).select('svg').remove();

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
					.attr('class', 'gauge-label')
					.attr('transform', centerTx);
			lg.selectAll('text')
					.data(ticks)
				.enter().append('text')
					.attr('transform', function(d) {
						var ratio = scale(d);
						var newAngle = config.minAngle + (ratio * range);
						var reverseAngle = -newAngle;
						return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +') rotate(' + reverseAngle +')';
					})
					.attr('font-family', 'fontcustom')
					.attr('text-anchor', 'middle')
					.attr('font-size', '37px')
					.attr('fill', '#bbb')
					.text(config.labelFormat);


			var lineData = [ [config.pointerWidth / 2, 0],
							[0, -pointerHeadLength],
							[-(config.pointerWidth / 2), 0],
							[0, config.pointerTailLength],
							[config.pointerWidth / 2, 0] ];
			var pointerLine = d3.svg.line().interpolate('monotone');
			var pg = svg.append('g').data([lineData])
					.attr('fill', '#bbb')
					.attr('stroke', '#999')
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
				.ease('cubic-in-out')
				.attr('transform', 'rotate(' +newAngle +')');
		}
		that.update = update;

		configure(configuration);

		return that;
	};
	return gauge;
}]);
