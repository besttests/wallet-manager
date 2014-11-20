var keystone = require('keystone'),
	utils = require('keystone-utils'),
	fs = require('fs'),
	crypto = require('crypto'),
	async = require('async'),
	sani = require('sanitizer'),
	_ = require('underscore'),
	request = require('request'),
	getrates = require('../coinrates.js'),
	snowcoinsApi = require('snowcoins-api'),
	snowauth = require('./snowauth.js'),
	ledger = keystone.list('Ledger'),
	tx = keystone.list('Transactions'),
	additems = keystone.list('TxItems');

var Ledger = function() {
	
	this._options = {

	};
	//this.set('agenda', );
    	
}


/**
 * Initialises Ledger in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Ledger.prototype.init = function() {
	// authorization should be set so grab it from snowauth and set the vars
	var options = snowauth.options();
	this.options(options);	
	
	return this;	
}

/**
 * Add new ledger entry
 * 
 * authlevel <=5 - all masters 
 * 
 * ####Example:
 * 
 *     Ledger.create(options,callback) // is this a callback
 * 		options {
 * 			ledgerid: unique value or empty for generation
 * 			returnifidfails: boolean - default false, if the ledgerid is not unique a new one will be created
 * 			clients: string, comma-delimited for multiple, empty for all
 * 			total: number - 0000.00000000
 * 			type: original/revision - default is original
 * 			totalreceived: number - 0000.00000000
 * 		}
 * 
 * 	empty options creates a new ledger entry with a unique ledger number
 * 
 * @param {Object} create options
 * @param {Function} value
 * @api public
 */
Ledger.prototype.create = function (options,callback) {
	if(Ledger._options['authlevel']>5)return callback('API Key not authorized for this command');
	var _self = this,
		error = null;
	var newid = options.ledgerid ? sani.sanitize(options.ledgerid) : false,
		currency = options.currency ? sani.sanitize(options.currency) : false,
		total = !options.total  ? 0 : parseFloat(options.total.replace(',','')),
		totalreceived = !options.totalreceived || options.totalreceived == '0' ? 0 : parseFloat(options.totalreceived.replace(',','')),
		totaloffset = !options.totaloffset || options.totaloffset == '0' ? 0 : parseFloat(options.totaloffset.replace(',','')),
		wallets = sani.sanitize(options.wallets3245234),
		clients = sani.sanitize(options.clients),
		setapikey = Ledger.get('_id');
	if(total && 'number' != typeof total || (options.total && total == 0)) return callback('Total must be a number.');
	if(totalreceived && 'number' != typeof totalreceived || (options.totalreceived && totalreceived == 0))return callback('totalreceived must be a number.');
	if(totaloffset && 'number' != typeof totaloffset || (options.totaloffset && totaloffset == 0))return callback('totaloffset must be a number.');
	if(clients!='undefined' && clients !='all') {
		var split=clients.split(',');
		clients=split;
	} else clients = []
	if(wallets!='undefined') {
		var split=wallets.split(',');
		wallets=split;
	} else wallets = false
	async.series([
		function(next) {
			if(!newid) {
				keystone.list('Settings').model.getnext(function(resp){
					newid = keystone.get('ledgerid prefix')+resp;
					next();
				});
			} 
			else
				next();
		},
		function(next) {
			ledger.model.findOne()
			.where('ledgerID', newid)				
			.exec(function(err, data) {
				if(data) {
					/**
					 *  ledgerid has been used.  if returnifidfails true then clear and run again 
					 * */
					if(!options.returnifidfails) {
						console.log('ledgerID not unique, regenerating');
						options.ledgerid='';
						Ledger.create(options,callback);
					} else {
						callback('Ledger ID was not unique.');
					}
				} else {
					var sendme = {
						ledgerID:newid,
						owner:Ledger.get('owner'),
						apikey : setapikey
					}
					if(total || total===0)sendme.total=total;
					if(totalreceived || totalreceived===0)sendme.totalreceived=totalreceived;
					if(totaloffset || totaloffset===0)sendme.totaloffset=totaloffset;	
					
					
					if(currency)sendme.currency=currency;
					if(wallets)sendme.wallets=wallets;
					
					var save = function() {
						var send = new ledger.model(sendme);
						send.save(function(err,send,numaffected) {
							if(err) {
								console.log('error saving',err);
								callback(err);
								
							} else {
								doc = send.toJSON();
								doc.apikey=setapikey;
								callback(null,{ ledgerID:newid,rowsAffected:numaffected,doc:filterdoc(doc,['key']) });
							}
						});
					}
					
					sendme.clients = [];
					if(clients.length>0) {
						
						clients.forEach(function(v) {
							sendme.clients.push(v)
						});
						save();
						
					} else {
						
						var sC = keystone.list('ClientConnect').model.find();
						sC.where('type','client').where('status','valid');   
						sC.select('_id')
						.exec(function(err,resp) {
							resp.forEach(function(val) {
								sendme.clients.push(val._id)	
							});
													
							/* this is our main save */
							save();
						   
						   
						}); 
						    
					} 
					    
					 
					
					
				}
			});
		}
	],
	function(err) {
		error='Could not save new ledger entry';
		callback(error);
	});
}

