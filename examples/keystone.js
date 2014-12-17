// Load .env for development environments
require('dotenv')().load();

/**
 * Application Initialisation
 */

var keystone = require('keystone'),
	greeter = require('snowpi-greeter'),
	snowcoins = require('wallets');
	
dashes = '\n------------------------------------------------\n';

keystone.init({

	'name': 'wallet manager',
	'brand': 'inquisive',
	'back': '/',

	'favicon': 'public/favicon.ico',
	'less': false,
	'static': snowcoins.get('moduleDir') + "/public",

	'views': 'templates/views',
	'view engine': 'jade',
	
	'emails': 'templates/emails',
	'signin url':'/',
	'signin redirect':'/walletManager',
	'auto update': false,
	'mongo': process.env.MONGO_URI || 'mongodb://localhost/' + pkg.name,
	'port':3888,
	'ssl':true,
	'ssl port':8883,
	'ssl key': '/home/snow/projects/snowcoins/key.pem',
	'ssl cert':'/home/snow/projects/snowcoins/cert.pem',
	'session': true,
	'session store':'mongo',
	'session options': {
		key: 'walletmanager.sid',
	},
	'auth': true,
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET || 'uy97w3qqhTI9jYHT54Tgf3E3huuiINBGHhyui8hyYDTd(765ft976fov',
	'trust proxy':true,
	'allow register':false,
	
	'language':'en-us',
	'ledgerid prefix':'lid',
	
	'socket port' : 8883,
	'socket ssl' : true,
	
	// the default mandrill api key is a *test* key. it will 'work', but not send emails.
	'mandrill api key': process.env.MANDRILL_KEY || 'v17RkIoARDkqTqPSbvrmkw',

	
});

//require('./models');

//keystone.set('routes', require('./routes'));

keystone.set('locals', {
	
	env: keystone.get('env'),
	ssl: keystone.get('ssl'),
	sslport: keystone.get('ssl port'),
	sslhost: keystone.get('ssl host'),
	host: keystone.get('host'),
	utils: keystone.utils,
	plural: keystone.utils.plural,
	editable: keystone.content.editable,
	title: 'snowcoins',
	path:{client:'d2c',master:'d3c',wm:'snowcoins',offline:'share'},
	
});

snowcoins.init();

keystone.start({
	onStart: function() {
		snowcoins.set('socket ssl',true)
		snowcoins.start();
	},
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
		
		
		snowcoins.set('use snowcoins user model',true);
		snowcoins.set('model user','User');
		
		snowcoins.set('snowcoins user model','User');
		snowcoins.set('model settings','Settings');
		snowcoins.set('model wallets','Wallets');
		snowcoins.set('model coins','Coins');
		snowcoins.set('model contacts','WalletContacts');
		snowcoins.set('model attended','Attended');
		snowcoins.set('model unattended','UnAttended');
		snowcoins.set('model clients','ClientConnect');
		snowcoins.set('model rates','CurrencyRates');
		snowcoins.set('model ledger','Ledger');
		snowcoins.set('model snowmoney','Snowmoney');
		snowcoins.set('model trackers','Trackers');
		snowcoins.set('model transactions','Transactions');
		snowcoins.set('model items','TxItems');
		snowcoins.set('model log','TxLog');
		
		snowcoins.mount();
		
		keystone.set('nav', {
			'wallets': ['wallets', 'wallet-contacts', 'wallet-accounts'],	
			'DCC Setup':['client-connects','attendeds','un-attendeds','trackers','currency-rates','settings'],
			'DCC Command':['ledgers','transactions','tx-items','tx-logs'],
			'users':['users']
		});		
	}
});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
