var keystone = require('keystone'),
	utils = require('keystone-utils'),
	fs = require('fs'),
	crypto = require('crypto'),
	_ = require('lodash'),
	async = require('async'),
	sani = require('sanitizer'),
	getrates = require('../coinrates.js'),
	snowcoinsApi = require('snowcoins-api'),
	snowauth = require('./snowauth.js');

var Tx = function() {
	
	this._options = {

	};
	//this.set('agenda', );
    	
}


/**
 * Initialises Tx in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Tx.prototype.init = function() {
	
	var options = snowauth.options();
	
	options.Ledgers = keystone.list('Ledger'),
	options.Transactions = keystone.list('Transactions'),
	options.TxItems = keystone.list('TxItems')
	
	this.options(options);	
	
	return this;
	
}


/**
 * Add new transaction
 * 
 * ####Example:
 * 
 *     Tx.create(options,callback) // is this a callback
 * 		options {
 * 			ledgerid: legerID
 * 			client: string
 * 			total: number - 0000.00000000
 * 			type: original/revision - default is original
 * 			attended: doc ID
 * 			unattended: doc ID
 * 			manual: Boolean - default false
 * 			totalreceived: number - 0000.00000000
 * 		}
 * 
 * 	empty options creates a new ledger entry with a unique ledger number
 * 
 * @param {Object} create options
 * @param {Function} callback
 * @api public
 */
Tx.prototype.create = function (options,callback) {
	if(Tx._options['authlevel']>8)return callback('API Key not authorized for this command');
	
	var ledger = options.ledgerid ? sani.sanitize(options.ledgerid) : options.ledger ? sani.sanitize(options.ledger) : false,
		amount = !options.amount  ? 0 : parseFloat(options.amount.replace(',','')),
		totalreceived = !options.totalreceived || options.totalreceived == '0' ? 0 : parseFloat(options.totalreceived.replace(',','')),
		attended = options.attended ? sani.sanitize(options.attended) : false,
		manual = options.manual ? sani.sanitize(options.manual) : false,
		unattended = options.unattended ? sani.sanitize(options.unattended) : false,
		ouraddress = options.ouraddress ? sani.sanitize(options.ouraddress) : false,
		wallet = options.wallet ? sani.sanitize(options.wallet) : false,
		account = options.account ? sani.sanitize(options.account) : false,
		track = options.track ? sani.sanitize(options.track) : 'no',
		confirmations = options.confirmations ? sani.sanitize(options.confirmations) : false,
		accepttrack = ['yes','no'],
		client = Tx.get('_id'),
		owner = Tx.get('owner'),
		ledgermodel = Tx.get('Ledgers'),
		txmodel = Tx.get('Transactions');
	
	if(!ledger) return callback('Ledger ID must be provided.');
	if(track && accepttrack.indexOf(track)<0)return callback('Track must be yes or no or empty');
	if(!attended && !unattended && !manual) return callback('Receiving account/address must be provided by a receiver (unattended / attended / manual).');
	if((amount && 'number' != typeof amount) || (options.amount && options.amount !== 0 && !amount)) return callback('Amount must be a number.');
	if(totalreceived && 'number' != typeof totalreceived)return callback('Total received must be a number.');
	
	/** 
	 * we have enough info to add a new tx. 
	 * 
	 * we do all the automatic account and address additions from pre / post functions on the model
	 * this allows basic management at the keystone level outside of the snowcoins ui
	 * see Tx.premodel & Tx.postmodel
	 * 
	 * any manual additions sent will be processed below
	 * 
	 * */ 
	
	var addtx = {
		owner: owner,
		client: client,
		tracking:track,
		ouraddress:{},
	}
	if(attended)addtx.attended = attended;
	if(unattended)addtx.unattended = unattended;
	if(amount)addtx.amount = amount;
	if(ouraddress)addtx.ouraddress.address = ouraddress;
	if(account)addtx.ouraddress.account = account;
	if(confirmations)addtx.confirmations.need = confirmations;
	
	/**
	 * if we add a wallet address manually we have to look up the wallet id
	 * 
	 * we need to make sure the ledgerid is correct before saving
	 * */
	 async.series([
		function(next) {
			if(ledger) {
				ledgermodel.model.exists(ledger,function(yes,doc) {
					if(!yes) {
						callback('A valid ledgerID must be provided');
					} else {
						addtx.ledger = doc._id;
						next();
					}
				});
			} else {
				callback('A valid ledgerID must be provided');
			}
		},
		function(next) {
			if(wallet) {
				keystone.list('Wallets').model.findOne({key:wallet},function(err,doc) {
					if(err) {
						next();
					} else {
						addtx.ouraddress.wallet = doc._id;
						next();
					}
				});
			} else {
				next();
			}
		},
	], function(err) {
		/** 
		 * done with sunc functions so save now */
		var send = new txmodel.model(addtx);
		send.save(function(err,send,numaffected) {
			if(err) {
				console.log('error saving',err);
				callback(err);
				
			} else {
				doc = send.toJSON();
				callback(null,{ txid:doc.txid,rowsAffected:numaffected,doc:filterdoc(doc) });
			}
		});
		 
	});
	
	
	

	
	
}

