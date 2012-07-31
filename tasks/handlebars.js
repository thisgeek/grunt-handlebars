/*
 * 
 * Task: Handlebars
 * Description: Compile handlebars templates to JST files
 * Dependencies: handlebars
 * 
 */

module.exports = function(grunt) {

  var precomp = require('../lib/precompiler');

  grunt.registerMultiTask('handlebars', 'Precompile Handlebars template', function() {
    var self = this,
        templateDir = this.file.src,
        config = {
          "_": [
            templateDir
          ],
          min: true,
          output: this.file.dest
        };
    precomp(config);
  });
};
