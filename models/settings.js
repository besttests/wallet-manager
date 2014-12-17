var keystone = require('keystone'),
	hat = require('hat'),
	_ = require('lodash'),
	Types = keystone.Field.Types,
	snowcoins = require('snowcoins'),
	snowapi = require('snowcoins-api');

/**
 * Posts Model
 * ===========
 */

var Settings = new keystone.List(snowcoins.get('model settings'), {
	track: true
});

Settings.add({
	setting: {type:String, index:true, initial:true },
	value: { type: String,  label:'value', initial:true},
	owner: { type: Types.Relationship, ref: 'User', index: true },
});


/**
 *  Static
 * =====
 */
Settings.schema.statics.getnext = function getnext (cb) {
	this.findOneAndUpdate({ "setting" : 'nextledgerid'}, { $inc: { value : 1 }},{upsert:true,new:true}, function(err,doc){
                    if(err){
                        console.log(err,'increment ledgerid failed');
                       return cb(hat());
                    }
                    else{ 
			   // console.log(doc);
                       return cb(doc.value);
                    }
                });
}

Settings.schema.statics.linkServer = function linkServer(state,cb) {
	
	var _this = this
	
	//grab the settings
	_this.findOne({'setting':'snowcoins-linkserver'}).select('-_id -__v').lean().exec(function(err,doc){
		if(err) return cb(err)
		if(!doc)state = {state:'off'};	
		if(typeof state !== 'object') {
			if(typeof cb === 'function')
				return cb(null,doc.value)
			else
				return doc.value
		} else {
			
			if(doc) {
				//we have current settings so update
				var extend = (typeof doc.value === 'object') ? doc.value : {}
				
				_.merge(extend,state) 
				
				doc.value = extend;
			} else {
				//no current value so create the doc
				var doc = {}
				doc.setting =  'snowcoins-linkserver';
				doc.value =  state;				
			}
			_this.findOneAndUpdate({ "setting" : 'snowcoins-linkserver'},doc,{upsert:true,new:true}, function(err,doc){
				if(err){
					console.log(err,'failed upserting linkserver state');
					return cb('failed upserting .link server state');

				} else { 
					//console.log(doc);
					_this.findOne({'setting':'snowcoins-linkserver'}).select('-_id -__v').lean().exec(function(err,doc){
						return cb(null,doc.value);
					});
					
				}
			});
					
		}
	}); 
}/*endlinkserver*/

Settings.schema.statics.userSettings = function userSettings(who,settings,cb) {
	
	var _this = this
	
	//grab the settings
	_this.findOne({'setting':'snowcoins-user-'+who}).select('-_id -__v').lean().exec(function(err,doc){
		if(err) return cb(err)
		if(doc === null && typeof settings !== 'object') {
			//should be a new user so create the setting
			cb = settings;
			settings = {};
		}
		if(typeof settings !== 'object') {
			if(doc) {
				if(doc.value.sendKey)doc.value.sendKey = snowapi.decrypt(doc.value.sendKey,snowcoins.get('hashme'));
			}
			
			if(typeof settings === 'function')
				return settings(null,doc.value)
			else
				return doc.value
		} else {
			
			if(doc) {
				//we have current settings so update
				var extend = (typeof doc.value === 'object') ? doc.value : {}
				
				if(settings.sendKey) {
					settings.sendKey = snowapi.encrypt(settings.sendKey,snowcoins.get('hashme'));
				}
				
				_.merge(extend,settings) 
				
				doc.value = extend
				//console.log('update',doc);
				

			} else {
				//no current value so create the doc
				var doc = {}
				doc.setting =  'snowcoins-user-'+who
				doc.value =  settings
									
				//console.log('new',doc);
				
			}
			_this.findOneAndUpdate({ "setting" : 'snowcoins-user-'+who},doc,{upsert:true,new:true}, function(err,doc){
				if(err){
					console.log(err,'failed upserting theme for user');
					return cb('failed upserting theme for user');

				} else { 

					//console.log(doc);
					_this.findOne({ "setting" : 'snowcoins-user-'+who}).select('-_id -__v').lean().exec(function(err,doc){
						return cb(null,doc.value);
					});
				}
			});
					
		}
	}); 
		
		
	
}
//user settings

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

Settings.defaultColumns = 'setting,value, owner';
Settings.register();
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
