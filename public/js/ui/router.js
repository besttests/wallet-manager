/**
 * @jsx React.DOM
 */

	snowUI.addroutes = {}

	snowUI.addroutes[snowUI.snowPath.router.wallet] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + '/'] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet"] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet/:moon"] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet/:moon/:e1"] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet/:moon/:e1/:e2"] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet/:moon/:e1/:e2/:e3"] = "wallet";
	snowUI.addroutes[snowUI.snowPath.router.wallet + "/:wallet/:moon/:e1/:e2/:e3/:e4"] = "wallet";
	
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section/:moon"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section/:moon/:e1"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section/:moon/:e1/:e2"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section/:moon/:e1/:e2/:e3"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/:section/:moon/:e1/:e2/:e3/:e4"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive + "/"] = "receive";
	snowUI.addroutes[snowUI.snowPath.router.receive ] = "receive";
	
	snowUI.addroutes[snowUI.snowPath.router.settings + "/:section"] = "settings" ;
	snowUI.addroutes[snowUI.snowPath.router.settings + "/:section/:moon"] = "settings" ;
	snowUI.addroutes[snowUI.snowPath.router.settings + "/"] = "settings" ;
	snowUI.addroutes[snowUI.snowPath.router.settings ] = "settings" ;

	snowUI.addroutes[snowUI.snowPath.router.inq + "/:moon"] = "inqueue";
	snowUI.addroutes[snowUI.snowPath.router.inq + "/"] = "inqueue";
	snowUI.addroutes[snowUI.snowPath.router.inq] = "inqueue";
	
	snowUI.addroutes[snowUI.snowPath.router.profile + "/:moon"] = "profile";
	snowUI.addroutes[snowUI.snowPath.router.profile + "/"] = "profile";
	snowUI.addroutes[snowUI.snowPath.router.profile] = "profile";
	
	snowUI.addroutes[''] = "redirect";
	
	snowUI.addroutes['*'] = "redirect";
	snowUI.addroutes.middleware = {
	    // Scroll back to the top of the page on route change
	    scrollTop: function(route, next) {
		$(window).scrollTop(0) 
		next();
	    },
	    // Track a page view with Google Analytics
	    analytics: function(route, next) {
		_gaq.push(['_trackPageview', '/' + route]);
		next();
	    },
	    logme: function(route, next) {
		  snow.log('see route',route,next)  
	    }  
	}
	
	bone.router({
	    routes: snowUI.addroutes,
	    middleware: [
		snowUI.addroutes.middleware.scrollTop
	    ],
	    overview: function() {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.wallet, wallet: false, moon: false, params: args}), document.getElementById('snowcoins-react'));
	    },
	    redirect: function() {
		
		var args = window.location.pathname.split('/').slice(2);
		var section = args[0] || snowUI.snowPath.router.wallet,
			wallet = args[1],
			moon = args[2]	
		snowLog.warn('REDIRECT',section,wallet,moon,args)
		React.renderComponent(snowUI.UI({section: section, wallet: wallet, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    
	    },
	    wallet: function(wallet,moon) {
		snowLog.info('WALLET',wallet,moon)
		if(!moon)moon = false
		if(!wallet)wallet = false
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.wallet, wallet: wallet, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    },
	    settings: function(section,moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.settings, wallet: section, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    },
	    receive: function(section,moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.receive, wallet: section, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    },
	    inqueue: function(moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.inq, wallet: false, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    },
	    profile: function(moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(snowUI.UI({section: snowUI.snowPath.router.profile, wallet: false, moon: moon, params: args}), document.getElementById('snowcoins-react'));
	    }
	    
	});



