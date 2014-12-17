var keystone = require('keystone'),
	async = require('async'),
	hat = require('hat'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var ClientConnect = new keystone.List(snowcoins.get('model clients'), {
	map: { name: 'name' },
	autokey: { path: 'key', from: '_id', unique: true },
	singular:'D2C/D3C API Key',
	plural:'D2C/D3C API Keys',
	label:'D2C/D3C API Keys',
	defaultSort:'-status',
	nodelete:true,
	track: true
});

ClientConnect.add({
	name: { type: String, required: true,index:true, unique: true },
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	createdDate: { type: Types.Date, default: Date.now, index: true },
	apikey: { label:'API Key', type: Types.Key,  initial: true, unique: true },
	apikeyused: { type: Types.Key },
	type: { type: Types.Select, options: 'client, master', default: 'client', initial: true },
	status: { type: Types.Select, options: 'valid, deleted', default: 'valid' },
	clients: { type: Types.Relationship, ref: snowcoins.get('model clients'), many:true },
	authlevel: { type: Types.Number , default:10 },
	ip: { type: String }
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

//ClientConnect.addPattern('standard meta');
ClientConnect.defaultColumns = 'name,type,apikey,status,owner';
ClientConnect.register();
