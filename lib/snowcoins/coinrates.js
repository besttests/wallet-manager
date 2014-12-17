var api,
	keystone = require('keystone'),
	utils = require('keystone-utils'),
	fs = require('fs'),
	async = require('async'),
	crypto = require('crypto'),
	_ = require('lodash'),
	request = require('request'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');



var Coinrates = function() {
	var _this = this	
	this._options = {
		//'host':'localhost',
	};
	/** default coins */
	var mycoins = {};
	snowlist.coins.model.find().sort('name')
	.exec(function(err,docs) {
		if(docs[0]) {
			docs.forEach(function(v) {
				if(v.volume>1)mycoins[v.name] = v.ticker
			})
			_this.set('coins',mycoins);
			//console.log(_this.get('coins'))	
			
		} else {
			Coinrates.getcoins(function(){
				//console.log(_this.get('coins'))	
			})
		}
		
	});
	
}

/**
 * Initialises Coinrates in encapsulated mode.
 * 
 * Accepts an options argument.
 * 
 * Returns `this` to allow chaining.
 *
 * @param {Object} options
 * @api public
 */

Coinrates.prototype.init = function(options) {
	
	this.options(options);	
	
	return this;
	
}


/**
 * Grab results from a url
 * 
 * ####Example:
 * 
 *     Coinrates.grabapidata('http://url.tld/api/get',{name:'john'},'post',function(results){}) // sets the 'api' var to include to the correct object
 * 
 * @param {String} value
 * @param {Object}
 * @param {String} post/get
 * @param {Function} callback
 * @api public
 */
Coinrates.prototype.grabapidata = function (url,postget,postgetdata,cb) {
	var args = Array.prototype.slice.call(arguments, 1),
		fn   = args.pop();
	var rv = this.iscallback(fn);
	if (typeof postget === 'string') {
		var postme = postget;
	}
	else if (typeof postget === 'object') {
		var postme='get';
		var postdata = postget;
	} else {
		var postme = 'get'
	}
	if (postdata ) {
		//nothing
	}
	else if (typeof postgetdata === 'object') {
		var postdata = postgetdata;
	} else {
		var postdata = {};
	}
		
	if(!url){
		console.log('ERROR: No url');
		return {'success':false,'err':'ERROR: No url'};
	}
	
	//console.log('rv',rv);
	if(postme.toLowerCase()=='post') {
		request.post(url, {form:postdata},function (e, r, body) {
			return rv==true ? fn({'success':true, data:body}) : body;	
		});
		
	} else {
		request.get(url, {form:postdata},function (e, r, body) {
			return rv==true ? fn({'success':true, data:body}) : body;	
		});
	}
	
}



/**
 * testme
 * 
 * 
 * */
Coinrates.prototype.testme = function () {
	console.log('test callback line 114 coinrates');
}

/**
 * get coins
 * 
 * ####Example:
 * 
 *     Coinrates.getcoins(callback) // 
 * 
 * @param {Function} callback
 * @api public
 */
Coinrates.prototype.getcoins = function (cb) {
	var _this = this
	
	Coinrates.grabapidata('http://api.cryptocoincharts.info/listCoins','get',{},
			
			function(ret){
				//console.log(typeof ret.data);
				try {
					var mya = JSON.parse(ret.data);
				} catch(e) {
					console.log(ret,'Grab Coins Error ... could not parse JSON data');
					return cb();
				}	
				var mycoins = {},
					savecoins = []
				mya.forEach(function(v,i) {
					savecoins.push({name:v.name.toLowerCase(),ticker:v.id.toLowerCase(),price:v.price_btc,volume:v.volume_btc});
					mycoins[v.name] = v.id
					//console.log(v.id,'=',v.price);
				});
				//console.log(savecoins);
				var promise = snowlist.coins.model.create(savecoins);
				promise.then(function() {
					Coinrates.set('coins',mycoins)
					return cb(savecoins)
				});
			}
	);
	
	
}

/**
 * update rates
 * 
 * ####Example:
 * 
 *     Coinrates.updaterates(api,function(results){}) // 
 * 
 * @param {String} value
 * @param {Function} callback
 * @api public
 */
Coinrates.prototype.updaterates = function () {
	
	var args = Array.prototype.slice.call(arguments),
		fn   = args.pop();
	
	var api = (typeof args[0] === 'object') ? 'cryptocoincharts':args[0]
	var data = (typeof args[1] === 'object') ? args[1]:{} 
	
	var rv = Coinrates.iscallback(fn);
	if(!rv)fn = function(){}
	var coins = Coinrates.get('coins'),
		getcoins='',savecoins=Array(),
		getrates = this;
	if(!api)api = 'default: cryptocoincharts';
	var addmoney = function(savecoins) {
		if('object' === typeof savecoins) {
			var addme = [],
				snowmoney = snowlist.snowmoney.model;
			async.series([
				function(finish) {
					var sclength = savecoins.length -1;
					savecoins.forEach(function(v,i,o) {
						if(v.rate >= 0 ) {
							async.series([
								function(next) {
									var tmp = {to:v.currency,from:v.coin,rate:v.rate,published:v.published,apiUsed:v.apiUsed};
									snowmoney.update({$and: [{from:v.coin},{to:v.currency}]},tmp, {upsert:true},function(err){
										//if(err)console.log('err adding accepted rate',tmp);
										next();
									});
									
								},
								function(next) {
									if(v.currency === 'usd') {
										var tmp = {to:v.coin,from:'usd',rate:v.rate,published:v.published};
										tmp.rate = 1/v.rate
										snowmoney.update({$and: [{from:'usd'},{to:v.coin}]},tmp, {upsert:true},function(err){
											//if(err)console.log('err adding accepted usd rate',tmp);
											next();
										});
									} else next();
									
								},
								function(next) {
									if(v.currency === 'eur') {
										var tmp = {to:v.coin,from:'eur',rate:v.rate,published:v.published};
										tmp.rate = 1/v.rate
										snowmoney.update({$and: [{from:'eur'},{to:v.coin}]},tmp, {upsert:true},function(err){
											//if(err)console.log('err adding accepted eur rate',tmp);
											next();
										});
									} else next();
								}
							], function(err) {
								//console.log('finished: ',v)
								if(sclength === i) {
									//console.log('run finish',sclength,i);
									finish();
								}
							});
						}
					});
				}
			], function(err) {
				
				var data
				if(typeof args[1] !== 'function')data = args[1]
				console.log('finished: coinrates');
				fn(null,data);
			});
		}
	}
	switch(api) {
		case "prelude.io" :
			var propNames = Object.getOwnPropertyNames(coins);
			propNames.forEach(function(name) {
				getrates.grabapidata('https://api.prelude.io/combined/'+coins[name],'get',
							{},
							function(ret){
								console.log('https://api.prelude.io/combined/'+coins[name]);
								var mya = JSON.parse(ret.data);
								var rates=Array();
								//console.log(mya);
								if(mya.status=='success') {
									mya.buy.forEach(function(v) {
										var rr= parseFloat(v.rate);
										if(!isNaN(rr))rates.push(rr);
									});
									var plus=0;
									rates.sort().shift();
									rates.pop();
									rates.forEach(function(v){plus+=v});
									var plusavg = plus/rates.length;
									if(!isNaN(plusavg)) {
										//console.log({coin:coins[name],currency:'btc',rate:plusavg.toFixed(8),apiUsed:api});
										var savecoins = {coin:coins[name],currency:'btc',rate:plusavg.toFixed(8),apiUsed:api}
										var promise = snowlist.rates.model.create(savecoins);
									}
								}
							}
				);
			});		
			
			return cb({success:true});	
			break;
		case "cryptocoincharts" :
		default:
			getcoins+='eur_usd,';
			var propNames = Object.getOwnPropertyNames(coins),
				pN2=propNames;
			propNames.forEach(function(name) {
				getcoins+=coins[name]+'_usd,';
				getcoins+=coins[name]+'_eur,';
				pN2.forEach(function(coin) {
					if(coin!=name)getcoins+=coins[name]+'_'+coins[coin]+',';
				});
				/*
				getcoins+=coins[name]+'_btc,';
				getcoins+=coins[name]+'_ltc,';
				getcoins+=coins[name]+'_doge,';
				*/
			});
			//console.log(getcoins)
			Coinrates.grabapidata('http://api.cryptocoincharts.info/tradingPairs','post',
								{pairs:getcoins},
								function(ret){
									//console.log(ret,'get rates');
									try {
										var mya = JSON.parse(ret.data);
									} catch(e) {
										console.log(ret,'Grab Rates Error ... could not parse JSON data');
										return fn('Grab Rates Error ... could not parse JSON data',data);
									}	
									var time=new Date();
									mya.forEach(function(v,i) {
										var cc = v.id.split('/');
										savecoins.push({published:time,coin:cc[0].toLowerCase(),currency:cc[1],rate:v.price,apiUsed:api});
										//console.log(v.id,'=',v.price);
									});
									//console.log(savecoins);
									var promise = snowlist.rates.model.create(savecoins);
									promise.then(function() {return addmoney(savecoins)});
								}
			);
			
			break;
	}
	
}


/**
 * get rates in array
 * 
 * ####Example:
 * 
 *     Coinrates.rates(cb) // return 
 * 
 * @param {Function} value
 * @api public
 */
Coinrates.prototype.rates = function (cb) {
	
	var coins = this.get('coins');
	
	snowlist.rates.model.find().sort({'published':-1}).limit(100)
				.exec(function(err, results) {
					var myres={},send=Array(),time=false,l=results.length;
					if(results[0])time=new Date(results[0].published).getTime();
					for(i=0;i<l;i++) {
						var v = results[i];
						if(!time){time=v.published;}
						if(v.coin && time==new Date(v.published).getTime()) {
							var mc = v.coin.toLowerCase();
							if(!myres[mc])myres[mc]=Array();
							myres[mc][v.currency]=v.rate;
							myres[mc].timer=v.published;
							if(!myres[mc].coin)myres[mc].coin=_.invert(coins)[mc];
						}
					}
					_.keys(myres).forEach(function(v,i){ 
						if(i)send.push({ticker:v,coin:myres[v].coin,doge:myres[v].doge,usd:myres[v].usd,eur:myres[v].eur,btc:myres[v].btc,ltc:myres[v].ltc,createdDate:myres[v].timer});
					});
					return cb(send);
				});
}

/**
 * get rates in snow array 
 * 
 * ####Example:
 * 
 *     Coinrates.snowmoney() 
 * 
 * @param Object
 * @api public
 */
Coinrates.prototype.snowmoney = function (callback) {
	
	var snowmoney={};
	
	snowlist.snowmoney.model.find().exec(function(err,data) {
		
		data.forEach(function(v,i) {
			
			if(!snowmoney[v.from])snowmoney[v.from]={};
			
			snowmoney[v.from][v.to]={'published':v.published,'time':v.published,'price':v.rate};
			
			if(!snowmoney[v.from].published)snowmoney[v.from].published = v.published;
			
		});
		if(snowmoney.btc)snowmoney.btc.doge.price = 1/snowmoney.doge.btc.price;
		//console.log(snowmoney);
		return callback(snowmoney);	
	});
	
	var cb = function(v) { return callback(v) }
	
	
	/** *
	snowmoney=Array();
	snowmoney['usd']={};
	snowmoney['eur']={};
	snowmoney['btc']={};
	snowmoney['ltc']={};
	snowmoney['doge']={};
	rates.forEach(function(v,i) {
		if(v.ticker=='eur')return;
		snowmoney[v.ticker]={};
		_.each(v,function(dd,i) {
			if(dd <= 0 && i !== 'createdDate') {
				v[i] = 0.000000000000001;
			}
		});
		snowmoney['usd'][v.ticker]={'time':v.createdDate,'price':(1/v.usd)};
		snowmoney[v.ticker]['usd']={'time':v.createdDate,'price':v.usd};
		snowmoney[v.ticker]['eur']={'time':v.createdDate,'price':v.eur};
		snowmoney[v.ticker]['btc']={'time':v.createdDate,'price':v.btc};
		snowmoney[v.ticker]['ltc']={'time':v.createdDate,'price':v.ltc};
		snowmoney[v.ticker]['doge']={'time':v.createdDate,'price':v.doge};
		if(v.eur)snowmoney['eur'][v.ticker]={'time':v.createdDate,'price':(1/v.eur)};
	});
	if(!snowmoney.eur.usd)snowmoney.eur.usd={'time':'','price':0.000000000000000001};
	if(!snowmoney.ltc.btc)snowmoney.ltc.btc={'time':'','price':0.000000000000000001};
	if(!snowmoney.btc.usd)snowmoney.btc.usd={'time':'','price':0.000000000000000001};
	if(!snowmoney.btc.eur)snowmoney.btc.eur={'time':'','price':0.000000000000000001};
	if(!snowmoney.ltc.usd)snowmoney.ltc.usd={'time':'','price':0.000000000000000001};
	if(!snowmoney.ltc.eur)snowmoney.ltc.eur={'time':'','price':0.000000000000000001};
	if(!snowmoney.doge.eur)snowmoney.doge.eur={'time':'','price':0.000000000000000001};
	if(!snowmoney.doge.usd)snowmoney.doge.usd={'time':'','price':0.000000000000000001};
	if(!snowmoney.doge.btc)snowmoney.doge.btc={'time':'','price':0.000000000000000001};
	if(!snowmoney.usd.btc)snowmoney['usd']['btc']={'time':'','price':0.000000000000000001};
	if(!snowmoney['usd']['ltc'])snowmoney['usd']['ltc']={'time':'','price':0.000000000000000001};
	if(!snowmoney['usd']['doge'])snowmoney['usd']['doge']={'time':'','price':0.000000000000000001};
	* */	
	
}



/**
 * Is the callback a function
 * 
 * ####Example:
 * 
 *     Coinrates.iscallback(cb) // is this a callback
 * 
 * @param {Function} value
 * @api public
 */
Coinrates.prototype.iscallback = function (checkme) {
	return typeof checkme === 'function' ? true:false;
}



/**
 * Sets Coinrates options
 * 
 * ####Example:
 * 
 *     Coinrates.set('api', 'rpc') // sets the 'api' option to `rpc`
 * 
 * @param {String} key
 * @param {String} value
 * @api public
 */
 Coinrates.prototype.set = function(key, value) {
	
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
 * Sets multiple Coinrates options.
 *
 * ####Example:
 *
 *     Coinrates.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Coinrates.prototype.options = function(options) {
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
 *     Coinrates.getPath(path) // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Coinrates.prototype.getPath = function(key, defaultValue) {
	var path = this.get(key);
	path = ('string' == typeof path && path.substr(0,1) != '/') ? process.cwd() + '/' + path : path;
	return path;
}


/**
 * Gets Coinrates options
 *
 * ####Example:
 *
 *     Coinrates.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Coinrates.prototype.get = Coinrates.prototype.set;

/**
 * Deprecated options that have been mapped to new keys
 */
var remappedOptions = {};


/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     Coinrates.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Coinrates.prototype.encrypt = function(text,password) {
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
 *     Coinrates.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Coinrates.prototype.decrypt = function(text,password) {
  var decipher = crypto.createDecipher('aes-256-cbc',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



/**
 * The exports object is an instance of Coinrates.
 *
 * @api public
 */

var Coinrates = module.exports = new Coinrates;
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
