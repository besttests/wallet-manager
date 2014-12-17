var keystone = require('keystone'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Posts Model
 * ===========
 */

var TxItems = new keystone.List(snowcoins.get('model items'), {
	autokey: { path: 'key', from: 'id', unique: true },
	track: true
});

TxItems.add({
	owner: { type: Types.Relationship, ref:snowcoins.get('model user'), index: true, initial: true },
	transaction: { type: Types.Relationship, ref: snowcoins.get('model transactions'), index: true, initial: true},
	ledger: { type: Types.Relationship, ref: snowcoins.get('model ledger'), index: true, initial: true},
	name: { type: String, initial:true },
	amount: { type: Types.Number , initial:true},
	description: { type: String, initial:true },
	quantity: { type: Types.Number, initial:true },
});


TxItems.relationship({ ref: snowcoins.get('model ledger'), refPath: 'txitems', path: 'ledger' });
TxItems.relationship({ ref: snowcoins.get('model transactions'), refPath: 'txitems', path: 'transaction' });


/**
 *  Post
 * =====
 */
TxItems.schema.post('save', function(next) {
    var data = this
    var ret = next;
    //console.log('start pre save txlog');
	if(data.transaction) {
		keystone.list(snowcoins.get('model transactions')).model.findOne().where('key',data.transaction).exec(function(err,doc){
			doc.txitems=data.key;
			doc.save(function(err) {
				if(err)console.log(err);
				//console.log('end pre save txlog');
				//ret();
			});
		});
	}
	if(data.ledger) {
		keystone.list(snowcoins.get('model ledger')).model.findOne().where('key',data.ledger).exec(function(err,doc){
			doc.txitems=data.key;
			doc.save(function(err) {
				if(err)console.log(err);
				//console.log('end pre save txlog');
				//ret();
			});
				
		});
	}	
});
TxItems.schema.pre('remove', function(next) {
    var data = this
    var ret = next;
    //console.log('start pre save txlog');
	if(this.transaction) {
		console.warn('del tx txitem',this.transaction);
		keystone.list(snowcoins.get('model transactions')).model.findOne().where('_id',this.transaction).exec(function(err,doc){
			if(doc) {
					delete doc.txitems[this._id];
					doc.save(function(err) {
						if(err)console.log('error deleteins txitem key from ledger',err);
						//console.log('end pre save txlog');
						//ret();
					});
			}	
		});
	}
	if(this.ledger) {
		console.warn('del ledger txitem',this.ledger);
		keystone.list(snowcoins.get('model ledger')).model.findOne().where('_id',this.ledger).exec(function(err,doc){
			if(doc) {
					delete doc.txitems[this._id];
					doc.save(function(err) {
						if(err)console.log('error deleteins txitem key from ledger',err);
						//console.log('end pre save txlog');
						//ret();
					});
			}	
		});
	}
	next()	
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

//TxItems.addPattern('standard meta');
TxItems.defaultSort = '-createdOn';
TxItems.defaultColumns = 'name,key|250,amount,ledger,transaction,createdOn';
TxItems.register();
