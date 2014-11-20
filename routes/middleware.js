var _ = require('lodash'),
	querystring = require('querystring'),
	keystone = require('keystone'),
	hat = require('hat'),
	path = require('path'),
	snowcoins = require('snowcoins');

var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop();
	parts.pop(); //get rid of /paths
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


/**
	Initialises the standard view locals
*/

exports.initLocals = function(req, res, next) {
	
	var locals = res.locals;
	
	//use local language text
	var mylanguage = keystone.get('language') || 'en-us';
	var setlanguage = require (snowcoins.get('moduleDir') + '/lib/snowcoins/languages/'+mylanguage+'.js');
	
	locals.snowtext = setlanguage;
	locals.language = mylanguage;
	
	locals.path = snowcoins.get('path');
	
	var gethost=req.get('host').replace('http://','').split(':');
	locals.socketio = {port:keystone.get('socket port') || false, host:gethost[0] || false, ssl:keystone.get('socket ssl') || false}
	
	locals.numeral = require('numeral');
	locals.moment = require('moment');
	
	var htp = (req.secure)?'https://':'http://';
	locals.host = htp+req.get('host');
	locals.qs_set = qs_set(req, res);
	locals.user = req.user;
	
	next();
	
	
};
/**
 *  middleware to set custom view path
 *
 *  */
exports.customView = function(req,res,next) {
	//console.log('custom view',CONSTANTS.PATH_ROOT,CONSTANTS.PATH_APP)
	/*var customView = function(req, res, next) {
		var curRender = res.render;
		res.render = function(path, locals, func) {
		    var args = [appRoot + '/templates/views/' + path, locals, func];
		    
		    curRender.apply(this, args);
		};
		
	};*/
	next();
}



/**
	Inits the error handler functions into `req`
*/

exports.initErrorHandlers = function(req, res, next) {
	
	res.err = function(err, title, message) {
		res.status(500).render('errors/500', {
			err: err,
			errorTitle: title,
			errorMsg: message
		});
		
	}
	
	res.notfound = function(title, message) {
		res.status(404).render('errors/404', {
			errorTitle: title,
			errorMsg: message
		});
	}
	
	next();
	
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {
	
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	
	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length }) ? flashMessages : false;
	
	next();
	
};

/**
	Force a user to an area if required
 */

exports.forceAccess = function(req, res, next) {
	console.log('force access')
	if(req.user && req.user.D3Cdummy) {
		var pop = req.url.split('/');
		var popped =  pop.length == 0 ? '' : pop.shift();
		if(!popped && pop.length>0)popped=pop.shift();
		if(!popped || popped.toLowerCase()!='d3c')
			res.redirect('/d3c');
		else
			next();
	} 
	else 
		next();
}

/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
	
	if (!req.user) {
		
		req.flash('error', 'Please sign in to access this page.');
		var go = keystone.get('signin url');
		res.redirect(go);
		
	} else {
		
		next();
	}
	
}
exports.requireUserAPI = function(req, res, next) {
	
	if (!req.user) {
		
		return res.apiResponse({ success: false, redirect:keystone.get('signin url'),error:'You are not logged in.  <a href="/signin">Log in.</a>'});
		
	} else {
		
		next();
	}
	
}


/**
	check the private header nonce 
 */

