


$(document).ready(function() {
  var LayersPanel = require('../src/views/LayersPanel');
  var createLayerStore = require('../src/createLayerStore');

  // Initialize the store, action and dispatcher.
  var store = createLayerStore([{isVisible: true, isLocked: false, snapshot: 1111},
                                {isVisible: false, isLocked: true, snapshot: 2222},
                                {isVisible: false, isLocked: false, snapshot: 3333},
                                {isVisible: true, isLocked: false, snapshot: 4444},
                                {isVisible: false, isLocked: true, snapshot: 5555}]);

  // Debug.
  window.layerStore = store.store;
  window.layerAction = store.action;

  React.render(
    <LayersPanel store={store} />,
    document.getElementById('react-example')
  );
});
