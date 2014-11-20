var keystone = require('keystone'),
	async = require('async'),
	path = require('path'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists'),
	getrates = require(snowcoins.get('moduleDir') + '/lib/snowcoins/coinrates.js'),
	fs = require('fs'),
	_ = require('lodash');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals,
		imported=[];
	
	locals.section = 'snowcoin';
	locals.data = {
		wallets: [],
		accounts: []
	};
	// Load the wallets for this user
	async.series([
		function(next) {
			if(req.user)
			{
				/* get options for api select box */
				var fromPath=snowcoins.get('moduleDir') + '/lib/snowcoins/apis';
				fs.readdirSync(fromPath).forEach(function(name) {
					var fsPath = path.join(fromPath, name),
						info = fs.statSync(fsPath);			
					// recur
					if (info.isDirectory()) {
						
					} else {
						// only import .js files
						var nn=name.substr(0,1)
						var parts = name.split('.');
						var ext = parts.pop();
						if (ext == 'js' && nn!='.') {
							imported.push(parts);
						}
					}
				});	
						
				
			}
			next();
		},
		function(next) {
			if(req.user) {
				var q = snowlist.wallets.model.find().where('owner', req.user.id ).sort('name');
				q.exec(function(err, results) {
					locals.data.wallets = results;
					next(err);
				});
			}
			else next();
		},
		function(next) {
			var ccc = getrates.get('coins');
			locals.data.defaultcoins ='';
			locals.data.defaultcoins = 'var defaultcoins = [';
			var addon = ',defaultcointickers = [';
			_.keys(ccc).forEach(function(name) {
				locals.data.defaultcoins+="'"+name+"',";
				addon+="'"+ccc[name]+"',";
			});
			locals.data.defaultcoins+=']'+addon+']';
			next();
		}		
	], function(err,results) {
			
			keystone.list(snowcoins.get('model settings')).model.userSettings(req.user.id,function(err,settings) {
				if(typeof settings !== 'object')settings = {}
				console.log(settings,'setings grab middleware')
				locals.user.theme = (settings.theme) ? settings.theme:'snowcoins dark';
				view.render('site/snowcoins',{apilist:imported.sort()});
				
			});
			
	});
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
