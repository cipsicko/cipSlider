module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    watch: {
      scripts: {
        files: ['index.html', 'res/css/source.less', 'res/css/_mixin.less', 'res/js/main.js'],
        tasks: ['less'],
        options : {
          livereload: true
        }
      },
    },

    less: {
      development: {
        options: {
          paths: ["res/css"]
        },
        files: {
          "res/css/style.css" : "res/css/source.less"
        }
      }
    },

    uglify: {
      options: {
        options: {
          mangle: false,
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
      },
      build: {
        src: 'res/css/style.css',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-devtools');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};