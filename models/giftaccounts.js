var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types;

/**
 * Posts Model
 * ===========
 */

var GA = new keystone.List('GiftAccounts', {
	map: { name: 'name' },
	autokey: { path: 'key', from: '_id', unique: true },
	track: true
});

GA.add({
	name: { type: String, required: true,index:true },
	owner: { type: Types.Relationship, ref: 'User', index: true, initial: true },
	wallet: { type: Types.Relationship, ref: 'Wallets', index: true, initial: true },
	created: { type: Types.Date, default: Date.now, index: true },
	valid_till: { type: Types.Date, index: true },
	address: { type: String, required: true, initial: true },
	private_key: { type: String, required: true, initial: true },
	amount: { type: String,  initial: true },
	account: { type: String },
	transaction: { type: String}
});

/**
 * Virtuals
 * ========
 */




/**
 * Relationships
 * =============
 */

//Post.relationship({ ref: 'PostComment', refPath: 'post', path: 'comments' });


/**
 * Notifications
 * =============
 */




/**
 * Registration
 * ============
 */

GA.defaultSort = '-created';
GA.defaultColumns = 'name, amount, wallet, valid_till';
GA.register();
