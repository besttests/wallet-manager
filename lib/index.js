var 	_ = require('lodash'),
	express = require('express'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	path = require('path'),
	sock = require('socket.io'),
	hat = require('hat'),
	notcron = require('snowpi-notcron'),
	tracker = require('snowcoins-tracker'),
	bone = require('bone.io'),
	Patch = require('../routes/patch.ViewEnableMultiFolders.js'),
	keystone = require('keystone'),
	crypto = require('crypto'),
	lessMiddleware = require('less-middleware'),
	Link = require('snowcoins-link'),
	util = require('util'),
	EventEmitter = require("events").EventEmitter,
	
	dashes = '------------------------------------------------';

var templateCache = {};
/**
 * grabs the true app root
 * from Keystone:
 * Don't use process.cwd() as it breaks module encapsulation
 * Instead, let's use module.parent if it's present, or the module itself if there is no parent (probably testing keystone directly if that's the case)
 * This way, the consuming app/module can be an embedded node_module and path resolutions will still work
 * (process.cwd() breaks module encapsulation if the consuming app/module is itself a node_module)
 */
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); //get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


var Snowcoins = function() {
	
	var _this = this;
	
	this._options = {
		get lists() { 
			return {
				settings: keystone.lists[_this.get('model settings')],
				coins: keystone.lists[_this.get('model coins')],
				wallets: keystone.lists[_this.get('model wallets')],
				wallettx: keystone.lists[_this.get('model wallet transactions')],
				contacts: keystone.lists[_this.get('model contacts')],
				clients: keystone.lists[_this.get('model clients')],
				rates: keystone.lists[_this.get('model rates')],
				attended: keystone.lists[_this.get('model attended')],
				unattended: keystone.lists[_this.get('model unattended')],
				ledger: keystone.lists[_this.get('model ledger')],
				trackers: keystone.lists[_this.get('model trackers')],
				transactions: keystone.lists[_this.get('model transactions')],
				items: keystone.lists[_this.get('model items')],
				log: keystone.lists[_this.get('model log')],
				snowmoney: keystone.lists[_this.get('model snowmoney')],
			}
		},
		'.link ip range' : [],
	}
	
	/* set up the event system */
	EventEmitter.call(this);
	this.on('init',this._init)
	.on('models',this._models)
	.on('routes',this._routes)
	.on('ready',this._ready)
	.on('server started',this._sockets)
	.on('complete',this._complete);
	/**
	 * we also emit
	 * 'tracker'
	 * 'link server'
	 * 'keystone' -- for standalone and byoexpress
	 * */
	 	
	/* link object to keep track of open connections for http(s) server
	 * */
	this.link = {
		sockets: {},
		nextSocketId : 0
	};
	
	
	/* set the module variables
	 * */	
	this.set('name','Wallet Manager');
	this.set('brand','inquisive');
	
	//server setup
	this.set('host',false);
	this.set('port',3888);
	this.set('ssl port',8883);
	
	//uri paths 
	this.set('path snowcoins','walletManager');
	this.set('path share','share');
	this.set('path d3c','d3c');
	this.set('path d2c','d2c');
	this.set('path testbed','testbed');
	this.set('path logout', '/keystone/signout');
	
	//local routes/apis  true by default
	this.set('route share', true);
	this.set('route testbed', true);
	this.set('route snowcoins', true);
	 
	//sockets/ remote apis are all true by default
	this.set('route d3c', true);
	this.set('route d2c', true);
	this.set('api socket', true);
	
	//models
	this.set('use snowcoins user model', false);
	this.set('use greeter', true);
	this.set('model user', 'User');
	this.set('snowcoins user model', 'SnowcoinsUser');
	this.set('model settings', 'SnowcoinsSettings');
	this.set('model coins', 'SnowcoinsCoins');
	this.set('model wallets', 'SnowcoinsWallets');
	this.set('model wallet transactions', 'SnowcoinsWalletsTransactions');
	this.set('model contacts', 'SnowcoinsWalletContacts');
	this.set('model attended', 'SnowcoinsAttended');
	this.set('model unattended', 'SnowcoinsUnAttended');
	this.set('model clients', 'SnowcoinsClientConnect');
	this.set('model rates', 'SnowcoinsCurrencyRates');
	this.set('model ledger', 'SnowcoinsLedger');
	this.set('model snowmoney', 'SnowcoinsSnowmoney');
	this.set('model trackers', 'SnowcoinsTrackers');
	this.set('model transactions', 'SnowcoinsTransactions');
	this.set('model items', 'SnowcoinsTxItems');
	this.set('model log', 'SnowcoinsTxLog');	
	
	this.set('signin url','/keystone/signin');
	this.set('signout url','/keystone/signout');
	
	// include directories
	var ddir = __dirname.split('/');
	ddir.pop();
	this.set('moduleDir',ddir.join('/'));
	this.set('appDir',process.cwd());
	
	// language file
	this.set('language','en-us');
	
	//dynamic path generation for templates
	this.set('path',{
		get client() { return _this.get('d2c path') },
		get master() { return _this.get('d3c path') },
		get wm() { return _this.get('snowcoins path') },
		get offline() { return _this.get('share path') }
	});
	
	
	
	// set the hash secret
	this.set('hashme',process.env.SECRET_KEY || '83jkdehnf6483jdg73292nf6493mnd');
	
	//standalone registration
	this.set('allow register',true); 
	this.set('new user can admin',true); 
	this.set('logger','dev');
	
	//server options
	this.set('standalone',false);
	this.set('custom',false);
	this.set('logger','dev');
	
	this._messages = {
		error: [],
		success: []
	};	
	this._completed = {
		obj:{},
		arr:[]
	}
}

