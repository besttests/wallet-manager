var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Post Categories Model
 * =====================
 */

var WalletTx = new keystone.List(snowcoins.get('model wallet transactions'), {
	autokey: { from: '_id', path: 'key', unique: true },
	track: true
});

WalletTx.add({
	wallet: { type: Types.Relationship, ref: 'Wallets', index: true, initial:true },
	account: { type: String,  initial: true, },
	address:  { type: String, initial:true },
	category: { type: String, initial: true },
	amount: { type: String,  initial: true, },
	confirmations:  { type: Number, initial:true },
	blockhash: { type: String, initial: true },
	txid: { type: String, initial: true, index:true },
	time: { type: Date,  initial: true, },
	
});


/**
 * Relationships
 * =============
 */




/**
 * Registration
 * ============
 */
WalletTx.defaultColumns = ' wallet,category, account, address, date|20%, owner';
WalletTx.register();
