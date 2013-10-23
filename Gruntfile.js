/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/23/13 3:09 PM
 */
module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/**\n * <%= pkg.name %> - <%= pkg.description %>\n' +
                    ' * @version v<%= pkg.version %>\n' +
                    ' * @since <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    ' * @link <%= pkg.homepage %>\n' +
                    ' * @license MIT License, http://www.opensource.org/licenses/MIT\n*/'
            },
            build: {
                src: 'src/client/js/<%= pkg.name %>.js',
                dest: 'build/client/js/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            app: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['bin/*.js', 'Gruntfile.js', 'src/**/*.js', '!src/client/**']
            }
        },
        clean: {
            build: ['build/']
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provies the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'clean', 'uglify']);

};