var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Post Categories Model
 * =====================
 */

var WalletAccounts = new keystone.List('WalletAccounts', {
	autokey: { from: '_id', path: 'key', unique: true },
	track: true
});

WalletAccounts.add({
	wallet: { type: Types.Relationship, ref: 'Wallets', index: true,initial:true },
	name: { type: String, required: true, initial: true, index:true, unique: true },
	addresses:  { type: Types.Relationship, ref: 'WalletAddresses', many: true },
	password: { type: Types.Password, initial: true },
	date: { type: Types.Date, default: Date.now, index: true },
	owner: { type: Types.Relationship, ref: 'User', index: true, initial: true },
	comments: { type: Types.Markdown, initial: true }
});


/**
 * Relationships
 * =============
 */

WalletAccounts.relationship({ ref: 'WalletAddresses', refPath: 'account', path: 'addresses' });


/**
 * Registration
 * ============
 */
WalletAccounts.defaultColumns = 'name, wallet, addresses, date|20%, owner';
//WalletAccounts.addPattern('standard meta');
WalletAccounts.register();
