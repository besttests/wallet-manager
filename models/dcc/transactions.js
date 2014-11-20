var keystone = require('keystone'),
	Types = keystone.Field.Types,
	async = require('async'),
	snowcoins = require('snowcoins'),
	Transactions = require(snowcoins.get('moduleDir') + '/lib/snowcoins/d3c/tx.js');

/**
 * Posts Model
 * ===========
 */

var TX = new keystone.List(snowcoins.get('model transactions'), {
	autokey: { path: 'key', from: '_id', unique: true },
	map: { name: 'txid' },
	track: true
});

TX.add({
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	txid: { type: Types.Number,  index:true },
	ledger: { type: Types.Relationship, ref: snowcoins.get('model ledger'), index: true, initial: true, required:true },
	amount: { type: Types.Number },
	client: { type: Types.Relationship, ref: snowcoins.get('model clients'), index: true, initial: true },
	attended: { type: Types.Relationship, ref: snowcoins.get('model attended'), initial: true },
	unattended: { type: Types.Relationship, ref: snowcoins.get('model unattended'), initial: true },
	createdDate: { type: Types.Date, default: Date.now, index: true },
	receiveDate: { type: Types.Datetime },
	confirmedDate: { type: Types.Datetime },
	completedDate: { type: Types.Datetime },
	type: { type: Types.Select, options: 'receive, send', default: 'receive', initial: true },
	txitems: { type: Types.Relationship, ref: snowcoins.get('model items'), many:true },
	ip: { type: String },
	status: { type: Types.Select, options: 'created, sent, confirming, complete, failure', default: 'created' },
	tracking: { type: Types.Select, options: 'yes,no', default: 'no' },
	inqueue: {type:String}
}, 
'Confirmations', {
	confirmations: {
		need: {type:Number, initial: true},
		have: {type:Number},
		lastChecked: { type: Types.Datetime }	
	}
},
'Exchange Rate', {
	exchange: {
		coin: {type:String, initial: true},
		provider: {type:String},
		createdDate: { type: Types.Datetime },
		rate: {type:Number},
		coinamount: {type:Number},
		currency: {type:String},
		amount: {type:Number}		
	}
},
'Their Address', {
	theiraddress: {
		coin: {type:String},
		address: {type:String},
		createdDate: { type: Types.Date },
		total: {type:String},
		inq: {type:String}		
	}
},
'Our Address', {
	ouraddress: {
		coin: {type:String},
		account: { type: String },
		address: { type: String },
		wallet: { type: Types.Relationship, ref: snowcoins.get('model wallets') },
		createdDate: { type: Types.Date },
		total: {type:String},
		inq: {type:String}		
	}
});


/**
 *  Post
 * =====
 */
TX.schema.post('save', function(done) {
    var doc = this
    var ret = done;
    var logmodel = keystone.list(snowcoins.get('model log'));
    var send = new logmodel.model({
		object:JSON.stringify(doc),
		action:doc.logaction,
		transaction:doc._id,
		type:doc.logtype
	});
	send.save(function(err) {
		if(err)console.log(err);
		//return ret;
	});
	if(doc.ledger) {
		keystone.list(snowcoins.get('model ledger')).model.findOne().where('key',doc.ledger).exec(function(err,data){
			if(data.transaction.indexOf(doc.key) === -1)data.transaction.push(doc.key);
			data.save(function(err) {
				if(err)console.log(err);
				//console.log('end pre save txlog');
				//ret();
			});
		});
	}
});

/**
 *  Pre
 * =====
 */
TX.schema.pre('save', function(done) {
    var doc = this
    var ret = done;
    var tx = keystone.list(snowcoins.get('model transactions'));
    /** 
     * we need to check and perform a few functions 
     * 
     * */
	async.series([
		function(next) {
			Transactions.presave(doc,function(err,data) {
				doc = data;
				next();
			});
			
		},
		function(next) {
			tx.model.find().where('ledger',doc.ledger).sort({'txid':-1})
			.exec(function(err,data){
				if(data[0] && data[0].txid)
					doc.txid = data[0].txid+1;
				else
					doc.txid = 1;
				next();	
			})
		},
	], function(err) {
		ret();
	});
});

TX.relationship({ ref: snowcoins.get('model items'), refPath: 'transaction', path: 'items' });
TX.relationship({ ref: snowcoins.get('model log'), refPath: 'transaction', path: 'logs' });

/**
 * Virtuals
 * ========
 */

/**
 *  Static
 * =====
 */
TX.schema.statics.fromKey = function fromKey (key,cb) {
	this.where('key',key).exec(cb);
}

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

//TX.addPattern('standard meta');
TX.defaultSort = '-createdDate';
TX.defaultColumns = 'ledger,name,type,ledger,amount,status,createdOn';
TX.register();
