var rpc = require('node-dogecoin'),
	rpcapi,
	_ = require('lodash'),
	async = require('async'),
	utils = require('keystone-utils'),
	fs = require('fs');


var RPC = function(options) {
	this._options = Object
	if(options)this.options(options);
}

/**
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

RPC.prototype.init = function(options) {
	
	rpcapi = rpc(options)
	
	this.options(options);	
	
	return this;
	
}

RPC.prototype.auth = function (options) {
	/*rpc / api setup and auth */
	//console.log('rpc options',options);
	rpcapi.set({host:options.host})
	rpcapi.set({port:options.port})
	rpcapi.set({user:options.username})
	rpcapi.set({pass:options.password})
	rpcapi.set({https:options.isSSL})
	if (fs.existsSync(options.ca)) {
		var caget = fs.readFileSync(options.ca);
		rpcapi.set({ca:caget})
		//console.log(caget);
	}
	rpcapi.auth();
	return this;
}

/**
 * get status
 * 
 * #### Example:
 * 
 *      snowcoin.status() // gets wallet status
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'status':Obj{}
 * 		}
 * 
 * @api public
 */
RPC.prototype.status = function (callback) {
	rpcapi.getInfo(function(err,result) {
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					//console.log('JSON.parse error, ',e);
				}
				console.log(err,'message:    ',err.message);
				var senderror = (err.error) ? err.error.message:err;
				return callback({ success: false, err:senderror });
		}
		if(result.unlocked_until>0){
			var date=new Date().getTime();
			if(result.unlocked_until<date){
				result.unlocked_until=result.unlocked_until*1000
				//console.log(result.unlocked_until);
			}				
		}
		return callback({ success: true, 'info': result });
	});
}

/**
 * get balance  
 * 
 */
RPC.prototype.balance = function (type,value,cb) {
	/*check type and return appropriate balance */
	if(!type) {
		rpcapi.getbalance(function(err, result) {
			if (err) {
					if(err.message)err=err.message;
					try {
						err=JSON.parse(err);
					} catch (e) {
						console.log('JSON.parse error, ',e);
					}
					//console.log(err,'message:    ',err.message);
					return cb({ success: false, err:err });
			}
			return cb({ success: true, 'balance':result });
		});
	}
	else if(type=='account') {
		return this.accountbalance(value);
	}
	else {
		return this.addressbalance(value);
	}
}
RPC.prototype.accountbalance = function (account) {
	
}
RPC.prototype.addressbalance = function (address) {
	
}

/**
 * get account list and return to snowcoin
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'accounts':Obj{ name:'name',
 * 							balance:'balance',
 *                          addresses:Obj{'a':address,'b':receivedAmount}
 * 						  }
 * 		   }
 * 
 * @api public
 */
RPC.prototype.listaccounts = function(callback) {
	async.series([
		/*get list of all addresses and account associations*/
		function(next) {
			rpcapi.listreceivedbyaddress(0, true,function(err, result) {
				if (err) {
						if(err.message)err=err.message;
						try {
							err=JSON.parse(err);
						} catch (e) {
							console.log('JSON.parse error, ',e);
						}
						//console.log(err,'message:    ',err.message);
						return callback({ success: false, err:err});
				}
				//console.log(result);
				
				var acclist=[];
				/* loop through results and give an array with modified account as index and an object of addresses and balances named addr */
				result.every(function(element, index, array) {
					if(element.account.trim()=='')element.account="unassigned";
					if(!acclist[element.account]){acclist[element.account]=[];acclist[element.account].addr=[];}
					var amo=element.amount;
					var addr=element.address;
					acclist[element.account].addr.push({'a':addr,'b':amo});
									
					return true;
				});	
				return next(null,acclist);								
				
			});
		}],
		function(err,results) {
			rpcapi.listaccounts(function(err,accbal){
				if (err) {
						if(err.message)err=err.message;
						try {
							err=JSON.parse(err);
						} catch (e) {
							console.log('JSON.parse error, ',e);
						}
						//console.log(err,'message:    ',err.message);
						return cb({ success: false, err:err });
				}
				
				var mylist=[];
				//accbal=_.extend([], accbal);
				//console.log(accbal);
				_.each(accbal,function(val, index, array) {
					//console.log(val,index);
					var truename = (index.trim()=='')?0:index;
					var name = (index.trim()=='')?'_default':index;
					var addrs = (index.trim()=='')?results[0]['unassigned']:results[0][index];
					if(addrs)var addresses = addrs.addr;
					var balance = val;
					//console.log(name);
					mylist.push({'truename':truename,'name':name,'balance':balance,'addresses':addresses});
			
				});
				
				var list=_.extend({}, mylist);
				return callback({ success: true, 'accounts':list });
				
			});
		}
	);/*end async*/
}

/**
 * move coin between accounts
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'err':error / Obj
 * 			'msg':message
 * 		   }
 * 
 * @api public
 */
RPC.prototype.movecoin = function(from,to,amount,cb) {
	rpcapi.move(from,to,amount,function(err, result) {
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
		return cb({ success: true });
	});
}

/**
 * move address to account
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'err':error / Obj
 * 			'msg':message
 * 		   }
 * 
 * @api public
 */
RPC.prototype.setaccount = function(address,account,cb) {
	rpcapi.setaccount(address,account,function(err, result) {
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
		return cb({ success: true });
	});
	
}

/**
 * get a new address for account
 * 
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			address : newaddress
 * 			err : error/Obj
 * 			msg : message
 * 		   }
 * 
 * @api public
 */