/**
 * attach the event system to Snowcoins 
 * */
util.inherits(Snowcoins, EventEmitter);


/**
 * start
 * 
 * call start once you have attached to all the events you need
 *
 * ####Example:
 *
 *     Snowcoins.start(config) // 
 *
 * 
 * @method get
 * @api public 
 */ 
Snowcoins.prototype.start = function(config) {
	/* we emit init who calls keystone */
	
	return this.emit('init',config);
	
}

/**
 * _init
 * 
 * attach init event to set path, standalone or add the byo express and mongoose object
 *
 * ####Example:
 *
 *     Snowcoins.on('init',config) // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._init = function(config) {
	
	/* add our path into the less option. */
	this.lessSetup()
	/* merge keystone options into snowcoins */
	_.merge(this._options,keystone._options)
		
	/* accept a config object and add it to _options or just move on to the _keystone method */
	if(typeof config === 'object') {
		this.options(config);
		this._keystone();
	} else {
		
		this._keystone();
		
	}
	this._complete('init');
	return this;
	
	
}

/**
 * _keystone
 * 
 * check for a app and mongoose object or for standalone
 *
 * ####Example:
 *
 *     Snowcoins.on('keystone') // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._keystone = function() {
	var app = this.get('app'),
		mongoose = this.get('mongoose'),
		standalone = this.get('standalone'),
		_this = this;
	/* an app should return us a server object so we can set up sockets 
	 * to do so attach to the ready Event and emit 'server started'
	 * var server = {
	 * 	httpServer : app.listen(3000), // keystone.httpServer 
	 * 	httpsServer : false
	 * }
	 * snowcoins.emit('server started',server)
	 * */
	if(standalone) {
		start = {
			standalone : require('./start/standalone.js')
		};
		start.standalone.call(this,keystone,function(){_this.emit('models');_this._complete('keystone')});
	
	} else if(app && mongoose) {
		start = {
			custom : require('./start/custom.js')
		};
		start.custom.call(this,app,mongoose,function(){_this.emit('models');_this._complete('keystone')});
	
	} else {
		this.emit('models');
		_this._complete('keystone');
	}	
	 
	return this;
}
/**
 * _models
 * 
 * attach the models on the models event
 *
 * ####Example:
 *
 *     Snowcoins.on('models') // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._models = function() {
	
	//var keystone = this.get('keystone'),
	var	app = keystone.app,
		_this = this;
	/**
	 * we want to use keystone view but still have custom view templates
	 * this patches  express render prototype.lookup to loop through an array of
	 * paths.  the first valid file returns.  order is important.
	 * 
	 * we set the default view location first to allow customization.
	 * this will only be useful for the main html doc as we switch to React
	 * */
		Patch.ViewEnableMultiFolders(app);
		//redo app.set and keystone.set so we dont screw up the parent app
		var vTemplates = keystone.get('views');
		//console.log(vTemplates)
		app.set('views', [vTemplates, this.get('moduleDir') + '/templates/views']);
		keystone.set('views', [vTemplates, this.get('moduleDir') + '/templates/views']);
	/**
	 * end patch
	 * */
	 
	/* add our models */
	require('../models');
	
	this.emit('routes');
	
	return _this._complete('models');
	
}
/**
 * _routes
 * 
 * attach the routes on the routes event
 *
 * ####Example:
 *
 *     Snowcoins.on('routes',function(){}) // 
 *
 * @method get
 * @api public
 */
