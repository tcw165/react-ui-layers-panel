var fs = require('fs');
var path = require('path');
var watchify = require('watchify')
var browserify = require('browserify');
var reactify = require('reactify');
var reactTools = require('react-tools');

// Publish demo.
watchify(browserify({debug: true, cache: {}, packageCache: {}})
         .on('error', function(err) {
           throw new Error(err.message);
         })
         .require(path.join(__dirname, '/demo/index.js'), {entry: true})
         .transform(reactify)
         .bundle()
         .pipe(fs.createWriteStream(path.join(__dirname, '/demo/bundle.js'))))
  .bundle();

// JSX trasnpile.
for (var i = 2, j = process.argv.length; i < j; ++i) {
  var filePath = path.join(__dirname, process.argv[i]);
  var input = fs.readFileSync(filePath, {encoding: 'utf8'});
  var output = reactTools.transform(input);

  fs.writeFileSync(filePath, output, {encoding: 'utf8'});
  console.log('[jsx] %s', filePath);
}
