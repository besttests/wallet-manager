var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	mymoment=require('moment'),
	wally=false,
	snowcoin = require('../../../lib/snowcoins/api.js'),
	getrates = require('../../../lib/snowcoins/coinrates.js'),
	_ = require('lodash'),
	numeral = require('numeral'),
<<<<<<< HEAD
	notcron = require('snowpi-notcron');
=======
	notcron = require('snowpi-notcron'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists'),
	tracker = require('snowcoins-tracker');


	
>>>>>>> modulate
exports = module.exports = function(req, res) {
		
	//we shouldnt be here if not a user but check again
	if(req.user)
	{	
		var view = new keystone.View(req, res)
		
		tracker.set('owner',req.user._id)
		
		var locals = res.locals;
		locals.data={},locals.data.qq={}
		
		msg='',errors=''
		var succ,ip,list;
		
		var Wallets = snowlist.wallets;
		var Keys = snowlist.clients;
		var Dynamic = snowlist.attended;			
		var Static = snowlist.unattended;
		var CR = snowlist.rates;
		var Tracker = snowlist.trackers;
		if(req.query.uri)locals.data.qq=JSON.parse(req.query.uri);
		//console.log(locals.data.qq);
		async.series([
		//add a new wallet
		//this needs to be moved to the if else below with all the other modification methods
		function(next) {
			if (!req.body.dccaddwallet) {
				next();
			}
			else
			{
				console.log('post new receiver',req.body.dccaddwallet)
				Dynamic.model.findOne()
					.where('owner', req.user._id)
					.where('findwallet', req.body.dccaddwallet)
					.where('status','valid')
					.where('format','1')
					.exec(function(err, data) {
						//console.log('through first search')
						if(data && req.body.format==1) {
							errors+='Wallet in use in the selected capacity';
							return res.apiResponse({ success: false, error:errors});
							//next();
						} else {
							var cfm = req.body.confirmations ? parseFloat(req.body.confirmations) : 12;
							var addme={
								owner: req.user._id,
								name:sanitizer.sanitize(req.body.name),
								totaloffset:sanitizer.sanitize(req.body.totaloffset),
								confirmations:cfm								
							}
							//console.log(req.body.useme);
							if(req.body.useme==='TABaddress') {
								addme.coin=sanitizer.sanitize(req.body.receivertype),
								addme.address=sanitizer.sanitize(req.body.address);
							} else {
								addme.account = sanitizer.sanitize(req.body.account),
								addme.format = req.body.format
							}
							var save = function () {
								//console.log(addme)
								var newPost = new Dynamic.model(addme);
								newPost.save(function(err) {
									if(err) {
										console.log(err);
										return res.apiResponse({ success: false, err:err.message });
									}
									return res.apiResponse({ success: true, msg:'Now Receiveing from wallet ' });
									next();
								});
				
							}
							if(req.body.dccaddwallet && req.body.useme==='TABwallet') {
								
								Wallets.model.getID(req.body.dccaddwallet,function(err,data) {
									//console.log('get wallet id',data)
									addme.wallet = data[0]._id;
									save();
								})
							} else {
								save()
							}
							
						}
					
					});
			}
			
		},
		//this is an if/else of all modification requests
		function(next) {
			
			/* off-line are shortcuts */
			if(req.body.action==='add-offline')
			{
				var dateday = new Date();
				
				var myapikey=sanitizer.sanitize(req.body.shortcut).replace(/[^a-zA-Z0-9_-]/g,'-'),
					address=req.body.address,
					awallet=sanitizer.sanitize(req.body.coinwallet) || false,
					account=sanitizer.sanitize(req.body.account),
					coin=sanitizer.sanitize(req.body.coin),
					lock=sanitizer.sanitize(req.body.lock) === 'yes' ? true : false ,
					pinop=sanitizer.sanitize(req.body.pin),
					keyphrase=sanitizer.sanitize(req.body.keyphrase),
					myformat=sanitizer.sanitize(req.body.type),
					public12=sanitizer.sanitize(req.body.display),
					days = sanitizer.sanitize(req.body.expires),
					adddays = (days=='laina' || days=='burnonimpact')?100000:parseFloat(days),
					recur = days!=='burnonimpact'?false:true;
				
				var myexpires=dateday.setDate( dateday.getDate() + adddays );
				//console.log(typeof adddays, adddays, days,typeof expires,expires);
				if(myapikey===''){
					errors+='Shrtcut name is required';
					return res.apiResponse({ success: false, error:errors});
				}
				var newrec12 = {
					apikey: myapikey,
					address: address,
					account: account,
					coin: coin,
					publicDisplay: public12,
					expires: myexpires,
					
					sign: {
						type: myformat,
						pinop: pinop,
						keyphrase: keyphrase,
						lock: lock,
					},
					owner: req.user._id,
					burner: recur
				};
				//if(awallet!='Select A Wallet')newrec12.wallet=awallet;
				//console.log(newrec12)
				Static.model.findOne()
					.where('owner', req.user._id)
					.where('address', address)
					.exec(function(err, data) {
						
						if(data && data.address !== address) {
							errors+='Shortcut in use';
							return res.apiResponse({ success: false, error:errors});
							//next(err);
						} else if(data && data.address === address) {
							
							data.sign.keyphrase = newrec12.sign.keyphrase;
							data.sign.type = newrec12.sign.type;
							data.sign.pinop = newrec12.sign.pinop;
							data.sign.lock = newrec12.sign.lock;
							data.expires = newrec12.expires;
							console.log(data)
							data.save(function(err) {
								if(err)console.log(err);
								//console.log('save wallet now continue')
								msg+=('Updated shortcut '+myapikey+'.')
								next(err);
							});
							
						}else {
							var save = function () {
								//console.log('save wallet ')
								var newPostme = new Static.model(newrec12);
								//console.log('got model wallet ')
								newPostme.save(function(err) {
									if(err)console.log(err);
									//console.log('save wallet now continue')
									msg+=('Now sharing shortcut '+myapikey+'.')
									next(err);
								});
							}
							if(awallet!='Select A Wallet' && req.body.useme === 'TABfromwallet') {
								
								Wallets.model.getID(awallet,function(err,data) {
									//console.log('get wallet id',data,err,awallet)
									if(data instanceof Array)
										if(typeof data[0] === 'object') {
											newrec12.wallet = data[0]._id;
											newrec12.coin = data[0].coin;
										}
									save();
								})
							} else {
								save()
							}
						}
					
					});
				
			}
			else if(req.body.action==='add-tracker')
			{
				var dateday = new Date();
				console.log(req.body.dccpickaddress,req.body.trackerwallet);
				var name=sanitizer.sanitize(req.body.name),
					address=sanitizer.sanitize(req.body.dccpickaddress),
					awallet=sanitizer.sanitize(req.body.trackerwallet),
					account=sanitizer.sanitize(req.body.account),
					watch=sanitizer.sanitize(req.body.dat),
					root=sanitizer.sanitize(req.body.root);
				var newrec11 = {
					name: name,
					address: address,
					account: account,
					root: root,
					watched: watch,
					owner: req.user._id,
					auto: false,
					type: 'user'
				};
				
				if(req.body.useme === 'TABwatch')newrec11.watch=true;
				
				
				if(awallet!='Select A Wallet') {
					
					Wallets.model.getID(awallet,function(err,data) {
						//console.log('get wallet id',data,err,awallet)
						newrec11.wallet = data[0]._id;
						//save();
						console.log('save tracker with module instead')
						newrec11.interval = 60 // in seconds
						tracker.create(newrec11,function(err,doc) {
							if(err){
								return res.apiResponse({ success: false, error:err});
							} else {
								return res.apiResponse({ success: true});
							}
						})
					})
				} else {
					return res.apiResponse({ success: false, error:'Error'});
				}
				
				
			}
			else if(req.body.action==='delete-tracker')
			{
				tracker.removeByID(req.body.tracker, function(err,wally) {
					if(err){
						return res.apiResponse({ success: false, error:err});
					} else {
						
						return res.apiResponse({ success: true, message:'Tracker removed successfully'});
					}
				});				
			} 
			else if(req.body.action==='delete-unattended')
			{
				console.log('delete unattended receiver',req.body.wid)
				Static.model.findById(req.body.wid, function(err,wally) {
					if(err || !wally){
						return res.apiResponse({ success: false, err:err});
						next(err);
					} else {
						wally.status='deleted';
						wally.apikeyused=wally.apikey;
						wally.apikey='dead:'+new Date().getTime();
						wally.save(function(err){
							if(err){
								return res.apiResponse({ success: false, error:err});
							} else {
								msg+=('Removing Un-Attended Receiver')
								return res.apiResponse({ success: true, _id:wally._id, message:msg});
							}
						});
					}
				});	
				
			}
			else if(req.body.action==='delete')
			{
				console.log('delete wallet',req.body.wally)
				Dynamic.model.findById(req.body.wally, function(err,wally) {
					if(err || !wally){
						return res.apiResponse({ success: false, err:err});
						next(err);
					} else {
						wally.status='deleted';
						wally.save(function(err){
							if(err){
								return res.apiResponse({ success: false, error:err});
							} else {
								msg+=('Removing wallet from receiving')
								return res.apiResponse({ success: true, _id:wally._id, message:msg});
							}
						});
					}
				});				
			}
			else if(req.body.action==='delete-client')
			{
				console.log('delete client/master',req.body.ccid)
				Keys.model.findById(req.body.ccid, function(err,client) {
					if(err){
						return res.apiResponse({ success: false, err:err});
						next(err);
					} else {
						client.status='deleted';
						client.apikeyused=client.apikey;
						client.apikey='dead:' + client.apikey + ':' + new Date().getTime();
						client.name='dead:' + client.name + ':' + new Date().getTime();
						client.save(function(err){
							if(err){
								return res.apiResponse({ success: false, error:err});
							} else {
								msg+=('Revoking api access key')
								return res.apiResponse({ success: true, _id:client._id, message:msg});
							}
						});
					}
				});
				
			}
			else if(req.body.action === 'client-api')
			{
				console.log('add api client')
				var name=sanitizer.sanitize(req.body.name),
					authlevel=sanitizer.sanitize(req.body.authlevel),
					key=sanitizer.sanitize(req.body.apikey).replace(/[^a-zA-Z0-9_-]/g,'-'),
					clients = (req.body.masterclients==='All Clients')?false:req.body.masterclients;
				if(key=='')key=keystone.utils.randomString([16,24]);
				var ip=req.body.ip!=''?req.body.ip:'0.0.0.0/0';
				if(ip.search("/")<0)ip+='/32';
				var addme = {
					type: authlevel>5 ? 'client':'master',
					owner: req.user,
					name:name,
					apikey:key,
					authlevel:authlevel,
					nonce:hat(),
					ip:ip
				}
				if(clients)addme.clients=clients;
				Keys.model.findOne()
					.where('owner', req.user._id)
					.where('apikey', key)
					.exec(function(err, data) {
						if(data)
						{
							console.log('Name exists');
							errors+='API Key Exists';
							//next(err);
							return res.apiResponse({ success: false, error:errors});
						}
						else
						{
							var newPost = new Keys.model(addme);
							newPost.save(function(err) {
								if(err)console.log(err);
								msg+=('API key added!')
								next(err);
							});
						}
					});
				
				
<<<<<<< HEAD
			}
			else if(req.body.action=='setcurrencyrates' || req.body.action=='setcurrencyratesnow')
			{
				var useApi=req.body.api,
					jobname='currencyrates';
				
				locals.data.qq.tab='settings';
				
				var fn = {
					module: '/lib/snowcoins/coinrates.js',
					fn : 'updaterates',
					args: [useApi],
					callback: '',
				}				
				notcron.persist.set(req.body.when,fn,jobname).start(function() { 
					//console.log('callback from intervals.set.start()');
					getrates.updaterates(useApi,function(){
						//console.log('callback from updaterates');
						return next();
					});	
					
				});
				
				
			
				
=======
>>>>>>> modulate
			} else {
				next();
			}
			
		},
		/* each of the next functions are getters */
		
		/* run every time */	
		function(next) {
			locals.data.coins = getrates.get('coins');
						
			next();
		},
		/* run for api access list */
		function(next) {
			if(req.query.page === 'keys')
			{
				Keys.model.find().where('owner', req.user.id ).where('status','valid').populate('clients').sort('name')
				.exec(function(err, results) {
					locals.data.keys = results;
					//console.log(results);
					next(err);
				});
			} else next();	
		},
		/* run for default or dynamic */
		function(next) {
			if(req.query.page === 'shortcuts')
			{
				Static.model.find()
				.where('owner', req.user.id )
				.where('status','valid')
				.select('-__v')
				.sort('name')
				.exec(function(err, results) {
					locals.data.shortcuts = results.map(function(v){
						var a = v.sign.pinop;
						var b = v.toObject();
						b.sign.pinop = a;
						//console.log(b)
						return b;
					}); 
					next(err);
				});	
			} else next();	
		},
		/* run for default or dynamic */
		function(next) {
			if(req.query.page === 'dynamic')
			{
					
				Dynamic.model.find()
				.where('owner', req.user.id )
				.where('status','valid')
				.populate('wallet','-apipassword -apikey -ca -__v -_id')
				.sort('name')
				.lean()
				.exec(function(err, results) {
					locals.data.dynamic = results; 
					//console.log(results);
					next(err);
				});
			} else next();	
		},
		/* run for trackers */
		function(next) {
			if(req.query.page === 'trackers')
			{
				Tracker.model.find()
				.where('status','valid')
				.populate('wallet','-apipassword -apikey -ca -__v -_id')
				.populate('owner','-__v -_id')
				.sort('name')
				.exec(function(err, results) {
					locals.data.trackers = results; 
					//console.log(results);
					next(err);
				});	
			} else next();	
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
		function(next) {
			snowlist.settings.model.userSettings(req.user.id,function(er2r,val2) {
				//console.log('update user settings',response,val2)
				locals.data.userSettings = val2;
				if(locals.data.userSettings.sendKey !== '')locals.data.userSettings.sendKey = true;
				if(locals.data.userSettings.sendKey === 'false')locals.data.userSettings.sendKey = false;
				next();
				
			})
		}],
		function(err) {
			var ip = req.headers['x-forwarded-for'] || 
				 req.connection.remoteAddress || 
				 req.socket.remoteAddress ||
				 req.connection.socket.remoteAddress;
			return res.apiResponse({ success: true, data:locals.data,html:list,err:err,msg:msg,succeed:succ,ip:ip });	
		});
	} else {
		return res.apiResponse({ success: false, err:'Error' });
	}
}


