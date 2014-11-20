var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	wally,
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
	if(req.user)
	{
		
		var Wallet = snowlist.wallets;
		var name=sanitizer.sanitize(req.query.wallet);
		var action=sanitizer.sanitize(req.query.action);
		var view = new keystone.View(req, res),
		locals = res.locals;
		async.series([
			function(next) {
				if(action=='info') {
					next();
				}
				else if(name!='all' && name!='' && name!='undefined') {
					Wallet.model.findOne()
					.where('owner', req.user)				
					.where('key', name)
					.select("+apikey")
					.exec(function(err, data) {
						if(err)return res.apiResponse({ success: false, error:'Wallet not found' });
						wally = data;
						next();
					});
				}
				else
				{
					
					Wallet.model.find()
					.where('owner', req.user)
					
					.sort('name')
					.lean()
					.exec(function(err, data) {
						if(err)return res.apiResponse({ success: false, error:'Error retrieving wallets' });
						
						wally = snowcoins.filterDocs(data);
						next();
					});
				}
		
		},
		function(next) {
			snowlist.settings.model.userSettings(req.user.id,function(er2r,val2) {
				locals.userSettings = val2;
				if(locals.userSettings.sendKey !== '')locals.userSettings.sendKey = true;
				if(locals.userSettings.sendKey === 'false')locals.userSettings.sendKey = false;
				next();
				
			})
		}], function(err) {
				
				if(action=='info') {
						view.render('api/about', {
							hash: name
						},function(err,list){
							return res.apiResponse({ success: true, html:list,userSettings:locals.userSettings });
						}
					);
				}
				else if(name==='all' || name==='' || name==='undefined')
				{
					if(!wally)wally={}
					return res.apiResponse({ success: true, wally:wally,userSettings:locals.userSettings });
						
				}
				else if (wally)
				{
					return res.apiResponse({ success: true, wally:wally,userSettings:locals.userSettings });
				}
				else
				{
					return res.apiResponse({ success: false, error:'Not Found',userSettings:locals.userSettings });
				}
		});
	}
	

}