/**
 * Modify ledger entry
 * 
 * authlevel <=5 - all masters
 * 
 * ####Example:
 * 
 *     Ledger.modify(options,callback) // is this a callback
 * 		options {
 * 			ledgerid: existing ledger entry - 
 * 			changeledgerid: new ledger id
 * 			returnifidfails: boolean - default false, if the changeledgerid is not unique a new one will be created - set true to return error and quit
 * 			clients: string, comma-delimited for multiple, empty for all
 * 			total: number - 0000.00000000,
 * 			totalreceived: number - 0000.00000000
 * 			totalreceivedplus: number - 0000.00000000 - add to the total received
 * 			totalreceivedminus: number - 0000.00000000 - subtract from the total received
 * 		}
 * 
 * 	empty options creates a new ledger entry with a unique ledger number
 * 
 * @param {Object} create options
 * @param {Function} value
 * @api public
 */
Ledger.prototype.modify = function (options,callback) {
	if(Ledger._options['authlevel']>5)return callback('API Key not authorized for this command');
	var self = this,
		error = null,
		savedoc = false;
	var newid = options.changeledgerid ? sani.sanitize(options.changeledgerid) : false,
		oldid = options.ledgerid ? sani.sanitize(options.ledgerid) : false,
		total = !options.total ? false : options.total == '0' ? 0 : parseFloat(options.total.replace(',','')),
		totalreceived = !options.totalreceived  ? false :  options.totalreceived == '0' ? 0 : parseFloat(options.totalreceived.replace(',','')),
		totalreceivedplus = !options.totalreceivedplus ? 0 : parseFloat(options.totalreceivedplus.replace(',','')),
		totalreceivedminus = !options.totalreceivedminus ? 0 : parseFloat(options.totalreceivedminus.replace(',','')),
		totaloffset = ! options.totaloffset ? false : options.totaloffset == '0' ? 0 : parseFloat(options.totaloffset.replace(',','')),
		wallets = sani.sanitize(options.wallets1223),
		clients = sani.sanitize(options.clients),
		currency = options.currency ? sani.sanitize(options.currency) : false,
		status = options.status ? sani.sanitize(options.status) : false,
		acceptstatus = ['valid','cancelled','deleted','archived','complete'],
		rerun = options.rerun;
		
	if(status && acceptstatus.indexOf(status)<0)return callback('Please select a valid status');
	if(!oldid) return callback('Ledger ID must be provided.');
	if((total && 'number' != typeof total) || (options.total && options.total!==0 && !total)) return callback('Total must be a number.');
	if(totalreceivedplus && 'number' != typeof totalreceivedplus)return callback('totalreceivedplus must be a number.');
	if(totalreceivedminus && 'number' != typeof totalreceivedminus)return callback('totalreceivedminus must be a number.');
	if(totalreceived && 'number' != typeof totalreceived)return callback('totalreceived must be a number.');
	if(totaloffset && 'number' != typeof totaloffset)return callback('totaloffset must be a number.');
	if(clients!='undefined') {
		var split=clients.split(',');
		clients=split;
		//console.log(clients)
	} else clients = false
	if(wallets!='undefined') {
		var split=wallets.split(',');
		wallets=split;
	} else wallets = false
	async.series([
		function(next) {
			if(rerun) {
				keystone.list('Settings').model.getnext(function(resp){
					newid = keystone.get('ledgerid prefix')+resp;
					next();
				});
			} 
			else
				next();
		},
		function(next) {
			//check for the original id first
			var model = ledger.model.findOne()
			.where('ledgerID', oldid)				
			.populate('apikey');
			if(options.populate && options.populate>0) {
				model.populate('transactions')
				model.populate('txitems')
				model.populate('clients','name authlevel key type')	
			}
			model.exec(function(err, data) {
				if(data) {
					 
					savedoc=data;
					/** 
					 * if we have a change id request check if it is free
					 * */
					if(newid) {
						ledger.model.findOne()
						.where('ledgerID', newid)
						.exec(function(err, data) {
							if(data) {
								/**
								 * ledgerid has been used.  if returnifidfails true
								 * then clear and run again 
								 * */
								if(!options.returnifidfails) {
									/**
									 * rerun the function
									 * */
									console.log('ledgerID not unique, regenerating');
									options.changeledgerid='';
									options.rerun=1;
									return Ledger.modify(options,callback);
								} else {
									
									return callback('Ledger ID was not unique.');
								}
							} else {
								/**
								 * the new id is free so save
								 * */
								next();
							}
								
						});
					} else {
						next();
					}					
				} else {
					
					return callback('Ledger ID was not found.');
				}
			});
		},
		function(next) {
			/**
			 * run through our available fields and assign those that are not false or null
			 * */
			savedoc.apikey = Ledger.get('_id');
			if(newid)savedoc.ledgerID=newid;
			if(currency)savedoc.currency=currency;
			if(status)savedoc.status=status;
			if(total || total === 0)savedoc.total=total;
			if(totalreceived || totalreceived===0)savedoc.totalreceived=totalreceived;
			if(clients && clients.length > 0) clients.forEach(function(v){ savedoc.clients.push(v) });
			if(wallets)savedoc.wallets=wallets;
			if(totaloffset || totaloffset === 0)savedoc.totaloffset=totaloffset;	
			if(totalreceivedminus)savedoc.totalreceived = savedoc.totalreceived - totalreceivedminus;
			if(totalreceivedplus)savedoc.totalreceived = savedoc.totalreceived + totalreceivedplus;

			savedoc.save(function(err,savedoc,numaffected) {
				if(err) {
					callback(err);
					console.log(err);
				} else {
					var doc = savedoc.toJSON();
					if(savedoc.apikey)doc.apikey = savedoc.apikey.apikey;
					callback(null,{ ledgerID: oldid || newid,rowsAffected:numaffected,doc:filterdoc(doc,['key','owner']) });
				}
			});
		}
	],
	function(err) {
		error='Could not modify ledger entry';
		callback(error);
	});
}


