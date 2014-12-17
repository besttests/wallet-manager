var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var Trackers = new keystone.List(snowcoins.get('model trackers'), {
	autokey: { path: 'key', from: 'name', unique: true },
	singular:'Tracker',
	plural:'Trackers',
	label:'Trackers',
	track: true
});

Trackers.add({
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	name: {type:String, initial:true, unique: true, required:true},
	zone: {type:String, initial:true, default: 'default', required:true},
	coin: {type:String, initial:true},
	wallet: { type: Types.Relationship, ref: snowcoins.get('model wallets'), index: true, initial: true},
	watch : {
		watching: {type: Boolean, default:false, initial:true},
		root: { type: String,  initial: true },
		watched: { type: String, initial: true }
	},
	customApi : {
		use: {type: Boolean, default:false, initial:true},
		modulePath: { type: String,  initial: true },
		moduleFunction: { type: String, initial: true },
		arguments: { type: String,  initial: true, multiple:true },
		callbackFunction: { type: String, initial: true },
	},
	preGrab : {
		use: {type: Boolean, default:false, initial:true},
		modulePath: { type: String,  initial: true },
		moduleFunction: { type: String, initial: true },
		arguments: { type: String,  initial: true, multiple:true },
		callbackFunction: { type: String, initial: true },
	},
	doGrab : {
		use: {type: Boolean, default:false, initial:true},
		modulePath: { type: String,  initial: true },
		moduleFunction: { type: String, initial: true },
		arguments: { type: String,  initial: true, multiple:true },
		callbackFunction: { type: String, initial: true },
	},
	postGrab : {
		use: {type: Boolean, default:false, initial:true},
		modulePath: { type: String,  initial: true },
		moduleFunction: { type: String, initial: true },
		arguments: { type: String,  initial: true, multiple:true },
		callbackFunction: { type: String, initial: true },
	},
	account: {type: String, initial:true},
	address: {type: String, initial:true},
	interval: {type: Number, initial:true},
	auto: {type: Boolean, default:true, initial:true},
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	last: { type: Types.Date, default:Date.now, index: true },
	status: { type: Types.Select, options: 'valid,deleted,finished', default: 'valid' },
	type: { type: Types.Select, options: 'system,d3c,user,leech,custom,.link', default: 'user' },
	custom: { type: Boolean , default:false, initial:true},
	createdDate: { type: Types.Date, default: Date.now, index: true } 
});


/**
 *  Pre
 * =====
 */

Trackers.schema.pre('save', function(done) {
    var doc = this
    var ret = done;
    
			if(doc.address=='new') {
				keystone.list(snowcoins.get('model wallets')).model.findOne()				
					.where('_id', this.wallet)
					.select('+apikey +apipassword')
					.exec(function(err, data) {
						if(data)doc.set('coin',data.coin);
						/* generate a new address and use it every time */
						var snowcoin = require(snowcoins.get('moduleDir') + '/lib/snowcoins/api.js');
						snowcoin.init({
							api:data.coinapi,
							host:data.address,
							port:data.port,
							username:data.apiuser,
							password:data.apipassword,
							isSSL:data.isSSL,
							apipin:data.apipassword,
							apikey:data.apikey,
							ca:data.ca
						}).auth();
						snowcoin.newaddress(doc.account,function(result) {
							if (result.success==false) {
								if(result.err) console.log('error getting new address for attended receiver',err);
								ret();
							} else {
								doc.set('address',result.address);
								ret();								
							}
						});	
					});
			} else {
				ret();
			}
	
});



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

Trackers.defaultColumns = 'status,type,address,account,coin,wallet, owner';
Trackers.register();
