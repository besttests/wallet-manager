// Load .env for development environments
require('dotenv')().load();

/**
 * Application Initialisation
 */

var snowcoins = require('wallets');
	
	//add my local ip(s) CIDR range to the .link ip range
	snowcoins._options['.link ip range'] = ['166.173.250.171/32',"192.168.1.1/24"];
	
	snowcoins.set('path snowcoins','walletManager');
	snowcoins.set('path share','give');
	snowcoins.set('path d3c','abby');
	snowcoins.set('path d2c','d2c');
	snowcoins.set('path logout', 'keystone/signout');
	
	//routes/apis/sockets are all true by default
	snowcoins.set('route share',true);
	snowcoins.set('api link',true);
	snowcoins.set('route testbed',true);
	snowcoins.set('route d3c',true);
	snowcoins.set('route d2c',true);
	snowcoins.set('route snowcoins',true);
	snowcoins.set('api socket',true);
	
	
	snowcoins.set('ssl',true);
	snowcoins.set('socket ssl',true);
	snowcoins.set('socket port',8883);
	snowcoins.set('ssl key', '/home/snow/projects/snowcoins/key.pem');
	snowcoins.set('ssl cert','/home/snow/projects/snowcoins/cert.pem');
	
	snowcoins.set('name','Wallet Manager');
	snowcoins.set('brand','inquisive');
	snowcoins.set('session key','inquisive-man.sid');
	/* set up the model names. The defualts are what you see here but with Snowcoins prepended
	 * */
	//set the name of the user model.  Must be set even if using a custom user setup
	snowcoins.set('model user','User');
	
	//use the built-in user model.  If we find a keystone model that matches the name above we load it instead
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
	
	
	
	snowcoins.on('init',function(config) {
		/* we get the config object we pass to start */
			console.log('init event');
		})
		.on('keystone',function(keystone) {
			/* add your own keystone options before mount 
			 * this event is not fired if you are mounting inside a current Keystone app
			 * */
			console.log('keystone event');
		})
		.on('models',function() {
			/* add your own models and register them with keystone */
			console.log('models event');
		})
		.on('routes',function() {
			/* add your own routes */
			console.log('routes event');
		})
		.on('ready',function() {
			/* app is configured */
			console.log('ready event');
			
		})
		.on('tracker',function() {
			/* app is configured */
			console.log('tracker event');
			
		})
		.on('link server',function() {
			/* app is configured */
			console.log('link server event');
			
		})
		.on('server started',function() {
			/* app is configured */
			console.log('server started event');
			
		})
		.on('complete',function() {
			/* app is configured */
			console.log('complete event');
			
		});
		
		snowcoins.start({standalone:true});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
