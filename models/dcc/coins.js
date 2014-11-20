var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Posts Model
 * ===========
 */

var Coins = new keystone.List(snowcoins.get('model coins'), {
	singular:'Coin',
	plural:'Coins',
	label:'Coins',
	track: true
});

Coins.add({
	name: { type: String,  initial: true},
	ticker: { type: String,  initial: true},
	price: { type: String,  initial: true},
	volume: { type: String},
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

Coins.defaultColumns = 'name, ticker, price , volume';
Coins.register();
