var async = require('async'),
	keystone = require('keystone'),
	_ = require('lodash'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	snowcoins = require('snowcoins'),
	api = require('snowcoins-api'),
	snowlist = snowcoins.get('lists'),
	tracker = require('snowcoins-tracker');

/* we just check if the accounts/addresses are present and add them if not.  we do not adjust current values */
function checkAccounts(doc,cb) {
	//just skip this for now
	return cb(null,doc);
	
	snowlist.wallets.model.findOne()
	.where('key',doc.key)
	.select('+apikey +apipassword ')
	.populate('accounts addresses')
	.exec(function(err,wally) {
		//console.log(err,wally) 
		api.init({
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
			
		
		
		api.listaccountswithaddresses(function(acc) {	
			//console.log(acc)
			if(acc.success) { 
				var roll = acc.accounts
				//console.log('accounts',typeof roll,roll)
				async.each(roll,function(v,callback) {
						//console.log(v,'each account')
						
							//var newaccount = wally.accounts.create({name:v.truename})
							//newaccount.save()
							//wally.save()
							//console.log(wally.accounts[0])
						
						_.each(v.addresses,function(val) {
							//console.log('each address',val)
							
								//var newaddress = wally.addresses.create({address:val.a,account:newaccount._id})
								//newaddress.save()
								//newaccount.addresses.addToSet(newaddress._id)
								//wally.addresses.save()
								//console.log('save address',newaddress)
							
							
						})
						//wally.accounts.save()
						//wally.save()
						//console.log('save account',newaccount)
						callback()
					},
					function(err) {
						wally.save(function(err,doc) {
							//console.log('save wally',doc)
							if(err)console.log('error updating accounts/addresses',err)
							cb(null,doc)
						})
					}
				)
			} else {
				cb(acc.err,wally)
			}
		})
	})
}

exports = module.exports = function(req, res) {
	
	var Wallet = snowlist.wallets,
		wally = false,
		incomplete = false,
		current = false,
		name = sanitizer.sanitize(req.query.name) || false,
		address = sanitizer.sanitize(req.query.address) || false,
		port = parseFloat(req.query.port) || 0,
		api = sanitizer.sanitize(req.query.apikey) || false,
		apipassword = sanitizer.sanitize(req.query.apipassword) || '',
		apiuser = sanitizer.sanitize(req.query.apiuser) || '',
		coin = sanitizer.sanitize(req.query.coin) || '',
		coinstamp = sanitizer.sanitize(req.query.coinstamp) || '',
		apikey = sanitizer.sanitize(req.query.apikey) || '',
		cointicker = sanitizer.sanitize(req.query.cointicker) || '',
		coinapi = sanitizer.sanitize(req.query.coinapi) || '',
		currency = sanitizer.sanitize(req.query.currency) || '',
		key = sanitizer.sanitize(req.query.key) || '',
		ssl = sanitizer.sanitize(req.query.ssl) || false,
		ca = sanitizer.sanitize(req.query.ca) || '',
		interval = sanitizer.sanitize(req.query.interval) || 600,
		watching = sanitizer.sanitize(req.query.watching) || 0,
		watchpath = sanitizer.sanitize(req.query.watchpath) || '',
		watchfile = sanitizer.sanitize(req.query.watchfile) || '',
		error,updater;
		var formdata ={
			name: name,
			owner: req.user._id,
			address: address,
			apikey:apikey,
			port:parseInt(port),
			apiuser:apiuser,
			coin:coin,
			coinstamp:coinstamp,
			coinapi:coinapi,
			cointicker:cointicker,
			currency:currency,
			isSSL:ssl,
			watchfile:watchfile,
			watchpath:watchpath,
			watching:watching,
			interval:interval,
			ca:ca
		};
	if(key && key!='undefined')
	{
		if(apipassword!=='')formdata.apipassword=apipassword;
		Wallet.model.findOne({ 'key': key }, function(err,wally) {
			
			if (err) return res.apiResponse({ success: false, err: err });
			
			_.keys(formdata).forEach(function(param) {
				if(param!='owner')wally[param] = formdata[param];
			});
			console.log('update wallet')
			wally.save(function(err,wally){
				if (err) return res.apiResponse({ success: false, err: err });
				
				/* add the tracker */
				var newrec11 = {
					name: 'wally-'+wally.key,
					root: watchpath,
					watched: watchfile,
					owner: req.user._id,
					auto: false,
					type: 'system'
				};
				
				newrec11.watch = watching === '2' ? true : false;
				
				newrec11.wallet = wally;
				newrec11.interval = watching === '1' ? 60 : 3000000000 // in seconds
				
				if(watching > 0) {
					console.log('update wallet create tracker')
					tracker.create(newrec11,function(err,doc) {console.log('returned from tracker')})
				} else {
					/*delete the tracker just in case */
					tracker.removeByName('wally-'+wally.key,req.user,function(err){if(err)consoloe.log('error removing tracker on wallet save',err);}); 
				}
				
				/* update the accounts and addresses */
				checkAccounts(wally,function(err,wally) {
					if(err)console.log(error)
					var sendwally = snowcoins.filterDocs(wally.toObject(),['apipassword']);
					return res.apiResponse({ success: true,wally:sendwally });
				
				})
			});
			
		});
	}
	else
	{
		async.series([
		
			function(next) {
				if(name!='undefined' && address!='undefined' )
				{
					Wallet.model.findOne()
					.where('owner', req.user._id)
					.where('name', name)
					.exec(function(err, data) {
						wally = data;
						current = true;
						error='Name exists';
						return next();
					});
				}
				else
				{
					wally=true;
					incomplete=true;
					error='Must add name and address';
					return next();
			
				}
		
		}], function(err) {
		
			if (req.body.statusOnly) {
				
				return res.apiResponse({
					success: true,
					mine: wally ? true : false,
					name: wally && wally.name ? true : false
				});
				
			} else {
				
				if (wally) {
						return res.apiResponse({ success:false,current: current,incomplete:incomplete, err: error });	
											
				}  else {
					formdata.apipassword=apipassword;
					new Wallet.model(formdata).save(function(err) {
						console.log(err)
						if (err) return res.apiResponse({ success: false, err: err });
						
						Wallet.model.findOne()
						.where('owner', req.user._id)
						.where('name', name)
						.exec(function(err, data) {
							wally = data;
							/* add the tracker */
							var newrec11 = {
								name: 'wally-'+wally.key,
								root: watchpath,
								watched: watchfile,
								owner: req.user._id,
								auto: false,
								type: 'system'
							};
							
							newrec11.watch = watching === '2' ? true : false;
							
							newrec11.wallet = wally._id;
							newrec11.interval = watching === '1' ? 60 : 3000000000 // in seconds
							
							if(watching > 0) {
								console.log('add wallet create tracker')
								tracker.create(newrec11,function(err,doc) {console.log(doc)})
							} 
				
							checkAccounts(wally,function(err,wally) {
								if(err)console.log(error)
								return res.apiResponse({ success: true,name:name,wally:snowcoins.filterDocs(wally,['apipassword']) });
							
							})
													
						});
						
					});
				
				}
				
			}
		
		});
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