Snowcoins.prototype._routes = function() {
	
	//var keystone = this.get('keystone'),
	var	app = keystone.app,
		_this = this;
	
	/* add our static files as an additional directory
	 * */
	_this.statics();
	/* use snowout in the ui so we never have to change the logout url
	 * */
	keystone.redirect({
	    '/snowout': _this.get('path logout')
	});
	/* start our routes
	 * */
	var setRoutes = require('../routes');
	setRoutes(app);	
	
	return _this._complete('routes');
}
/**
 * _ready
 * 
 * attached to the ready event
 *
 * ####Example:
 *
 *     Snowcoins.on('ready',function(errors){}) // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._ready = function() {
	
	var app = this.get('app'),
		mongoose = this.get('mongoose');
	
	this._tracker();
	this._linkServer();	
	
	/* we are ready for the server to start sockets.  The host app should emit to us 'server started' */
	
	return this._complete('ready');
}

/**
 * _linkServer
 * 
 * attached to the ready event
 *
 * run the link server if requested and emit 'link server' if an action is taken
 * 
 * attached to the emit is the linkserver object
 *  
 * use it: Snowcoins.on('link server', function(linkserver){
 * 	...
 * 	do something
 * 	...
 * })
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._linkServer = function() {
	
	var	_this = this,
		list = this.get('lists');
		
	/* give the correct model to the .link request service
		 * */
	Link.set('settingsModel', list.settings.model);
	
	/* if .link is on run the api server
	* */
	this.linkServer(function(){_this._complete('link server')});
	
	return this;
}

/**
 * _tracker
 * 
 * attached to the ready event
 *
 * run the tracker and emit 'tracker'
 * 
 * attached to the emit is the tracker object
 *  
 * use it: Snowcoins.on('tracker', function(trackers){
 * 	...
 * 	do something
 * 	...
 * })
 *
 * @method get
 * @api public
 */
Snowcoins.prototype._tracker = function() {
	
	var	_this = this,
		list = this.get('lists');
		
	/* notcron runs a single entry for snowcoins
	 * */
	notcron.set('baseDir',this.get('moduleDir')); 
	notcron.init({model:list.settings.model}).start();
	
	/* notcron calls tracker; tracker is notcron after training out
	 * */
	tracker.init({model:list.trackers.model}).start(function(err,trackers) {
		
		
		/* we add our rate grabber if tracker hasnt been started already
		* */
		var startRates = function() {
			var options = {}
			options.custom = true 
			options.interval = 3600
			options.type = 'system'
			options.name = 'snowcoins-rates'
			options.doGrab = {
				modulePath: _this.get('moduleDir') + '/lib/snowcoins/coinrates.js',
				moduleFunction : 'updaterates',
				arguments: 'cryptocoincharts',
				callbackFunction: '',
			}
			tracker.create(options,function(err) { 
				if(err)console.log(err)
			})
		}
		if(typeof trackers.system !== 'object') {
			//console.log('no system tracker object')
			startRates()
		} else if(!trackers.system['snowcoins-rates']) {
			//console.log('no rate tracker')
			startRates()
		} else {
			//startRates()
			//console.log('readd rates')
		}
		_this.set('tracker',trackers);
		_this.emit('tracker',trackers);
		_this._complete('tracker')
	});
	
	return this;
}

/**
 * _sockets
 * 
 * attached to the server started event
 *
 * ####Example:
 *
 *     Snowcoins.on('server started',function(errors){}) // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._sockets = function(server) {
	/* start sockets
	 * if this is a custom app the server will be passed
	 * var server = {
	 * 	httpServer : app.listen(3000),
	 * 	httpsServer : false
	 * };
	 *  */
	
	var	app = keystone.app,
		_this = this,
		list = this.get('lists');
	
	
	//start up socket
	var startio = function (hserver) {
		
		/* add our socket object to keystone so we can access it everywhere
		* */	
		keystone.set('io', sock.listen(hserver))
				
		var boned3c = require('./snowcoins/bone/d3c.js');
		
		return _this._complete('server started');
	}
	if(_this.get('api socket')) {
		if(_.isObject(server)) {
			/* start socket with custome server */
			if(server.httpsServer) {
				var send =  server.httpsServer;
				var pro = 'SSL';
			} else {
				var send = server.httpServer;
				var pro = 'http';
			}
			startio(send);
			_this._messages.success.push(dashes,'socket.io started on ' + pro + ' instance.',dashes);
			
		} else if(keystone.httpsServer && _this.get('socket ssl')) {
				var hserver = keystone.httpsServer;
					   
				startio(hserver);
				
				_this._messages.success.push(dashes,'socket.io started on SSL instance ',dashes);
			
		} else if(keystone.httpServer) {
				var hserver =  keystone.httpServer;
					   
				startio(hserver);
				
				_this._messages.success.push(dashes,'socket.io started on http instance',dashes);
			
		} else {
			_this._messages.error.push(dashes,'Socket service requested but no server found to attach to',dashes);
			
			return _this._complete('server started');
		}
		
	} else {
		_this._messages.success.push(dashes,'socket.io skipped',dashes);
		return this;
	}
	
}

