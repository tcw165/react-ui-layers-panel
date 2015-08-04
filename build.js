var fs = require('fs');
var path = require('path');
var fsExtra = require('fs-extra');
var browserify = require('browserify');
var babelify = require('babelify');
var reactify = require('reactify');

var global = require('./global');
var findEntryJS = require('./src/server/findEntryJS');

var entries = findEntryJS(path.join(__dirname, '/src/client/entries'));

fsExtra.removeSync(global.BUILD_DIR);
fsExtra.copySync(global.SERVER_PUBLIC_DIR, global.BUILD_DIR);
// fsExtra.copySync(global.CLIENT_DIR, global.BUILD_DIR);

// TODO: Find entry JS files and create bundles.
// Browserify node modules.
// console.log('===== Browserify Build =====');
entries.map(function(entry) {
  var entryName = path.basename(entry);
  var output = path.join(global.BUILD_DIR, '/' + entryName);

  console.log('[Build] %s', output);
  browserify({debug: true})
    // .on('file', function(file, id, parent) {
    //   console.log('[Build] %s', path.relative(__dirname, file));
    // })
    .on('error', function(err) {
      throw new Error('Browserify Error: ' + err.message);
    })
    .require(entry, { entry: true })
  // ES6 to ES5.
    .transform(babelify)
  // JSX to vanilla JS.
    .transform(reactify)
    .bundle()
    .pipe(fs.createWriteStream(output));
});
