var keystone = require('keystone'),
	async = require('async'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins');

/**
 * Posts Model
 * ===========
 */

var Current = new keystone.List(snowcoins.get('model attended'), {
	map: { wallet: 'wallet' },
	autokey: { path: 'key', from: '_id', unique: true },
	singular:'Attended Receiver',
	plural:'Attended Receivers',
	label:'Attended Receivers',
	track: true
});

Current.add({
	name: {type:String, initial:true},
	coin: {type:String, initial:true},
	wallet: { type: Types.Relationship, ref: snowcoins.get('model wallets'), index: true, initial: true},
	account: {type: String},
	format: { type: Types.Select, initial: true, options: [
		{label:'New Account & Address per transaction', value:1},
		{label:'One Account / New Address per transaction', value:2},
		{label:'One Address for all transactions', value:3} 
		]
	},
	address: {type: String},
	owner: { type: Types.Relationship, ref: snowcoins.get('model user'), index: true, initial: true },
	createdDate: { type: Types.Date, default: Date.now, index: true },
	status: { type: Types.Select, options: 'valid, deleted', default: 'valid' },
	totaloffset: { type:Types.Number, default:'0', label:'Order complete if within' },
	confirmations: {type:Types.Number, default:12, label:'Confirmations needed to complete'}
});




/**
 *  Pre
 * =====
 */


Current.schema.pre('save', function(done) {
    var doc = this
    var ret = done;
   
    if(doc.wallet && doc.wallet!==undefined) {
				//console.log('get wallet')
				keystone.list(snowcoins.get('model wallets')).model.findOne()				
					.where('_id', this.wallet)
					.exec(function(err, data) {
						if(data) {
							doc.coin=data.coin;
							doc.wallet=data._id
							
							console.log('get wallet',doc)
						}
						wally = data;
						if(doc.format=='3') {
							/* generate a new address and use it every time */
							var snowcoin = require(snowcoins.get('moduleDir') + '/lib/snowcoins/snowcoins.js');
							snowcoin.init(
								{
									api:wally.coinapi,
									host:wally.address,
									port:wally.port,
									username:wally.apiuser,
									password:wally.apipassword,
									isSSL:wally.isSSL,
									apipin:wally.apipassword,
									apikey:wally.apikey,
									ca:wally.ca
								}
							).auth();
							snowcoin.newaddress(doc.account,function(result) {
								if (result.success==false) {
									if(result.err) console.log('error getting new address for attended receiver',err);
									ret();
								} else {
									doc.address=result.address;
									ret();								
								}
							});
						} else {
							ret();
						}	
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

Current.defaultColumns = 'wallet, owner';
Current.register();