/**
 * transaction model pre save function
 * 
 * ####Example:
 * 
 *     Tx.presave(doc,cb) 
 * 
 * @param {Object} document
 * @param {Function} value
 * @api public
 */
Tx.prototype.presave = function (doc,cb) {
	async.series([
		function(next) {
			if(doc.attended || doc.unattended) {
				if(doc.ouraddress.wallet) {
					/**
					 * since doc.wallet is set all data is manual 
					 * */
					 next();
				} else {
					var getlist = doc.attended || doc.unattended;
					var uselist = doc.attended ? 'Attended' : 'UnAttended';
					keystone.list(uselist).model.findOne().where('key',getlist).populate('wallet').exec(function(err,data){
						if(data) {
							
							if('object' !== typeof doc.ouraddress)doc.ouraddress = {};
							
							doc.ouraddress.coin = data.coin;
							
							/**
							 * the attended receiver has a format
							 * 1 - create a new account and address
							 * 2 - use the account from received doc to generate a new address
							 * 3 - special case... use the account and address from the received doc and cancel the attended
							 * ... with data.save() by setting data.status='deleted'
							 * */
							 switch(data.format) {
								 case 1:
								 case 2:
									if(data.account === undefined)data.account='';
									snowcoinsApi.init(
										{
											api:wally.coinapi,
											host:wally.address,
											port:wally.port,
											username:wally.apiuser,
											password:wally.apipassword,
											isSSL:wally.isSSL,
											apipin:wally.apipassword,
											apikey:wally.apikey,
											ca:wally.ca
										}
									).auth();
									snowcoinsApi.newaddress(data.account,function(result) {
										if (result.success==false) {
											if(result.err) console.log('error getting new address for attended receiver',err);
											next();
										} else {
											doc.ouraddress.address = result.address;
											doc.ouraddress.account = data.account;
											next();								
										}
									});
									break;
								case 3:
									doc.ouraddress.address = data.address;
									doc.ouraddress.account = data.account;
									
									/**
									 * single use so set the attended reciver to deleted status
									 * */
									 if(doc.attended) {
										 data.status = 'deleted';
										 data.save();
									 }
									 next();
									break;
							 }
							
							
						} else {
							
							next();
							
						}
					});
					
				}
			} else {
				next();
			}
			
		},
		function(next) {
			
			/**
			 * determine tracker status 
			 * */
			 
			next();	
			
		},
	], function(err) {
		cb(null,doc);
	});
}



/**
 * Is the callback a function
 * 
 * ####Example:
 * 
 *     Tx.iscallback(cb) // is this a callback
 * 
 * @param {Function} value
 * @api public
 */
Tx.prototype.iscallback = function (checkme) {
	return typeof checkme === 'function' ? true:false;
}



/**
 * Sets Tx options
 * 
 * ####Example:
 * 
 *     Tx.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Tx.prototype.set = function(key, value) {
	
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
 * Sets multiple Tx options.
 *
 * ####Example:
 *
 *     Tx.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Tx.prototype.options = function(options) {
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
 *     Tx.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Tx.prototype.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets Tx options
 *
 * ####Example:
 *
 *     Tx.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Tx.prototype.get = Tx.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     Tx.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Tx.prototype.encrypt = function(text,password) {
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
 *     Tx.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Tx.prototype.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


/**
 * 
 * private functions 
 *
 * 
 *  */
 
function filterdoc(doc,addfilter) {
	var filter = ['_id','__v','owner'];
	//console.log(addfilter instanceof Array, addfilter)
	if(addfilter instanceof Array) {
		filter = _.uniq(filter.concat(addfilter))
		//console.log('merge filter',filter)
	}	
	var filterme = function(doc) {
		_.keys(doc).forEach(function(param) {
			//console.log('filter',param,_.indexOf(filter,param));
			if(doc[param] instanceof Object)doc[param] = filterme(doc[param]);
			if(_.indexOf(filter,param)>=0)delete doc[param];
		});
		return doc;
	}
	
	return filterme(doc)
}
/**
 * The exports object is an instance of Tx.
 *
 * @api public
 */

var Tx = module.exports = new Tx;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
