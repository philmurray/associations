"use strict";

angular.module('associations.components.graph.defaults', [])
.constant("GraphDefaults",{
	edges: {
		style: 'arrow',
		widthMax: 8,
		arrowScaleFactor: 0.75,
		color: 'white',
		fontFill: 'rgba(0, 0, 0, 0.75)',
		fontSize: 18,
		widthSelectionMultiplier: 1,
	},
	nodes: {
		shape: 'box',
		borderWidth: 2,
		color: {
			border: 'white',
			background: 'black'
		},
		fontColor: 'white',
		fontSize: 18,
		scaleFontWithValue: true
	}
});
