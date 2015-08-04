var LayerStore = require('../stores/LayerStore');
var LayerAction = require('../actions/LayerAction');

var CSS = {

  visibleCheckbox: 'visible-checkbox',
  visibleChecked: 'visible-checked',

  lockedCheckbox: 'locked-checkbox',
  lockedChecked: 'locked-checked'

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
          className='ui-sortable'
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
        <input
          type='text'
          placeholder={this.props.store.getLayerState(this.props.token).id} />
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
    var css = CSS.visibleCheckbox;

    if (this.props.isVisible) {
      css += ' ' + CSS.visibleChecked;
    }

    return css;
  },

  _lockedCss: function() {
    var css = CSS.lockedCheckbox;

    if (this.props.isLocked) {
      css += ' ' + CSS.lockedChecked;
    }

    return css;
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
