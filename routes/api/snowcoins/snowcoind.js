var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	wally=false,
	snowcoin = require('snowcoins-api'),
	getrates = require('../../../lib/snowcoins/coinrates.js'),
	getinfo,getbalance,listaccounts,
	_ = require('lodash'),
	numeral = require('numeral'),
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
	if(req.user)
	{
				
		var view = new keystone.View(req, res),
		locals = res.locals,
		wallet=sanitizer.sanitize(req.query.wallet);
		
		var Wallet = snowlist.wallets;
					
		async.series([
			function(next) {
				Wallet.model.findOne()
				.where('owner', req.user)
				.where('key', wallet)
				.select("+apipassword +apikey")
				.exec(function(err, data) {
					if(err) {
						return res.apiResponse({ success: false, error:err.message });
					}
					wally = data;
					
					//wally.coinstamp='<span class="coinstamp">'+wally.coinstamp+'</span>';
					return next();
				});
				
		
		}], function(err) {
				
				if (wally)
				{
					var avcdfgerdfedfrtgf='bgadfgadfgadfga';
					if(avcdfgerdfedfrtgf==='a')
					{
						return res.apiResponse({ success: true, html:'damn' });
					}
					else
					{
						/*rpc / api setup and auth */
						//console.log(wallet,wally)
						snowcoin.init(
							{
								api:wally.coinapi,
								host:wally.address,
								port:wally.port,
								username:wally.apiuser,
								password:wally.apipassword,
								isSSL:wally.isSSL,
								apipin:wally.apipassword,
								apikey:wally.apikey,
								ca:wally.ca
							}
						).auth();
						wally.apipassword='';
						wally.apiuser='';
						var mymsg,msg,info={};
						//this is a simple time check to stop a transaction that may have stalled, the request includes a timestamp when sent
						// the value is set high since the nonce basically does the same thing for repeats
						//qq.checkauth>time 
						var time2=new Date()
						var time=time2-100000;	
						var qq = {};	
								
						if(req.query)var qq=req.query;
						//console.log(time+' - '+qq.checkauth+' - '+qq.account);
						switch(req.query.moon)
						{
							case "accounts":
								var  shortcuts = {};
								async.series([
								//get new address
								function(next) {
									if(qq.createaddress==='now' && qq.checkauth>time && qq.account!==undefined)
									{
										var acc = sanitizer.sanitize(qq.account);
										if(acc==='_default')acc='';
										snowcoin.newaddress(acc,function(result) {
											if (result.success===false) {
												return res.apiResponse({ success: false, error:result.err });
											}
											mymsg='Success. '+sanitizer.sanitize(qq.account)+' : <strong>'+result.address+'</strong>';
											info.newaddress = result.address
											info.toaccount = qq.account
											return next();
										});
									}
									else if(qq.createaddress==='now'  && qq.checkauth<time)
										return res.apiResponse({ success: false, error:'Time limit exceeded. Try again' });
									else if(qq.createaddress==='now' && (!qq.account || qq.account === undefined))
										return res.apiResponse({ success: false, error:'Bad Acount Name' });
									else return next();
								},
								// move address to account
								function(next) {
									if(qq.moveaddress==='now' && qq.checkauth>time)
									{
										var addr=sanitizer.sanitize(qq.address);
										var acc=sanitizer.sanitize(qq.account);
										if(acc==='_default')acc='';
										snowcoin.setaccount(addr,acc,function(result) {
											if (result.success===false) {
												if(result.err)err=result.err;
												console.log(err);
												return res.apiResponse({ success: false, error:err });
											}
											mymsg='Address '+addr+' was moved to '+acc+'. ';
											return next();
										});
									}
									else if(qq.moveaddress==='now')
										return res.apiResponse({ success: false, error:'Duplicate submission' });
									else return next();
								},
								function(next) {
									/* get shortcuts for addresses */
									
									snowlist.unattended.model.find()
									.where('owner', req.user.id )
									.where('status','valid')
									.sort('name')
									.exec(function(err, results) {
										
										results.forEach(function(v) {
											var a = v.sign.pinop;
											shortcuts[v.address] = v.toObject();
											shortcuts[v.address].sign.pinop = a;
										}); 
										//console.log(results);
										next(err);
									});									
								},
								// move coin to account
								function(next) {
									if(qq.movecoin==='now' && qq.checkauth>time)
									{
										var from=sanitizer.sanitize(qq.fromaccount);
										var to=sanitizer.sanitize(qq.toaccount);
										if(from==='_default')from='';
										if(to==='_default')to='';
										var amt=parseFloat(qq.amount);
										snowcoin.movecoin(from,to,amt,function(result) {
											if (result.success===false) {
												return res.apiResponse({ success: false, error:result.err });
											}
											mymsg=amt+' coin was moved from '+from+' to '+to+'. ';
											return next();
										});
									}
									else if(qq.movecoin==='now')
										return res.apiResponse({ success: false, error:'Duplicate submission.' });
									else return next();
								}],
								function(err,results) {
									snowcoin.listaccountswithaddresses(function(result) {
										//console.log(result.accounts[0].addresses);
										if (result.success===false) {
											if(result.err)err=result.err;
											return res.apiResponse({ success: false, error:err });
										}
										snowlist.settings.model.userSettings(req.user.id,function(err,val) {
											return res.apiResponse({ success: true,info:info,userSettings:val, data:result.accounts,msg:mymsg,shortcuts:shortcuts });
										})
										
										
									});
									
									
								});
								break;
							case "status":
								snowcoin.status(function(result) {
									if (result.success===false) {
										console.log(result.err);
										return res.apiResponse({ success: false, error:result.err});
									}
									var result=result.info;
									if(result.unlocked_until>0){
										var date=new Date().getTime();
										if(result.unlocked_until<date){
											result.unlocked_until=result.unlocked_until*1000
											//console.log(result.unlocked_until);
										}				
									}
									getinfo=result;
									if(getinfo.unlocked_until===0)
										getinfo.unlocked_until='Locked';
									else if(getinfo.unlocked_until>0)
									{
										var date = new Date(getinfo.unlocked_until);
										
										getinfo.unlocked_until = date.toLocaleString();;
									}
									else
										getinfo.unlocked_until='Not Encrypted';
									
									//console.log(getinfo.unlocked_until);
									return res.apiResponse({ success: true, data:getinfo });
									
								});
								
								break;
							case "transactions":
								var num = parseFloat(qq.num) || false;
								var start = parseFloat(qq.start) || false;
								var account = (qq.account==='_default')? "":qq.account || false;
								snowcoin.listtransactions(account,num,start,function(result) {
									if (result.success===false) {
										if(result.err)err=result.err;
										if(err)console.log(err);
										return res.apiResponse({ success: false, error:err });
									}
									//console.log(result);
									snowcoin.listaccounts(function(accbal){
												if (accbal.success===false) {
													if(accbal.err)err=accbal.err;
													return res.apiResponse({ success: false, error:err });
												}
												
												
												return res.apiResponse({ success: true, data:{accounts:accbal.accounts,transactions:result }});
												
											});
									
								});
								break;
							case "send":
								async.series([
										function(next) {
											snowcoin.listaccounts(function(accbal){
												if (accbal.success===false) {
													if(accbal.err)err=accbal.err;
													return res.apiResponse({ success: false, error:err });
												}
												la=accbal.accounts;
												//console.log(la);
												next();
											});
										},
										function(next) {
											
											getrates.snowmoney(function(mn){
												snowmoney = mn;
												next();
											});
											
										}], 
										function(error) {
											
											snowcoin.balance(false,false,function(result) {
												if (result.success===false) {
													if(result.err)err=result.err;
													return res.apiResponse({ success: false, error:err });
												}
												
												if(!qq.fromaccount)qq.fromaccount='_default'
												if(result.balance.result===0)result.balance=0.00;
												//console.log(req.query,locals.qs_set());								
												return res.apiResponse({ success: true, data:result,snowmoney:snowmoney,accounts:la });
												
											});
											
										}
									);/*end async*/
								
								break;
							
							case "give":
								view.render('api/give', {
											wally:wally,
											q:qq
											
										},function(err,list){
											return res.apiResponse({ success: true, html:list });
									});
								break;
							case "info":
								view.render('api/about', {
											wally:wally
										},function(err,list){
											return res.apiResponse({ success: true, html:list });
									});
								break;
							case "dashboard":
							default:
								
								async.series([
									function(next){ 
										snowcoin.status(function(data){
											var result = data;
											return next(null,result);
										});
									},
									function(next) {
											
										getrates.snowmoney(function(mn){
											snowmoney = mn;
											next();
										});
										
									}
								],
									function(err,results) {
										var result=results[0].info;
										if(result) {
											
											return res.apiResponse({ success: true, data:result });
											
										}
										else {
											return res.apiResponse({ success: false, error:'Could not connect' });
										}
									}
								);
								break;
						}
						
					}
				}	
				else
					return res.apiResponse({ success: false, error:'No wallet found' });
		});
	}
	

}
