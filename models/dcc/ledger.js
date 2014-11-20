var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Posts Model
 * ===========
 */

var Ledger = new keystone.List(snowcoins.get('model ledger'), {
	map: { name: 'ledgerID' },
	autokey: { path: 'key', from: '_id', unique: true },
	singular:'Ledger Entry',
	plural:'Ledger Entries',
	drilldown:'transaction txitems',
	label:'Ledger Entries',
	defaultSort:'-status',
	nodelete:false,
	track: true
});

Ledger.add({
	owner: { type: Types.Relationship, ref:snowcoins.get('model wallets'), index: true, initial: true },
	apikey: { type: Types.Relationship, ref: snowcoins.get('model clients'), index: true, initial: true },
	clients: { type: Types.Relationship, ref: snowcoins.get('model clients'), index: true, initial: true, many: true },
	transaction: { type: Types.Relationship, ref: snowcoins.get('model transactions'), index: true, many:true },
	wallets: { type: Types.Relationship, ref: snowcoins.get('model wallets'), index: true, many:true },
	createdDate: { type: Types.Datetime, default: Date.now, index: true },
	type: { type: Types.Select, options: 'original, revision ', default: 'original' },
	parentorder: { type: Types.Relationship, ref: snowcoins.get('model ledger') },
	ledgerID: { type: String, initial:true, index:true, unique:true },
	total: { type: Types.Number, initial:true, default: '0.00' },
	currency: { type:String, initial:true, default:'usd' },
	totaloffset: { type:Types.Number, initial:true, default:'0' },
	totalreceived: { type: Types.Number, initial:true, default: '0.00', label:'Received Total'  },
	txitems: { type: Types.Relationship, ref: snowcoins.get('model items'), many:true },
	status: { type: Types.Select, options: 'valid, complete, cancelled, deleted,archived', default: 'valid' },
	validTill: { type: Types.Datetime, default: getFutureDate , index: true },
	complete:{type: Boolean, watch:['total','totalreceived'], value:checkTotal }
});

Ledger.relationship({ ref: snowcoins.get('model items'), refPath: 'ledger', path: 'items' });
Ledger.relationship({ ref: snowcoins.get('model transactions'), refPath: 'ledger', path: 'transactions' });
Ledger.relationship({ ref: snowcoins.get('model log'), refPath: 'ledger', path: 'logs' });

function checkTotal() {
	return (this.total-this.totaloffset)<=this.totalreceived ? true:false;
}
function getFutureDate() {
	var dat = new Date();
	return dat.setDate(dat.getDate() + 1)
}
 
/**
 *  Pre
 * =====
*/
Ledger.schema.pre('save', function(next) {
    var doc = this
    var ret = next;
    
    
	if(doc.status === 'cancelled' || doc.status === 'deleted') {
		/** 
		 * do nothing right now
		 * */
		 ret();
	} else if( (doc.totalreceived + doc.totaloffset) >= doc.total ) {
	    
	    doc.status='complete';
	    ret();
	    
	} else {
	    
		if(!doc.validTill){
			var tmp = new Date(doc.createdOn);
			doc.validTill =  tmp.getTime() - 86400000;
		}
		
		var D = new Date(doc.validTill).getTime(),
			N = new Date().getTime();
	
		doc.status=(D > N) ? 'valid' : 'archived';
	    
		ret();
	
	} 

});

 
/**
 *  Post
 * =====
 */
Ledger.schema.post('save', function(next) {
    var doc = this
    var ret = next;
    
    //console.log('start pre save txlog');
    //add tx log
    var logmodel = keystone.list(snowcoins.get('model log'));
    var send = new logmodel.model({
		object:JSON.stringify(doc),
		action:doc.logaction,
		ledger:doc._id,
		type:doc.logtype
	});
	send.save(function(err) {
		if(err)console.log(err);
		//ret();
	});
	

});


/**
 *  Static
 * =====
 */
Ledger.schema.statics.getID = function (ledger,cb) {
	this.where('ledgerID',ledger).exec(cb);
}

Ledger.schema.statics.exists = function (ledger,cb) {
	this.find().where('ledgerID',ledger).exec(function(err,doc) {
		if(doc[0].ledgerID)
			return cb(true,doc[0]);
		else
			return cb(false);
	});
}
Ledger.schema.statics.setrelation = function (ledger,cb) {
	this.where('key',ledger).exec(cb);
}



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

//Ledger.addPattern('standard meta');
Ledger.defaultSort = '-createdDate';
Ledger.defaultColumns = 'name,status,type,total,totalreceived,apikey,createdDate';
Ledger.register();
