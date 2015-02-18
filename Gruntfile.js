"use strict";

var path = require('path');

module.exports = function(grunt) {


	var targetDir = "./public",
		sourceDir = "./public_src";

	grunt.initConfig({
		jshint: {
			all: [ 'Gruntfile.js', path.join(sourceDir, '**/*.js') ],
			options: {
				jshintrc: true
			}
		},
		bower: {
			install: {
				options: {
					install: true,
					copy: false
				}
			}
		},
		html2js: {
			dev: {
				src: [ path.join(sourceDir,'**/*.html') ],
				dest: path.join(targetDir, 'app.js')
			},
			options: {
				base: sourceDir,
				module: 'templates'
			}
		},
		concat: {
			dev: {
				src: [ path.join(sourceDir,'**/*.js'), path.join(targetDir, 'app.js') ],
				dest: path.join(targetDir, 'app.js')
			},
			options: {
				separator: ';'
			}
		},
		uglify: {
			prod: {
				src: path.join(targetDir, 'app.js'),
				dest: path.join(targetDir, 'app.js')
			}
		},

		less: {
			dev: {
				src: path.join(sourceDir, 'app.less'),
				dest: path.join(targetDir, 'app.css')
			}
		},

		cssmin: {
			prod: {
				src: path.join(targetDir, 'app.css'),
				dest: path.join(targetDir, 'app.css')
			}
		},
		nodemon: {
			dev: {
				script: 'bin/www'
			},
			options: {
				ignore: [path.join(sourceDir, '**'), path.join(targetDir, "**"), "Gruntfile.js", "karma.conf.js"]
			}
		},
		watch: {
			css: {
				files: [path.join(sourceDir, '**/*.css'), path.join(sourceDir, '**/*.less')],
				tasks: ['less', 'cssmin']
			},
			js: {
				files: [path.join(sourceDir, '**/*.js'), path.join(sourceDir, '**/*.html')],
				tasks: ['jshint', 'html2js', 'concat', 'uglify']
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			tasks: ['nodemon', 'watch']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', [ 'bower', 'jshint', 'html2js', 'concat', 'uglify', 'less', 'cssmin', 'concurrent' ]);
};
