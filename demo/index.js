// Main entry.
$(document).ready(function() {
  var React = typeof window === 'object' ? window.React : require('react');

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

  // Tutorial.
  if (document.cookie !== 'demo=false') {
    setTimeout(function() {
      var trip = new Trip([{
        sel: $('#chart-example'),
        content: 'Assume this is the selection of your graphics.',
        expose: true,
        position: 'e',
        delay: 3000
      }, {
        sel: $('#layers-panel-example'),
        content: 'And this is the Photoshop-liked layers panel.',
        expose: true,
        position: 'w',
        delay: 3000
      }, {
        sel: $('.ui-layer')[0],
        content: 'Drag the layer to alter the order.',
        expose: true,
        position: 'w',
        delay: 3000
      }, {
        sel: $('.ui-layer-visible')[1],
        content: 'Click to check/uncheck the visibility.',
        expose: true,
        position: 'w',
        delay: 3000
      }, {
        sel: $('.ui-layer-visible')[1],
        content: 'Or scroll the mouse to check/uncheck others visiblity.',
        expose: true,
        position: 'w',
        delay: 3000
      }], {
        enableAnimation: false
      });

      trip.start();
    }, 500);

    var date = new Date();

    date.setTime(date.getTime() + (30 * 60 * 1000));
    document.cookie = 'demo=false' + ';expires=' + date.toGMTString() + ';path=/';
  }
});
