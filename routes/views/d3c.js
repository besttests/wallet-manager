var keystone = require('keystone'),
	async = require('async'),
	path = require('path'),
	fs = require('fs'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals,
		imported=[];
	locals.section = 'd3c';
	locals.data = {
		wallets: [],
		accounts: []
	};
<<<<<<< HEAD
	console.log('init view',req.params.apikey);
=======
	view.on('init', function(next) {
		
		//console.log('d3c route',req.params.apikey);
		
		if(req.user) {
			snowlist.settings.model.userSettings(req.user.id,function(err,val) {
				if(err) {
					console.log(err,'error grab user settings')
					next()
				}
				if(typeof val !== 'object')settings = {}
				locals.user.theme = (val.theme) ? val.theme:'snowcoins dark';
				next();
			});
			
		} else {
			next();
		}
		
	});
>>>>>>> modulate
	view.render('site/d3c',{d3ckey:req.params.apikey});
	
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
