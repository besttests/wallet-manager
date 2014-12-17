var keystone = require('keystone'),
	utils = require('keystone-utils'),
	fs = require('fs'),
	crypto = require('crypto'),
	async = require('async'),
	sani = require('sanitizer'),
	_ = require('lodash'),
	moment = require('moment'),
	getrates = require('../coinrates.js'),
	snowcoinsApi = require('snowcoins-api'),
	snowauth = require('./snowauth.js'),
	snowcoins = require('snowcoins'),
	lists = snowcoins.get('lists'),
	ledger = lists.ledger,
	tx = lists.transactions,
	txitems = lists.items
	trackers = lists.trackers,
	Wallets = lists.wallets,
	ClientConnect = lists.clients,
	Attended = lists.attended,		
	UnAttended = lists.unattended,
	CurrencyRates = lists.rates,
	Trackers = lists.trackers;

var Fetch = function() {
	
	this._options = {

	};
	//this.set('agenda', );
    	
}


/**
 * Initialises Fetch in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Fetch.prototype.init = function(options) {
	
	var options = snowauth.options();
	
	this.options(options);	
	
	return this;	
	
}

/**
 * Get ledger entries
 * 
 * 
 * ####Example:
 * 
 *     Fetch.ledger(options,cb) // is this a callback
 * 		options {
 * 			ledgerid: existing ledger entry / string of comma seperated entries / do not send for all
 * 			populate: 1  - default is do not populate:0 (false / empty / not defined)
 * 			lean: 0  - default is lean:1 (true)
 * 			status: valid,cancelled,deleted,archived
 * 			total: int
 * 			totalreceived: int
 * 			list: fields  -  comma serepated list of fields to retrieve from model
 * 			lessthan: number,
 * 			greaterthan: number,
 * 			receivedlessthan: number,
 * 			receivedgreaterthan: number,
 * 			clients: string   -  single client name only,
 * 			past: number ( 8 / YYYYMMDD / YYMMDDHHmmss ) - start search from number of days from today or date,
 * 			till: number ( 8 / YYYYMMDD / YYMMDDHHmmss ) - end search on number of days from today or date
 * 		}
 * 
 * @param {Object} options  
 * @param {Function} callback(error,data)
 * @api public
 */
