/**
 * @jsx React.DOM
 */
 
	var addroutes = {}

	addroutes[snowPath.router.wallet] = "wallet";
	addroutes[snowPath.router.wallet + '/'] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet"] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet/:moon"] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet/:moon/:e1"] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet/:moon/:e1/:e2"] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet/:moon/:e1/:e2/:e3"] = "wallet";
	addroutes[snowPath.router.wallet + "/:wallet/:moon/:e1/:e2/:e3/:e4"] = "wallet";
	
	addroutes[snowPath.router.receive + "/:section"] = "receive";
	addroutes[snowPath.router.receive + "/:section/:moon"] = "receive";
	addroutes[snowPath.router.receive + "/:section/:moon/:e1"] = "receive";
	addroutes[snowPath.router.receive + "/:section/:moon/:e1/:e2"] = "receive";
	addroutes[snowPath.router.receive + "/:section/:moon/:e1/:e2/:e3"] = "receive";
	addroutes[snowPath.router.receive + "/:section/:moon/:e1/:e2/:e3/:e4"] = "receive";
	addroutes[snowPath.router.receive + "/"] = "receive";
	addroutes[snowPath.router.receive ] = "receive";
	
	addroutes[snowPath.router.settings + "/:section"] = "settings" ;
	addroutes[snowPath.router.settings + "/:section/:moon"] = "settings" ;
	addroutes[snowPath.router.settings + "/"] = "settings" ;
	addroutes[snowPath.router.settings ] = "settings" ;

	addroutes[snowPath.router.inq + "/:moon"] = "inqueue";
	addroutes[snowPath.router.inq + "/"] = "inqueue";
	addroutes[snowPath.router.inq] = "inqueue";
	
	addroutes[snowPath.router.profile + "/:moon"] = "profile";
	addroutes[snowPath.router.profile + "/"] = "profile";
	addroutes[snowPath.router.profile] = "profile";
	
	addroutes[''] = "redirect";
	
	addroutes['*'] = "redirect";
	var middleware = {
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
	    routes: addroutes,
	    middleware: [
		middleware.scrollTop
	    ],
	    overview: function() {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI section={snowPath.router.wallet}  wallet={false} moon={false}  params={args}/>, document.getElementById('snowcoins-react'));
	    },
	    redirect: function() {
		
		var args = window.location.pathname.split('/').slice(2);
		var section = args[0],
			wallet = args[1],
			moon = args[2]	
		snowlog.warn('REDIRECT',section,wallet,moon,args)
		React.renderComponent(<UI section={section}  wallet={wallet} moon={moon}  params={args} />, document.getElementById('snowcoins-react'));
	    
	    },
	    wallet: function(wallet,moon) {
		snowlog.info('WALLET',wallet,moon)
		if(!moon)moon = false
		if(!wallet)wallet = false
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI section={snowPath.router.wallet} wallet={wallet} moon={moon} params={args} />, document.getElementById('snowcoins-react'));
	    },
	    settings: function(section,moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI section={snowPath.router.settings} wallet={section} moon={moon}  params={args}/>, document.getElementById('snowcoins-react'));
	    },
	    receive: function(section,moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI section={snowPath.router.receive} wallet={section} moon={moon}  params={args}/>, document.getElementById('snowcoins-react'));
	    },
	    inqueue: function(moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI  section={snowPath.router.inq} wallet={false} moon={moon}  params={args} />, document.getElementById('snowcoins-react'));
	    },
	    profile: function(moon) {
		var args = Array.prototype.slice.call(arguments).map(function(v){return decodeURI(v)});
		React.renderComponent(<UI  section={snowPath.router.profile} wallet={false} moon={moon}  params={args} />, document.getElementById('snowcoins-react'));
	    }
	    
	});



