var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	wally=false,
	snowcoin = require('snowcoins-api'),
	getrates = require('../../../lib/snowcoins/coinrates.js'),
	_ = require('lodash'),
	numeral = require('numeral'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
		
		var view = new keystone.View(req, res),
		locals = res.locals;
		locals.data={},
		msg='',
		errors='',
		succ='',
		fetch = req.params.fetch;
		var Wallet = snowlist.wallets;
		var ClientConnect = snowlist.clients;
		var CurrentWallets = snowlist.attended;			
		var Offline = snowlist.unattended;
		async.series([
		function(next) {
			
			next();
		},
		function(next) {
			
			if(fetch) {
				switch(fetch) {
					case "get-accounts":
						if(req.query.wally) {
							Wallet.model.findOne()
							.where('owner', req.user)				
							.where('key', req.query.wally)
							.select("+apipassword +apikey")
							.exec(function(err, data) {
								if(err) return res.apiResponse({ success: false, err:'Unknown wallet shibe.  Please try again.'});
								
								if(data) {
									wally = data;
									snowcoin.init({
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
									snowcoin.listaccounts(function(result) {
										//console.log(result);
										if (result.success==false) {
											return res.apiResponse({ success: false, err:result.err+'' });
										}
										var acc=[];
										_.keys(result.accounts).forEach(function(param) {
											//console.log(result.accounts[param].truename);
											if(result.accounts[param].truename!='')acc.push(result.accounts[param].truename);
										});
										//console.log(acc);
										return res.apiResponse(acc);
									});
								} else {
									return res.apiResponse(['No results found']);
								}
								
							});
						} else {
							return res.apiResponse(['No results found']);
						}
						break;
					case "get-addresses":
						if(req.query.wally) {
							Wallet.model.findOne()
							.where('owner', req.user)				
							.where('key', req.query.wally)
							.select("+apipassword +apikey")
							.exec(function(err, data) {
								if(err) return res.apiResponse({ success: false, err:'Unknown wallet shibe.  Please try again.'});
								
								if(data) {
									wally = data;
									snowcoin.init({
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
									snowcoin.listaccountswithaddresses(function(result) {
										//console.log(result);
										if (result.success==false) {
											return res.apiResponse({ success: false, err:result.err+'' });
										}
										var acc=[];
										
										_.keys(result.accounts).forEach(function(param) {
											//console.log(result.accounts[param].truename);
											if(result.accounts[param].truename==req.query.account) {
												_.each(result.accounts[param].addresses,function(val) {
													//console.log(val.a);
													acc.push(val.a);
												});
											}
										});
										//console.log(acc);
										return res.apiResponse(acc);
									});
								} else {
									return res.apiResponse(['No results found']);
								}
								
							});
						} else {
							return res.apiResponse(['No results found']);
						}
						break;
					case "get-clients":
						ClientConnect.model.find()
						.where('type','client')
						.exec(function(err, data) {
							if(err) return res.apiResponse({ success: false, err:'Overshot the moon, data not found.  Please try again.'});
							var acc=[];
							
							_.keys(data).forEach(function(param) {
								//console.log(result.accounts[param].truename);
								var newid = data[param]._id,
									name = data[param].name,
									addme={};
								addme[newid]=name;
								//console.log(addme);
								acc.push(addme);
								
							});
							//console.log(acc);
							return res.apiResponse({success:true,clients:acc});
							
						});	
						break;
					case "language":
						var mylanguage = req.query.language || snowcoins.get('language'),
							languages = snowcoins.get('languages');
							
						res.set('Content-Type', 'text/javascript');
						var snowdone = function() {
							//console.log('run languages snowdone');
							
							var snowlanguages = {};
							
							snowlanguages.list=snowcoins.get('language list');
							
							snowlanguages.language=languages[mylanguage];
							
							if(typeof snowlanguages.language !== 'object')snowlanguages.language = snowcoins.get('default language');
							
							snowlanguages.mylanguage = mylanguage
							
							var path = {
								snowcoins: snowcoins.get('path snowcoins'),
								share: snowcoins.get('path share'),
								logout: snowcoins.get('path logout')
							}
							path['d3c'] = snowcoins.get('path d3c');
							path['d2c'] = snowcoins.get('path d2c');
							var lang,paths;
							
							try {
								lang = JSON.stringify(snowlanguages);
								paths = JSON.stringify(path);
							} catch(e) {
								
							}
							var contents = 'snowUI.snowLanguages = '+ lang + ";\n" + "snowUI.snowPaths = " + paths; 
					 
							return res.send(contents);
							
						}
						if(req.user) {
							//console.log('user req so get settings');
							snowlist.settings.model.userSettings(req.user.id,function(err,val) {
								//console.log('inside lang user get settings');
								if(val.language) mylanguage = val.language				
								snowdone();
							});
						} else {
							//console.log('lang do not get settings');
							snowdone();
						}
						break;
					default:
						return res.apiResponse({ success: false, err:'You sent an unknown command shibe.  Please try again.'});
						break;
				}
			}
			else
				next();
		}], 
		function(err) {
			return res.apiResponse({ success: false, error:err });
		});

}


