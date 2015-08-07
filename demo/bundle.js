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
  // TODO: Use immutable data to make reconciliation faster.
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

  NORMAL: 'ui-layer',
  DRAGGED: 'ui-dragged-layer',

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
    isLocked: React.PropTypes.bool,
    isDragged: React.PropTypes.bool
  },

  render: function() {
    return (
      React.createElement("li", {id: this.props.id, 
          className: this._layerCss(), 
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

  _layerCss: function() {
    return this.props.isDragged ? CSS.NORMAL + ' ' + CSS.DRAGGED : CSS.NORMAL;
  },

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
var Immutable = typeof window === 'object' ? window.Immutable : require('immutable');
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
      draggedPos: false
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
                  isDragged: layer.isDragged, 
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

  // _position: false,

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
    } else if (store.getLayerState(token).isDragged && this.state.draggedPos) {
      style = {
        position: 'absolute',
        zIndex: '100',
        left: this.state.draggedPos.get('left') + 'px',
        top: this.state.draggedPos.get('top') + 'px'
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
      this.setState({
        draggedPos: false
      });
      action.stopDragLayer();
    }

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
    var newPos = this.state.draggedPos || Immutable.Map({left: 0, top: 0});

    newPos = newPos
      .set('left', 5)
      .set('top', e.clientY - pBound.top - this._offset.y);

    this.setState({
      draggedPos: newPos
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

},{"../actions/LayerAction":10,"../stores/LayerStore":12,"./LayerItem":13,"immutable":"immutable","react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL2RlbW8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvbGliL0Rpc3BhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvZmx1eC9saWIvaW52YXJpYW50LmpzIiwiL1VzZXJzL2JveXcxNjUvX0NPREUvbGFiLWpzL3JlYWN0LXVpLWxheWVycy1wYW5lbC9zcmMvYWN0aW9ucy9MYXllckFjdGlvbi5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL2NyZWF0ZUxheWVyU3RvcmUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL3NyYy9zdG9yZXMvTGF5ZXJTdG9yZS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVySXRlbS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVyc1BhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsY0FBYztBQUNkLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVztBQUM3QixFQUFFLElBQUksS0FBSyxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFM0UsRUFBRSxJQUFJLHNDQUFzQyxnQ0FBQTs7SUFFeEMsZUFBZSxFQUFFLFdBQVc7TUFDMUIsT0FBTztRQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLO1FBQzdCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO09BQ3hDLENBQUM7QUFDUixLQUFLOztJQUVELGlCQUFpQixFQUFFLFdBQVc7TUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNuRCxLQUFLOztJQUVELG9CQUFvQixFQUFFLFdBQVc7TUFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyRCxLQUFLOztJQUVELE1BQU0sRUFBRSxXQUFXO01BQ2pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztNQUNoQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLEVBQUUsQ0FBQyxFQUFFO1FBQ3BELElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtVQUNkLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzNDLFVBQVUsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7O1VBRWpDLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLElBQUksQ0FBQyxLQUFLO2NBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO2lCQUN0QjtjQUNILElBQUksQ0FBQyxLQUFLLEdBQUc7Z0JBQ1gsT0FBTyxFQUFFLEdBQUc7ZUFDYjthQUNGO1dBQ0YsTUFBTTtZQUNMLElBQUksSUFBSSxDQUFDLEtBQUs7Y0FDWixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7aUJBQ3BCO2NBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRztnQkFDWCxPQUFPLEVBQUUsQ0FBQztlQUNYO2FBQ0Y7QUFDYixXQUFXOztVQUVELE9BQU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUQsTUFBTTtVQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7QUFDVCxPQUFPLENBQUMsQ0FBQzs7TUFFSDtRQUNFLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsT0FBUSxDQUFBLEVBQUE7VUFDckIsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQSxZQUFlLENBQUEsRUFBQTtVQUNsQixNQUFPO1FBQ0osQ0FBQTtRQUNOO0FBQ1IsS0FBSzs7SUFFRCxjQUFjLEVBQUUsV0FBVztNQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ1osTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtPQUNsQyxDQUFDLENBQUM7S0FDSjtBQUNMLEdBQUcsQ0FBQyxDQUFDOztFQUVILElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3hELEVBQUUsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUM1RDs7RUFFRSxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNqQzs7RUFFRSxNQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDbEMsRUFBRSxNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7O0VBRWxDLEtBQUssQ0FBQyxNQUFNO0lBQ1Ysb0JBQUMsZ0JBQWdCLEVBQUEsQ0FBQSxDQUFDLEtBQUEsRUFBSyxDQUFFLEtBQU0sQ0FBRSxDQUFBO0lBQ2pDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDO0FBQzVDLEdBQUcsQ0FBQzs7RUFFRixLQUFLLENBQUMsTUFBTTtJQUNWLG9CQUFDLFdBQVcsRUFBQSxDQUFBLENBQUMsS0FBQSxFQUFLLENBQUUsS0FBTSxDQUFFLENBQUE7SUFDNUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQztBQUNuRCxHQUFHLENBQUM7QUFDSjs7RUFFRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7RUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUMvQixJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7SUFFN0MsTUFBTSxDQUFDLElBQUksQ0FBQztNQUNWLFNBQVMsRUFBRSxJQUFJO01BQ2YsUUFBUSxFQUFFLEtBQUs7TUFDZixJQUFJLEVBQUU7UUFDSixFQUFFLEVBQUUsU0FBUyxHQUFHLENBQUM7UUFDakIsT0FBTyxFQUFFLEtBQUs7UUFDZCxVQUFVLEVBQUU7VUFDVixLQUFLLEVBQUU7WUFDTCxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUk7V0FDaEI7U0FDRjtPQUNGO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7QUFDSCxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlDOztFQUVFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxZQUFZLEVBQUU7SUFDcEMsVUFBVSxDQUFDLFdBQVc7TUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUNuQixHQUFHLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBQ3hCLE9BQU8sRUFBRSxnREFBZ0Q7UUFDekQsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsR0FBRztRQUNiLEtBQUssRUFBRSxJQUFJO09BQ1osRUFBRTtRQUNELEdBQUcsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUM7UUFDL0IsT0FBTyxFQUFFLCtDQUErQztRQUN4RCxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxHQUFHO1FBQ2IsS0FBSyxFQUFFLElBQUk7T0FDWixFQUFFO1FBQ0QsR0FBRyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsT0FBTyxFQUFFLG9DQUFvQztRQUM3QyxNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRSxHQUFHO1FBQ2IsS0FBSyxFQUFFLElBQUk7T0FDWixFQUFFO1FBQ0QsR0FBRyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixPQUFPLEVBQUUsd0NBQXdDO1FBQ2pELE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFLEdBQUc7UUFDYixLQUFLLEVBQUUsSUFBSTtPQUNaLEVBQUU7UUFDRCxHQUFHLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sRUFBRSx3REFBd0Q7UUFDakUsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUUsR0FBRztRQUNiLEtBQUssRUFBRSxJQUFJO09BQ1osQ0FBQyxFQUFFO1FBQ0YsZUFBZSxFQUFFLEtBQUs7QUFDOUIsT0FBTyxDQUFDLENBQUM7O01BRUgsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25CLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFWixJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0lBRXRCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoRCxRQUFRLENBQUMsTUFBTSxHQUFHLFlBQVksR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLFNBQVMsQ0FBQztHQUMvRTtDQUNGLENBQUMsQ0FBQzs7O0FDMUpIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUM7O0FBRTVDLFNBQVMsS0FBSyxHQUFHO0VBQ2YsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5RSxDQUFDOztBQUVELFNBQVMsV0FBVyxDQUFDLFVBQVUsRUFBRTtFQUMvQixJQUFJLEVBQUUsVUFBVSxZ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QUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDN0QsR0FBRzs7RUFFRCxjQUFjLEVBQUUsV0FBVztJQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDO01BQ1osTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtLQUNsQyxDQUFDLENBQUM7QUFDUCxHQUFHOztBQUVILENBQUMsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIE1haW4gZW50cnkuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgdmFyIFJlYWN0ID0gdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgPyB3aW5kb3cuUmVhY3QgOiByZXF1aXJlKCdyZWFjdCcpO1xuXG4gIHZhciBTb21lTGF5ZXJzQ2FudmFzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0b3JlOiB0aGlzLnByb3BzLnN0b3JlLnN0b3JlLFxuICAgICAgICBsYXllcnM6IHRoaXMucHJvcHMuc3RvcmUuc3RvcmUuZ2V0QWxsKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RhdGUuc3RvcmUubGlzdGVuKHRoaXMuX29uU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0YXRlLnN0b3JlLnVubGlzdGVuKHRoaXMuX29uU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuc3RhdGUubGF5ZXJzLm1hcChmdW5jdGlvbihsYXllciwgaSkge1xuICAgICAgICBpZiAobGF5ZXIuZGF0YSkge1xuICAgICAgICAgIHZhciB0YWdOYW1lID0gbGF5ZXIuZGF0YS50YWdOYW1lO1xuICAgICAgICAgIHZhciBhdHRyID0gbGF5ZXIuZGF0YS5hdHRyaWJ1dGVzO1xuXG4gICAgICAgICAgaWYgKGxheWVyLmlzVmlzaWJsZSkge1xuICAgICAgICAgICAgaWYgKGF0dHIuc3R5bGUpXG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUub3BhY2l0eSA9IDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBhdHRyLnN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEwMFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhdHRyLnN0eWxlKVxuICAgICAgICAgICAgICBhdHRyLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgYXR0ciwgbGF5ZXIuZGF0YS5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY2hhcnQnPlxuICAgICAgICAgIDxoMT5ESVYgTGF5ZXJzPC9oMT5cbiAgICAgICAgICB7bGF5ZXJzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9vblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsYXllcnM6IHRoaXMuc3RhdGUuc3RvcmUuZ2V0QWxsKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIExheWVyc1BhbmVsID0gcmVxdWlyZSgnLi4vc3JjL3ZpZXdzL0xheWVyc1BhbmVsJyk7XG4gIHZhciBjcmVhdGVMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3JjL2NyZWF0ZUxheWVyU3RvcmUnKTtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzdG9yZS5cbiAgdmFyIHN0b3JlID0gY3JlYXRlTGF5ZXJTdG9yZSgpO1xuICB2YXIgc3RvcmVBY3Rpb24gPSBzdG9yZS5hY3Rpb247XG5cbiAgLy8gRGVidWcsIHlvdSBjb3VsZCBlbnRlciBcImxheWVyU3RvcmUuZ2V0QWxsKClcIiB0byBzZWUgbGF5ZXJzLlxuICB3aW5kb3cubGF5ZXJTdG9yZSA9IHN0b3JlLnN0b3JlO1xuICB3aW5kb3cubGF5ZXJBY3Rpb24gPSBzdG9yZS5hY3Rpb247XG5cbiAgUmVhY3QucmVuZGVyKFxuICAgIDxTb21lTGF5ZXJzQ2FudmFzIHN0b3JlPXtzdG9yZX0vPixcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQtZXhhbXBsZScpXG4gICk7XG5cbiAgUmVhY3QucmVuZGVyKFxuICAgIDxMYXllcnNQYW5lbCBzdG9yZT17c3RvcmV9Lz4sXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVycy1wYW5lbC1leGFtcGxlJylcbiAgKTtcblxuICAvLyBBZGQgc29tZXRoaW5nIGludG8gdGhlIHN0b3JlLlxuICB2YXIgbGF5ZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7ICsraSkge1xuICAgIHZhciBuID0gTWF0aC5mbG9vcig1MCArIDM5OSAqIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgbGF5ZXJzLnB1c2goe1xuICAgICAgaXNWaXNpYmxlOiB0cnVlLFxuICAgICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpZDogJ29iamVjdCAnICsgaSxcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgd2lkdGg6IG4gKyAncHgnXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGxheWVyQWN0aW9uLmluc2VydExheWVycyh1bmRlZmluZWQsIGxheWVycyk7XG5cbiAgLy8gVHV0b3JpYWwuXG4gIGlmIChkb2N1bWVudC5jb29raWUgIT09ICdkZW1vPWZhbHNlJykge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdHJpcCA9IG5ldyBUcmlwKFt7XG4gICAgICAgIHNlbDogJCgnI2NoYXJ0LWV4YW1wbGUnKSxcbiAgICAgICAgY29udGVudDogJ0Fzc3VtZSB0aGlzIGlzIHRoZSBzZWxlY3Rpb24gb2YgeW91ciBncmFwaGljcy4nLFxuICAgICAgICBleHBvc2U6IHRydWUsXG4gICAgICAgIHBvc2l0aW9uOiAnZScsXG4gICAgICAgIGRlbGF5OiAzMDAwXG4gICAgICB9LCB7XG4gICAgICAgIHNlbDogJCgnI2xheWVycy1wYW5lbC1leGFtcGxlJyksXG4gICAgICAgIGNvbnRlbnQ6ICdBbmQgdGhpcyBpcyB0aGUgUGhvdG9zaG9wLWxpa2VkIGxheWVycyBwYW5lbC4nLFxuICAgICAgICBleHBvc2U6IHRydWUsXG4gICAgICAgIHBvc2l0aW9uOiAndycsXG4gICAgICAgIGRlbGF5OiAzMDAwXG4gICAgICB9LCB7XG4gICAgICAgIHNlbDogJCgnLnVpLWxheWVyJylbMF0sXG4gICAgICAgIGNvbnRlbnQ6ICdEcmFnIHRoZSBsYXllciB0byBhbHRlciB0aGUgb3JkZXIuJyxcbiAgICAgICAgZXhwb3NlOiB0cnVlLFxuICAgICAgICBwb3NpdGlvbjogJ3cnLFxuICAgICAgICBkZWxheTogMzAwMFxuICAgICAgfSwge1xuICAgICAgICBzZWw6ICQoJy51aS1sYXllci12aXNpYmxlJylbMV0sXG4gICAgICAgIGNvbnRlbnQ6ICdDbGljayB0byBjaGVjay91bmNoZWNrIHRoZSB2aXNpYmlsaXR5LicsXG4gICAgICAgIGV4cG9zZTogdHJ1ZSxcbiAgICAgICAgcG9zaXRpb246ICd3JyxcbiAgICAgICAgZGVsYXk6IDMwMDBcbiAgICAgIH0sIHtcbiAgICAgICAgc2VsOiAkKCcudWktbGF5ZXItdmlzaWJsZScpWzFdLFxuICAgICAgICBjb250ZW50OiAnT3Igc2Nyb2xsIHRoZSBtb3VzZSB0byBjaGVjay91bmNoZWNrIG90aGVycyB2aXNpYmxpdHkuJyxcbiAgICAgICAgZXhwb3NlOiB0cnVlLFxuICAgICAgICBwb3NpdGlvbjogJ3cnLFxuICAgICAgICBkZWxheTogMzAwMFxuICAgICAgfV0sIHtcbiAgICAgICAgZW5hYmxlQW5pbWF0aW9uOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIHRyaXAuc3RhcnQoKTtcbiAgICB9LCA1MDApO1xuXG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKDMwICogNjAgKiAxMDAwKSk7XG4gICAgZG9jdW1lbnQuY29va2llID0gJ2RlbW89ZmFsc2UnICsgJztleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCkgKyAnO3BhdGg9Lyc7XG4gIH1cbn0pO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC0yMDE1LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuRGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4vbGliL0Rpc3BhdGNoZXInKVxuIiwiLypcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBEaXNwYXRjaGVyXG4gKiBAdHlwZWNoZWNrc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnLi9pbnZhcmlhbnQnKTtcblxudmFyIF9sYXN0SUQgPSAxO1xudmFyIF9wcmVmaXggPSAnSURfJztcblxuLyoqXG4gKiBEaXNwYXRjaGVyIGlzIHVzZWQgdG8gYnJvYWRjYXN0IHBheWxvYWRzIHRvIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLiBUaGlzIGlzXG4gKiBkaWZmZXJlbnQgZnJvbSBnZW5lcmljIHB1Yi1zdWIgc3lzdGVtcyBpbiB0d28gd2F5czpcbiAqXG4gKiAgIDEpIENhbGxiYWNrcyBhcmUgbm90IHN1YnNjcmliZWQgdG8gcGFydGljdWxhciBldmVudHMuIEV2ZXJ5IHBheWxvYWQgaXNcbiAqICAgICAgZGlzcGF0Y2hlZCB0byBldmVyeSByZWdpc3RlcmVkIGNhbGxiYWNrLlxuICogICAyKSBDYWxsYmFja3MgY2FuIGJlIGRlZmVycmVkIGluIHdob2xlIG9yIHBhcnQgdW50aWwgb3RoZXIgY2FsbGJhY2tzIGhhdmVcbiAqICAgICAgYmVlbiBleGVjdXRlZC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhpcyBoeXBvdGhldGljYWwgZmxpZ2h0IGRlc3RpbmF0aW9uIGZvcm0sIHdoaWNoXG4gKiBzZWxlY3RzIGEgZGVmYXVsdCBjaXR5IHdoZW4gYSBjb3VudHJ5IGlzIHNlbGVjdGVkOlxuICpcbiAqICAgdmFyIGZsaWdodERpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY291bnRyeSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ291bnRyeVN0b3JlID0ge2NvdW50cnk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2Ygd2hpY2ggY2l0eSBpcyBzZWxlY3RlZFxuICogICB2YXIgQ2l0eVN0b3JlID0ge2NpdHk6IG51bGx9O1xuICpcbiAqICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIGJhc2UgZmxpZ2h0IHByaWNlIG9mIHRoZSBzZWxlY3RlZCBjaXR5XG4gKiAgIHZhciBGbGlnaHRQcmljZVN0b3JlID0ge3ByaWNlOiBudWxsfVxuICpcbiAqIFdoZW4gYSB1c2VyIGNoYW5nZXMgdGhlIHNlbGVjdGVkIGNpdHksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NpdHktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENpdHk6ICdwYXJpcydcbiAqICAgfSk7XG4gKlxuICogVGhpcyBwYXlsb2FkIGlzIGRpZ2VzdGVkIGJ5IGBDaXR5U3RvcmVgOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihwYXlsb2FkKSB7XG4gKiAgICAgaWYgKHBheWxvYWQuYWN0aW9uVHlwZSA9PT0gJ2NpdHktdXBkYXRlJykge1xuICogICAgICAgQ2l0eVN0b3JlLmNpdHkgPSBwYXlsb2FkLnNlbGVjdGVkQ2l0eTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhIGNvdW50cnksIHdlIGRpc3BhdGNoIHRoZSBwYXlsb2FkOlxuICpcbiAqICAgZmxpZ2h0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gKiAgICAgYWN0aW9uVHlwZTogJ2NvdW50cnktdXBkYXRlJyxcbiAqICAgICBzZWxlY3RlZENvdW50cnk6ICdhdXN0cmFsaWEnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBib3RoIHN0b3JlczpcbiAqXG4gKiAgICBDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIENvdW50cnlTdG9yZS5jb3VudHJ5ID0gcGF5bG9hZC5zZWxlY3RlZENvdW50cnk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSBjYWxsYmFjayB0byB1cGRhdGUgYENvdW50cnlTdG9yZWAgaXMgcmVnaXN0ZXJlZCwgd2Ugc2F2ZSBhIHJlZmVyZW5jZVxuICogdG8gdGhlIHJldHVybmVkIHRva2VuLiBVc2luZyB0aGlzIHRva2VuIHdpdGggYHdhaXRGb3IoKWAsIHdlIGNhbiBndWFyYW50ZWVcbiAqIHRoYXQgYENvdW50cnlTdG9yZWAgaXMgdXBkYXRlZCBiZWZvcmUgdGhlIGNhbGxiYWNrIHRoYXQgdXBkYXRlcyBgQ2l0eVN0b3JlYFxuICogbmVlZHMgdG8gcXVlcnkgaXRzIGRhdGEuXG4gKlxuICogICBDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgbWF5IG5vdCBiZSB1cGRhdGVkLlxuICogICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBpcyBub3cgZ3VhcmFudGVlZCB0byBiZSB1cGRhdGVkLlxuICpcbiAqICAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjaXR5IGZvciB0aGUgbmV3IGNvdW50cnlcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gZ2V0RGVmYXVsdENpdHlGb3JDb3VudHJ5KENvdW50cnlTdG9yZS5jb3VudHJ5KTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSB1c2FnZSBvZiBgd2FpdEZvcigpYCBjYW4gYmUgY2hhaW5lZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogICBGbGlnaHRQcmljZVN0b3JlLmRpc3BhdGNoVG9rZW4gPVxuICogICAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAqICAgICAgICAgY2FzZSAnY291bnRyeS11cGRhdGUnOlxuICogICAgICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIGdldEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqXG4gKiAgICAgICAgIGNhc2UgJ2NpdHktdXBkYXRlJzpcbiAqICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlLnByaWNlID1cbiAqICAgICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUoQ291bnRyeVN0b3JlLmNvdW50cnksIENpdHlTdG9yZS5jaXR5KTtcbiAqICAgICAgICAgICBicmVhaztcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSBgY291bnRyeS11cGRhdGVgIHBheWxvYWQgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGludm9rZSB0aGUgc3RvcmVzJ1xuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MgaW4gb3JkZXI6IGBDb3VudHJ5U3RvcmVgLCBgQ2l0eVN0b3JlYCwgdGhlblxuICogYEZsaWdodFByaWNlU3RvcmVgLlxuICovXG5cbiAgZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWQgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBpbnZva2VkIHdpdGggZXZlcnkgZGlzcGF0Y2hlZCBwYXlsb2FkLiBSZXR1cm5zXG4gICAqIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIGB3YWl0Rm9yKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5yZWdpc3Rlcj1mdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBpZCA9IF9wcmVmaXggKyBfbGFzdElEKys7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY2FsbGJhY2sgYmFzZWQgb24gaXRzIHRva2VuLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnVucmVnaXN0ZXI9ZnVuY3Rpb24oaWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF0sXG4gICAgICAnRGlzcGF0Y2hlci51bnJlZ2lzdGVyKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgaWRcbiAgICApO1xuICAgIGRlbGV0ZSB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrc1tpZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgY2FsbGJhY2tzIHNwZWNpZmllZCB0byBiZSBpbnZva2VkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBjYWxsYmFjay4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBhIGNhbGxiYWNrIGluXG4gICAqIHJlc3BvbnNlIHRvIGEgZGlzcGF0Y2hlZCBwYXlsb2FkLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5PHN0cmluZz59IGlkc1xuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUud2FpdEZvcj1mdW5jdGlvbihpZHMpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IE11c3QgYmUgaW52b2tlZCB3aGlsZSBkaXNwYXRjaGluZy4nXG4gICAgKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGlkID0gaWRzW2lpXTtcbiAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgaW52YXJpYW50KFxuICAgICAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSxcbiAgICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IENpcmN1bGFyIGRlcGVuZGVuY3kgZGV0ZWN0ZWQgd2hpbGUgJyArXG4gICAgICAgICAgJ3dhaXRpbmcgZm9yIGAlc2AuJyxcbiAgICAgICAgICBpZFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChcbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgICAnRGlzcGF0Y2hlci53YWl0Rm9yKC4uLik6IGAlc2AgZG9lcyBub3QgbWFwIHRvIGEgcmVnaXN0ZXJlZCBjYWxsYmFjay4nLFxuICAgICAgICBpZFxuICAgICAgKTtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2soaWQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIHBheWxvYWQgdG8gYWxsIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGF5bG9hZFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g9ZnVuY3Rpb24ocGF5bG9hZCkge1xuICAgIGludmFyaWFudChcbiAgICAgICF0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcsXG4gICAgICAnRGlzcGF0Y2guZGlzcGF0Y2goLi4uKTogQ2Fubm90IGRpc3BhdGNoIGluIHRoZSBtaWRkbGUgb2YgYSBkaXNwYXRjaC4nXG4gICAgKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3N0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGlkIGluIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzKSB7XG4gICAgICAgIGlmICh0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0pIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9zdG9wRGlzcGF0Y2hpbmcoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgRGlzcGF0Y2hlciBjdXJyZW50bHkgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5pc0Rpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIGNhbGxiYWNrIHN0b3JlZCB3aXRoIHRoZSBnaXZlbiBpZC4gQWxzbyBkbyBzb21lIGludGVybmFsXG4gICAqIGJvb2trZWVwaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjaz1mdW5jdGlvbihpZCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IHRydWU7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdKHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQpO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkW2lkXSA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB1cCBib29ra2VlcGluZyBuZWVkZWQgd2hlbiBkaXNwYXRjaGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgYm9va2tlZXBpbmcgdXNlZCBmb3IgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nPWZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBudWxsO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGlzcGF0Y2hlcjtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGludmFyaWFudFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24oY29uZGl0aW9uLCBmb3JtYXQsIGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgaWYgKGZhbHNlKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwidmFyIERpc3BhdGNoZXIgPSByZXF1aXJlKCdmbHV4JykuRGlzcGF0Y2hlcjtcblxuZnVuY3Rpb24gaWRHZW4oKSB7XG4gIHJldHVybiAoK0RhdGUubm93KCkgKyBNYXRoLmZsb29yKDB4MTAwMDAwMDAwICogTWF0aC5yYW5kb20oKSkpLnRvU3RyaW5nKDM2KTtcbn1cblxuZnVuY3Rpb24gTGF5ZXJBY3Rpb24oZGlzcGF0Y2hlcikge1xuICBpZiAoIShkaXNwYXRjaGVyIGluc3RhbmNlb2YgRGlzcGF0Y2hlcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdkaXNwYXRjaGVyIHVuZGVmaW5lZC4nKVxuICB9XG5cbiAgdGhpcy5fZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG59XG5cbkxheWVyQWN0aW9uLmlkID0gaWRHZW4oKTtcblxuTGF5ZXJBY3Rpb24udmVyaWZ5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBvYmouaWQgPT09IExheWVyQWN0aW9uLmlkO1xufVxuXG5MYXllckFjdGlvbi5TRVRfTEFZRVJfU1RBVEUgPSAwO1xuTGF5ZXJBY3Rpb24uU0VUX0FMTF9MQVlFUlNfU1RBVEUgPSAxO1xuTGF5ZXJBY3Rpb24uSU5TRVJUX0xBWUVSID0gMjtcbkxheWVyQWN0aW9uLkRFTEVURV9MQVlFUiA9IDM7XG5MYXllckFjdGlvbi5EVVBMSUNBVEVfTEFZRVIgPSA0O1xuTGF5ZXJBY3Rpb24uU1RBUlRfRFJBR19MQVlFUiA9IDU7XG5MYXllckFjdGlvbi5TVE9QX0RSQUdfTEFZRVIgPSA2O1xuTGF5ZXJBY3Rpb24uTU9WRV9EUkFHR0VEX0xBWUVSID0gNztcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLnNldExheWVyU3RhdGUgPSBmdW5jdGlvbih0b2tlbiwgaXNWaXNpYmxlLCBpc0xvY2tlZCkge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5TRVRfTEFZRVJfU1RBVEUsXG4gICAgdG9rZW46IHRva2VuLFxuICAgIGlzVmlzaWJsZTogaXNWaXNpYmxlLFxuICAgIGlzTG9ja2VkOiBpc0xvY2tlZFxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5zZXRBbGxMYXllclN0YXRlID0gZnVuY3Rpb24oaXNWaXNpYmxlLCBpc0xvY2tlZCkge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5TRVRfQUxMX0xBWUVSU19TVEFURSxcbiAgICBpc1Zpc2libGU6IGlzVmlzaWJsZSxcbiAgICBpc0xvY2tlZDogaXNMb2NrZWRcbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuaW5zZXJ0TGF5ZXIgPSBmdW5jdGlvbih0b2tlbiwgbGF5ZXIpIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uSU5TRVJUX0xBWUVSLFxuICAgIHRva2VuOiB0b2tlbixcbiAgICBsYXllcnM6IGxheWVyXG4gIH0pO1xufVxuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuaW5zZXJ0TGF5ZXJzID0gZnVuY3Rpb24odG9rZW4sIGxheWVycykge1xuICB0aGlzLmluc2VydExheWVyKHRva2VuLCBsYXllcnMpO1xufVxuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuZGVsZXRlTGF5ZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5ERUxFVEVfTEFZRVIsXG4gICAgdG9rZW46IHRva2VuXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLmR1cGxpY2F0ZUxheWVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uRFVQTElDQVRFX0xBWUVSLFxuICAgIHRva2VuOiB0b2tlblxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5zdGFydERyYWdMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLlNUQVJUX0RSQUdfTEFZRVIsXG4gICAgdG9rZW46IHRva2VuXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLnN0b3BEcmFnTGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uU1RPUF9EUkFHX0xBWUVSXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLm1vdmVEcmFnZ2VkTGF5ZXIgPSBmdW5jdGlvbih0bykge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5NT1ZFX0RSQUdHRURfTEFZRVIsXG4gICAgdG86IHRvXG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXllckFjdGlvbjtcbiIsInZhciBJbW11dGFibGUgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdy5JbW11dGFibGUgOiByZXF1aXJlKCdpbW11dGFibGUnKTtcbnZhciBMYXllclN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvTGF5ZXJTdG9yZScpO1xudmFyIExheWVyQWN0aW9uID0gcmVxdWlyZSgnLi9hY3Rpb25zL0xheWVyQWN0aW9uJyk7XG52YXIgTGF5ZXJEaXNwYXRjaGVyID0gcmVxdWlyZSgnZmx1eCcpLkRpc3BhdGNoZXI7XG5cbi8qKlxuICogQnVpbGQgdGhlIHN0b3JlLCBhY3Rpb24gYW5kIGRpc3BhdGNoZXIuXG4gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4tLS0tLS0tLS0tLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgLi0tLS0tLS0tLS0tLXwgIGFjdGlvbiAgfCA8LS0tLS0tLS0uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgJy0tLS0tLS0tLS0nICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAuLS0tLS0tLS0tLS4gICAgIC4tLS0tLS0tLS0tLS0tLS4gICAgIC4tLS0tLS0tLS0uICAgICAuLS0tLS0tLS0tLlxuICogfCAgYWN0aW9uICB8IC0tPiB8ICBkaXNwYXRjaGVyICB8IC0tPiB8ICBzdG9yZSAgfCAtLT4gfCAgdmlld3MgIHxcbiAqICctLS0tLS0tLS0tJyAgICAgJy0tLS0tLS0tLS0tLS0tJyAgICAgJy0tLS0tLS0tLScgICAgICctLS0tLS0tLS0nXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSB7aWQ6IHtTdHJpbmd9XG4gKiAgICAgICAgICAgICAgICAgICBzdG9yZToge0xheWVyU3RvcmV9LFxuICogICAgICAgICAgICAgICAgICAgYWN0aW9uOiB7TGF5ZXJBY3Rpb259fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVycykge1xuICB2YXIgZGlzcGF0Y2hlciA9IG5ldyBMYXllckRpc3BhdGNoZXIoKTtcbiAgdmFyIHN0b3JlID0gbmV3IExheWVyU3RvcmUobGF5ZXJzKTtcbiAgdmFyIGFjdGlvbiA9IG5ldyBMYXllckFjdGlvbihkaXNwYXRjaGVyKTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gRGlzcGF0Y2hlciBDYWxsYmFjayAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgdmFyIHNldExheWVyU3RhdGUgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09IExheWVyQWN0aW9uLlNFVF9MQVlFUl9TVEFURSkge1xuICAgICAgY29uc29sZS5sb2coMTExMTEsIGFjdGlvbik7XG4gICAgICB2YXIgdG9rZW4gPSBhY3Rpb24udG9rZW47XG4gICAgICB2YXIgaXNWaXNpYmxlID0gYWN0aW9uLmlzVmlzaWJsZTtcbiAgICAgIHZhciBpc0xvY2tlZCA9IGFjdGlvbi5pc0xvY2tlZDtcblxuICAgICAgaWYgKHN0b3JlLnNldExheWVyU3RhdGUodG9rZW4sIGlzVmlzaWJsZSwgaXNMb2NrZWQsIHVuZGVmaW5lZCkpIHtcbiAgICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgc2V0QWxsTGF5ZXJzU3RhdGUgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09IExheWVyQWN0aW9uLlNFVF9BTExfTEFZRVJTX1NUQVRFKSB7XG4gICAgICB2YXIgaXNWaXNpYmxlID0gYWN0aW9uLmlzVmlzaWJsZTtcbiAgICAgIHZhciBpc0xvY2tlZCA9IGFjdGlvbi5pc0xvY2tlZDtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBzdG9yZS5sZW5ndGgoKTsgaSA8IGo7ICsraSkge1xuICAgICAgICBzdG9yZS5zZXRMYXllclN0YXRlKGksIGlzVmlzaWJsZSwgaXNMb2NrZWQsIHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbnNlcnRMYXllciA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uSU5TRVJUX0xBWUVSKSB7XG4gICAgICB2YXIgaXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB2YXIgdG9rZW4gPSBhY3Rpb24udG9rZW47XG4gICAgICB2YXIgbGF5ZXJzID0gYWN0aW9uLmxheWVycztcblxuICAgICAgaWYgKGxheWVycyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGlzQ2hhbmdlZCA9IHN0b3JlLmluc2VydExheWVycyh0b2tlbiwgbGF5ZXJzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsYXllciA9IGxheWVycztcbiAgICAgICAgaXNDaGFuZ2VkID0gc3RvcmUuaW5zZXJ0TGF5ZXIodG9rZW4sIGxheWVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQ2hhbmdlZCkgc3RvcmUucHVibGlzaCgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZGVsZXRlTGF5ZXIgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09IExheWVyQWN0aW9uLkRFTEVURV9MQVlFUikge1xuICAgICAgdmFyIHRva2VuID0gYWN0aW9uLnRva2VuO1xuXG4gICAgICBpZiAoc3RvcmUucmVtb3ZlTGF5ZXIodG9rZW4pKSB7XG4gICAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIGR1cGxpY2F0ZUxheWVyID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSBMYXllckFjdGlvbi5EVVBMSUNBVEVfTEFZRVIpIHtcbiAgICAgIHZhciB0b2tlbiA9IGFjdGlvbi50b2tlbjtcblxuICAgICAgaWYgKHN0b3JlLmR1cGxpY2F0ZUxheWVyKHRva2VuKSkge1xuICAgICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBzdGFydERyYWdMYXllciA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uU1RBUlRfRFJBR19MQVlFUikge1xuICAgICAgdmFyIGRyYWdnZWRUb2tlbiA9IGFjdGlvbi50b2tlbjtcblxuICAgICAgc3RvcmUuc2V0TGF5ZXJTdGF0ZShkcmFnZ2VkVG9rZW4sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIHN0b3JlLmluc2VydFBsYWNlaG9sZGVyKGRyYWdnZWRUb2tlbiArIDEpO1xuICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgc3RvcERyYWdMYXllciA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uU1RPUF9EUkFHX0xBWUVSKSB7XG4gICAgICB2YXIgZHJhZ2dlZFRva2VuID0gc3RvcmUuZ2V0RHJhZ2dlZExheWVyVG9rZW5zKClbMF07XG4gICAgICB2YXIgcGxhY2Vob2xkZXJUb2tlbiA9IHN0b3JlLmdldFBsYWNlaG9sZGVyVG9rZW5zKClbMF07XG5cbiAgICAgIHN0b3JlLnNldExheWVyU3RhdGUoZHJhZ2dlZFRva2VuLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgc3RvcmUuZXhjaGFuZ2VMYXllcnMoZHJhZ2dlZFRva2VuLCBwbGFjZWhvbGRlclRva2VuKTtcbiAgICAgIHN0b3JlLnJlbW92ZVBsYWNlaG9sZGVycygpO1xuICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbW92ZURyYWdnZWRMYXllciA9IGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gTGF5ZXJBY3Rpb24uTU9WRV9EUkFHR0VEX0xBWUVSKSB7XG4gICAgICB2YXIgdG8gPSBhY3Rpb24udG87XG4gICAgICB2YXIgaXNDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIHN0b3JlLnJlbW92ZVBsYWNlaG9sZGVycygpO1xuXG4gICAgICB2YXIgZHJhZ2dlZFRva2VuID0gc3RvcmUuZ2V0RHJhZ2dlZExheWVyVG9rZW5zKClbMF07XG5cbiAgICAgIGlmICh0byAhPT0gZHJhZ2dlZFRva2VuKSB7XG4gICAgICAgIGlzQ2hhbmdlZCA9IHN0b3JlLmV4Y2hhbmdlTGF5ZXJzKGRyYWdnZWRUb2tlbiwgdG8pO1xuICAgICAgfVxuXG4gICAgICBkcmFnZ2VkVG9rZW4gPSBzdG9yZS5nZXREcmFnZ2VkTGF5ZXJUb2tlbnMoKVswXTtcbiAgICAgIHN0b3JlLmluc2VydFBsYWNlaG9sZGVyKGRyYWdnZWRUb2tlbiArIDEpO1xuXG4gICAgICBpZiAoaXNDaGFuZ2VkKSB7XG4gICAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnaXN0ZXIgY2FsbGJhY2sgdG8gaGFuZGxlIGFsbCB1cGRhdGVzLlxuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKHNldExheWVyU3RhdGUpO1xuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKHNldEFsbExheWVyc1N0YXRlKTtcbiAgZGlzcGF0Y2hlci5yZWdpc3RlcihpbnNlcnRMYXllcik7XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoZGVsZXRlTGF5ZXIpO1xuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKGR1cGxpY2F0ZUxheWVyKTtcbiAgZGlzcGF0Y2hlci5yZWdpc3RlcihzdGFydERyYWdMYXllcik7XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoc3RvcERyYWdMYXllcik7XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIobW92ZURyYWdnZWRMYXllcik7XG5cbiAgLy8gUmV0dXJuIG9ubHkgc3RvcmUgYW5kIGFjdGlvbi4gRGlzcGF0Y2hlciBpcyBoaWRkZW4gZm9yIHRoZSBvdXRzaWRlIHdvcmxkLlxuICByZXR1cm4ge1xuICAgIGlkOiAoK0RhdGUubm93KCkgKyBNYXRoLmZsb29yKDB4MTAwMDAwMDAwICogTWF0aC5yYW5kb20oKSkpLnRvU3RyaW5nKDM2KSxcbiAgICBzdG9yZTogc3RvcmUsXG4gICAgYWN0aW9uOiBhY3Rpb25cbiAgfTtcbn1cbiIsInZhciBJbW11dGFibGUgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdy5JbW11dGFibGUgOiByZXF1aXJlKCdpbW11dGFibGUnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xuXG52YXIgTEFZRVJfUFJPVE8gPSB7XG4gIGlkOiAnJHBsYWNlaG9sZGVyJyxcbiAgaXNWaXNpYmxlOiB0cnVlLFxuICBpc0xvY2tlZDogZmFsc2UsXG4gIGlzRHJhZ2dlZDogZmFsc2UsXG4gIGRhdGE6IHVuZGVmaW5lZFxufTtcblxuZnVuY3Rpb24gaWRHZW4oKSB7XG4gIHJldHVybiAoRGF0ZS5ub3coKSArIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAwMCAqIE1hdGgucmFuZG9tKCkpKS50b1N0cmluZygzNik7XG59XG5cbmZ1bmN0aW9uIGNvcHkob2JqKSB7XG4gIHZhciByZXQgPSB7fTtcblxuICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpXG4gICAgICByZXRba10gPSBvYmpba107XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIExheWVyU3RvcmUgaXMgdGhlIGRhdGEgbW9kdWxlLlxuICovXG5mdW5jdGlvbiBMYXllclN0b3JlKGxheWVycykge1xuICAvKipcbiAgICogQXJyYXkgb2YgbGF5ZXJzIG9iamVjdC4gRm9ybWF0IG9mIHNpbmdsZSBsYXllciBpcyBsaWtlLi4uXG4gICAqIHtcbiAgICogICBpZDoge1N0cmluZ30sXG4gICAqICAgaXNWaXNpYmxlOiB7Qm9vbH0sXG4gICAqICAgaXNMb2NrZWQ6IHtCb29sfSxcbiAgICogICBkYXRhOiB7PHN2Zz58PGltZz58U3RyaW5nfGlkfVxuICAgKiB9XG4gICAqL1xuICB0aGlzLl9sYXllcnMgPSBsYXllcnMgaW5zdGFuY2VvZiBBcnJheSA/XG4gICAgbGF5ZXJzLm1hcChmdW5jdGlvbihsYXllciwgaSkge1xuICAgICAgdmFyIHJldCA9IGNvcHkoTEFZRVJfUFJPVE8pO1xuXG4gICAgICByZXQuaWQgPSBpZEdlbigpO1xuICAgICAgcmV0LmlzVmlzaWJsZSA9IGxheWVyLmlzVmlzaWJsZSB8fCB0cnVlO1xuICAgICAgcmV0LmlzTG9ja2VkID0gbGF5ZXIuaXNMb2NrZWQgfHwgZmFsc2U7XG5cbiAgICAgIHJldHVybiByZXQ7O1xuICAgIH0pIDogW107XG59XG5cbnV0aWwuaW5oZXJpdHMoTGF5ZXJTdG9yZSwgZXZlbnRzLkV2ZW50RW1pdHRlcik7XG5cbkxheWVyU3RvcmUuaWQgPSAoK0RhdGUubm93KCkgKyBNYXRoLmZsb29yKDB4MTAwMDAwMDAwICogTWF0aC5yYW5kb20oKSkpLnRvU3RyaW5nKDM2KTtcblxuTGF5ZXJTdG9yZS52ZXJpZnkgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIG9iai5pZCA9PT0gTGF5ZXJTdG9yZS5pZDtcbn1cblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9sYXllcnMubGVuZ3RoO1xufVxuXG5MYXllclN0b3JlLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETzogVXNlIGltbXV0YWJsZSBkYXRhIHRvIG1ha2UgcmVjb25jaWxpYXRpb24gZmFzdGVyLlxuICByZXR1cm4gdGhpcy5fbGF5ZXJzLnNsaWNlKDApO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdGhpcy5hZGRMaXN0ZW5lcignY2hhbmdlJywgY2FsbGJhY2spO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUudW5saXN0ZW4gPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdCgnY2hhbmdlJyk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pc1BsYWNlaG9sZGVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgcmV0dXJuIHRoaXMuX2xheWVyc1t0b2tlbl0uaWQgPT09IExBWUVSX1BST1RPLmlkO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZHVwbGljYXRlTGF5ZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB2YXIgZHVwID0gY29weSh0aGlzLl9sYXllcnNbdG9rZW5dKTtcblxuICAgIGR1cC5pZCA9IGlkR2VuKCk7XG4gICAgZHVwLmlzRHJhZ2dlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4gKyAxLCAwLCBkdXApO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5leGNoYW5nZUxheWVycyA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGlmIChmcm9tID49IDAgJiYgZnJvbSA8IHRoaXMuX2xheWVycy5sZW5ndGggJiZcbiAgICAgIHRvID49IDAgJiYgdG8gPCB0aGlzLl9sYXllcnMubGVuZ3RoKSB7XG5cbiAgICB0aGlzLl9sYXllcnMuc3BsaWNlKHRvLCAwLCB0aGlzLl9sYXllcnMuc3BsaWNlKGZyb20sIDEpWzBdKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pbnNlcnRMYXllciA9IGZ1bmN0aW9uKHRva2VuLCBsYXllcikge1xuICB2YXIgbmV3TGF5ZXIgPSBjb3B5KExBWUVSX1BST1RPKTtcblxuICBuZXdMYXllci5pZCA9IGlkR2VuKCk7XG4gIG5ld0xheWVyLmlzVmlzaWJsZSA9IGxheWVyLmlzVmlzaWJsZSB8fCB0cnVlO1xuICBuZXdMYXllci5pc0xvY2tlZCA9IGxheWVyLmlzTG9ja2VkIHx8IGZhbHNlO1xuICBuZXdMYXllci5kYXRhID0gbGF5ZXIuZGF0YTtcblxuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB0aGlzLl9sYXllcnMuc3BsaWNlKHRva2VuICsgMSwgMCwgbmV3TGF5ZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xheWVycy5wdXNoKG5ld0xheWVyKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuaW5zZXJ0TGF5ZXJzID0gZnVuY3Rpb24odG9rZW4sIGxheWVycykge1xuICBpZiAoIShsYXllcnMgaW5zdGFuY2VvZiBBcnJheSkpIHJldHVybiBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gMCwgaiA9IGxheWVycy5sZW5ndGg7IGkgPCBqOyArK2kpIHtcbiAgICB0aGlzLmluc2VydExheWVyKHRva2VuICsgaSwgbGF5ZXJzW2ldKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuaW5zZXJ0UGxhY2Vob2xkZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICB0aGlzLl9sYXllcnMuc3BsaWNlKHRva2VuLCAwLCBMQVlFUl9QUk9UTyk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5yZW1vdmVMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4sIDEpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5yZW1vdmVQbGFjZWhvbGRlcnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fbGF5ZXJzID0gdGhpcy5fbGF5ZXJzLmZpbHRlcihmdW5jdGlvbihsYXllcikge1xuICAgIHJldHVybiBsYXllci5pZCAhPT0gTEFZRVJfUFJPVE8uaWQ7XG4gIH0pO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmdldERyYWdnZWRMYXllclRva2VucyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0ID0gW107XG5cbiAgdGhpcy5fbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obGF5ZXIsIGkpIHtcbiAgICBpZiAobGF5ZXIuaXNEcmFnZ2VkKSByZXQucHVzaChpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiBmYWxzZTtcbn1cblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZ2V0UGxhY2Vob2xkZXJUb2tlbnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIHRoaXMuX2xheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgaWYgKGxheWVyLmlkID09PSBMQVlFUl9QUk9UTy5pZCkgcmV0LnB1c2goaSk7XG4gIH0pO1xuXG4gIHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogZmFsc2U7XG59XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmdldExheWVyU3RhdGUgPSBmdW5jdGlvbih0b2tlbikge1xuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY29weSh0aGlzLl9sYXllcnNbdG9rZW5dKTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLnNldExheWVyU3RhdGUgPSBmdW5jdGlvbih0b2tlbiwgaXNWaXNpYmxlLCBpc0xvY2tlZCwgaXNEcmFnZ2VkKSB7XG4gIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcblxuICBpZiAodG9rZW4gPj0gMCAmJiB0b2tlbiA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcbiAgICB2YXIgbGF5ZXIgPSB0aGlzLl9sYXllcnNbdG9rZW5dO1xuXG4gICAgaWYgKGlzVmlzaWJsZSA9PT0gdHJ1ZSB8fCBpc1Zpc2libGUgPT09IGZhbHNlKSB7XG4gICAgICBsYXllci5pc1Zpc2libGUgPSBpc1Zpc2libGU7XG4gICAgfVxuICAgIGlmIChpc0xvY2tlZCA9PT0gdHJ1ZSB8fCBpc0xvY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGxheWVyLmlzTG9ja2VkID0gaXNMb2NrZWQ7XG4gICAgfVxuICAgIGlmIChpc0RyYWdnZWQgPT09IHRydWUgfHwgaXNEcmFnZ2VkID09PSBmYWxzZSkge1xuICAgICAgbGF5ZXIuaXNEcmFnZ2VkID0gaXNEcmFnZ2VkO1xuICAgIH1cblxuICAgIGlzQ2hhbmdlZCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gaXNDaGFuZ2VkO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUucHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0ciA9ICcnO1xuXG4gIHRoaXMuX2xheWVycy5mb3JFYWNoKGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgc3RyICs9IGxheWVyLmlkICsgJyAtPiAnO1xuICB9KTtcblxuICBjb25zb2xlLmxvZyhzdHIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyU3RvcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93LlJlYWN0IDogcmVxdWlyZSgncmVhY3QnKTtcbnZhciBMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL0xheWVyU3RvcmUnKTtcbnZhciBMYXllckFjdGlvbiA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTGF5ZXJBY3Rpb24nKTtcblxudmFyIENTUyA9IHtcblxuICBOT1JNQUw6ICd1aS1sYXllcicsXG4gIERSQUdHRUQ6ICd1aS1kcmFnZ2VkLWxheWVyJyxcblxuICBWSVNJQkxFOiAndWktbGF5ZXItdmlzaWJsZScsXG4gIElOVklTSUJMRTogJ3VpLWxheWVyLWludmlzaWJsZScsXG5cbiAgTE9DS0VEOiAndWktbGF5ZXItbG9ja2VkJyxcbiAgVU5MT0NLRUQ6ICd1aS1sYXllci11bmxvY2tlZCdcblxufTtcblxudmFyIExheWVySXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0b2tlbjogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBzdG9yZTogTGF5ZXJTdG9yZS52ZXJpZnksXG4gICAgYWN0aW9uOiBMYXllckFjdGlvbi52ZXJpZnksXG4gICAgaXNWaXNpYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBpc0xvY2tlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgaXNEcmFnZ2VkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBpZD17dGhpcy5wcm9wcy5pZH1cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuX2xheWVyQ3NzKCl9XG4gICAgICAgICAgc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9XG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMucHJvcHMub25Nb3VzZURvd259XG4gICAgICAgICAgb25Nb3VzZVVwPXt0aGlzLnByb3BzLm9uTW91c2VVcH0gPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPSdjaGVja2JveCdcbiAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmlzVmlzaWJsZX1cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuX3Zpc2libGVDc3MoKX1cbiAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5wcm9wcy5vbk1vdXNlT3Zlcn1cbiAgICAgICAgICBvbk1vdXNlT3V0PXt0aGlzLnByb3BzLm9uTW91c2VPdXR9IC8+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9J2NoZWNrYm94J1xuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuaXNMb2NrZWR9XG4gICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLl9sb2NrZWRDc3MoKX1cbiAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5wcm9wcy5vbk1vdXNlT3Zlcn1cbiAgICAgICAgICBvbk1vdXNlT3V0PXt0aGlzLnByb3BzLm9uTW91c2VPdXR9IC8+XG4gICAgICAgIDxzcGFuPnsnTGF5ZXI6ICcgKyB0aGlzLnByb3BzLmlkfTwvc3Bhbj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9kZWxldGVMYXllcn0+XG4gICAgICAgICAgZGVsZXRlXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2R1cGxpY2F0ZUxheWVyfT5cbiAgICAgICAgICBkdXBsaWNhdGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH0sXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFB1YmxpYyBGdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHJpdmF0ZSBGdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgX2xheWVyQ3NzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pc0RyYWdnZWQgPyBDU1MuTk9STUFMICsgJyAnICsgQ1NTLkRSQUdHRUQgOiBDU1MuTk9STUFMO1xuICB9LFxuXG4gIF92aXNpYmxlQ3NzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pc1Zpc2libGUgPyBDU1MuVklTSUJMRSA6IENTUy5JTlZJU0lCTEU7XG4gIH0sXG5cbiAgX2xvY2tlZENzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuaXNMb2NrZWQgPyBDU1MuTE9DS0VEIDogQ1NTLlVOTE9DS0VEO1xuICB9LFxuXG4gIF9kZWxldGVMYXllcjogZnVuY3Rpb24oZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnByb3BzLmFjdGlvbjtcblxuICAgIGFjdGlvbi5kZWxldGVMYXllcih0aGlzLnByb3BzLnRva2VuKTtcbiAgfSxcblxuICBfZHVwbGljYXRlTGF5ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5wcm9wcy5hY3Rpb247XG5cbiAgICBhY3Rpb24uZHVwbGljYXRlTGF5ZXIodGhpcy5wcm9wcy50b2tlbik7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJJdGVtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdy5SZWFjdCA6IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgSW1tdXRhYmxlID0gdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgPyB3aW5kb3cuSW1tdXRhYmxlIDogcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG52YXIgTGF5ZXJTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9MYXllclN0b3JlJyk7XG52YXIgTGF5ZXJBY3Rpb24gPSByZXF1aXJlKCcuLi9hY3Rpb25zL0xheWVyQWN0aW9uJyk7XG52YXIgTGF5ZXJJdGVtID0gcmVxdWlyZSgnLi9MYXllckl0ZW0nKTtcblxudmFyIExheWVyc1BhbmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHN0b3JlOiBMYXllclN0b3JlLnZlcmlmeSxcbiAgICBhY3Rpb246IExheWVyQWN0aW9uLnZlcmlmeSxcbiAgICBsYXllcnM6IFJlYWN0LlByb3BUeXBlcy5hcnJheVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogQHJldHVybiB7TGF5ZXJTdG9yZX0gaW5zdGFuY2Ugb2YgLi4vc3RvcmVzL0xheWVyU3RvcmUuanMsIHNob3VsZG4ndFxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAgbW9kaWZ5IGl0IGFmdGVyIGluaXRpYWxpemF0aW9uLlxuICAgICAgICovXG4gICAgICBzdG9yZTogdGhpcy5wcm9wcy5zdG9yZS5zdG9yZSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcmV0dXJuIHtMYXllckFjdGlvbn0gaW5zdGFuY2Ugb2YgLi4vYWN0aW9ucy9MYXllckFjdGlvbi5qcywgc2hvdWxkbid0XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZ5IGl0IGFmdGVyIGluaXRpYWxpemF0aW9uLlxuICAgICAgICovXG4gICAgICBhY3Rpb246IHRoaXMucHJvcHMuc3RvcmUuYWN0aW9uLFxuXG4gICAgICAvKipcbiAgICAgICAqIEByZXR1cm4ge0FycmF5fSBMYXllcnMgY29weSBnb3QgZnJvbSBzdG9yZSAobXV0YWJsZSkuXG4gICAgICAgKi9cbiAgICAgIGxheWVyczogdGhpcy5wcm9wcy5zdG9yZS5zdG9yZS5nZXRBbGwoKSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFyYnJpdHJhcnkgdHlwZS4gSXQgaXMgdXNlZCB0byBmb3JjZSBjb21wb25lbnQgdG8gcmVuZGVyLlxuICAgICAgICovXG4gICAgICBkcmFnZ2VkUG9zOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG5cbiAgICBzdG9yZS5saXN0ZW4odGhpcy5fb25TdG9yZUNoYW5nZSk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG5cbiAgICBzdG9yZS51bmxpc3Rlbih0aGlzLl9vblN0b3JlQ2hhbmdlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbGF5ZXJzID0gdGhpcy5zdGF0ZS5sYXllcnMubWFwKGZ1bmN0aW9uKGxheWVyLCBpKSB7XG4gICAgICB2YXIgc3RvcmUgPSBzZWxmLnN0YXRlLnN0b3JlO1xuXG4gICAgICByZXR1cm4gKDxMYXllckl0ZW1cbiAgICAgICAgICAgICAgICAgIGlkPXtsYXllci5pZH1cbiAgICAgICAgICAgICAgICAgIHRva2VuPXtpfVxuICAgICAgICAgICAgICAgICAgaXNWaXNpYmxlPXtsYXllci5pc1Zpc2libGV9XG4gICAgICAgICAgICAgICAgICBpc0xvY2tlZD17bGF5ZXIuaXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBpc0RyYWdnZWQ9e2xheWVyLmlzRHJhZ2dlZH1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXtzZWxmLl9sYXllcklubGluZVN0eWxlKGkpfVxuICAgICAgICAgICAgICAgICAgc3RvcmU9e3NlbGYuc3RhdGUuc3RvcmV9XG4gICAgICAgICAgICAgICAgICBhY3Rpb249e3NlbGYuc3RhdGUuYWN0aW9ufVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI9e3NlbGYuX29uTGF5ZXJNb3VzZU92ZXJPdXQuYmluZChzZWxmLCBpKX1cbiAgICAgICAgICAgICAgICAgIG9uTW91c2VPdXQ9e3NlbGYuX29uTGF5ZXJNb3VzZU92ZXJPdXQuYmluZChzZWxmLCBpKX1cbiAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXtzZWxmLl9vbkxheWVyTW91c2VEb3duLmJpbmQoc2VsZiwgaSl9XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlVXA9e3NlbGYuX29uTGF5ZXJNb3VzZVVwLmJpbmQoc2VsZiwgaSl9IC8+KTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ndWktbGF5ZXItcGFuZWwgdWktbm9zZWxlY3QnXG4gICAgICAgICAgIG9uTW91c2VVcD17dGhpcy5fb25Db250YWluZXJNb3VzZVVwfVxuICAgICAgICAgICBvbk1vdXNlTGVhdmU9e3RoaXMuX29uQ29udGFpbmVyTW91c2VVcH1cbiAgICAgICAgICAgb25Nb3VzZU1vdmU9e3RoaXMuX29uQ29udGFpbmVyTW91c2VNb3ZlfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J3VpLWxheWVyLWhlYWRlcic+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPSdjaGVja2JveCdcbiAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuX2lzQWxsVmlzaWJsZSgpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3RvZ2dsZUFsbFZpc2libGV9PlxuICAgICAgICAgICAgVG9nZ2xlIFZpc2libGVcbiAgICAgICAgICA8L2lucHV0PlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT0nY2hlY2tib3gnXG4gICAgICAgICAgICBjaGVja2VkPXt0aGlzLl9pc0FsbExvY2tlZCgpfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3RvZ2dsZUFsbExvY2tlZH0+XG4gICAgICAgICAgICBUb2dnbGUgTG9ja2VkXG4gICAgICAgICAgPC9pbnB1dD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9J3VpLWxheWVyLWNvbnRhaW5lcicgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJ319PlxuICAgICAgICAgIHtsYXllcnN9XG4gICAgICAgIDwvdWw+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICAgIC8vIDx1bCBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0+XG4gIH0sXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFB1YmxpYyBGdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBQcml2YXRlIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBfb2Zmc2V0OiBmYWxzZSxcblxuICAvLyBfcG9zaXRpb246IGZhbHNlLFxuXG4gIF9kcmFnZ2VkOiBmYWxzZSxcblxuICBfZHJhZ2dlZFBhcmVudDogZmFsc2UsXG5cbiAgX3RvZ2dsZWQ6IGZhbHNlLFxuXG4gIF9sYXllclNob3VsZFZpc2libGU6IHVuZGVmaW5lZCxcblxuICBfbGF5ZXJTaG91bGRMb2NrZWQ6IHVuZGVmaW5lZCxcblxuICBfbGF5ZXJJbmxpbmVTdHlsZTogZnVuY3Rpb24odG9rZW4pIHtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLnN0YXRlLnN0b3JlO1xuICAgIHZhciBzdHlsZSA9IG51bGw7XG5cbiAgICBpZiAoc3RvcmUuaXNQbGFjZWhvbGRlcih0b2tlbikpIHtcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICBvcGFjaXR5OiAnMCdcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChzdG9yZS5nZXRMYXllclN0YXRlKHRva2VuKS5pc0RyYWdnZWQgJiYgdGhpcy5zdGF0ZS5kcmFnZ2VkUG9zKSB7XG4gICAgICBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHpJbmRleDogJzEwMCcsXG4gICAgICAgIGxlZnQ6IHRoaXMuc3RhdGUuZHJhZ2dlZFBvcy5nZXQoJ2xlZnQnKSArICdweCcsXG4gICAgICAgIHRvcDogdGhpcy5zdGF0ZS5kcmFnZ2VkUG9zLmdldCgndG9wJykgKyAncHgnXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZTtcbiAgfSxcblxuICBfb25MYXllck1vdXNlRG93bjogZnVuY3Rpb24obGF5ZXJUb2tlbiwgZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHZhciBlbFRhZ05hbWUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGVsUGFyZW50ID0gZWwucGFyZW50Tm9kZTtcblxuICAgIGlmIChlbFRhZ05hbWUgPT09ICdpbnB1dCcpIHtcbiAgICAgIHZhciBzdGF0ZVRva2VuID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChlbFBhcmVudC5jaGlsZE5vZGVzLCBlbCk7XG4gICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnN0b3JlLmdldExheWVyU3RhdGUobGF5ZXJUb2tlbik7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZWQgPSBlbDtcbiAgICAgIHRoaXMuX2xheWVyU2hvdWxkVmlzaWJsZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2xheWVyU2hvdWxkTG9ja2VkID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoc3RhdGVUb2tlbiA9PT0gMCkge1xuICAgICAgICB0aGlzLl9sYXllclNob3VsZFZpc2libGUgPSAhc3RhdGUuaXNWaXNpYmxlO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZVRva2VuID09PSAxKSB7XG4gICAgICAgIHRoaXMuX2xheWVyU2hvdWxkTG9ja2VkID0gIXN0YXRlLmlzTG9ja2VkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWxUYWdOYW1lID09PSAnbGknKSB7XG4gICAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG4gICAgICB2YXIgZWxCb3VuZCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICB0aGlzLl9kcmFnZ2VkID0gZWwuaWQ7XG4gICAgICB0aGlzLl9kcmFnZ2VkUGFyZW50ID0gZWwucGFyZW50RWxlbWVudDtcbiAgICAgIHRoaXMuX29mZnNldCA9IHtcbiAgICAgICAgeDogZS5jbGllbnRYIC0gZWxCb3VuZC5sZWZ0LFxuICAgICAgICB5OiBlLmNsaWVudFkgLSBlbEJvdW5kLnRvcFxuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGUpO1xuXG4gICAgICBhY3Rpb24uc3RhcnREcmFnTGF5ZXIobGF5ZXJUb2tlbik7XG4gICAgfVxuICB9LFxuXG4gIF9vbkxheWVyTW91c2VVcDogZnVuY3Rpb24obGF5ZXJUb2tlbiwgZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICB2YXIgZWxUYWdOYW1lID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBlbFBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICBpZiAoZWxUYWdOYW1lID09PSAnaW5wdXQnKSB7XG4gICAgICBpZiAoZWwgPT09IHRoaXMuX3RvZ2dsZWQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fdG9nZ2xlZCkge1xuICAgICAgICB2YXIgc3RhdGVUb2tlbiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoZWxQYXJlbnQuY2hpbGROb2RlcywgZWwpO1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnN0b3JlLmdldExheWVyU3RhdGUobGF5ZXJUb2tlbik7XG5cbiAgICAgICAgaWYgKHN0YXRlVG9rZW4gPT09IDApIHtcbiAgICAgICAgICBhY3Rpb24uc2V0TGF5ZXJTdGF0ZShsYXllclRva2VuLCAhc3RhdGUuaXNWaXNpYmxlLCB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlVG9rZW4gPT09IDEpIHtcbiAgICAgICAgICBhY3Rpb24uc2V0TGF5ZXJTdGF0ZShsYXllclRva2VuLCB1bmRlZmluZWQsICFzdGF0ZS5pc0xvY2tlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX29uTGF5ZXJNb3VzZU92ZXJPdXQ6IGZ1bmN0aW9uKGxheWVyVG9rZW4sIGUpIHtcbiAgICBpZiAodGhpcy5fdG9nZ2xlZCkge1xuICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuXG4gICAgICB0aGlzLl90b2dnbGVkLmJsdXIoKTtcblxuICAgICAgYWN0aW9uLnNldExheWVyU3RhdGUobGF5ZXJUb2tlbiwgdGhpcy5fbGF5ZXJTaG91bGRWaXNpYmxlLCB0aGlzLl9sYXllclNob3VsZExvY2tlZCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkNvbnRhaW5lck1vdXNlVXA6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICBpZiAodGhpcy5fZHJhZ2dlZCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRyYWdnZWRQb3M6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIGFjdGlvbi5zdG9wRHJhZ0xheWVyKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb2Zmc2V0ID0gZmFsc2U7XG4gICAgdGhpcy5fZHJhZ2dlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2RyYWdnZWRQYXJlbnQgPSBmYWxzZTtcbiAgICB0aGlzLl90b2dnbGVkID0gZmFsc2U7XG4gIH0sXG5cbiAgX29uQ29udGFpbmVyTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLl9kcmFnZ2VkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG4gICAgdmFyIGxheWVycyA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbCh0aGlzLl9kcmFnZ2VkUGFyZW50LmNoaWxkcmVuLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5pZCAhPT0gJyRwbGFjZWhvbGRlcic7XG4gICAgfSk7XG5cbiAgICBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihub2RlLCBpKSB7XG4gICAgICBpZiAobm9kZS5pZCAhPT0gc2VsZi5fZHJhZ2dlZCkge1xuICAgICAgICB2YXIgc2libGluZ0JvdW5kID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBpZiAoZS5jbGllbnRZID4gc2libGluZ0JvdW5kLnRvcCAmJlxuICAgICAgICAgICAgZS5jbGllbnRZIDwgc2libGluZ0JvdW5kLmJvdHRvbSkge1xuXG4gICAgICAgICAgYWN0aW9uLm1vdmVEcmFnZ2VkTGF5ZXIoaSk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbihlKTtcbiAgfSxcblxuICBfdXBkYXRlUG9zaXRpb246IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcEJvdW5kID0gdGhpcy5fZHJhZ2dlZFBhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgbmV3UG9zID0gdGhpcy5zdGF0ZS5kcmFnZ2VkUG9zIHx8IEltbXV0YWJsZS5NYXAoe2xlZnQ6IDAsIHRvcDogMH0pO1xuXG4gICAgbmV3UG9zID0gbmV3UG9zXG4gICAgICAuc2V0KCdsZWZ0JywgNSlcbiAgICAgIC5zZXQoJ3RvcCcsIGUuY2xpZW50WSAtIHBCb3VuZC50b3AgLSB0aGlzLl9vZmZzZXQueSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRyYWdnZWRQb3M6IG5ld1Bvc1xuICAgIH0pO1xuICB9LFxuXG4gIF9pc0FsbFZpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmxheWVycy5ldmVyeShmdW5jdGlvbihsYXllcikge1xuICAgICAgcmV0dXJuIGxheWVyLmlkID09PSAnJHBsYWNlaG9sZGVyJyB8fCBsYXllci5pc1Zpc2libGUgPT09IHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2lzQWxsTG9ja2VkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sYXllcnMuZXZlcnkoZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgIHJldHVybiBsYXllci5pZCA9PT0gJyRwbGFjZWhvbGRlcicgfHwgbGF5ZXIuaXNMb2NrZWQgPT09IHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgX3RvZ2dsZUFsbFZpc2libGU6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICBhY3Rpb24uc2V0QWxsTGF5ZXJTdGF0ZSghdGhpcy5faXNBbGxWaXNpYmxlKCksIHVuZGVmaW5lZCk7XG4gIH0sXG5cbiAgX3RvZ2dsZUFsbExvY2tlZDogZnVuY3Rpb24oZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcblxuICAgIGFjdGlvbi5zZXRBbGxMYXllclN0YXRlKHVuZGVmaW5lZCwgIXRoaXMuX2lzQWxsTG9ja2VkKCkpO1xuICB9LFxuXG4gIF9vblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxheWVyczogdGhpcy5zdGF0ZS5zdG9yZS5nZXRBbGwoKSxcbiAgICB9KTtcbiAgfVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXllcnNQYW5lbDtcbiJdfQ==