Fetch.prototype.ledger = function (options,callback) {
	var self = this,
		error = null,
		sort = {},
		search = ledger.model.find().select('-_id -key -owner'),
		fields = {};
	var ledgerid = options.ledgerid ? sani.sanitize(options.ledgerid) : options.ledger ? sani.sanitize(options.ledger) : false,
		list =  sani.sanitize(options.list) || false,
		status = options.status ? sani.sanitize(options.status) : false,
		total = options.total ? parseFloat(options.total) : false,
		lessthan = options.lessthan ? parseFloat(options.lessthan) : false,
		greaterthan = options.greaterthan ? parseFloat(options.greaterthan) : false,
		receivedlessthan = options.receivedlessthan ? parseFloat(options.receivedlessthan) : false,
		receivedgreaterthan = options.receivedgreaterthan ? parseFloat(options.receivedgreaterthan) : false,
		totalreceived = options.totalreceived ? parseFloat(options.totalreceived) : false,
		clients = options.clients ? sani.sanitize(options.clients) : false,
		acceptstatus = ['valid','cancelled','deleted','archived','all','complete'],
		populate = sani.sanitize(options.populate) || false,
		lean = options.lean == '0' ? 0 : parseFloat(options.lean) || 1,
		lastday = options.till  ?  parseFloat(options.till) : false,
		firstday = options.past  ?  parseFloat(options.past) : false;
	/** * 
	 * check status and kick
	 * */
	if(status && acceptstatus.indexOf(status)<0)return callback('Please select a valid status');
	
	
	
	/** *  
	 * if list is present only allow the values that are in the model 
	 * */
	if(list && list != 'undefined') {
		
		var paths = _.keys(keystone.list('Ledger').schema.paths)
		paths = _.without(paths,'_id','__v')		
		//console.log(paths);
		var ff33=list.split(',')
		ff33.forEach(function(val) {
			if(_.contains(paths,val)) {
				fields[val] = 1;
			}
		});
		search.select(fields);
		
		
	} else {
		
		search.select('-__v');
	
	}	
	
	/** * 
	 * we only add the status filter for general searches or by request
	 * we set it on here and turn it off when needed as our query is built
	 * */
	var addstatus = true;
	
	/* fing a ledger by ledgerID */
	if(ledgerid && ledgerid!='undefined') {
		
		var split=ledgerid.split(',');
		ledgerid=split;
		var ls = [];
		ledgerid.forEach(function(v) {
			if(v)ls.push( new RegExp(v, 'i'));
		});
		search.where('ledgerID').in(ls)
		//console.log('find by ledgerid');
		
		addstatus = false;
	}
	
	
	/** *  
	 * math - for <= or >= use the lessthan/greaterthan equivalent by adding or subtracting a point
	 *  */
	
	if(totalreceived || (totalreceived === 0 && options.totalreceived)) {
		
		search.where('totalreceived',totalreceived)
		//console.log('add total received',totalreceived);
	}
	if(total || (total === 0 && options.total)) {
		
		search.where('total',total)
		//console.log('add total',total);
	}
	if(lessthan || (lessthan === 0 && options.lessthan)) {
	
		search.where('total').lt(lessthan)
		//console.log('add total less than',totalreceived);
	}
	if(greaterthan || (greaterthan === 0 && options.greaterthan)) {
		
		search.where('total').gt(greaterthan);
		//console.log('add total greater than',total);
	}
	if(receivedlessthan || (receivedlessthan === 0 && options.receivedlessthan)) {
		
		search.where('totalreceived').lt(receivedlessthan)
		//console.log('add totalreceived less than',totalreceived);
	}
	if(receivedgreaterthan || (receivedgreaterthan === 0 && options.receivedgreaterthan)) {
		
		search.where('totalreceived').gt(receivedgreaterthan);
		//console.log('add totalreceived greater than',total);
	}
	 
	/** * 
	 *  now check our auth level and if we are a client only send ledgers that are allowed for me 
	 * */
	if(Fetch.get('authlevel') > 5) {
		clients = Fetch.get('name');
	}
	/** * 
	 *  we can only do one client at a time searching by name unless we want to add an additional db call 
	 * we will also have to delete unwanted records before return 
	 * */
	if(clients && clients !== undefined) {
	
		search.populate({
			path: 'clients',
			match : {name: clients},
			select: 'name authlevel  status type  -_id',
		});
		search.where('clients').ne(null);
		var delclients = true;
		//console.log('add client populate');
		
	} else {
		search.populate('clients', '-_id name  status type authlevel');
		var delclients = false;
	}
	
	/** *  
	 * all searches are lean unless it is explictly turned off with lean=0 
	 * */
	if(lean !== 0 ) {
		search.lean()
	}
	
	/** *  
	 * populate unless any falsy is detected 
	 * */
	if(populate !== false) {
		
		search.populate('transactions').populate('txitems');
	
	}
	
	/** * 
	 *  the client who created the ledger
	 *  */
	search.populate('apikey',' name status -_id')	
	
	/** * 
	 * we accept number of days or a date 
	 *    8   /   YYYYMMDD   /   YYYYMMDDHHmmss
	 * default is yesterday and today
	 * */
	if(firstday && firstday !== 0) {
		if(firstday>'19700101') {
			var searchd = firstday.toString().length === 8 ? moment(firstday,'YYYYMMDD') : moment(firstday,'YYYYMMDDHHmmss');
			search.where('createdDate').gte(searchd.toDate());
			//console.log(firstday,'search dates firstday full date');
		} else {
			var searchd = moment().startOf('day').subtract('days',firstday);
			search.where('createdDate').gte(searchd.toDate());
			//console.log('search dates firstday',searchd.format());	
		}
		
	} else {
		
		var searchd = moment().startOf('day').subtract('days',1);
		search.where('createdDate').gte(searchd.toDate());
		
	}
	if(lastday && lastday !== 0) {
		if(lastday>'19700101') {
			var searchd = lastday.toString().length === 8 ? moment(lastday,'YYYYMMDD').hour(24) : moment(lastday,'YYYYMMDDHHmmss');
			search.where('createdDate').lte(searchd.toDate());
			//console.log(lastday,'search dates last full date');
		} else {
			var searchd = moment().endOf('day').subtract('days',lastday);
			search.where('createdDate').lte(searchd.toDate());
			//console.log('search dates lastday',searchd.format());
		}
	}
	
	/** * 
	 * never send deleted unless it is requested by status or ledgerid 
	 * send valid and complete by default
	 * add cancelled with all
	 * */
	if(status && status !== 'all') {
		
		search.where('status',status)
		//console.log('add status ');
		
	} else if(status === 'all') {
		
		search.where('status').ne('deleted')
		
	} else if(!status && addstatus) {
		
		search.where('status').nin(['cancelled','deleted']);		
	
	}
	
	/** * 
	 * sorting is left to the user. 
	 * we should probabaly add sorting requests here though */
	if(status === 'valid')sort.complete=1;
	
	sort.updatedOn=-1;
	
	search.sort(sort)
	
	search.exec(function(err, doc) {
		if(doc) {
			/* since we search for clients by name there doesn't seem to be a nice way
			 * to select only the one(s) we want.  Our client field contains the _id fields.
			 * so we loop the results and remove anything that does not belong.
			 * Be careful with the removal method if the search is not lean or you might delete the record
			 * */ 
			if(delclients) {
				var _d = doc;
				_d.forEach(function(v,i) {
					if(v.clients.length===0) {
						doc.splice(i, 1);
						//console.log(doc[i]);
					}
				});
			}
			
			return callback(null,doc);					
		} else {
			error='No ledger entries found';
			return callback(error);
		}
	});

}

