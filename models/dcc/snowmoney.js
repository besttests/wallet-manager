var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var Snowmoney = new keystone.List(snowcoins.get('model snowmoney'), {
	singular:'Accepted Rate',
	plural:'Accepted Rates',
	label:'Accepted Rates',
	track: true
});

Snowmoney.add({
	from: { type: String,  initial: true},
	to: { type: String,  initial: true},
	rate: { type: String,  initial: true},
	apiUsed: { type: String},
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'),  initial: true },
	published : Date,
	createdDate: { type: Types.Date, default: Date.now, index: true }
});




/**
 * Virtuals
 * ========
 */




/**
 * Relationships
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

Snowmoney.defaultColumns = 'from, to, rate, published, api';
Snowmoney.register();
