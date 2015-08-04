var layerFactory = require('./dist/layerFactory');
var LayerContainer = require('./dist/views/LayerContainer');

'use strict';

module.exports = {
  createLayerStore: layerFactory,
  LayerPanel: LayerContainer
};
