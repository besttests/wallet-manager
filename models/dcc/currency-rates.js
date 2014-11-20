var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Posts Model
 * ===========
 */

var CR = new keystone.List(snowcoins.get('model rates'), {
	autokey: { path: 'key', from: '_id', unique: true },
	singular:'Exchange Rates',
	plural:'Exchange Rates',
	label:'Exchange Rates',
	track: true
});

CR.add({
	coin: { type: String, index: true, initial: true},
	currency: { type: String, index: true, initial: true},
	rate: { type: String, index: true, initial: true},
	apiUsed: { type: String},
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
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

CR.defaultColumns = 'coin, currency, rate';
CR.register();
