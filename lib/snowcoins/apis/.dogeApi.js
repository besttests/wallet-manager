var _ = require('underscore'),
	async = require('async'),
	utils = require('keystone-utils'),
	dogeapi;


var Doge = function() {this._options = Object}

/**
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Doge.prototype.init = function(options) {
	
	this.options(options);	
	
	return this;
	
}

Doge.prototype.auth = function (options) {
	/*Doge / api setup and auth */
	//console.log(options);
	//pin is set as this._options('apipin')
	var settings = {'endpoint':options.host,'apikey':options.apikey};
	var doge1 = require('dogeapi');
	dogeapi = new doge1(settings);
	//console.log(dogeapi);
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
 * 			'info':Obj{}
 * 		}
 * 
 * @api public
 */
Doge.prototype.status = function (callback) {
	dogeapi.getInfo(function(err,result) {
		if (err) {
			try {
				err=JSON.parse(err);
			} catch (e) {
				console.log('JSON.parse error, dogeAPI status',e);
			}
			if(err.error)err=err.error;
			console.log(err);
			return callback({ success: false, err:err });
		}
		var data = {};
		if (result) {
			try {
				data=JSON.parse(result)
			} catch (e) {
				console.log('JSON.parse error, dogeAPI status results',e,result);
				return callback({ success: false, err: ' There was a problem reading the results...' + result });
				
			}
		
		}
		console.log(data);
		
		return callback({ success: true, 'info': data.data.info });
	});
}

/**
 * get balance  
 * 
 */
