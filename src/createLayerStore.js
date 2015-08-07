var Immutable = typeof window === 'object' ? window.Immutable : require('immutable');
var LayerStore = require('./stores/LayerStore');
var LayerAction = require('./actions/LayerAction');
var LayerDispatcher = require('flux').Dispatcher;

/**
 * Build the store, action and dispatcher.
 *
 *                                      .----------.
 *                         .------------|  action  | <--------.
 *                         |            '----------'          |
 *                         |                                  |
 *                         v                                  |
 * .----------.     .--------------.     .---------.     .---------.
 * |  action  | --> |  dispatcher  | --> |  store  | --> |  views  |
 * '----------'     '--------------'     '---------'     '---------'
 *
 * @return {Object} {id: {String}
 *                   store: {LayerStore},
 *                   action: {LayerAction}}
 */
module.exports = function(layers) {
  var dispatcher = new LayerDispatcher();
  var store = new LayerStore(layers);
  var action = new LayerAction(dispatcher);

  //////////////////////////////////////////////////////////////////////////////
  // Dispatcher Callback ///////////////////////////////////////////////////////

  var setLayerState = function(action) {
    if (action.type === LayerAction.SET_LAYER_STATE) {
      console.log(11111, action);
      var token = action.token;
      var isVisible = action.isVisible;
      var isLocked = action.isLocked;

      if (store.setLayerState(token, isVisible, isLocked, undefined)) {
        store.publish();
      }
    }
  };

  var setAllLayersState = function(action) {
    if (action.type === LayerAction.SET_ALL_LAYERS_STATE) {
      var isVisible = action.isVisible;
      var isLocked = action.isLocked;

      for (var i = 0, j = store.length(); i < j; ++i) {
        store.setLayerState(i, isVisible, isLocked, undefined);
      }
      store.publish();
    }
  };

  var insertLayer = function(action) {
    if (action.type === LayerAction.INSERT_LAYER) {
      var isChanged = false;
      var token = action.token;
      var layers = action.layers;

      if (layers instanceof Array) {
        isChanged = store.insertLayers(token, layers);
      } else {
        var layer = layers;
        isChanged = store.insertLayer(token, layer);
      }

      if (isChanged) store.publish();
    }
  };

  var deleteLayer = function(action) {
    if (action.type === LayerAction.DELETE_LAYER) {
      var token = action.token;

      if (store.removeLayer(token)) {
        store.publish();
      }
    }
  };

  var duplicateLayer = function(action) {
    if (action.type === LayerAction.DUPLICATE_LAYER) {
      var token = action.token;

      if (store.duplicateLayer(token)) {
        store.publish();
      }
    }
  };

  var startDragLayer = function(action) {
    if (action.type === LayerAction.START_DRAG_LAYER) {
      var draggedToken = action.token;

      store.setLayerState(draggedToken, undefined, undefined, true);
      store.insertPlaceholder(draggedToken + 1);
      store.publish();
    }
  };

  var stopDragLayer = function(action) {
    if (action.type === LayerAction.STOP_DRAG_LAYER) {
      var draggedToken = store.getDraggedLayerTokens()[0];
      var placeholderToken = store.getPlaceholderTokens()[0];

      store.setLayerState(draggedToken, undefined, undefined, false);
      store.exchangeLayers(draggedToken, placeholderToken);
      store.removePlaceholders();
      store.publish();
    }
  };

  var moveDraggedLayer = function(action) {
    if (action.type === LayerAction.MOVE_DRAGGED_LAYER) {
      var to = action.to;
      var isChanged = false;

      store.removePlaceholders();

      var draggedToken = store.getDraggedLayerTokens()[0];

      if (to !== draggedToken) {
        isChanged = store.exchangeLayers(draggedToken, to);
      }

      draggedToken = store.getDraggedLayerTokens()[0];
      store.insertPlaceholder(draggedToken + 1);

      if (isChanged) {
        store.publish();
      }
    }
  };

  // Register callback to handle all updates.
  dispatcher.register(setLayerState);
  dispatcher.register(setAllLayersState);
  dispatcher.register(insertLayer);
  dispatcher.register(deleteLayer);
  dispatcher.register(duplicateLayer);
  dispatcher.register(startDragLayer);
  dispatcher.register(stopDragLayer);
  dispatcher.register(moveDraggedLayer);

  // Return only store and action. Dispatcher is hidden for the outside world.
  return {
    id: (+Date.now() + Math.floor(0x100000000 * Math.random())).toString(36),
    store: store,
    action: action
  };
}
