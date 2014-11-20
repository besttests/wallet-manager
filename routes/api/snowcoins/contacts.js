var keystone = require('keystone'),
	async = require('async'),
	sanitizer=require("sanitizer"),
	peeps,
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');



exports = module.exports = function(req, res) {
	if(req.query.setnonce)
	{
		
		if(req.user) {
			var user = {}
			async.series([
				function(next) {
					
					keystone.list(snowcoins.get('model settings')).model.userSettings(req.user.id,function(err,settings) {
						if(typeof settings !== 'object')settings = {}
						user.theme = (settings.theme) ? settings.theme:'snowcoins dark';
						next()
					});
				},
				function(next) {
					var ccc = getrates.get('coins');
					user.defaultcoins ='';
					user.defaultcoins = 'var defaultcoins = [';
					var addon = ',defaultcointickers = [';
					_.keys(ccc).forEach(function(name) {
						user.defaultcoins+="'"+name+"',";
						addon+="'"+ccc[name]+"',";
					});
					user.defaultcoins+=']'+addon+']';
					next();
				}		
			], function(err,results) {
					var q = snowlist.wallets.model.find({owner:req.user.id }, {'name':1, 'key':1}).sort('name').lean();
					q.exec(function(err, results) {
						if(err)console.log(err)
						return res.apiResponse({ success: true, wally:results, userSettings:user, path: snowcoins.get('snowcoins path') });
					
					});
					
					
			});
			
		} else {
			return res.apiResponse({ success: true });
		}
	} 
	else if(req.user)
	{
		var wallet;
		if(req.query.wallet) {
			snowlist.wallets.model.getID(req.query.wallet,function(err,doc) {
				wallet = doc[0]._id;
				run()
			})
		} else {
			run()
		}
	}
	var run = function() {
		
		var Contacts = snowlist.contacts;
		var view = new keystone.View(req, res),
		locals = res.locals;
		//console.log(req.query.address);
		view.on('get', { action: 'delete' }, function(next) {
			Contacts.model.findOne({ _id: req.query.address })				
			.exec(function (err, item) {
				//console.log('delete',item);
				//return;
				if (err) return 
				if (!item) return 
				item.remove(function (err) {
					if (err) console.log('database error', err);return 
					console.log('removed');
					return;
				});
			});
			next();
		});
		view.on('get', { action: 'add' }, function(next) {
			async.series([
				function(next) {
				console.log('check address');
				Contacts.model.findOne({ address: req.query.address,owner:req.user,wallet:wallet }, function(err, user) {
					if (err || user) {
						return next(null,{success:false});
					} else return next(null,{success:true});
					
				});
				
			}], function(err,test) {
					console.log('add contact check address result:false means exists',test);				
					if(test[0].success==true) {
						var newPost = new Contacts.model({
							name: req.query.name,
							address: req.query.address,
							wallet: wallet,
							owner:req.user
						});
						 
						newPost.save(function(err) {
							if(req.query.stop==1){
								return res.apiResponse({ success: true });
							} else return next();
						});	
					} else {
						return res.apiResponse({ success: false });
					}
			});
			
		});
							
		async.series([
			function(next) {
					console.log(req.user._id,wallet)
					Contacts.model.find()
					.where('owner', req.user)
					.where('wallet',wallet)				
					.exec(function(err, data) {
						peeps = data;
						//console.log(data);
						return next();
					});
		
		}], function(err) {
									
					view.render('api/contacts', {
							peeps: peeps
							
						},function(err,list){
							return res.apiResponse({ success: true, html:list });
						}
					);
					
					
		});
	}
	

}
