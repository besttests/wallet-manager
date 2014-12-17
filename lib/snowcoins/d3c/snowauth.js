var keystone = require('keystone'),
	utils = require('keystone-utils'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists'),
	fs = require('fs'),
	async = require('async'),
	crypto = require('crypto'),
	_ = require('lodash'),
	request = require('request'),
	Wallet = snowlist.wallets,
	ClientConnect = snowlist.clients,
	CurrentWallets = snowlist.attended,		
	Offline = snowlist.unattended,
	iprange = require('range_check');

//console.log(keystone.list('ClientConnect'));

var SnowAuth = {
	_options: {
		key:false,
		ip:false,
		authlevel:11,
		isAuthorized:false,
		owner:false
	}
	//this.set('agenda', );
    	
}


/**
 * Initialises SnowAuth in encapsulated mode.
 * 
 * Options expects  {key,ip,nonce} to authorize later.
 * 
 * First time running the nonce will be empty
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

SnowAuth.init = function(options) {
	
	this.options(options);	
	
	return this;
	
}


/**
 * authorizes requester
 * 
 * Returns this if true and kicks error if false
 *
 * @param {Int} auth level of function
 * @param {Function} Callback
 * @api public
 */

SnowAuth.auth = function(level,callback) {
	var thisobject = this,
		ip = this.get('ip'),
		key = this.get('key'),
		user=false,
		ClientConnect = keystone.list('ClientConnect');
	var args = Array.prototype.slice.call(arguments),
		cb  = args.pop();
	//loop through each roadblock with async
	//if anything fails send an error straight back to user with snowfail and return false
	async.series([
		function(next) {
			//grap data from  key first
			ClientConnect.model.findOne()
				.where('apikey', key)				
				.exec(function(err, data) {
					if(data) {
						user=data;
						thisobject.set('authlevel',user.authlevel);
						thisobject.set('owner',user.owner);
						thisobject.set('_id',user._id);
						thisobject.set('name',user.name);
						next();
					} else {
						console.log('no key found');
						return (SnowAuth.iscallback(cb) ? cb('Valid API key required'):thisobject);
					}
				});
		},
		function(next) {
			//now check the ip vs registered range
			//console.log(ip,user.ip);
			//console.log('pass ip check',iprange.in_range(ip, user.ip));
			if(!ip || !iprange.in_range(ip, user.ip)) {
				return (SnowAuth.iscallback(cb) ? cb('Failed IP Check'):thisobject);
			} else {
				next();
			}			
		},
		function(next) {
			//if there is a level check it
			if(typeof level === 'number') {
				if(SnowAuth.checkauth(level))
					next();
				else
					return (SnowAuth.iscallback(cb) ? cb('Failed Level Authorization Check'):thisobject);
			} else {
				next();
			}			
		}
	],
	function(err) {
		//this user is good so just return the ret variable set earlier
		thisobject.set('isAuthorized',true)
		return (SnowAuth.iscallback(cb) ? cb(null,thisobject):thisobject);
	});
	
}

/**
 * check auth level
 * 
 * return true / false
 * 
 * @param {Integer} value
 * @api public
 */
SnowAuth.checkauth = function(level) {
	if(this.get('authlevel')<=level)
		return true;
	else
		return false;
}

/**
 * return function
 * 
 * return this if not a function
 * 
 * @param {Function} value
 * @param {Object} self
 * @api public
 */
SnowAuth.doreturn = function(ret,self) {
	if(typeof ret === 'function') {
		return ret(self);
	} else {
		if(self)ret=self;
		return ret;
	}	
}

/**
 * Is the callback a function
 * 
 * ####Example:
 * 
 *     SnowAuth.iscallback(cb) // is this a callback
 * 
 * @param {Function} value
 * @api public
 */
SnowAuth.iscallback = function (checkme) {
	return typeof checkme === 'function' ? true:false;
}



/**
 * Sets SnowAuth options
 * 
 * ####Example:
 * 
 *     SnowAuth.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 SnowAuth.set = function(key, value) {
	
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
 * Sets multiple SnowAuth options.
 *
 * ####Example:
 *
 *     SnowAuth.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

SnowAuth.options = function(options) {
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
 *     SnowAuth.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

SnowAuth.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets SnowAuth options
 *
 * ####Example:
 *
 *     SnowAuth.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

SnowAuth.get = SnowAuth.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     SnowAuth.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

SnowAuth.encrypt = function(text,password) {
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
 *     SnowAuth.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
SnowAuth.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



/**
 * The exports object is an instance of SnowAuth.
 *
 * @api public
 */

var SnowAuth = module.exports = SnowAuth;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