/**
 * list of available wallets to receive to
 * 
 * ####Example:
 * 
 *     Fetch.receivers(options,cb) // is this a callback
 * 
 * @param {Object} options  
 * @param {Function} callback(err,data)
 * @api public
 */
Fetch.prototype.receivers = function (options,cb) {
	Attended.model.find()
	.where('owner', snowauth._options.owner )
	.select('-_id -__v -owner')
	.where('status','valid')
	.populate('wallet','-_id key cointicker coinstamp coin name currency')
	.sort('name')
	.exec(function(err, results) {
		cb(err,results)
	});	
}

/**
 * list of available wallets to receive to
 * 
 * ####Example:
 * 
 *     Fetch.clients(options,cb) // is this a callback
 * 
 * @param {Object} options  
 * @param {Function} callback(err,data)
 * @api public
 */
Fetch.prototype.clients = function (options,cb) {
	var c = ClientConnect.model.find()
	.where('owner', snowauth._options.owner );
	if(_.contains(['master','client'],options.type))c.where('type',options.type)
	c.select('-_id name key type authlevel')
	.where('status','valid')
	.populate('clients','name key type authlevel')
	.sort('name')
	.exec(function(err, results) {
		cb(err,results)
	});	
}


/**
 * grab current coin rates
 * 
 * ####Example:
 * 
 *     Fetch.rates(options,cb) // no options needed
 * 
 * @param {Object} options  
 * @param {Function} callback(err,data)
 * @api public
 */
Fetch.prototype.rates = function (options,cb) {
	getrates.snowmoney(function(m) {  cb(null,m); });
	
	
	
	
}

/**
 * get accounts for attended
 * 
 * ####Example:
 * 
 *     Fetch.attendedaccounts(options,cb) // no options needed
 * 
 * @param {Object} options  
 * @param {Function} callback(err,data)
 * @api public
 */