exports.checkprivatenonce = function(req, res, next) {
	/**
	 *  run the snow token through its check 
	 *  kicks error response 
	 * */
		var token = req.headers['x-snow-token'],
			window = req.headers['x-snow-window'],
			nonce=hat();
		var path = {
			snowcat: typeof req.user === 'object' ? req.user.email : 'snowcat',
			snowcoins: snowcoins.get('path snowcoins'),
			d3c: snowcoins.get('path d3c'),
			d2c: snowcoins.get('path d2c'),
			share: snowcoins.get('path share'),
			logout: snowcoins.get('path logout'),
			link: {
				state: snowcoins.get('linkserver'),
				port: snowcoins.get('api link port'),
				sockets: Object.keys(snowcoins.link.sockets).length
			},
			
		}
		
		if(window && !req.session[window]) {
			console.log('assign window',req.url);
			req.session[window]={};
			var errors='403 Window Set... Success is a re-click away!';
			req.session[window].nonce = nonce;
			res.setHeader("x-snow-token", nonce);
			if (req.url === '/api/snowcoins/local/simple/setwindowname')
				return res.apiResponse({ success: true, linkport: snowcoins.get('api link port'), path: path, error:'Set window session. If you see this message success is a re-click away.'});
			else 
				return res.apiResponse({ success: false, error:'Set window session. If you see this message success is a re-click away.',linkport: snowcoins.get('api link port'),  path: path});
		
		} else if(!window) {
			console.log('no window',req.url);
			var errors='403 Window... You must specify a unique id for this window.';
			res.setHeader("x-snow-token", nonce);
			return res.apiResponse({ success: false, error:errors, path: path});
		
		} else if(window && (req.session[window] && token!=req.session[window].nonce)) {
			console.log('failed private nonce',req.session[window].nonce,req.url);
			res.setHeader("x-snow-token", nonce);
			req.session[window].nonce = nonce;
			if (req.url === '/api/snowcoins/local/simple/setwindowname')
				return res.apiResponse({ success: true, linkport: snowcoins.get('api link port'), path: path, error:'Set window session. If you see this message success is a re-click away.'});
			else 
				return res.apiResponse({ success: false, error:'403 Forbidden Nonce',linkport: snowcoins.get('api link port'),  path: path});
			
		
		} else if(token && token==req.session[window].nonce){
			//console.log('passed nonce check');
			//req.session[window].nonce = nonce;
			res.setHeader("x-snow-token", req.session[window].nonce);
			//console.log('private nonce',req.session[window].nonce,req.url);
			next();
		}
}


/* *********
 * Lots of nonce functions below
 * we dont use them anymore
 * you can use them to set up a rolling nonce that changes every time a page is requested
 * that is why we use a window session for each user, so you can roll a nonce with each page request and use multiple windows for the same user
 * 
 * it is a pain to keep up with a rolling nonce, however the site should comply.  
 * THere are a couple of places where I was required to use block calls to pacify(? i dont have spell check and that looks funny) the rolling nonce.
 * I don't remember if I removed the blocks when I went to a single nonce.
 * There were only a couple of them.
 * The ajax functions in snowUI are setup to handle the block calls.
 * 
 * */
/**
	
	
	add public param nonce 
	* Add a nonce to the header for every response
	* works before render
 */

exports.addnonce2 = function(req, res, next) {
	/**
	 *  run the snow token through its check 
	 *  kicks error response 
	 * */
		var token = req.headers['x-snow-token'] || req.query.nonce,
			window = req.headers['x-snow-window'];
		if(req.session[window] && token!=req.session[window].nonce) {
			//console.log(req.session[window],token);
			var errors='403 Forbidden Nonce';
			var nonce=hat();
			res.setHeader("x-snow-token", nonce);
			req.session[window].nonce = nonce;
			return res.apiResponse({ success: false, error:errors});
		} else {
			//console.log('passed nonce check');
			if(!req.session[window].nonce)req.session[window].nonce = hat();
			//req.session[window].nonce = nonce;
			res.setHeader("x-snow-token", req.session[window].nonce);
			next();
		}
}
/**
	Add a nonce to the header for every response
	* works before render - public api uses another method
 */

exports.addnonce = function(req, res, next) {
	//console.log('add nonce',req.headers['x-snow-window'],req.session[req.headers['x-snow-window']]);
	if(req.session[req.headers['x-snow-window']]) {
		res.setHeader("x-snow-token", req.session[req.headers['x-snow-window']].nonce);
		res.locals.token = req.session[req.headers['x-snow-window']].nonce;
	} else {
		res.setHeader("x-snow-token", '');
		res.locals.token = '';
	}
	next();	
}
/**
	check the public param nonce 
	* Add a nonce to the header for every response
	* works before render
 */

