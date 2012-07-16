var fs = require('fs'),
    handlebars = require('handlebars'),
    basename = require('path').basename,
    uglify = require('uglify-js');

module.exports = function (argv) {
  // Convert the known list into a hash
  var known = {};
  if (argv.known && !Array.isArray(argv.known)) {
    argv.known = [argv.known];
  }
  if (argv.known) {
    for (var i = 0, len = argv.known.length; i < len; i++) {
      known[argv.known[i]] = true;
    }
  }

  var output = [];
  if (!argv.simple) {
    output.push('(function() {\n  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};\n');
  }
  function processTemplate(template, root) {
    var path = template,
        stat = fs.statSync(path);
    if (stat.isDirectory()) {
      fs.readdirSync(template).map(function(file) {
        var path = template + '/' + file;

        if (/\.handlebars$|\.hbs$/.test(path) || fs.statSync(path).isDirectory()) {
          processTemplate(path, root || template);
        }
      });
    } else {
      var data = fs.readFileSync(path, 'utf8');

      var options = {
        knownHelpers: known,
        knownHelpersOnly: argv.o
      };

      // Clean the template name
      if (!root) {
        template = basename(template);
      } else if (template.indexOf(root) === 0) {
        template = template.substring(root.length+1);
      }
      template = template.replace(/\.handlebars$|\.hbs$/, '');

      if (argv.simple) {
        output.push(handlebars.precompile(data, options) + '\n');
      } else {
        output.push('templates[\'' + template + '\'] = template(' + handlebars.precompile(data, options) + ');\n');
      }
    }
  }

  argv._.forEach(function(template) {
    processTemplate(template, argv.root);
  });

  // Output the content
  if (!argv.simple) {
    output.push('})();');
  }
  output = output.join('');

  if (argv.min) {
    var ast = uglify.parser.parse(output);
    ast = uglify.uglify.ast_mangle(ast);
    ast = uglify.uglify.ast_squeeze(ast);
    output = uglify.uglify.gen_code(ast);
  }

  if (argv.output) {
    fs.writeFileSync(argv.output, output, 'utf8');
  }

};
