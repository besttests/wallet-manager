var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var TXLog = new keystone.List(snowcoins.get('model log'), {
	autokey: { path: 'key', from: 'id', unique: true },
	track: true
});

TXLog.add({
	transaction: { type: Types.Relationship, ref: snowcoins.get('model transactions'), index: true, initial: true },
	ledger: { type: Types.Relationship, ref: snowcoins.get('model ledger'), index: true, initial: true },
	createdDate: { type: Types.Datetime, default: Date.now, index: true },
	type: { type: Types.Select, options: 'create, modify, delete ', default: 'modify' },
	action: { type: String, initial:true, index:true, default:'autolog' },
	object: { type: String },
});

/**
 * Virtuals
 * ========
 */




/**
 * Methods
 * =============
 */


/**
 * Notifications
 * =============
 */


/**
 * Registration
 * ============
 */

//TXLog.addPattern('standard meta');
TXLog.defaultSort = '-createdDate';
TXLog.defaultColumns = 'tx,type,createdDate';
TXLog.register();
