"use strict";

module.exports = function(config){
	config.set({

		basePath : './public',

		files : [
			'bower_components/angular/angular.js',
			'bower_components/angular-route/angular-route.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'public/components/**/*.js',
			'public/views/**/*.js',
			'public/pages/**/*.js'
		],

		autoWatch : true,

		frameworks: ['jasmine'],

		browsers : ['Chrome'],

		plugins : [
		'karma-chrome-launcher',
		'karma-firefox-launcher',
		'karma-jasmine',
		'karma-junit-reporter'
		],

		junitReporter : {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};
