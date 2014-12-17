var keystone = require('keystone'),
	snowcoin = require('../lib/snowcoins/api.js'),
	Types = keystone.Field.Types,
	snowcoins = require('wallets');

/**
 * Users Model
 * ===========
 */

var User = new keystone.List(snowcoins.get('snowcoins user model'), {
	autokey: { path: 'key', from: 'name', unique: true },
	track: true
});

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: String, initial: true, index: true,unique: true ,required: true, label:'Username'},
	password: { type: Types.Password, initial: true },
	resetPasswordKey: { type: String, hidden: true }
}, 'Profile', {
	isPublic: Boolean,
	theme: { type: Types.Select, options: 'snowcoins light,snowcoins dark', default: 'snowcoins light' },	
	realEmail: { type: String, unique: true,initial: true}
}, 'Notifications', {
	notifications: {
		posts: Boolean
	}
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can Admin snowpi', initial:true },
	onlyD3C: { type: Boolean, label: 'Only access D3C', initial:true },
	canApi: { type: Boolean, label: 'Can access API with key' },
	apikey: { type: String,width:'medium', set: encrypt, get : decrypt}
});


/** 
	Getters/Setters
	===============
*/
function encrypt(p) {
	if(p)return snowcoin.encrypt(p,process.env.SECRET_KEY);
	else return;
}
function decrypt(p) {
	if(p)return snowcoin.decrypt(p,process.env.SECRET_KEY);
	else return;
}


/** 
	Relationships
	=============
*/

//User.relationship({ ref: 'Post', refPath: 'author', path: 'posts' });



/**
 * Virtuals
 * ========
 */

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

User.schema.virtual('D3Cdummy').get(function() {
	return this.onlyD3C;
});

User.schema.virtual('defaultTheme').get(function() {
	return (this.theme=='snowcoins dark')?true:false;
});
/**
 * Methods
 * =======
*/

User.schema.methods.resetPassword = function(callback) {
	
	var user = this;
	
	this.resetPasswordKey = keystone.utils.randomString([16,24]);
	
	this.save(function(err) {
		
		if (err) return callback(err);
		
		new keystone.Email('forgotten-password').send({
			name: user.name.first || user.name.full,
			link: keystone.get('host')+'/reset-password/' + user.resetPasswordKey,
			subject: 'reset your snowpi password'
		}, {
			to: user,
			from: {
				name: 'snowpi',
				email: 'snowpi@snowpi.org'
			}
		}, callback);
		
	});
	
}


/**
 * Registration
 * ============
*/

//User.addPattern('standard meta');
User.defaultColumns = 'name, email, realEmail, isAdmin, onlyD3C';
User.register();