/**
 * _complete
 * 
 * attached to the complete event
 *
 * ####Example:
 *
 *     Snowcoins.on('complete',function(){}) // 
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype._complete = function(who) {
	
	/* * 
	 * each complete sends their event name on complete 
	 * we have 7 or 8 so just cheat and count them
	 * */
	var _this = this,
		useSockets = _this.get('api socket');
		
	if(!this._completed.obj[who]) {
		this._completed.arr.push(who);
		this._completed.obj[who] = true;
	}
	
	if(this._completed.obj.init && this._completed.obj.keystone && this._completed.obj.routes && this._completed.obj.models && !this._completed.obj.ready) {
		this.emit('ready');
	}
	//console.log(this._completed.obj);
	
	if(this._completed.arr.length === 8 || (!useSockets && this._completed.arr.length === 7)) {
		
		_.forEach(this._messages.error,function(message) {
			console.log(message);
		});
		
		_.forEach(this._messages.success,function(message) {
			console.log(message);
		});
		
		this._completed.arr.push('complete');
		this._completed.obj.complete = true;
		
		this.emit('complete');
		
	}	
	
}

/**
 * wrapHTMLError
 * 
 * error page html
 *
 * 
 */ 
Snowcoins.prototype.wrapHTMLError = function wrapHTMLError(title, err,custom) {
	if(custom) {
		return custom;
	} else { 
		return '<html><head><meta charset=\'utf-8\'><title>' + title + '</title>' +
		'<link rel=\'stylesheet\' href=\'/snowhub/styles/error.css\'>' +
		'</head><body><div class=\'error\'><h1 class=\'error-title\'>' + title + '</h1>' +
		'<div class="error-message">' + (err || '') + '</div></div></body></html>';
	}
}

/**
 * lessSetup
 * 
 * add our path to the less path
 *
 * @method get
 * @api public
 */ 