RPC.prototype.newaddress = function(account,cb) {
	rpcapi.getnewaddress(account,function(err, result) {
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
			}
		return cb({ success: true,address:result });
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
 * 								comment : string
 * 								}
 * 								
 * 			success : boolean
 * 		   }
 * 
 * @api public
 */
RPC.prototype.listtransactions = function(account,num,start,cb) {
	if(!num)var num=20;
	if(!start)var start=0;
	if(!account)var account='';
	if(account=='all'){
		rpcapi.listtransactions(function(err,result) { 
			if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
			}
			var a = Object.keys(result).reverse();
			//console.log(result);
			//console.log(a);
			var list={};
			var i=0;
			a.forEach(function(param) {
				list[i++] = result[param];
				//console.log(param);
			});
			return cb({ success: true,transactions:list });
				
		});

	}
	else {
		
		rpcapi.listtransactions(account,num,start,function(err,result) { 
			if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
			}
			var a = Object.keys(result).reverse();
			//console.log(result);
			//console.log(a);
			var list={};
			var i=0;
			a.forEach(function(param) {
				list[i++] = result[param];
				//console.log(param);
			});
			return cb({ success: true,transactions:list });
				
		});
	}
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
RPC.prototype.gettransaction = function(txid,cb) {
	rpcapi.gettransaction(txid,function(err,data) { 
		//console.log('result',data);
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
		var ret = {
			amount : data.amount,
  			confirmations : data.confirmations,
  			time : data.time,
  			txid : data.txid,
  			account : data.details[0].account,
  			address : data.details[0].address,
  			category : data.details[0].category
  		}
		return cb(ret);
	});
}


/**
 * unlock wallet
 * 
 * #### Example:
 * 
 *      snowcoin.unlock(passphrase,time,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @api public
 */
RPC.prototype.unlock = function(passphrase,time,cb) {
	rpcapi.walletpassphrase(passphrase,parseFloat(time),function(err,result) { 
			if (err) {
				try {
					err=JSON.parse(err.message)
				} catch(e) {
					console.log('error json parse rpc unlock',e);
					err=err;
				}
				if(err.error)err=err.error;
				//console.log('after',err.message);
				return cb({ success: false, err:err.message });
			}
			return cb({ success: true});
				
		});
}

/**
 * change wallet passpharse
 * 
 * #### Example:
 * 
 *      snowcoin.changepassphrase(current,passphrase,callback) // checks the entire wallet ballance
 * 
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @api public
 */
RPC.prototype.changepassphrase = function(current,passphrase,cb) {
	rpcapi.walletpassphrasechange(current,passphrase,function(err,result) { 
			if (err) {
				try {
					err=JSON.parse(err.message)
				} catch(e) {
					console.log('error json parse rpc unlock',e);
					err=err;
				}
				if(err.error)err=err.error;
				//console.log('after',err.message);
				return cb({ success: false, err:err.message });
			}
			return cb({ success: true});
				
		});
}

/**
 * backup wallet
 *  
 * #### Expected Return
 * 		Obj{success : true/false}
 * 
 * @api public
 */
RPC.prototype.backupwallet = function(path,cb) {
	rpcapi.backupwallet(path,function(err,result) { 
		if (err) {
				
				try {
					err=JSON.parse(err.message);
					if(err.error.message)err=err.error.message;
					console.log(err)
				} catch (e) {
					console.log('JSON.parse error on backup, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
			return cb({ success: true});
	});
}

/**
 * encrypt wallet
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			message : string
 * 		   }
 * 
 * @api public
 */
RPC.prototype.encryptwallet = function(passphrase,cb) {
	rpcapi.encryptwallet(passphrase,function(err,result) { 
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
		return cb({ success: true,message:result});
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
RPC.prototype.validateaddress = function(address,cb) {
	rpcapi.validateaddress(address,function(err,result) { 
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err });
		}
		return cb({ success: true,result:result});
	});
}

/**
 * send coin from account
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			result : transaction id
 * 		   }
 * 
 * @api public
 */
RPC.prototype.sendfrom = function(account,toaddress,amount,minconf,private,public,cb) {
	rpcapi.sendfrom(account,toaddress,amount,minconf,private,public,function(err,result) { 
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				console.log(err,'code:    ',err.error.code);
				return cb({ success: false, err:err.error.message,code:err.error.code });
		}
		return cb({ success: true,result:result});
	});
}

/**
 * send coin to address
 * 
 * #### Expected Return
 * 		Obj{success : true/false,
 * 			result : transaction id
 * 		   }
 * 
 * @api public
 */
RPC.prototype.sendto = function(toaddress,amount,private,public,cb) {
	rpcapi.sendtoaddress(toaddress,amount,private,public,function(err,result) { 
		if (err) {
				if(err.message)err=err.message;
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, ',e);
				}
				//console.log(err,'message:    ',err.message);
				return cb({ success: false, err:err.error.message,code:err.error.code });
		}
		return cb({ success: true,result:result});
	});
}

/**
 * Sets Doge options
 * 
 * ####Example:
 * 
 *     snowcoin.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 RPC.prototype.set = function(key, value) {
	
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
 * Sets multiple snowcoin options.
 *
 * ####Example:
 *
 *     snowcoin.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

RPC.prototype.options = function(options) {
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

RPC.prototype.getPath = function(key, defaultValue) {
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

RPC.prototype.get = RPC.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


module.exports = function(options) {
    return new RPC(options)
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
