(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Main entry.
$(document).ready(function() {
  var React = typeof window === 'object' ? window.React : require('react');

  var SomeLayersCanvas = React.createClass({displayName: "SomeLayersCanvas",

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
        React.createElement("div", {className: "chart"}, 
          React.createElement("h1", null, "DIV Layers"), 
          layers
        )
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
    React.createElement(SomeLayersCanvas, {store: store}),
    document.getElementById('chart-example')
  );

  React.render(
    React.createElement(LayersPanel, {store: store}),
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

},{"../src/createLayerStore":11,"../src/views/LayersPanel":14,"react":"react"}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":5,"_process":4,"inherits":3}],7:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')

},{"./lib/Dispatcher":8}],8:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":9}],9:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],10:[function(require,module,exports){
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

},{"flux":7}],11:[function(require,module,exports){
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

},{"./actions/LayerAction":10,"./stores/LayerStore":12,"flux":7,"immutable":"immutable"}],12:[function(require,module,exports){
var Immutable = typeof window === 'object' ? window.Immutable : require('immutable');
var events = require('events');
var util = require('util');

var LAYER_PROTO = {
  id: '$placeholder',
  isVisible: true,
  isLocked: false,
  isDragged: false,
  data: undefined
};

function idGen() {
  return (Date.now() + Math.floor(0x10000000000 * Math.random())).toString(36);
}

function copy(obj) {
  var ret = {};

  for (var k in obj) {
    if (obj.hasOwnProperty(k))
      ret[k] = obj[k];
  }

  return ret;
}

/**
 * LayerStore is the data module.
 */
function LayerStore(layers) {
  /**
   * Array of layers object. Format of single layer is like...
   * {
   *   id: {String},
   *   isVisible: {Bool},
   *   isLocked: {Bool},
   *   data: {<svg>|<img>|String|id}
   * }
   */
  this._layers = layers instanceof Array ?
    layers.map(function(layer, i) {
      var ret = copy(LAYER_PROTO);

      ret.id = idGen();
      ret.isVisible = layer.isVisible || true;
      ret.isLocked = layer.isLocked || false;

      return ret;;
    }) : [];
}

util.inherits(LayerStore, events.EventEmitter);

LayerStore.id = (+Date.now() + Math.floor(0x100000000 * Math.random())).toString(36);

LayerStore.verify = function(obj) {
  return obj.id === LayerStore.id;
}

LayerStore.prototype.length = function() {
  return this._layers.length;
}

LayerStore.prototype.getAll = function() {
  return this._layers.slice(0);
};

LayerStore.prototype.listen = function(callback) {
  this.addListener('change', callback);
};

LayerStore.prototype.unlisten = function(callback) {
  this.removeListener('change', callback);
};

LayerStore.prototype.publish = function() {
  this.emit('change');
};

LayerStore.prototype.isPlaceholder = function(token) {
  return this._layers[token].id === LAYER_PROTO.id;
};

LayerStore.prototype.duplicateLayer = function(token) {
  if (token >= 0 && token < this._layers.length) {
    var dup = copy(this._layers[token]);

    dup.id = idGen();
    dup.isDragged = false;
    this._layers.splice(token + 1, 0, dup);

    return true;
  }

  return false;
};

LayerStore.prototype.exchangeLayers = function(from, to) {
  if (from >= 0 && from < this._layers.length &&
      to >= 0 && to < this._layers.length) {

    this._layers.splice(to, 0, this._layers.splice(from, 1)[0]);

    return true;
  }

  return false;
}

LayerStore.prototype.insertLayer = function(token, layer) {
  var newLayer = copy(LAYER_PROTO);

  newLayer.id = idGen();
  newLayer.isVisible = layer.isVisible || true;
  newLayer.isLocked = layer.isLocked || false;
  newLayer.data = layer.data;

  if (token >= 0 && token < this._layers.length) {
    this._layers.splice(token + 1, 0, newLayer);
  } else {
    this._layers.push(newLayer);
  }

  return true;
};

LayerStore.prototype.insertLayers = function(token, layers) {
  if (!(layers instanceof Array)) return false;

  for (var i = 0, j = layers.length; i < j; ++i) {
    this.insertLayer(token + i, layers[i]);
  }

  return true;
};

LayerStore.prototype.insertPlaceholder = function(token) {
  this._layers.splice(token, 0, LAYER_PROTO);

  return true;
};

LayerStore.prototype.removeLayer = function(token) {
  if (token >= 0 && token < this._layers.length) {
    this._layers.splice(token, 1);

    return true;
  }

  return false;
};

LayerStore.prototype.removePlaceholders = function() {
  this._layers = this._layers.filter(function(layer) {
    return layer.id !== LAYER_PROTO.id;
  });
  return true;
};

LayerStore.prototype.getDraggedLayerTokens = function() {
  var ret = [];

  this._layers.forEach(function(layer, i) {
    if (layer.isDragged) ret.push(i);
  });

  return ret.length ? ret : false;
}

LayerStore.prototype.getPlaceholderTokens = function() {
  var ret = [];

  this._layers.forEach(function(layer, i) {
    if (layer.id === LAYER_PROTO.id) ret.push(i);
  });

  return ret.length ? ret : false;
}

LayerStore.prototype.getLayerState = function(token) {
  if (token >= 0 && token < this._layers.length) {
    return copy(this._layers[token]);
  }

  return false;
};

LayerStore.prototype.setLayerState = function(token, isVisible, isLocked, isDragged) {
  var isChanged = false;

  if (token >= 0 && token < this._layers.length) {
    var layer = this._layers[token];

    if (isVisible === true || isVisible === false) {
      layer.isVisible = isVisible;
    }
    if (isLocked === true || isLocked === false) {
      layer.isLocked = isLocked;
    }
    if (isDragged === true || isDragged === false) {
      layer.isDragged = isDragged;
    }

    isChanged = true;
  }

  return isChanged;
};

LayerStore.prototype.print = function() {
  var str = '';

  this._layers.forEach(function(layer) {
    str += layer.id + ' -> ';
  });

  console.log(str);
}

module.exports = LayerStore;

},{"events":2,"immutable":"immutable","util":6}],13:[function(require,module,exports){
'use strict';

var React = typeof window === 'object' ? window.React : require('react');
var LayerStore = require('../stores/LayerStore');
var LayerAction = require('../actions/LayerAction');

var CSS = {

  VISIBLE: 'ui-layer-visible',
  INVISIBLE: 'ui-layer-invisible',

  LOCKED: 'ui-layer-locked',
  UNLOCKED: 'ui-layer-unlocked'

};

var LayerItem = React.createClass({displayName: "LayerItem",

  propTypes: {
    token: React.PropTypes.number,
    store: LayerStore.verify,
    action: LayerAction.verify,
    isVisible: React.PropTypes.bool,
    isLocked: React.PropTypes.bool
  },

  render: function() {
    return (
      React.createElement("li", {id: this.props.id, 
          className: "ui-layer", 
          style: this.props.style, 
          onMouseDown: this.props.onMouseDown, 
          onMouseUp: this.props.onMouseUp}, 
        React.createElement("input", {
          type: "checkbox", 
          checked: this.props.isVisible, 
          className: this._visibleCss(), 
          onMouseOver: this.props.onMouseOver, 
          onMouseOut: this.props.onMouseOut}), 
        React.createElement("input", {
          type: "checkbox", 
          checked: this.props.isLocked, 
          className: this._lockedCss(), 
          onMouseOver: this.props.onMouseOver, 
          onMouseOut: this.props.onMouseOut}), 
        React.createElement("span", null, 'Layer: ' + this.props.id), 
        React.createElement("button", {onClick: this._deleteLayer}, 
          "delete"
        ), 
        React.createElement("button", {onClick: this._duplicateLayer}, 
          "duplicate"
        )
      )
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

},{"../actions/LayerAction":10,"../stores/LayerStore":12,"react":"react"}],14:[function(require,module,exports){
'use strict';

var React = typeof window === 'object' ? window.React : require('react');
var LayerStore = require('../stores/LayerStore');
var LayerAction = require('../actions/LayerAction');
var LayerItem = require('./LayerItem');

var LayersPanel = React.createClass({displayName: "LayersPanel",

  propTypes: {
    store: LayerStore.verify,
    action: LayerAction.verify,
    layers: React.PropTypes.array
  },

  getInitialState: function() {
    var self = this;

    return {
      /**
       * @return {LayerStore} instance of ../stores/LayerStore.js, shouldn't
       *                      modify it after initialization.
       */
      store: this.props.store.store,

      /**
       * @return {LayerAction} instance of ../actions/LayerAction.js, shouldn't
       *                       modify it after initialization.
       */
      action: this.props.store.action,

      /**
       * @return {Array} Layers copy got from store (mutable).
       */
      layers: this.props.store.store.getAll(),

      /**
       * @return {Object} Arbritrary type. It is used to force component to render.
       */
      forcedUpdate: false
    };
  },

  componentDidMount: function() {
    var store = this.state.store;

    store.listen(this._onStoreChange);
  },

  componentWillUnmount: function() {
    var store = this.state.store;

    store.unlisten(this._onStoreChange);
  },

  render: function() {
    var self = this;
    var layers = this.state.layers.map(function(layer, i) {
      var store = self.state.store;

      return (React.createElement(LayerItem, {
                  id: layer.id, 
                  token: i, 
                  isVisible: layer.isVisible, 
                  isLocked: layer.isLocked, 
                  style: self._layerInlineStyle(i), 
                  store: self.state.store, 
                  action: self.state.action, 
                  onMouseOver: self._onLayerMouseOverOut.bind(self, i), 
                  onMouseOut: self._onLayerMouseOverOut.bind(self, i), 
                  onMouseDown: self._onLayerMouseDown.bind(self, i), 
                  onMouseUp: self._onLayerMouseUp.bind(self, i)}));
    });

    return (
      React.createElement("div", {className: "ui-layer-panel ui-noselect", 
           onMouseUp: this._onContainerMouseUp, 
           onMouseLeave: this._onContainerMouseUp, 
           onMouseMove: this._onContainerMouseMove}, 
        React.createElement("div", {className: "ui-layer-header"}, 
          React.createElement("input", {
            type: "checkbox", 
            checked: this._isAllVisible(), 
            onChange: this._toggleAllVisible}, 
            "Toggle Visible"
          ), 
          React.createElement("input", {
            type: "checkbox", 
            checked: this._isAllLocked(), 
            onChange: this._toggleAllLocked}, 
            "Toggle Locked"
          )
        ), 
        React.createElement("ul", {className: "ui-layer-container", style: {position: 'relative'}}, 
          layers
        )
      )
    );
    // <ul style={{position: 'relative'}}>
  },

  //////////////////////////////////////////////////////////////////////////////
  // Public Functions //////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  // Private Functions /////////////////////////////////////////////////////////

  _offset: false,

  _position: false,

  _dragged: false,

  _draggedParent: false,

  _toggled: false,

  _layerShouldVisible: undefined,

  _layerShouldLocked: undefined,

  _layerInlineStyle: function(token) {
    var store = this.state.store;
    var style = null;

    if (store.isPlaceholder(token)) {
      style = {
        opacity: '0'
      };
    } else if (store.getLayerState(token).isDragged && this._position) {
      style = {
        position: 'absolute',
        zIndex: '100',
        left: this._position.left + 'px',
        top: this._position.top + 'px'
      };
    }

    return style;
  },

  _onLayerMouseDown: function(layerToken, e) {
    var el = e.target;
    var elTagName = el.tagName.toLowerCase();
    var elParent = el.parentNode;

    if (elTagName === 'input') {
      var stateToken = Array.prototype.indexOf.call(elParent.childNodes, el);
      var state = this.state.store.getLayerState(layerToken);

      this._toggled = el;
      this._layerShouldVisible = undefined;
      this._layerShouldLocked = undefined;

      if (stateToken === 0) {
        this._layerShouldVisible = !state.isVisible;
      } else if (stateToken === 1) {
        this._layerShouldLocked = !state.isLocked;
      }
    } else if (elTagName === 'li') {
      var action = this.state.action;
      var elBound = el.getBoundingClientRect();

      this._dragged = el.id;
      this._draggedParent = el.parentElement;
      this._offset = {
        x: e.clientX - elBound.left,
        y: e.clientY - elBound.top
      };
      this._updatePosition(e);

      action.startDragLayer(layerToken);
    }
  },

  _onLayerMouseUp: function(layerToken, e) {
    var action = this.state.action;
    var el = e.target;
    var elTagName = el.tagName.toLowerCase();
    var elParent = el.parentNode;

    if (elTagName === 'input') {
      if (el === this._toggled && document.activeElement === this._toggled) {
        var stateToken = Array.prototype.indexOf.call(elParent.childNodes, el);
        var state = this.state.store.getLayerState(layerToken);

        if (stateToken === 0) {
          action.setLayerState(layerToken, !state.isVisible, undefined);
        } else if (stateToken === 1) {
          action.setLayerState(layerToken, undefined, !state.isLocked);
        }
      }
    }
  },

  _onLayerMouseOverOut: function(layerToken, e) {
    if (this._toggled) {
      var action = this.state.action;

      this._toggled.blur();

      action.setLayerState(layerToken, this._layerShouldVisible, this._layerShouldLocked);
    }
  },

  _onContainerMouseUp: function(e) {
    var action = this.state.action;

    if (this._dragged) {
      action.stopDragLayer();
    }

    this._position = false;
    this._offset = false;
    this._dragged = false;
    this._draggedParent = false;
    this._toggled = false;
  },

  _onContainerMouseMove: function(e) {
    if (!this._dragged) return;

    var self = this;
    var action = this.state.action;
    var store = this.state.store;
    var layers = Array.prototype.filter.call(this._draggedParent.children, function(node) {
      return node.id !== '$placeholder';
    });

    layers.forEach(function(node, i) {
      if (node.id !== self._dragged) {
        var siblingBound = node.getBoundingClientRect();

        if (e.clientY > siblingBound.top &&
            e.clientY < siblingBound.bottom) {

          action.moveDraggedLayer(i);

          return false;
        }
      }

      return true;
    });

    this._updatePosition(e);
  },

  _updatePosition: function(e) {
    var pBound = this._draggedParent.getBoundingClientRect();

    this._position = {
      // left: e.clientX - pBound.left - this._offset.x,
      left: 5,
      top: e.clientY - pBound.top - this._offset.y
    };

    this.setState({
      forcedUpdate: Date.now()
    });
  },

  _isAllVisible: function() {
    return this.state.layers.every(function(layer) {
      return layer.id === '$placeholder' || layer.isVisible === true;
    });
  },

  _isAllLocked: function() {
    return this.state.layers.every(function(layer) {
      return layer.id === '$placeholder' || layer.isLocked === true;
    });
  },

  _toggleAllVisible: function(e) {
    var action = this.state.action;

    action.setAllLayerState(!this._isAllVisible(), undefined);
  },

  _toggleAllLocked: function(e) {
    var action = this.state.action;

    action.setAllLayerState(undefined, !this._isAllLocked());
  },

  _onStoreChange: function() {
    this.setState({
      layers: this.state.store.getAll(),
    });
  }

});

module.exports = LayersPanel;

},{"../actions/LayerAction":10,"../stores/LayerStore":12,"./LayerItem":13,"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL2RlbW8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvbGliL0Rpc3BhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvZmx1eC9saWIvaW52YXJpYW50LmpzIiwiL1VzZXJzL2JveXcxNjUvX0NPREUvbGFiLWpzL3JlYWN0LXVpLWxheWVycy1wYW5lbC9zcmMvYWN0aW9ucy9MYXllckFjdGlvbi5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL2NyZWF0ZUxheWVyU3RvcmUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL3NyYy9zdG9yZXMvTGF5ZXJTdG9yZS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVySXRlbS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVyc1BhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsY0FBYztBQUNkLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVztBQUM3QixFQUFFLElBQUksS0FBSyxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFM0UsRUFBRSxJQUFJLHNDQUFzQyxnQ0FBQTs7SUFFeEMsZUFBZSxFQUFFLFdBQVc7TUFDMUIsT0FBTztRQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLO1FBQzdCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO09BQ3hDLENBQUM7QUFDUixLQUFLOztJQUVELGlCQUFpQixFQUFFLFdBQVc7TUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNuRCxLQUFLOztJQUVELG9CQUFvQixFQUFFLFdBQVc7TUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyRCxLQUFLOztJQUVELE1BQU0sRUFBRSxXQUFXO01BQ2pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztNQUNoQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLEVBQUUsQ0FBQyxFQUFFO1FBQ3BELElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtVQUNkLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzNDLFVBQVUsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUM7O0FBRTVDLFNBQVMsS0FBSyxHQUFHO0VBQ2YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5RSxDQUFDOztBQUVELFNBQVMsV0FBVyxDQUFDLFVBQVUsRUFBRTtFQUMvQixJQUFJLEVBQUUsVUFBVSxZ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QUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtBQUM3QyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFOztBQUUzQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRTVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLEdBQUc7O0VBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDOztBQUVELFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUMxRCxFQUFFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7RUFFakMsUUFBUSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQztFQUN0QixRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO0VBQzdDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUM7QUFDOUMsRUFBRSxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7O0VBRTNCLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7SUFDN0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLEdBQUc7O0VBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDLENBQUM7O0FBRUYs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UUFBUSxLQUFLLElBQUksQ0FBQztLQUMvRCxDQUFDLENBQUM7QUFDUCxHQUFHOztFQUVELGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxFQUFFO0FBQ2pDLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0lBRS9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM5RCxHQUFHOztFQUVELGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxFQUFFO0FBQ2hDLElBQUksSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0lBRS9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUM3RCxHQUFHOztFQUVELGNBQWMsRUFBRSxXQUFXO0lBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUM7TUFDWixNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0tBQ2xDLENBQUMsQ0FBQztBQUNQLEdBQUc7O0FBRUgsQ0FBQyxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gTWFpbiBlbnRyeS5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUmVhY3QgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdy5SZWFjdCA6IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbiAgdmFyIFNvbWVMYXllcnNDYW52YXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RvcmU6IHRoaXMucHJvcHMuc3RvcmUuc3RvcmUsXG4gICAgICAgIGxheWVyczogdGhpcy5wcm9wcy5zdG9yZS5zdG9yZS5nZXRBbGwoKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdGF0ZS5zdG9yZS5saXN0ZW4odGhpcy5fb25TdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RhdGUuc3RvcmUudW5saXN0ZW4odGhpcy5fb25TdG9yZUNoYW5nZSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgbGF5ZXJzID0gdGhpcy5zdGF0ZS5sYXllcnMubWFwKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgICAgIGlmIChsYXllci5kYXRhKSB7XG4gICAgICAgICAgdmFyIHRhZ05hbWUgPSBsYXllci5kYXRhLnRhZ05hbWU7XG4gICAgICAgICAgdmFyIGF0dHIgPSBsYXllci5kYXRhLmF0dHJpYnV0ZXM7XG5cbiAgICAgICAgICBpZiAobGF5ZXIuaXNWaXNpYmxlKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5zdHlsZSlcbiAgICAgICAgICAgICAgYXR0ci5zdHlsZS5vcGFjaXR5ID0gMTAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTAwXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF0dHIuc3R5bGUpXG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgYXR0ci5zdHlsZSA9IHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWdOYW1lLCBhdHRyLCBsYXllci5kYXRhLmlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjaGFydCc+XG4gICAgICAgICAgPGgxPkRJViBMYXllcnM8L2gxPlxuICAgICAgICAgIHtsYXllcnN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgX29uU3RvcmVDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxheWVyczogdGhpcy5zdGF0ZS5zdG9yZS5nZXRBbGwoKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgTGF5ZXJzUGFuZWwgPSByZXF1aXJlKCcuLi9zcmMvdmlld3MvTGF5ZXJzUGFuZWwnKTtcbiAgdmFyIGNyZWF0ZUxheWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zcmMvY3JlYXRlTGF5ZXJTdG9yZScpO1xuXG4gIC8vIEluaXRpYWxpemUgdGhlIHN0b3JlLlxuICB2YXIgc3RvcmUgPSBjcmVhdGVMYXllclN0b3JlKCk7XG4gIHZhciBzdG9yZUFjdGlvbiA9IHN0b3JlLmFjdGlvbjtcblxuICAvLyBEZWJ1ZywgeW91IGNvdWxkIGVudGVyIFwibGF5ZXJTdG9yZS5nZXRBbGwoKVwiIHRvIHNlZSBsYXllcnMuXG4gIHdpbmRvdy5sYXllclN0b3JlID0gc3RvcmUuc3RvcmU7XG4gIHdpbmRvdy5sYXllckFjdGlvbiA9IHN0b3JlLmFjdGlvbjtcblxuICBSZWFjdC5yZW5kZXIoXG4gICAgPFNvbWVMYXllcnNDYW52YXMgc3RvcmU9e3N0b3JlfS8+LFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydC1leGFtcGxlJylcbiAgKTtcblxuICBSZWFjdC5yZW5kZXIoXG4gICAgPExheWVyc1BhbmVsIHN0b3JlPXtzdG9yZX0vPixcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGF5ZXJzLXBhbmVsLWV4YW1wbGUnKVxuICApO1xuXG4gIC8vIEFkZCBzb21ldGhpbmcgaW50byB0aGUgc3RvcmUuXG4gIHZhciBsYXllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgKytpKSB7XG4gICAgdmFyIG4gPSBNYXRoLmZsb29yKDUwICsgMzk5ICogTWF0aC5yYW5kb20oKSk7XG5cbiAgICBsYXllcnMucHVzaCh7XG4gICAgICBpc1Zpc2libGU6IHRydWUsXG4gICAgICBpc0xvY2tlZDogZmFsc2UsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGlkOiAnb2JqZWN0ICcgKyBpLFxuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICB3aWR0aDogbiArICdweCdcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgbGF5ZXJBY3Rpb24uaW5zZXJ0TGF5ZXJzKHVuZGVmaW5lZCwgbGF5ZXJzKTtcblxuICAvLyBUdXRvcmlhbC5cbiAgaWYgKGRvY3VtZW50LmNvb2tpZSAhPT0gJ2RlbW89ZmFsc2UnKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0cmlwID0gbmV3IFRyaXAoW3tcbiAgICAgICAgc2VsOiAkKCcjY2hhcnQtZXhhbXBsZScpLFxuICAgICAgICBjb250ZW50OiAnQXNzdW1lIHRoaXMgaXMgdGhlIHNlbGVjdGlvbiBvZiB5b3VyIGdyYXBoaWNzLicsXG4gICAgICAgIGV4cG9zZTogdHJ1ZSxcbiAgICAgICAgcG9zaXRpb246ICdlJyxcbiAgICAgICAgZGVsYXk6IDMwMDBcbiAgICAgIH0sIHtcbiAgICAgICAgc2VsOiAkKCcjbGF5ZXJzLXBhbmVsLWV4YW1wbGUnKSxcbiAgICAgICAgY29udGVudDogJ0FuZCB0aGlzIGlzIHRoZSBQaG90b3Nob3AtbGlrZWQgbGF5ZXJzIHBhbmVsLicsXG4gICAgICAgIGV4cG9zZTogdHJ1ZSxcbiAgICAgICAgcG9zaXRpb246ICd3JyxcbiAgICAgICAgZGVsYXk6IDMwMDBcbiAgICAgIH0sIHtcbiAgICAgICAgc2VsOiAkKCcudWktbGF5ZXInKVswXSxcbiAgICAgICAgY29udGVudDogJ0RyYWcgdGhlIGxheWVyIHRvIGFsdGVyIHRoZSBvcmRlci4nLFxuICAgICAgICBleHBvc2U6IHRydWUsXG4gICAgICAgIHBvc2l0aW9uOiAndycsXG4gICAgICAgIGRlbGF5OiAzMDAwXG4gICAgICB9LCB7XG4gICAgICAgIHNlbDogJCgnLnVpLWxheWVyLXZpc2libGUnKVsxXSxcbiAgICAgICAgY29udGVudDogJ0NsaWNrIHRvIGNoZWNrL3VuY2hlY2sgdGhlIHZpc2liaWxpdHkuJyxcbiAgICAgICAgZXhwb3NlOiB0cnVlLFxuICAgICAgICBwb3NpdGlvbjogJ3cnLFxuICAgICAgICBkZWxheTogMzAwMFxuICAgICAgfSwge1xuICAgICAgICBzZWw6ICQoJy51aS1sYXllci12aXNpYmxlJylbMV0sXG4gICAgICAgIGNvbnRlbnQ6ICdPciBzY3JvbGwgdGhlIG1vdXNlIHRvIGNoZWNrL3VuY2hlY2sgb3RoZXJzIHZpc2libGl0eS4nLFxuICAgICAgICBleHBvc2U6IHRydWUsXG4gICAgICAgIHBvc2l0aW9uOiAndycsXG4gICAgICAgIGRlbGF5OiAzMDAwXG4gICAgICB9XSwge1xuICAgICAgICBlbmFibGVBbmltYXRpb246IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgdHJpcC5zdGFydCgpO1xuICAgIH0sIDUwMCk7XG5cbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyAoMzAgKiA2MCAqIDEwMDApKTtcbiAgICBkb2N1bWVudC5jb29raWUgPSAnZGVtbz1mYWxzZScgKyAnO2V4cGlyZXM9JyArIGRhdGUudG9HTVRTdHJpbmcoKSArICc7cGF0aD0vJztcbiAgfVxufSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9saWIvRGlzcGF0Y2hlcicpXG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIERpc3BhdGNoZXJcbiAqIEB0eXBlY2hlY2tzXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCcuL2ludmFyaWFudCcpO1xuXG52YXIgX2xhc3RJRCA9IDE7XG52YXIgX3ByZWZpeCA9ICdJRF8nO1xuXG4vKipcbiAqIERpc3BhdGNoZXIgaXMgdXNlZCB0byBicm9hZGNhc3QgcGF5bG9hZHMgdG8gcmVnaXN0ZXJlZCBjYWxsYmFja3MuIFRoaXMgaXNcbiAqIGRpZmZlcmVudCBmcm9tIGdlbmVyaWMgcHViLXN1YiBzeXN0ZW1zIGluIHR3byB3YXlzOlxuICpcbiAqICAgMSkgQ2FsbGJhY2tzIGFyZSBub3Qgc3Vic2NyaWJlZCB0byBwYXJ0aWN1bGFyIGV2ZW50cy4gRXZlcnkgcGF5bG9hZCBpc1xuICogICAgICBkaXNwYXRjaGVkIHRvIGV2ZXJ5IHJlZ2lzdGVyZWQgY2FsbGJhY2suXG4gKiAgIDIpIENhbGxiYWNrcyBjYW4gYmUgZGVmZXJyZWQgaW4gd2hvbGUgb3IgcGFydCB1bnRpbCBvdGhlciBjYWxsYmFja3MgaGF2ZVxuICogICAgICBiZWVuIGV4ZWN1dGVkLlxuICpcbiAqIEZvciBleGFtcGxlLCBjb25zaWRlciB0aGlzIGh5cG90aGV0aWNhbCBmbGlnaHQgZGVzdGluYXRpb24gZm9ybSwgd2hpY2hcbiAqIHNlbGVjdHMgYSBkZWZhdWx0IGNpdHkgd2hlbiBhIGNvdW50cnkgaXMgc2VsZWN0ZWQ6XG4gKlxuICogICB2YXIgZmxpZ2h0RGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjb3VudHJ5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDb3VudHJ5U3RvcmUgPSB7Y291bnRyeTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB3aGljaCBjaXR5IGlzIHNlbGVjdGVkXG4gKiAgIHZhciBDaXR5U3RvcmUgPSB7Y2l0eTogbnVsbH07XG4gKlxuICogICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgYmFzZSBmbGlnaHQgcHJpY2Ugb2YgdGhlIHNlbGVjdGVkIGNpdHlcbiAqICAgdmFyIEZsaWdodFByaWNlU3RvcmUgPSB7cHJpY2U6IG51bGx9XG4gKlxuICogV2hlbiBhIHVzZXIgY2hhbmdlcyB0aGUgc2VsZWN0ZWQgY2l0eSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY2l0eS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ2l0eTogJ3BhcmlzJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYENpdHlTdG9yZWA6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY2l0eS11cGRhdGUnKSB7XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IHBheWxvYWQuc2VsZWN0ZWRDaXR5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgY291bnRyeSwgd2UgZGlzcGF0Y2ggdGhlIHBheWxvYWQ6XG4gKlxuICogICBmbGlnaHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAqICAgICBhY3Rpb25UeXBlOiAnY291bnRyeS11cGRhdGUnLFxuICogICAgIHNlbGVjdGVkQ291bnRyeTogJ2F1c3RyYWxpYSdcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGJvdGggc3RvcmVzOlxuICpcbiAqICAgIENvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgQ291bnRyeVN0b3JlLmNvdW50cnkgPSBwYXlsb2FkLnNlbGVjdGVkQ291bnRyeTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIGNhbGxiYWNrIHRvIHVwZGF0ZSBgQ291bnRyeVN0b3JlYCBpcyByZWdpc3RlcmVkLCB3ZSBzYXZlIGEgcmVmZXJlbmNlXG4gKiB0byB0aGUgcmV0dXJuZWQgdG9rZW4uIFVzaW5nIHRoaXMgdG9rZW4gd2l0aCBgd2FpdEZvcigpYCwgd2UgY2FuIGd1YXJhbnRlZVxuICogdGhhdCBgQ291bnRyeVN0b3JlYCBpcyB1cGRhdGVkIGJlZm9yZSB0aGUgY2FsbGJhY2sgdGhhdCB1cGRhdGVzIGBDaXR5U3RvcmVgXG4gKiBuZWVkcyB0byBxdWVyeSBpdHMgZGF0YS5cbiAqXG4gKiAgIENpdHlTdG9yZS5kaXNwYXRjaFRva2VuID0gZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NvdW50cnktdXBkYXRlJykge1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBtYXkgbm90IGJlIHVwZGF0ZWQuXG4gKiAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NvdW50cnlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIGlzIG5vdyBndWFyYW50ZWVkIHRvIGJlIHVwZGF0ZWQuXG4gKlxuICogICAgICAgLy8gU2VsZWN0IHRoZSBkZWZhdWx0IGNpdHkgZm9yIHRoZSBuZXcgY291bnRyeVxuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBnZXREZWZhdWx0Q2l0eUZvckNvdW50cnkoQ291bnRyeVN0b3JlLmNvdW50cnkpO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIHVzYWdlIG9mIGB3YWl0Rm9yKClgIGNhbiBiZSBjaGFpbmVkLCBmb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEZsaWdodFByaWNlU3RvcmUuZGlzcGF0Y2hUb2tlbiA9XG4gKiAgICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICogICAgICAgICBjYXNlICdjb3VudHJ5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICpcbiAqICAgICAgICAgY2FzZSAnY2l0eS11cGRhdGUnOlxuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZCA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyPWZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGlkID0gX3ByZWZpeCArIF9sYXN0SUQrKztcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjYWxsYmFjayBiYXNlZCBvbiBpdHMgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3Rlcj1mdW5jdGlvbihpZCkge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICBpZFxuICAgICk7XG4gICAgZGVsZXRlIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXTtcbiAgfTtcblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBjYWxsYmFja3Mgc3BlY2lmaWVkIHRvIGJlIGludm9rZWQgYmVmb3JlIGNvbnRpbnVpbmcgZXhlY3V0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGNhbGxiYWNrLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgY2FsbGJhY2sgaW5cbiAgICogcmVzcG9uc2UgdG8gYSBkaXNwYXRjaGVkIHBheWxvYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXk8c3RyaW5nPn0gaWRzXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yPWZ1bmN0aW9uKGlkcykge1xuICAgIGludmFyaWFudChcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLidcbiAgICApO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpZHMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgaWQgPSBpZHNbaWldO1xuICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICBpbnZhcmlhbnQoXG4gICAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdLFxuICAgICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZCB3aGlsZSAnICtcbiAgICAgICAgICAnd2FpdGluZyBmb3IgYCVzYC4nLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KFxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAgICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsXG4gICAgICAgIGlkXG4gICAgICApO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgcGF5bG9hZCB0byBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5kaXNwYXRjaD1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgIXRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyxcbiAgICAgICdEaXNwYXRjaC5kaXNwYXRjaCguLi4pOiBDYW5ub3QgZGlzcGF0Y2ggaW4gdGhlIG1pZGRsZSBvZiBhIGRpc3BhdGNoLidcbiAgICApO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKTtcbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZygpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSXMgdGhpcyBEaXNwYXRjaGVyIGN1cnJlbnRseSBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmlzRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrPWZ1bmN0aW9uKGlkKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0odGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmc9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSBmYWxzZTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhciBib29ra2VlcGluZyB1c2VkIGZvciBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmc9ZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoZmFsc2UpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iLCJ2YXIgRGlzcGF0Y2hlciA9IHJlcXVpcmUoJ2ZsdXgnKS5EaXNwYXRjaGVyO1xuXG5mdW5jdGlvbiBpZEdlbigpIHtcbiAgcmV0dXJuICgrRGF0ZS5ub3coKSArIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAgKiBNYXRoLnJhbmRvbSgpKSkudG9TdHJpbmcoMzYpO1xufVxuXG5mdW5jdGlvbiBMYXllckFjdGlvbihkaXNwYXRjaGVyKSB7XG4gIGlmICghKGRpc3BhdGNoZXIgaW5zdGFuY2VvZiBEaXNwYXRjaGVyKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2Rpc3BhdGNoZXIgdW5kZWZpbmVkLicpXG4gIH1cblxuICB0aGlzLl9kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbn1cblxuTGF5ZXJBY3Rpb24uaWQgPSBpZEdlbigpO1xuXG5MYXllckFjdGlvbi52ZXJpZnkgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG9iai5pZCA9PT0gTGF5ZXJBY3Rpb24uaWQ7XG59XG5cbkxheWVyQWN0aW9uLlNFVF9MQVlFUl9TVEFURSA9IDA7XG5MYXllckFjdGlvbi5TRVRfQUxMX0xBWUVSU19TVEFURSA9IDE7XG5MYXllckFjdGlvbi5JTlNFUlRfTEFZRVIgPSAyO1xuTGF5ZXJBY3Rpb24uREVMRVRFX0xBWUVSID0gMztcbkxheWVyQWN0aW9uLkRVUExJQ0FURV9MQVlFUiA9IDQ7XG5MYXllckFjdGlvbi5TVEFSVF9EUkFHX0xBWUVSID0gNTtcbkxheWVyQWN0aW9uLlNUT1BfRFJBR19MQVlFUiA9IDY7XG5MYXllckFjdGlvbi5NT1ZFX0RSQUdHRURfTEFZRVIgPSA3O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuc2V0TGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uKHRva2VuLCBpc1Zpc2libGUsIGlzTG9ja2VkKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLlNFVF9MQVlFUl9TVEFURSxcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgaXNWaXNpYmxlOiBpc1Zpc2libGUsXG4gICAgaXNMb2NrZWQ6IGlzTG9ja2VkXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLnNldEFsbExheWVyU3RhdGUgPSBmdW5jdGlvbihpc1Zpc2libGUsIGlzTG9ja2VkKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLlNFVF9BTExfTEFZRVJTX1NUQVRFLFxuICAgIGlzVmlzaWJsZTogaXNWaXNpYmxlLFxuICAgIGlzTG9ja2VkOiBpc0xvY2tlZFxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5pbnNlcnRMYXllciA9IGZ1bmN0aW9uKHRva2VuLCBsYXllcikge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5JTlNFUlRfTEFZRVIsXG4gICAgdG9rZW46IHRva2VuLFxuICAgIGxheWVyczogbGF5ZXJcbiAgfSk7XG59XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5pbnNlcnRMYXllcnMgPSBmdW5jdGlvbih0b2tlbiwgbGF5ZXJzKSB7XG4gIHRoaXMuaW5zZXJ0TGF5ZXIodG9rZW4sIGxheWVycyk7XG59XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5kZWxldGVMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLkRFTEVURV9MQVlFUixcbiAgICB0b2tlbjogdG9rZW5cbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuZHVwbGljYXRlTGF5ZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5EVVBMSUNBVEVfTEFZRVIsXG4gICAgdG9rZW46IHRva2VuXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLnN0YXJ0RHJhZ0xheWVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uU1RBUlRfRFJBR19MQVlFUixcbiAgICB0b2tlbjogdG9rZW5cbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuc3RvcERyYWdMYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5TVE9QX0RSQUdfTEFZRVJcbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUubW92ZURyYWdnZWRMYXllciA9IGZ1bmN0aW9uKHRvKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLk1PVkVfRFJBR0dFRF9MQVlFUixcbiAgICB0bzogdG9cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyQWN0aW9uO1xuIiwidmFyIEltbXV0YWJsZSA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93LkltbXV0YWJsZSA6IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIExheWVyU3RvcmUgPSByZXF1aXJlKCcuL3N0b3Jlcy9MYXllclN0b3JlJyk7XG52YXIgTGF5ZXJBY3Rpb24gPSByZXF1aXJlKCcuL2FjdGlvbnMvTGF5ZXJBY3Rpb24nKTtcbnZhciBMYXllckRpc3BhdGNoZXIgPSByZXF1aXJlKCdmbHV4JykuRGlzcGF0Y2hlcjtcblxuLyoqXG4gKiBCdWlsZCB0aGUgc3RvcmUsIGFjdGlvbiBhbmQgZGlzcGF0Y2hlci5cbiAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi0tLS0tLS0tLS0uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAuLS0tLS0tLS0tLS0tfCAgYWN0aW9uICB8IDwtLS0tLS0tLS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAnLS0tLS0tLS0tLScgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIC4tLS0tLS0tLS0tLiAgICAgLi0tLS0tLS0tLS0tLS0tLiAgICAgLi0tLS0tLS0tLS4gICAgIC4tLS0tLS0tLS0uXG4gKiB8ICBhY3Rpb24gIHwgLS0+IHwgIGRpc3BhdGNoZXIgIHwgLS0+IHwgIHN0b3JlICB8IC0tPiB8ICB2aWV3cyAgfFxuICogJy0tLS0tLS0tLS0nICAgICAnLS0tLS0tLS0tLS0tLS0nICAgICAnLS0tLS0tLS0tJyAgICAgJy0tLS0tLS0tLSdcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IHtpZDoge1N0cmluZ31cbiAqICAgICAgICAgICAgICAgICAgIHN0b3JlOiB7TGF5ZXJTdG9yZX0sXG4gKiAgICAgICAgICAgICAgICAgICBhY3Rpb246IHtMYXllckFjdGlvbn19XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXJzKSB7XG4gIHZhciBkaXNwYXRjaGVyID0gbmV3IExheWVyRGlzcGF0Y2hlcigpO1xuICB2YXIgc3RvcmUgPSBuZXcgTGF5ZXJTdG9yZShsYXllcnMpO1xuICB2YXIgYWN0aW9uID0gbmV3IExheWVyQWN0aW9uKGRpc3BhdGNoZXIpO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBEaXNwYXRjaGVyIENhbGxiYWNrIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICB2YXIgc2V0TGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uU0VUX0xBWUVSX1NUQVRFKSB7XG4gICAgICBjb25zb2xlLmxvZygxMTExMSwgYWN0aW9uKTtcbiAgICAgIHZhciB0b2tlbiA9IGFjdGlvbi50b2tlbjtcbiAgICAgIHZhciBpc1Zpc2libGUgPSBhY3Rpb24uaXNWaXNpYmxlO1xuICAgICAgdmFyIGlzTG9ja2VkID0gYWN0aW9uLmlzTG9ja2VkO1xuXG4gICAgICBpZiAoc3RvcmUuc2V0TGF5ZXJTdGF0ZSh0b2tlbiwgaXNWaXNpYmxlLCBpc0xvY2tlZCwgdW5kZWZpbmVkKSkge1xuICAgICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBzZXRBbGxMYXllcnNTdGF0ZSA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uU0VUX0FMTF9MQVlFUlNfU1RBVEUpIHtcbiAgICAgIHZhciBpc1Zpc2libGUgPSBhY3Rpb24uaXNWaXNpYmxlO1xuICAgICAgdmFyIGlzTG9ja2VkID0gYWN0aW9uLmlzTG9ja2VkO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHN0b3JlLmxlbmd0aCgpOyBpIDwgajsgKytpKSB7XG4gICAgICAgIHN0b3JlLnNldExheWVyU3RhdGUoaSwgaXNWaXNpYmxlLCBpc0xvY2tlZCwgdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGluc2VydExheWVyID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSBMYXllckFjdGlvbi5JTlNFUlRfTEFZRVIpIHtcbiAgICAgIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciB0b2tlbiA9IGFjdGlvbi50b2tlbjtcbiAgICAgIHZhciBsYXllcnMgPSBhY3Rpb24ubGF5ZXJzO1xuXG4gICAgICBpZiAobGF5ZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaXNDaGFuZ2VkID0gc3RvcmUuaW5zZXJ0TGF5ZXJzKHRva2VuLCBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxheWVyID0gbGF5ZXJzO1xuICAgICAgICBpc0NoYW5nZWQgPSBzdG9yZS5pbnNlcnRMYXllcih0b2tlbiwgbGF5ZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNDaGFuZ2VkKSBzdG9yZS5wdWJsaXNoKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkZWxldGVMYXllciA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uREVMRVRFX0xBWUVSKSB7XG4gICAgICB2YXIgdG9rZW4gPSBhY3Rpb24udG9rZW47XG5cbiAgICAgIGlmIChzdG9yZS5yZW1vdmVMYXllcih0b2tlbikpIHtcbiAgICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgZHVwbGljYXRlTGF5ZXIgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09IExheWVyQWN0aW9uLkRVUExJQ0FURV9MQVlFUikge1xuICAgICAgdmFyIHRva2VuID0gYWN0aW9uLnRva2VuO1xuXG4gICAgICBpZiAoc3RvcmUuZHVwbGljYXRlTGF5ZXIodG9rZW4pKSB7XG4gICAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHN0YXJ0RHJhZ0xheWVyID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSBMYXllckFjdGlvbi5TVEFSVF9EUkFHX0xBWUVSKSB7XG4gICAgICB2YXIgZHJhZ2dlZFRva2VuID0gYWN0aW9uLnRva2VuO1xuXG4gICAgICBzdG9yZS5zZXRMYXllclN0YXRlKGRyYWdnZWRUb2tlbiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgc3RvcmUuaW5zZXJ0UGxhY2Vob2xkZXIoZHJhZ2dlZFRva2VuICsgMSk7XG4gICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzdG9wRHJhZ0xheWVyID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSBMYXllckFjdGlvbi5TVE9QX0RSQUdfTEFZRVIpIHtcbiAgICAgIHZhciBkcmFnZ2VkVG9rZW4gPSBzdG9yZS5nZXREcmFnZ2VkTGF5ZXJUb2tlbnMoKVswXTtcbiAgICAgIHZhciBwbGFjZWhvbGRlclRva2VuID0gc3RvcmUuZ2V0UGxhY2Vob2xkZXJUb2tlbnMoKVswXTtcblxuICAgICAgc3RvcmUuc2V0TGF5ZXJTdGF0ZShkcmFnZ2VkVG9rZW4sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICBzdG9yZS5leGNoYW5nZUxheWVycyhkcmFnZ2VkVG9rZW4sIHBsYWNlaG9sZGVyVG9rZW4pO1xuICAgICAgc3RvcmUucmVtb3ZlUGxhY2Vob2xkZXJzKCk7XG4gICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtb3ZlRHJhZ2dlZExheWVyID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSBMYXllckFjdGlvbi5NT1ZFX0RSQUdHRURfTEFZRVIpIHtcbiAgICAgIHZhciB0byA9IGFjdGlvbi50bztcbiAgICAgIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcblxuICAgICAgc3RvcmUucmVtb3ZlUGxhY2Vob2xkZXJzKCk7XG5cbiAgICAgIHZhciBkcmFnZ2VkVG9rZW4gPSBzdG9yZS5nZXREcmFnZ2VkTGF5ZXJUb2tlbnMoKVswXTtcblxuICAgICAgaWYgKHRvICE9PSBkcmFnZ2VkVG9rZW4pIHtcbiAgICAgICAgaXNDaGFuZ2VkID0gc3RvcmUuZXhjaGFuZ2VMYXllcnMoZHJhZ2dlZFRva2VuLCB0byk7XG4gICAgICB9XG5cbiAgICAgIGRyYWdnZWRUb2tlbiA9IHN0b3JlLmdldERyYWdnZWRMYXllclRva2VucygpWzBdO1xuICAgICAgc3RvcmUuaW5zZXJ0UGxhY2Vob2xkZXIoZHJhZ2dlZFRva2VuICsgMSk7XG5cbiAgICAgIGlmIChpc0NoYW5nZWQpIHtcbiAgICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBSZWdpc3RlciBjYWxsYmFjayB0byBoYW5kbGUgYWxsIHVwZGF0ZXMuXG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoc2V0TGF5ZXJTdGF0ZSk7XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoc2V0QWxsTGF5ZXJzU3RhdGUpO1xuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKGluc2VydExheWVyKTtcbiAgZGlzcGF0Y2hlci5yZWdpc3RlcihkZWxldGVMYXllcik7XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoZHVwbGljYXRlTGF5ZXIpO1xuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKHN0YXJ0RHJhZ0xheWVyKTtcbiAgZGlzcGF0Y2hlci5yZWdpc3RlcihzdG9wRHJhZ0xheWVyKTtcbiAgZGlzcGF0Y2hlci5yZWdpc3Rlcihtb3ZlRHJhZ2dlZExheWVyKTtcblxuICAvLyBSZXR1cm4gb25seSBzdG9yZSBhbmQgYWN0aW9uLiBEaXNwYXRjaGVyIGlzIGhpZGRlbiBmb3IgdGhlIG91dHNpZGUgd29ybGQuXG4gIHJldHVybiB7XG4gICAgaWQ6ICgrRGF0ZS5ub3coKSArIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAgKiBNYXRoLnJhbmRvbSgpKSkudG9TdHJpbmcoMzYpLFxuICAgIHN0b3JlOiBzdG9yZSxcbiAgICBhY3Rpb246IGFjdGlvblxuICB9O1xufVxuIiwidmFyIEltbXV0YWJsZSA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93LkltbXV0YWJsZSA6IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xudmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBMQVlFUl9QUk9UTyA9IHtcbiAgaWQ6ICckcGxhY2Vob2xkZXInLFxuICBpc1Zpc2libGU6IHRydWUsXG4gIGlzTG9ja2VkOiBmYWxzZSxcbiAgaXNEcmFnZ2VkOiBmYWxzZSxcbiAgZGF0YTogdW5kZWZpbmVkXG59O1xuXG5mdW5jdGlvbiBpZEdlbigpIHtcbiAgcmV0dXJuIChEYXRlLm5vdygpICsgTWF0aC5mbG9vcigweDEwMDAwMDAwMDAwICogTWF0aC5yYW5kb20oKSkpLnRvU3RyaW5nKDM2KTtcbn1cblxuZnVuY3Rpb24gY29weShvYmopIHtcbiAgdmFyIHJldCA9IHt9O1xuXG4gIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSlcbiAgICAgIHJldFtrXSA9IG9ialtrXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTGF5ZXJTdG9yZSBpcyB0aGUgZGF0YSBtb2R1bGUuXG4gKi9cbmZ1bmN0aW9uIExheWVyU3RvcmUobGF5ZXJzKSB7XG4gIC8qKlxuICAgKiBBcnJheSBvZiBsYXllcnMgb2JqZWN0LiBGb3JtYXQgb2Ygc2luZ2xlIGxheWVyIGlzIGxpa2UuLi5cbiAgICoge1xuICAgKiAgIGlkOiB7U3RyaW5nfSxcbiAgICogICBpc1Zpc2libGU6IHtCb29sfSxcbiAgICogICBpc0xvY2tlZDoge0Jvb2x9LFxuICAgKiAgIGRhdGE6IHs8c3ZnPnw8aW1nPnxTdHJpbmd8aWR9XG4gICAqIH1cbiAgICovXG4gIHRoaXMuX2xheWVycyA9IGxheWVycyBpbnN0YW5jZW9mIEFycmF5ID9cbiAgICBsYXllcnMubWFwKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgICB2YXIgcmV0ID0gY29weShMQVlFUl9QUk9UTyk7XG5cbiAgICAgIHJldC5pZCA9IGlkR2VuKCk7XG4gICAgICByZXQuaXNWaXNpYmxlID0gbGF5ZXIuaXNWaXNpYmxlIHx8IHRydWU7XG4gICAgICByZXQuaXNMb2NrZWQgPSBsYXllci5pc0xvY2tlZCB8fCBmYWxzZTtcblxuICAgICAgcmV0dXJuIHJldDs7XG4gICAgfSkgOiBbXTtcbn1cblxudXRpbC5pbmhlcml0cyhMYXllclN0b3JlLCBldmVudHMuRXZlbnRFbWl0dGVyKTtcblxuTGF5ZXJTdG9yZS5pZCA9ICgrRGF0ZS5ub3coKSArIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAgKiBNYXRoLnJhbmRvbSgpKSkudG9TdHJpbmcoMzYpO1xuXG5MYXllclN0b3JlLnZlcmlmeSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gb2JqLmlkID09PSBMYXllclN0b3JlLmlkO1xufVxuXG5MYXllclN0b3JlLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX2xheWVycy5sZW5ndGg7XG59XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fbGF5ZXJzLnNsaWNlKDApO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdGhpcy5hZGRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUudW5saXN0ZW4gPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pc1BsYWNlaG9sZGVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgcmV0dXJuIHRoaXMuX2xheWVyc1t0b2tlbl0uaWQgPT09IExBWUVSX1BST1RPLmlkO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZHVwbGljYXRlTGF5ZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB2YXIgZHVwID0gY29weSh0aGlzLl9sYXllcnNbdG9rZW5dKTtcblxuICAgIGR1cC5pZCA9IGlkR2VuKCk7XG4gICAgZHVwLmlzRHJhZ2dlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4gKyAxLCAwLCBkdXApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5leGNoYW5nZUxheWVycyA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGlmIChmcm9tID49IDAgJiYgZnJvbSA8IHRoaXMuX2xheWVycy5sZW5ndGggJiZcbiAgICAgIHRvID49IDAgJiYgdG8gPCB0aGlzLl9sYXllcnMubGVuZ3RoKSB7XG5cbiAgICB0aGlzLl9sYXllcnMuc3BsaWNlKHRvLCAwLCB0aGlzLl9sYXllcnMuc3BsaWNlKGZyb20sIDEpWzBdKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pbnNlcnRMYXllciA9IGZ1bmN0aW9uKHRva2VuLCBsYXllcikge1xuICB2YXIgbmV3TGF5ZXIgPSBjb3B5KExBWUVSX1BST1RPKTtcblxuICBuZXdMYXllci5pZCA9IGlkR2VuKCk7XG4gIG5ld0xheWVyLmlzVmlzaWJsZSA9IGxheWVyLmlzVmlzaWJsZSB8fCB0cnVlO1xuICBuZXdMYXllci5pc0xvY2tlZCA9IGxheWVyLmlzTG9ja2VkIHx8IGZhbHNlO1xuICBuZXdMYXllci5kYXRhID0gbGF5ZXIuZGF0YTtcblxuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB0aGlzLl9sYXllcnMuc3BsaWNlKHRva2VuICsgMSwgMCwgbmV3TGF5ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xheWVycy5wdXNoKG5ld0xheWVyKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuaW5zZXJ0TGF5ZXJzID0gZnVuY3Rpb24odG9rZW4sIGxheWVycykge1xuICBpZiAoIShsYXllcnMgaW5zdGFuY2VvZiBBcnJheSkpIHJldHVybiBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gMCwgaiA9IGxheWVycy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICB0aGlzLmluc2VydExheWVyKHRva2VuICsgaSwgbGF5ZXJzW2ldKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuaW5zZXJ0UGxhY2Vob2xkZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICB0aGlzLl9sYXllcnMuc3BsaWNlKHRva2VuLCAwLCBMQVlFUl9QUk9UTyk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5yZW1vdmVMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4sIDEpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5yZW1vdmVQbGFjZWhvbGRlcnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fbGF5ZXJzID0gdGhpcy5fbGF5ZXJzLmZpbHRlcihmdW5jdGlvbihsYXllcikge1xuICAgIHJldHVybiBsYXllci5pZCAhPT0gTEFZRVJfUFJPVE8uaWQ7XG4gIH0pO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmdldERyYWdnZWRMYXllclRva2VucyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0ID0gW107XG5cbiAgdGhpcy5fbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obGF5ZXIsIGkpIHtcbiAgICBpZiAobGF5ZXIuaXNEcmFnZ2VkKSByZXQucHVzaChpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiBmYWxzZTtcbn1cblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZ2V0UGxhY2Vob2xkZXJUb2tlbnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIHRoaXMuX2xheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgaWYgKGxheWVyLmlkID09PSBMQVlFUl9QUk9UTy5pZCkgcmV0LnB1c2goaSk7XG4gIH0pO1xuXG4gIHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogZmFsc2U7XG59XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmdldExheWVyU3RhdGUgPSBmdW5jdGlvbih0b2tlbikge1xuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY29weSh0aGlzLl9sYXllcnNbdG9rZW5dKTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLnNldExheWVyU3RhdGUgPSBmdW5jdGlvbih0b2tlbiwgaXNWaXNpYmxlLCBpc0xvY2tlZCwgaXNEcmFnZ2VkKSB7XG4gIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcblxuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB2YXIgbGF5ZXIgPSB0aGlzLl9sYXllcnNbdG9rZW5dO1xuXG4gICAgaWYgKGlzVmlzaWJsZSA9PT0gdHJ1ZSB8fCBpc1Zpc2libGUgPT09IGZhbHNlKSB7XG4gICAgICBsYXllci5pc1Zpc2libGUgPSBpc1Zpc2libGU7XG4gICAgfVxuICAgIGlmIChpc0xvY2tlZCA9PT0gdHJ1ZSB8fCBpc0xvY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGxheWVyLmlzTG9ja2VkID0gaXNMb2NrZWQ7XG4gICAgfVxuICAgIGlmIChpc0RyYWdnZWQgPT09IHRydWUgfHwgaXNEcmFnZ2VkID09PSBmYWxzZSkge1xuICAgICAgbGF5ZXIuaXNEcmFnZ2VkID0gaXNEcmFnZ2VkO1xuICAgIH1cblxuICAgIGlzQ2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gaXNDaGFuZ2VkO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0ciA9ICcnO1xuXG4gIHRoaXMuX2xheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgc3RyICs9IGxheWVyLmlkICsgJyAtPiAnO1xuICB9KTtcblxuICBjb25zb2xlLmxvZyhzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyU3RvcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93LlJlYWN0IDogcmVxdWlyZSgncmVhY3QnKTtcbnZhciBMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL0xheWVyU3RvcmUnKTtcbnZhciBMYXllckFjdGlvbiA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTGF5ZXJBY3Rpb24nKTtcblxudmFyIENTUyA9IHtcblxuICBWSVNJQkxFOiAndWktbGF5ZXItdmlzaWJsZScsXG4gIElOVklTSUJMRTogJ3VpLWxheWVyLWludmlzaWJsZScsXG5cbiAgTE9DS0VEOiAndWktbGF5ZXItbG9ja2VkJyxcbiAgVU5MT0NLRUQ6ICd1aS1sYXllci11bmxvY2tlZCdcblxufTtcblxudmFyIExheWVySXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0b2tlbjogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBzdG9yZTogTGF5ZXJTdG9yZS52ZXJpZnksXG4gICAgYWN0aW9uOiBMYXllckFjdGlvbi52ZXJpZnksXG4gICAgaXNWaXNpYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBpc0xvY2tlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgaWQ9e3RoaXMucHJvcHMuaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPSd1aS1sYXllcidcbiAgICAgICAgICBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX1cbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5vbk1vdXNlRG93bn1cbiAgICAgICAgICBvbk1vdXNlVXA9e3RoaXMucHJvcHMub25Nb3VzZVVwfSA+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9J2NoZWNrYm94J1xuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuaXNWaXNpYmxlfVxuICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5fdmlzaWJsZUNzcygpfVxuICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLnByb3BzLm9uTW91c2VPdmVyfVxuICAgICAgICAgIG9uTW91c2VPdXQ9e3RoaXMucHJvcHMub25Nb3VzZU91dH0gLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT0nY2hlY2tib3gnXG4gICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5pc0xvY2tlZH1cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuX2xvY2tlZENzcygpfVxuICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLnByb3BzLm9uTW91c2VPdmVyfVxuICAgICAgICAgIG9uTW91c2VPdXQ9e3RoaXMucHJvcHMub25Nb3VzZU91dH0gLz5cbiAgICAgICAgPHNwYW4+eydMYXllcjogJyArIHRoaXMucHJvcHMuaWR9PC9zcGFuPlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUxheWVyfT5cbiAgICAgICAgICBkZWxldGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fZHVwbGljYXRlTGF5ZXJ9PlxuICAgICAgICAgIGR1cGxpY2F0ZVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfSxcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHVibGljIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBQcml2YXRlIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBfdmlzaWJsZUNzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuaXNWaXNpYmxlID8gQ1NTLlZJU0lCTEUgOiBDU1MuSU5WSVNJQkxFO1xuICB9LFxuXG4gIF9sb2NrZWRDc3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmlzTG9ja2VkID8gQ1NTLkxPQ0tFRCA6IENTUy5VTkxPQ0tFRDtcbiAgfSxcblxuICBfZGVsZXRlTGF5ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5wcm9wcy5hY3Rpb247XG5cbiAgICBhY3Rpb24uZGVsZXRlTGF5ZXIodGhpcy5wcm9wcy50b2tlbik7XG4gIH0sXG5cbiAgX2R1cGxpY2F0ZUxheWVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMucHJvcHMuYWN0aW9uO1xuXG4gICAgYWN0aW9uLmR1cGxpY2F0ZUxheWVyKHRoaXMucHJvcHMudG9rZW4pO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExheWVySXRlbTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgPyB3aW5kb3cuUmVhY3QgOiByZXF1aXJlKCdyZWFjdCcpO1xudmFyIExheWVyU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvTGF5ZXJTdG9yZScpO1xudmFyIExheWVyQWN0aW9uID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9MYXllckFjdGlvbicpO1xudmFyIExheWVySXRlbSA9IHJlcXVpcmUoJy4vTGF5ZXJJdGVtJyk7XG5cbnZhciBMYXllcnNQYW5lbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBzdG9yZTogTGF5ZXJTdG9yZS52ZXJpZnksXG4gICAgYWN0aW9uOiBMYXllckFjdGlvbi52ZXJpZnksXG4gICAgbGF5ZXJzOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXlcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB7XG4gICAgICAvKipcbiAgICAgICAqIEByZXR1cm4ge0xheWVyU3RvcmV9IGluc3RhbmNlIG9mIC4uL3N0b3Jlcy9MYXllclN0b3JlLmpzLCBzaG91bGRuJ3RcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgIG1vZGlmeSBpdCBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAgICAgICAqL1xuICAgICAgc3RvcmU6IHRoaXMucHJvcHMuc3RvcmUuc3RvcmUsXG5cbiAgICAgIC8qKlxuICAgICAgICogQHJldHVybiB7TGF5ZXJBY3Rpb259IGluc3RhbmNlIG9mIC4uL2FjdGlvbnMvTGF5ZXJBY3Rpb24uanMsIHNob3VsZG4ndFxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgIG1vZGlmeSBpdCBhZnRlciBpbml0aWFsaXphdGlvbi5cbiAgICAgICAqL1xuICAgICAgYWN0aW9uOiB0aGlzLnByb3BzLnN0b3JlLmFjdGlvbixcblxuICAgICAgLyoqXG4gICAgICAgKiBAcmV0dXJuIHtBcnJheX0gTGF5ZXJzIGNvcHkgZ290IGZyb20gc3RvcmUgKG11dGFibGUpLlxuICAgICAgICovXG4gICAgICBsYXllcnM6IHRoaXMucHJvcHMuc3RvcmUuc3RvcmUuZ2V0QWxsKCksXG5cbiAgICAgIC8qKlxuICAgICAgICogQHJldHVybiB7T2JqZWN0fSBBcmJyaXRyYXJ5IHR5cGUuIEl0IGlzIHVzZWQgdG8gZm9yY2UgY29tcG9uZW50IHRvIHJlbmRlci5cbiAgICAgICAqL1xuICAgICAgZm9yY2VkVXBkYXRlOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG5cbiAgICBzdG9yZS5saXN0ZW4odGhpcy5fb25TdG9yZUNoYW5nZSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG5cbiAgICBzdG9yZS51bmxpc3Rlbih0aGlzLl9vblN0b3JlQ2hhbmdlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5zdGF0ZS5sYXllcnMubWFwKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgICB2YXIgc3RvcmUgPSBzZWxmLnN0YXRlLnN0b3JlO1xuXG4gICAgICByZXR1cm4gKDxMYXllckl0ZW1cbiAgICAgICAgICAgICAgICAgIGlkPXtsYXllci5pZH1cbiAgICAgICAgICAgICAgICAgIHRva2VuPXtpfVxuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlPXtsYXllci5pc1Zpc2libGV9XG4gICAgICAgICAgICAgICAgICBpc0xvY2tlZD17bGF5ZXIuaXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzdHlsZT17c2VsZi5fbGF5ZXJJbmxpbmVTdHlsZShpKX1cbiAgICAgICAgICAgICAgICAgIHN0b3JlPXtzZWxmLnN0YXRlLnN0b3JlfVxuICAgICAgICAgICAgICAgICAgYWN0aW9uPXtzZWxmLnN0YXRlLmFjdGlvbn1cbiAgICAgICAgICAgICAgICAgIG9uTW91c2VPdmVyPXtzZWxmLl9vbkxheWVyTW91c2VPdmVyT3V0LmJpbmQoc2VsZiwgaSl9XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlT3V0PXtzZWxmLl9vbkxheWVyTW91c2VPdmVyT3V0LmJpbmQoc2VsZiwgaSl9XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlRG93bj17c2VsZi5fb25MYXllck1vdXNlRG93bi5iaW5kKHNlbGYsIGkpfVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZVVwPXtzZWxmLl9vbkxheWVyTW91c2VVcC5iaW5kKHNlbGYsIGkpfSAvPik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J3VpLWxheWVyLXBhbmVsIHVpLW5vc2VsZWN0J1xuICAgICAgICAgICBvbk1vdXNlVXA9e3RoaXMuX29uQ29udGFpbmVyTW91c2VVcH1cbiAgICAgICAgICAgb25Nb3VzZUxlYXZlPXt0aGlzLl9vbkNvbnRhaW5lck1vdXNlVXB9XG4gICAgICAgICAgIG9uTW91c2VNb3ZlPXt0aGlzLl9vbkNvbnRhaW5lck1vdXNlTW92ZX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSd1aS1sYXllci1oZWFkZXInPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT0nY2hlY2tib3gnXG4gICAgICAgICAgICBjaGVja2VkPXt0aGlzLl9pc0FsbFZpc2libGUoKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl90b2dnbGVBbGxWaXNpYmxlfT5cbiAgICAgICAgICAgIFRvZ2dsZSBWaXNpYmxlXG4gICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9J2NoZWNrYm94J1xuICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5faXNBbGxMb2NrZWQoKX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl90b2dnbGVBbGxMb2NrZWR9PlxuICAgICAgICAgICAgVG9nZ2xlIExvY2tlZFxuICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPSd1aS1sYXllci1jb250YWluZXInIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZSd9fT5cbiAgICAgICAgICB7bGF5ZXJzfVxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgICAvLyA8dWwgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJ319PlxuICB9LFxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBQdWJsaWMgRnVuY3Rpb25zIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHJpdmF0ZSBGdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgX29mZnNldDogZmFsc2UsXG5cbiAgX3Bvc2l0aW9uOiBmYWxzZSxcblxuICBfZHJhZ2dlZDogZmFsc2UsXG5cbiAgX2RyYWdnZWRQYXJlbnQ6IGZhbHNlLFxuXG4gIF90b2dnbGVkOiBmYWxzZSxcblxuICBfbGF5ZXJTaG91bGRWaXNpYmxlOiB1bmRlZmluZWQsXG5cbiAgX2xheWVyU2hvdWxkTG9ja2VkOiB1bmRlZmluZWQsXG5cbiAgX2xheWVySW5saW5lU3R5bGU6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgdmFyIHN0b3JlID0gdGhpcy5zdGF0ZS5zdG9yZTtcbiAgICB2YXIgc3R5bGUgPSBudWxsO1xuXG4gICAgaWYgKHN0b3JlLmlzUGxhY2Vob2xkZXIodG9rZW4pKSB7XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgb3BhY2l0eTogJzAnXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoc3RvcmUuZ2V0TGF5ZXJTdGF0ZSh0b2tlbikuaXNEcmFnZ2VkICYmIHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHpJbmRleDogJzEwMCcsXG4gICAgICAgIGxlZnQ6IHRoaXMuX3Bvc2l0aW9uLmxlZnQgKyAncHgnLFxuICAgICAgICB0b3A6IHRoaXMuX3Bvc2l0aW9uLnRvcCArICdweCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlO1xuICB9LFxuXG4gIF9vbkxheWVyTW91c2VEb3duOiBmdW5jdGlvbihsYXllclRva2VuLCBlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQ7XG4gICAgdmFyIGVsVGFnTmFtZSA9IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgZWxQYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuXG4gICAgaWYgKGVsVGFnTmFtZSA9PT0gJ2lucHV0Jykge1xuICAgICAgdmFyIHN0YXRlVG9rZW4gPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGVsUGFyZW50LmNoaWxkTm9kZXMsIGVsKTtcbiAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUuc3RvcmUuZ2V0TGF5ZXJTdGF0ZShsYXllclRva2VuKTtcblxuICAgICAgdGhpcy5fdG9nZ2xlZCA9IGVsO1xuICAgICAgdGhpcy5fbGF5ZXJTaG91bGRWaXNpYmxlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fbGF5ZXJTaG91bGRMb2NrZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGlmIChzdGF0ZVRva2VuID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2xheWVyU2hvdWxkVmlzaWJsZSA9ICFzdGF0ZS5pc1Zpc2libGU7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlVG9rZW4gPT09IDEpIHtcbiAgICAgICAgdGhpcy5fbGF5ZXJTaG91bGRMb2NrZWQgPSAhc3RhdGUuaXNMb2NrZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlbFRhZ05hbWUgPT09ICdsaScpIHtcbiAgICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcbiAgICAgIHZhciBlbEJvdW5kID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIHRoaXMuX2RyYWdnZWQgPSBlbC5pZDtcbiAgICAgIHRoaXMuX2RyYWdnZWRQYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50O1xuICAgICAgdGhpcy5fb2Zmc2V0ID0ge1xuICAgICAgICB4OiBlLmNsaWVudFggLSBlbEJvdW5kLmxlZnQsXG4gICAgICAgIHk6IGUuY2xpZW50WSAtIGVsQm91bmQudG9wXG4gICAgICB9O1xuICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZSk7XG5cbiAgICAgIGFjdGlvbi5zdGFydERyYWdMYXllcihsYXllclRva2VuKTtcbiAgICB9XG4gIH0sXG5cbiAgX29uTGF5ZXJNb3VzZVVwOiBmdW5jdGlvbihsYXllclRva2VuLCBlKSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHZhciBlbFRhZ05hbWUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGVsUGFyZW50ID0gZWwucGFyZW50Tm9kZTtcblxuICAgIGlmIChlbFRhZ05hbWUgPT09ICdpbnB1dCcpIHtcbiAgICAgIGlmIChlbCA9PT0gdGhpcy5fdG9nZ2xlZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLl90b2dnbGVkKSB7XG4gICAgICAgIHZhciBzdGF0ZVRva2VuID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChlbFBhcmVudC5jaGlsZE5vZGVzLCBlbCk7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUuc3RvcmUuZ2V0TGF5ZXJTdGF0ZShsYXllclRva2VuKTtcblxuICAgICAgICBpZiAoc3RhdGVUb2tlbiA9PT0gMCkge1xuICAgICAgICAgIGFjdGlvbi5zZXRMYXllclN0YXRlKGxheWVyVG9rZW4sICFzdGF0ZS5pc1Zpc2libGUsIHVuZGVmaW5lZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGVUb2tlbiA9PT0gMSkge1xuICAgICAgICAgIGFjdGlvbi5zZXRMYXllclN0YXRlKGxheWVyVG9rZW4sIHVuZGVmaW5lZCwgIXN0YXRlLmlzTG9ja2VkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBfb25MYXllck1vdXNlT3Zlck91dDogZnVuY3Rpb24obGF5ZXJUb2tlbiwgZSkge1xuICAgIGlmICh0aGlzLl90b2dnbGVkKSB7XG4gICAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICAgIHRoaXMuX3RvZ2dsZWQuYmx1cigpO1xuXG4gICAgICBhY3Rpb24uc2V0TGF5ZXJTdGF0ZShsYXllclRva2VuLCB0aGlzLl9sYXllclNob3VsZFZpc2libGUsIHRoaXMuX2xheWVyU2hvdWxkTG9ja2VkKTtcbiAgICB9XG4gIH0sXG5cbiAgX29uQ29udGFpbmVyTW91c2VVcDogZnVuY3Rpb24oZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcblxuICAgIGlmICh0aGlzLl9kcmFnZ2VkKSB7XG4gICAgICBhY3Rpb24uc3RvcERyYWdMYXllcigpO1xuICAgIH1cblxuICAgIHRoaXMuX3Bvc2l0aW9uID0gZmFsc2U7XG4gICAgdGhpcy5fb2Zmc2V0ID0gZmFsc2U7XG4gICAgdGhpcy5fZHJhZ2dlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2RyYWdnZWRQYXJlbnQgPSBmYWxzZTtcbiAgICB0aGlzLl90b2dnbGVkID0gZmFsc2U7XG4gIH0sXG5cbiAgX29uQ29udGFpbmVyTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLl9kcmFnZ2VkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG4gICAgdmFyIGxheWVycyA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbCh0aGlzLl9kcmFnZ2VkUGFyZW50LmNoaWxkcmVuLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5pZCAhPT0gJyRwbGFjZWhvbGRlcic7XG4gICAgfSk7XG5cbiAgICBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihub2RlLCBpKSB7XG4gICAgICBpZiAobm9kZS5pZCAhPT0gc2VsZi5fZHJhZ2dlZCkge1xuICAgICAgICB2YXIgc2libGluZ0JvdW5kID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBpZiAoZS5jbGllbnRZID4gc2libGluZ0JvdW5kLnRvcCAmJlxuICAgICAgICAgICAgZS5jbGllbnRZIDwgc2libGluZ0JvdW5kLmJvdHRvbSkge1xuXG4gICAgICAgICAgYWN0aW9uLm1vdmVEcmFnZ2VkTGF5ZXIoaSk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihlKTtcbiAgfSxcblxuICBfdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcEJvdW5kID0gdGhpcy5fZHJhZ2dlZFBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHRoaXMuX3Bvc2l0aW9uID0ge1xuICAgICAgLy8gbGVmdDogZS5jbGllbnRYIC0gcEJvdW5kLmxlZnQgLSB0aGlzLl9vZmZzZXQueCxcbiAgICAgIGxlZnQ6IDUsXG4gICAgICB0b3A6IGUuY2xpZW50WSAtIHBCb3VuZC50b3AgLSB0aGlzLl9vZmZzZXQueVxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZvcmNlZFVwZGF0ZTogRGF0ZS5ub3coKVxuICAgIH0pO1xuICB9LFxuXG4gIF9pc0FsbFZpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmxheWVycy5ldmVyeShmdW5jdGlvbihsYXllcikge1xuICAgICAgcmV0dXJuIGxheWVyLmlkID09PSAnJHBsYWNlaG9sZGVyJyB8fCBsYXllci5pc1Zpc2libGUgPT09IHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2lzQWxsTG9ja2VkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sYXllcnMuZXZlcnkoZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgIHJldHVybiBsYXllci5pZCA9PT0gJyRwbGFjZWhvbGRlcicgfHwgbGF5ZXIuaXNMb2NrZWQgPT09IHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3RvZ2dsZUFsbFZpc2libGU6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICBhY3Rpb24uc2V0QWxsTGF5ZXJTdGF0ZSghdGhpcy5faXNBbGxWaXNpYmxlKCksIHVuZGVmaW5lZCk7XG4gIH0sXG5cbiAgX3RvZ2dsZUFsbExvY2tlZDogZnVuY3Rpb24oZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcblxuICAgIGFjdGlvbi5zZXRBbGxMYXllclN0YXRlKHVuZGVmaW5lZCwgIXRoaXMuX2lzQWxsTG9ja2VkKCkpO1xuICB9LFxuXG4gIF9vblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxheWVyczogdGhpcy5zdGF0ZS5zdG9yZS5nZXRBbGwoKSxcbiAgICB9KTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXllcnNQYW5lbDtcbiJdfQ==