Snowcoins.prototype.lessSetup = function() {
	var dir = this.get('moduleDir');
	var config = {
		dest: path.join(dir, 'public'),
		preprocess: {
			path: function(pathname, req) {
				return pathname.replace(/\/snowhub\//, '/');
			},
			
		},
		storeCss: function(pathname, css, next) {
			var newpath = pathname.replace(/\/snowhub\//, '/');
			var mkdirSync = function () {
				try {
					fs.mkdirSync(path.dirname(newpath), 511);
					return writeFile();
				} catch(e) {
					if ( e.code !== 'EEXIST' ) return next();
					return writeFile();
				}
			}
			var writeFile = function(){
				//console.log('write css file')
				return fs.writeFile(newpath, css, 'utf8', next);
			};
			//save css
			return mkdirSync();
		}	
	}
	
	var lessPaths = keystone.get('less') || [];
	if (_.isString(lessPaths)) {
		lessPaths = [lessPaths];
	}
	
	lessPaths.push(path.join(dir, 'public'));
	
	keystone.set('less',lessPaths);
	keystone.set('less middleware options',config);
	
	this._options.lessconfiged = true;
		
	return;
	
}

/**
 * the .link server accepts requests for shortcuts
 * we keep an on/off(String) in settings
 * 
 * @param String on/off
 * @param Function callback
 * 
 * */

Snowcoins.prototype.linkServer = function(state,callback) {
	var _this = this,
		_return = this,
		settings = keystone.list(_this.get('model settings'));
		
	if(typeof state !== 'function' && typeof state !== 'object') {
		state = {state:state ? state : 'off'};
	} else if(typeof state === 'function') {
		callback = state;
		
		
	}
	var iscallback = typeof callback === 'function';
	/* turn off or on by request */
	settings.model.linkServer(state,function(err,val) {
		if(err) return iscallback ? callback('Could not update link server state.  No action was taken.') : false;
		if(!val) return iscallback ? callback('Could not update link server state. (no state)  No action was taken.') : false;
		if(typeof val !== 'object') {
			val.state = 'off';
			val.port = 12777;
		}
		if(!val.state)val.state = 'off';
		_this.set('api link port',val.port)
		_start(val)
	})
	var _start = function(setting) {
		
		//console.log(setting,_this.get('linkserver'),_this.get('api link port'));
		
		/*if running return */
		if(_this.get('linkserver') === 'on' && setting.state === 'on')return iscallback ? callback('Server is running.  Send off to stop.') : false;
		
		/* server is off already  */
		if(setting.state === 'off' && _this.get('linkserver') !== 'on') {
			
			console.log(dashes);
			console.log('.link server skipped.');
			console.log(dashes);
			_this.set('linkserver','off');
			
			return iscallback ? callback(null,{success:true,message:'.link server was not running.'}) : false;
		}
		
		linkserver = require('snowcoins-link-server').call(Snowcoins);
		_this.emit('link server',linkserver);
		/* stop the server  */
		if(setting.state  === 'off' && _this.get('linkserver') === 'on') {
			
			_this.link.Server.close(function () {
				console.log(dashes,'.link server stopped.',dashes);	
			});
			
			// Add this part to manually destroy all the connections.
			for (var socketId in _this.link.sockets) {
				//console.log('socket', socketId, 'destroyed');
				_this.link.sockets[socketId].destroy();
			}
			
			_this.set('linkserver','off');
			
			
			return iscallback ? callback(null,{success:true,message:'.link server stopped.  '}) : false;
			
		}
		
		/* start the server since we made it this far */
		linkserver.start(function(err,message) {
			
			if(err)return iscallback ? callback('Could not start .link server. ' + err) : false;
			_this.set('linkserver','on');
			
			
			return iscallback ? callback(null,{success:true,message:message}) : false;
			
		});	
	}
	
}


/**
 * statics
 * 
 * set any statics and include our default language
 * run from Snowcoins._routes
 *
 * @method get
 * @api public
 */
Snowcoins.prototype.statics = function() {
	
	//var keystone = this.get('keystone'),
	var	app = keystone.app,
		snowcoins = this,
		mylanguage = this.get('language');
	
	/* we use snowhub in the UI so we dont clash anywhere
	 * */
	app.use("/snowhub", express.static(this.get('moduleDir') + "/public"));
	
	/* Language File
	 * not really a static anymore
	 * but as good a place as any to build a static object
	 * */
	var fromPath=this.get('moduleDir') + '/lib/snowcoins/languages';
	var snowlanguages = {
		'en-us':  require(fromPath + "/en-us.js"),
		list: ['en-us']
	}
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
			var language = parts.pop()
			
			if (ext == 'js' && nn!='.' && language !== 'en-us') {
				var addl  = require(snowcoins.get('moduleDir') + "/lib/snowcoins/languages/"+language+'.js')
				snowlanguages[language] = _.cloneDeep(snowlanguages['en-us'])
				_.merge(snowlanguages[language],addl);
				snowlanguages.list.push(language);
			}
		}
	});
	snowlanguages.default=snowlanguages[mylanguage];
	snowlanguages.mylanguage = mylanguage
	
	this.set('languages',snowlanguages);
	this.set('mylanguage',snowlanguages[mylanguage]);
	this.set('default language',snowlanguages[mylanguage]);
	this.set('language list',snowlanguages.list);
	
	/* *
	 * 
	 * dcc still uses this for templates */
	app.use(require('../routes/views/static.js')());
	
	return this;
}

/** 
 * Ping the remote .link server to test the local connection
 * 
 * */
Snowcoins.prototype.phoneHome = function (user,cb) {
	
	var opts = {
		share: user.shareKey,
		secret: user.sendKey,
		action:'linkping',
		params:{ping:true,machine:user.ddnsHostname},
		debug:false
	}
	Link.sendRequest(opts,function(err,response) { 
		//console.log('ping .link server',opts,response);
		if(response) {
			if(response.linkping === false ) {
				return cb('Communication successful with error: '+ response.data.err);			
			}
			if(response.success === false || response.error) {
				if(response.data) {
					if(response.data.err) return cb(response.data.err);
				}
				return cb(response.error)
			}
			return cb(null,response.body)
		} else {
			return cb('Could Not Connect: '+ err)
		}
	});
		
}


