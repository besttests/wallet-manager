/** *
 * socket managers by namespace
 * 
 * 
 ** */

var keystone = require('keystone'),
	jade = require('jade'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists'),
	moduleDir = snowcoins.get('moduleDir'),
	_ = require('lodash'),
	hat = require('hat'),
	sani = require('sanitizer'),
	serverbone =  require('bone.io'),
	query = require('querystring'),
	io = keystone.get('io'),
	mylanguage = keystone.get('language') || 'en-us',
	snowtext = require (moduleDir + '/lib/snowcoins/languages/'+mylanguage+'.js'),
	locals = keystone.get('locals'),
	notcron = require('snowpi-notcron'),
	ledger = require(moduleDir + '/lib/snowcoins/d3c/ledger.js'),
	tx = require(moduleDir + '/lib/snowcoins/d3c/tx.js'),
	status = require(moduleDir + '/lib/snowcoins/d3c/status.js'),
	fetch = require(moduleDir + '/lib/snowcoins/d3c/fetch.js'),
	snowcoin = require(moduleDir + '/routes/api/snowcoins/public/d3c.js'),
	snowauth = require(moduleDir + '/lib/snowcoins/d3c/snowauth.js');


var snowme,
	mainsocket = false,
	snowmasters = 'd3c',
	snowclients = 'd2c',
	snowhouse = 'inhouse',
	myrooms = {
		chat: {
			rooms: {
				d3c: 'd3c',
				d2c: 'd2c',
			}
		},
	},
	clients = {
		d3c : {},
		d2c : {},
		inhouse : {},
		chat : {
			d3c : {},
			d2c : {},
			inhouse : {},
		}
	},
	apiauth = {};

io.set('log level',1)

io.set('authorization', function(req, callback) {
	return callback(null, true);
});

io.of('/master').authorization(function (handshake, next) {
		
	/** * 
	* do we have a current api key
	* console.log('handshake',handshakeData.headers);
	* check the key and ip
	* **/
	var handshakeData = handshake;
	
	var mykey = handshakeData.query.key;
	
	if(handshakeData.query.snowclient == '') {
		/* no key so quit now */
		io.sockets.to(mykey).emit('authfail:d3c',{err:'Please enter a valid API key.'});
		next('no key supplied',false);
	
	} else {
		
		var authoptions = {};
		authoptions.key = handshakeData.query.snowclient;
		authoptions.ip = handshakeData.address.address;
		if('object' !== typeof myrooms[handshakeData.query.snowclient])myrooms[handshakeData.query.snowclient] = {};
		
		/* check the auth */
		snowauth.init(authoptions).auth(function(err,result) {
			if(err) {
				console.log('d3c auth fail',err,mykey);
				var time = new Date().getTime();
				io.sockets.to(mykey).emit('authfail:d3c',{err:err,time:time});
				next('not authorized',false);
				
			} else {
				if(snowauth.get('authlevel')<6)myrooms.snowmasters = snowmasters;
				if(snowauth.get('authlevel')>5) {
					next('not authorized',false);
					io.sockets.to(mykey).emit('authfail:d3c',{err:'Please enter a valid master API key.'});
				}
				myrooms[handshakeData.query.snowclient].snowme = handshakeData.query.snowclient;
				chatCanSend = true;
				console.log('d3c auth success');
				/* setup snowcoins api to recieve our socket commands */
				apiauth.req = {
					ip: authoptions.ip,
					params: {apikey: authoptions.key}
				}
				
				
				next(null,true);
			}
		});
			
	}
				
});
io.of('/d2c').authorization(function (handshake, next) {
				
	/** * 
	* do we have a current api key
	* console.log('handshake',handshakeData.headers);
	* check the key and ip
	* **/
	var handshakeData = handshake;
	
	var mykey = handshakeData.query.key;
	
	if(handshakeData.query.snowclient == '') {
		/* no key so quit now */
		io.sockets.to(mykey).emit('authfail:d2c',{err:'Please enter a valid API key.'});
		next('no key supplied',false);
	
	} else {
		
		var authoptions = {};
		authoptions.key = handshakeData.query.snowclient;
		authoptions.ip = handshakeData.address.address;
		if('object' !== typeof myrooms[handshakeData.query.snowclient])myrooms[handshakeData.query.snowclient] = {};
		
		/* check the auth */
		snowauth.init(authoptions).auth(function(err,result) {
			if(err) {
				console.log('d2c auth fail',err,mykey);
				var time = new Date().getTime();
				io.sockets.to(mykey).emit('authfail:d2c',{err:err,time:time});
				next('not authorized',false);
				
			} else {
				if(snowauth.get('authlevel')<6) {
					next('over-authorized',false);
					io.sockets.to(mykey).emit('authfail:d2c',{err:'Please enter a valid client API key.'});
				}
				if(snowauth.get('authlevel')>5)myrooms.snowclients = snowclients;
				chatCanSend = true;
				console.log('d2c auth success');
				/* setup snowcoins api to recieve our socket commands */
				apiauth.req = {
					ip: authoptions.ip,
					params: {apikey: authoptions.key}
				}
				
				
				next(null,true);
			}
		});
			
	}
				
});
io.of('/comms').authorization(function (handshake, next) {
	//console.log('comms auth',handshake)
	//if('object' !== typeof myrooms[handshake.query.snowclient])myrooms[handshake.query.snowclient] = {};
	if('object' !== myrooms.chat[handshake.query.snowclient])myrooms.chat[handshake.query.snowclient] = {};
	
				
	
	next(null,true);
			
});

var broadcastmaster;
/* I need broadcast events but bone is lacking */
io.of("/master").on("connection", function(socket) {
	broadcastmaster = socket;
	socket.on("disconnect", function(s) {
		console.log("Disconnected from master");
		manageclients() 
	});            
});
io.of("/d2c").on("connection", function(socket) {
	socket.on("disconnect", function(s) {
		console.log("Disconnected from master");
		manageclients() 
	});            
});
io.of("/comms").on("connection", function(socket) {
	socket.on("disconnect", function(s) {
		console.log("Disconnected from comms");
		manageclients() 
	});            
});
io.on("connection", function(socket) {
	console.log("connected to root",socket.handshake.query.key);
	socket.join(socket.handshake.query.key);
	socket.on("disconnect", function(s) {
		console.log("Disconnected from root",s);
		manageclients() 
	});            
});


var masternamespace = {sockets:io.of('/master')},
	chatnamespace = {sockets:io.of('/comms')},
	d2cnamespace = {sockets:io.of('/d2c')};



// Configure bone.io options

/* middleware */
var cleandata = function (data, context, next) {
	var redo = data;
	_.keys(redo).forEach(function(val) {
		data[val] = sani.sanitize(redo[val]);
	});
	next();
}


/* managers */
var Server = serverbone.io('main', {
	config: {
		server: masternamespace
	},
	outbound: {
		routes: ['sort','template','start','action']
	},
	inbound: {
		middleware: [
			//bone.io.middleware.session(keystone.app.sessionOpts),
			cleandata,
			function(data, context, next) {
				console.log('main middle auth')
						
				if(context.handshake.query.snowclient == '') {
						
					context.socket.disconnect();
						
				} else {
						
					authoptions = {};
					authoptions.key = context.handshake.query.snowclient;
					authoptions.ip = context.handshake.address.address;
					
					
					//run snowauth
					//console.log(context,dashes);
					snowauth.init(authoptions).auth(function(err,result) {
						if(err) {
							//context.socket.packet({type: 'disconnect'});
							//context.socket.namespace.manager.onLeave(context.socket.id, context.socket.namespace.name);
							//context.socket.$emit('disconnect', 'booted');
							context.socket.disconnect();
						} else {
							myrooms[context.handshake.query.snowclient] = {}
							myrooms[context.handshake.query.snowclient].snowme = context.handshake.query.snowclient;
							myrooms[context.handshake.query.snowclient].socket = context.socket.id
							next();
						}
					});	

				}
				
			},
		],
		template: function(data, context) {
			console.log('template',data);
			var _self = this;
			//console.log(locals);
			jade.renderFile('./templates/views/api/d3c/'+data.template, {local:keystone.get('locals'),snowtext:snowtext}, function (err, html) {
				if (err) {
					console.log(err);
				}
				Server.room(myrooms[context.handshake.query.snowclient].socket).template({html:html});
			 
			});
		},
		start: function(data, context) {
			console.log('start');
			var _self = this;
			//console.log(locals);
			jade.renderFile('./templates/views/api/d3c/main.jade', {apikey:authoptions.key,local:keystone.get('locals'),snowtext:snowtext}, function (err, html) {
				if (err) {
					console.log(err);
				}
				Server.room(myrooms[context.handshake.query.snowclient].socket).start({div:'#snow-d3c',html:html});
			 
			});
		},
		register: function(data, context) {
			console.log('join personal room in d3c ');
			clients.d3c[myrooms[context.handshake.query.snowclient].snowme] = context.socket.id;
			this.join(myrooms[context.handshake.query.snowclient].socket);
			this.join(snowmasters);
			
			Server.inbound.action({command:'find',action:'ledger',populate:1}, context);
			Server.inbound.action({command:'find',action:'wallets'}, context);
			Server.inbound.action({command:'find',action:'clients'}, context);
			Server.inbound.start(data, context);
			Server.inbound.action({command:'find',action:'currencyrates'}, context);
		},
		leave: function(data, context) {
			console.log('leave d3c ');
			delete clients.d3c[myrooms[context.handshake.query.snowclient].snowme];
			this.leave(myrooms[context.handshake.query.snowclient].join);
			
		},
		sort: function(data, context) {
			console.log('sort this',dashes);
			this.room(myrooms[context.handshake.query.snowclient].socket).sort({test:'sort',data:'<br />This is private data to you '+myrooms[context.handshake.query.snowclient].snowme+'<br />'});
			this.room(snowmasters).sort({test:'sort',data:'This is public data to all masters <br />'});
		},
		action: function(data, context) {
			console.log('receive action',data.command+'.'+data.action);
			if(apiauth && apiauth.req) {
				var req={ip:apiauth.req.ip,params:apiauth.req.params,query:data}
				helpserver.snowcoins(req,context);
			}
		}
	}
});
/*server helper functions */
var helpserver = {
	addledger: function(data) {
		console.log('help addledger');
	},
	snowcoins: function(req,context) {
		var res = {
			apiResponse: function(resp) {
				//if(req.query.action=='currencyrates')console.log(resp,req.query);
				/*check if this is a broadcast item */
				if(resp.success == true && helpserver.broadcastevents[req.query.command] && helpserver.broadcastevents[req.query.command][req.query.action])helpserver.broadcastevents[req.query.command] && helpserver.broadcastevents[req.query.command][req.query.action](resp,req,context );
				
				if(req.query.broadcast) {
					Server.room(snowmasters).action({command:req.query.command,action:req.query.action,data:resp,refresh:req.query.refresh});
					//broadcastmaster.broadcast.emit('main:action',{data:{command:req.query.command,action:req.query.action,data:resp,refresh:req.query.refresh}})
				} else {
					Server.room(myrooms[context.handshake.query.snowclient].socket).action({command:req.query.command,action:req.query.action,data:resp,refresh:req.query.refresh});
				}
				
			}
		}
		snowcoin(req,res);
	},
	broadcastevents: {
		/*this will mirror our command action structure */
		ledger: {
			create: function(resp,req,context ){ Server.inbound.action({command:'ledger',action:'find',ledgerid:resp.data.ledgerID,broadcast:1,refresh:1},context)},
			modify: function(resp,req ,context){ Server.inbound.action({command:'ledger',action:'find',ledgerid:resp.data.ledgerID,broadcast:1,refresh:1},context)},
			additem: function(resp,req ,context){  Server.inbound.action({command:'find',action:'items',broadcast:1},context)},
		},
		transaction: {
			create: function(resp,req ,context){ Server.inbound.action({command:'find',action:'transaction',broadcast:1},context)},
			additem: function(resp,req ,context){ Server.inbound.action({command:'find',action:'items',broadcast:1},context)},
		},
	},
}

/* d2c */
var D2c = serverbone.io('d2c', {
	config: {
		server: d2cnamespace
	},
	outbound: {
		routes: ['sort','template','start','action']
	},
	inbound: {
		middleware: [
			//bone.io.middleware.session(keystone.app.sessionOpts),
			cleandata,
			function(data, context, next) {
				console.log('d2c middle auth')
				if(context.handshake.query.snowclient == '') {
						
					context.socket.disconnect();
						
				} else {
						
					authoptions = {};
					authoptions.key = context.handshake.query.snowclient;
					authoptions.ip = context.handshake.address.address;
					//run snowauth
					//console.log(context,dashes);
					snowauth.init(authoptions).auth(function(err,result) {
						if(err) {
							//context.socket.packet({type: 'disconnect'});
							//context.socket.namespace.manager.onLeave(context.socket.id, context.socket.namespace.name);
							//context.socket.$emit('disconnect', 'booted');
							context.socket.disconnect();
						} else {
							myrooms[context.handshake.query.snowclient] = {}
							myrooms[context.handshake.query.snowclient].snowme = context.handshake.query.snowclient;
							myrooms[context.handshake.query.snowclient].socket = context.socket.id
							next();
						}
					});	

				}
				
			},
		],
		template: function(data, context) {
			console.log('template',data);
			var _self = this;
			//console.log(locals);
			jade.renderFile('./templates/views/api/d3c/'+data.template, {local:keystone.get('locals'),snowtext:snowtext}, function (err, html) {
				if (err) {
					console.log(err);
				}
				D2c.room(myrooms[context.handshake.query.snowclient].socket).template({html:html});
			 
			});
		},
		start: function(data, context) {
			console.log('start');
			var _self = this;
			//console.log(locals);
			jade.renderFile('./templates/views/api/d3c/d2c.jade', {apikey:authoptions.key,local:keystone.get('locals'),snowtext:snowtext}, function (err, html) {
				if (err) {
					console.log(err);
				}
				D2c.room(myrooms[context.handshake.query.snowclient].socket).start({div:'#snow-d3c',html:html});
			 
			});
		},
		register: function(data, context) {
			console.log('join personal room in d2c ');
			clients.d2c[myrooms[snowme].snowme] = context.socket.id;
			this.join(myrooms[snowme].socket);
			this.join(snowmasters);
			
			D2c.inbound.action({command:'find',action:'ledger',populate:1});
			D2c.inbound.start(data, context);
			D2c.inbound.action({command:'find',action:'currencyrates'});
		},
		leave: function(data, context) {
			console.log('leave d2c ');
			delete clients.d2c[myrooms.snowme];
			this.leave(myrooms[context.handshake.query.snowclient].socket);
			
		},
		sort: function(data, context) {
			console.log('sort this',dashes);
			this.room(myrooms[context.handshake.query.snowclient].socket).sort({test:'sort',data:'<br />This is private data to you '+snowme+'<br />'});
			this.room(snowmasters).sort({test:'sort',data:'This is public data to all masters <br />'});
		},
		action: function(data, context) {
			console.log('receive action',data.command+'.'+data.action);
			if(apiauth && apiauth.req) {
				var req={ip:apiauth.req.ip,params:apiauth.req.params,query:data}
				helpd2c.snowcoins(req,context);
			}
		}
	}
});
/*d2c helper functions */
var helpd2c = {
	addledger: function(data) {
		console.log('help addledger');
	},
	snowcoins: function(req,context) {
		var res = {
			apiResponse: function(resp) {
				//if(req.query.action=='currencyrates')console.log(resp,req.query);
				/*check if this is a broadcast item */
				if(resp.success == true && helpserver.broadcastevents[req.query.command] && helpserver.broadcastevents[req.query.command][req.query.action])helpserver.broadcastevents[req.query.command] && helpserver.broadcastevents[req.query.command][req.query.action](resp,req,context );
				
				if(req.query.broadcast) {
					var sendto = D2c.room(snowmasters);
				} else {
					var sendto = D2c.room(myrooms[context.handshake.query.snowclient].socket);
				}
				sendto.action({command:req.query.command,action:req.query.action,data:resp,refresh:req.query.refresh});
			}
		}
		snowcoins(req,res);
	},
	broadcastevents: {
		/*this will mirror our command action structure */
		transaction: {
			additem: function(resp,req,context){ D2c.inbound.action({command:'find',action:'items',broadcast:1},context)},
		},
	},
}



var Chatter = serverbone.io('chatter', {
	config: {
		server: chatnamespace
	},
	outbound: {
		routes: ['message','setclients','setname']
	},
	inbound: {
		middleware: [
			//bone.io.middleware.session(keystone.app.sessionOpts),
			cleandata,
			/* client check */
			function(data, context, next) {
				var authoptions = {};				
				
				authoptions.key = context.handshake.query.snowclient;
				authoptions.ip = context.handshake.address.address;
				
				myrooms.chat[context.handshake.query.snowclient].rooms = [];
				
				//run snowauth
				snowauth.init(authoptions).auth(function(err,result) {
					if(!err) {						
						chatCanSend = true;
						/* reset client chat object */
						myrooms.chat[context.handshake.query.snowclient].socket =  context.socket.id;
						myrooms.chat[context.handshake.query.snowclient].rooms.push(context.socket.id);
						myrooms.chat[context.handshake.query.snowclient].snowme =  snowauth.get('name');
						myrooms.chat.rooms[snowauth.get('name')] =  context.socket.id;
						
						//set room per api authlevel
						if(snowauth.get('authlevel')<6) {
							myrooms.chat[context.handshake.query.snowclient].rooms.push(myrooms.chat.rooms.d3c);
							clients.chat.d3c[snowauth.get('name')] = myrooms.chat[context.handshake.query.snowclient].socket;
						}
						if(snowauth.get('authlevel')>5) {
							myrooms.chat[context.handshake.query.snowclient].rooms.push(myrooms.chat.rooms.d2c);
							clients.chat.d2c[snowauth.get('name')] = myrooms.chat[context.handshake.query.snowclient].socket;
						}
					} else {
						myrooms.chat[context.handshake.query.snowclient].snowhouse = snowhouse;
						myrooms.chat[context.socket.id].snowme = context.namespace+'-'+context.socket.id;
						clients.chat.inhouse[context.socket.id] = context.socket.id;
						chatCanSend = false;
					}
					
					next();
					
				});	
				
			},
			/* end client check */
		],
		register: function(data, context) {
				
			var _self = this;
			if(myrooms.chat[context.handshake.query.snowclient].rooms instanceof Array) {
				 myrooms.chat[context.handshake.query.snowclient].rooms.forEach(function(val) {
					var sock = val ;
					_self.join(sock);
					console.log('join chat ',sock);
				});
			}
			//send the client list to masters
			console.log('send name',myrooms.chat[context.handshake.query.snowclient].snowme,myrooms.chat[context.handshake.query.snowclient].socket)
			
			this.room(myrooms.chat[context.handshake.query.snowclient].socket).setname({name:myrooms.chat[context.handshake.query.snowclient].snowme});
			 
			
			if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms.d3c) > -1)this.room(myrooms.chat.rooms.d3c).setclients({clients:clients.chat});
			if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms.d2c) > -1)this.room(myrooms.chat.rooms.d2c).setclients({clients:clients.chat});
				//io.sockets.emit('chatter:setclients',{data: {clients:clients}})
				console.log('register send clients')
			
				
		},
		getclients: function (data,context) {
				
			console.log('request send clients');
			if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms.d3c) > -1)this.room(myrooms.chat.rooms.d3c).setclients({clients:clients.chat});
			if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms.d2c) > -1)this.room(myrooms.chat.rooms.d2c).setclients({clients:clients.chat});
			
		},
		message: function(data, context) {
				
			console.log('got message');
			var message = data.message || '**invalid message**',
				
				_self = this;
				
			if(data.room) {
				
				if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms[data.room]) === -1) {
					
					console.log('cc sender',myrooms.chat[context.handshake.query.snowclient].rooms,data.room, context.handshake.query.snowclient)
					_self.room(myrooms.chat[context.handshake.query.snowclient].socket).message({from: myrooms.chat[context.handshake.query.snowclient].snowme, room:data.room,html:message});
				
				}
				
				_self.room(myrooms.chat.rooms[data.room]).message({from: myrooms.chat[context.handshake.query.snowclient].snowme, room:data.room,html:message});
				console.log('send message to room', data.room,'     socket: ', myrooms.chat.rooms[data.room]);
				console.log('from',myrooms.chat[context.handshake.query.snowclient].snowme)
				
			} else {
				
				//_self.message({from: myrooms.snowme, room:data.room,html:message});
				if(myrooms.chat[context.handshake.query.snowclient].rooms.indexOf(myrooms.chat.rooms.d3c) > -1)chatnamespace.sockets.emit('chatter:message',{data:{from: myrooms.chat[context.handshake.query.snowclient].snowme, room:data.room,html:message}});
				
			}
					
		}
	}
});