exports.checkpublicnonce = function(req, res, next) {
	/**
	 *  run the snow token through its check 
	 *  kicks error response 
	 * */
		var token = req.headers['x-snow-token'] || req.query.nonce,
			window = req.headers['x-snow-window'];
		if(req.session[window] && token!=req.session[window].nonce) {
			//console.log(req.session[window],token);
			var errors='403 Forbidden Nonce';
			var nonce=hat();
			res.setHeader("x-snow-token", nonce);
			req.session[window].nonce = nonce;
			return res.apiResponse({ success: false, error:errors});
		} else {
			//console.log('passed nonce check');
			if(!req.session[window].nonce)req.session[window].nonce = hat();
			//req.session[window].nonce = nonce;
			res.setHeader("x-snow-token", req.session[window].nonce);
			next();
		}
}



/**
 * Middleware to initialise a custom API response.
 * 
 * Adds the rolling nonce to each response
 *
 * Adds `res.apiResonse` and `res.apiError` methods.
 *
 * ####Example:
 *
 *     app.all('/api*', initAPI);
 *
 * @param {app.request} req
 * @param {app.response} res
 * @param {function} next
 * @api public
 */

exports.publicAPI = function(req, res, next) {
	res.apiResponse = function(status) {
		
		if(!status || !_.isObject(status))status = {}
		
		if(req.session && req.headers['x-snow-window'])status.nonce = req.session[req.headers['x-snow-window']].nonce;
		status.url=req.protocol + '://' + req.get('host') + req.originalUrl;
		
		//add path and link info
		status.path = {
			snowcoins: snowcoins.get('path snowcoins'),
			d3c: snowcoins.get('path d3c'),
			d2c: snowcoins.get('path d2c'),
			share: snowcoins.get('path share'),
			logout: snowcoins.get('path logout'),
			link: {
				state: snowcoins.get('linkserver'),
				port: snowcoins.get('api link port'),
				sockets: Object.keys(snowcoins.link.sockets).length
			},
			snowcat: typeof req.user === 'object' ? req.user.email : 'snowcat',
		}
		
		if (req.query.callback)
			res.jsonp(status);
		else
			res.json(status);
	};
	res.apiError = function(key, err, code, msg, data ) {
		msg = msg || 'Error';
		key = key || 'unknown error';
		msg += ' (' + key + ')';
		if (keystone.get('logger')) {
			console.log(msg + (err ? ':' : ''));
			if (err) {
				console.log(err);
			}
		}
		res.status(code || 500);
		res.apiResponse({ code: key || 'error',  error: msg ,msg: err , message: msg , err: err, data:data });
	};
	next();
};

/**
 * Middleware to force to ssl.
 * 
 * force ssl
 *
 * ####Example:
 *		
 *     app.all('/api*', forceSSL);
 *
 * @param {app.request} req
 * @param {app.response} res
 * @param {function} next
 * @api public
 */

exports.forceSSL = function(req,res,next) {
	//this should work for local development as well
	//console.log('check ssl middleware',keystone.get('ssl'))
	if(!req.secure && keystone.get('ssl')===true) {
		var sslHost = keystone.get('ssl host') || keystone.get('host') || process.env.HOST || process.env.IP,
			sslPort = keystone.get('ssl port');
		if(!sslHost) {
			var gethost=req.get('host').replace('http://','').split(':');
			sslHost=gethost[0];
		}
		//fix port for external webserver use
		if(sslPort)sslPort=':'+sslPort;
		return res.redirect('https://' + sslHost + sslPort + req.url);
	}
	next();
}

/**
	Returns a closure that can be used within views to change a parameter in the query string
	while preserving the rest.
*/

var qs_set = exports.qs_set = function(req, res) {

	return function qs_set(obj) {

		var params = _.clone(req.query); 

		for (var i in obj) {
			if (obj[i] === undefined || obj[i] === null) {
				delete params[i];
			} else if (obj.hasOwnProperty(i)) {
				params[i] = obj[i];
			}
		}

		var qs = querystring.stringify(params);

		return req.path + (qs ? '?' + qs : '');

	}

}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
