var	greeter = require('snowpi-greeter'),
	hat = require('hat'),
	dashes = '\n------------------------------------------------\n',
	keystone = require('keystone');

module.exports = function(app,mongoose,callback) {
	
	var snowcoins = this;
	
	if(typeof config !== 'object')config = {};
	
	keystone.connect(mongoose,app);
	
	keystone.init({

		'name': config.name || snowcoins.get('name') || 'snowcoins',
		'brand': config.brand || snowcoins.get('name') || 'inquisive',

		'favicon': config.favicon || snowcoins.get('favicon') || '/snowhub/favicon.ico',
		'less': config.less || snowcoins.get('less') || false,
		'static': config.static || snowcoins.get('static') || this.get('moduleDir') + "/public",

		'views': config.views ||  snowcoins.get('views') || snowcoins.get('moduleDir') + '/templates/views',
		'view engine': config.viewengine || snowcoins.get('view engine') || 'jade',
		
		'emails': config.emails ||  snowcoins.get('emails') || snowcoins.get('moduleDir') + '/templates/emails',
		'signin url': config.signin ||  snowcoins.get('signin url') || '/',
		'signin redirect': config.redirect || snowcoins.get('signin redirect') ||  '/' + snowcoins.get('snowcoins path'),
		'auto update': config.autoupdate || snowcoins.get('auto update') ||  false,
		'mongo': config.mongo ||  process.env.MONGO_URI || snowcoins.get('mongo') || 'mongodb://localhost/snowcoins',
		'port': config.port || snowcoins.get('port') || 3888,
		'ssl': config.ssl || snowcoins.get('ssl') || false,
		'ssl port': config.sslport || snowcoins.get('ssl port') || 8883,
		'ssl key': config.sslkey || snowcoins.get('ssl key') || false,
		'ssl cert': config.sslcert || snowcoins.get('ssl cert') || false,
		'session': config.session || snowcoins.get('session') || true,
		'session store': config.sessionstore || snowcoins.get('session store') || 'mongo',
		'session options': {
			key: config.sessionkey || snowcoins.get('session key') || 'snowcoins.sid',
		},
		'auth': config.auth || snowcoins.get('auth') || true,
		'user model': snowcoins.get('model user')  || 'User',
		'cookie secret': config.cookiesecret ||  process.env.COOKIE_SECRET || snowcoins.get('cookie secret') || 'oi87BTI6R(^*%$89r9C55ER8658E6w5754wsv754csw75',
		'trust proxy': config.trustproxy || snowcoins.get('trust proxy') || true,
		'allow register': config.register || snowcoins.get('allow register') || false,
		
		'language': config.language || snowcoins.get('language') || 'en-us',
		'ledgerid prefix': config.ledgerprefix || snowcoins.get('ledgerid prefix') || 'lid',
		
		'socket port' : config.socketport || snowcoins.get('socket port') || false,
		'socket ssl' : config.socketssl || snowcoins.get('socket ssl') || false,
		
		// the default mandrill api key is a *test* key. it will 'work', but not send emails.
		'mandrill api key': config.mandrill || process.env.MANDRILL_KEY || snowcoins.get('mandrill api key') || 'v17RkIoARDkqTqPSbvrmkw',

		
	});

	keystone.set('locals', {
		
		env: snowcoins.get('env'),
		ssl: snowcoins.get('ssl'),
		sslport: snowcoins.get('ssl port'),
		sslhost: snowcoins.get('ssl host'),
		host: snowcoins.get('host'),
		title: config.title || snowcoins.get('name') || 'snowcoins',
		path:{client:config.d2c || snowcoins.get('path d2c'),master:config.d3c || snowcoins.get('path d3c'),wm: config.wm || snowcoins.get('path snowcoins'),offline: config.share || snowcoins.get('path share')},
	
	});
	
	snowcoins.emit('keystone',keystone)
	
	keystone.mount({
		onMount: function() {
			greeter.set('username text','Username');
			greeter.set('email text','Email');
			greeter.set('password text','Password');
			greeter.set('confirm text','Confirm');
			greeter.set('name text','Full Name');
			greeter.set('allow register', true);
			greeter.set('new user can admin', true);
			greeter.set('form username', 'email');
			greeter.set('form password', 'password');
			greeter.set('form name', ['name','first','last']);
			greeter.set('form email', 'realEmail');
			greeter.set('greeter','/')
			//add routes
			greeter.add();
			
			
			if(typeof callback === 'function') {
				return callback();
			} else {
				return
			}
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
