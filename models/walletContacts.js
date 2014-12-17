var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var WalletContacts = new keystone.List(snowcoins.get('model contacts'), {
	map: { name: 'name',address:'address' },
	autokey: { path: 'key', from: 'address', unique: true },
	track: true
});

WalletContacts.add({
	name: { type: String, required: true,index:true },
	//example: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	createdDate: { type: Types.Date, default: Date.now, index: true },
	address: { type: String, required: true, index:true ,initial: true },
	notes: { type: Types.Markdown , initial: true },
	wallet: { type: Types.Relationship, ref: snowcoins.get('model wallets'), index: true,initial:true,many: true  },
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
 * Registration
 * ============
 */

WalletContacts.defaultColumns = 'name, address,wallet,  owner, notes';
//WalletContacts.addPattern('standard meta');
WalletContacts.register();
