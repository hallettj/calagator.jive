/*globals namespace desc task */
/*jshint laxcomma:true */

var fs = require('fs');
var dust = require('dustjs-linkedin');

namespace('compile', function() {
    desc('Compile dust templates.');
    task('templates', [], function(params) {
        var output = __dirname +'/javascripts/compiled-templates.js'
          , templateDir = __dirname +'/templates'
          , dustPattern = /^([^.]+)(?:\..*)?\.dust$/;

        function compileTemplates(dir, prefix) {
            prefix = prefix || '';

            var listing = fs.readdirSync(dir);

            return listing.reduce(function(out, fileName) {
                var file = dir +'/'+ fileName
                  , stats = fs.lstatSync(file)
                  , matches = fileName.match(dustPattern)
                  , templateName = matches ? prefix + matches[1] : ''
                  , source;

                if (stats.isDirectory()) {
                    return out + compileTemplates(file, prefix + fileName + '/');

                } else if (matches) {
                    console.error('compiling: '+ file +' ('+ templateName +')');
                    source = fs.readFileSync(file, 'UTF-8');
                    return out + dust.compile(source, templateName) + "\n";

                } else {
                    return out;
                }
            }, '');
        }

        var compiled = compileTemplates(templateDir);

        fs.writeFileSync(output, compiled, 'UTF-8');
    });
});
