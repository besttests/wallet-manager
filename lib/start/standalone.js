var	greeter = require('snowpi-greeter'),
	dashes = '\n------------------------------------------------\n';

module.exports = function(keystone,callback) {
	var snowcoins = this;
	if(typeof callback !== 'function')callback = function(){};
	
	snowcoins.set('use snowcoins user model',true);
	
	var config = {}; 
	
	keystone.init({
	
		'name': config.name || this.get('name') || 'snowcoins',
		'brand': config.brand || this.get('brand') || 'inquisive',

		'favicon': config.favicon || this.get('favicon') || '/snowhub/favicon.ico',
		'less': config.less || this.get('less') || false,
		'static': config.static || this.get('static') || this.get('moduleDir') + "/public",

		'views': config.views ||  this.get('views') || this.get('moduleDir') + '/templates/views',
		'view engine': config.viewengine || this.get('view engine') || 'jade',
		
		'emails': config.emails ||  this.get('emails') || this.get('moduleDir') + '/templates/emails',
		
		'signin url': config.signin ||  this.get('signin url') || '/',
		'signin redirect': config.redirect || this.get('signin redirect') ||  '/' + this.get('path snowcoins'),
		
		'auto update': config.autoupdate || this.get('auto update') ||  false,
		
		'mongo': config.mongo ||  process.env.MONGO_URI || this.get('mongo') || 'mongodb://localhost/snowcoins',
		
		'port': config.port || this.get('port') || 3888,
		
		'ssl': config.ssl || this.get('ssl') || false,
		'ssl port': config.sslport || this.get('ssl port') || 8883,
		'ssl key': config.sslkey || this.get('ssl key') || false,
		'ssl cert': config.sslcert || this.get('ssl cert') || false,
		
		'session': config.session || this.get('session') || true,
		'session store': config.sessionstore || this.get('session store') || 'mongo',
		'session options': {
			key: config.sessionkey || this.get('session key') || 'snowcoins.sid',
		},
		'auth': config.auth || this.get('auth') || true,
		'user model': snowcoins.get('model user')  || 'User',
		'cookie secret': config.cookiesecret ||  process.env.COOKIE_SECRET || this.get('cookie secret') || 'oi87BTI6R(^*%$89r9C55ER8658E6w5754wsv754csw75',
		'trust proxy': config.trustproxy || this.get('trust proxy') || true,
		'allow register': config.register || this.get('allow register') || false,
		
		'language': config.language || this.get('language') || 'en-us',
		'ledgerid prefix': config.ledgerprefix || this.get('ledgerid prefix') || 'lid',
		
		'socket port' : config.socketport || this.get('socket port') || false,
		'socket ssl' : config.socketssl || this.get('socket ssl') || false,
		
		// the default mandrill api key is a *test* key. it will 'work', but not send emails.
		'mandrill api key': config.mandrill || process.env.MANDRILL_KEY || this.get('mandrill api key') || 'v17RkIoARDkqTqPSbvrmkw',

		
	});

	

	keystone.set('locals', {
		
		env: this.get('env'),
		ssl: this.get('ssl'),
		sslport: this.get('ssl port'),
		sslhost: this.get('ssl host'),
		host: this.get('host'),
		title: config.title || this.get('name') || 'snowcoins',
		path:{client:config.d2c || this.get('path d2c'),master:config.d3c || this.get('path d3c'),wm: config.wm || this.get('path snowcoins'),offline: config.share || this.get('path share')},
		
	});
	
	
	
	keystone.start({
		onMount: function() {
			greeter.set('user model', snowcoins.get('model user'));
			greeter.set('username text','Username');
			greeter.set('email text','Email');
			greeter.set('password text','Password');
			greeter.set('confirm text','Confirm');
			greeter.set('name text','Full Name');
			greeter.set('allow register', snowcoins.get('allow register'));
			greeter.set('new user can admin', snowcoins.get('new user can admin'));
			greeter.set('field username', 'email');
			greeter.set('field password', 'password');
			greeter.set('field name', ['name','first','last']);
			greeter.set('field email', 'realEmail');
			greeter.set('greeter','/');
			greeter.set('debug',true);
			greeter.set('redirect timer',0);
			//add routes
			greeter.add();
			
			snowcoins.set('socket ssl',true)
			
			snowcoins.emit('keystone',keystone);
			
			callback();
			
		},
		onStart: function() {
			snowcoins.emit('server started');
		}
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