/* interval functions */

function manageclients() {
	
	var chatrooms = _.keys(chatnamespace.sockets.manager.open),
		masterrooms = _.keys(masternamespace.sockets.manager.open),
		update=false;
	function remove(list,pool) {
		//console.log('start delete old clients',list,pool);
		_.each(list,function(v,k,l) {
			
			if(!_.contains(pool,v)) {
				delete list[k];
				update=true;
				console.log('delete clients from chatlist',k);
			}
		})
	}
	remove(clients.chat.d3c,chatrooms)
	remove(clients.chat.d2c,chatrooms)
	remove(clients.chat.inhouse,chatrooms)
	remove(clients.d3c,masterrooms)
	remove(clients.d2c,masterrooms)
	remove(clients.inhouse,masterrooms)
	if(update)chatnamespace.sockets.emit('chatter:setclients',{data:{clients : clients.chat}});
}
//notcron.intervals.set(5000,manageclients).start();


/*  default for chat 

masternamespace.sockets.on('connection', function (socket) {
  
	socket.on('d3c:sort', function (id,data) {
			console.log('sort this',dashes);
			socket.to(snowme).emit('d3c:sort',{test:'sort',data:'<br />This is private data to you '+snowme+'<br />'});
			socket.to(snowmasters).emit('d3c:sort',{test:'sort',data:'This is public data to all masters <br />'});
			
	});
	
	socket.on('d3c:register', function (id) {
			console.log('join personal room in d3c ');
			clients.d3c[snowme] = socket.id;
			socket.join(snowme);
	});
	
	socket.on('chat:getclients', function () {
			console.log('get clients',myrooms,clients);
			socket.emit('chat:setclients',{clients : clients});
			socket.emit('chat:setclients','msg');
	});
});
*/
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
