(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var login = require('../../templates/views/api/d3c/login.jade'),
	chatbox = require('../../templates/views/api/d3c/chatbox.jade'),
	ledgerform = require('../../templates/views/api/d3c/forms/ledger.jade');
bonehtml = {
	login : function(options) {
		if(!options instanceof Object)options={};
		console.log('login html');
		return login(options);
	},
	ledgerform : function(options) {
		if(!options instanceof Object)options={};
		console.log('ledgerform html');
		return ledgerform(options);
	},
	chatbox : function(options) {
		if(!options instanceof Object)options={};
		console.log('chatbox html');
		return chatbox(options);
	},
	'404' : function(){ return '<div class="requesterror" style="margin:40px"><span> You did something I am not prepared for.  Do something else next time please.</span></div>'},
	
}

},{"../../templates/views/api/d3c/chatbox.jade":3,"../../templates/views/api/d3c/forms/ledger.jade":4,"../../templates/views/api/d3c/login.jade":5}],2:[function(require,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div id=\"chatbox\" class=\"d3ccontent col-xs-12\"><div class=\"userbox col-xs-12 col-sm-3 col-md-2\"><div id=\"chatusers\"></div></div><div class=\"messagebox col-xs-12 col-sm-9 col-md-10\"><div id=\"chatmessages\"></div></div><div class=\"clearfix sendbox col-xs-12\"><div class=\"col-xs-8 col-sm-9 col-md-10\"><input id=\"s-message\" class=\"form-control\"/><input id=\"s-room\" type=\"hidden\" value=\"\"/></div><div class=\"col-xs-4 col-sm-3 col-md-2\"><button id=\"s-send\" class=\"btn btn-default\">Send</button></div></div><div class=\"clearfix\"></div></div><div class=\"clearfix\"></div>");;return buf.join("");
};
},{"jade/runtime":2}],4:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (snowtext, ledgercurrency, ledgertotal, ledgertotaloffset) {
buf.push("<form id=\"ledgerForm\"><div class=\"col-xs-12\"><div class=\"form-group input-group\"><span class=\"input-group-addon input-group-sm coinstamp\">" + (jade.escape((jade_interp = snowtext.d3c.ledgerform.inputs.ledgerid.label) == null ? '' : jade_interp)) + " </span><input id=\"ledgerid\" name=\"ledgerid\"" + (jade.attr("placeholder", "" + (snowtext.d3c.ledgerform.inputs.ledgerid.placeholder) + "", true, false)) + " class=\"form-control coinstamp\"/><input type=\"hidden\" id=\"ledgerkey\"/></div><div class=\"form-group input-group\"><span class=\"input-group-addon input-group-sm coinstamp\">" + (jade.escape((jade_interp = snowtext.d3c.ledgerform.inputs.currency.label) == null ? '' : jade_interp)) + "</span><select id=\"ledgercurrency\" name=\"ledgercurrency\"" + (jade.attr("value", "" + (ledgercurrency) + "", true, false)) + " class=\"form-control\"><option>usd</option><option>eur</option></select></div><div class=\"form-group input-group\"><span class=\"input-group-addon input-group-sm coinstamp\">" + (jade.escape((jade_interp = snowtext.d3c.ledgerform.inputs.total.label) == null ? '' : jade_interp)) + "</span><input type=\"text\" id=\"ledgertotal\" name=\"ledgertotal\"" + (jade.attr("placeholder", "" + (snowtext.d3c.ledgerform.inputs.total.placeholder) + "", true, false)) + (jade.attr("value", "" + (ledgertotal || '') + "", true, false)) + " class=\"form-control coinstamp\"/></div><div class=\"form-group input-group\"><span class=\"input-group-addon input-group-sm coinstamp\">" + (jade.escape((jade_interp = snowtext.d3c.ledgerform.inputs.totaloffset.label) == null ? '' : jade_interp)) + "<span style=\"margin-left:3px;\" data-toggle=\"tooltip\" data-placement=\"right\" data-container=\"body\"" + (jade.attr("title", "" + (snowtext.d3c.ledgerform.inputs.totaloffset.help) + "", true, false)) + " class=\"glyphicon glyphicon-info-sign bstooltip\"></span></span><input type=\"text\" id=\"ledgertotaloffset\" name=\"ledgertotaloffset\"" + (jade.attr("placeholder", "" + (snowtext.d3c.ledgerform.inputs.totaloffset.placeholder) + "", true, false)) + (jade.attr("value", "" + (ledgertotaloffset || '') + "", true, false)) + " class=\"form-control coinstamp\"/></div><div class=\"form-group\"><button type=\"submit\" id=\"buttonsend\"" + (jade.attr("data-loading", '' + (snowtext.d3c.ledgerform.buttons.submit.loading) + '', true, false)) + " class=\"btn btn-primary btn-sm snowsendcoin\">" + (jade.escape((jade_interp = snowtext.d3c.ledgerform.buttons.submit.label) == null ? '' : jade_interp)) + "</button></div><div class=\"clearfix\"></div></div></form>");}("snowtext" in locals_for_with?locals_for_with.snowtext:typeof snowtext!=="undefined"?snowtext:undefined,"ledgercurrency" in locals_for_with?locals_for_with.ledgercurrency:typeof ledgercurrency!=="undefined"?ledgercurrency:undefined,"ledgertotal" in locals_for_with?locals_for_with.ledgertotal:typeof ledgertotal!=="undefined"?ledgertotal:undefined,"ledgertotaloffset" in locals_for_with?locals_for_with.ledgertotaloffset:typeof ledgertotaloffset!=="undefined"?ledgertotaloffset:undefined));;return buf.join("");
};
},{"jade/runtime":2}],5:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (d3ckey) {
buf.push("<div><h1>snowcoins</h1><p>DCC Command    </p><div id=\"joind4html\"><div style=\"display:none;\" class=\"adderror\"></div><div role=\"form\" class=\"row\"><p>Enter the key that you generated on the home app.</p></div><div role=\"form\" class=\"row\"><div class=\"form-group input-group\"><span class=\"input-group-addon input-group-md coinstamp\">D3C Key</span><input id=\"d3ckey\"" + (jade.attr("value", d3ckey, true, false)) + " name=\"d3ckey\" placeholder=\"D3C Key\" class=\"form-control coinstamp\"/></div></div><div role=\"form\" class=\"row\"><button class=\"btn btn-primary\">Login</button></div></div></div>");}("d3ckey" in locals_for_with?locals_for_with.d3ckey:typeof d3ckey!=="undefined"?d3ckey:undefined));;return buf.join("");
};
},{"jade/runtime":2}]},{},[1])