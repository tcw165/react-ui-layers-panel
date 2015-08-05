var LayerStore = require('../stores/LayerStore');
var LayerAction = require('../actions/LayerAction');

var CSS = {

  VISIBLE: 'ui-visible',
  INVISIBLE: 'ui-invisible',

  LOCKED: 'ui-locked',
  UNLOCKED: 'ui-unlocked'

};

var LayerItem = React.createClass({

  propTypes: {
    token: React.PropTypes.number,
    store: LayerStore.verify,
    action: LayerAction.verify,
    isVisible: React.PropTypes.bool,
    isLocked: React.PropTypes.bool
  },

  render: function() {
    return (
      <li id={this.props.id}
          className='ui-layer'
          style={this.props.style}
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp} >
        <input
          type='checkbox'
          checked={this.props.isVisible}
          className={this._visibleCss()}
          onMouseOver={this.props.onMouseOver}
          onMouseOut={this.props.onMouseOut} />
        <input
          type='checkbox'
          checked={this.props.isLocked}
          className={this._lockedCss()}
          onMouseOver={this.props.onMouseOver}
          onMouseOut={this.props.onMouseOut} />
        <span>{' ' + this.props.id + ' '}</span>
        <button onClick={this._deleteLayer}>
          delete
        </button>
        <button onClick={this._duplicateLayer}>
          duplicate
        </button>
      </li>
    );
  },

  //////////////////////////////////////////////////////////////////////////////
  // Public Functions //////////////////////////////////////////////////////////



  //////////////////////////////////////////////////////////////////////////////
  // Private Functions /////////////////////////////////////////////////////////

  _visibleCss: function() {
    return this.props.isVisible ? CSS.VISIBLE : CSS.INVISIBLE;
  },

  _lockedCss: function() {
    return this.props.isLocked ? CSS.LOCKED : CSS.UNLOCKED;
  },

  _deleteLayer: function(e) {
    var action = this.props.action;

    action.deleteLayer(this.props.token);
  },

  _duplicateLayer: function(e) {
    var action = this.props.action;

    action.duplicateLayer(this.props.token);
  }

});

module.exports = LayerItem;
