var path = require('path');

module.exports = {
  CLIENT_DIR: path.join(__dirname, '/src/client'),
  SERVER_DIR: path.join(__dirname, '/src/server'),
  SERVER_PUBLIC_DIR: path.join(__dirname, '/src/server/public'),
  BUILD_DIR: path.join(__dirname, '/build'),
  BUILD_PUBLIC_DIR: path.join(__dirname, '/build/public'),
  BUILD_BUNDLE_JS: path.join(__dirname, '/build/public/bundle.js')
};
