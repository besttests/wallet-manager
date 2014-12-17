var keystone = require('keystone'),
	utils = require('keystone-utils'),
	fs = require('fs'),
	crypto = require('crypto'),
	_ = require('lodash'),
	request = require('request'),
	getrates = require('../coinrates.js'),
	snowcoinsApi = require('snowcoins-api');

var Status = function() {
	
	this._options = {

	};
	//this.set('agenda', );
    	
}


/**
 * Initialises Status in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Status.prototype.init = function(options) {
	
	this.options(options);	
	
	return this;
	
}


/**
 * Is the callback a function
 * 
 * ####Example:
 * 
 *     Status.iscallback(cb) // is this a callback
 * 
 * @param {Function} value
 * @api public
 */
Status.prototype.iscallback = function (checkme) {
	return typeof checkme === 'function' ? true:false;
}



/**
 * Sets Status options
 * 
 * ####Example:
 * 
 *     Status.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Status.prototype.set = function(key, value) {
	
	if (arguments.length == 1) {
		return this._options[key];
	}
	
	if (remappedOptions[key]) {
		console.log('Warning: the `' + key + '` option has been deprecated. Please use `' + remappedOptions[key] + '` instead.\n\n' +
			'Support for `' + key + '` will be removed in a future version.');
		key = remappedOptions[key];
	}
	
	// handle special settings if needed
	switch (key) {
		case 'api':
			if(value!=this.get('api') && api!='')
			{
				var myapi = this.useapi(value);
				if(myapi.success==true) {
					api = myapi.api;
				}
				else { 
					console.log(myapi.err);
				}
			}
			else
			{
				//console.log('keep current api');
			}
			break;		
	}
	
	this._options[key] = value;
	return this;
};


/**
 * Sets multiple Status options.
 *
 * ####Example:
 *
 *     Status.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Status.prototype.options = function(options) {
	if (!arguments.length)
		return this._options;
	if (utils.isObject(options)) {
		var keys = Object.keys(options),
			i = keys.length,
			k;
		while (i--) {
			k = keys[i];
			this.set(k, options[k]);
		}
	}
	return this._options;
};

/**
 * Gets a path option, expanded to include process.cwd() if it is relative
 *
 * ####Example:
 *
 *     Status.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Status.prototype.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets Status options
 *
 * ####Example:
 *
 *     Status.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Status.prototype.get = Status.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     Status.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Status.prototype.encrypt = function(text,password) {
  var cipher = crypto.createCipher('aes-256-cbc',password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

/**
 * simple decrypt -  - change to createDecipheriv if you changed encrypt
 *
 * ####Example:
 *
 *     Status.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Status.prototype.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



/**
 * The exports object is an instance of Status.
 *
 * @api public
 */

var Status = module.exports = new Status;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
