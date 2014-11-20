var keystone = require('keystone'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	snowcoins = require('snowcoins');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals,
		imported=[];
	locals.section = 'unattended';
	locals.data = {
		wallets: [],
		accounts: []
	};
	view.on('init', function(next) {
		
		if(req.user) {
			keystone.list(snowcoins.get('model settings')).model.userSettings(req.user.id,function(err,val) {
				if(err) {
					console.log(err,'error grab user settings')
					next()
				}
				if(typeof val !== 'object')settings = {}
				locals.user.theme = (val.theme) ? val.theme:'snowcoins dark';
				next();
			});
			
		} else next();
	
		
		
	});
	view.render('site/unattended',{cck:req.params.apikey});
	
}
