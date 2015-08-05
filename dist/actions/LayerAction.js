var Dispatcher = require('flux').Dispatcher;

function idGen() {
  return (+Date.now() + Math.floor(0x100000000 * Math.random())).toString(36);
}

function LayerAction(dispatcher) {
  if (!(dispatcher instanceof Dispatcher)) {
    throw new TypeError('dispatcher undefined.')
  }

  this._dispatcher = dispatcher;
}

LayerAction.id = idGen();

LayerAction.verify = function(obj) {
  return obj.id === LayerAction.id;
}

LayerAction.SET_LAYER_STATE = 0;
LayerAction.SET_ALL_LAYERS_STATE = 1;
LayerAction.INSERT_LAYER = 2;
LayerAction.DELETE_LAYER = 3;
LayerAction.DUPLICATE_LAYER = 4;
LayerAction.START_DRAG_LAYER = 5;
LayerAction.STOP_DRAG_LAYER = 6;
LayerAction.MOVE_DRAGGED_LAYER = 7;

LayerAction.prototype.setLayerState = function(token, isVisible, isLocked) {
  this._dispatcher.dispatch({
    type: LayerAction.SET_LAYER_STATE,
    token: token,
    isVisible: isVisible,
    isLocked: isLocked
  });
};

LayerAction.prototype.setAllLayerState = function(isVisible, isLocked) {
  this._dispatcher.dispatch({
    type: LayerAction.SET_ALL_LAYERS_STATE,
    isVisible: isVisible,
    isLocked: isLocked
  });
};

LayerAction.prototype.insertLayer = function(token, layer) {
  this._dispatcher.dispatch({
    type: LayerAction.INSERT_LAYER,
    token: token,
    layers: layer
  });
}

LayerAction.prototype.insertLayers = function(token, layers) {
  this.insertLayer(token, layers);
}

LayerAction.prototype.deleteLayer = function(token) {
  this._dispatcher.dispatch({
    type: LayerAction.DELETE_LAYER,
    token: token
  });
};

LayerAction.prototype.duplicateLayer = function(token) {
  this._dispatcher.dispatch({
    type: LayerAction.DUPLICATE_LAYER,
    token: token
  });
};

LayerAction.prototype.startDragLayer = function(token) {
  this._dispatcher.dispatch({
    type: LayerAction.START_DRAG_LAYER,
    token: token
  });
};

LayerAction.prototype.stopDragLayer = function() {
  this._dispatcher.dispatch({
    type: LayerAction.STOP_DRAG_LAYER
  });
};

LayerAction.prototype.moveDraggedLayer = function(to) {
  this._dispatcher.dispatch({
    type: LayerAction.MOVE_DRAGGED_LAYER,
    to: to
  });
};

module.exports = LayerAction;
