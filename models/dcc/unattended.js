var keystone = require('keystone'),
	async = require('async'),
	hat = require('hat'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Posts Model
 * ===========
 */

var UnAttended = new keystone.List(snowcoins.get('model unattended'), {
	map: { name: 'apikey' },
	autokey: { path: 'key', from: 'id', unique: true },
	singular:'.link Shortcut',
	plural:'.link Shortcuts',
	label:'.link Shortcuts',
	track: true,
	
}); 

UnAttended.add({
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	createdDate: { type: Types.Datetime, default: Date.now, index: true },
	expires: { type: Types.Datetime,  index: true , initial:true},
	apikey: { type: Types.Key,  initial: true, require:true },
	apikeyused: { type: Types.Key },
	publicDisplay: { type: Types.Markdown, initial:true},
	coin: { type: String, initial:true},
	address: { type: String , initial:true},
	wallet: { type: Types.Relationship, ref: snowcoins.get('model wallets'), index: true, initial: true},
	account: {type: String, many:true},
	burner: {type: Types.Boolean , label: 'Use only one time', initial:true  },
	archivedOn: { type: Types.Datetime,  index: true },
	status: { type: Types.Select, options: 'valid, deleted, archived', default: 'valid' },
	type: { type: Types.Select, options: 'main, child, default', default: 'default', initial:true },
}, 'Sign Shortcut', {
	sign: { 
		pinop: {type:String,  label:'Pinop', initial: true,set: encrypt, get : decrypt},
		hash: {type:String,  label:'Pinop Hash'},
		keyphrase: {type:String, initial: true, label:'Show this phrase as part of verification'},
		lock: {type: Types.Boolean , label: 'Lock this shortcut',  initial:true },
		type: { type: Types.Select, options: [{value:1,label:'Share'}, {value:2,label:'Share and Payments'}, {value:3,label:'Payments'}], default: 1, initial:true }
	}
});
 
/*
function getPinop(v) {
	console.log('getpinop unattended',v)
	if(this.hash) {
		keystone.list(snowcoins.get('model settings')).model.userSettings(this.owner,function(err,val) {
			if(val.sendKey) {
				return  snowcoins.decrypt(this.hash,val.sendKey);
			} 
			return v;
		});
	} else {
		return v;
	}
	
}
*/

function encrypt(p) {
	if(p)return snowcoins.encrypt(p,snowcoins.get('hashme'));
	else return;
}
function decrypt(p) {
	//console.log('decrpt',p);
	if(p)return snowcoins.decrypt(p,snowcoins.get('hashme'));
	else return;
}
/**
 * 
 * Functions
 * 
 * 






/**
 *  Pre
 * =====
*/ 
UnAttended.schema.pre('save', function (next) {
	
	var doc = this
	if(doc.owner) {
		
		var Settings = keystone.list(snowcoins.get('model settings'));
		var test = function(cb) {
			Settings.model.userSettings(doc.owner,function(err,val) {
				if(val.sendKey) {
					cb(snowcoins.encrypt(doc.sign.pinop,val.sendKey));
				} else {
					cb()
				}
			});
		}
		test(function(newp){
			//console.log('encrypt',newp);
			doc.sign.hash = newp;
			next();
		});
	} else {
		next();
	}
	
		
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

//UnAttended.addPattern('standard meta');
UnAttended.defaultSort = '-createdDate';
UnAttended.defaultColumns = 'name,owner,status,expireson,burner,address,wallet';
UnAttended.register();
