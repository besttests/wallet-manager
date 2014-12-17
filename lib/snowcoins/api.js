var utils = require('keystone-utils'),
	fs = require('fs'),
	crypto = require('crypto'),
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists');



var Snowcoin = {
	_options: {}
}
		

/**
 * Initialises Snowcoin in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Snowcoin.init = function(options) {
	
	this._options = {
		'host':'localhost',
		'port':'22555',
		'username':'',
		'password':'',
		'apikey':'',
		'apipin':'',
		'isSSL':false,
		'method':'POST',
		'libpath':__dirname + '/apis/'
	};
	/** default api setup inside set */
	this.set('api','rpc');
	this.options(options);	
	
	return this;
	
}


/**
 * Sets snowcoin api
 * 
 * ####Example:
 * 
 *     snowcoin.useapi('rpc') // sets the 'api' var to include to the correct object
 * 
 * @param {String} value
 * @api public
 */
Snowcoin.useapi = function (value) {
	if(!value){
		console.log('ERROR: No api chosen');
		return {'success':false,'err':'ERROR: No api chosen'};
	}
	if (fs.existsSync(this.getPath('libpath')+value+'.js')) {
		//console.log('use api '+value);
		return {'success':true,'api':require(this.getPath('libpath')+value+'.js')};
	}
	else {
		//console.log('ERROR: Could not include api from: '+this.getPath('libpath')+value+'.js');
		return {'success':false,'err':'ERROR: Could not include api from: '+this.getPath('libpath')+value+'.js'};
	}
}

/**
 * Send auth vars to api for them to deal with
 * 
 * #### Example:
 * 
 *      snowcoin.auth() // sends an auth object to the chosen api
 * 
 * 		returns this for chaining
 * 
 * 
 * @api public
 */
Snowcoin.auth = function() {
	this._api.init(this._options);
	this._api.auth(this._options);
	
	return this;
}

/**
 * get server info
 * 
 * #### Example:
 * 
 *      snowcoin.status(callback) // grabs the info object from rpc server
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'info':Obj{}
 * 		}
 * 
 * @param {String} callback
 * @api public
 */
Snowcoin.status = function(cb) {
	this._api.status(function(m) { 
		return cb(m);
	});
	
}

/**
 * get balance
 * 
 * #### Example:
 * 
 *      snowcoin.balance(type,value,callback) 
 * 		// set type and value to false for entire wallet balance
 * 		// type =  false || account || address
 * 		// value = false || name    || coin address 
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'balance':AMOUNT
 * 		}
 * 
 * @param {String} type
 * @param {String} value
 * @param {Function} public
 * @api public
 */
Snowcoin.balance = function(type,value,cb) {
	this._api.balance(type,value,function(m) { 
		return cb(m);
	});
}


/**
 * get account list
 * 
 * #### Example:
 * 
 *      snowcoin.listaccounts(callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{	'success':true/false,
 * 			'accounts':Obj{ name:'name',
 * 					balance:'balance',
 *                         
 * 				}
 * 		   }
 * 
 * @param {Function} callback
 * @api public
 */
Snowcoin.listaccounts = function(cb) {
	this._api.listaccounts(function(result) { 
		return cb(result);
	});
}


/**
 * get account list with addresses
 * 
 * #### Example:
 * 
 *      snowcoin.listaccountswithaddresses(callback) // 
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'accounts':Obj{ name:'name',
 * 					balance:'balance',
 *                          		addresses:Obj{'a':address,'b':receivedAmount}
 * 			}
 * 		   }
 * 
 * @param {Function} callback
 * @api public
 */
Snowcoin.listaccounts = function(cb) {
	this._api.listaccountswithaddresses(function(result) { 
		return cb(result);
	});
}


/**
 * move coin between accounts
 * 
 * #### Example:
 * 
 *      snowcoin.movecoin(from,to,amount,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'err':error / Obj
 * 			'msg':message
 * 		   }
 * 
 * @param {String} from
 * @param {String} to
 * @param {Int} amount
 * @param {Function} callback
 * @api public
 */
Snowcoin.movecoin = function(from,to,amount,cb) {
	this._api.movecoin(from,to,amount,function(result) { 
		return cb(result);
	});
}

/**
 * move address to account
 * 
 * #### Example:
 * 
 *      snowcoin.setaccount(address,account,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'err':error / Obj
 * 			'msg':message
 * 		   }
 * 
 * @param {String} address
 * @param {String} account
 * @param {Function} callback
 * @api public
 */
Snowcoin.setaccount = function(address,account,cb) {
	this._api.setaccount(address,account,function(result) { 
		return cb(result);
	});
}

/**
 * get a new address for account
 * 
 * #### Example:
 * 
 *      snowcoin.newaddress(account,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			address : newaddress
 * 			err : error/Obj
 * 			msg : message
 * 		   }
 * 
 * @param {String} account
 * @param {Function} callback
 * @api public
 */
Snowcoin.newaddress = function(account,cb) {
	this._api.newaddress(account,function(result) { 
		return cb(result);
	});
}

/**
 * list transactions
 * 
 * #### Example:
 * 
 *      snowcoin.listtransactions(account,num,start,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			transactions :  Obj {
 * 								account : string,
 * 								category : string,
 * 								time : timestamp,
 * 								amount : int,
 * 								otheraccount : string,
 * 								comment : string,
 * 								address : string,
 * 								fee : string,
 * 								blocktime : timestamp,
 * 								blockindex : int,
 * 								blockhash : string,
 * 								timereceived : timestamp,
 * 								to: string,
 * 								confirmations : string
 * 								}
 * 								
 * 			err : error/Obj
 * 			msg : message
 * 		   }
 * 
 * @param {String} account
 * @param {Int} num
 * @param {Int} start
 * @param {Function} callback
 * @api public
 */
