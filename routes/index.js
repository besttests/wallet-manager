var _ = require('lodash'),
	keystone = require('keystone'),
	snowcoins = require('snowcoins'),
	express = require('express'),
	middleware = require('./middleware'),
	dashes = '\n------------------------------------------------\n',
	importRoutes = keystone.importer(__dirname);


// Load Routes
var routes = {
	api: importRoutes('./api'),
	views: importRoutes('./views')
};
var allow = {
	snowcoins : snowcoins.get('route snowcoins'),
	dccc : snowcoins.get('route d3c'),
	dcc : snowcoins.get('route d2c'),
	share : snowcoins.get('route share'),
	testbed : snowcoins.get('route testbed'),
	link : snowcoins.get('api link')
};
// Bind Routes
exports = module.exports = function(app) {
	// Website	
	
	//UI
	if(allow.snowcoins) {
		app.get('/' + snowcoins.get('path snowcoins'), middleware.requireUser,middleware.forceSSL,middleware.initLocals,middleware.forceAccess,routes.views.react);
		app.get('/' + snowcoins.get('path snowcoins')+ '/*', middleware.requireUser,middleware.forceSSL,middleware.initLocals,middleware.forceAccess,routes.views.react);
	} 
	
	//Client Connect
	if(allow.dcc) {
		app.get('/' + snowcoins.get('path d2c') + '/:apikey',  middleware.initLocals,middleware.forceAccess,routes.views.d2c);
		app.get('/' + snowcoins.get('path d2c') + '*', middleware.initLocals,middleware.forceAccess,routes.views.d2c)
	} else {
		//console.log(dashes,'d2c skipped',dashes);
	}
	
	if(allow.dccc) {
		//Master Connect
		app.get('/' + snowcoins.get('path d3c') + '*', middleware.requireUser,middleware.initLocals,middleware.forceAccess)
		app.get('/' + snowcoins.get('path d3c') + '/:apikey',  routes.views.d3c);
		app.get('/' + snowcoins.get('path d3c') + '*', routes.views.d3c)
	}
	
	if(allow.share) {
		//Unattended Connect
		app.get('/' + snowcoins.get('path share') + '', middleware.initLocals,middleware.forceAccess,routes.views.unattended)
		app.get('/' + snowcoins.get('path share') + '/:apikey', middleware.initLocals,middleware.forceAccess,routes.views.unattended);
	} else {
		//console.log(dashes,'shotcut sharing skipped',dashes);
	}
	if(allow.testbed) {
		//testbed
		app.get('/' + snowcoins.get('path testbed'), middleware.initLocals,middleware.forceAccess,routes.views.testbed)
	} else {
		//console.log(dashes,'testbed skipped',dashes);
	}
	
	if(allow.dccc) {
		// Public API
		app.all('/api/d3c*', middleware.initLocals,middleware.forceSSL,keystone.initAPI,middleware.checkpublicnonce );
		app.get('/api/d3c/:apikey', middleware.initLocals,routes.api.snowcoins.public.d3c);
		//app.get('/api/snowcoins/html/:view', middleware.initLocals,routes.api.snowcoins.d3c.html);
	} else {
		//console.log(dashes,'d3c skipped',dashes);
	}
	
	if(allow.snowcoins) {
		//Private API
		app.get('/api/snowcoins/simple/:fetch', keystone.initAPI,middleware.requireUserAPI,middleware.forceSSL,middleware.initLocals,middleware.addnonce,routes.api.snowcoins.simple);
		app.all('/api/snowcoins/local*', middleware.publicAPI,middleware.requireUserAPI,middleware.forceSSL,middleware.checkprivatenonce,middleware.initLocals);
		app.get('/api/snowcoins/local/add-wallet', middleware.initLocals,routes.api.snowcoins.addwallet);
		app.all('/api/snowcoins/local/remove-wallet', middleware.initLocals,routes.api.snowcoins.removewallet);
		app.get('/api/snowcoins/local/new-key', middleware.initLocals,routes.api.snowcoins.newkey);
		app.get('/api/snowcoins/local/change-wallet', middleware.initLocals,routes.api.snowcoins.wallet);
		app.get('/api/snowcoins/local/wallet', middleware.initLocals,routes.api.snowcoins.snowcoind);
		app.get('/api/snowcoins/local/contacts', middleware.initLocals,routes.api.snowcoins.contacts);
		app.get('/api/snowcoins/local/gated', middleware.initLocals,routes.api.snowcoins.gated);
		app.all('/api/snowcoins/local/receive/setup', middleware.initLocals,routes.api.snowcoins.receive);
		app.all('/api/snowcoins/local/settings', middleware.initLocals,routes.api.snowcoins.settings);
		app.get('/api/snowcoins/local/inq', middleware.initLocals,routes.api.snowcoins.inq);
	} else {
		//console.log(dashes,'snowcoins UI skipped',dashes);
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
