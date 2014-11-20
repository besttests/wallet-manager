var keystone = require('keystone'),
	snowcoins = require('snowcoins'),
	async = require('async'),
	snowcoin = require('snowcoins-api'),
	Types = keystone.Field.Types,
	mongoose = keystone.mongoose,
	utils = require('keystone-utils');



/**
 * Wallets Model
 * ===========
 */

var WalletAccounts = new mongoose.Schema({
	name: { type: String },
	addresses:  [mongoose.Schema.Types.ObjectId],
	password: { type: String },
	date: { type: Types.Date, default: Date.now },
	balance: { type: Number, index: true },
	comments: { type: String }
});

var AddressTransactions = new mongoose.Schema({
	category: { type: String, index:true },
	address: { type: String },
	account: { type: mongoose.Schema.Types.ObjectId },
	dateAdded: { type: Types.Date, default: Date.now },
	time: { type: Types.Date },
	txid: { type: String },
	confirmations: { type:Number, default:0 },
	blockhash: {type: String },
	blockindex: {type:Number, default:0 },
	blocktime: {type:Types.Date },
	amount: { type:String }
});

var WalletAddresses = new mongoose.Schema({
	name: { type: String},
	address: { type: String, index:true },
	account: { type: mongoose.Schema.Types.ObjectId },
	password: { type: String },
	date: { type: Types.Date, default: Date.now },
<<<<<<< HEAD
	owner: { type: mongoose.Schema.Types.ObjectId, index: true },
	comments: { type: String },
	transactions: [AddressTransactions]
=======
	balance: { type: Number, index: true },
	received: { type: Number, index: true },
	comments: { type: String }
>>>>>>> modulate
});



var Wallet = new keystone.List(snowcoins.get('model wallets'), {
	map: { name: 'name' },
	autokey: { path: 'key', from: 'name', unique: true },
	track: true
});

Wallet.add({
	name: { type: String, required: true,index:true },
	type: { type: Types.Select, options: 'main, gift', default: 'main', index: true },
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	createdDate: { type: Types.Date, default: Date.now, index: true },
	address: { type: String, required: true, initial: true },
	port: { type: Number, required: true, initial: true },
	apikey: { type: String,  initial: true, select : false },
	content: { type: String },
	coin: { type: String,  initial: true,required: true,default:'dogecoin' },
	coinstamp: { type: String,  initial: true ,default:'Ð'},
	cointicker: { type: String,  initial: true ,default:'doge'},
	coinapi: { type: String, default:'rpc',initial:true },
	currency: { type: String, default:'usd',initial:true },
	contacts: { type: Types.Relationship, ref: snowcoins.get('model contacts'), many: true },
	apipassword: { type: String, initial: true, set: encrypt, get : decrypt, select : false },
	apiuser: { type: String,  initial: true },
	ca: { type: String },
	unlocked:{type:Types.Date, index:true},
	isSSL: Boolean,
	permissions: {
		removeKey:{ type: String },
		removeRequestedOn: { type: Types.Date, default: Date.now }
	},
	interval: Number,
	watchpath: String,
	watchfile: String,
	watching: Number,
	accounting: { type: Types.Date, index: true },
	config: String

});

Wallet.schema.add({
	accounts : [WalletAccounts],
	addresses : [WalletAddresses],
	
});


/** 
	Getters/Setters
	===============
*/
function encrypt(p) {
	if(p)return snowcoin.encrypt(p,snowcoins.get('hashme'));
	else return;
}
function decrypt(p) {
	if(p)return snowcoin.decrypt(p,snowcoins.get('hashme'));
	else return;
}

/**
 * Virtuals
 * ========
 */

/**
 *  Static
 * =====
 */
Wallet.schema.statics.removeKey = function (key,cb) {
	var rand = utils.randomString([48,64])
	this.findOneAndUpdate({ "key" : key}, {permissions:{ removeKey : rand }},{}, function(err,doc){
                    if(err){
                        console.log(err,'remove key was not updated');
                       return cb(hat());
                    }
                    else{ 
			   // console.log(doc);
                       return cb(rand);
                    }
                });
}

Wallet.schema.statics.getID = function (key,cb) {
	this.where('key',key).exec(cb)
}
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

//Wallet.addPattern('standard meta');
Wallet.defaultSort = '-createdDate';
Wallet.defaultColumns = 'name, address';
Wallet.register();