/**
 * Filter out unwanted items from mongo returns
 * 
 * */
 
Snowcoins.prototype.filterDocs = function(docs,addfilter) {
	
	var filter = ['_id','__v','owner'];
	
	if(addfilter instanceof Array) {
		filter = _.uniq(filter.concat(addfilter))
		//console.log('merge filter',filter)
	}
		
	var filterme = function(docObject) {
		_.keys(docObject).forEach(function(param) {
			//console.log('filter',param,_.indexOf(filter,param));
			//if(docObject[param] instanceof Object)docObject[param] = filterme(docObject[param]);
			if(_.indexOf(filter,param)>=0)delete docObject[param];
		});
		return docObject;
	}
	//console.log('filter docs',docs.length)
	if(docs instanceof Array) {
		
		var newdocs = []
		var l = docs.length;
		
		for(i=0;i<l;i++) {
			newdocs[i] = filterme(docs[i])
						
		}
		
		return newdocs
		
	} else {
		return filterme(docs)
	}
	
	

	
}

Snowcoins.prototype.set = function(key,value) {
	
	
	if (arguments.length === 1) {
		return this._options[key];
	}
	switch(key) {
		case "use snowcoins user model":
			if(value) this._options['model user'] = this._options['snowcoins user model'];
			break;
		case ".link ip range":
			if(value.indexOf('/') === -1)value += '/32';
			break;
		default:
			
			break;
	}
	//push if _option[key] is an array else rewrite
	if(_.isArray(this._options[key])) {
		
		this._options[key].push(value);
		
		if(keystone) {
			var ar = keystone.get(key);
			if(!_.isArray(ar))ar = [];
			ar.push(value);
			keystone.set(key,ar);
		}
	} else {
		
		this._options[key] = value;
		
		if(keystone)keystone.set(key,value);
		
	}
	
	return this._options[key];
	
}

Snowcoins.prototype.get = Snowcoins.prototype.set;

/**
 * Sets multiple Snowcoins options.
 *
 * ####Example:
 *
 *     Snowcoins.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

Snowcoins.prototype.options = function(options) {
	if (!arguments.length)
		return this._options;
	if (typeof options === 'object') {
		var keys = Object.keys(options),
			i = keys.length,
			k;
		while (i--) {
			k = keys[i];
			this.set(k, options[k]);
		}
	}
	return this._options;
};

/**
 * Gets an expanded path option, expanded to include moduleRoot if it is relative
 *
 * ####Example:
 *
 *     snowcoins.getPath('pathOption', 'defaultValue')
 *
 * @param {String} key
 * @param {String} defaultValue
 * @api public
 */

Snowcoins.prototype.getPath = function(key, defaultValue) {
	return this.expandPath(this.get(key) || defaultValue);
};

/**
 * Expands a path to include moduleRoot if it is relative
 *
 * @param {String} pathValue
 * @api public
 */

Snowcoins.prototype.expandPath = function(pathValue) {
	pathValue = ('string' === typeof pathValue && pathValue.substr(0,1) !== path.sep && pathValue.substr(1,2) !== ':\\')
		? path.join(appRoot, pathValue)
		: pathValue;
	return pathValue;
};

/**
 * simple encrypt - creates iv from password - change to createCipheriv to add your own
 *
 * ####Example:
 *
 *     snowcoins.encrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */

Snowcoins.prototype.encrypt = function(text,password) {
	if(!text)return;
	if(!password || typeof password !== 'string')password = Snowcoins.get('hashme');
	try {
		var cipher = crypto.createCipher('aes-256-cbc',password)
		var crypted = cipher.update(text,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	} catch (e) {
		console.log('failed to encrypt',e,text,password);
		return;
	}
}

/**
 * simple decrypt -  - change to createDecipheriv if you changed encrypt
 *
 * ####Example:
 *
 *     snowcoins.decrypt(text,password) // 
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 
Snowcoins.prototype.decrypt = function(text,password) {
	if(!text)return;
	if(!password || typeof password !== 'string')password = Snowcoins.get('hashme');
	try {
		  var decipher = crypto.createDecipher('aes-256-cbc',password)
		  var dec = decipher.update(text,'hex','utf8')
		  dec += decipher.final('utf8');
		  return dec;
	} catch(e) {
		console.log('failed to decrypt',e,text);
		return;
	}
}

var Snowcoins = module.exports = exports = new Snowcoins();
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
