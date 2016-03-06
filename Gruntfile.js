'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    crx: {
      extension: {
        "src": "app/**/*",
        "dest": "dist/builds", // This is required or it will error.
        "zipDest": "dist/builds",
        "options": {
          "privateKey": grunt.option("privateKey")
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-crx');

  grunt.registerTask('package', ['crx']);
};