/**
 * Cancel / Delete a ledger entries
 * 
 * authlevel <=5 - all masters 
 * 
 * We don't delete entries only mark them as cancelled or deleted for history
 * 
 * ####Example:
 * 
 *     Ledger.cancel(options,cb) // is this a callback
 * 		options {
 * 			ledgerid: existing ledger entry
 * 		}
 * 
 * @param {Object} ledgerID  
 * @param {Function} callback
 * @api public
 */
Ledger.prototype.cancel = function (options,callback) {
	if(Ledger._options['authlevel']>5)return callback('API Key not authorized for this command');
	var self = this,
		error = null;
	var ledgerid =  sani.sanitize(options.ledgerid);
	if(ledgerid=='undefined') {
		error='You must provide a ledgerID to cancel.';
		callback(error);
	} else {
		ledger.model.findOne()
		.where('ledgerID', ledgerid)				
		.exec(function(err, data) {
			if(data) {
				data.status='cancelled';
				data.save(function(err) {
						if(err) {
							callback(err);
							console.log(err);
						} else {
							callback(null,{ ledgerid: ledgerid,message:'Ledger entry '+ledgerid+' removed from service'});
						}
					});
			} else {
				error='You must provide a VALID ledgerID to cancel.';
				callback(error);
			}
		});
	}
}

/*
 * depricated by Fetch.ledger
 * 
 * Get a ledger entry
 * 
 * authlevel <=10 - masters get full info
 * 
 * ####Example:
 * 
 *     Ledger.getentry(options,cb) // is this a callback
 * 		options {
 * 			ledgerid: existing ledger entry,
 * 			populate: 0 / >0  - default is 0(false / empty / not defined)
 * 		}
 * 
 * @param {Object} options  
 * @param {Function} callback
 * @api public
 */
Ledger.prototype.find = function (options,callback) {
	if(Ledger._options['authlevel']>10)return callback('API Key not authorized for this command');
	var self = this,
		error = null;
	var ledgerid =  sani.sanitize(options.ledgerid);
	if(ledgerid=='undefined') {
		error='You must provide a ledgerID to retrieve.';
		callback(error);
	} else {
		var model = ledger.model.findOne().lean()
			.where('ledgerID', ledgerid);
			
		if(Ledger._options['authlevel']<6) {
			model.populate('apikey');
		} else {
			model.select('-clients -wallets -key')
		}
		if(Ledger._options['authlevel']<6 && options.populate && options.populate>0) {
			model.populate('clients')
				.populate('transactions')
				.populate('txitems');
		}			
		model.exec(function(err, doc) {
			if(doc) {
				var doc2 = doc;
				if(doc.apikey instanceof Object)doc2.apikey = doc.apikey.apikey;
				callback(null,filterdoc(doc2,['owner']));					
			} else {
				error='You must provide a VALID ledgerID to retrieve.';
				callback(error);
			}
		});
		
	}
}

