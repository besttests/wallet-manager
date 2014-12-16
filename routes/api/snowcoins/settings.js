var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	mymoment=require('moment'),
	wally=false,
	snowcoin = require('snowcoins-api'),
	getrates = require('../../../lib/snowcoins/coinrates.js'),
	_ = require('lodash'),
	numeral = require('numeral'),
	notcron = require('snowpi-notcron'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists'),
	tracker = require('snowcoins-tracker'),
	Link = require('snowcoins-link');


	
exports = module.exports = function(req, res) {
		
		//console.log(req)
	//we shouldnt be here if not a user but check again
	if(req.user)
	{	
		var view = new keystone.View(req, res)
		
		var locals = res.locals;
		locals.data={userSettings:{}},locals.data.qq={}
		
		msg='',errors=''
		var succ,ip,list;
		
		var Wallets = snowlist.wallets;
		var Keys = snowlist.clients;
		var Dynamic = snowlist.attended;			
		var Static = snowlist.unattended;
		var CR = snowlist.rates;
		var Tracker = snowlist.trackers;
		var Settings = snowlist.settings;
		locals.data.userSettings = {} ;
		var throwError = [];
		
		if(req.query.uri)locals.data.qq=JSON.parse(req.query.uri);
		//console.log(locals.data.qq);
		async.series([
		
		/* run if rates are set */
		function(next) {
			if(req.body.action==='setcurrencyrates' || req.body.action==='setcurrencyratesnow')
			{
				//var useApi='cryptocoincharts';
				//console.log('set currency rates',req.body,req.query)
				var useApi=req.body.api,
					jobname='currencyrates';
				
				var startRates = function() {
					var options = {}
					options.custom = true 
					options.interval = req.body.when
					options.type = 'system'
					options.name = 'snowcoins-rates'
					options.doGrab = {
						modulePath: snowcoins.get('moduleDir') + '/lib/snowcoins/coinrates.js',
						moduleFunction : 'updaterates',
						arguments: useApi,
						callbackFunction: '',
					}
					tracker.create(options,function(err) { 
						if(err)console.log(err)
						next();
					})
				}
				startRates();
				
			} else {
				next();
			}
		},
		/* grab user settings and set if object available */	
		function(next) {
			
			//get/set the user settings
			var getsettings = function() {
				Settings.model.userSettings(req.user.id,function(err,val) {
					//console.log('check settings and get linkName',val);
					if((newsettings.sendKey || newsettings.shareKey)) {
						var opts = {
							share:newsettings.shareKey || val.shareKey,
							secret:newsettings.sendKey || val.sendKey,
							action:'check',
							params: req.query
						}
						if(newsettings.shareKey) {
							/* add a pointer for link users */
							var linkerdoc = {}
							linkerdoc.setting = 'link-'+ newsettings.shareKey;
							linkerdoc.value =  req.user.id;
							Settings.model.findOneAndUpdate({ "setting" : linkerdoc.setting},linkerdoc,{upsert:true,new:true}, function(err,doc){
								if(err)console.log(err,'failed upserting .link link for user');
							});
						}
						Link.sendRequest(opts,function(err,response) {
							//console.log('check settings and get linkName',opts,response);
							if(response) {
								if(typeof response.data === 'object') {
									
									newsettings.linkName=response.data.linkName;
									
									Settings.model.userSettings(req.user.id,newsettings,function(er2r,val2) {
										//console.log('update user settings',response,val2)
										locals.data.userSettings = val2;
										next();
										
									})
								} else {
									
									newsettings.linkName = '';
									Settings.model.userSettings(req.user.id,newsettings,function(err2,val2) {
										//console.log('update user settings',response,val2)
										locals.data.userSettings = val2;
										next();
										
									})
									
								}
							} else {
								//console.log('error checking link settings',err);
								
								newsettings.linkName = '';
								Settings.model.userSettings(req.user.id,newsettings,function(err2,val2) {
									throwError.push('Authorization check failed. Check your shareKey and sendKey.');
									newsettings = {};
									getsettings();
																	
								})
								
							}
							
						});
					} else if(_.isObject(newsettings)) {
						Settings.model.userSettings(req.user.id,newsettings,function(err2,val2) {
							locals.data.userSettings = val;
							locals.data.userSettings.language = newsettings.language;
							next();							
						})
							
					} else {
						locals.data.userSettings = val;
						next();
					}
					
				})
			}
			var newsettings = {}
			if(req.query.page === 'setusersettings') {
				
				try {
					
					newsettings = JSON.parse(req.query.newsettings)
					//console.log('set new user settings',newsettings)
					getsettings()
					
				} catch(e) {
					console.log(e,'FAIL JSON set new user settings')
					getsettings()
				}
				
			} else {
				//console.log('get  user settings')
				getsettings()
			}
		},
 		
		function(next) { 
			next();	
		},
		/* run for rates these are the actual rates*/
		function(next) {
			if(req.query.page === 'rates')
			{
				getrates.rates(function(data) {
					locals.data.rates = data;
					getrates.snowmoney(function(d) {
						locals.data.snowmoney = d
						next();
					});
					//console.log(locals.data.currentrates)
					
				});
				
			} else next();			
		},
		/* get the rate parameters from tracker*/
		function(next) {
			if(req.query.page === 'rates')
			{
				locals.data.rateparameters = tracker.public.trackers.system['snowcoins-rates']
				next();
				
			} else next();			
		},
		/* update .link machine name and ip address */
		function(next) {
			var q = req.query
			if(req.query.page === 'update-ip') {
				
				console.log('update ip')
				var startTracker = function(opts) {
					var sendopts = opts;
					
					try {
						sendopts.secret = snowcoins.encrypt(sendopts.secret);
						sendopts = JSON.stringify(sendopts);
					} catch(e) {
						console.log('could not stringify opts');
					}
					//console.log('create tracker',sendopts)
					var options = {}
					options.owner = req.user.id;
					options.custom = true;
					options.interval = 3600; 
					options.type = '.link';
					options.name = 'link-ddns-'+opts.hostname;
					options.doGrab = {
						modulePath: 'snowcoins-link',
						moduleFunction : 'intervalCheck',
						arguments: sendopts,
						callbackFunction: '',
					} 
					tracker.create(options,function(err) { 
						if(err)console.log(err)
						next();
					})
				} 
				
				var startLinkServer = function(state,port,cb) {
					var num = parseFloat(state);
					var setstate = state !== 'on' ? 'off':'on';
					snowcoins.linkServer({state:setstate,port:port},function(err,val) {
						
						locals.data.linkserver = {};
						if(typeof val === 'object') {
							locals.data.linkserver.success = true;
							locals.data.linkserver.message = val.message;
						}
						if(err) {
							locals.data.linkserver.success = false;
							locals.data.linkserver.message = err;
						}
						return cb()
					})
				}
				
				if(q.hostname && locals.data.userSettings.sendKey && locals.data.userSettings.shareKey) {
					
				 	var sjip = ['action','page','name'];
					var x = _.filter(q,function(v,i,c) {
						return (sjip.indexOf(v) === -1)
					});
					q.port = q.use === 'off' ? 0 : parseFloat(q.port) === 0 ? 12777 : parseFloat(q.port);
					q.protocol = snowcoins.get('ssl') ? 'https://':'http://';
					var opts = {
						share:locals.data.userSettings.shareKey,
						secret:locals.data.userSettings.sendKey,
						hostname:Link.clean(q.hostname),
						params:q,
						action:q.action
					}
					//console.log(opts) 
					Link.getIp({iponly:1},function(err,ip) { 
						
						
						if(err) return res.apiError(401,err,401,err); 
						opts.ip=ip.ip;
						opts.params.ip=ip.ip;						
						console.log('get ip',opts)
						var hostname;
						Link.sendRequest(opts,function(err,response) {
							if(response) {
								if(typeof response.data === 'object') {
									var setusersettings = {
										ddnsHostname: response.data.hostname,
										ddnsHost: response.data.host,
										ddnsHostB: response.data.hostB,
										ddnsIP: response.data.ip,
										ddnsLastUpdated: response.data.updatedAt,
										linkPort: q.port,
										linkServer: q.use,
										ddnsProtocol: q.protocol,
										ddnsPort: snowcoins.get('ssl') ? snowcoins.get('ssl port') || snowcoins.get('port') : snowcoins.get('port'),
									}
									Settings.model.userSettings(req.user.id,setusersettings,function(val) {
										console.log('updated user settings');
										locals.data.link = response
										startLinkServer(q.use,q.port,function(err,val) {
											console.log('updated link server');
											locals.data.link = response
											startTracker(opts);
										});
																				
									})
								} else {
									startLinkServer(q.use,q.port,function(err,val) {
										
										locals.data.link = response
										next();
									});
									
								}
							} else {
								startLinkServer(q.use,q.port,function(err,val) {
										
									locals.data.link = {error:'Could not process request'}
									next();
								});
								
							}
							
						});
					});	
				
				
				} else {
					
					locals.data.link = {error:'You must supply a hostname as well as have a shareKey and sendKey on file.'}
					next();
				}
				
				
			} else {
			
				next();
			}
			
		},
		function(next) {
			var q = req.query
			if(q.page === 'remove-ddns') {
				console.log('remove ddns')
				
				if(q.hostname === locals.data.userSettings.ddnsHostname && locals.data.userSettings.sendKey && locals.data.userSettings.shareKey && locals.data.userSettings.ddnsIP) {
					var opts = {
						share:locals.data.userSettings.shareKey,
						secret:locals.data.userSettings.sendKey,
						ip:locals.data.userSettings.ddnsIP,
						hostname:q.hostname,
						action:q.action,
						params:q,
					}
					opts.params.ip=locals.data.userSettings.ddnsIP;
					
					Link.sendRequest(opts,function(err,response) {
						
						tracker.removeByName('link-ddns-'+opts.hostname,req.user.id,function(){
							var setusersettings = {
								ddnsHostname: '',
								ddnsHost: '',
								ddnsHostB: '',
								ddnsIP: '',
								ddnsPort: '',
								ddnsProtocol: '',
								linkProtocol: '',
								ddnsLastUpdated: new Date().toLocaleDateString(),
							}
							Settings.model.userSettings(req.user.id,setusersettings,function(val) {
								locals.data.link = response;
								next();
							})
						});		
					});
					
				} else {
					next();
				}
			
			} else {
			
				next();
			}
		},
		function(next) {
			
			if(req.query.language) {
				
				var lang = snowcoins.get('languages');
				if(typeof lang[req.query.language] === 'object') {
					locals.data.language = lang[req.query.language];
					
				}
			}
			next();
		}, 
		function(next) {
			if(req.query.pinglinkhome) {
				snowcoins.phoneHome(locals.data.userSettings,function(err,resp) {
					//console.log('pinglinkhome',err,resp)
					if(err)throwError.push(err);	
					if(resp)locals.data.linkping = true;
					next();
				})
			} else {
				next();
			}
		}
		],
		function(err) {
			locals.data.coins = getrates.get('coins');
			
			if(typeof locals.data.userSettings === 'object') {
				if(locals.data.userSettings.sendKey !== '')locals.data.userSettings.sendKey = true;
				if(locals.data.userSettings.sendKey === 'false')locals.data.userSettings.sendKey = false;
			}
			if(throwError.length > 0) {
				return res.apiResponse({ success: false, data:locals.data,err:throwError[0],msg:msg,succeed:succ,ip:ip });	
			} else {
				return res.apiResponse({ success: true, data:locals.data,err:err,msg:msg,succeed:succ,ip:ip });	
			}

		});
	} else {
		return res.apiResponse({ success: false, err:'Error' });
	}
}


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
