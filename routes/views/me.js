var keystone = require('keystone'),
	moment = require('moment'),
	sanitizer=require("sanitizer");
	hat=require('hat'),
	snowcoins = require('wallets');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	locals.section = 'snowcat';
	console.log('profile',req.body);	
	
	//logout on finish if username changes
	var sendaway = req.user.username
	
	view.on('post', { action: 'profile.top' }, function(next) {
		var fields=['name','email','theme','username'];
		
		fields.forEach(function(val,index) {
				req.body[val]=sanitizer.sanitize(req.body[val])
		});
		
		if(req.body.canApi=='true' && req.body.apikey=='')
		{
			var key=hat();
			//console.log(key);
			fields.push('apikey');
			req.body.apikey=key;
		}
		console.log('post profile');	
		req.user.getUpdateHandler(req).process(req.body, {
			fields:fields,
			flashErrors: true
		}, function(err) {
		
			if (err) {
				return next();
			}
			if(sendaway!=req.body.username) {
				keystone.session.signout(req, res, function() {
					view.render('site/signout',{},function(err,list) {
						return res.apiResponse({ success: true, html:'You are now logged out.  <a href="/signin">Log in.</a>'});
					});
				});
			} else {
				req.flash('success', 'Your changes have been saved.');
				return next();
			}
		});
	
	});
	
	view.on('post', { action: 'profile.password' }, function(next) {
	
		if (!req.body.password || !req.body.password_confirm) {
			req.flash('error', 'Please enter a password.');
			return next();
		}		
		req.body['password']=sanitizer.sanitize(req.body['password']);
		req.body['password_confirm']=sanitizer.sanitize(req.body['password_confirm']);
		req.user.getUpdateHandler(req).process(req.body, {
			fields: 'password',
			flashErrors: true
		}, function(err) {
		
			if (err) {
				return next();
			}
			
			req.flash('success', 'Your changes have been saved.');
			return next();
		
		});
	
	});
	
	view.on('render', function(next) {
		
		if (locals.skipme) {
			next(err);
			
		} else {
			next();
		}
		
	});
	
	view.render('site/me',{},function(err,list){
		//console.log(crates);
		return res.apiResponse({ success: true, html:list});
	});
	
}
