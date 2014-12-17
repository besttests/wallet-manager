var keystone = require('keystone'),
	async = require('async'),
	path = require('path'),
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists'),
	getrates = require(snowcoins.get('moduleDir') + '/lib/snowcoins/coinrates.js'),
	fs = require('fs'),
	_ = require('lodash');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals,
		imported=[];
	
	locals.title = snowcoins.get('name');
	locals.data = {
		wallets: [],
		accounts: []
	};
	// Load the wallets for this user
	async.series([
		function(next) {
			if(req.user) {
				snowlist.settings.model.userSettings(req.user._id,function(err,val) {
					if(err) {
						console.log(err,'error grab user settings');
						next()
					}
					if(typeof val !== 'object'){ settings = {}; val = {}; }
					locals.user.theme = (val.theme) ? val.theme:'snowcoins dark';
					next();
				});
				
			}
		},
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
				var q = snowlist.wallets.model.find().where('owner', req.user._id ).sort('name');
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
			locals.data.defaultcoins = 'snowUI.defaultcoins = [';
			var addon = ',snowUI.defaultcointickers = [';
			_.keys(ccc).forEach(function(name) {
				locals.data.defaultcoins+="'"+name+"',";
				addon+="'"+ccc[name]+"',";
			});
			locals.data.defaultcoins+=']'+addon+']';
			next();
		}
				
	], function(err,results) {
			view.render('site/react',{apilist:imported.sort()});
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
