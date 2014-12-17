var keystone = require('keystone'),
	snowcoins = require('snowcoins');

//console.log('models',keystone.list('User'));
var list = keystone.get('model user');
if(!list) list = keystone.set('model user',snowcoins.get('snowcoins user model')).get('model user');

if(typeof  keystone.lists[list] !== 'object')require('./users');

require('./dcc/coins.js');
require('./settings.js');
require('./dcc/trackers.js');
require('./wallets');
require('./walletAccounts');
require('./walletContacts');
require('./giftaccounts');
require('./dcc/attended.js');
require('./dcc/clientconnect.js');
require('./dcc/unattended.js');
require('./dcc/currency-rates.js');
require('./dcc/snowmoney.js');
require('./dcc/transactions.js');
require('./dcc/txitems.js');
require('./dcc/txlog.js');
require('./dcc/ledger.js');


