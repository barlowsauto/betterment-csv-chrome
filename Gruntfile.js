'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist/app/'],
    concat: {
      options: {
        separator: ';',
      },
      loadpdf: {
        src: ['app/src/load-pdf.js'],
        dest: 'dist/app/load-pdf.js'
      },
      pdf: {
        src: ['app/libs/pdf.worker.js'],
        dest: 'dist/app/pdf.worker.js'
      },
      icon: {
        src: ['app/src/show-page-icon.js'],
        dest: 'dist/app/icon.js'
      },
      libs: {
        src: [
          'app/libs/mutation-summary.js',
          'app/libs/patch-worker.js',
        ],
        dest: 'dist/app/libs.js'
      },
      manifest: {
        src: ['app/manifest.json'],
        dest: 'dist/app/manifest.json'
      },
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['app/images/*', 'app/manifest.json'],
            dest: 'dist/app/'
          },
        ],
      },
    },
    browserify: {
      main: {
        src: 'app/src/pdf-to-csv.js',
        dest: 'dist/app/main.js'
      },
      options: {
        ignore: [
          'entry?name=[hash]-worker.js!./pdf.worker.js',
          'node-ensure',
        ],
      },
    },
    uglify: {
      dist: {
        files: {
          'dist/app/libs.js': ['dist/app/libs.js'],
          'dist/app/pdf.worker.js': ['dist/app/pdf.worker.js'],
          'dist/app/main.js': ['dist/app/main.js'],
          'dist/app/icon.js': ['dist/app/icon.js'],
        }
      }
    },
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3,
        },
        files: {
          'dist/app/icon38.png': 'app/images/icon38.png',
          'dist/app/icon128.png': 'app/images/icon128.png',
        }
      }
    },
    crx: {
      extension: {
        'src': [
          'dist/app/*',
        ],
        'dest': 'dist/builds', // This is required or it will error.
        'zipDest': 'dist/builds',
        'options': {
          'privateKey': grunt.option('privateKey'),
        },
      }
    },
    dalek: {
      options: {
        browser: ['chrome'],
        // generate an html & an jUnit report
        reporter: ['html', 'junit'],
        // don't load config from an Dalekfile
        dalekfile: false,
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-crx');
  grunt.loadNpmTasks('grunt-dalek');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask(
    'build',
    ['clean', 'concat', 'browserify', 'uglify', 'imagemin']);
  grunt.registerTask(
    'builddev',
    ['clean', 'concat', 'browserify', 'copy']);
  grunt.registerTask(
    'package',
    ['clean', 'concat', 'browserify', 'uglify', 'imagemin', 'crx']);
};