/**
 * Add new item
 * 
 * authlevel <=8 - all masters and select clients
 * 
 * ####Example:
 * 
 *     Ledger.additem(options,callback) // is this a callback
 * 		options {
 * 			ledgerid: ledgerID
 * 			name: string, comma-delimited for multiple, empty for all
 * 			amount: number - 0000.00000000
 * 			description: string
 * 			quantity: number - 0
 * 		}
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */
Ledger.prototype.additem = function (options,callback) {
	if(Ledger._options['authlevel']>8)return callback('API Key not authorized for this command');
	var self = this,
		error = null;
	var ledgerid = options.ledger ? sani.sanitize(options.ledger) : false,
		tx = options.transaction ? sani.sanitize(options.transaction) : false,
		description = options.description ? sani.sanitize(options.description) : '',
		name = options.name ? sani.sanitize(options.name) : '',
		amount = options.amount == '0' ? 0 : parseFloat(options.amount) || 0,
		quantity = options.quantity == '0' ? 0 : parseFloat(options.quantity) || 0;
	if(amount && 'number' != typeof amount) return callback('amount must be a number.');
	if(quantity && 'number' != typeof quantity)return callback('totalreceived must be a number.');
	if(!ledgerid && !tx)return callback('ledgerid or transaction required.');
	async.series([
		function(next) {
			if(ledgerid)ledger.model.getID(ledgerid,function(err,doc){
				ledgerid =  doc[0].key; 
				next()
			})
			else
				next()
		}
	],
	function(err) {
		console.log(ledgerid);
		var sendme = {
			amount:amount,
			quantity:quantity,
			description:description,
			name:name
		}	
		if(ledgerid)sendme.ledger=ledgerid;
		if(tx)sendme.transaction=tx;
		var send = new additems.model(sendme);
		send.save(function(err,send,numaffected) {
			if(err) {
				callback(err);
				console.log(err);
			} else {
				callback(null,{rowsAffected:numaffected,doc:filterdoc(send.toJSON(),['key']) });
			}
		});
	})

}

/**
 * Delete an item
 * authlevel <=8 - all masters and select clients 
 * 
 * 
 * ####Example:
 * 
 *     Ledger.deleteitem(options,cb) // is this a callback
 * 		options {
 * 			item: key
 * 		}
 * 
 * @param {Object} key  
 * @param {Function} callback
 * @api public
 */
Ledger.prototype.deleteitem = function (options,callback) {
	if(Ledger._options['authlevel']>8)return callback('API Key not authorized for this command');
	var self = this,
		error = null;
	var key =  sani.sanitize(options.item);
	if(key=='undefined') {
		error='You must provide an item key to delete.';
		callback(error);
	} else {
		additems.model.findOne()
		.where('key', key)				
		.exec(function(err, data) {
			if(data) {
				data.remove();
				callback(null,{message:'item deleted'});
			} else {
				error='You must provide a VALID item key to delete.';
				callback(error);
			}
		});
	}
}


/**
 * Sets Ledger options
 * 
 * ####Example:
 * 
 *     Ledger.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Ledger.prototype.set = function(key, value) {
	
	if (arguments.length == 1) {
		return this._options[key];
	}
	
	if (remappedOptions[key]) {
		console.log('Warning: the `' + key + '` option has been deprecated. Please use `' + remappedOptions[key] + '` instead.\n\n' +
			'Support for `' + key + '` will be removed in a future version.');
		key = remappedOptions[key];
	}	
	this._options[key] = value;
	return this;
};


/**
 * Sets multiple Ledger options.
 *
 * ####Example:
 *
 *     Ledger.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Ledger.prototype.options = function(options) {
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
 *     Ledger.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Ledger.prototype.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets Ledger options
 *
 * ####Example:
 *
 *     Ledger.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Ledger.prototype.get = Ledger.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     Ledger.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Ledger.prototype.encrypt = function(text,password) {
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
 *     Ledger.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Ledger.prototype.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


var filterdoc = function(doc,addfilter) {
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
 * The exports object is an instance of Ledger.
 *
 * @api public
 */

//we are not worried about state here
var Ledger = module.exports = new Ledger;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
