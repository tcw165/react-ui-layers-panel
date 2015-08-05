(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Main entry.
$(document).ready(function() {
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
});

},{"../src/createLayerStore":11,"../src/views/LayersPanel":14}],2:[function(require,module,exports){
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

  // Register callback to handle all updates.
  dispatcher.register(function(action) {
    switch(action.type) {

    case LayerAction.SET_LAYER_STATE:
      var token = action.token;
      var isVisible = action.isVisible;
      var isLocked = action.isLocked;

      if (store.setLayerState(token, isVisible, isLocked, undefined)) {
        store.publish();
      }
      break;

    case LayerAction.SET_ALL_LAYERS_STATE:
      var isVisible = action.isVisible;
      var isLocked = action.isLocked;

      for (var i = 0, j = store.length(); i < j; ++i) {
        store.setLayerState(i, isVisible, isLocked, undefined);
      }
      store.publish();
      break;

    case LayerAction.INSERT_LAYER:
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
      break;

    case LayerAction.DELETE_LAYER:
      var token = action.token;

      if (store.removeLayer(token)) {
        store.publish();
      }
      break;

    case LayerAction.DUPLICATE_LAYER:
      var token = action.token;

      if (store.duplicateLayer(token)) {
        store.publish();
      }
      break;

    case LayerAction.START_DRAG_LAYER:
      var draggedToken = action.token;

      store.setLayerState(draggedToken, undefined, undefined, true);
      store.insertPlaceholder(draggedToken + 1);
      store.publish();
      break;

    case LayerAction.STOP_DRAG_LAYER:
      var draggedToken = store.getDraggedLayerTokens()[0];
      var placeholderToken = store.getPlaceholderTokens()[0];

      store.setLayerState(draggedToken, undefined, undefined, false);
      store.exchangeLayers(draggedToken, placeholderToken);
      store.removePlaceholders();
      store.publish();
      break;

    case LayerAction.MOVE_DRAGGED_LAYER:
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
      break;

    }
  });

  // Return only store and action. Dispatcher is hidden for the outside world.
  return {
    id: (+Date.now() + Math.floor(0x100000000 * Math.random())).toString(36),
    store: store,
    action: action
  };
}

},{"./actions/LayerAction":10,"./stores/LayerStore":12,"flux":7}],12:[function(require,module,exports){
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

},{"events":2,"util":6}],13:[function(require,module,exports){
var LayerStore = require('../stores/LayerStore');
var LayerAction = require('../actions/LayerAction');

var CSS = {

  VISIBLE: 'ui-visible',
  INVISIBLE: 'ui-invisible',

  LOCKED: 'ui-locked',
  UNLOCKED: 'ui-unlocked'

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

},{"../actions/LayerAction":10,"../stores/LayerStore":12}],14:[function(require,module,exports){
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

},{"../actions/LayerAction":10,"../stores/LayerStore":12,"./LayerItem":13}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL2RlbW8vaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9mbHV4L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvbGliL0Rpc3BhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvZmx1eC9saWIvaW52YXJpYW50LmpzIiwiL1VzZXJzL2JveXcxNjUvX0NPREUvbGFiLWpzL3JlYWN0LXVpLWxheWVycy1wYW5lbC9zcmMvYWN0aW9ucy9MYXllckFjdGlvbi5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL2NyZWF0ZUxheWVyU3RvcmUuanMiLCIvVXNlcnMvYm95dzE2NS9fQ09ERS9sYWItanMvcmVhY3QtdWktbGF5ZXJzLXBhbmVsL3NyYy9zdG9yZXMvTGF5ZXJTdG9yZS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVySXRlbS5qcyIsIi9Vc2Vycy9ib3l3MTY1L19DT0RFL2xhYi1qcy9yZWFjdC11aS1sYXllcnMtcGFuZWwvc3JjL3ZpZXdzL0xheWVyc1BhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsY0FBYztBQUNkLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVztBQUM3QixFQUFFLElBQUksc0NBQXNDLGdDQUFBOztJQUV4QyxlQUFlLEVBQUUsV0FBVztNQUMxQixPQUFPO1FBQ0wsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUs7UUFDN0IsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7T0FDeEMsQ0FBQztBQUNSLEtBQUs7O0lBRUQsaUJBQWlCLEVBQUUsV0FBVztNQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25ELEtBQUs7O0lBRUQsb0JBQW9CLEVBQUUsV0FBVztNQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JELEtBQUs7O0lBRUQsTUFBTSxFQUFFLFdBQVc7TUFDakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO01BQ2hCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLEVBQUU7UUFDcEQsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1VBQ2QsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDM0MsVUFBVSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7VUFFakMsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLEtBQUs7Y0FDWixJQUFJLENBQUMsS0FBSyxDQUFDLE9B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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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SyxJQUFJLENBQUM7S0FDaEUsQ0FBQyxDQUFDO0FBQ1AsR0FBRzs7RUFFRCxZQUFZLEVBQUUsV0FBVztJQUN2QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssRUFBRTtNQUM3QyxPQUFPLEtBQUssQ0FBQyxFQUFFLEtBQUssY0FBYyxJQUFJLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDO0tBQy9ELENBQUMsQ0FBQztBQUNQLEdBQUc7O0VBRUQsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLEVBQUU7QUFDakMsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7SUFFL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzlELEdBQUc7O0VBRUQsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLEVBQUU7QUFDaEMsSUFBSSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7SUFFL0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQzdELEdBQUc7O0VBRUQsY0FBYyxFQUFFLFdBQVc7SUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQztNQUNaLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7S0FDbEMsQ0FBQyxDQUFDO0FBQ1AsR0FBRzs7QUFFSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBNYWluIGVudHJ5LlxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHZhciBTb21lTGF5ZXJzQ2FudmFzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0b3JlOiB0aGlzLnByb3BzLnN0b3JlLnN0b3JlLFxuICAgICAgICBsYXllcnM6IHRoaXMucHJvcHMuc3RvcmUuc3RvcmUuZ2V0QWxsKClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RhdGUuc3RvcmUubGlzdGVuKHRoaXMuX29uU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0YXRlLnN0b3JlLnVubGlzdGVuKHRoaXMuX29uU3RvcmVDaGFuZ2UpO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGxheWVycyA9IHRoaXMuc3RhdGUubGF5ZXJzLm1hcChmdW5jdGlvbihsYXllciwgaSkge1xuICAgICAgICBpZiAobGF5ZXIuZGF0YSkge1xuICAgICAgICAgIHZhciB0YWdOYW1lID0gbGF5ZXIuZGF0YS50YWdOYW1lO1xuICAgICAgICAgIHZhciBhdHRyID0gbGF5ZXIuZGF0YS5hdHRyaWJ1dGVzO1xuXG4gICAgICAgICAgaWYgKGxheWVyLmlzVmlzaWJsZSkge1xuICAgICAgICAgICAgaWYgKGF0dHIuc3R5bGUpXG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUub3BhY2l0eSA9IDEwMDtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBhdHRyLnN0eWxlID0ge1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEwMFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhdHRyLnN0eWxlKVxuICAgICAgICAgICAgICBhdHRyLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGF0dHIuc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSwgYXR0ciwgbGF5ZXIuZGF0YS5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nY2hhcnQnPlxuICAgICAgICAgIDxoMT5ESVYgTGF5ZXJzPC9oMT5cbiAgICAgICAgICB7bGF5ZXJzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSxcblxuICAgIF9vblN0b3JlQ2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsYXllcnM6IHRoaXMuc3RhdGUuc3RvcmUuZ2V0QWxsKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIExheWVyc1BhbmVsID0gcmVxdWlyZSgnLi4vc3JjL3ZpZXdzL0xheWVyc1BhbmVsJyk7XG4gIHZhciBjcmVhdGVMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3JjL2NyZWF0ZUxheWVyU3RvcmUnKTtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzdG9yZS5cbiAgdmFyIHN0b3JlID0gY3JlYXRlTGF5ZXJTdG9yZSgpO1xuICB2YXIgc3RvcmVBY3Rpb24gPSBzdG9yZS5hY3Rpb247XG5cbiAgLy8gRGVidWcsIHlvdSBjb3VsZCBlbnRlciBcImxheWVyU3RvcmUuZ2V0QWxsKClcIiB0byBzZWUgbGF5ZXJzLlxuICB3aW5kb3cubGF5ZXJTdG9yZSA9IHN0b3JlLnN0b3JlO1xuICB3aW5kb3cubGF5ZXJBY3Rpb24gPSBzdG9yZS5hY3Rpb247XG5cbiAgUmVhY3QucmVuZGVyKFxuICAgIDxTb21lTGF5ZXJzQ2FudmFzIHN0b3JlPXtzdG9yZX0vPixcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQtZXhhbXBsZScpXG4gICk7XG5cbiAgUmVhY3QucmVuZGVyKFxuICAgIDxMYXllcnNQYW5lbCBzdG9yZT17c3RvcmV9Lz4sXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xheWVycy1wYW5lbC1leGFtcGxlJylcbiAgKTtcblxuICAvLyBBZGQgc29tZXRoaW5nIGludG8gdGhlIHN0b3JlLlxuICB2YXIgbGF5ZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7ICsraSkge1xuICAgIHZhciBuID0gTWF0aC5mbG9vcig1MCArIDM5OSAqIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgbGF5ZXJzLnB1c2goe1xuICAgICAgaXNWaXNpYmxlOiB0cnVlLFxuICAgICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgICAgZGF0YToge1xuICAgICAgICBpZDogJ29iamVjdCAnICsgaSxcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgd2lkdGg6IG4gKyAncHgnXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGxheWVyQWN0aW9uLmluc2VydExheWVycyh1bmRlZmluZWQsIGxheWVycyk7XG59KTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbm1vZHVsZS5leHBvcnRzLkRpc3BhdGNoZXIgPSByZXF1aXJlKCcuL2xpYi9EaXNwYXRjaGVyJylcbiIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgRGlzcGF0Y2hlclxuICogQHR5cGVjaGVja3NcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGludmFyaWFudCA9IHJlcXVpcmUoJy4vaW52YXJpYW50Jyk7XG5cbnZhciBfbGFzdElEID0gMTtcbnZhciBfcHJlZml4ID0gJ0lEXyc7XG5cbi8qKlxuICogRGlzcGF0Y2hlciBpcyB1c2VkIHRvIGJyb2FkY2FzdCBwYXlsb2FkcyB0byByZWdpc3RlcmVkIGNhbGxiYWNrcy4gVGhpcyBpc1xuICogZGlmZmVyZW50IGZyb20gZ2VuZXJpYyBwdWItc3ViIHN5c3RlbXMgaW4gdHdvIHdheXM6XG4gKlxuICogICAxKSBDYWxsYmFja3MgYXJlIG5vdCBzdWJzY3JpYmVkIHRvIHBhcnRpY3VsYXIgZXZlbnRzLiBFdmVyeSBwYXlsb2FkIGlzXG4gKiAgICAgIGRpc3BhdGNoZWQgdG8gZXZlcnkgcmVnaXN0ZXJlZCBjYWxsYmFjay5cbiAqICAgMikgQ2FsbGJhY2tzIGNhbiBiZSBkZWZlcnJlZCBpbiB3aG9sZSBvciBwYXJ0IHVudGlsIG90aGVyIGNhbGxiYWNrcyBoYXZlXG4gKiAgICAgIGJlZW4gZXhlY3V0ZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsIGNvbnNpZGVyIHRoaXMgaHlwb3RoZXRpY2FsIGZsaWdodCBkZXN0aW5hdGlvbiBmb3JtLCB3aGljaFxuICogc2VsZWN0cyBhIGRlZmF1bHQgY2l0eSB3aGVuIGEgY291bnRyeSBpcyBzZWxlY3RlZDpcbiAqXG4gKiAgIHZhciBmbGlnaHREaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNvdW50cnkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENvdW50cnlTdG9yZSA9IHtjb3VudHJ5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNpdHkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENpdHlTdG9yZSA9IHtjaXR5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBiYXNlIGZsaWdodCBwcmljZSBvZiB0aGUgc2VsZWN0ZWQgY2l0eVxuICogICB2YXIgRmxpZ2h0UHJpY2VTdG9yZSA9IHtwcmljZTogbnVsbH1cbiAqXG4gKiBXaGVuIGEgdXNlciBjaGFuZ2VzIHRoZSBzZWxlY3RlZCBjaXR5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjaXR5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDaXR5OiAncGFyaXMnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBgQ2l0eVN0b3JlYDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjaXR5LXVwZGF0ZScpIHtcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gcGF5bG9hZC5zZWxlY3RlZENpdHk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBjb3VudHJ5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjb3VudHJ5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDb3VudHJ5OiAnYXVzdHJhbGlhJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYm90aCBzdG9yZXM6XG4gKlxuICogICAgQ291bnRyeVN0b3JlLmRpc3BhdGNoVG9rZW4gPSBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY291bnRyeS11cGRhdGUnKSB7XG4gKiAgICAgICBDb3VudHJ5U3RvcmUuY291bnRyeSA9IHBheWxvYWQuc2VsZWN0ZWRDb3VudHJ5O1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogV2hlbiB0aGUgY2FsbGJhY2sgdG8gdXBkYXRlIGBDb3VudHJ5U3RvcmVgIGlzIHJlZ2lzdGVyZWQsIHdlIHNhdmUgYSByZWZlcmVuY2VcbiAqIHRvIHRoZSByZXR1cm5lZCB0b2tlbi4gVXNpbmcgdGhpcyB0b2tlbiB3aXRoIGB3YWl0Rm9yKClgLCB3ZSBjYW4gZ3VhcmFudGVlXG4gKiB0aGF0IGBDb3VudHJ5U3RvcmVgIGlzIHVwZGF0ZWQgYmVmb3JlIHRoZSBjYWxsYmFjayB0aGF0IHVwZGF0ZXMgYENpdHlTdG9yZWBcbiAqIG5lZWRzIHRvIHF1ZXJ5IGl0cyBkYXRhLlxuICpcbiAqICAgQ2l0eVN0b3JlLmRpc3BhdGNoVG9rZW4gPSBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICBpZiAocGF5bG9hZC5hY3Rpb25UeXBlID09PSAnY291bnRyeS11cGRhdGUnKSB7XG4gKiAgICAgICAvLyBgQ291bnRyeVN0b3JlLmNvdW50cnlgIG1heSBub3QgYmUgdXBkYXRlZC5cbiAqICAgICAgIGZsaWdodERpc3BhdGNoZXIud2FpdEZvcihbQ291bnRyeVN0b3JlLmRpc3BhdGNoVG9rZW5dKTtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgaXMgbm93IGd1YXJhbnRlZWQgdG8gYmUgdXBkYXRlZC5cbiAqXG4gKiAgICAgICAvLyBTZWxlY3QgdGhlIGRlZmF1bHQgY2l0eSBmb3IgdGhlIG5ldyBjb3VudHJ5XG4gKiAgICAgICBDaXR5U3RvcmUuY2l0eSA9IGdldERlZmF1bHRDaXR5Rm9yQ291bnRyeShDb3VudHJ5U3RvcmUuY291bnRyeSk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBUaGUgdXNhZ2Ugb2YgYHdhaXRGb3IoKWAgY2FuIGJlIGNoYWluZWQsIGZvciBleGFtcGxlOlxuICpcbiAqICAgRmxpZ2h0UHJpY2VTdG9yZS5kaXNwYXRjaFRva2VuID1cbiAqICAgICBmbGlnaHREaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKHBheWxvYWQpIHtcbiAqICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gKiAgICAgICAgIGNhc2UgJ2NvdW50cnktdXBkYXRlJzpcbiAqICAgICAgICAgICBmbGlnaHREaXNwYXRjaGVyLndhaXRGb3IoW0NpdHlTdG9yZS5kaXNwYXRjaFRva2VuXSk7XG4gKiAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZS5wcmljZSA9XG4gKiAgICAgICAgICAgICBnZXRGbGlnaHRQcmljZVN0b3JlKENvdW50cnlTdG9yZS5jb3VudHJ5LCBDaXR5U3RvcmUuY2l0eSk7XG4gKiAgICAgICAgICAgYnJlYWs7XG4gKlxuICogICAgICAgICBjYXNlICdjaXR5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgRmxpZ2h0UHJpY2VTdG9yZS5wcmljZSA9XG4gKiAgICAgICAgICAgICBGbGlnaHRQcmljZVN0b3JlKENvdW50cnlTdG9yZS5jb3VudHJ5LCBDaXR5U3RvcmUuY2l0eSk7XG4gKiAgICAgICAgICAgYnJlYWs7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBUaGUgYGNvdW50cnktdXBkYXRlYCBwYXlsb2FkIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBpbnZva2UgdGhlIHN0b3JlcydcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzIGluIG9yZGVyOiBgQ291bnRyeVN0b3JlYCwgYENpdHlTdG9yZWAsIHRoZW5cbiAqIGBGbGlnaHRQcmljZVN0b3JlYC5cbiAqL1xuXG4gIGZ1bmN0aW9uIERpc3BhdGNoZXIoKSB7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZyA9IHt9O1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNIYW5kbGVkID0ge307XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9wZW5kaW5nUGF5bG9hZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCB3aXRoIGV2ZXJ5IGRpc3BhdGNoZWQgcGF5bG9hZC4gUmV0dXJuc1xuICAgKiBhIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBgd2FpdEZvcigpYC5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUucmVnaXN0ZXI9ZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgaWQgPSBfcHJlZml4ICsgX2xhc3RJRCsrO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSA9IGNhbGxiYWNrO1xuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNhbGxiYWNrIGJhc2VkIG9uIGl0cyB0b2tlbi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqL1xuICBEaXNwYXRjaGVyLnByb3RvdHlwZS51bnJlZ2lzdGVyPWZ1bmN0aW9uKGlkKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdLFxuICAgICAgJ0Rpc3BhdGNoZXIudW5yZWdpc3RlciguLi4pOiBgJXNgIGRvZXMgbm90IG1hcCB0byBhIHJlZ2lzdGVyZWQgY2FsbGJhY2suJyxcbiAgICAgIGlkXG4gICAgKTtcbiAgICBkZWxldGUgdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3NbaWRdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGNhbGxiYWNrcyBzcGVjaWZpZWQgdG8gYmUgaW52b2tlZCBiZWZvcmUgY29udGludWluZyBleGVjdXRpb25cbiAgICogb2YgdGhlIGN1cnJlbnQgY2FsbGJhY2suIFRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIHVzZWQgYnkgYSBjYWxsYmFjayBpblxuICAgKiByZXNwb25zZSB0byBhIGRpc3BhdGNoZWQgcGF5bG9hZC5cbiAgICpcbiAgICogQHBhcmFtIHthcnJheTxzdHJpbmc+fSBpZHNcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLndhaXRGb3I9ZnVuY3Rpb24oaWRzKSB7XG4gICAgaW52YXJpYW50KFxuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nLFxuICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBNdXN0IGJlIGludm9rZWQgd2hpbGUgZGlzcGF0Y2hpbmcuJ1xuICAgICk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGlkcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIHZhciBpZCA9IGlkc1tpaV07XG4gICAgICBpZiAodGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdKSB7XG4gICAgICAgIGludmFyaWFudChcbiAgICAgICAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0sXG4gICAgICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIHdoaWxlICcgK1xuICAgICAgICAgICd3YWl0aW5nIGZvciBgJXNgLicsXG4gICAgICAgICAgaWRcbiAgICAgICAgKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpbnZhcmlhbnQoXG4gICAgICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSxcbiAgICAgICAgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBgJXNgIGRvZXMgbm90IG1hcCB0byBhIHJlZ2lzdGVyZWQgY2FsbGJhY2suJyxcbiAgICAgICAgaWRcbiAgICAgICk7XG4gICAgICB0aGlzLiREaXNwYXRjaGVyX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBwYXlsb2FkIHRvIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBheWxvYWRcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLmRpc3BhdGNoPWZ1bmN0aW9uKHBheWxvYWQpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICAhdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nLFxuICAgICAgJ0Rpc3BhdGNoLmRpc3BhdGNoKC4uLik6IENhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJ1xuICAgICk7XG4gICAgdGhpcy4kRGlzcGF0Y2hlcl9zdGFydERpc3BhdGNoaW5nKHBheWxvYWQpO1xuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBpZCBpbiB0aGlzLiREaXNwYXRjaGVyX2NhbGxiYWNrcykge1xuICAgICAgICBpZiAodGhpcy4kRGlzcGF0Y2hlcl9pc1BlbmRpbmdbaWRdKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pbnZva2VDYWxsYmFjayhpZCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfc3RvcERpc3BhdGNoaW5nKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJcyB0aGlzIERpc3BhdGNoZXIgY3VycmVudGx5IGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuaXNEaXNwYXRjaGluZz1mdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kRGlzcGF0Y2hlcl9pc0Rpc3BhdGNoaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBjYWxsYmFjayBzdG9yZWQgd2l0aCB0aGUgZ2l2ZW4gaWQuIEFsc28gZG8gc29tZSBpbnRlcm5hbFxuICAgKiBib29ra2VlcGluZy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfaW52b2tlQ2FsbGJhY2s9ZnVuY3Rpb24oaWQpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzUGVuZGluZ1tpZF0gPSB0cnVlO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfY2FsbGJhY2tzW2lkXSh0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkKTtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzSGFuZGxlZFtpZF0gPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdXAgYm9va2tlZXBpbmcgbmVlZGVkIHdoZW4gZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXlsb2FkXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuJERpc3BhdGNoZXJfc3RhcnREaXNwYXRjaGluZz1mdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gdGhpcy4kRGlzcGF0Y2hlcl9jYWxsYmFja3MpIHtcbiAgICAgIHRoaXMuJERpc3BhdGNoZXJfaXNQZW5kaW5nW2lkXSA9IGZhbHNlO1xuICAgICAgdGhpcy4kRGlzcGF0Y2hlcl9pc0hhbmRsZWRbaWRdID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuJERpc3BhdGNoZXJfcGVuZGluZ1BheWxvYWQgPSBwYXlsb2FkO1xuICAgIHRoaXMuJERpc3BhdGNoZXJfaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFyIGJvb2trZWVwaW5nIHVzZWQgZm9yIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLiREaXNwYXRjaGVyX3N0b3BEaXNwYXRjaGluZz1mdW5jdGlvbigpIHtcbiAgICB0aGlzLiREaXNwYXRjaGVyX3BlbmRpbmdQYXlsb2FkID0gbnVsbDtcbiAgICB0aGlzLiREaXNwYXRjaGVyX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERpc3BhdGNoZXI7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChmYWxzZSkge1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhcmlhbnQgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdNaW5pZmllZCBleGNlcHRpb24gb2NjdXJyZWQ7IHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCAnICtcbiAgICAgICAgJ2ZvciB0aGUgZnVsbCBlcnJvciBtZXNzYWdlIGFuZCBhZGRpdGlvbmFsIGhlbHBmdWwgd2FybmluZ3MuJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyZ3MgPSBbYSwgYiwgYywgZCwgZSwgZl07XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICdJbnZhcmlhbnQgVmlvbGF0aW9uOiAnICtcbiAgICAgICAgZm9ybWF0LnJlcGxhY2UoLyVzL2csIGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJnc1thcmdJbmRleCsrXTsgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGludmFyaWFudDtcbiIsInZhciBEaXNwYXRjaGVyID0gcmVxdWlyZSgnZmx1eCcpLkRpc3BhdGNoZXI7XG5cbmZ1bmN0aW9uIGlkR2VuKCkge1xuICByZXR1cm4gKCtEYXRlLm5vdygpICsgTWF0aC5mbG9vcigweDEwMDAwMDAwMCAqIE1hdGgucmFuZG9tKCkpKS50b1N0cmluZygzNik7XG59XG5cbmZ1bmN0aW9uIExheWVyQWN0aW9uKGRpc3BhdGNoZXIpIHtcbiAgaWYgKCEoZGlzcGF0Y2hlciBpbnN0YW5jZW9mIERpc3BhdGNoZXIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZGlzcGF0Y2hlciB1bmRlZmluZWQuJylcbiAgfVxuXG4gIHRoaXMuX2Rpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xufVxuXG5MYXllckFjdGlvbi5pZCA9IGlkR2VuKCk7XG5cbkxheWVyQWN0aW9uLnZlcmlmeSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gb2JqLmlkID09PSBMYXllckFjdGlvbi5pZDtcbn1cblxuTGF5ZXJBY3Rpb24uU0VUX0xBWUVSX1NUQVRFID0gMDtcbkxheWVyQWN0aW9uLlNFVF9BTExfTEFZRVJTX1NUQVRFID0gMTtcbkxheWVyQWN0aW9uLklOU0VSVF9MQVlFUiA9IDI7XG5MYXllckFjdGlvbi5ERUxFVEVfTEFZRVIgPSAzO1xuTGF5ZXJBY3Rpb24uRFVQTElDQVRFX0xBWUVSID0gNDtcbkxheWVyQWN0aW9uLlNUQVJUX0RSQUdfTEFZRVIgPSA1O1xuTGF5ZXJBY3Rpb24uU1RPUF9EUkFHX0xBWUVSID0gNjtcbkxheWVyQWN0aW9uLk1PVkVfRFJBR0dFRF9MQVlFUiA9IDc7XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5zZXRMYXllclN0YXRlID0gZnVuY3Rpb24odG9rZW4sIGlzVmlzaWJsZSwgaXNMb2NrZWQpIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uU0VUX0xBWUVSX1NUQVRFLFxuICAgIHRva2VuOiB0b2tlbixcbiAgICBpc1Zpc2libGU6IGlzVmlzaWJsZSxcbiAgICBpc0xvY2tlZDogaXNMb2NrZWRcbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuc2V0QWxsTGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uKGlzVmlzaWJsZSwgaXNMb2NrZWQpIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uU0VUX0FMTF9MQVlFUlNfU1RBVEUsXG4gICAgaXNWaXNpYmxlOiBpc1Zpc2libGUsXG4gICAgaXNMb2NrZWQ6IGlzTG9ja2VkXG4gIH0pO1xufTtcblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLmluc2VydExheWVyID0gZnVuY3Rpb24odG9rZW4sIGxheWVyKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLklOU0VSVF9MQVlFUixcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgbGF5ZXJzOiBsYXllclxuICB9KTtcbn1cblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLmluc2VydExheWVycyA9IGZ1bmN0aW9uKHRva2VuLCBsYXllcnMpIHtcbiAgdGhpcy5pbnNlcnRMYXllcih0b2tlbiwgbGF5ZXJzKTtcbn1cblxuTGF5ZXJBY3Rpb24ucHJvdG90eXBlLmRlbGV0ZUxheWVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uREVMRVRFX0xBWUVSLFxuICAgIHRva2VuOiB0b2tlblxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5kdXBsaWNhdGVMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLkRVUExJQ0FURV9MQVlFUixcbiAgICB0b2tlbjogdG9rZW5cbiAgfSk7XG59O1xuXG5MYXllckFjdGlvbi5wcm90b3R5cGUuc3RhcnREcmFnTGF5ZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBMYXllckFjdGlvbi5TVEFSVF9EUkFHX0xBWUVSLFxuICAgIHRva2VuOiB0b2tlblxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5zdG9wRHJhZ0xheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgIHR5cGU6IExheWVyQWN0aW9uLlNUT1BfRFJBR19MQVlFUlxuICB9KTtcbn07XG5cbkxheWVyQWN0aW9uLnByb3RvdHlwZS5tb3ZlRHJhZ2dlZExheWVyID0gZnVuY3Rpb24odG8pIHtcbiAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgdHlwZTogTGF5ZXJBY3Rpb24uTU9WRV9EUkFHR0VEX0xBWUVSLFxuICAgIHRvOiB0b1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJBY3Rpb247XG4iLCJ2YXIgTGF5ZXJTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL0xheWVyU3RvcmUnKTtcbnZhciBMYXllckFjdGlvbiA9IHJlcXVpcmUoJy4vYWN0aW9ucy9MYXllckFjdGlvbicpO1xudmFyIExheWVyRGlzcGF0Y2hlciA9IHJlcXVpcmUoJ2ZsdXgnKS5EaXNwYXRjaGVyO1xuXG4vKipcbiAqIEJ1aWxkIHRoZSBzdG9yZSwgYWN0aW9uIGFuZCBkaXNwYXRjaGVyLlxuICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLS0tLS0tLS0tLS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIC4tLS0tLS0tLS0tLS18ICBhY3Rpb24gIHwgPC0tLS0tLS0tLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICctLS0tLS0tLS0tJyAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogLi0tLS0tLS0tLS0uICAgICAuLS0tLS0tLS0tLS0tLS0uICAgICAuLS0tLS0tLS0tLiAgICAgLi0tLS0tLS0tLS5cbiAqIHwgIGFjdGlvbiAgfCAtLT4gfCAgZGlzcGF0Y2hlciAgfCAtLT4gfCAgc3RvcmUgIHwgLS0+IHwgIHZpZXdzICB8XG4gKiAnLS0tLS0tLS0tLScgICAgICctLS0tLS0tLS0tLS0tLScgICAgICctLS0tLS0tLS0nICAgICAnLS0tLS0tLS0tJ1xuICpcbiAqIEByZXR1cm4ge09iamVjdH0ge2lkOiB7U3RyaW5nfVxuICogICAgICAgICAgICAgICAgICAgc3RvcmU6IHtMYXllclN0b3JlfSxcbiAqICAgICAgICAgICAgICAgICAgIGFjdGlvbjoge0xheWVyQWN0aW9ufX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcnMpIHtcbiAgdmFyIGRpc3BhdGNoZXIgPSBuZXcgTGF5ZXJEaXNwYXRjaGVyKCk7XG4gIHZhciBzdG9yZSA9IG5ldyBMYXllclN0b3JlKGxheWVycyk7XG4gIHZhciBhY3Rpb24gPSBuZXcgTGF5ZXJBY3Rpb24oZGlzcGF0Y2hlcik7XG5cbiAgLy8gUmVnaXN0ZXIgY2FsbGJhY2sgdG8gaGFuZGxlIGFsbCB1cGRhdGVzLlxuICBkaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgIHN3aXRjaChhY3Rpb24udHlwZSkge1xuXG4gICAgY2FzZSBMYXllckFjdGlvbi5TRVRfTEFZRVJfU1RBVEU6XG4gICAgICB2YXIgdG9rZW4gPSBhY3Rpb24udG9rZW47XG4gICAgICB2YXIgaXNWaXNpYmxlID0gYWN0aW9uLmlzVmlzaWJsZTtcbiAgICAgIHZhciBpc0xvY2tlZCA9IGFjdGlvbi5pc0xvY2tlZDtcblxuICAgICAgaWYgKHN0b3JlLnNldExheWVyU3RhdGUodG9rZW4sIGlzVmlzaWJsZSwgaXNMb2NrZWQsIHVuZGVmaW5lZCkpIHtcbiAgICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIExheWVyQWN0aW9uLlNFVF9BTExfTEFZRVJTX1NUQVRFOlxuICAgICAgdmFyIGlzVmlzaWJsZSA9IGFjdGlvbi5pc1Zpc2libGU7XG4gICAgICB2YXIgaXNMb2NrZWQgPSBhY3Rpb24uaXNMb2NrZWQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gc3RvcmUubGVuZ3RoKCk7IGkgPCBqOyArK2kpIHtcbiAgICAgICAgc3RvcmUuc2V0TGF5ZXJTdGF0ZShpLCBpc1Zpc2libGUsIGlzTG9ja2VkLCB1bmRlZmluZWQpO1xuICAgICAgfVxuICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIExheWVyQWN0aW9uLklOU0VSVF9MQVlFUjpcbiAgICAgIHZhciBpc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciB0b2tlbiA9IGFjdGlvbi50b2tlbjtcbiAgICAgIHZhciBsYXllcnMgPSBhY3Rpb24ubGF5ZXJzO1xuXG4gICAgICBpZiAobGF5ZXJzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaXNDaGFuZ2VkID0gc3RvcmUuaW5zZXJ0TGF5ZXJzKHRva2VuLCBsYXllcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxheWVyID0gbGF5ZXJzO1xuICAgICAgICBpc0NoYW5nZWQgPSBzdG9yZS5pbnNlcnRMYXllcih0b2tlbiwgbGF5ZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNDaGFuZ2VkKSBzdG9yZS5wdWJsaXNoKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgTGF5ZXJBY3Rpb24uREVMRVRFX0xBWUVSOlxuICAgICAgdmFyIHRva2VuID0gYWN0aW9uLnRva2VuO1xuXG4gICAgICBpZiAoc3RvcmUucmVtb3ZlTGF5ZXIodG9rZW4pKSB7XG4gICAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBMYXllckFjdGlvbi5EVVBMSUNBVEVfTEFZRVI6XG4gICAgICB2YXIgdG9rZW4gPSBhY3Rpb24udG9rZW47XG5cbiAgICAgIGlmIChzdG9yZS5kdXBsaWNhdGVMYXllcih0b2tlbikpIHtcbiAgICAgICAgc3RvcmUucHVibGlzaCgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIExheWVyQWN0aW9uLlNUQVJUX0RSQUdfTEFZRVI6XG4gICAgICB2YXIgZHJhZ2dlZFRva2VuID0gYWN0aW9uLnRva2VuO1xuXG4gICAgICBzdG9yZS5zZXRMYXllclN0YXRlKGRyYWdnZWRUb2tlbiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgc3RvcmUuaW5zZXJ0UGxhY2Vob2xkZXIoZHJhZ2dlZFRva2VuICsgMSk7XG4gICAgICBzdG9yZS5wdWJsaXNoKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgTGF5ZXJBY3Rpb24uU1RPUF9EUkFHX0xBWUVSOlxuICAgICAgdmFyIGRyYWdnZWRUb2tlbiA9IHN0b3JlLmdldERyYWdnZWRMYXllclRva2VucygpWzBdO1xuICAgICAgdmFyIHBsYWNlaG9sZGVyVG9rZW4gPSBzdG9yZS5nZXRQbGFjZWhvbGRlclRva2VucygpWzBdO1xuXG4gICAgICBzdG9yZS5zZXRMYXllclN0YXRlKGRyYWdnZWRUb2tlbiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIHN0b3JlLmV4Y2hhbmdlTGF5ZXJzKGRyYWdnZWRUb2tlbiwgcGxhY2Vob2xkZXJUb2tlbik7XG4gICAgICBzdG9yZS5yZW1vdmVQbGFjZWhvbGRlcnMoKTtcbiAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBMYXllckFjdGlvbi5NT1ZFX0RSQUdHRURfTEFZRVI6XG4gICAgICB2YXIgdG8gPSBhY3Rpb24udG87XG4gICAgICB2YXIgaXNDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIHN0b3JlLnJlbW92ZVBsYWNlaG9sZGVycygpO1xuXG4gICAgICB2YXIgZHJhZ2dlZFRva2VuID0gc3RvcmUuZ2V0RHJhZ2dlZExheWVyVG9rZW5zKClbMF07XG5cbiAgICAgIGlmICh0byAhPT0gZHJhZ2dlZFRva2VuKSB7XG4gICAgICAgIGlzQ2hhbmdlZCA9IHN0b3JlLmV4Y2hhbmdlTGF5ZXJzKGRyYWdnZWRUb2tlbiwgdG8pO1xuICAgICAgfVxuXG4gICAgICBkcmFnZ2VkVG9rZW4gPSBzdG9yZS5nZXREcmFnZ2VkTGF5ZXJUb2tlbnMoKVswXTtcbiAgICAgIHN0b3JlLmluc2VydFBsYWNlaG9sZGVyKGRyYWdnZWRUb2tlbiArIDEpO1xuXG4gICAgICBpZiAoaXNDaGFuZ2VkKSB7XG4gICAgICAgIHN0b3JlLnB1Ymxpc2goKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgfVxuICB9KTtcblxuICAvLyBSZXR1cm4gb25seSBzdG9yZSBhbmQgYWN0aW9uLiBEaXNwYXRjaGVyIGlzIGhpZGRlbiBmb3IgdGhlIG91dHNpZGUgd29ybGQuXG4gIHJldHVybiB7XG4gICAgaWQ6ICgrRGF0ZS5ub3coKSArIE1hdGguZmxvb3IoMHgxMDAwMDAwMDAgKiBNYXRoLnJhbmRvbSgpKSkudG9TdHJpbmcoMzYpLFxuICAgIHN0b3JlOiBzdG9yZSxcbiAgICBhY3Rpb246IGFjdGlvblxuICB9O1xufVxuIiwidmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbnZhciBMQVlFUl9QUk9UTyA9IHtcbiAgaWQ6ICckcGxhY2Vob2xkZXInLFxuICBpc1Zpc2libGU6IHRydWUsXG4gIGlzTG9ja2VkOiBmYWxzZSxcbiAgaXNEcmFnZ2VkOiBmYWxzZSxcbiAgZGF0YTogdW5kZWZpbmVkXG59O1xuXG5mdW5jdGlvbiBpZEdlbigpIHtcbiAgcmV0dXJuIChEYXRlLm5vdygpICsgTWF0aC5mbG9vcigweDEwMDAwMDAwMDAwICogTWF0aC5yYW5kb20oKSkpLnRvU3RyaW5nKDM2KTtcbn1cblxuZnVuY3Rpb24gY29weShvYmopIHtcbiAgdmFyIHJldCA9IHt9O1xuXG4gIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgcmV0W2tdID0gb2JqW2tdO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBMYXllclN0b3JlIGlzIHRoZSBkYXRhIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gTGF5ZXJTdG9yZShsYXllcnMpIHtcbiAgLyoqXG4gICAqIEFycmF5IG9mIGxheWVycyBvYmplY3QuIEZvcm1hdCBvZiBzaW5nbGUgbGF5ZXIgaXMgbGlrZS4uLlxuICAgKiB7XG4gICAqICAgaWQ6IHtTdHJpbmd9LFxuICAgKiAgIGlzVmlzaWJsZToge0Jvb2x9LFxuICAgKiAgIGlzTG9ja2VkOiB7Qm9vbH0sXG4gICAqICAgZGF0YTogezxzdmc+fDxpbWc+fFN0cmluZ3xpZH1cbiAgICogfVxuICAgKi9cbiAgdGhpcy5fbGF5ZXJzID0gbGF5ZXJzIGluc3RhbmNlb2YgQXJyYXkgP1xuICAgIGxheWVycy5tYXAoZnVuY3Rpb24obGF5ZXIsIGkpIHtcbiAgICAgIHZhciByZXQgPSBjb3B5KExBWUVSX1BST1RPKTtcblxuICAgICAgcmV0LmlkID0gaWRHZW4oKTtcbiAgICAgIHJldC5pc1Zpc2libGUgPSBsYXllci5pc1Zpc2libGUgfHwgdHJ1ZTtcbiAgICAgIHJldC5pc0xvY2tlZCA9IGxheWVyLmlzTG9ja2VkIHx8IGZhbHNlO1xuXG4gICAgICByZXR1cm4gcmV0OztcbiAgICB9KSA6IFtdO1xufVxuXG51dGlsLmluaGVyaXRzKExheWVyU3RvcmUsIGV2ZW50cy5FdmVudEVtaXR0ZXIpO1xuXG5MYXllclN0b3JlLmlkID0gKCtEYXRlLm5vdygpICsgTWF0aC5mbG9vcigweDEwMDAwMDAwMCAqIE1hdGgucmFuZG9tKCkpKS50b1N0cmluZygzNik7XG5cbkxheWVyU3RvcmUudmVyaWZ5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBvYmouaWQgPT09IExheWVyU3RvcmUuaWQ7XG59XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fbGF5ZXJzLmxlbmd0aDtcbn1cblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9sYXllcnMuc2xpY2UoMCk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB0aGlzLmFkZExpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS51bmxpc3RlbiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIGNhbGxiYWNrKTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLnB1Ymxpc2ggPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbWl0KCdjaGFuZ2UnKTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmlzUGxhY2Vob2xkZXIgPSBmdW5jdGlvbih0b2tlbikge1xuICByZXR1cm4gdGhpcy5fbGF5ZXJzW3Rva2VuXS5pZCA9PT0gTEFZRVJfUFJPVE8uaWQ7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5kdXBsaWNhdGVMYXllciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHZhciBkdXAgPSBjb3B5KHRoaXMuX2xheWVyc1t0b2tlbl0pO1xuXG4gICAgZHVwLmlkID0gaWRHZW4oKTtcbiAgICBkdXAuaXNEcmFnZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5fbGF5ZXJzLnNwbGljZSh0b2tlbiArIDEsIDAsIGR1cCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmV4Y2hhbmdlTGF5ZXJzID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgaWYgKGZyb20gPj0gMCAmJiBmcm9tIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCAmJlxuICAgICAgdG8gPj0gMCAmJiB0byA8IHRoaXMuX2xheWVycy5sZW5ndGgpIHtcblxuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG8sIDAsIHRoaXMuX2xheWVycy5zcGxpY2UoZnJvbSwgMSlbMF0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLmluc2VydExheWVyID0gZnVuY3Rpb24odG9rZW4sIGxheWVyKSB7XG4gIHZhciBuZXdMYXllciA9IGNvcHkoTEFZRVJfUFJPVE8pO1xuXG4gIG5ld0xheWVyLmlkID0gaWRHZW4oKTtcbiAgbmV3TGF5ZXIuaXNWaXNpYmxlID0gbGF5ZXIuaXNWaXNpYmxlIHx8IHRydWU7XG4gIG5ld0xheWVyLmlzTG9ja2VkID0gbGF5ZXIuaXNMb2NrZWQgfHwgZmFsc2U7XG4gIG5ld0xheWVyLmRhdGEgPSBsYXllci5kYXRhO1xuXG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4gKyAxLCAwLCBuZXdMYXllcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGF5ZXJzLnB1c2gobmV3TGF5ZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pbnNlcnRMYXllcnMgPSBmdW5jdGlvbih0b2tlbiwgbGF5ZXJzKSB7XG4gIGlmICghKGxheWVycyBpbnN0YW5jZW9mIEFycmF5KSkgcmV0dXJuIGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gbGF5ZXJzLmxlbmd0aDsgaSA8IGo7ICsraSkge1xuICAgIHRoaXMuaW5zZXJ0TGF5ZXIodG9rZW4gKyBpLCBsYXllcnNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5pbnNlcnRQbGFjZWhvbGRlciA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIHRoaXMuX2xheWVycy5zcGxpY2UodG9rZW4sIDAsIExBWUVSX1BST1RPKTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLnJlbW92ZUxheWVyID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgaWYgKHRva2VuID49IDAgJiYgdG9rZW4gPCB0aGlzLl9sYXllcnMubGVuZ3RoKSB7XG4gICAgdGhpcy5fbGF5ZXJzLnNwbGljZSh0b2tlbiwgMSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbkxheWVyU3RvcmUucHJvdG90eXBlLnJlbW92ZVBsYWNlaG9sZGVycyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9sYXllcnMgPSB0aGlzLl9sYXllcnMuZmlsdGVyKGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgcmV0dXJuIGxheWVyLmlkICE9PSBMQVlFUl9QUk9UTy5pZDtcbiAgfSk7XG4gIHJldHVybiB0cnVlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZ2V0RHJhZ2dlZExheWVyVG9rZW5zID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICB0aGlzLl9sYXllcnMuZm9yRWFjaChmdW5jdGlvbihsYXllciwgaSkge1xuICAgIGlmIChsYXllci5pc0RyYWdnZWQpIHJldC5wdXNoKGkpO1xuICB9KTtcblxuICByZXR1cm4gcmV0Lmxlbmd0aCA/IHJldCA6IGZhbHNlO1xufVxuXG5MYXllclN0b3JlLnByb3RvdHlwZS5nZXRQbGFjZWhvbGRlclRva2VucyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0ID0gW107XG5cbiAgdGhpcy5fbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obGF5ZXIsIGkpIHtcbiAgICBpZiAobGF5ZXIuaWQgPT09IExBWUVSX1BST1RPLmlkKSByZXQucHVzaChpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiBmYWxzZTtcbn1cblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuZ2V0TGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHJldHVybiBjb3B5KHRoaXMuX2xheWVyc1t0b2tlbl0pO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuTGF5ZXJTdG9yZS5wcm90b3R5cGUuc2V0TGF5ZXJTdGF0ZSA9IGZ1bmN0aW9uKHRva2VuLCBpc1Zpc2libGUsIGlzTG9ja2VkLCBpc0RyYWdnZWQpIHtcbiAgdmFyIGlzQ2hhbmdlZCA9IGZhbHNlO1xuXG4gIGlmICh0b2tlbiA+PSAwICYmIHRva2VuIDwgdGhpcy5fbGF5ZXJzLmxlbmd0aCkge1xuICAgIHZhciBsYXllciA9IHRoaXMuX2xheWVyc1t0b2tlbl07XG5cbiAgICBpZiAoaXNWaXNpYmxlID09PSB0cnVlIHx8IGlzVmlzaWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgIGxheWVyLmlzVmlzaWJsZSA9IGlzVmlzaWJsZTtcbiAgICB9XG4gICAgaWYgKGlzTG9ja2VkID09PSB0cnVlIHx8IGlzTG9ja2VkID09PSBmYWxzZSkge1xuICAgICAgbGF5ZXIuaXNMb2NrZWQgPSBpc0xvY2tlZDtcbiAgICB9XG4gICAgaWYgKGlzRHJhZ2dlZCA9PT0gdHJ1ZSB8fCBpc0RyYWdnZWQgPT09IGZhbHNlKSB7XG4gICAgICBsYXllci5pc0RyYWdnZWQgPSBpc0RyYWdnZWQ7XG4gICAgfVxuXG4gICAgaXNDaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBpc0NoYW5nZWQ7XG59O1xuXG5MYXllclN0b3JlLnByb3RvdHlwZS5wcmludCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RyID0gJyc7XG5cbiAgdGhpcy5fbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBzdHIgKz0gbGF5ZXIuaWQgKyAnIC0+ICc7XG4gIH0pO1xuXG4gIGNvbnNvbGUubG9nKHN0cik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJTdG9yZTtcbiIsInZhciBMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL0xheWVyU3RvcmUnKTtcbnZhciBMYXllckFjdGlvbiA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTGF5ZXJBY3Rpb24nKTtcblxudmFyIENTUyA9IHtcblxuICBWSVNJQkxFOiAndWktdmlzaWJsZScsXG4gIElOVklTSUJMRTogJ3VpLWludmlzaWJsZScsXG5cbiAgTE9DS0VEOiAndWktbG9ja2VkJyxcbiAgVU5MT0NLRUQ6ICd1aS11bmxvY2tlZCdcblxufTtcblxudmFyIExheWVySXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0b2tlbjogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICBzdG9yZTogTGF5ZXJTdG9yZS52ZXJpZnksXG4gICAgYWN0aW9uOiBMYXllckFjdGlvbi52ZXJpZnksXG4gICAgaXNWaXNpYmxlOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBpc0xvY2tlZDogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8bGkgaWQ9e3RoaXMucHJvcHMuaWR9XG4gICAgICAgICAgY2xhc3NOYW1lPSd1aS1sYXllcidcbiAgICAgICAgICBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX1cbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5wcm9wcy5vbk1vdXNlRG93bn1cbiAgICAgICAgICBvbk1vdXNlVXA9e3RoaXMucHJvcHMub25Nb3VzZVVwfSA+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9J2NoZWNrYm94J1xuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuaXNWaXNpYmxlfVxuICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5fdmlzaWJsZUNzcygpfVxuICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLnByb3BzLm9uTW91c2VPdmVyfVxuICAgICAgICAgIG9uTW91c2VPdXQ9e3RoaXMucHJvcHMub25Nb3VzZU91dH0gLz5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT0nY2hlY2tib3gnXG4gICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5pc0xvY2tlZH1cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuX2xvY2tlZENzcygpfVxuICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLnByb3BzLm9uTW91c2VPdmVyfVxuICAgICAgICAgIG9uTW91c2VPdXQ9e3RoaXMucHJvcHMub25Nb3VzZU91dH0gLz5cbiAgICAgICAgPHNwYW4+eydMYXllcjogJyArIHRoaXMucHJvcHMuaWR9PC9zcGFuPlxuICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2RlbGV0ZUxheWVyfT5cbiAgICAgICAgICBkZWxldGVcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fZHVwbGljYXRlTGF5ZXJ9PlxuICAgICAgICAgIGR1cGxpY2F0ZVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfSxcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHVibGljIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBQcml2YXRlIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBfdmlzaWJsZUNzczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuaXNWaXNpYmxlID8gQ1NTLlZJU0lCTEUgOiBDU1MuSU5WSVNJQkxFO1xuICB9LFxuXG4gIF9sb2NrZWRDc3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmlzTG9ja2VkID8gQ1NTLkxPQ0tFRCA6IENTUy5VTkxPQ0tFRDtcbiAgfSxcblxuICBfZGVsZXRlTGF5ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5wcm9wcy5hY3Rpb247XG5cbiAgICBhY3Rpb24uZGVsZXRlTGF5ZXIodGhpcy5wcm9wcy50b2tlbik7XG4gIH0sXG5cbiAgX2R1cGxpY2F0ZUxheWVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMucHJvcHMuYWN0aW9uO1xuXG4gICAgYWN0aW9uLmR1cGxpY2F0ZUxheWVyKHRoaXMucHJvcHMudG9rZW4pO1xuICB9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExheWVySXRlbTtcbiIsInZhciBMYXllclN0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL0xheWVyU3RvcmUnKTtcbnZhciBMYXllckFjdGlvbiA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvTGF5ZXJBY3Rpb24nKTtcbnZhciBMYXllckl0ZW0gPSByZXF1aXJlKCcuL0xheWVySXRlbScpO1xuXG52YXIgTGF5ZXJzUGFuZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgc3RvcmU6IExheWVyU3RvcmUudmVyaWZ5LFxuICAgIGFjdGlvbjogTGF5ZXJBY3Rpb24udmVyaWZ5LFxuICAgIGxheWVyczogUmVhY3QuUHJvcFR5cGVzLmFycmF5XG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLyoqXG4gICAgICAgKiBAcmV0dXJuIHtMYXllclN0b3JlfSBpbnN0YW5jZSBvZiAuLi9zdG9yZXMvTGF5ZXJTdG9yZS5qcywgc2hvdWxkbid0XG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgICBtb2RpZnkgaXQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uXG4gICAgICAgKi9cbiAgICAgIHN0b3JlOiB0aGlzLnByb3BzLnN0b3JlLnN0b3JlLFxuXG4gICAgICAvKipcbiAgICAgICAqIEByZXR1cm4ge0xheWVyQWN0aW9ufSBpbnN0YW5jZSBvZiAuLi9hY3Rpb25zL0xheWVyQWN0aW9uLmpzLCBzaG91bGRuJ3RcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICBtb2RpZnkgaXQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uXG4gICAgICAgKi9cbiAgICAgIGFjdGlvbjogdGhpcy5wcm9wcy5zdG9yZS5hY3Rpb24sXG5cbiAgICAgIC8qKlxuICAgICAgICogQHJldHVybiB7QXJyYXl9IExheWVycyBjb3B5IGdvdCBmcm9tIHN0b3JlIChtdXRhYmxlKS5cbiAgICAgICAqL1xuICAgICAgbGF5ZXJzOiB0aGlzLnByb3BzLnN0b3JlLnN0b3JlLmdldEFsbCgpLFxuXG4gICAgICAvKipcbiAgICAgICAqIEByZXR1cm4ge09iamVjdH0gQXJicml0cmFyeSB0eXBlLiBJdCBpcyB1c2VkIHRvIGZvcmNlIGNvbXBvbmVudCB0byByZW5kZXIuXG4gICAgICAgKi9cbiAgICAgIGZvcmNlZFVwZGF0ZTogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLnN0YXRlLnN0b3JlO1xuXG4gICAgc3RvcmUubGlzdGVuKHRoaXMuX29uU3RvcmVDaGFuZ2UpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLnN0YXRlLnN0b3JlO1xuXG4gICAgc3RvcmUudW5saXN0ZW4odGhpcy5fb25TdG9yZUNoYW5nZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxheWVycyA9IHRoaXMuc3RhdGUubGF5ZXJzLm1hcChmdW5jdGlvbihsYXllciwgaSkge1xuICAgICAgdmFyIHN0b3JlID0gc2VsZi5zdGF0ZS5zdG9yZTtcblxuICAgICAgcmV0dXJuICg8TGF5ZXJJdGVtXG4gICAgICAgICAgICAgICAgICBpZD17bGF5ZXIuaWR9XG4gICAgICAgICAgICAgICAgICB0b2tlbj17aX1cbiAgICAgICAgICAgICAgICAgIGlzVmlzaWJsZT17bGF5ZXIuaXNWaXNpYmxlfVxuICAgICAgICAgICAgICAgICAgaXNMb2NrZWQ9e2xheWVyLmlzTG9ja2VkfVxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3NlbGYuX2xheWVySW5saW5lU3R5bGUoaSl9XG4gICAgICAgICAgICAgICAgICBzdG9yZT17c2VsZi5zdGF0ZS5zdG9yZX1cbiAgICAgICAgICAgICAgICAgIGFjdGlvbj17c2VsZi5zdGF0ZS5hY3Rpb259XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17c2VsZi5fb25MYXllck1vdXNlT3Zlck91dC5iaW5kKHNlbGYsIGkpfVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZU91dD17c2VsZi5fb25MYXllck1vdXNlT3Zlck91dC5iaW5kKHNlbGYsIGkpfVxuICAgICAgICAgICAgICAgICAgb25Nb3VzZURvd249e3NlbGYuX29uTGF5ZXJNb3VzZURvd24uYmluZChzZWxmLCBpKX1cbiAgICAgICAgICAgICAgICAgIG9uTW91c2VVcD17c2VsZi5fb25MYXllck1vdXNlVXAuYmluZChzZWxmLCBpKX0gLz4pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPSd1aS1sYXllci1wYW5lbCB1aS1ub3NlbGVjdCdcbiAgICAgICAgICAgb25Nb3VzZVVwPXt0aGlzLl9vbkNvbnRhaW5lck1vdXNlVXB9XG4gICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5fb25Db250YWluZXJNb3VzZVVwfVxuICAgICAgICAgICBvbk1vdXNlTW92ZT17dGhpcy5fb25Db250YWluZXJNb3VzZU1vdmV9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndWktbGF5ZXItaGVhZGVyJz5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9J2NoZWNrYm94J1xuICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5faXNBbGxWaXNpYmxlKCl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fdG9nZ2xlQWxsVmlzaWJsZX0+XG4gICAgICAgICAgICBUb2dnbGUgVmlzaWJsZVxuICAgICAgICAgIDwvaW5wdXQ+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPSdjaGVja2JveCdcbiAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuX2lzQWxsTG9ja2VkKCl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fdG9nZ2xlQWxsTG9ja2VkfT5cbiAgICAgICAgICAgIFRvZ2dsZSBMb2NrZWRcbiAgICAgICAgICA8L2lucHV0PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT0ndWktbGF5ZXItY29udGFpbmVyJyBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0+XG4gICAgICAgICAge2xheWVyc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gICAgLy8gPHVsIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZSd9fT5cbiAgfSxcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gUHVibGljIEZ1bmN0aW9ucyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIFByaXZhdGUgRnVuY3Rpb25zIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIF9vZmZzZXQ6IGZhbHNlLFxuXG4gIF9wb3NpdGlvbjogZmFsc2UsXG5cbiAgX2RyYWdnZWQ6IGZhbHNlLFxuXG4gIF9kcmFnZ2VkUGFyZW50OiBmYWxzZSxcblxuICBfdG9nZ2xlZDogZmFsc2UsXG5cbiAgX2xheWVyU2hvdWxkVmlzaWJsZTogdW5kZWZpbmVkLFxuXG4gIF9sYXllclNob3VsZExvY2tlZDogdW5kZWZpbmVkLFxuXG4gIF9sYXllcklubGluZVN0eWxlOiBmdW5jdGlvbih0b2tlbikge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuc3RhdGUuc3RvcmU7XG4gICAgdmFyIHN0eWxlID0gbnVsbDtcblxuICAgIGlmIChzdG9yZS5pc1BsYWNlaG9sZGVyKHRva2VuKSkge1xuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIG9wYWNpdHk6ICcwJ1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHN0b3JlLmdldExheWVyU3RhdGUodG9rZW4pLmlzRHJhZ2dlZCAmJiB0aGlzLl9wb3NpdGlvbikge1xuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICB6SW5kZXg6ICcxMDAnLFxuICAgICAgICBsZWZ0OiB0aGlzLl9wb3NpdGlvbi5sZWZ0ICsgJ3B4JyxcbiAgICAgICAgdG9wOiB0aGlzLl9wb3NpdGlvbi50b3AgKyAncHgnXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZTtcbiAgfSxcblxuICBfb25MYXllck1vdXNlRG93bjogZnVuY3Rpb24obGF5ZXJUb2tlbiwgZSkge1xuICAgIHZhciBlbCA9IGUudGFyZ2V0O1xuICAgIHZhciBlbFRhZ05hbWUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGVsUGFyZW50ID0gZWwucGFyZW50Tm9kZTtcblxuICAgIGlmIChlbFRhZ05hbWUgPT09ICdpbnB1dCcpIHtcbiAgICAgIHZhciBzdGF0ZVRva2VuID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChlbFBhcmVudC5jaGlsZE5vZGVzLCBlbCk7XG4gICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnN0b3JlLmdldExheWVyU3RhdGUobGF5ZXJUb2tlbik7XG5cbiAgICAgIHRoaXMuX3RvZ2dsZWQgPSBlbDtcbiAgICAgIHRoaXMuX2xheWVyU2hvdWxkVmlzaWJsZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2xheWVyU2hvdWxkTG9ja2VkID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoc3RhdGVUb2tlbiA9PT0gMCkge1xuICAgICAgICB0aGlzLl9sYXllclNob3VsZFZpc2libGUgPSAhc3RhdGUuaXNWaXNpYmxlO1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZVRva2VuID09PSAxKSB7XG4gICAgICAgIHRoaXMuX2xheWVyU2hvdWxkTG9ja2VkID0gIXN0YXRlLmlzTG9ja2VkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWxUYWdOYW1lID09PSAnbGknKSB7XG4gICAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG4gICAgICB2YXIgZWxCb3VuZCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICB0aGlzLl9kcmFnZ2VkID0gZWwuaWQ7XG4gICAgICB0aGlzLl9kcmFnZ2VkUGFyZW50ID0gZWwucGFyZW50RWxlbWVudDtcbiAgICAgIHRoaXMuX29mZnNldCA9IHtcbiAgICAgICAgeDogZS5jbGllbnRYIC0gZWxCb3VuZC5sZWZ0LFxuICAgICAgICB5OiBlLmNsaWVudFkgLSBlbEJvdW5kLnRvcFxuICAgICAgfTtcbiAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKGUpO1xuXG4gICAgICBhY3Rpb24uc3RhcnREcmFnTGF5ZXIobGF5ZXJUb2tlbik7XG4gICAgfVxuICB9LFxuXG4gIF9vbkxheWVyTW91c2VVcDogZnVuY3Rpb24obGF5ZXJUb2tlbiwgZSkge1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICB2YXIgZWxUYWdOYW1lID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBlbFBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG5cbiAgICBpZiAoZWxUYWdOYW1lID09PSAnaW5wdXQnKSB7XG4gICAgICBpZiAoZWwgPT09IHRoaXMuX3RvZ2dsZWQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5fdG9nZ2xlZCkge1xuICAgICAgICB2YXIgc3RhdGVUb2tlbiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoZWxQYXJlbnQuY2hpbGROb2RlcywgZWwpO1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlLnN0b3JlLmdldExheWVyU3RhdGUobGF5ZXJUb2tlbik7XG5cbiAgICAgICAgaWYgKHN0YXRlVG9rZW4gPT09IDApIHtcbiAgICAgICAgICBhY3Rpb24uc2V0TGF5ZXJTdGF0ZShsYXllclRva2VuLCAhc3RhdGUuaXNWaXNpYmxlLCB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlVG9rZW4gPT09IDEpIHtcbiAgICAgICAgICBhY3Rpb24uc2V0TGF5ZXJTdGF0ZShsYXllclRva2VuLCB1bmRlZmluZWQsICFzdGF0ZS5pc0xvY2tlZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX29uTGF5ZXJNb3VzZU92ZXJPdXQ6IGZ1bmN0aW9uKGxheWVyVG9rZW4sIGUpIHtcbiAgICBpZiAodGhpcy5fdG9nZ2xlZCkge1xuICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuXG4gICAgICB0aGlzLl90b2dnbGVkLmJsdXIoKTtcblxuICAgICAgYWN0aW9uLnNldExheWVyU3RhdGUobGF5ZXJUb2tlbiwgdGhpcy5fbGF5ZXJTaG91bGRWaXNpYmxlLCB0aGlzLl9sYXllclNob3VsZExvY2tlZCk7XG4gICAgfVxuICB9LFxuXG4gIF9vbkNvbnRhaW5lck1vdXNlVXA6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICBpZiAodGhpcy5fZHJhZ2dlZCkge1xuICAgICAgYWN0aW9uLnN0b3BEcmFnTGF5ZXIoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wb3NpdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMuX29mZnNldCA9IGZhbHNlO1xuICAgIHRoaXMuX2RyYWdnZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9kcmFnZ2VkUGFyZW50ID0gZmFsc2U7XG4gICAgdGhpcy5fdG9nZ2xlZCA9IGZhbHNlO1xuICB9LFxuXG4gIF9vbkNvbnRhaW5lck1vdXNlTW92ZTogZnVuY3Rpb24oZSkge1xuICAgIGlmICghdGhpcy5fZHJhZ2dlZCkgcmV0dXJuO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBhY3Rpb24gPSB0aGlzLnN0YXRlLmFjdGlvbjtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLnN0YXRlLnN0b3JlO1xuICAgIHZhciBsYXllcnMgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwodGhpcy5fZHJhZ2dlZFBhcmVudC5jaGlsZHJlbiwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGUuaWQgIT09ICckcGxhY2Vob2xkZXInO1xuICAgIH0pO1xuXG4gICAgbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24obm9kZSwgaSkge1xuICAgICAgaWYgKG5vZGUuaWQgIT09IHNlbGYuX2RyYWdnZWQpIHtcbiAgICAgICAgdmFyIHNpYmxpbmdCb3VuZCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgaWYgKGUuY2xpZW50WSA+IHNpYmxpbmdCb3VuZC50b3AgJiZcbiAgICAgICAgICAgIGUuY2xpZW50WSA8IHNpYmxpbmdCb3VuZC5ib3R0b20pIHtcblxuICAgICAgICAgIGFjdGlvbi5tb3ZlRHJhZ2dlZExheWVyKGkpO1xuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oZSk7XG4gIH0sXG5cbiAgX3VwZGF0ZVBvc2l0aW9uOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHBCb3VuZCA9IHRoaXMuX2RyYWdnZWRQYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLl9wb3NpdGlvbiA9IHtcbiAgICAgIC8vIGxlZnQ6IGUuY2xpZW50WCAtIHBCb3VuZC5sZWZ0IC0gdGhpcy5fb2Zmc2V0LngsXG4gICAgICBsZWZ0OiA1LFxuICAgICAgdG9wOiBlLmNsaWVudFkgLSBwQm91bmQudG9wIC0gdGhpcy5fb2Zmc2V0LnlcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmb3JjZWRVcGRhdGU6IERhdGUubm93KClcbiAgICB9KTtcbiAgfSxcblxuICBfaXNBbGxWaXNpYmxlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5sYXllcnMuZXZlcnkoZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgIHJldHVybiBsYXllci5pZCA9PT0gJyRwbGFjZWhvbGRlcicgfHwgbGF5ZXIuaXNWaXNpYmxlID09PSB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIF9pc0FsbExvY2tlZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUubGF5ZXJzLmV2ZXJ5KGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgICByZXR1cm4gbGF5ZXIuaWQgPT09ICckcGxhY2Vob2xkZXInIHx8IGxheWVyLmlzTG9ja2VkID09PSB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIF90b2dnbGVBbGxWaXNpYmxlOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGFjdGlvbiA9IHRoaXMuc3RhdGUuYWN0aW9uO1xuXG4gICAgYWN0aW9uLnNldEFsbExheWVyU3RhdGUoIXRoaXMuX2lzQWxsVmlzaWJsZSgpLCB1bmRlZmluZWQpO1xuICB9LFxuXG4gIF90b2dnbGVBbGxMb2NrZWQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYWN0aW9uID0gdGhpcy5zdGF0ZS5hY3Rpb247XG5cbiAgICBhY3Rpb24uc2V0QWxsTGF5ZXJTdGF0ZSh1bmRlZmluZWQsICF0aGlzLl9pc0FsbExvY2tlZCgpKTtcbiAgfSxcblxuICBfb25TdG9yZUNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsYXllcnM6IHRoaXMuc3RhdGUuc3RvcmUuZ2V0QWxsKCksXG4gICAgfSk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJzUGFuZWw7XG4iXX0=