Snowcoin.listtransactions = function(account,num,start,cb) {
	this._api.listtransactions(account,num,start,function(result) { 
		
		return cb(result);
	});
}

/**
 * get transaction
 * 
 * #### Example:
 * 
 *      snowcoin.gettransaction(txid,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			transaction :  Obj {
 * 								amount : int,
 * 								confirmations : int,
 * 								time : timestamp,
 * 								txid : int,
 * 								account : string,
 * 								address : string,
 * 								category : string,
 * 								
 * 								}
 * 								
 * 			err : error/Obj
 * 			msg : message
 * 		   }
 * 
 * @param {String} txid
 * @param {Function} callback
 * @api public
 */
Snowcoin.gettransaction = function(txid,cb) {
	this._api.gettransaction(txid,function(result) { 
		return cb(result);
	});
}

/**
 * unlock wallet
 * 
 * #### Example:
 * 
 *      snowcoin.unlock(passphrase,time,callback)
 * 
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @param {String} passphrase
 * @param {Int} time
 * @param {Function} callback
 * @api public
 */
Snowcoin.unlock = function(passphrase,time,cb) {
	this._api.unlock(passphrase,time,function(result) { 
		return cb(result);
	});
}

/**
 * change wallet passphrase
 * 
 * #### Example:
 * 
 *      snowcoin.changepassphrase(passphrase,confirm,callback)
 * 
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @param {String} passphrase
 * @param {String} confirm
 * @param {Function} callback
 * @api public
 */
Snowcoin.changepassphrase = function(passphrase,newpass,confirm,cb) {
	if(newpass === confirm) {
		this._api.changepassphrase(passphrase,newpass,function(result) { 
		return cb(result);
	
		});
	} else {
		return cb({ success:false });
	}
}


/**
 * backup wallet
 * 
 * #### Example:
 * 
 *      snowcoin.backupwallet(path,callback) // backup the wallet relative to rpc server user home
 * 
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @param {String} path
 * @param {Function} callback
 * @api public
 */
Snowcoin.backupwallet = function(path,cb) {
	this._api.backupwallet(path,function(result) { 
		return cb(result);
	});
}

/**
 * encrypt wallet
 * 
 * #### Example:
 * 
 *      snowcoin.encryptwallet(passphrase,callback) // encrypt the wallet
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			msg : string
 * 		   }
 * 
 * @param {String} passphrase
 * @param {Function} callback
 * @api public
 */
Snowcoin.encryptwallet = function(passphrase,cb) {
	this._api.encryptwallet(passphrase,function(result) { 
		return cb(result);
	});
}


/**
 * validate address
 * 
 * #### Example:
 * 
 *      snowcoin.validateaddress(address,callback) // dont send to nowhere and lose coin shibe
 * 
 * #### Expected Return
 * 		Obj{
 * 			success : true,
 * 			isvalid : true/false,
 * 			address:,
 * 			ismine:true/false,
 * 			pubkey:true/false,
 * 			iscompressed:true/false,
 * 			account: 				
 * 		   }
 * 
 * @param {String} address
 * @param {Function} callback
 * @api public
 */
Snowcoin.validateaddress = function(address,cb) {
	this._api.validateaddress(address,function(result) { 
		var sendback = result.result;
		sendback.success=result.success;
		sendback.error=result.err;
		return cb(sendback);
	});
}

/**
 * send coin from account
 * 
 * #### Example:
 * 
 *      snowcoin.sendfrom(account,toaddress,amount,minconf,private,public,callback) // send from a specific account to address
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			result : transaction id
 * 		   }
 * 
 * @param {String} account
 * @param {String} toaddress
 * @param {Int} amount
 * @param {String} minconf
 * @param {String} private
 * @param {String} public
 * @param [Function] callback
 * @api public
 */
Snowcoin.sendfrom = function(account,toaddress,amount,minconf,private,public,cb) {
	this._api.sendfrom(account,toaddress,amount,minconf,private,public,function(result) { 
		return cb(result);
	});
}

/**
 * send coin to address
 * 
 * #### Example:
 * 
 *      snowcoin.sendto(toaddress,amount,private,public,callback) // send to an address
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			result : transaction id
 * 		   }
 * 
 * @param {String} toaddress
 * @param {Int} amount
 * @param {String} private
 * @param {String} public
 * @param [Function] callback
 * @api public
 */
Snowcoin.sendto = function(toaddress,amount,private,public,cb) {
	this._api.sendto(toaddress,amount,private,public,function(result) { 
		return cb(result);
	});
}



/**
 * Sets snowcoin options
 * 
 * ####Example:
 * 
 *     snowcoin.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Snowcoin.set = function(key, value) {
	
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
			if(value !== this.get('api'))
			{
				var myapi = this.useapi(value);
				if(myapi.success==true) {
					this._api = myapi.api(this._options);
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
 * Sets multiple snowcoin options.
 *
 * ####Example:
 *
 *     snowcoin.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Snowcoin.options = function(options) {
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
 *     snowcoin.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Snowcoin.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets snowcoin options
 *
 * ####Example:
 *
 *     snowcoin.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Snowcoin.get = Snowcoin.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     snowcoin.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Snowcoin.encrypt = function(text,password) {
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
 *     snowcoin.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Snowcoin.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



/**
 * The exports object is an instance of Snowcoin.
 *
 * @api public
 */

var snowcoin = module.exports = Snowcoin;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
