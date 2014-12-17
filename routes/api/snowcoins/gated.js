var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	wally=false,
	snowcoin = require('../../../lib/snowcoins/api.js'),
	_ = require('lodash'),
	numeral = require('numeral'),
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
	if(req.user)
	{
		//console.log('gated access');
		var view = new keystone.View(req, res),
		locals = res.locals,
		wallet=sanitizer.sanitize(req.query.wallet);

		var Wallet = snowlist.wallets;
					
		async.series([
			function(next) {
				Wallet.model.findOne()
				.where('owner', req.user)
				.where('key', wallet)
				.select("+apipassword  +apikey")
				.exec(function(err, data) {
					wally = data;
					return next();
				});		
		}], function(err) {
				
				var command=sanitizer.sanitize(req.query.command);
				
				if (wally)
				{
					
					var mymsg,msg;
					//this is a simple time check to stop a transaction that may have stalled, the request includes a timestamp when sent
					//the value is set high since the nonce basically does the same thing for repeats
					var time=new Date().getTime()-100000;
					if(req.query.checkauth>time) {	
						/*rpc / api setup and auth */
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
						switch(command) {
							
							case "unlock":
								var pass=sanitizer.sanitize(req.query.passphrase),
									time=parseInt(req.query.timeout);
								snowcoin.unlock(pass,time,function(result) {
										if (result.success==false) {
											console.log('unlock',result.err);
											if(result.err)err=result.err;
											return res.apiResponse({ success: false , error:err});
										}
									return res.apiResponse({ success: true });
								});
								break;
							case "changepassphrase":
								console.log(req.query)
								var oldpassphrase=sanitizer.sanitize(req.query.oldpassphrase),
									newpassphrase=sanitizer.sanitize(req.query.newpassphrase),
									confirm=sanitizer.sanitize(req.query.confirm);
								snowcoin.changepassphrase(oldpassphrase,newpassphrase,confirm,function(result) {
										if (result.success==false) {
											console.log('changepass',result.err);
											if(result.err)err=result.err;
											return res.apiResponse({ success: false , error:err});
										}
									return res.apiResponse({ success: true });
								});
								break;
							case "backup":
								var path=sanitizer.sanitize(req.query.filepath);
								//console.log(path);
								snowcoin.backupwallet(path,function(result) {
										if (result.success==false) {
											/*console.log(result.err.message) */
											if(result.err)err=result.err;
											
											return res.apiResponse({ success: false, error:err });
										}
									return res.apiResponse({ success: true });
								});
								break;
							case "encrypt":
								var pass=req.query.p1,
									conf=req.query.p2;
								if(pass!='' && pass==conf) {
									
									snowcoin.encryptwallet(pass,function(result) {
											if (result.success==false) {
											/*console.log(result.err.message) */
											if(result.err)err=result.err;
											return res.apiResponse({ success: false, error:err });
										}
										return res.apiResponse({ success: true,msg:result.message });
									});
								}
								else {
									return res.apiResponse({ success: false, error:'Passphrases do not match' });
								}
								break;
							case "sendfromaccount":
								var account=sanitizer.sanitize(req.query.account),
									toaddress=sanitizer.sanitize(req.query.toaddress),
									amount=parseFloat(req.query.amount),
									private=sanitizer.sanitize(req.query.comment),
									public=sanitizer.sanitize(req.query.commentto);
								//console.log(account,toaddress,amount,private,public);
								snowcoin.validateaddress(toaddress,function(valid){
									if(valid.isvalid) {
										snowcoin.sendfrom(account,toaddress,amount,1,private,public,function(result) {
											if (result.success==false) {
												console.log(result.err);
												if(result.err)err=result.err;
												return res.apiResponse({ success: false, error:err,code:result.code});
											}
											//console.log(result.result);
											//return res.apiResponse({ success: true,tx:result.result });
											snowcoin.gettransaction(result.result,function(result) {
														if (result.err) {
															console.log(result.err);
															if(result.err)err=result.err;
															return res.apiResponse({ success: false, error:err});
														}
														view.render('api/receipt', {
																val: result,
																wally:wally
															},function(err,list){
																return res.apiResponse({ success: true, tx:list});
														});
												});
										});
									} else {
										return res.apiResponse({ success: false,code:404, error:'Recipient address is not a valid '+wally.coin+ ' address' });
									}
								});
								break;
							case "send":
								var toaddress=sanitizer.sanitize(req.query.toaddress),
									amount=parseFloat(req.query.amount),
									private=sanitizer.sanitize(req.query.comment),
									public=sanitizer.sanitize(req.query.commentto);
								//console.log(toaddress,amount,private,public);
								snowcoin.validateaddress(toaddress,function(valid){
									if(valid.isvalid) {
										snowcoin.sendto(toaddress,amount,private,public,function(result) {
												if (result.err) {
													console.log(result.err);
													if(result.err)err=result.err;
													return res.apiResponse({ success: false, error:err,code:result.code });
												}
												//return res.apiResponse({ success: true,tx:result.result });
												snowcoin.gettransaction(result.result,function(results) {
														if (results.err) {
															console.log(results.err);
															if(results.err)err=results.err;
															return res.apiResponse({ success: false, error:err });
														}
						
														view.render('api/receipt', {
																val: results,
																wally:wally
															},function(err,list){
																return res.apiResponse({ success: true, tx:list });
														});
												});
										});
									} else {
										return res.apiResponse({ success: false,code:404, error:'Recipient address is not a valid '+wally.coin+ ' address' });
									}
								});
								break;
							default:
								return res.apiResponse({ success: false, error:'Hi '+req.user.fullname+'. Please give me a command next time.' });
								break;		
								
							
						}
					}
					else {
						console.log('fail time check gated')
						return res.apiResponse({ success: false, error:'Internal authorization failed. Did you hit refresh?' });
					}
				}	
				else
					return res.apiResponse({ success: false, error:'No wallet found' });
		});
	}
	

}