Fetch.prototype.attendedaccounts = function (options,cb) {
	if(options.attended) {
		Attended.model.findOne()
		.where('owner', snowauth._options.owner )				
		.where('key', options.attended)
		.populate('wallet',"+apipassword +apikey")
		.exec(function(err, data) {
			if(err) return cb('Unknown wallet shibe.  Please try again.');
			
			if(data) {
				wally = data.wallet;
				snowcoinsApi.init({
					api:wally.coinapi,
					host:wally.address,
					port:wally.port,
					username:wally.apiuser,
					password:wally.apipassword,
					isSSL:wally.isSSL,
					apipin:wally.apipassword,
					apikey:wally.apikey,
					ca:wally.ca
				}).auth();
				wally.apipassword='';
				wally.apikey='';
				wally.apiuser='';
				snowcoinsApi.listaccounts(function(result) {
					//console.log(result);
					if (result.success==false) {
						return cb(result.err,{ success: false, err:result.err });
					}
					var acc=[];
					_.keys(result.accounts).forEach(function(param) {
						//console.log(result.accounts[param].truename);
						if(result.accounts[param].truename!='')acc.push(result.accounts[param].truename);
					});
					//console.log(acc);
					return cb(null,acc);
				});
			} else {
				return cb(null,['No results found']);
			}
			
		});
	} else {
		return cb(null,['No results found']);
	}
}

/**
 * get addresses for Attended accounts
 * 
 * ####Example:
 * 
 *     Fetch.walletaddresses(options,cb) // no options needed
 * 
 * @param {Object} options  
 * @param {Function} callback(err,data)
 * @api public
 */
Fetch.prototype.attendedaddresses = function (options,cb) {
	if(options.attended) {
		Attended.model.findOne()
		.where('owner', snowauth._options.owner)				
		.where('key', options.attended)
		.populate('wallet',"+apipassword +apikey")
		.exec(function(err, data) {
			if(err) return cb('Unknown wallet shibe.  Please try again.',{ success: false, err:'Unknown wallet shibe.  Please try again.'});
			
			if(data) {
				wally = data.wallet;
				snowcoinsApi.init({
					api:wally.coinapi,
					host:wally.address,
					port:wally.port,
					username:wally.apiuser,
					password:wally.apipassword,
					isSSL:wally.isSSL,
					apipin:wally.apipassword,
					apikey:wally.apikey,
					ca:wally.ca
				}).auth();
				wally.apipassword='';
				wally.apikey='';
				wally.apiuser='';
				snowcoinsApi.listaccounts(function(result) {
					//console.log(result);
					if (result.success==false) {
						return cb(result.err ,{ success: false, err:result.err });
					}
					var acc=[];
					
					_.keys(result.accounts).forEach(function(param) {
						//console.log(result.accounts[param].truename);
						if(result.accounts[param].truename==options.account) {
							_.each(result.accounts[param].addresses,function(val) {
								console.log(val.a);
								acc.push(val.a);
							});
						}
					});
					//console.log(acc);
					return cb(null,acc);
				});
			} else {
				return cb(['No results found']);
			}
			
		});
	} else {
		return cb(['No results found']);
	}
}
	

/**
 * Is the callback a function
 * 
 * ####Example:
 * 
 *     Fetch.iscallback(cb) // is this a callback
 * 
 * @param {Function} value
 * @api public
 */
Fetch.prototype.iscallback = function (checkme) {
	return typeof checkme === 'function' ? true:false;
}



/**
 * Sets Fetch options
 * 
 * ####Example:
 * 
 *     Fetch.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Fetch.prototype.set = function(key, value) {
	
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
 * Sets multiple Fetch options.
 *
 * ####Example:
 *
 *     Fetch.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Fetch.prototype.options = function(options) {
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
 *     Fetch.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Fetch.prototype.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets Fetch options
 *
 * ####Example:
 *
 *     Fetch.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Fetch.prototype.get = Fetch.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     Fetch.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Fetch.prototype.encrypt = function(text,password) {
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
 *     Fetch.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Fetch.prototype.decrypt = function(text,password) {
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
 * The exports object is an instance of Fetch.
 *
 * @api public
 */

var Fetch = module.exports = new Fetch;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
