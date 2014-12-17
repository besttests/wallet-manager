var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	wally=false,
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists'),
	moduleDir = snowcoins.get('moduleDir'),
	ledger = require(moduleDir + '/lib/snowcoins/d3c/ledger.js'),
	tx = require(moduleDir + '/lib/snowcoins/d3c/tx.js'),
	status = require(moduleDir + '/lib/snowcoins/d3c/status.js'),
	fetch = require(moduleDir + '/lib/snowcoins/d3c/fetch.js'),
	snowauth = require(moduleDir + '/lib/snowcoins/d3c/snowauth.js'),
	_ = require('lodash'),
	moment = require('moment');


					 
var commands = {
	ledger: {
		create:ledger.create,
		cancel:ledger.cancel,
		modify:ledger.modify,
		additem:ledger.additem,
		deleteitem:ledger.deleteitem,
		find:fetch.ledger
	},
	transaction: {
		create:tx.create,
		cancel:tx.cancel,
		modify:tx.modify,
		additem:ledger.additem,
		addaddress:tx.addaddress,
		deleteitem:ledger.deleteitem,
		find:ledger.find
	},
	status: ['system','ledger','transaction'],
	find: {
		ledger:fetch.ledger,
		wallets:fetch.receivers,
		clients:fetch.clients,
		currencyrates:fetch.rates,
		accounts:fetch.attendedaccounts,
		addresses:fetch.attendedaddresses
		
	},
	
}

exports = module.exports = function(req, res) {
		var gettime = new Date(),
			time = moment(gettime).format('MMM Do YYYY h:mm:ss a zz'),
			unixtime=gettime.getTime();
		var user='';
		var Wallet = snowlist.wallets;
		var ClientConnect = snowlist.clients;
		var CurrentWallets = snowlist.attended;			
		var Offline = snowlist.offline;
		async.series([
		function(next) {
			if(req.params.apikey) {
				var options = {
					ip:req.ip,
					key:req.params.apikey
				}
				snowauth.init(options);
				snowauth.auth(function(err,resp){
					if(err) 
						return res.apiResponse({ success: false, error:err});
					else {
						ledger.init();
						fetch.init();
						tx.init();
						next();
					}
				});
			} else {
				return res.apiResponse({ success: false, error:'API key required'});
			}
			
		},
		function(next) {
				/**
				 * check for a valid command and execute
				 * */
				 //console.log('sc command.req',req)
				 if(req.query.command) {
					 
					 if(!req.query.action)return res.apiResponse({ success: false,time:time, unixtime:unixtime, err:'I received a command without an action.',command:req.query.command+'.null'});
					 
					 if(commands[req.query.command][req.query.action]) {
						 //run the command
						 req.query.apikey=req.params.apikey;
						 var fn = commands[req.query.command][req.query.action];
						 fn(req.query,function(err,resp) {
							 if(err) {
								return res.apiResponse({ success: false, error:err,time:time, unixtime:unixtime, command:req.query.command+'.'+req.query.action+''});
							 } else {
								//if( req.query.action=='currencyrates')console.log(resp,'rates api return');
								var ll = resp ? resp.length : 0
								return res.apiResponse({ success: true, time:time, results:ll, data: resp, unixtime:unixtime, command:req.query.command+'.'+req.query.action+'',query:req.query});
							}
						 });
						 
					 } else {
						 return res.apiResponse({ success: false,time:time, unixtime:unixtime, error:'Bad command & action pair. commands.'+req.query.command+'.'+req.query.action,command:req.query.command+'.'+req.query.action+''});
					 }
				 } else {
					// no command.  pass through and send a welcome message
					next();
				 }
				
		}], 
		function(err) {
			return res.apiResponse({ success: true,time:time, unixtime:unixtime,  message:'Welcome. You passed a successful nonce.  Next time try a command.'});
		});

}