Doge.prototype.balance = function (type,value,cb) {
	/*check type and return appropriate balance */
	if(!type) {
		dogeapi.getBalance(function(err, result) {
			if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI create User',e);
				}
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
			}
			var data=JSON.parse(result)
			console.log(data);
			return cb({ success: true, 'balance': data.data.balance });
		});
	}
	else if(type=='account') {
		return this.accountbalance(value);
	}
	else {
		return this.addressbalance(value);
	}
}
Doge.prototype.accountbalance = function (account) {
	
}
Doge.prototype.addressbalance = function (address) {
	
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
Doge.prototype.listaccounts = function(callback) {
	var mylist=[],
		_self=this;
	async.series([
		/*get list of all addresses and users*/
		function(next) {
			//grab the users first and add them to mylist
			dogeapi.getUsers(function(err, result) {
				if (err) {
					try {
						err=JSON.parse(err);
					} catch (e) {
						console.log('JSON.parse error, dogeAPI create User',e);
					}
					if(err.error)err=err.error;
					console.log('get users error:',err);
					return next()
				}
				//console.log(result);
				var data=JSON.parse(result)
				_.each(data.data.users,function(val) {
					var truename = val.user_id,
					name = truename;
					//console.log(val);
					mylist.push({'truename':truename,'name':name,'balance':val.user_balance,'addresses':[{'a':val.payment_address,'b':val.user_balance}]});
			
				});
				return next();								
				
			});
		}],
		function(err,results) {
			//grab the main addresses. returns the callback
			dogeapi.getAddresses(function(err,accbal){
				if (err) {
					try {
						err=JSON.parse(err);
					} catch (e) {
						console.log('JSON.parse error, dogeAPI create User',e);
					}
					if(err.error)err=err.error;
					console.log(err);
					return callback({ success: false, err:err })
				}
				//accbal=_.extend([], accbal);
				var data=JSON.parse(accbal)
				
					//console.log(val,index);
					var truename = 'default';
					var name = truename;
					var addresses = [];
					//loop through each address in the main account (addresses), create object and push to addresses
					_.each(data.data.addresses,function(vala) {
						addresses.push({'a':vala,'b':0});
						//console.log(vala);	
					});
					var balance = 0;
					//callback hell ...  grab the balance of the main account, push the main to mylist and run callback
					_self.balance(false,false,function(res){
						balance = res.balance;
						mylist.push({'truename':truename,'name':name,'balance':balance,'addresses':addresses});	
						var list=_.extend({}, mylist);
						//console.log(list)
						return callback({ success: true, 'accounts':list });
					});			
				
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
Doge.prototype.movecoin = function(from,to,amount,cb) {
	//Our setup uses the names sent from DogeAPI and so addresses becomes 'default' a system name that we 
	if('default' != from && 'default' != to) {
		dogeapi.moveToUser(to,from,amount,function(err, result) {
			if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI create User',e);
				}
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
			}	
			return cb({ success: true });
		});
	} else {
		return cb({ success: false, err:'Moving coin is only allowed with user accounts on DogeAPI' });
	}
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
Doge.prototype.setaccount = function(address,account,cb) {
	//cant move addresses between users
	return cb({ success: false, err:"DogeAPI does not allow moving addresses between accounts/users." });
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
Doge.prototype.newaddress = function(account,cb) {
	//Our setup uses the names sent from DogeAPI and so addresses becomes the main account default
	//We add an address to the main account otherwise we should create a new user account
	//User accounts are single address only
	if(account && ''!=account && 'default'!=account ) {
		dogeapi.createUser(account,function(err, result) {
			if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI create User',e);
				}
				if(err.error)err=err.error;
				console.log(err,err.error);
				return cb({ success: false, err:err });
			}
			try {
				result=JSON.parse(result);
			} catch (e) {
				console.log('JSON.parse error, dogeAPI create User',e);
			}
			return cb({ success: true,address:result.data.address || false });
		});
	} else {
		dogeapi.getNewAddress(false,function(err, result) {
			if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI create User',e);
				}
				if(err.error)err=err.error;
				console.log(err,err.error);
				return cb({ success: false, err:err.error });
			}
			try {
				result=JSON.parse(result);
			} catch (e) {
				console.log('JSON.parse error, dogeAPI new address',e);
			}
				return cb({ success: true,address:result.data.address || false });
		});
	}									
}

/**
 * list transactions
 * we are grabbing all transactions which requires 4 calls.  
 * we need a better ui integrated with the api so a settings approach can be used to allow additional page elements and set some gloabls per api
 * something simple like our model object could be repurposed as the template for the settings
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
 * 								txid:
 * 								}
 * 								
 * 			err : error/Obj
 * 			msg : message
 * 		   }
 * 
 * @api public
 */
Doge.prototype.listtransactions = function(account,num,start,cb) {
	if(!num)var num=20;
	if(!start)var start='receive';
	var searchaccount=(account && 'default'!=account)?{type: 'userid', value: account} : false;
	var send = [];	
	//this really is callback hell ... run through receive,send,fee,move
		dogeapi.getTransactions(num,start,searchaccount,function(err,result) { 
			if (err) {
				if(err.error)err=err.error;
				console.log(err);
				//return cb({ success: false, err:err });
			}
			try {
				var data=JSON.parse(result);
				_.each(data.data.transactions,function(vala) {
						send.push({'txid':vala.txid,'category':'receive','address':vala.address,'amount':vala.amount,'time':vala.transaction_time});
						console.log(vala);	
				});
			} catch (e) {
				console.log('JSON.parse error, dogeAPI get transactions',e);
			}
			//console.log(data.data);
			
			dogeapi.getTransactions(num,'send',searchaccount,function(err,result) { 
				if (err) {
					if(err.error)err=err.error;
					console.log(err);
					//return cb({ success: false, err:err });
				}
				try {
					var data=JSON.parse(result);
					_.each(data.data.transactions,function(vala) {
							send.push({'txid':vala.txid,'category':'send','address':vala.address,'amount':vala.amount,'time':vala.transaction_time});
							//console.log(vala);	
					});
				} catch (e) {
					console.log('JSON.parse error, dogeAPI get transactions',e);
				}
				//console.log(data.data);
				
				dogeapi.getTransactions(num,'fee',searchaccount,function(err,result) { 
					if (err) {
						if(err.error)err=err.error;
						console.log(err);
						//return cb({ success: false, err:err });
					}
					try {
						var data=JSON.parse(result);
						_.each(data.data.transactions,function(vala) {
								send.push({'txid':vala.txid,'category':'fee','address':vala.address,'amount':vala.amount,'time':vala.transaction_time});
								//console.log(vala);	
						});
					} catch (e) {
						console.log('JSON.parse error, dogeAPI get transactions',e);
					}
					//console.log(data.data);
					
					dogeapi.getTransactions(num,'move',function(err,result) { 
						if (err) {
							if(err.error)err=err.error;
							console.log(err);
							//return cb({ success: false, err:err });
						}
						try {
							var data=JSON.parse(result);
							_.each(data.data.transactions,function(vala) {
									send.push({'txid':vala.txid,'category':'move','address':vala.address,'amount':vala.amount,'time':vala.transaction_time});
									//console.log(vala);	
							});
						} catch (e) {
							console.log('JSON.parse error, dogeAPI get transactions',e);
						}
						//console.log(data.data);
						return cb({ success: true,transactions:send });
							
					});
						
				});
					
			});
				
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
Doge.prototype.gettransaction = function(txid,cb) {
	return cb({txid:txid});
	
}

/**
 * validate address passthrough
 * 
 * #### Expected Return
 * 		Obj{'success':true/false,
 * 			'err':error / Obj
 * 			'msg':message
 * 		   }
 * 
 * @api public
 */
Doge.prototype.validateaddress = function(address,cb) {
	//send back isValid:true
	return cb({ success: true,result:{success:true,isvalid:true}});
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
Doge.prototype.unlock = function(passphrase,time,cb) {
	dogeapi.walletpassphrase(passphrase,parseFloat(time),function(err,result) { 
			if (err) {
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
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
Doge.prototype.backupwallet = function(path,cb) {
	dogeapi.backupwallet(path,function(err,result) { 
		if (err) {
				if(err.error)err=err.error;
				console.log(err);
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
Doge.prototype.encryptwallet = function(passphrase,cb) {
	dogeapi.encryptwallet(passphrase,function(err,result) { 
		if (err) {
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
		}
		return cb({ success: true,message:result});
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
Doge.prototype.sendfrom = function(account,toaddress,amount,minconf,private,public,cb) {
	dogeapi.withdrawFromUser(account,toaddress,amount,this.get('apipin'),function(err,result) { 
		if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI send',e);
				}
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
		}
		try {
			result=JSON.parse(result);
		} catch (e) {
			console.log('JSON.parse error, dogeAPI send',e);
		}
		console.log(result.data)
		return cb({ success: true,result:result.data.txid});
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
Doge.prototype.sendto = function(toaddress,amount,private,public,cb) {
	dogeapi.withdraw(amount,toaddress,this.get('apipin'),function(err,result) { 
		if (err) {
				try {
					err=JSON.parse(err);
				} catch (e) {
					console.log('JSON.parse error, dogeAPI send',e);
				}
				if(err.error)err=err.error;
				console.log(err);
				return cb({ success: false, err:err });
		}
		try {
			result=JSON.parse(result);
		} catch (e) {
			console.log('JSON.parse error, dogeAPI csend',e);
		}
		return cb({ success: true,result:result.data.txid});
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
 Doge.prototype.set = function(key, value) {
	
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

Doge.prototype.options = function(options) {
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

Doge.prototype.getPath = function(key, defaultValue) {
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

Doge.prototype.get = Doge.prototype.set;


/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


module.exports = new Doge;

