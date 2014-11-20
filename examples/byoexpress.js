// Load .env for development environments
require('dotenv')().load();

var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    snowcoins = require('snowcoins');
 
// Mongoose connection to MongoDB 
mongoose.connect('mongodb://localhost/snowcoins', function (error) {
    if (error) {
        console.log(error);
    }
});

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

//uri paths 
	snowcoins.set('path snowcoins','ralph');
	snowcoins.set('path share','give');
	snowcoins.set('path d3c','abby');
	snowcoins.set('path d2c','d2c');
	snowcoins.set('path logout', '/keystone/signout');

	snowcoins.set('custom',{
		
		/* optional - can also be set with snowcoins.set */
		port:3000,
		socketssl: false,
		ssl: false,
		name:'ralph',
		brand: 'abby'
	});

	snowcoins.init({mongoose:mongoose,app:app}).start(function(returnapp) {
			/*start app  and send the started server object back to snowcoins to start sockets if requested*/
			var servers = {
				httpServer : app.listen(3000),
				httpsServer : false
			};
			returnapp(servers)
	});
 

 


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
