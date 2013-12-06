/**
 * @author Kyle Brown <blackbarn@gmail.com>
 * @since 10/23/13 3:09 PM
 */
module.exports = function (grunt) {
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
                    ' * @license MIT License, http://www.opensource.org/licenses/MIT\n*/\n'
            },
            dev: {
                options: {
                    beautify: true,
                    compress: false,
                    mangle: false,
                    preserve: 'all'
                },
                src: ['src/client/js/**/*.js'],
                dest: 'build/client/js/<%= pkg.name %>.js'
            },
            prod: {
                src: ['src/client/js/**/*.js'],
                dest: 'build/client/js/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            app: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['bin/*.js', 'src/**/*.js', '!src/client/**']
            },
            client: {
                options: {
                    jshintrc: 'src/client/.jshintrc'
                },
                src: ['src/client/js/**/*.js']
            },
            gruntfile: {
                src: 'Gruntfile.js'
            }
        },
        clean: {
            build: ['build/']
        },
        copy: {
            components: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/bootstrap/dist',
                        src: ['**'],
                        dest: 'build/client/components/bootstrap/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular',
                        src: ['*.js'],
                        dest: 'build/client/components/angular'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-bootstrap',
                        src: ['**', '!bower.json'],
                        dest: 'build/client/components/angular-bootstrap'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-bootstrap3',
                        src: ['**', '!bower.json'],
                        dest: 'build/client/components/angular-bootstrap3'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/moment',
                        src: ['*.js'],
                        dest: 'build/client/components/moment'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-ui-utils/modules',
                        src: ['**'],
                        dest: 'build/client/components/angular-ui-utils/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-ui-router/release',
                        src: ['*.js'],
                        dest: 'build/client/components/angular-ui-router/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-resource/',
                        src: ['*.js'],
                        dest: 'build/client/components/angular-resource/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-animate',
                        src: ['*.js'],
                        dest: 'build/client/components/angular-animate/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/AngularJS-Toaster',
                        src: ['*.{css,js}'],
                        dest: 'build/client/components/angular-toaster'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/ngstorage',
                        src: ['ngStorage.js'],
                        dest: 'build/client/components/angular-storage'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-moment',
                        src: ['angular-moment.js', 'angular-moment.min.js'],
                        dest: 'build/client/components/angular-moment'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/restangular/dist',
                        src: ['*.js'],
                        dest: 'build/client/components/restangular'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/lodash/dist',
                        src: ['*.js'],
                        dest: 'build/client/components/lodash'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/ngprogress-lite/',
                        src: ['*.{js,css}'],
                        dest: 'build/client/components/ngprogress-lite'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/jquery',
                        src: ['*.js'],
                        dest: 'build/client/components/jquery/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/socket.io-client/dist',
                        src: ['**'],
                        dest: 'build/client/components/socket.io-client/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-socket-io',
                        src: ['*.js'],
                        dest: 'build/client/components/angular-socket-io/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-truncate/dist',
                        src: ['*.js'],
                        dest: 'build/client/components/angular-truncate/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/animate.css',
                        src: ['*.css'],
                        dest: 'build/client/components/animate.css/'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/json-mask/build',
                        src: ['*.js'],
                        dest: 'build/client/components/json-mask/'
                    }
                ]
            },
            favicon: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/client/misc',
                        src: ['favicon.ico'],
                        dest: 'build/client/favicon.ico'
                    }
                ]
            },
            images: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/client/img',
                        src: ['**'],
                        dest: 'build/client/img/'
                    }
                ]
            }
        },
        watch: {
            gruntfile: {
                files: 'Gruntfile.js',
                tasks: ['jshint:gruntfile']
            },
            clientScript: {
                files: ['<%= jshint.client.src %>'],
                tasks: ['jshint:client', 'uglify:dev']
            },
            clientStyles: {
                files: ['src/client/css/*.styl'],
                tasks: ['stylus']
            },
            express: {
                files: ['<%=jshint.app.src%>'],
                tasks: ['jshint:app', 'express:dev'],
                options: {
                    nospawn: true
                }
            }
        },
        stylus: {
            compile: {
                files: {
                    'build/client/css/<%= pkg.name %>.css': 'src/client/css/*.styl'
                }

            }
        },
        express: {
            options: {
                port: process.env.PORT || 3000
            },
            dev: {
                options: {
                    script: 'bin/bookworm.js',
                    debug: true
                }
            },
            prod: {
                options: {
                    script: 'bin/bookworm.js',
                    node_env: 'production'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%=express.options.port%>'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provies the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "copy" task.
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Load the plugin that provides the "watch" task.
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Load the plugin that provides the "stylus" task.
    grunt.loadNpmTasks('grunt-contrib-stylus');

    // Load the plugin that provides the "express-server" task.
    grunt.loadNpmTasks('grunt-express-server');

    // Load the plugin that provides the "open" task.
    grunt.loadNpmTasks('grunt-open');

    grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
        this.async();
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'express:prod', 'open', 'express-keepalive']);
        }

        return grunt.task.run([
            'express:dev',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean',
        'uglify:dev',
        'stylus',
        'copy'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'build'
    ]);

};