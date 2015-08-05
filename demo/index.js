// Main entry.
$(document).ready(function() {
  var SomeLayersCanvas = React.createClass({

    getInitialState: function() {
      return {
        store: this.props.store.store,
        layers: this.props.store.store.getAll()
      };
    },

    componentDidMount: function() {
      this.state.store.listen(this._onStoreChange);
    },

    componentWillUnmount: function() {
      this.state.store.unlisten(this._onStoreChange);
    },

    render: function() {
      var self = this;
      var layers = this.state.layers.map(function(layer, i) {
        if (layer.data) {
          var tagName = layer.data.tagName;
          var attr = layer.data.attributes;

          if (layer.isVisible) {
            if (attr.style)
              attr.style.opacity = 100;
            else {
              attr.style = {
                opacity: 100
              }
            }
          } else {
            if (attr.style)
              attr.style.opacity = 0;
            else {
              attr.style = {
                opacity: 0
              }
            }
          }

          return React.createElement(tagName, attr, layer.data.id);
        } else {
          return null;
        }
      });

      return (
        <div className='chart'>
          <h1>DIV Layers</h1>
          {layers}
        </div>
      );
    },

    _onStoreChange: function() {
      this.setState({
        layers: this.state.store.getAll()
      });
    }
  });

  var LayersPanel = require('../src/views/LayersPanel');
  var createLayerStore = require('../src/createLayerStore');

  // Initialize the store.
  var store = createLayerStore();
  var storeAction = store.action;

  // Debug, you could enter "layerStore.getAll()" to see layers.
  window.layerStore = store.store;
  window.layerAction = store.action;

  React.render(
    <SomeLayersCanvas store={store}/>,
    document.getElementById('chart-example')
  );

  React.render(
    <LayersPanel store={store}/>,
    document.getElementById('layers-panel-example')
  );

  // Add something into the store.
  var layers = [];
  for (var i = 0; i < 10; ++i) {
    var n = Math.floor(50 + 399 * Math.random());

    layers.push({
      isVisible: true,
      isLocked: false,
      data: {
        id: 'object ' + i,
        tagName: 'div',
        attributes: {
          style: {
            width: n + 'px'
          },
        }
      }
    });
  }
  layerAction.insertLayers(undefined, layers);
});
