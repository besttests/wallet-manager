var snowUI = {
	_csrf: snowUI._csrf,
	snowLanguages: snowUI.snowLanguages,
	get snowText() {
		return snowUI.snowLanguages.language;
	},
	snowPath: {
		linkServer: {
			host: 'http://snow8:12888/',
		},
		router: {
			root: 'walletManager',
			wallet: 'wallets',
			receive: 'manage',
			settings: 'settings',
			profile: 'profile',
			inq: '.link',
			link: '.link',
			d2c: 'd2c',
			d3c: 'd3c'
		},
		routeRoot: 'walletManager',
		root: '/walletManager',
		wallet: '/wallets',
		receive: '/manage',
		settings: '/settings',
		profile: '/profile',
		inq: '/settings/.link',
		link: '/settings/.link',
		d2c: '/d2c',
		d3c: '/d3c',
		share: '/share',
	}, 
	debug: true,
	snowcat: 'snowcat',
	userSettings: {},
	wallet: {},
	_wallets: {},
	receive: {},
	settings: {},
	link:{},
	methods : {
		wallet:{},
		receive:{},
		settings:{},
	},
	intervals: {},
	controllers : {
		ui:{},
		wallet:{},
		receive:{},
		settings:{},
	},
	_flash:{},
	killFlash: function(who) {
		clearTimeout(snowUI._flash[who])
		$('.fade'+who).fadeOut();
	},
	flash:function(type,msg,delay,kill) {
		if(isNaN(delay))delay=4000;
		
		var clear = function(who) {
			clearTimeout(snowUI._flash[who])
			$('.fade'+who).fadeOut();
		}
		var keys = Object.keys(snowUI._flash)
		keys.forEach(function(v) {
			if(kill || v === type)clear(v)
		})
		$('.fade'+type).fadeIn().find('.html').html(msg)
		snowUI._flash[type] = setTimeout(function() {
			$('.fade'+type).fadeOut();
		},delay);
		
	},
	fadeRenderOut: function (cb) {
		
		$('#maindiv')
		.fadeTo("slow",0.00)
		.promise()
		.done(function() {
			if(snowUI.debug) snowLog.log('fadeout')
			if(cb)cb()
		});
		//$('#maindiv').css('opacity',0.01);
	},
	fadeRenderIn: function (cb) {
		
		$('#maindiv')
		//.delay(450)
		.fadeTo("slow",1.0)
		.promise()
		.done(function() {
			if(snowUI.debug) snowLog.log('fadein') 
			if(cb)cb()
		});
	}, 
	loaderFetch: function(callback) {
		//get a new route
		var run = function() {
			$('#maindiv')
			.fadeTo(50,0.0)
			.promise()
			.done(function() {
				if(snowUI.debug) snowLog.log('fade out') 
				if(callback)callback()
			});
		}
		if($('.loader').css('display') !== 'none') {
			run()
		} else {
			$('.loader')
			.toggle(50)
			.promise()
			.done(function() {
				run()
				
			});
		}
		return false
	},
	loaderRender: function(callback) {
		//return a new route
		$('#maindiv')
		.fadeTo(50,1.0)
		.promise()
		.done(function() {
			if($('.loader').css('display') === 'none') {
				if(snowUI.debug) snowLog.log('fade in - loader already hidden') 
				if(callback)callback()
			} else {
				$('.loader')
				.toggle(50)
				.promise()
				.done(function() {
					if(snowUI.debug) snowLog.log('fade in') 
					if(callback)callback()
					//make sure that load is gone
					snowUI.killLoader()
				});
			}
		});
	
		return false
	},
	loadingStart: function(cb) {
		$('.loader')
		.toggle(true)
		//.delay(250)
		.promise()
		.done(function() {
			if(snowUI.debug) snowLog.log('show load gif') 
			if(cb)cb()
		});
		return false
	},
	loadingStop: function(cb) {
		$('.loader')
		//.delay(250)
		.toggle(false)
		.promise()
		.done(function() {
			if(snowUI.debug) snowLog.log('hide load gif') 
			if(cb)cb()
		});
		return false
	},
	killLoader: function(cb) {
		if($('.loader').css('display') !== 'none')$('.loader').hide()
		
		return false
	},
	_watching: false,
	watchLoader: function() {
		
		if(this._watching)clearTimeout(this._watching)
		
		this._watching = setTimeout(function() { snowUI.loaderRender() },750)
	},
	deleteWallet: function(e){
		
		
		var wallet = e.target.dataset.snowmoon
		if(!wallet) wallet = e.target.parentElement.dataset.snowmoon;
		
		if(snowUI.debug) snowLog.info(wallet,e.target)
		
		if(!wallet) {
			snowUI.flash('error','Can not find a link for the wallet requested',2500)
			return false
		}
		
		var url = "/api/snowcoins/local/remove-wallet"
		var data = {'action':'request',wally:wallet}
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.info(resp)
			if(resp.success === true) {			
				
				snowUI._wallets[wallet] = {removeKey: resp.key};
				snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + wallet + '/remove');
			
			} else {
				snowUI.loaderRender();
				if(resp.error)errorDiv.fadeIn().html(resp.error)
				snowUI.flash('error','Error receiving permissions',3000);
			}
		});
				
		
		return false;
	},
	ajax: {
		running: false,
		GET: function(url,data,callback) {
			snowUI.ajax._send('GET',url,data,callback)
		},
		request: function(url,data,callback) {
			this.GET(url,data,callback)
		},
		post: function(url,data,callback) {
			this.POST(url,data,callback)
		},
		POST: function(url,data,callback) {
			snowUI.ajax._send('POST',url,data,callback)
		},
		/* use call waiting if you want all requests to be ignored until you get a response
		 * does not block
		 * */
		callwaiting: function(type,url,data,callback) {
			if(!snowUI.ajax.running) snowUI.ajax.running = url
			snowUI.ajax._send(type,url,data,callback)
		},
		
		/* we do this so that we can use a nice ignore instead of an async block
		 * only use this method internally 
		 * */
		_send: function(type,url,data,callback) {
			if(!snowUI.ajax.running) {
				snowUI.ajax.forced(type,url,data,callback)
			} else {
				snowUI.flash('message','call in progress... ' + snowUI.ajax.running,2000)
			}
		},
		
		/* 
		 * sometimes you want to ignore the ignore
		 * hit forced directly to do so
		 * */
		forced: function(type,url,data,callback) {
			
			if(!type)var type = 'GET'
			
			$.ajax({type:type,url: url,data:data})
			.done(function( resp,status,xhr ) {
				
				snowUI._csrf = xhr.getResponseHeader("x-snow-token");
				snowUI.ajax.running = false
				if(snowUI.debug) snowLog.log(type + 'call return')
				callback(resp)	
			});					
				
		},
		
	},/*end ajax*/
	isArray: function(arr) {
		return (Object.prototype.toString.call(arr) === '[object Array]')
	},
	_sorted: [],
	sortCol: function(who)
	{
		return false
		if(snowUI.debug) snowLog.info('sort col',who,this._sorted)
		
		if(this._sorted.indexOf(who))
			return false;
		
		this._sorted.push(who)
		
		
		
	},
	comparer: function(index,who) {
		if($(who).hasClass("sortaccount")) {
			
				var valA = $(index).attr('data-snowaccount');
				var valB = $(who).attr('data-snowaccount');
				if(snowUI.debug) snowLog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).hasClass("sortbalance")) {
				
				var valA = $(index).attr('data-snowbalance');
				var valB = $(who).attr('data-snowbalance');
				if(snowUI.debug) snowLog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).hasClass("sortaddresses")) {
				var valA = $(index).find('.addresses .eachaddress').children().length-1;
				var valB = $(who).find('.addresses .eachaddress').children().length-1;
				if(snowUI.debug) snowLog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).is(".snowsortcountitems"))
			return function(a, b) {
				var valA = $(a).children('td').eq(index).children().length;
				var valB = $(b).children('td').eq(index).children().length;
				//console.log( " a : ", valA," b : ", valB);
				//var valA = getCellValue(a, index), valB = getCellValue(b, index)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).find("span").text()==='balance')
			return function(a, b) {
				var valA = snowUI.getCellValue(a, index).split(snowUI.methods.config.wally.coinstamp), valB = snowUI.getCellValue(b, index).split(snowUI.methods.config.wally.coinstamp);
				//console.log( " val : ", currentwally.coinstamp," valA : ", valA[0].replace(/,/g,''));
				return  parseFloat(valA[0].replace(/,/g,'')) - parseFloat(valB[0].replace(/,/g,'')) 
			}
		else if($(who).is(".snowsortisempty"))
			return function(a, b) {
				var valA = ($(a).children('td').eq(index).html().trim()==='')?0:1,
					valB = ($(b).children('td').eq(index).html().trim()==='')?0:1;
				//console.log( " a : ", valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).is(".snowsortdate"))
			return function(a, b) {
				var valA =  Date.parse($(a).children('td').eq(index).text().trim()),
					valB = Date.parse($(b).children('td').eq(index).text().trim());
				//console.log( " a : ",$(a).children('td').eq(index).text().trim(), valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}	
		else
			return function(a, b) {
				
				var valA = snowUI.getCellValue(a, index), valB = snowUI.getCellValue(b, index)
				//console.log( " a : ", valA," b : ", valB);
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
	},
	getCellValue: function(row, index) {
		 return $(row).children('td').eq(index).text() 
	},	
	isIP: function(num) {
		 var ary = num;
		 var ip = true;
		 
		 for (var i in ary) { ip = (!ary[i].match(/^\d{1,3}$/) || (Number(ary[i]) > 255)) ? false : ip; }
		 ip = (ary.length != 4) ? false : ip;

		 if (!ip) {    // the value is NOT a valid IP address
			return false;
		 } else { return true; } // the value IS a valid IP address
	},
	
}

		
	
	
snowUI.eggy = function(e) {
	var $navbarLogo = $('.walletbar-logo'),
	$easterEgg = $('#easter-egg'),
	$oldLogo = $('#old-logo');

	var hasOpened = false;
			
	if ($navbarLogo.hasClass('clicked')) {
		
		$navbarLogo.removeClass('clicked');
		
		$easterEgg.animate({ height: 0 }, 500, function() {
			
			//$easterEgg.css({ height: 0 });
		});
		
		
	} else {
		
		$navbarLogo.addClass('clicked');
		
		$easterEgg.show();
		
		var height = $easterEgg.height();
		
		$easterEgg.css({ height: 0 });
		
		$easterEgg.animate({ height: '400px' }, 500);
		
		if (!hasOpened) {
			hasOpened = true;
		} 
		
	}

}
	


/* form label click to focus */
$('label').click(function(){
	var name=this.htmlFor;
	//alert('input[name='+name+']');
	$('input[name='+name+']').focus();
	$('input#'+name).focus();
});

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
	var n = this,
	decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
	decSeparator = decSeparator === undefined ? "." : decSeparator,
	thouSeparator = thouSeparator === undefined ? "," : thouSeparator,
	sign = n < 0 ? "-" : "",
	i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
	j = (j = i.length) > 3 ? j % 3 : 0;
	return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "").replace(/\.?0+$/, "");
};
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */

/* you can use touch events
 * */
//React.initializeTouchEvents(true);

/* you can use animation and other transition goodies
 * */
snowUI.ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


/* bootstrap components
 * */
snowUI.Flash = ReactBootstrap.Alert;
snowUI.Btn = ReactBootstrap.Button;
snowUI.Button = snowUI.Btn;
snowUI.Modal = ReactBootstrap.Modal;
snowUI.OverlayMixin = ReactBootstrap.OverlayMixin;
snowUI.ButtonToolbar = ReactBootstrap.ButtonToolbar;

/* create the container object
 * */

/* create flash message 
 * */
snowUI.SnowpiFlash = React.createClass({displayName: 'SnowpiFlash',
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(snowUI.debug) snowLog.log(this.props);
		if(!this.state.isVisible)
		    return null;

		var message = this.props.message ? this.props.message : this.props.children;
		return (
		    snowUI.Flash({bsStyle: this.props.showclass, onDismiss: this.dismissFlash}, 
			React.DOM.p(null, message)
		    )
		);
	},
	
	dismissFlash: function() {
		this.setState({isVisible: false});
		
	}
});


/* my little man component
 * simple example
 * */
snowUI.SnowpiMan = React.createClass({displayName: 'SnowpiMan',
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    
	    return this.transferPropsTo(
		React.DOM.div({style: this.props.divstyle, dangerouslySetInnerHTML: {__html: snowUI.snowText.logoman}})
	    );
	}
});

/**
 * menu components
 * */
//main
snowUI.leftMenu = React.createClass({displayName: 'leftMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.router.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidMount: function() {
		$('.menufade').fadeTo(1000,1.0);
	},
	render: function() {
		var showmenu
		
		if(this.state.config.section === snowUI.snowPath.router.wallet) {
			
			if(this.state.config.wallet && this.state.config.wallet !== 'new')
				showmenu = snowUI.walletMenu 
			else
				showmenu = snowUI.defaultMenu
				
		} else if(this.state.config.section === snowUI.snowPath.router.receive || this.state.config.section === snowUI.snowPath.router.settings) {
			
			showmenu = snowUI.receiveMenu
			
		} else {
			
			showmenu = snowUI.defaultMenu
		}	
		
		if(snowUI.debug) snowLog.log('main menu component',this.state.config)
		
		return (
			React.DOM.div({className: "menufade"}, showmenu({config: this.state.config}), " ")			

		);
	}
});
//wallet menu
snowUI.walletMenu = React.createClass({displayName: 'walletMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.wallet,wallet:false,moon:false}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidUpdate: function() {
		$('.dogemenulink').removeClass('active');
		var moon = this.state.config.moon
		if(!moon && this.state.config.wallet !== 'new')moon = 'dashboard'
		$('.dogemenulink[data-snowmoon="'+moon+'"]').addClass('active');
	},
	componentDidMount: function() {
		this.componentDidUpdate()
		
	},
	menuClick: function(e) {
		
		e.preventDefault();
		
		var moon = $(e.target).parent()[0].dataset.snowmoon;
		
		if(moon !== undefined)
			snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.state.config.wallet + '/' + moon);
		else {
			
			var moon = $(e.target)[0].dataset.snowmoon;
			if(moon !== undefined) {
				snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.state.config.wallet + '/' + moon);
			} else {
				snowUI.flash('error','Link error',1000)
				
			}
			
		}
		
		
		
		return false
	},
	removeWallet: function(e){
		var _this = this	
		var url = "/api/snowcoins/local/remove-wallet"
		var data = {'action':'request',wally:_this.props.config.wally.key}
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowLog.info('remove wallet request from wallet menu',resp)
			if(resp.success === true) {			
				
				snowUI._wallets[_this.props.config.wally.key] = {removeKey: resp.key};
				snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + _this.props.config.wally.key + '/remove');
			
			} else {
				
				if(resp.error)errorDiv.fadeIn().html(resp.error)
				snowUI.flash('error','Error requesting to request to remove wallet',4000);
			}
		});
				
		
		return false;
	},
	render: function() {
		var testnet = this.state.config.testnet ? (React.DOM.div({id: "testnet-flash", title: "", 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body", className: "dogemenulink", 'data-original-title': "This wallet is on the TESTNET!", style: {display:'block'}}, React.DOM.span({className: "glyphicon glyphicon-text-width"}), " TESTNET ")) : ''
		
		var _this = this;
	    if(snowUI.debug) snowLog.log('wallet menu component')
	    return (
		
			React.DOM.div({id: "menuwallet "}, 
				testnet, 
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/dashboard', 'data-snowmoon': "dashboard", id: "dogedash", 'data-container': "#menuspy", className: "dogemenulink ", title: snowUI.snowText.menu.dashboard.title}, " ", React.DOM.span({className: "glyphicon glyphicon-th"}), " ", snowUI.snowText.menu.dashboard.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/accounts', 'data-snowmoon': "accounts", id: "dogeacc", 'data-container': "#menuspy", className: "dogemenulink", title: snowUI.snowText.menu.accounts.title}, " ", React.DOM.span({className: "glyphicon glyphicon-list"}), " ", snowUI.snowText.menu.accounts.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send', 'data-snowmoon': "send", id: "dogesend", 'data-container': "#menuspy", className: "dogemenulink", title: snowUI.snowText.menu.send.title}, " ", React.DOM.span({className: "glyphicon glyphicon-share"}), " ", snowUI.snowText.menu.send.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/transactions', 'data-snowmoon': "transactions", id: "dogetx", 'data-container': "#menuspy", className: "dogemenulink", title: snowUI.snowText.menu.tx.title}, " ", React.DOM.span({className: "glyphicon glyphicon-list-alt"}), " ", snowUI.snowText.menu.tx.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/update', 'data-snowmoon': "update", id: "dogeupdate", 'data-container': "#menuspy", className: "dogemenulink", title: snowUI.snowText.menu.update.title}, React.DOM.span({className: "glyphicon glyphicon-pencil"}), " ", snowUI.snowText.menu.update.name, " ", React.DOM.span({id: "updatecoinspan", style: {display:"none"}})), 
				
				React.DOM.a({onClick: this.removeWallet, 'data-snowmoon': "remove", id: "dogeremove", 'data-container': "#menuspy", className: "dogemenulink", title: snowUI.snowText.menu.remove.title}, React.DOM.span({className: "glyphicon glyphicon-trash"}), " ", snowUI.snowText.menu.remove.name, " ", React.DOM.span({id: "updatecoinspan", style: {display:"none"}}))
			)
				
		
	    );
	}
});
//main menu
snowUI.receiveMenu = React.createClass({displayName: 'receiveMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidUpdate: function() {
		$('.dogedccmenulink').removeClass('active');
		$('.dogedccmenulink[data-snowmoon="'+this.state.config.section+'"]').addClass('active');
	},
	render: function() {
	   
	    if(snowUI.debug) snowLog.log('receive menu component')
	    return (
		
			React.DOM.div({id: "menudcc"}, 
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet, 'data-snowmoon': snowUI.snowPath.router.wallet, id: "dogewallets", 'data-container': "#menuspy", className: "dogedccmenulink", title: snowUI.snowText.menu.left.wallet.title}, " ", React.DOM.span({onClick: this.menuClick, 'data-snowmoon': snowUI.snowPath.wallet, className: "glyphicon glyphicon-briefcase"}), " ", snowUI.snowText.menu.left.wallet.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.receive, 'data-snowmoon': snowUI.snowPath.router.receive, id: "dogedccsetup", 'data-container': "#menuspy", className: "dogedccmenulink", title: snowUI.snowText.menu.left.receive.title}, " ", React.DOM.span({onClick: this.menuClick, 'data-snowmoon': snowUI.snowPath.receive, className: "glyphicon glyphicon-tasks"}), " ", snowUI.snowText.menu.left.receive.name), 
				
				React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.settings, 'data-snowmoon': snowUI.snowPath.router.settings, id: "dogedccsettings", 'data-container': "#menuspy", className: "dogedccmenulink", title: snowUI.snowText.menu.left.settings.title}, " ", React.DOM.span({onClick: this.menuClick, 'data-snowmoon': snowUI.snowPath.settings, className: "glyphicon glyphicon-cog"}), " ", snowUI.snowText.menu.left.settings.name)
				
			)
				
		
	    );
	}
});
//default
snowUI.defaultMenu = snowUI.receiveMenu


//wallet select
snowUI.walletSelect = React.createClass({displayName: 'walletSelect',
	componentDidMount: function() {
		this.updateSelect();
	},
	componentDidUpdate: function() {
		this.updateSelect();
	},
	componentWillUpdate: function() {
		$("#walletselect").selectbox("detach");
	},
	updateSelect: function() {
		var _this = this
		$("#walletselect").selectbox({
			onChange: function (val, inst) {
				var config = snowUI.methods.config()
				if(val.charAt(0)==='/') {
					_this.props.route(val)	
				} else {
					if(!config.moon)config.moon = 'dashboard';
					_this.props.route(snowUI.snowPath.wallet + '/' + val + '/' + config.moon)
				}
			},
			effect: "fade"
		});
		//if(snowUI.debug) snowLog.log('wallet select updated')
	},
	render: function() {
		var wallets;
		if(this.props.wally instanceof Array) {
			var wallets = this.props.wally.map(function (w) {
				return (
					React.DOM.option({key:  w.key, value: w.key}, w.name)
				);
			});
		}
		if(this.props.section === snowUI.snowPath.router.wallet) {
			var _df = (this.props.wallet) ? this.props.wallet : snowUI.snowPath.root + snowUI.snowPath.wallet;
		} else {
			var _df = '/' + this.props.section;
		} 
		//if(snowUI.debug) snowLog.log(_df)
		return this.transferPropsTo(
			React.DOM.div({className: "list"}, 
				React.DOM.div({className: "walletmsg", style: {display:'none'}}), 
				React.DOM.select({onChange: this.props.route, id: "walletselect", value: _df}, 
					React.DOM.option({value: snowUI.snowPath.root + snowUI.snowPath.wallet}, snowUI.snowText.menu.selectWallet.name), 
					wallets, 
					React.DOM.optgroup(null), 
					React.DOM.option({value: snowUI.snowPath.wallet + '/new'}, snowUI.snowText.menu.plus.name), 
					React.DOM.option({value: snowUI.snowPath.receive}, snowUI.snowText.menu.receive.name), 
					React.DOM.option({value: snowUI.snowPath.settings}, snowUI.snowText.menu.settings.name), 
					React.DOM.option({value: snowUI.snowPath.link}, snowUI.snowText.menu.link.name)
				)
			)
		);
	}
});



snowUI.UI = React.createClass({displayName: 'UI',
	mixins: [React.addons.LinkedStateMixin],
	getDefaultProps: function() {
		return {
			section: snowUI.snowPath.router.wallet,
			moon:  false,
			wallet:  false,
			params: false,
		}
	},
	getInitialState: function() {
		/**
		 * initialize the app
		 * the plan is to keep only active references in root state.  
		 * we should use props for the fill outs
		 * */
		 var _this = this
		/* methods - the root is impled as UI but there is also a circle back
		 * create placeholders for each component that creates methods for better debugging
		 * */
		 snowUI.methods =  {
			ui: snowUI.methods,
			wallet: {},
			receive: {},
			settings: {},
			resetUI: _this.resetMe,
			hrefRoute: _this.hrefRoute,
			buttonRoute: _this.buttonRoute,
			valueRoute: _this.valueRoute,
			updateState: _this.updateState,
			resetWallets: _this.getWallets,
			togglePassFields: _this.togglePassFields,
			home: function() {_this.valueRoute(_this.props.section + this.props.wallet)},
			/*create an object */
			config: function(){ return _this.config.call(this) }.bind(_this),
			/*create an object */
			modals: snowUI.controllers.ui.modals.call(_this),
			forms: {
				passwordORnot: _this.passwordORnot,
			},
			
			/* statics dont have acccess to the UI Object unless binded with _this */
			removeRow: function(div,cb) {
				$(div).addClass('bg-danger').delay(2000).fadeOut("slow",function(){
					$(this).remove();
					if(typeof cb === 'function')cb()
				});
			},
			killLock: function(state) {
				clearInterval(snowUI.intervals.locktimer)
				snowUI.intervals.locktimer = false
				$('#walletbar').removeClass('flash-to-success')
				if(snowUI.debug) snowLog.log('reset lock status')
				if(state)_this.setState({locked:true,unlocked:false,lockstatus:0,unlockeduntil:false,unlockedtimeformat:false})
			},
			changelock: function(lock){
				/* lockstatus -- 0=encrypted,1=unlocked until unlockeduntil,2=not encrypted */
				var _this = this;
				$('#walletbar').removeClass('flash-to-success')
				if(lock==='off') {
					this.setState({locked:false,unlocked:true,lockstatus:3}) //fake the lock out and turn it off
				} else if(!this.state.wally || this.state.wally.coinapi!='rpc') {
					this.setState({locked:false,unlocked:false,lockstatus:2})
				} else if(lock===0 || lock==='Locked') {
					this.setState({locked:true,unlocked:false,lockstatus:0})
				}else if(lock>0) {
					
					var usetime=lock;
					var date = new Date(usetime);
					var long = lock - new Date().getTime()
					
					var hours = date.getHours(),minutes = date.getMinutes(),seconds = date.getSeconds();
					var formattedTime = hours + ':' + minutes + ':' + seconds;
					
					this.setState({locked:true,unlocked:true,lockstatus:1,unlockeduntil:lock,unlockedtimeformat:formattedTime})
					
					var i=0;
					timeout = Math.round(parseFloat(long) / 1000)
					
					var showTime = function(html) { $('.locktimer').html(html) }
					var walletbar = function(on) { if(on)$('#walletbar').addClass('flash-to-success'); else $('#walletbar').removeClass('flash-to-success') }
					
					snowUI.flash('success',_this.state.wally.name + ' unlocked for ' + timeout + ' seconds.',3000)
					walletbar(true)
					if(!snowUI.intervals.locktimer) {
						snowUI.intervals.locktimer = setInterval(function() {
							showTime(timeout - i)
							//snowUI.flash('success',_this.state.wally.name + ' unlocked for ' + (timeout - i) + ' seconds.','off')								
							
							if(i>=timeout) {
								clearInterval(snowUI.intervals.locktimer)
								snowUI.intervals.locktimer = false
								walletbar(false)
								if(snowUI.debug) snowLog.log('reset lock status')
								_this.setState({locked:true,unlocked:false,lockstatus:0,unlockeduntil:false,unlockedtimeformat:false})
							}
							i++;
						},1000)

					}
								
				} else {
					this.setState({locked:false,unlocked:false,lockstatus:2})
				}
			}.bind(_this),/*end changelock - binded to snowUI React component*/
		}
		return {
			section: 'wallet',
			moon:  false,
			wallet:  false,
			page: false,
			params: false,
			mywallets: [],
			locatewallet: [],
			mounted:false,
			wally:{},
			testnet: false,
			isSSL: false,
			locked: false,
			unlocked: false,
			lockstatus:3,
			requesting: false,
			modals: {
				unlockWallet: false,
				encryptWallet: false,
				removeItem: false,
				addressBook: false,
			},
			showPasswords: false,
			gates: {
				showErrorPage: false,
				showWarningPage: false,
				showInfoPage: false,
				showSuccessPage: false
			}
		};
	},
	//set up the config object
	config: function() {
		var _this = this
		if(this.state) {
			/* lets try and just pass arouns state. There is a redundency with snowUI.methods, but we need snowUI.methods */
			//return this.state
			return {
				section:_this.props.section,
				wallet:_this.props.wallet,
				page:_this.props.wallet,
				params:_this.props.params,
				moon:_this.props.moon,
				mywallets: _this.state.mywallets,
				locatewallet: _this.state.locatewallet,
				wally: _this.state.wally,
				testnet: _this.state.testnet,
				isSSL: _this.state.isSSL,
				locked: _this.state.locked,
				unlocked: _this.state.unlocked,
				lockstatus:_this.state.lockstatus,
				userSettings:_this.state.userSettings,
				snowbackupname: _this.state.snowbackupname,
				modals: _this.state.modals
			}
		}
	},
	componentWillMount: function() {
		//this.loadToggle()
		if(snowUI.debug) snowLog.log('ui will mount')
		//snowUI.loadingStart();
		return false
	},
	componentDidMount: function() {
		
		if(!this.state.mounted) {
			if(snowUI.debug) snowLog.log('ui is mounted')
			var update = {}
			if(this.props.section !== undefined)update.section = this.props.section;
			if(this.props.moon !== undefined)update.moon = this.props.moon;
			if(this.props.wallet !== undefined) {
				update.wallet = this.props.wallet;
				update.page = this.props.wallet;
			}
			if(this.props.params !== undefined)update.params = this.props.params;
			
			this.getWallets(this.props,update)			
		}
		$('.bstooltip').tooltip();
	},
	componentWillUpdate: function() {
		
		snowUI.methods.resetUI()
	},
	componentDidUpdate: function() {
		
		$('.bstooltip').tooltip();
	},
	getWallets: function (props,addstate) {
		
		//use a callback if it is last in argument list
		var args = Array.prototype.slice.call(arguments);
		var last = args[args.length-1];
		if(typeof last !== 'function')last = function(){ return true }
		
		var newState = (typeof addstate === 'object') ? addstate : {};
		
		//grab array of available wallets
			var _this = this
			if(snowUI.debug) snowLog.log('update wallet list on new wallet')			
			$.ajax({async:false,url: "/api/snowcoins/local/change-wallet"})
				.done(function( resp,status,xhr ) {
					
					snowUI._csrf = xhr.getResponseHeader("x-snow-token");
					if(snowUI.debug) snowLog.log('got wallies',resp.wally, props.wallet)
					
					//locater
					var a = []; 
					var ix = resp.wally.length;
					for(i=0;i<ix;i++) {
						a[i]=resp.wally[i].key
					}
							 
					if(props.wallet) {
						
						var newWally = resp.wally[a.indexOf(props.wallet)];
						if(!newWally) {
							
							newWally = {}
							var fname;
							
						} else {
							
							var date=new Date();
							var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
							
							var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+newWally.key+'.dat.bak';
							
						}
						
						newState.locatewallet = a;
						newState.mounted = true;
						newState.mywallets = resp.wally;
						newState.wally = newWally;
						newState.isSSL = newWally.isSSL;
						newState.snowbackupname = fname;
						
					
					} else {
						
						newState.locatewallet = a;
						newState.mounted = true;
						newState.mywallets = resp.wally;
					
					}
					newState.userSettings = resp.userSettings;
					if(snowUI.debug) snowLog.log('set ui state ',newState)
					_this.setState(newState);
					
					
			}.bind(this));
		//run callback	
		last()
		return true
	},
	componentWillReceiveProps: function(nextProps) {
		
		var update = {
			modals: {
				unlockWallet: false,
				encryptWallet: false,
			},
			gates: {
				showErrorPage: false,
				showWarningPage: false,
				showInfoPage: false,
				showSuccessPage: false
			}
		}
		
		if(nextProps.section !== undefined)update.section = nextProps.section;
		if(nextProps.moon !== undefined)update.moon = nextProps.moon;
		if(nextProps.wallet !== undefined) {
			update.wallet = nextProps.wallet;
			update.page = nextProps.wallet;
		}
		if(nextProps.params !== undefined)update.params = nextProps.params;
		
		//wallet list
		if(nextProps.mywallets)update.mywallets = nextProps.mywallets;		
		
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
		
		/* this is for wallet.  I wanted to move it to Wallet, 
		* but to many state changes affect the base UI,
		* so it seems easier to keep all of our info here
		* */
		if(nextProps.section === snowUI.snowPath.router.wallet && nextProps.wallet && nextProps.wallet !== undefined) {
			if(nextProps.wallet === 'new') {
				
				//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				
				update.wally = {};
				update.isSSL = false;
				update.lockstatus = 3;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
				
			} else if(nextProps.wallet !== this.state.wallet) {
				
				if(snowUI.debug) snowLog.log('should be a new wallet',nextProps.wallet ,this.state.wallet)
				
				React.unmountComponentAtNode(document.getElementById('snowcoins'));
				
				var newWally = this.state.mywallets[this.state.locatewallet.indexOf(nextProps.wallet)];
				
				update.wally = newWally;
				update.isSSL = newWally.isSSL
				update.lockstatus=3;
				update.unlockeduntil=false;
				update.unlockedtimeformat=false;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
				
				//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				update.snowbackupname = y+''+m+''+d+''+h+''+min+''+s+'.'+newWally.key+'.dat.bak';	
				
				 
							
			} else {
				
				update.snowbackupname = y+''+m+''+d+''+h+''+min+''+s+'.'+this.state.wally.key+'.dat.bak';
				
			}
			
			
			
			
		} else {
			//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				
				update.wally = {};
				update.isSSL = false;
				update.lockstatus = 3;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
		}
		
		//error pages
		update.showErrorPage = (nextProps.showErrorPage !== undefined) ? nextProps.showErrorPage : false;
		
		update.requesting = false;
		
		if(snowUI.debug) snowLog.log('ui get props update state',update)
		
		/* this is a grabber for the wallets
		 * I let it run on every page change in case changes are made outside of this session
		 * but it really only needs to run for the wallet section
		 * if(nextProps.section === snowUI.snowPath.router.wallet && nextProps.wallet !== this.state.wallet)
		 * */
		if(nextProps.wallet !== this.state.wallet)
			this.getWallets(nextProps,update)
		else
			this.setState(update);
		
		return false
		
	},
	
	updateState: function(prop) {
		if(typeof prop === 'object')
			this.setState(prop);
		if(snowUI.debug) snowLog.log('update state from outside/child component',prop)	
		return false
	},
	changeTheme: function() {
		
		var mbody = $('body');
		if(mbody.hasClass('themeable-snowcoinslight')==true) {
			mbody.removeClass('themeable-snowcoinslight');
			var theme = 'snowcoins dark'
		} else {
			mbody.addClass('themeable-snowcoinslight');
			var theme = 'snowcoins light'
		}
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:'setusersettings',newsettings:JSON.stringify({'theme':theme})};
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowLog.info('set user theme')
				
			} else {
				if(snowUI.debug) snowLog.error(resp)
				
			}
			return false
		})
		
		
	},
	valueRoute: function(route,options) {
		if(typeof options === 'object') {
			var skipload = options.skipload,
				trigger = options.trigger === 'undefined' ? true:options.trigger
		} else {
			var skipload = options,
				trigger = true
		}
		if(skipload) {
			bone.router.navigate(route, {trigger:trigger});
		} else {
			snowUI.loaderFetch(function(){
				bone.router.navigate(route, {trigger:trigger});
			});
		}
		if(snowUI.debug) snowLog.log('value route', 'skip loading: '+skipload+', trigger: '+trigger,snowUI.snowPath.root + route)
		return false
	},
	hrefRoute: function(route) {
		route.preventDefault();
		var _this = this
		var newroute = $(route.target)	
		snowUI.loaderFetch(function(){
			if(snowUI.debug) snowLog.log('href loader route',snowUI.snowPath.root,newroute)
			var moon =  newroute[0] ? newroute.closest('a')[0].pathname : false
			if(moon) {
				moon = moon.replace(("/" + snowUI.snowPath.router.root + "/"),'')
				if(snowUI.debug) snowLog.log('moon owner',moon)
				bone.router.navigate(moon, {trigger:true});
			} else {
				snowUI.flash('error','Link error',2000)
				_this.setState({showErrorPage:false}); //this is a quick way to rerender the page since we are mid laod
			}
			
		});
		
		
		return false
	},
	buttonRoute: function(route) {
		route.preventDefault();
		snowUI.loaderFetch(function(){
			bone.router.navigate(snowUI.snowPath.root + $(route.target)[0].dataset.snowmoon, {trigger:true});
			if(snowUI.debug) snowLog.log('button route',$(route.target)[0].dataset.snowmoon)

		});
		return false
	},
	eggy: function() {
		
		snowUI.eggy();
	},
	togglePassFields: function() {
		this.setState({showPasswords:!this.state.showPasswords})
	},
	passwordORnot: function() {
		if(this.state.showPasswords)
			return "text"
		else
			return "password"
	},
	resetMe: function() {
		
		//clean up from previous renders
		$('#walletbar').removeClass('bg-danger');
		$('body').find('[rel=popover]').popover('destroy');
		
	},
	render: function() {
		
		//set up our psuedo routes
		var comp = {}
		comp[snowUI.snowPath.router.wallet]=snowUI.wallet.UI;
		comp[snowUI.snowPath.router.receive]=snowUI.receive.UI;
		comp[snowUI.snowPath.router.settings]=snowUI.settings.UI;
		comp[snowUI.snowPath.router.inq]=snowUI.link.UI;
		
		var gates = this.state.gates
		
		var mycomp = comp[this.props.section]
		if(!mycomp){
			if(snowUI.debug) snowLog.info(' mycomp failed, probably a 404:',this.props.section,mycomp,comp[this.props.section])
			mycomp=snowUI.wallet.UI
			gates.showWarning = '404 Not Found';
			gates.showWarningPage = true;
		}
		
		if(snowUI.debug) snowLog.log('check state UI',this.state.mounted,mycomp,this.props.section,gates);
		
		if(this.state.mounted) {
			var mountwallet = function() {
				return (snowUI.walletSelect({route: this.valueRoute, section: this.props.section, wallet: this.props.wallet, wally: this.state.mywallets}))
			}.bind(this)
			var mountpages = function() {
				return (mycomp({methods: snowUI.methods, config: this.config(), gates: gates}))
			}.bind(this)
			
		} else {
			var mountwallet = function(){};
			var mountpages = function(){};
		}
		
		var ssl = this.props.wallet && this.state.isSSL ? {display:'block'} : {display:'none'}
		
		var lockedwallet = this.props.wallet &&  this.state.locked && !this.state.unlocked ? "pointer  bstooltip fade in active" : "pointer hidden bstooltip fade out"
		var openwallet = this.state.lockstatus === 2 || this.state.lockstatus === 1  ? "pointer bstooltip  fade in active" : "pointer  bstooltip hidden  fade out"
		var unlockedwallet = this.props.wallet &&  this.state.unlocked ? "locktimer pointer  bstooltip  fade in active" : "pointer hidden bstooltip  fade out"
		
		var testnet = this.state.testnet ? 'testnet':''
		
		if(snowUI.debug) snowLog.log('testnet',this.state.testnet)
		  	
		//mount
		return (
			React.DOM.div({id: "snowpi-body"}, 
				React.DOM.div({id: "walletbarspyhelper", style: {display:'block'}}), 
				React.DOM.div({id: "walletbar", className: "walletbar affix"}, 
					  React.DOM.div({className: "wallet"}, 
						React.DOM.div({className: "button-group"}, 
							snowUI.Btn({bsStyle: "link", 'data-toggle': "dropdown", className: "dropdown-toggle"}, snowUI.snowText.menu.menu.name), 
							React.DOM.ul({className: "dropdown-menu", role: "menu"}, 
												
								React.DOM.li({className: "nav-item-home"}, " ", React.DOM.a({onClick: this.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet}, snowUI.snowText.menu.list.name)), 
								React.DOM.li({className: "nav-item-receive"}, React.DOM.a({onClick: this.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.receive, title: snowUI.snowText.menu.receive.title}, snowUI.snowText.menu.receive.name)), 
								React.DOM.li({className: "nav-item-add"}, " ", React.DOM.a({onClick: this.hrefRoute, href: snowUI.snowPath.wallet + '/new'}, snowUI.snowText.menu.plus.name)), 
								React.DOM.li({className: "nav-item-settings"}, React.DOM.a({onClick: this.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.settings, title: snowUI.snowText.menu.settings.title}, snowUI.snowText.menu.settings.name)), 
								
								React.DOM.li({className: "divider"}), 
								React.DOM.li({className: "nav-item-settings"}, React.DOM.a({onClick: this.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.settings + '/language', title: snowUI.snowLanguages.mylanguage}, snowUI.snowLanguages.mylanguage)), 
								React.DOM.li({className: "divider"}), 
								React.DOM.li({className: "nav-item-settings"}, React.DOM.div(null, React.DOM.div({className: "walletmenuspan"}, snowUI.snowcat), React.DOM.div({className: "clearfix"}), " ")), 
								React.DOM.li({className: "divider"}), 
								React.DOM.li(null, 
									React.DOM.div(null, 
										React.DOM.div({onClick: this.changeTheme, className: "walletmenuspan changetheme ", title: "Switch between the light and dark theme", 'data-toggle': "", 'data-placement': "bottom", 'data-container': "body", 'data-trigger': "hover focus", style: {cursor:'pointer'}}, React.DOM.span({className: "glyphicon glyphicon-adjust"})), 
										React.DOM.div({className: "walletmenuspan ", title: ".link", 'data-toggle': "", 'data-placement': "bottom", 'data-container': "body", 'data-trigger': "hover focus"}, " ", React.DOM.a({onClick: this.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.inq}, React.DOM.span({className: "glyphicon glyphicon-globe"}))), 
										React.DOM.div({className: "walletmenuspan ", title: "Logout", 'data-toggle': "", 'data-placement': "right", 'data-container': "body", 'data-trigger': "hover focus"}, " ", React.DOM.a({href: "/snowout"}, " ", React.DOM.span({className: "glyphicon glyphicon-log-out"}))), 
										React.DOM.div({className: "clearfix"})
									)
								)
								
							)
						)
					), 
					
					
					mountwallet(), 
					
					
					
					React.DOM.div({onClick: snowUI.methods.modals.open.unlockWallet, className: lockedwallet, id: "wallet-lock", 'data-toggle': "tooltip", 'data-placement': "bottom", alt: "Wallet is encrypted and locked", title: "Wallet is encrypted and locked"}), 
					
					React.DOM.div({onClick: snowUI.methods.modals.open.encryptWallet, className: openwallet, id: "wallet-unlock", snowlink: "dashboard", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "You should encrypt this wallet soon.  Coins can be sent from your wallet without supplying a passphrase first."}), 
					
					React.DOM.div({className: unlockedwallet, id: "wallet-unlocked", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "Wallet is unlocked and capable of sending coin."}), 
					
					React.DOM.div({style: ssl, id: "wallet-ssl", 'data-toggle': "tooltip", 'data-placement': "bottom", alt: "ssl connection", className: " bstooltip", title: "SSL Connection to wallet"}, React.DOM.span({className: "glyphicon glyphicon-link"})), 
					
					
					React.DOM.div({className: "logo", onClick: this.eggy}, React.DOM.a({title: "inquisive.io snowcoins build info", 'data-container': "body", 'data-placement': "bottom", 'data-toggle': "tooltip", className: "walletbar-logo"}))
					
				), 
				React.DOM.div({className: "container-fluid"}, 
					React.DOM.div({id: "menuspy ", className: "affix dogemenu col-xs-1 col-md-2 " + testnet}, 
						snowUI.leftMenu({config: this.config()})
					), 
					
					React.DOM.div({className: "dogeboard col-xs-offset-1 col-xs-11 col-md-offset-2 col-md-10"}, 
						snowUI.AppInfo(null), 
						React.DOM.div({className: "dogeboard-left col-xs-12 col-md-12"}, 
							React.DOM.div({className: "content"}, " ", mountpages(), " ")
						)
					)
				), 
			/* add the modals */	
			snowUI.snowModals.unlockWallet.call(this), 
			snowUI.snowModals.encryptWallet.call(this)
				
			/* end snowpi-body */
			)
		)
	}
});

//app info
snowUI.AppInfo = React.createClass({displayName: 'AppInfo',
	render: function() {
		return (
			React.DOM.div({id: "easter-egg", style: {display:'none'}}, 
				React.DOM.div(null, 
				React.DOM.div({className: "blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, 
				  
				  React.DOM.h4(null, "Get Wallet Manager"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, React.DOM.a({href: "https://github.com/inquisive/wallets", target: "_blank"}, "GitHub / Installation")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, React.DOM.a({href: "https://www.npmjs.com/package/wallets", target: "_blank"}, "NPM")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, " ", React.DOM.a({href: "https://github.com/inquisive/wallets/latest.zip", target: "_blank"}, "Download zip"), " | ", React.DOM.a({href: "https://github.com/snowkeeper/snowcoins/latest.tar.gz", target: "_blank"}, "Download gz"))
				  ), 
				  React.DOM.div({style: {borderBottom:'transparent 15px solid'}}), 
				  React.DOM.h4(null, "Built With"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://nodejs.org", target: "_blank"}, "nodejs")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://keystonejs.com", target: "_blank"}, "KeystoneJS")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://getbootstrap.com/", target: "_blank"}, "Bootstrap")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "https://github.com/countable/node-dogecoin", target: "_blank"}, "node-dogecoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://mongoosejs.com/", target: "_blank"}, "mongoose"))
				  )
				 
				), 
				React.DOM.div({className: "blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, 
				   React.DOM.h4(null, "Share"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({title: "snowcoins.link/.snowcoins.donate", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, " ", React.DOM.a({href: "https://snowcoins.link/.snowcoins", target: "_blank"}, ".snowcoins.share"))
				  ), 
				  React.DOM.div({style: {borderBottom:'transparent 15px solid'}}), 
				  React.DOM.h4(null, "Digital Coin Wallets"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://dogecoin.com", target: "_blank"}, "dogecoin")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://bitcoin.org", target: "_blank"}, "bitcoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://litecoin.org", target: "_blank"}, "litecoin")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://vertcoin.org", target: "_blank"}, "vertcoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://octocoin.org", target: "_blank"}, "888")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://auroracoin.org", target: "_blank"}, "auroracoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://blackcoin.co", target: "_blank"}, "blackcoin")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://digibyte.co", target: "_blank"}, "digibyte")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://digitalcoin.co", target: "_blank"}, "digitalcoin")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://darkcoin.io", target: "_blank"}, "darkcoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://maxcoin.co.uk", target: "_blank"}, "maxcoin")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://mintcoin.co", target: "_blank"}, "mintcoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "http://einsteinium.org", target: "_blank"}, "einsteinium")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://peercoin.net", target: "_blank"}, "peercoin "))
				  ), 
				  React.DOM.div({className: "row"}
				  )
				), 
				React.DOM.div({className: "clearfix"})
			      )
			)
		);
	}
});


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */



// Our custom component is managing whether the Modal is visible
snowUI.addModal = React.createClass({displayName: 'addModal',
	mixins: [snowUI.OverlayMixin], 

	getInitialState: function () {
		return {
			isModalOpen: this.props.open || false
		};
	},
	componentDidMount: function() {
		
	},
	componentDidUpdate: function() {
		
		
	},
	componentWillUpdate: function() {
		
	},
	componentWillUnmount: function() {
		
	},
	componentWillReceiveProps: function(np) {
		this.setState({isModalOpen:np.open})
		
	},
	handleToggle: function () {
		this.setState({
			isModalOpen: !this.state.isModalOpen
		});
		
		if(this.props.close) {
			this.props.close()
		} else {
			snowUI.methods.modals.close(this.props.me)
		}
	},

	render: function () {
		
		return (
			React.DOM.span(null)
		);
	},

	// This is called by the `snowUI.OverlayMixin` when this component
	// is mounted or updated and the return value is appended to the body.
	renderOverlay: function () {
		if (!this.state.isModalOpen) {
			
			return React.DOM.span(null);
		}
		var foot = (
			React.DOM.div(null, 
				React.DOM.div({className: "pull-left"}, 
					this.props.buttons
				), 
				React.DOM.div({className: "pull-right"}, 
					snowUI.Button({bsStyle: "default", onClick: this.handleToggle}, "Cancel")
				)
			)
		)
		return (
			snowUI.Modal({title: this.props.title, onRequestHide: this.handleToggle}, 
				React.DOM.div({className: "modal-body"}, 
					this.props.children
				), 
				React.DOM.div({className: "modal-footer"}, 
					 this.props.footer ? React.DOM.div({className: "clearfix"}, React.DOM.p(null, "  ", this.props.footer, " "), " ") : '', 
					!this.props.hideFooter ? foot : ''
					
				)
			)
		);
	}
});


/**
 * Our controllers are always functions and must be included as a method 
 * 
 * you must apply SCOPE (apply/call) to any method generated from a controller
 * 
 * the modals get included in UI intialState
 * 
 * Use snowUI.methods.modals.encryptWallet.open.call(this)
 * 
 * You CAN NOT access these methods directly...
 * 
 * */		 

snowUI.controllers.ui.modals = function() {
	var _this = this;
	return {
		/* each modal has its own methods */
		addressBook: {
			open: function() {
				var modals = _this.state.modals;
				modals.addressBook = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('addressBook')
			},
				
		},
		genericModal: {
			open: function() {
				var modals = _this.state.modals;
				modals.genericModal = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('genericModal')
			},
				
		},		
		removeItem: {
			open: function() {
				var modals = _this.state.modals;
				modals.removeItem = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('removeItem')
			},
				
		},
		encryptWallet: {
			open: function() {
				var modals = _this.state.modals;
				modals.encryptWallet = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('encryptWallet')
			},
				
		},
		unlockWallet: {
			open: function() {
				var modals = _this.state.modals;
				modals.unlockWallet = true;
				_this.setState({modals:modals,unlockphrase:''});
			},
			close: function() {
				
				snowUI.methods.modals.close('unlockWallet')
			},
			request: function(e) {
				e.preventDefault();
				
				_this.setState({requesting:true});
				if(snowUI.debug) snowLog.log('unlock wallet',snowUI.methods)
				if(_this.state.unlockphrase)
				{
					var nowtime=new Date().getTime()
					var url = "/api/snowcoins/local/gated"
					var timeout = _this.refs.unlocktime.getDOMNode().value.trim()
					var data = { checkauth:nowtime,wallet: _this.props.wallet,command:'unlock',passphrase:_this.state.unlockphrase,timeout:timeout}
					var errorDiv = $(_this.refs.unlocktime.getDOMNode()).parent().parent().find('.adderror')
					
					errorDiv.fadeOut()
					
					snowUI.ajax.GET(url,data,function(resp) {
						if(resp.success === true) {							
							var tt=(new Date().getTime());
							snowUI.methods.changelock(Math.floor(tt+timeout*1000));
							snowUI.methods.modals.unlockWallet.close()
							$('#unlockphrase').val('');
						} else {
							snowUI.flash('error',resp.error,3500)
							errorDiv.fadeIn().html(resp.error);
							_this.setState({requesting:false});
							//snowUI.methods.updateState({connectError:true})
						}
					})
					
				}
				
			}
			
		},
		close: function(me) {
			
			if(_this.state.modals[me]) {
				var modals = _this.state.modals;
				modals[me] = false;
				_this.setState({requesting:false,modals:modals,unlockphrase:''})
				
			} else {
				_this.setState({requesting:false,unlockphrase:'',modals: {
					unlockWallet: false,
					encryptWallet: false,
					removeItem: false,
					genericModal: false,
					addressBook: false,
					
				}});
			}
		},
		/* moved these so set some pointers.  
		 * someone could clean this up by changing calls in UI and Wallet 
		 * */
		open: {
			encryptWallet: function() {
				return snowUI.methods.modals.encryptWallet.open.call(this)
			},
			unlockWallet: function() {
				return snowUI.methods.modals.unlockWallet.open.call(this)
				
			},
			
		}
	}
}

/* end controllers */

/**
 * all of our modals are defined here.  call them with the function() 
 * */
snowUI.snowModals = {}

snowUI.snowModals.unlockWallet = function() {
	var uButtons = React.DOM.button({onClick: snowUI.methods.modals.unlockWallet.request, disabled: !this.state.unlockphrase || this.state.requesting ? 'disabled' : '', id: "confirmunlock", className: "btn btn-warning", rel: "modal"}, this.state.requesting ? 'Unlocking...' : 'Unlock Wallet')
	if(snowUI.debug) snowLog.log('unlock wallet',this.state)
	var toggle = this.state.showPasswords ? snowUI.snowText.ui.hidepassphrase : snowUI.snowText.ui.showpassphrase;
	return (snowUI.addModal({me: "unlockWallet", methods: {}, open: this.state.modals.unlockWallet, title: "Unlock " + this.state.wally.name, buttons: uButtons}, 
			React.DOM.div(null, 
				
					React.DOM.div({style: {display:'none'}, className: "adderror"}), 
					React.DOM.p(null, "Please unlock your wallet to continue."), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Timeout (sec)"), 
						React.DOM.select({id: "unlocktime", ref: "unlocktime", className: "form-control coinstamp col-md-4"}, 
						React.DOM.option({value: "5"}, "5"), 
						React.DOM.option({value: "15"}, "15"), 
						React.DOM.option({value: "30"}, "30"), 
						React.DOM.option({value: "45"}, "45"), 
						React.DOM.option({value: "60"}, "60"), 
						React.DOM.option({value: "120"}, "120"), 
						React.DOM.option({value: "180"}, "180"), 
						React.DOM.option({value: "300"}, "300")
						)
					), 
					React.DOM.div({className: !this.state.unlockphrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Pass Phrase"), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "unlockphrase", ref: "unlockphrase", placeholder: "enter pass phrase", className: "form-control coinstamp", valueLink: this.linkState('unlockphrase')})
					), 
					React.DOM.p({style: {textAlign:'right'}}, React.DOM.a({onClick: this.togglePassFields}, " ", toggle, " "))
				
			)
		) )
}


snowUI.snowModals.encryptWallet = function() {
	var _this = this
	
	var config = _this.config()
	if(snowUI.debug) snowLog.log('config in encrypt wallet',config)
	if(!config.locked) {
		var eButtons = (
				snowUI.ButtonToolbar(null, 
				React.DOM.button({id: "confirmencryptbackup", onClick: function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/passphrase')}, className: "btn btn-warning pull-right"}, snowUI.snowText.modals.encrypt.buttons.encrypt), 
				React.DOM.button({className: "btn btn-info backupwalletbutton  pull-right", onClick: function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/backup')}}, React.DOM.span(null, snowUI.snowText.modals.encrypt.buttons.backup))
				)
		)
		var text = (React.DOM.div({id: "encryptwalletbackupfirst", dangerouslySetInnerHTML: {__html: snowUI.snowText.modals.encrypt.notlocked.text}}))
		
	} else {
		var eButtons = (
				snowUI.ButtonToolbar(null, 
				React.DOM.button({className: "btn btn-info backupwalletbutton  pull-right", onClick: function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/backup')}}, React.DOM.span(null, snowUI.snowText.modals.encrypt.buttons.backup))
				)
		)
		var text = (React.DOM.div({id: "encryptwalletbackupfirst", dangerouslySetInnerHTML: {__html: snowUI.snowText.modals.encrypt.locked.text}}))
	}
	return (snowUI.addModal({me: "encryptWallet", methods: {}, buttons: eButtons, open: this.state.modals.encryptWallet, title: "Encrypt " + this.state.wally.name}, 
		text			
		
	))
		
}

snowUI.snowModals.genericModal = function(conf,close) {
	var _this = this,
		config = conf.modal;
	
	if(!config.confirm)config.confirm = 'Confirm';
	
	var eButtons = (
			snowUI.ButtonToolbar(null, 
			React.DOM.button({onClick: config.click, id: "removegenericmodalbutton", className: "btn " + config.btnClass, rel: "modal"}, config.confirm, " ")
			
			)
		)
		return (snowUI.addModal({me: "generic", methods: {close:close}, buttons: eButtons, open: this.state.genericModal, title: config.title}, 
						
			React.DOM.div(null, 
				React.DOM.div({dangerouslySetInnerHTML: {__html: config.body}})
			)
		))
		
}


snowUI.snowModals.removeItem = function(click,close) {
	var _this = this
	var eButtons = (
			snowUI.ButtonToolbar(null, 
			React.DOM.button({onClick: click, 'data-snowdata': this.state.id, id: "removedynamicmodalbutton", className: "btn btn-danger", rel: "modal"}, "Permanently Remove Item Now ")
			)
		)
		return (snowUI.addModal({me: "removeDynamic", methods: {close:close}, buttons: eButtons, open: this.state.removeItem, title: "Remove Item "}, 
						
			React.DOM.div({id: "removemenow"}, 
				React.DOM.p({style: {fontWeight:'bold'}}, " This action is permanent  "), 
				React.DOM.p(null, 
					"Do you want to continue and remove ", this.state.getIden(), "?"
				)
				
				
				
			)
		))
		
}


snowUI.snowModals.addressBook = function() {
	var _this = this;
	return (snowUI.addModal({me: "addressBook", open: this.props.config.modals.addressBook, title: "Saved Addresses "}, 
			React.DOM.div({dangerouslySetInnerHTML: {__html: this.state.addressBookHtml}})
			
		))
		
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */

/**
 * receive components
 * */
//main
snowUI.receive.UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		return ({
			dynamic:'active in',
			static:'',
			keys:'',
			trackers:'',
			component: 'shortcuts',
			connecting:true,
			error: false,
			message: false,
			data:false
		})
	},
	getFalseState: function() {
		return ({
			dynamic:'',
			static:'',
			keys:'',
			trackers:'',
			data: false
			
		})
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.log('receive willgetprops')
		var _state = this.getFalseState();
		var page = nextProps.config.page || this.state.component
			
		_state[page] = 'in active'
		_state.component = page
		this.setState(_state)
		if(snowUI.debug) snowLog.log('receive willgetprops','false state:',_state,nextProps)
		/* now get our data */
		this.getPage(page)
		
		
	},
	getPage: function(page) {
		if(!page)page = this.state.component
		
		var _this = this,
			url = "/api/snowcoins/local/receive/setup",
			data = {page:page},
			po = page;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				if(resp.ip && resp.ip!='')snowUI.myip=resp.ip;
				_this.setState({data:resp.data,connecting:false})
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('receive did update')
	},
	componentWillMount: function() {
		//$('body').find('[rel=popover]').popover('destroy');
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('receive did mount')
		var me = $('a[data-target="'+this.props.config.page+'"]')
		me.tab('show')	
	},
	changeTab: function(e) {
		var me = $(e.target);
		var them = $('.tab-pane');
		var options = {
			skipload:false,
			trigger:true
		}
		if(snowUI.debug) snowLog.info(me,them)
		me.tab('show')
		snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		
		
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		if(snowUI.debug) snowLog.log('receive component',this.state)
		
		if(this.state.error ) {
			
			 renderMe = (snowUI.wallet.displayMessage({message: this.state.message, type: "warning"}))
			
			
		} else if(!this.state.data) {
			if(snowUI.debug) snowLog.warn('empty render for receive')
			
		
		} else if(snowUI.receive[showcomp]) {
			
			var po = snowUI.receive[showcomp]
			renderMe = (po({config: this.props.config, state: this.state}))
		
		} else {
			
			renderMe = (snowUI.wallet.displayMessage({title: "404 Not Found", message: "I could not find the page you are looking for. ", type: "requesterror"}))
			 
		}     
		
	    return (
		
		React.DOM.div({className: "snow-body-receive"}, 
			React.DOM.div({id: "snow-receive", className: " snow-send snow-receive  snow-dccsetup"}, 
				React.DOM.div({id: "prettysuccess", style: {display:'none'}}, 
					React.DOM.div({className: "alert alert-success alert-dismissable"}, 
						React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
						React.DOM.p(null)
					)
				), 
				React.DOM.div({id: "prettyerror", style: {display:'none'}}, 
					React.DOM.div({className: "alert alert-danger alert-dismissable"}, 
						React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
						React.DOM.p(null)
					)
				), 
				React.DOM.nav({role: "navigation", className: "navbar navbar-inverse"}, 
					React.DOM.div({className: "navbar-header shortmenu"}, 
						React.DOM.button({style: {marginLeft:8,float:'left'}, type: "button", 'data-toggle': "collapse", 'data-target': ".navbar-dccnav-collapse", className: "navbar-toggle navbar-toggle-menu navbar-toggle-right"}, React.DOM.span({className: "sr-only"}, "Toggle navigation"), React.DOM.span({className: "icon-bar"}), React.DOM.span({className: "icon-bar"}), React.DOM.span({className: "icon-bar"})
						), 
						React.DOM.div({style: {float:'left'}, className: "shortmenu-text navbar-toggle"}, this.props.config.wallet)
					), 
					React.DOM.div({className: "collapse navbar-collapse navbar-dccnav-collapse"}, 
						React.DOM.ul({className: "nav navbar-nav dccnavlis", role: "tablist", 'data-tabs': "tabs"}, 
							
							React.DOM.li({className: "active"}, React.DOM.a({'data-target': "shortcuts", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowUI.snowText.receive.tabs.static.text)), 
							React.DOM.li(null, React.DOM.a({onClick: this.changeTab, 'data-target': "dynamic", role: "tab", 'data-toggle': "tab", id: "lidynamic"}, snowUI.snowText.receive.tabs.dynamic.text)), 
							React.DOM.li(null, React.DOM.a({'data-target': "keys", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowUI.snowText.receive.tabs.keys.text)), 
							React.DOM.li(null, React.DOM.a({id: "litrackers", 'data-target': "trackers", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowUI.snowText.receive.tabs.trackers.text)), 

							React.DOM.li(null, React.DOM.a({onClick: function(){ return location.reload()}}, React.DOM.span({className: "glyphicon glyphicon-refresh"})))
						)
					)
				), 

				React.DOM.div({style: {padding:'20px 10px 0 10px'}, className: "tabbox clearfix tab-content ", id: "maindiv"}, 
				
				
					renderMe
				), 
				React.DOM.div({className: "clearfix"})
			)		
		)
	    )
	}
});


//dynamic component
snowUI.receive.dynamic = React.createClass({displayName: 'dynamic',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('dynamic did update')
		this.listen()
		snowUI.watchLoader();
		
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		snowUI.watchLoader();
		this.listen()
	},
	listen: function() {
		$("#dccadddynamic #receivertype").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#dccadddynamic #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dccadddynamic #dccaddwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
							//console.log(data);
							//_csrf = xhr.getResponseHeader("x-snow-token");
							var re = $.ui.autocomplete.escapeRegex(req.term);
							console.log(re);
							var matcher = new RegExp( re, "i" );
							response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$('#addreceiverformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#addreceiveraccount').fadeIn();
			else $('#addreceiveraccount').fadeOut();
		});
		
	},
	submitForm: function(e) {
		if(snowUI.debug) snowLog.info('submit dynamic add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var addw=this.refs.dccaddwallet.getDOMNode().value.trim(),
			useme=this.refs.useme.getDOMNode().value.trim(),
			name=this.refs.name.getDOMNode().value.trim(),
			address=this.refs.address.getDOMNode().value.trim(),
			next = true;
		
		if(name==='') {
			
			$(this.refs.name.getDOMNode()).parent().addClass('has-error');
			next=false;
			
		} else $(this.refs.name.getDOMNode()).parent().removeClass('has-error');
			
		if (addw==='Select A Wallet' && useme==='TABwallet') {
			
			$("#maindiv #dccaddwallet").parent().addClass('has-error');
			next = false
			
		} else $("#maindiv #dccaddwallet").parent().removeClass('has-error');
		
		if (useme==='TABaddress' && address==='') {
			
			$("#maindiv #address").parent().addClass('has-error');
			next = false
			
		} else $("#maindiv #address").parent().removeClass('has-error');
		
		if(next===false) {
			
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
			
		} else {
			
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dccadddynamic" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Dynamic receiver added',2500)
					this.setState({requesting:false});
				
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('opem remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' dynamic receiver ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete',wally:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
	
					snowUI.flash('success','Dynamic receiver removed',2500)
				
				} else {
					if(snowUI.debug) snowLog.error(resp)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		if(snowUI.debug) snowLog.log('dynamic component', this.props)
		
		var text = snowUI.snowText.receive.dynamic,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", val.coin, " "), 
						React.DOM.td(null, " ", val.name, " "), 
						React.DOM.td(null, " ", val.wallet ? val.wallet.name : '--', " "), 
						React.DOM.td(null, " ", val.confirmations, " "), 
						React.DOM.td(null, " ", val.account || '--', "  "), 
						React.DOM.td(null, " ", val.address || '--', "  ")
					)
				);
			}.bind(this));
		}
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
					React.DOM.form({id: "dccadddynamic", onSubmit: this.submitForm, className: "easytab reversetab"}, 
						
						React.DOM.div({className: "adderror"}), 
						React.DOM.div({style: {marginLeft:10}}, 
							React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills", role: "tablist", 'data-tabs': "pills"}, 
								React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABwallet", role: "pill", 'data-toggle': "pill"}, "From Wallet")), 
								React.DOM.li(null, React.DOM.a({'data-target': "TABaddress", role: "pill", 'data-toggle': "pill"}, "Manual"))
							)
						), 
						React.DOM.div({className: "tab-content"}, 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
								React.DOM.input({type: "text", ref: "name", name: "name", placeholder: "name of dynamic receiver", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({id: "TABwallet", className: "tab-pane active "}, 
								React.DOM.div({className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet"), 
									React.DOM.select({ref: "dccaddwallet", id: "dccaddwallet", name: "dccaddwallet", className: "form-control input input-faded"}, 
										React.DOM.option(null, "Select A Wallet"), 
										wallets
									)
								), 
								React.DOM.div({className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Send to Format"), 
									React.DOM.select({ref: "format", id: "addreceiverformat", name: "format", className: "form-control input input-faded"}, 
										React.DOM.option({value: "1"}, "New Account & Address per transaction"), 
										React.DOM.option({value: "2"}, "One Account + New Address per transaction"), 
										React.DOM.option({value: "3"}, "One Account & Address for a single transaction")
									)
								), 
								React.DOM.div({id: "addreceiveraccount", style: {display:"none"}, className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Account"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", ref: "account", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
								)
							), 
							React.DOM.div({id: "TABaddress", className: "tab-pane "}, 
								React.DOM.p({className: "text-warning"}, "*Blockchain monitoring support not functional yet and these receivers can not be tracked."), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Coin Address"), 
									React.DOM.input({type: "text", id: "address", name: "address", ref: "address", placeholder: "address", className: "form-control coinstamp input input-faded"})
								), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Coin Type"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", id: "receivertype", ref: "receivertype", name: "receivertype", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
								)
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Total Offset", React.DOM.span({style: {marginLeft:3}, 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body", title: "", className: "glyphicon glyphicon-info-sign bstooltip", title: "If you plan on accepting multiple coins for payment you should set an offset.  If you charge 55000 Ð and accept Ð, BTC and LTC for payment the conversion may leave a payment at 49990 Ð.  If you set the offset to 10 Ð the order would be considered complete."})), 
								React.DOM.input({type: "text", id: "totaloffset", name: "totaloffset", ref: "totaloffset", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Confirmations", 
									React.DOM.span({style: {marginLeft:3}, 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body", title: "", className: "glyphicon glyphicon-info-sign bstooltip", title: "The number of confirmations needed to consider a transaction payment complete."})
									), 
								React.DOM.input({type: "text", id: "confirmations", name: "confirmations", ref: "confimations", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? 'Adding...' : 'Add Dynamic Receiver'), 
								React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
							)
						), 
						React.DOM.input({type: "hidden", ref: "action", name: "action", defaultValue: "add-wallet"}), 
						React.DOM.input({type: "hidden", name: "useme", ref: "useme", id: "fw-useme", defaultValue: "TABwallet", className: "fw-useme"})
					)
				)
			)
		}.bind(this)
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "dynamicpage", className: "col-md-12  tab-pane fade in active"}, 
					React.DOM.div({className: "snow-block-body"}, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text), 
						  React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.coin.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.receiver.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.wallet.text)), 
										React.DOM.th({title: "confirmations"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.cfms.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"})
				), 
				snowUI.snowModals.removeItem.call(this,this.removeNow)
			)			
		
			);
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			React.DOM.div({style: {padding:'5px 20px'}}, 
			
				
			
				really()
			)
		)
	}
});

//client component
snowUI.receive.shortcuts = React.createClass({displayName: 'shortcuts',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('static did update')
		this.listen()
		snowUI.watchLoader();
		
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
		
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		snowUI.watchLoader();
		
		this.listen()
		
	},
	listen: function() {
		$("#dccaddofflineform #coin").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#dccaddofflineform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dccaddofflineform  #fw-pickwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$("#dccaddofflineform #address").autocomplete({ 
			source: function(req, response) { 
					   if($('#dccaddofflineform #fw-useme').val()!=='TABmanual')$.ajax({
						url: '/api/snowcoins/simple/get-addresses/?wally='+$("#dccaddofflineform #fw-pickwallet").val()+'&account='+$("#dccaddofflineform #account").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		
		$('#dccaddofflineform #offlineformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#dccaddofflineform #offlineaccount').fadeIn();
			else $('#dccaddofflineform #offlineaccount').fadeOut();
		});
		
		$('#dccaddofflineform').find('[rel=popover]').popover();
	},
	submitForm: function(e) {
		if(snowUI.debug) snowLog.info('submit shortcut add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var next = true,
			shortcut=$('#dccaddofflineform #shortcut').val(),
			address=$('#dccaddofflineform #address').val(),
			wallet=$('#dccaddofflineform #fw-pickwallet').val(),
			useme=$('#dccaddofflineform #fw-useme').val()==='TABmanual'?2:1,
			type=$('#dccaddofflineform #type').val();
		//check req
		if(shortcut==='') {
			$("#dccaddofflineform #shortcut").parent().addClass('has-error');
			next=false;
		} else $("#dccaddofflineform #shortcut").parent().removeClass('has-error');
		if(useme===2) {
			if(address==='') {
				$("#dccaddofflineform #address").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #address").parent().removeClass('has-error');
			if(type==='') {
				$("#dccaddofflineform #type").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #type").parent().removeClass('has-error');
		} else {
			if(wallet==='Select A Wallet') {
				$("#dccaddofflineform #fw-pickwallet").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #fw-pickwallet").parent().removeClass('has-error');
		}
		if(next===false) {
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
		}
		else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dccaddofflineform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Shortcut ' + shortcut + ' added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' static receiver ' + iden,removeItem:true});
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-unattended',wid:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
					snowUI.flash('success','Shortcut removing now.',2500)
				
				} else {
					if(snowUI.debug) snowLog.warn(resp.error)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		
		snowUI.loaderRender();
		var text = snowUI.snowText.receive.static,
			results,
			_this = this;
		var list = this.props.state.data[this.props.state.component]
		if(snowUI.debug) snowLog.log('static receiver component', list)
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				var format = val.sign.format === '1' ? 'Share' : val.sign.format === '2' ? ' Share & Pay' : 'Payments';
				var locked = val.sign.lock ? 'Will Encrypt' : 'Viewable';
				var sharehost = snowUI.link.state === 'on' ? snowUI.snowPath.linkServer.host + '.' + _this.props.config.userSettings.linkName + '.' + val.apikey : snowUI.snowPath.share + '/' + val.apikey;
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", React.DOM.a({href: sharehost, target: "_blank"}, val.apikey), " "), 
						React.DOM.td(null, " ", val.coin, " ", React.DOM.br(null), " ", format, " "), 
						React.DOM.td(null, " ", val.sign.pinop, " ", React.DOM.br(null), " ", val.sign.keyphrase, "  "), 
						React.DOM.td(null, " ", val.address, " ", React.DOM.br(null), " ", locked, "  "), 
						React.DOM.td(null, " ", moment(val.expires).format("llll"), " ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "staticpage", className: "col-md-12  tab-pane fade  in active"}, 
					snowUI.ButtonToolbar(null, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text)
					), 
					React.DOM.div({className: "snow-block-body"}, 
						
						React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.findme.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.coin.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text)), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.expires.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"}), 
					snowUI.snowModals.removeItem.call(this,this.removeNow)
				)
			)			
		
			)
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
				
				  React.DOM.form({id: "dccaddofflineform", onSubmit: this.submitForm, className: "easytab reversetab"}, 
				    React.DOM.div({className: "adderror"}), 
					React.DOM.div({style: {marginLeft:10}}, 
					      React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills"}, 
						React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABfromwallet", 'data-toggle': "pill"}, "From Wallet")), 
						React.DOM.li(null, React.DOM.a({'data-target': "TABmanual", 'data-toggle': "pill"}, "Manual"))
						
					      )
					), 
				    React.DOM.div({className: "tab-content"}, 
					      
				      React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, 
							"shortcut  ", 
							React.DOM.a({className: "helppopover", rel: "popover", 'data-trigger': "click focus", title: "Accessing Share Pages", 'data-html': "true", 'data-container': "body", 'data-content': "<p>You can access share pages by the shortcut.</p><p>With a   <a href='http://snowcoins.link/snowcat' target='_blank'>.link account</a> you can share addresses like so: <a href='http://snowcoins.link/.snowkeeper.donate' target='_blank' >http://snowcoins.link/.snowkeeper.donate</a></p><p>There is also a <a href='"+snowUI.snowPath.share+"' target='_blank' >local page</a> you can expose to the internet instead of using a .link account.</p>", 'data-toggle': "popover", 'data-placement': "bottom"}, React.DOM.span({className: "glyphicon glyphicon-question-sign "}), " ")
						), 
						React.DOM.input({type: "text", id: "shortcut", name: "shortcut", placeholder: "must be unique", className: "form-control coinstamp input input-faded"}), 
						React.DOM.input({type: "hidden", name: "action", defaultValue: "add-offline"}), 
						React.DOM.input({type: "hidden", name: "useme", id: "fw-useme", defaultValue: "TABfromwallet", className: "fw-useme"})
				      ), 
				      React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Expires"), 
					React.DOM.select({name: "expires", className: "form-control input input-faded"}, 
					  React.DOM.option({value: "laina"}, "Never"), 
					  React.DOM.option({value: "burnonimpact"}, "One Use Only"), 
					  React.DOM.option({value: "1"}, "1 day"), 
					  React.DOM.option({value: "7"}, "1 week"), 
					  React.DOM.option({value: "30"}, "30 days"), 
					  React.DOM.option({value: "180"}, "6 months"), 
					  React.DOM.option({value: "365"}, "1 year")
					)
					), 
				      React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Display"), 
					React.DOM.textarea({type: "textarea", rows: "3", id: "display", name: "display", placeholder: "Comments to the sender.", className: "form-control coinstamp input input-faded"})
				      ), 
				      
				      React.DOM.div({id: "TABmanual", className: "tab-pane "}, 
					
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Coin"), 
					  React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", id: "coin", name: "coin", className: "form-control coinstamp input input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({id: "TABfromwallet", className: "tab-pane active"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Wallet"), 
							React.DOM.select({id: "fw-pickwallet", name: "coinwallet", className: "form-control input input-faded"}, 
								React.DOM.option(null, "Select A Wallet"), 
								wallets
							)
					), 
					React.DOM.div({id: "offlineaccount", className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Account"), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
					)
					
				), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Address"), 
						React.DOM.input({type: "text", id: "address", name: "address", placeholder: "address", className: "form-control coinstamp input input-faded"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon  coinstamp", style: {textTransform:'capitalize'}}, snowUI.snowText.accounts.address.moreinfo.pin.text), 
						React.DOM.input({type: "text", name: "pin", id: "pin", placeholder: snowUI.snowText.accounts.address.moreinfo.pin.placeholder, className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon  coinstamp", style: {textTransform:'capitalize'}}, snowUI.snowText.accounts.address.moreinfo.pinphrase.text), 
						React.DOM.input({type: "text", name: "keyphrase", id: "keyphrase", placeholder: snowUI.snowText.accounts.address.moreinfo.pinphrase.placeholder, className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon   coinstamp", style: {textTransform:'capitalize',borderRight:'1px initial initial',paddingRight:25}}, 
							snowUI.snowText.accounts.address.moreinfo.lock.lockinput
						), 
							React.DOM.select({id: "lock", name: "lock", className: "form-control coinstamp"}, 
								React.DOM.option({value: "no"}, snowUI.snowText.accounts.address.moreinfo.lock.option.no), 
								React.DOM.option({value: "yes"}, snowUI.snowText.accounts.address.moreinfo.lock.option.yes)
							)
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "type"), 
						React.DOM.select({id: "offlineformat", name: "type", className: "form-control input input-faded"}, 
						    React.DOM.option({value: "1"}, "Share"), 
						    React.DOM.option({value: "2"}, "Share and Payments"), 
						    React.DOM.option({value: "3"}, "Payments only")
						)
					), 
				
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? 'Adding shortcut...' : 'Add Shortcut'), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
					)
				  )
					
				   
				)
				)
			)
		}.bind(this)
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			React.DOM.div({style: {padding:'5px 20px'}}, 
				really()
			)
		) 
	}
});


//client component
snowUI.receive.keys = React.createClass({displayName: 'keys',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.info('receive props keyspage' ,nextProps)
		return false;
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		return false;
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('keyspage did update')
		this.listen()
		snowUI.watchLoader();
		$('#keyspageform').find('[rel=popover]').popover();
		return false;
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
		return false;		
	},
	componentWillUnMount: function() {
		return false;
				
	},
	componentDidMount: function() {
		snowUI.watchLoader();
		this.listen();
		$('#keyspageform').find('[rel=popover]').popover();
		return false;
	},
	listen: function() {
		$("#keyspageform #type").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#keyspageform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#keyspageform  #fw-pickwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$('#keyspageform #offlineformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#dccaddofflineform #offlineaccount').fadeIn();
			else $('#dccaddofflineform #offlineaccount').fadeOut();
		});
		return false;
	},
	submitForm: function(e) {
		if(snowUI.debug) snowLog.info('submit keyspageform add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var next = true,
			name=$('#keyspageform #name').val(),
			address=$('#keyspageform #address').val(),
			wallet=$('#keyspageform #fw-pickwallet').val(),
			useme=$('#keyspageform #fw-useme').val()==='TABmanual'?2:1,
			type=$('#keyspageform #type').val();
		//check req
		if(name==='') {
			$("#keyspageform #name").parent().addClass('has-error');
			next=false;
		} else $("#keyspageform #name").parent().removeClass('has-error');
		if(useme===2) {
			if(address==='') {
				$("#keyspageform #address").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #address").parent().removeClass('has-error');
			if(type==='') {
				$("#keyspageform #type").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #type").parent().removeClass('has-error');
		} else {
			if(wallet==='Select A Wallet') {
				$("#keyspageform #fw-pickwallet").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #fw-pickwallet").parent().removeClass('has-error');
		}
		if(next===false) {
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
		}
		else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#keyspageform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','API Access granted',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
		return false;
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' client api key ' + iden,removeItem:true});
		return false;
		//snowUI.methods.modals.removeItem.open();
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-client',ccid:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
					snowUI.flash('success','API access removed',2500)
				
				} else {
					if(snowUI.debug) snowLog.warn(resp.error)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		}  else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
		return false;
	}, 
	ipRange: function(e) {
		
		var el= this.refs['pickip'].getDOMNode(),
			entered=parseFloat(el.value.trim()),
			input = this.refs['ip'].getDOMNode();
		
		if(entered===2)input.value = snowUI.myip+'/32'
		else if(entered===1)input.value = '0.0.0.0/0'
		else if(entered===4)input.value = snowUI.myip+'/24'
		else if(entered===5)input.value = this.props.config.userSettings.ddnsIP+'/32'
		else if(entered===6)input.value = this.props.config.userSettings.ddnsIP+'/24'
		else input.value = ''
		return false;
			
	},
	render: function() {
		if(snowUI.debug) snowLog.log('client keys component')
		snowUI.loaderRender();
		var text = snowUI.snowText.receive.keys,
			results;
			
		var addItem = function() {
			return (
			
			React.DOM.div(null, 
				React.DOM.form({id: "keyspageform", onSubmit: this.submitForm}, 
					React.DOM.div({className: "snow-block-heading"}, text.form.name.title), 
						React.DOM.div({className: "adderror"}), 
					
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.name.text)), 
						React.DOM.input({type: "text", id: "name", name: "name", placeholder: "name of master", className: "form-control coinstamp input input-faded"})
					), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.apikey.text)), 
						React.DOM.input({type: "text", id: "apikey", name: "apikey", placeholder: "leave blank to generate a key", className: "form-control coinstamp input input-faded"}), 
						React.DOM.input({type: "hidden", name: "action", value: "client-api"})
					), 
					React.DOM.div({className: "col-xs-6   ", style: {marginBottom:12,fontWeight:'bold',textAlign:'left'}}, 
						text.form.controls.master
					), 
					
					React.DOM.div({className: "col-xs-6  ", style: {marginBottom:12,fontWeight:'bold',textAlign:'right'}}, 
						text.form.controls.client
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.auth.text)), 
						React.DOM.select({name: "authlevel", className: "form-control input input-faded", defaultValue: "8"}, 
							React.DOM.optgroup({label: "D3C Master Keys"}, 
								React.DOM.option({value: "1"}, text.form.controls.select.a), 
								React.DOM.option({value: "2"}, text.form.controls.select.b), 
								React.DOM.option({value: "3"}, text.form.controls.select.c), 
								React.DOM.option({value: "4"}, text.form.controls.select.d), 
								React.DOM.option({value: "5"}, text.form.controls.select.e)
							), 
							React.DOM.optgroup({label: "D2C Client Keys"}, 
								React.DOM.option({value: "6"}, text.form.controls.select.f), 
								React.DOM.option({value: "7"}, text.form.controls.select.g), 
								React.DOM.option({value: "8"}, text.form.controls.select.h), 
								React.DOM.option({value: "9"}, text.form.controls.select.i), 
								React.DOM.option({value: "10"}, text.form.controls.select.j)
							)
						)
					), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.div({style: {width:65,marginLeft:-5}}, 
								text.form.range.text, 
								React.DOM.a({style: {marginLeft:7}, 'data-toggle': "popover", 'data-placement': "bottom", 'data-container': "body", rel: "popover", 'data-trigger': "focus click", title: "Limiting Access By IP Range", 'data-html': "true", 'data-content': text.form.range.title}, 
									React.DOM.span({className: "glyphicon glyphicon-info-sign "})
								)
							)
						), 
						React.DOM.div({className: "col-sm-8"}, 
							React.DOM.input({type: "text", ref: "ip", name: "ip", placeholder: "0.0.0.0/0", className: "form-control coinstamp input input-faded"})
						), 
						React.DOM.div({className: "col-sm-4"}, 
							React.DOM.select({ref: "pickip", className: "form-control input input-faded", defaultValue: "3", onChange: this.ipRange}, 
								
								React.DOM.option({value: "2"}, text.form.ip.select.a), 
								React.DOM.option({value: "4"}, text.form.ip.select.b), 
								React.DOM.option({value: "5"}, text.form.ip.select.c), 
								React.DOM.option({value: "6"}, text.form.ip.select.d), 
								React.DOM.option({value: "1"}, text.form.ip.select.e), 
								React.DOM.option({value: "3"}, text.form.ip.select.f)
								
							)
						)
					), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? text.form.button.adding : text.form.button.add), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, text.form.button.cancel)
					)
				)
			)
			
			
			)
		}.bind(this)
		
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", val.name, " "), 
						React.DOM.td(null, " ", React.DOM.a({href: (val.type === 'master' ?  snowUI.snowPath.d3c :  snowUI.snowPath.d2c) + '/' + val.apikey, target: "_blank"}, val.type), " "), 
						React.DOM.td(null, " ", val.apikey, " "), 
						React.DOM.td(null, " ", val.ip || '--', "  "), 
						React.DOM.td(null, " ", val.clients.length>0 ? val.clients.map(function(v){ return ' ' + v.name + ' ' }) : val.type === 'master' ? 'all clients' : '--', "  ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
				React.DOM.div(null, 
					React.DOM.div({id: "keyspage", className: "col-md-12  tab-pane fade  in active"}, 
						React.DOM.div({className: "snow-block-body"}, 
							snowUI.ButtonToolbar(null, 
								  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default "}, text.button.add.text)
							  
							), 
							React.DOM.div({className: "table-responsive"}, 
								React.DOM.table({className: "table table-hover snowtablesort"}, 
									React.DOM.thead(null, 
										React.DOM.tr(null, 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.name.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.type.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.key.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.ip.text)), 
											React.DOM.th({className: "snowsortcountitems"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.manages.text))
										)
									), 
									React.DOM.tbody(null, 
										results
									)
								)
							  )
							
						), 
						React.DOM.div({className: "clearfix"})
					), 
					
					snowUI.snowModals.removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this))
				)			
			)
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			React.DOM.div({style: {padding:'5px 20px'}}, 
				really()
			)
		)
	}
});



//trackers component
snowUI.receive.trackers = React.createClass({displayName: 'trackers',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
			listen:false
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.info('tracker receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('trackers did update')
		if(!this.state.listen)this.listen()
		
		snowUI.watchLoader();
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
				
	},
	componentWillUnMount: function() {
		
			
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('trackers did mount')
		snowUI.watchLoader();
		if(!this.state.listen)this.listen()
	},
	listen: function() {
		if(!this.state.listen)this.setState({listen:true});
		$("#dcctrackerform #receivertype").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		//fill account drop down from wallet selection
		$("#dcctrackerform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dcctrackerform #trackerwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
							var re = $.ui.autocomplete.escapeRegex(req.term);
							console.log(re);
							var matcher = new RegExp( re, "i" );
							response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		
		//addresses for selected account
		$("#dcctrackerform #account,#dcctrackerform #trackerwallet").blur(function(){
			$("#dcctrackerform #dccpickaddress")
			.find('option')
			.remove()
			.append('<option id="loading">loading... mobile users reselect</option>');
			
			var url= '/api/snowcoins/simple/get-addresses/?wally='+$("#dcctrackerform #trackerwallet").val()+'&account='+$("#dcctrackerform #account").val()
			snowUI.ajax.GET(url,{},function(data) {
				$("#dcctrackerform #dccpickaddress").append('<option value="">No Address</option>');
				$("#dcctrackerform #dccpickaddress").append('<option value="new">Create New Address</option>');
				data.forEach(function(val) {
					//console.log(val);
					$("#dcctrackerform #dccpickaddress").find('#loading').remove().end().append('<option value="'+val+'">'+val+'</option>');
				});
				
			});
			
		});
		
		
	},
	submitForm: function(e) {
		if(snowUI.debug) snowLog.info('submit trackers add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var addw=this.refs.trackerwallet.getDOMNode().value.trim(),
			useme=this.refs.useme.getDOMNode().value.trim(),
			root=this.refs.root.getDOMNode().value.trim();
		if(addw==='Select A Wallet' && useme==='TABwallet') {
			
			snowUI.flash('error','Please select a wallet.','3000');
			this.setState({requesting:false});
			$("#maindiv #dccaddwallet").parent().addClass('has-error');
			
		} else if (useme==='TABwatch' && root==='') {
			
			snowUI.flash('error','Please add a root path.','3000');
			this.setState({requesting:false});
			$("#maindiv #root").parent().addClass('has-error');
			
		} else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dcctrackerform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Tracker added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open tracker modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' tracker ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-tracker',tracker:this.state._candidate}
		
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					snowUI.flash('success','Tracker removed',2500)
				
				} else {
					if(snowUI.debug) snowLog.error(resp)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		if(snowUI.debug) snowLog.log('trackers component', this.props)
		
		var text = snowUI.snowText.receive.trackers,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				if(typeof val.owner !== 'object' || val.owner === null)val.owner = {name: {first:'',last:''}}
				//console.log(typeof val.owner,val.owner.name)
				var removeme = (val.type === 'user' || val.type === 'leech') ? (React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   "))) : (React.DOM.td(null))
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						removeme, 
						React.DOM.td({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "top", title: 'Owner: '+val.owner.name.first.charAt(0).toUpperCase() + '. ' + val.owner.name.last}, " ", val.name, " "), 
						
						React.DOM.td(null, " ", val.type, " "), 
						React.DOM.td(null, " ", val.watch.watching ===  true ? 'watch':val.interval/1000<3600 ? val.interval/1000+' secs':val.interval/1000/60 > 59 ? Math.floor(val.interval/1000/60/60)+' hrs': val.interval/1000/60+' mins', " "), 
						React.DOM.td(null, moment(val.last).format("llll"), " "), 
						React.DOM.td(null, " ", val.wallet ? val.wallet.name : '--', " "), 
						
						React.DOM.td(null, " ", val.account || '--', "  "), 
						React.DOM.td(null, " ", val.address || '--', "  ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "trackerspage", className: "col-md-12  tab-pane fade in active"}, 
					React.DOM.div({className: "snow-block-body"}, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text), 
						  React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.name.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.type.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.interval.text)), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet "}, text.table.th.date.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.wallet.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"})
				), 
				snowUI.snowModals.removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this))
			)			
		
			);
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
					React.DOM.form({id: "dcctrackerform", onSubmit: this.submitForm, className: "easytab reversetab"}, 
						
						React.DOM.div({className: "adderror"}), 
						
						React.DOM.div({style: {marginLeft:10}}, 
							React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills", role: "tablist", 'data-tabs': "pills"}, 
								React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABwallet", role: "pill", 'data-toggle': "pill"}, "Interval")), 
								React.DOM.li(null, React.DOM.a({'data-target': "TABwatch", role: "pill", 'data-toggle': "pill"}, "File Watcher"))
							)
						), 
						React.DOM.div({className: "tab-content"}, 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
								React.DOM.input({type: "text", ref: "name", name: "name", placeholder: "name of tracker", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet"), 
								React.DOM.select({ref: "trackerwallet", id: "trackerwallet", name: "trackerwallet", className: "form-control input input-faded"}, 
									React.DOM.option(null, "Select A Wallet"), 
									wallets
								)
							), 
							React.DOM.div({id: "addreceiveraccount", className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Account"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", ref: "account", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
							), 
							React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Address"), 
										React.DOM.select({id: "dccpickaddress", name: "dccpickaddress", className: "form-control input input-faded"}, 
										React.DOM.option({id: "cnao", value: ""}, "No Address"), 
										React.DOM.option({id: "cna", value: "new"}, "Create New Address")
									)
								 ), 
							React.DOM.div({id: "TABwallet", className: "tab-pane active "}
								
								
								
								
							), 
							React.DOM.div({id: "TABwatch", className: "tab-pane "}, 
								React.DOM.p({className: ""}, "File watcher will watch a local wallet file and process transactions when it changes."), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "File Path"), 
									React.DOM.input({type: "text", id: "root", name: "root", ref: "root", placeholder: "/full/file/path/without/trailing/slash", className: "form-control coinstamp input input-faded"})
								), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet file"), 
									React.DOM.input({type: "text", id: "dat", ref: "dat", name: "dat", defaultValue: "wallet.dat", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input"})
								)
								
							), 
							
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', id: "confirmchangepassphrase", className: "btn "}, this.state.requesting ? 'Adding...' : 'Add Tracker'), 
								React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
							)
						), 
						React.DOM.input({type: "hidden", ref: "action", name: "action", value: "add-tracker"}), 
						React.DOM.input({type: "hidden", name: "useme", ref: "useme", id: "fw-useme", defaultValue: "TABwallet", className: "fw-useme"})
					)
				)
			)
		}.bind(this)
		
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			React.DOM.div({style: {padding:'5px 20px'}}, 
			
				
			
				really()
			)
		)
	}
});


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */

/**
 * settings components
 * */
//main
snowUI.settings.UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		return ({
			rates:'active in',
			autowithdrawal:'',
			language:'',
			component: 'rates',
			connecting:true,
			error: false,
			message: false,
			default:'rates'
		})
	},
	getFalseState: function() {
		return ({
			rates:'',
			autowithdrawal:'',
			language:'',
			data: false,
			component:false,
			
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this
		var _state = this.getFalseState();
		var page = nextProps.config.page || this.state.default
			
		_state[page] = 'in active'
		_state.component = page
		_this.setState({data:false})
		
		if(snowUI.debug) snowLog.log('settings willgetprops','false state:',_state,nextProps)
		
		/* now get our data */
		this.getPage(page,function(data) {
			_state.data = data
			_state.connecting = false 
			_this.setState(_state)
		})
		
	},
	getPage: function(page,cb) {
		if(!page)page = this.state.component
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:page},
			po = page;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('settings did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('settings did mount',this.state.component,this.props.config.page)
		var me = $('a[data-target="'+this.state.component+'"]')
		me.tab('show')	
	},
	changeTab: function(e) {
		var me = $(e.target);
		//var them = $('.tab-pane');
		var options = {
			skipload:false,
			trigger:true
		}
		if(snowUI.debug) snowLog.info(me)
		//me.tab('show')
		snowUI.methods.valueRoute(snowUI.snowPath.settings + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		if(snowUI.debug) snowLog.log('settings component',this.state,this.props)
		
		if(!this.state.data) {
			if(snowUI.debug) snowLog.warn('empty render for receive')
			renderMe=(React.DOM.div(null))
		
		} else if(snowUI.settings[showcomp]) {
			
			var po = snowUI.settings[showcomp]
			renderMe = (po({config: this.props.config, state: this.state, UI: this}))
			var tp ='0px'
		
		} else {
			
			renderMe = (snowUI.wallet.displayMessage({title: "404 Not Found", message: "I could not find the page you are looking for. ", type: "requesterror"}))
			var tp='20px'
		}     
		
	    return (
		
		React.DOM.div({className: "snow-body-receive"}, 
			React.DOM.div({id: "snow-receive", className: " snow-send snow-receive  snow-dccsetup"}, 
				React.DOM.div({id: "prettysuccess", style: {display:'none'}}, 
					React.DOM.div({className: "alert alert-success alert-dismissable"}, 
						React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
						React.DOM.p(null)
					)
				), 
				React.DOM.div({id: "prettyerror", style: {display:'none'}}, 
					React.DOM.div({className: "alert alert-danger alert-dismissable"}, 
						React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
						React.DOM.p(null)
					)
				), 
				React.DOM.div({style: {padding:tp +' 10px 0 10px'}, className: "tabbox clearfix", id: "maindiv"}, 
					
					React.DOM.ul({className: "nav nav-pills dccnavlis", role: "tablist", 'data-tabs': "pills"}, 
						React.DOM.li({className: "active"}, React.DOM.a({onClick: this.changeTab, 'data-target': "rates", role: "pill", 'data-toggle': "pill", title: snowUI.snowText.settings.menu.rates.title}, snowUI.snowText.settings.menu.rates.text)), 
						React.DOM.li(null, React.DOM.a({onClick: this.changeTab, 'data-target': "language", role: "pill", 'data-toggle': "pill", title: snowUI.snowText.settings.menu.language.title}, snowUI.snowText.settings.menu.language.text)), 
						React.DOM.li(null, React.DOM.a({role: "pill", 'data-toggle': "pill", onClick: this.changeTab, 'data-target': ".link", title: snowUI.snowText.settings.menu.autobot.title}, snowUI.snowText.settings.menu.autobot.text)), 
						React.DOM.li(null, React.DOM.a({onClick: this.reload}, React.DOM.span({className: "glyphicon glyphicon-refresh"})))
					), 
					React.DOM.div({className: "clearfix", style: {marginTop:10}}, 
						renderMe
					)
				), 
				React.DOM.div({className: "clearfix"})
			)		
		)
	    )
	},
	reload: function() {
		location.reload()
	}
});


//rate component
snowUI.settings.rates = React.createClass({displayName: 'rates',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowLog.info('rates receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('rates did update')
		this.listen()
		snowUI.watchLoader();
		
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		snowUI.watchLoader();
		this.listen()
	},
	listen: function() {
		
		
	},
	submitForm: function(e) {
		if(snowUI.debug) snowLog.info('submit rate parameter form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var url =  "/api/snowcoins/local/settings?page=rates"
		var data = $( "#ratesupdateform" ).serialize()
		
		snowUI.ajax.POST(url,data,function(resp) {
			if(resp.success === true) {
				this.setState({requesting:false});
				this.props.UI.setState({data:resp.data})
				snowUI.flash('success','Rate parameters updated',2500)
			
			} else {
				if(snowUI.debug) snowLog.error(resp)
				this.setState({requesting:false});
				snowUI.flash('error',resp.err,3500)
				
			}
		}.bind(this))
			
		
	},
	render: function() {
		if(snowUI.debug) snowLog.log('rates component', this.props)
		
		var text = snowUI.snowText.settings.rates,
			results,
			snowmoney = this.props.state.data.snowmoney,
			rates = this.props.state.data.rates;
		var _this = this
		
		//if we have snowmoney.usd print a chart
		var shortlist = function() {
			
			if (snowmoney.usd) {
				
				return (React.DOM.div({className: "table-responsive"}, 
					React.DOM.table({className: "table", style: {fontSize:14}}, 
						React.DOM.tbody(null, 
							React.DOM.tr(null, 
								React.DOM.td({style: {border:'none'}}, 
									React.DOM.div({className: "crcurrency"}, "1 USD "), 
									React.DOM.div(null, 
										parseFloat(snowmoney.usd.btc.price).formatMoney(8), 
										React.DOM.span({className: "coinstamp"}, " BTC ")
									), 
									React.DOM.div(null, 
										parseFloat(snowmoney.usd.ltc.price).formatMoney(8), 
										React.DOM.span({className: "coinstamp"}, " LTC")
									), 
									React.DOM.div(null, 
										snowmoney.usd.doge.price ? parseFloat(snowmoney.usd.doge.price).formatMoney(8) : 'n/a', 
										React.DOM.span({className: "coinstamp"}, " Ð")
									), 
									React.DOM.div(null, 
										React.DOM.span({className: "coinstamp"}, "  € "), 
										React.DOM.span(null, " ", snowmoney.eur.usd.price ? parseFloat((1/snowmoney.eur.usd.price)).formatMoney(8) : 'n/a', " ")
									)
								), 
							
								React.DOM.td({style: {border:'none'}}, 
									React.DOM.div({className: "crcurrency"}, "1 BTC "), 
									React.DOM.div(null, 
										React.DOM.span({className: "coinstamp"}, " $ "), parseFloat(snowmoney.btc.usd.price).formatMoney(8) || 'n/a'
										
									), 
									React.DOM.div(null, 
										(1/parseFloat(snowmoney.ltc.btc.price)).formatMoney(8) || 'n/a', 
										React.DOM.span({className: "coinstamp"}, " LTC")
									), 
									React.DOM.div(null, 
										(1/parseFloat(snowmoney.doge.btc.price)).formatMoney(8) || 'n/a', 
										React.DOM.span({className: "coinstamp"}, " Ð")
									), 
									React.DOM.div(null, 
										React.DOM.span({className: "coinstamp"}, "  € "), 
										React.DOM.span(null, " ", parseFloat(snowmoney.btc.eur.price).formatMoney(8) || 'n/a', " ")
									)
								), 
							
								React.DOM.td({style: {border:'none'}}, 
									React.DOM.div({className: "crcurrency"}, "1 EUR "), 
									React.DOM.div(null, 
										parseFloat(snowmoney.eur.btc.price).formatMoney(8) || 'n/a', 
										React.DOM.span({className: "coinstamp"}, " BTC ")
									), 
									React.DOM.div(null, 
										(parseFloat(snowmoney.eur.ltc.price)).formatMoney(8) || 'n/a', 
										React.DOM.span({className: "coinstamp"}, " LTC")
									), 
									React.DOM.div(null, 
										(parseFloat(snowmoney.eur.doge.price)).formatMoney(8) || 'n/a', 
										React.DOM.span({className: "coinstamp"}, " Ð")
									), 
									React.DOM.div(null, 
										React.DOM.span({className: "coinstamp"}, "  $ "), 
										React.DOM.span(null, " ", parseFloat(snowmoney.eur.usd.price).formatMoney(8) || 'n/a', " ")
									)
								)
							)		
						)
					)
				))
			}
		}
		
		
		
		if(snowmoney) {
			var sarry = Object.keys(snowmoney)
			var results = sarry.map(function (a) {
				var val = snowmoney[a],
					i = a
				
				if(!val.usd)val.usd={}
				if(!val.btc)val.btc={}
				if(!val.ltc)val.ltc={}
				if(!val.doge)val.doge={}
				if(!val.eur)val.eur={}
				if(i !== '') {
					return (
						
						React.DOM.tr({id: val.ticker, key: val.ticker}, 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals "+ i}, i)), 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals " + (val.btc.price || 'n/a' )+ " BTC"}, val.btc.price || '')), 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals " + (val.usd.price || 'n/a' )+ " USD"}, val.usd.price || '')), 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals " + (val.eur.price || 'n/a' )+ " EUR"}, val.eur.price || '')), 
							
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals " + (val.ltc.price || 'n/a') + " LTC"}, val.ltc.price || '')), 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "1 " + i.toUpperCase() + " equals " + (val.doge.price || 'n/a') + " DOGE"}, val.doge.price || '')), 
							React.DOM.td(null, " ", React.DOM.span({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "bottom", title: "value recorded at " + val.published}, moment(val.published).format("YYYY-MM-DD HH:mm:ss")))
						)
					);
				} 
			}.bind(this));
		}
		var addItem = function() {
			
			return (
				React.DOM.div(null, 
					React.DOM.div({id: "ratespage", className: "col-md-12  tab-pane fade in active"}, 
						React.DOM.div({style: {padding:'5px 20px'}}, 
							React.DOM.div({className: "col-xs-12 "}, 
								React.DOM.h4({className: "profile-form__heading"}, "Set parameters for syncing rates")
							), 
							React.DOM.form({id: "ratesupdateform", onSubmit: this.submitForm}, 
								React.DOM.div({className: "adderror"}), 
								React.DOM.p(null, " Last Run: ", moment(this.props.state.data.rateparameters.last).format("LLLL")), 
								React.DOM.p(null, " Next Run: ", moment(this.props.state.data.rateparameters.last).add(this.props.state.data.rateparameters.interval,'ms').format("LLLL")), 
								React.DOM.div({className: "form-group"}, 
									React.DOM.label({htmlFor: "crupdatetime"}, " ", text.schedule.label.when), 
									React.DOM.div({className: "clearfix"}), 
									React.DOM.div({className: "col-md-6 col-xs-12"}, 
										React.DOM.select({id: "when", name: "when", className: "form-control", defaultValue: this.props.state.data.rateparameters.interval/1000}, 
											
											React.DOM.option({value: "15"}, " 15 secs"), 
											React.DOM.option({value: "60"}, " 1 minutes"), 
											React.DOM.option({value: "900"}, " 15 minutes"), 
											React.DOM.option({value: "1800"}, " 30 minutes"), 
											React.DOM.option({value: "2700"}, " 45 minutes"), 
											React.DOM.option({value: "3600"}, " 60 minutes"), 
											React.DOM.option({value: "5400"}, " 90 minutes"), 
											React.DOM.option({value: "7200"}, "2 hours"), 
											React.DOM.option({value: "14400"}, " 4 hours"), 
											React.DOM.option({value: "21600"}, " 6 hours"), 
											React.DOM.option({value: "28800"}, " 8 hours"), 
											React.DOM.option({value: "36000"}, " 10 hours"), 
											React.DOM.option({value: "43200"}, " 12 hours"), 
											React.DOM.option({value: "64800"}, " 18 hours"), 
											React.DOM.option({value: "86400"}, " 24 hours")
										)
									)
								), 		
								React.DOM.div({className: "clearfix"}), 
								React.DOM.div({className: "form-group", style: {marginTop:15}}, 
									React.DOM.label({htmlFor: "crapi"}, " ", text.schedule.label.which), 
									React.DOM.div({className: "clearfix"}), 
									React.DOM.div({className: "col-md-6 col-xs-12 clearfix"}, 
										React.DOM.select({id: "api", name: "api", className: "form-control", defaultValue: this.props.state.data.rateparameters.doGrab.arguments}, 
											React.DOM.option(null, " cryptocoincharts "), 
											React.DOM.option({disabled: true}, " prelude.io ")
										)
									)	
								), 
								React.DOM.div({className: "clearfix", style: {marginTop:15}}), 
								React.DOM.div({className: "form-group", style: {marginTop:15}}, 
									React.DOM.input({type: "hidden", name: "action", value: "setcurrencyrates"}), 
									React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', id: "updaterates", className: "btn "}, this.state.requesting ? 'Updating...' : 'Update Parameters'), 
									 "    ", React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.settings + '/' + _this.props.config.page + '', className: "btn btn-default"}, "Cancel")
								)
							)
						)
					)
				)
			)
		}.bind(_this)
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "ratespage", className: "col-md-12  tab-pane fade in active"}, 
					React.DOM.div({className: "snow-block-body"}, 
						  React.DOM.div({className: "table-responsive"}, 
							
							shortlist(), 				
							 
							 React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.settings + '/' + this.props.state.component + '/update', className: "btn btn-sm btn-default "}, text.button.add.text), 
						 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.coin.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.btc.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.usd.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.eur.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.ltc.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.doge.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, text.table.th.time.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"})
				)
				
			)			
		
			);
		}.bind(_this)
		
		//include our page
		if(this.props.config.moon === 'update') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			React.DOM.div({style: {padding:'5px 20px'}}, 
			
				
			
				really()
			)
		)
	}
});
//language component
snowUI.settings.language = React.createClass({displayName: 'language',
	componentWillReceiveProps: function(nextProps) {
		
		
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	componentWillMount: function() {
		
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		this.componentDidUpdate()	
		
	},
	changeLanguage: function(e) {
		
		var newl = $(e.currentTarget).attr('data-snowlanguage')
		
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:'setusersettings',language:newl,newsettings:JSON.stringify({'language':newl})};
		
		if(snowUI.snowLanguages.list.indexOf(newl) > -1) {
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true && resp.data.language) {
					
					if(snowUI.debug) snowLog.info('set user language')
					
					snowUI.snowLanguages.mylanguage = newl
					snowUI.snowLanguages.language = resp.data.language;
					
					snowUI.flash('success',snowUI.snowText.settings.messages.success.changeLanguage,15000);
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false})
						
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					snowUI.flash('error','Error changing language. ' + resp.err) 
				}
				return false
			})
		} else {
			snowUI.flash('error','Language ' + newl + ' is not available')
		}
		
		
	},
	render: function() {
		if(snowUI.debug) snowLog.log('language component')
		var _this = this;
		var l = snowUI.snowLanguages.list;
		var listlanguages = l.map(function(v){
			var list = (v === snowUI.snowLanguages.mylanguage) ? (React.DOM.strong(null, " ", v.toUpperCase())) : v;
			if(v!=='default' && v !== 'mylanguage')return (React.DOM.div({key: v, style: {padding:'4px 0',fontSize:16}, title: snowUI.snowText.settings.language.switch.text + v.toUpperCase()}, React.DOM.a({onClick: _this.changeLanguage, 'data-snowlanguage': v, className: v === snowUI.snowLanguages.mylanguage ? 'active':''}, list)))
		})
		return (React.DOM.div({style: {padding:'5px 20px'}}, 
			
				React.DOM.div({id: "languagepage", className: "col-md-12  "}, 
					React.DOM.div({style: {padding:'5px 20px'}}, 
						React.DOM.div({className: "col-xs-12 "}, 
							React.DOM.h4({className: "profile-form__heading"}, snowUI.snowText.settings.language.choose.text)
						), 	
						React.DOM.div(null, 
						listlanguages
						
						)
					)
				)
			));
	}
});

//inq component
snowUI.settings['.link'] = React.createClass({
	getInitialState: function() {
		return ({
			connecting:true,
			error: false,
			ready:false,
			message: false,
			showsendkey:false,
			showsharekey:false,
		})
	},
	getFalseState: function() {
		return ({
			data: false,
			showsendkey:false,
			showsharekey:false,
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this
		var _state = this.getFalseState();
		
		_this.setState({data:false,ready:false})
		
		if(snowUI.debug) snowLog.log('link willgetprops','false state:',_state,nextProps)
		
		/* now get our data */
		this.getPage(this.props.config.page,function(data) {
			_state.data = data
			_state.connecting = false 
			_state.ready = true 
			_this.setState(_state)
		})
		
	},
	getPage: function(page,cb) {
		if(!page)page = this.props.config.wallet
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:page},
			po = page;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('link did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('link did mount',this.props.config.wallet)
		snowUI.watchLoader();
	},
	setDDNS: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:'update-ip',port:this.refs.port.getDOMNode().value.trim(),use:this.refs.use.getDOMNode().value.trim(),hostname:this.refs.hostname.getDOMNode().value.trim(),oldhostname:this.refs.oldhostname.getDOMNode().value.trim(),action:'setip'};
		
			snowUI.ajax.GET(url,data,function(resp) {
				if(!resp.data.link.error) {
					_this.getPage('ddns',function(data) {
						if(snowUI.debug) snowLog.info('update DDNS',resp);
						var msg = typeof resp.data.linkserver === 'object' ? resp.data.linkserver.message + '  -- --  ' : '';
						snowUI.flash('success',msg + resp.data.link.data.message,10000);
						var _state={}
						_state.data = data;
						_state.connecting = false;
						_state.ready = true;
						_state.showddns = false;
						_this.setState(_state)
						
					});
					
				} else {
					if(snowUI.debug) snowLog.error(resp);
					snowUI.flash('error','' + resp.data.link.error) ;
					_this.setState({connecting:false});
				}
				return false;
			})
		
	},
	removeDDNS: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		var _this = this,
			hostname = $(e.target).closest('td').attr('data-snowddns'),
			url = "/api/snowcoins/local/settings",
			data = {page:'remove-ddns',action:'removehost',hostname:hostname};
		var confirm = window.prompt('Enter the hostname (' + hostname + ') to delete this Dynamic DNS entry?');
		if(confirm && confirm === hostname) {
			snowUI.ajax.GET(url,data,function(resp) {
				if(!resp.data.link.error) {
					_this.getPage('remove-ddns',function(data) {
						if(snowUI.debug) snowLog.info('remove DDNS',resp);
						snowUI.flash('success',resp.data.link.data.message,10000);
						var _state={}
						_state.data = data;
						_state.connecting = false;
						_state.ready = true;
						_state.showddns = false;
						_this.setState(_state)
						
					});
					
				} else {
					if(snowUI.debug) snowLog.error(resp);
					snowUI.flash('error','' + resp.data.link.error) ;
					_this.setState({connecting:false});
				}
				return false;
			})
		} else if(confirm) {
			
			snowUI.flash('error','The name was not correct',3000) ;
			this.setState({connecting:false});
		}
		
	},
	setShare: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		var _this = this,
			newl = this.refs.sharekeyinput.getDOMNode().value.trim()
			url = "/api/snowcoins/local/settings",
			data = {page:'setusersettings',newsettings:JSON.stringify({'shareKey':newl})};
		
		if(newl) {
			snowUI.ajax.GET(url,data,function(resp) {
				snowUI.killFlash('error');
				snowUI.killFlash('success');
				if(resp.success === true) {
					if(snowUI.debug) snowLog.info('set share key',resp);
					if(!resp.data.userSettings.linkName) {
						snowUI.flash('error',snowUI.snowText.link.messages.success.setsharekey + ' :: Share key is not valid! ',15000);
					} else {
						snowUI.flash('success',snowUI.snowText.link.messages.success.setsharekey,15000);
					}
					_this.setState({showsharekey:false});
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false,connecting:false});
				} else {
					if(snowUI.debug) snowLog.error(resp);
					var _state = {connecting:false}
					if(resp.data)_state.data=resp.data;
					_this.setState(_state);
					snowUI.flash('error','Share key changed with errors. ' + resp.err) ;
				}
				return false
			})
		} else {
			snowUI.flash('error','Enter a share key first');
			_this.setState({connecting:false});
		}
		
		
	},
	setSend: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		var _this = this,
			newl = this.refs.sendkeyinput.getDOMNode().value.trim(),
			url = "/api/snowcoins/local/settings",
			data = {page:'setusersettings',newsettings:JSON.stringify({'sendKey':newl})};
		
		if(newl) {
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {
					if(snowUI.debug) snowLog.info('set send key');
					snowUI.flash('success',snowUI.snowText.link.messages.success.setsendkey,15000);
					//fake out the UI and refresh
					_this.setState({showsendkey:false,connecting:false});
					snowUI.methods.updateState({showErrorPage:false});
				} else {
					if(snowUI.debug) snowLog.error(resp);
					var _state = {connecting:false}
					if(resp.data)_state.data=resp.data;
					_this.setState(_state);
					snowUI.flash('error','Send key changed with errors. ' + resp.err) ;
				}
				return false;
			})
		} else {
			snowUI.flash('error','Enter a send key first');
			this.setState({connecting:false});
		}
		
		
	},
	showShareInput: function(e) {
		this.setState({showsharekey:!this.state.showsharekey});
		return false;		
	},
	showSendInput: function(e) {
		this.setState({showsendkey:!this.state.showsendkey});
		return false;		
	},
	showDDNSInput: function(e) {
		this.setState({showddns:!this.state.showddns});
		return false;		
	},
	linkPhoneHome: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		snowUI.flash('message','Sending ping to .link and waiting for response...',25000);
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:'pinglinkhome',pinglinkhome:true};
		
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowLog.info('ping',resp)
			if(resp.success === true) {
				snowUI.killFlash('message');
				if(snowUI.debug) snowLog.info('pinged .link remote server');
				snowUI.flash('success','Ping Sent and Received successfully.',6000);
				//fake out the UI and refresh
				_this.setState({connecting:false});
				
			} else {
				if(snowUI.debug) snowLog.error(resp);
				snowUI.killFlash('message');
				var _state = {connecting:false}
				_this.setState(_state);
				snowUI.flash('error','' + resp.err,10000) ;
			}
			return false;
		})
			
	},
	render: function() {
		if(snowUI.debug) snowLog.log('link component',this.state)
		var _this = this;
		if(this.state.ready) {
			var shareKey = this.state.data.userSettings.shareKey,
				sendKey = this.state.data.userSettings.sendKey,
				linkName = this.state.data.userSettings.linkName,
				hostname = this.state.data.userSettings.ddnsHostname;
				
			var setkey;
			var inputkeyshare = [];
			if(shareKey) {
				 inputkeyshare.push (React.DOM.div({key: "aa123", className: "clearfix"}, React.DOM.p(null, "shareKey: ", React.DOM.strong(null, shareKey)), React.DOM.p(null, "linkName:  ", React.DOM.strong(null, linkName))));
			} else {
				inputkeyshare.push(React.DOM.div({key: "aaa1234"}, React.DOM.p(null, React.DOM.span({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.nosharekey.text}}), " ")));
				if(!this.state.showsharekey)inputkeyshare.push(React.DOM.div({key: "bb12345"}, " ", React.DOM.p(null, " You do not have a share key on file. ")))
			}
			if(this.state.showsharekey) {
				 inputkeyshare.push (React.DOM.div({style: {clear:'both'}}));
				 inputkeyshare.push (React.DOM.div({key: "aa12", className: "clearfix"}, React.DOM.form({className: "", role: "form", onSubmit: _this.setShare}, 
							 React.DOM.div({className: "form-group"}, 
								React.DOM.label({className: "sr-only", htmlFor: "sharekeyinput"}, snowUI.snowText.link.access.addsharekey.text, " "), 
								React.DOM.input({type: "text", className: "form-control", ref: "sharekeyinput", placeholder: snowUI.snowText.link.access.addsharekey.text})
							
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({className: "btn ", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, (this.state.connecting) ? snowUI.snowText.link.access.addsharekey.loading:snowUI.snowText.link.access.addsharekey.text), 
								" ", React.DOM.a({style: {marginBottom:0}, className: "btn btn-default pull-right", onClick: _this.showShareInput}, "cancel")
							)
							), 
							React.DOM.div({className: "clearfix", style: {height:25,width:100,position:'relative'}})
							)
				);
			}	
			var inputkeysend;
			if(this.state.showsendkey) {
				inputkeysend = (React.DOM.div(null, 
							React.DOM.form({className: "", role: "form", onSubmit: _this.setSend}, 
								React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addsendkey.info}}), 
							 React.DOM.div({className: "form-group"}, 
								React.DOM.label({className: "sr-only", htmlFor: "sendkeyinput"}, snowUI.snowText.link.access.addsendkey.text, " "), 
								React.DOM.input({style: {width:'100%'}, type: "text", className: "form-control", ref: "sendkeyinput", placeholder: snowUI.snowText.link.access.addsendkey.text})						
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({className: "btn ", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, (this.state.connecting) ? snowUI.snowText.link.access.addsendkey.loading:snowUI.snowText.link.access.addsendkey.text), 
								" ", React.DOM.a({style: {marginBottom:0}, className: "btn btn-default pull-right", onClick: _this.showSendInput}, "cancel")
							)
							), 
							React.DOM.div({className: "clearfix", style: {height:25,width:100,position:'relative'}})
							)
				);
			} else if(sendKey) {
				 inputkeysend =  (React.DOM.div({className: "col-xs-12"}, React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.setsendkey.text}})));
			} else {
				inputkeysend = (React.DOM.div(null, React.DOM.p(null, snowUI.snowText.link.access.setsendkey.absent, React.DOM.br(null), " ")));
			}
			
			var ddns;
			if(this.state.showddns) {
				ddns = (React.DOM.div({className: " link-info"}, 
						React.DOM.form({className: "", role: "form", onSubmit: _this.setDDNS}, 
							React.DOM.div({className: "col-xs-12  col-md-6", style: {padding:'5px'}}, 
								React.DOM.div({className: "link-head"}, 
									snowUI.snowText.link.linkaccount.ddns	
								), 
								React.DOM.div({style: {padding:'5px'}}, 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.text}}), 
									React.DOM.div({className: "form-group input-group col-xs-12"}, 
										React.DOM.input({ref: "oldhostname", type: "hidden", value: hostname}), 
										React.DOM.input({style: {textAlign:'right'}, type: "text", className: "form-control", ref: "hostname", placeholder: snowUI.snowText.link.access.addddns.text, defaultValue: hostname}), 
										React.DOM.span({className: "input-group-addon input-group "}, ".", snowUI.snowText.link.domain)
															
									), 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.ddnsInfo}}), 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.trackerInfo}})
								), 
								React.DOM.div({className: "clearfix", style: {marginBottom:'25px'}})
								
							), 
							
							React.DOM.div({className: "col-xs-12 col-md-6", style: {padding:'5px'}}, 
								React.DOM.div({className: "link-head"}, 
									snowUI.snowText.link.linkaccount.link	
								), 
								React.DOM.div({style: {padding:'5px'}}, 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.linkAsk}}), 
									
										
										React.DOM.div({className: "col-xs-12 form-group input-group "}, 
											React.DOM.select({style: {width:'100px',fontSize:'16px'}, ref: "use", className: "form-control coinstamp", defaultValue: this.state.data.userSettings.linkServer}, 
												React.DOM.option({value: "off"}, snowUI.snowText.accounts.address.moreinfo.lock.option.no), 
												React.DOM.option({value: "on"}, snowUI.snowText.accounts.address.moreinfo.lock.option.yes)
											), 
											React.DOM.span({style: {width:'60px'}, className: "input-group-addon input-group "}, snowUI.snowText.link.access.addddns.port), 
											React.DOM.input({style: {width:'auto'}, type: "text", className: "form-control", ref: "port", placeholder: "port (12777)", defaultValue: snowUI.link.port})
											
										), 
										React.DOM.div({className: "col-xs-12 ", dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.allow.replace('{port}',snowUI.link.port)}}), 
									
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.access.addddns.linkInfo.replace('{port}',snowUI.snowPath.link.port)}})
									
								)
							), 
							
							
							React.DOM.div({className: "clearfix"}), 
							React.DOM.div({className: "form-group col-xs-12 ", style: {padding:'0 10px'}}, 
								React.DOM.button({className: "btn center-block", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, this.state.connecting ? snowUI.snowText.link.access.addddns.buttonadding : snowUI.snowText.link.access.addddns.button), 
								 "    ", React.DOM.a({style: {marginBottom:0}, className: "btn btn-default center-block", onClick: _this.showDDNSInput}, "cancel")
							)
						)
						
					)
				);
			} else if(hostname) {
				 var hostb = this.state.data.userSettings.ddnsHostB ? React.DOM.div(null, " ", React.DOM.a({target: "_blank", href: "http://" + this.state.data.userSettings.ddnsHostB}, "  ", this.state.data.userSettings.ddnsHostB, " "), " "): '';
				 
				 var list2 = snowUI.link.sockets + ' open connections.';
				 var linkserver = snowUI.link.state === 'on' ? React.DOM.div(null, React.DOM.a({title: "Only accepts valid requests from snowcoins.link", target: "_blank", href: this.state.data.userSettings.ddnsProtocol +  this.state.data.userSettings.ddnsHost + ':' + snowUI.link.port}, snowUI.link.port), " ", React.DOM.br(null), list2, React.DOM.br(null), React.DOM.a({title: "Test the server out.  This will ping the remote .link server and ask it to check in with our local .link server.", onClick: this.linkPhoneHome}, "Test Connection")) : React.DOM.b(null, ".link off");
				
				 ddns =  (React.DOM.div({className: "col-xs-12 table-responsive"}, 
					
					React.DOM.input({ref: "oldhostname", type: "hidden", value: hostname}), 
					
					React.DOM.table({className: "table snowtablesort"}, 
						 
						React.DOM.thead(null, 
							React.DOM.th(null, "machine "), 
							React.DOM.th(null, "DDNS "), 
							React.DOM.th(null, "Port"), 
							React.DOM.th(null, "IP Address"), 
							React.DOM.th(null, "Last Updated"), 
							React.DOM.th(null, ".link Port"), 
							React.DOM.th({style: {textAlign:'center'}}, "Remove")
						), 
						React.DOM.tbody(null, 
							React.DOM.tr(null, 
								React.DOM.td(null, this.state.data.userSettings.ddnsHostname), 
								React.DOM.td(null, 
									React.DOM.a({target: "_blank", href: 'http://' + this.state.data.userSettings.ddnsHost}, this.state.data.userSettings.ddnsHost), 
									hostb
								), 
								React.DOM.td({dangerouslySetInnerHTML: {__html: this.state.data.userSettings.ddnsPort}}), 
								React.DOM.td(null, this.state.data.userSettings.ddnsIP), 
								React.DOM.td(null, moment(this.state.data.userSettings.ddnsLastUpdated).format("llll")), 
								
								React.DOM.td(null, linkserver), 
								
								React.DOM.td({'data-snowddns': hostname, className: "bg-danger", style: {cursor:'pointer',textAlign:'center'}, onClick: _this.removeDDNS}, React.DOM.span({className: "text-not-white glyphicon glyphicon-remove-sign"}))
							), 
							React.DOM.tr(null, 
								React.DOM.td({colSpan: "5"}, React.DOM.a({className: "btn btn-default btn-sm", onClick: _this.showDDNSInput}, snowUI.snowText.link.access.addddns.addbutton))
							)
						)
					)
				 ));
			} else {
				ddns = (React.DOM.div({className: " link-info"}, React.DOM.p(null, snowUI.snowText.link.access.addddns.absent), React.DOM.a({className: "btn btn-default btn-sm", onClick: _this.showDDNSInput}, snowUI.snowText.link.access.addddns.addbutton)));
			}
				
			
			return (React.DOM.div({style: {padding:'5px 20px'}}, 
				
					React.DOM.div({id: "linkpage", className: "col-md-12  "}, 
						React.DOM.div({style: {padding:'5px 20px'}}, 
							React.DOM.div({className: "col-xs-12 "}, 
								React.DOM.h4({className: "profile-form__heading"}, snowUI.snowText.link.title.text), 
								React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.link.title.info}})
							), 
							React.DOM.div({className: "clearfix"}), 
							React.DOM.div({style: {height:'30px',position:'relative',width:'100%'}}), 
							React.DOM.div({className: "col-xs-12 col-md-6 link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowUI.snowText.link.sharekey.text, 
									React.DOM.a({className: "btn btn-default btn-xs pull-right", onClick: _this.showShareInput}, "Change")
								), 
								React.DOM.div({className: " link-info"}, 
									inputkeyshare
								)
							), 
							React.DOM.div({className: "col-xs-12 col-md-6  link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowUI.snowText.link.sendkey.text, 
									React.DOM.a({className: "btn btn-default btn-xs pull-right", onClick: _this.showSendInput}, "Change")
								), 
								React.DOM.div({className: " link-info"}, 
									inputkeysend
								)
							), 
							React.DOM.div({className: "col-xs-12 link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowUI.snowText.link.linkaccount.text
									
								), 
								React.DOM.div(null, 
									
									ddns
									
								)
							)
						)
						
					)
				)
			);
		
		} else {
			
			return (React.DOM.div(null));
			
		}
		
	},
	
});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */


/**
 * wallet components
 * */
//main
snowUI.wallet.UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		var mystate = {
			config:this.props.config || {section:snowUI.snowPath.wallet,wallet:false,moon:false},
			wally:false,
			testnet:false,
			ready:false,
			connectError:false,
			connected:true,
			connecting:false,
			refresh:false,
		}
		if(this.props.config.section === snowUI.snowPath.wallet && (!this.props.config.wallet || this.props.config.wallet === 'overview')) {
			mystate.connecting = false;
			mystate.connected = true;
		}
		return (mystate)
	},
	
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this,
			sendProps = {config:nextProps.config,connectError:false};

		if(snowUI.debug) snowLog.log('willreceiveprops main wallet',_this.state, nextProps)
		
		//grab the data for this wallet
		 if(this.state.refresh && nextProps.config.moon === 'update') {
				//we have to grab the wallet status on every update
				//this catches any form changes like host or port and make sure they work
				this.grabWallet(nextProps);
				
		} else if(!this.state.connected  || (nextProps.config.wallet  &&  nextProps.config.wallet !== _this.state.config.wallet)) {
			/* got not connected or a new wallet*/
			
			if(snowUI.debug) snowLog.log('grab wallet', nextProps.config.wally)
			
			sendProps.testnet = false;
			
			_this.setState(sendProps)
			
			this.grabWallet(nextProps);
			
		} else if(nextProps.config.wallet && nextProps.config.wallet !== _this.state.config.wallet)  {
			/* got new wallet*/
			if(nextProps.config.wally.name)snowUI.flash('message','Now using wallet '+ nextProps.config.wally.name+'.',4000);
			_this.setState(sendProps)
		
		} else if(!nextProps.config.wallet) {
			/* no wallet*/
			if(snowUI.debug) snowLog.log('no wallet')
			sendProps.connecting = false;
			sendProps.ready = true;
			sendProps.testnet = false;
			_this.setState(sendProps)
			
		} else {
			/* pass through to ready*/
			if(snowUI.debug) snowLog.log('pass through')
			sendProps.ready = true;
			sendProps.connecting = false;
			sendProps.connected = true;
			_this.setState(sendProps)
			
		}
		
		//if(nextProps.config.moon !== _this.state.config.moon)snowUI.methods.fadeOut();
		
		
	},
	grabWallet: function(nextProps,blockcalls) {
		if(nextProps.config.wallet && nextProps.config.wallet !== 'new') {
			
			var _this = this;
			
			//run a status call and set connected state
			snowUI.ajax.GET("/api/snowcoins/local/wallet",{ wallet:nextProps.config.wallet,moon:'status' },function(resp) {
				if(snowUI.debug) snowLog.log('hitting  server new wallet',resp)
				if(resp.success === true)
				{
					
					snowUI.flash('message','Now using wallet '+ nextProps.config.wally.name +'.',4000);
					if(resp.data && resp.data.testnet===true) {
						
						_this.setState({testnet:true,ready:true,connected:true,connecting:false,refresh:false})
						
					} else {
						
						_this.setState({testnet:false,ready:true,connected:true,connecting:false,refresh:false})
					
					}
					
					/* figure out the lock status */
						if(resp.data.unlocked_until === 'Locked')
							var dd = 0;
						else if(resp.data.unlocked_until === 'Not Encrypted')
							var dd = false;
						else if(resp.data.unlocked_until)
							var dd = new Date(resp.data.unlocked_until).getTime();
						else
							var dd = false;
							
						if(dd && isNaN(dd)) dd = false;
					
						if(!blockcalls)snowUI.methods.changelock(dd);
					/* end lock status */
					
				} else {
										
						_this.setState({testnet:false,ready:true,connectError:resp.error,connected:false,connecting:false,refresh:false})
						//snowUI.flash('error','Connection Error... Check wallet configuration.',2500);
						if(snowUI.debug) snowLog.warn('No connection available',nextProps)
					
				}
			
			})
	
		} else {
			this.setState({ready:true,connected:true,connecting:false,refresh:false})
		}		
	},
	componentWillUpdate: function() {
		
		//if(this.props.config.moon !== this.state.config.moon)snowUI.methods.fadeOut();
		//if(!this.props.config.wallet && !this.state.ready) this.setState({ready:true});
	},
	componentDidUpdate: function() {
		if(this.state.connected) 
			$('#walletbar').removeClass('bg-danger')
		else 
			$('#walletbar').addClass('bg-danger')
		//snowUI.methods.fadeIn();
		if(this.state.testnet !== this.props.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	componentWillMount: function() {
		if(!this.props.config.wallet) this.setState({ready:true});			
	},
	componentWillUnMount: function() {
		if(snowUI.debug) snowLog.info('wallet unmounted')
		$('#walletbar').removeClass('bg-danger')
		//snowUI.methods.fadeOut();
				
	},
	componentDidMount: function() {
		
		if(this.state.config.wallet )
			this.grabWallet(this.state);
		
		//snowUI.methods.fadeIn();
		
		if(this.props.config.wally.name)snowUI.flash('message','Now using wallet '+ this.props.config.wally.name +'.',4000);
		
		if(this.state.testnet !== this.props.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	updateState:function(state) {
		this.setState(state);
	},
	render: function() {
			    
		var showcomp = (this.props.config.moon) ? this.props.config.moon : 'skippedmoondostuffotherstuff'
		
		if(snowUI.debug) snowLog.log('main wallet component - current state:',showcomp, this.props,this.state)
		
		var renderMe; 
		
		if(snowUI.wallet[showcomp]) {
			
			if(this.props.config.lockstatus === 2 && showcomp === 'passphrase')showcomp = 'setpassphrase'
			
			renderMe = snowUI.wallet[showcomp]
		
		} else if(this.props.config.wallet) {
			
			if(this.props.config.wallet === 'new') 
				renderMe = snowUI.wallet.add
			else
				renderMe = snowUI.wallet.dashboard

		} else {
			
			renderMe = snowUI.wallet.overview
			
		}     
	    
		if(snowUI.debug) snowLog.log('wallet render component',this.state.connecting,this.props.gates)
	    
		//stop loading
		//snowUI.loaderRender();
		
		if(this.state.connecting) {
			if(snowUI.debug) snowLog.warn('not connected render')
			//snowUI.methods.loaderStart();
			return (React.DOM.div(null))
			
		} else if( this.props.gates.showInfoPage) {
			var message =  this.props.gates.showInfo
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", snowUI.wallet.messageDisplay({type: "requestinfo", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if( this.props.gates.showSuccessPage) {
			var message =  this.props.gates.showSuccess
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", snowUI.wallet.messageDisplay({type: "requestsuccess", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if( this.props.gates.showWarningPage) {
			var message =  this.props.gates.showWarning
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", snowUI.wallet.messageDisplay({type: "requestwarning", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if((!this.state.connected && this.props.config.moon !== 'update' && this.props.config.moon !== 'remove' || this.props.gates.showErrorPage ) ) {
			var message = (this.props.gates.showErrorPage) ? this.props.gates.showError : this.state.connectError
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", snowUI.wallet.connectError({config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
			
		}  else if( !this.state.ready ) {
			
			if(snowUI.debug) snowLog.warn('wallet ui not ready')
			return (React.DOM.div(null))
			
		} else {
			var message = (this.props.showErrorPage) ? this.props.showError : this.state.connectError
			return (
				
				React.DOM.div({className: "reactfade", id: "maindiv"}, " ", renderMe({config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
		}
	}
});

//remove wallet component
snowUI.wallet.remove = React.createClass({displayName: 'remove',
	confirmDelete: function() {
		var confirm = window.prompt(snowUI.snowText.wallet.remove.confirm.text.replace(/{name}/g,this.props.config.wally.name))
		var _this = this;
		if(confirm === this.props.config.wally.name) {
			if(snowUI.debug) snowLog.warn('Deleting wallet ',this.props.config.wally.name,this.props)
			
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/remove-wallet"
			var data = {'action':'remove',removeKey:snowUI._wallets[this.props.config.wally.key].removeKey,wally:this.props.config.wally.key}
			
			var errorDiv = $('#removeerror')
			
			errorDiv.hide()
			
			snowUI.ajax.GET(url,data,function(resp) {
				console.info(resp)
				if(resp.success === true) {			
					
					snowUI.flash('success',snowUI.snowText.wallet.remove.removed.success.text.replace(/{name}/g,_this.props.config.wally.name),7000)
					snowUI.methods.valueRoute(snowUI.snowPath.wallet);
				
				} else {
					if(resp.error)errorDiv.fadeIn().html(resp.error)
					snowUI.flash('error',snowUI.snowText.wallet.remove.removed.success.text.replace('{name}',_this.props.config.wally.name),3000);
				}
			});
				
				
		} else if(confirm && confirm !== this.props.config.wally.name) {
			snowUI.flash('error',snowUI.snowText.wallet.remove.removed.wrong.text,10000);
		} else {
			return false
		}
	},
	componentDidMount: function() {
		//snowUI.loaderRender();
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	render: function() {
	    
	    if(snowUI.debug) snowLog.log('remove wallet component')
	    _this = this;
	    var message = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ?  snowUI.snowText.wallet.remove.goodinfo.text.replace('{name}',_this.props.config.wally.name) :  snowUI.snowText.wallet.remove.badinfo.text.replace('{name}',_this.props.config.wally.name)
	    
	    var btn = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? (React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wally.key, className: "btn btn-default "}, React.DOM.span(null, snowUI.snowText.wallet.remove.btn.cancel))) : ''
	    return (
		React.DOM.div({style: {padding:'10px'}}, 
			React.DOM.div({className: "page-title"}, " ", snowUI.snowText.wallet.remove.title.text + _this.props.config.wally.name), 
			React.DOM.div({className: "", style: {paddingTop:'20px'}}, 
				
				React.DOM.div({key: "adderror3423", className: "adderror", style: {display:'none'}}), 			
				
				React.DOM.p(null, React.DOM.span({dangerouslySetInnerHTML: {__html: message}})), 
				React.DOM.p(null, 
					snowUI.ButtonToolbar(null, 
						
						btn, 
							
						React.DOM.button({onClick: snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? this.confirmDelete : function(){snowUI.methods.valueRoute(snowUI.snowPath.wallet)}, className: "btn btn-danger "}, React.DOM.span(null, snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? snowUI.snowText.wallet.remove.btn.remove:snowUI.snowText.wallet.remove.btn.request))
			
					)
				
				)
			)
		)			
		
	    );
	}
});
//connect error component
snowUI.wallet.messageDisplay = React.createClass({displayName: 'messageDisplay',
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	componentDidMount: function() {
		this.componentDidUpdate()
	},	
	render: function() {
	    
	    if(snowUI.debug) snowLog.log('warning message component')
	    
	    return (React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: this.props.type}, 
				React.DOM.span(null, " ", this.props.title || 'I have an important message for you.'), 
				React.DOM.div({className: "message"}, 
					React.DOM.p(null, this.props.message)
				)
			)
			
		));
	}
});
snowUI.wallet.displayMessage = snowUI.wallet.messageDisplay

//connect error component
snowUI.wallet.connectError = React.createClass({displayName: 'connectError',
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	render: function() {
	    if(snowUI.debug) snowLog.log('connect error component')
	    
	    return (snowUI.wallet.add({config: this.props.config, setWalletState: this.props.setWalletState, message: this.props.message}) );
	}
});

//overview list component
snowUI.wallet.overview = React.createClass({displayName: 'overview',
	menuClick: function(e) {
		
		e.preventDefault();
		
		var moon = $(e.target).parent()[0].dataset.snowmoon;
		
		snowUI.methods.valueRoute(moon);
		
		return false
	},
	
	componentDidUpdate: function() {
		
		snowUI.watchLoader();
	
		snowUI.sortCol('#snow-overview th');
		
	},	
	componentDidMount: function() {
		snowUI.watchLoader();	
		snowUI.sortCol('#snow-overview th');
	},
	
	render: function() {
		if(snowUI.debug) snowLog.log('wallet overview component')
		if(this.props.config.mywallets instanceof Array) {
			var _this = this;
			//loop through our wallets and show a table
			var mytable = this.props.config.mywallets.map(function (w) {
				
				return (
					React.DOM.tr({key: w.key}, 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowUI.snowPath.wallet + '/' + w.key+ '/update'}, React.DOM.span({className: "glyphicon glyphicon-pencil"}, " "))), 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowUI.snowPath.wallet + '/' + w.key+ '/dashboard'},  w.name, " ")), 
						React.DOM.td(null, " ",  w.coin, " "), 
						React.DOM.td(null,  w.address+':'+w.port, " "), 
						React.DOM.td(null, w.isSSL ? React.DOM.span({className: "glyphicon glyphicon-link"}) : ''), 
						React.DOM.td({onClick: _this.deleteWallet, 'data-snowmoon': w.key}, React.DOM.span({onClick: snowUI.deleteWallet, 'data-snowmoon': w.key, style: {cursor:"pointer"}, className: "removewallet text-danger glyphicon glyphicon-remove-sign"}, " "))
					)
				);
			});				
				
		}
		return (
			React.DOM.div({id: "snow-overview", className: "bs-example"}, 
				
				React.DOM.a({className: "btn btn-default btn-sm nav-item-add", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/new'}, "Add New Wallet"), 
				React.DOM.table({className: "table table-hover snowtablesort"}, 
					React.DOM.thead(null, 
						React.DOM.tr({key: "whead"}, 
							React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-pencil"})), 
							React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, "name")), 
							React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, "coin")), 
							React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort"}, "address")), 
							React.DOM.th({className: "snowsortisempty"}, React.DOM.span({className: "glyphicon glyphicon-sort"}, "ssl")), 
							React.DOM.th(null, React.DOM.span({className: "text-danger glyphicon glyphicon-remove-sign"}))
						)
					), 
					React.DOM.tbody(null, 
						mytable
					)
				)
				
		
		
			)			
		
		);
	}
});

//wallet dashboard component
snowUI.wallet.dashboard = React.createClass({displayName: 'dashboard',
	getInitialState: function() {
		
		return {mounted:false,ready:this.props.ready,modals:{encryptModal:false}};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(snowUI.debug) snowLog.log('dashboard will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({data:resp.data,mounted:true,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowLog.log('dashboard did update',this.props)
		snowUI.watchLoader();
	},
	componentDidMount: function() {
		var _this = this
		if(snowUI.debug) snowLog.log('dashboard did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,mounted:true}) })
		
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowLog.log('data',props)
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			if(resp.success === true) {
				cb(resp)
			} else {
				snowUI.flash('error',resp.error,3500)
				_this.props.setWalletState({connectError:true})
			}
		})
		return false
	},
	encryptModal: function() {
		var _this = this,
			modals = _this.state.modals;
		modals.encryptModal = true;
		_this.setState({modals:modals});
		
	},
	closeModals: function() {
		this.setState({modals: {
			encryptModal: false,
			encryptWallet: false,
			backupWallet: false,
			changePassWallet: false,
		}});
	},
	render: function() {
		
		var _this = this
		
		if(snowUI.debug) snowLog.log('wallet dashboard component',this.state.mounted)
		
		if(this.state.mounted) {
			var data = this.state.data;
			
			var loop = (data instanceof Object) ? Object.keys(data) : [];
			var mystatus = loop.map(function(k,v) {
		
				return (
					React.DOM.div({key: k, className: "col-xs-12 col-sm-6 col-md-6"}, 
						React.DOM.div({className: "snow-status snow-block"}, 
							React.DOM.div({className: "snow-block-heading"}, 
								React.DOM.p(null, k)
							), 
							React.DOM.div({className: "snow-status-body"}, 
								React.DOM.p(null, data[k])
							)
						)
					)
				);
			}); 

			var lockdiv;
			if(this.props.config.locked && !this.props.config.unlocked) {
				lockdiv = (
					 React.DOM.div({id: "unlockwalletbutton"}, 
					    "Your wallet is locked", 
					   React.DOM.div(null, 
						React.DOM.a({onClick: snowUI.methods.modals.open.unlockWallet, className: "k"}, React.DOM.span(null, "Unlock Wallet"))
					   ), React.DOM.div(null, 	
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, React.DOM.span(null, "Change Wallet Passphrase"))
					   )	
					   
					 )
				)
			} else if(this.props.config.unlocked) {
				lockdiv = (
				
					React.DOM.div({id: "unlockwalletbutton"}, 
					    React.DOM.p(null, "Your wallet is unlocked for ", React.DOM.span({className: "locktimer"}), " seconds."), 
					    snowUI.ButtonToolbar(null, 
						
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, React.DOM.span(null, "Change Wallet Passphrase"))
						
					    )
					 )
				)
				
			} else if(this.props.config.lockstatus === 2) {
				lockdiv = (
					React.DOM.div({id: "encryptwallet"}, 
						React.DOM.div({id: "encryptwalletbutton"}, 
							React.DOM.p(null, "Your wallet is not secure. Anyone with access to a copy of ", React.DOM.kbd(null, "wallet.dat"), " can send coin without using a passphrase."), 
							React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, "Set Passphrase Now")
						)
					)
				)
			}
			return (
			React.DOM.div({className: "snow-dashboard"}, 
				React.DOM.div({className: "page-title"}, 
					"Dashboard"
				), 
				React.DOM.div({className: "snow-block snow-balance"}, 
					React.DOM.div({className: "snow-block-heading"}, 
						React.DOM.p(null, "balance")
					), 
					React.DOM.div({className: "snow-balance-body"}, 
						React.DOM.p(null, data.balance, " ", React.DOM.span({className: "coinstamp"}, this.props.config.wally.coinstamp, " "))
					)
				), 
				React.DOM.div({className: "col-xs-12 col-sm-6 col-md-6"}, 
					React.DOM.div({className: "snow-block-lg snow-options"}, 
						React.DOM.div({className: "snow-block-heading"}, 
							React.DOM.p(null, "wallet options")
						), 
						React.DOM.div({className: "snow-block-body"}, 
							React.DOM.div(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/backup', className: "backupwalletbutton text-muted"}, "Backup Wallet")), 
							React.DOM.div(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/update', className: "updatecoin"}, "Update ", this.props.config.wally.name.toUpperCase(), "   "))
						)
					)
				), 
				React.DOM.div({className: "col-xs-12 col-sm-6 col-md-6"}, 
					React.DOM.div({className: "snow-block-lg snow-options"}, 
						React.DOM.div({className: "snow-block-heading"}, 
							React.DOM.p(null, "wallet lock status")
						), 
						React.DOM.div({className: "snow-block-body"}, 
							lockdiv
							
							
						)
						
					)
				), 
				React.DOM.div({className: "clearfix"}), 
				React.DOM.div({className: "snow-status"}, 
					mystatus
				)
			)			

			);
		} else {
			return(React.DOM.div(null))
		}
	}
});
//backup
snowUI.wallet.backup = React.createClass({displayName: 'backup',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentWillMount: function() {
		this.setState({snowbackupname:this.props.config.snowbackupname});
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		
		e.preventDefault();
		
		_this = this
		
		_this.setState({requesting:true});
		
		if(snowUI.debug) snowLog.log('backup wallet')
		
		if(_this.state.snowbackupname)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var fpath = _this.state.snowbackuplocation + '/' + _this.state.snowbackupname
			var data = { checkauth:nowtime,wallet: _this.props.config.wallet,command:'backup',filepath:fpath}
			
			var errorDiv = $(_this.refs.snowbackuplocation.getDOMNode()).parent().parent().parent().find('.adderror')
			var successDiv = $(_this.refs.snowbackuplocation.getDOMNode()).parent().parent().parent().find('.addsuccess')
			
			errorDiv.fadeOut()
			successDiv.fadeOut()
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					
					snowUI.flash('success','Wallet backed up',1000);
					var html='Your wallet was backed up successfully to:<br />' + fpath + ' ';
					
					successDiv.fadeIn().html(html)
					_this.setState({requesting:false});
					//snowUI.methods.modals.backupWallet.close()
					
				} else {
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
					//snowUI.methods.updateState({connectError:true})
				}
			})
		}
	},
	render: function() {
	    
		_this = this
	    
		var encrypt = function(){ if(_this.props.config.lockstatus === 2 ) return (React.DOM.button({type: "button", onClick: function(){snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase')}, className: "btn btn-info pull-right"}, "Set Passphrase Now") ); else return '' }
	   
		if(snowUI.debug) snowLog.log('backup component')
	    
	    
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate() : date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes() : date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds() : date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours() : date.getHours();
	
		var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+this.props.config.wally.key+'.dat.bak';
	    
		return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Backup " + this.props.config.wally.name)
			), 	
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "backupform", onSubmit: this.request}, 
					React.DOM.div({id: "backupdiv"}, 
						React.DOM.div({style: {display:'none'}, className: "adderror"}), 
						React.DOM.div({style: {display:'none'}, className: "addsuccess"}), 
						React.DOM.div({role: "form", className: "row"}, 
							React.DOM.p(null, 
								"Enter an optional directory without trailing slash", '(/)', "." 
							), 
							React.DOM.p(null, " Your wallet decides how to process the file.  For RPC a backup is created where the RPC server is.   ")
						), 
						React.DOM.div({role: "form", className: "row"}, 
							React.DOM.div({className: !this.state.snowbackuplocation  ? 'form-group input-group ':'form-group input-group'}, 
								React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Directory")), 
								React.DOM.input({id: "snowbackuplocation", ref: "snowbackuplocation", placeholder: "/remote/path", className: "form-control coinstamp", valueLink: this.linkState('snowbackuplocation')})
							), 
							React.DOM.div({className: !this.state.snowbackupname  ? 'form-group input-group has-error':'form-group input-group'}, 
								React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "File Name")), 
								React.DOM.input({id: "snowbackupname", ref: "snowbackupname", placeholder: fname, className: "form-control coinstamp", valueLink: this.linkState('snowbackupname')})
							), 
							React.DOM.div({className: "form-group"}, 
								snowUI.ButtonToolbar(null, 
									React.DOM.button({disabled: (this.state.requesting ||  this.state.snowbackupname  ) ? '' : 'disabled', id: "backupwalletsubmit", className: "btn ", rel: "backupwalletsubmit"}, this.state.requesting ? 'Backing Up...' : 'Backup'), 
								
									React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel"), 
									encrypt()
								)
							)
						)
						
					)
					
				)
			)	
		)				
		
	    );
	}
});
//change passphrase
snowUI.wallet.passphrase = React.createClass({displayName: 'passphrase',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		
		e.preventDefault();
		
		_this = this
		
		_this.setState({requesting:true});
		
		if(_this.state.currentphrase && _this.state.changephrase)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var data = { checkauth:nowtime,wallet: _this.props.config.wally.key,command:'changepassphrase',oldpassphrase:_this.refs.currentphrase.getDOMNode().value.trim(),newpassphrase:_this.refs.changephrase.getDOMNode().value.trim(),confirm:_this.refs.confirmphrase.getDOMNode().value.trim()}
		
			var errorDiv = $(_this.refs.currentphrase.getDOMNode()).parent().parent().find('.adderror')
				
			errorDiv.fadeOut()
			
			var successDiv = $(_this.refs.currentphrase.getDOMNode()).parent().parent().find('.addsuccess')
				
			successDiv.fadeOut()
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true)
				{
					snowUI.flash('success',''+ _this.props.config.wally.name+' passphrase changed. ',2500);
					successDiv.fadeIn().html(_this.props.config.wally.name+' passphrase changed.');
				}
				else
				{
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
				}
				
			})
		}
	},
	render: function() {
	    
	    _this = this
	    
	    var isP = snowUI.methods.forms.passwordORnot.call(this).toString()
	    var toggle = isP === 'text' ? snowUI.snowText.ui.hidepassphrase : snowUI.snowText.ui.showpassphrase;
	    
	    if(snowUI.debug) snowLog.log('change pass component',isP)
	    return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Change passphrase for " + this.props.config.wally.name)
			), 
				
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "changewalletpassform", onSubmit: this.request}, 
					React.DOM.div({style: {display:'none'}, className: "adderror"}), 
					React.DOM.div({style: {display:'none'}, className: "addsuccess"}), 
					React.DOM.p(null, "Enter your current passphrase first"), 
					React.DOM.div({className: !this.state.currentphrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "currentphrase", ref: "currentphrase", placeholder: "current  passphrase", className: "form-control coinstamp", valueLink: this.linkState('currentphrase')})
					), 
					React.DOM.p(null, "Enter your new passphrase and confirm"), 
					React.DOM.div({className: !this.state.changephrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "changephrase", ref: "changephrase", placeholder: "new passphrase", className: "form-control coinstamp", valueLink: this.linkState('changephrase')})
					), 
					React.DOM.div({className: !this.state.confirmphrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Confirm")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "confirmphrase", ref: "confirmphrase", placeholder: "confirm passphrase", className: "form-control coinstamp", valueLink: this.linkState('confirmphrase')})
					), 
					
					React.DOM.p({style: {textAlign:'right'}}, React.DOM.a({onClick: snowUI.methods.togglePassFields}, " ", toggle, " ")), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting ||  !this.state.currentphrase  || (this.state.changephrase  !== this.state.confirmphrase )) ? 'disabled' : '', id: "confirmchangepassphrase", className: "btn "}, this.state.requesting ? 'Changing...' : 'Change Passphrase'), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel")
					)
				)
			)	
		)				
		
	    );
	}
});
//change passphrase
snowUI.wallet.setpassphrase = React.createClass({displayName: 'setpassphrase',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		e.preventDefault();
		_this = this
				
		_this.setState({requesting:true});
		if(snowUI.debug) snowLog.log('encrypt wallet')
		
		if(_this.state.epassword)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var data = { checkauth:nowtime,wallet:_this.props.config.wally.key,command:'encrypt',p1:_this.state.epassword,p2:_this.state.econfirm}
			
			var errorDiv = $(_this.refs.epassword.getDOMNode()).parent().parent().find('.adderror')
			
			errorDiv.fadeOut()
			
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					
					snowUI.methods.updateState({requesting:false,gates:{showInfoPage:true,showInfo:resp.msg}});
					snowUI.flash('success','Wallet encrypted',5000);
					setTimeout(function(){snowUI.methods.changelock(0);},2000)
					
					
					
				} else {
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
					//snowUI.methods.updateState({connectError:true})
				}
			})
		}
	},
	render: function() {
	    var _this = this;
	    if(snowUI.debug) snowLog.log('change pass component')
	    return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Set passphrase for " + this.props.config.wally.name)
			), 
				
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "setwalletpassform", onSubmit: this.request}, 
					React.DOM.div({style: {display:'none'}, className: "adderror"}), 
					React.DOM.p({style: {fontWeight:'bold'}}, "Your wallet software will have to stop to encrypt.  Be sure you can restart it before you continue."), 
					
					React.DOM.div({className: !this.state.epassword || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "required", id: "epassword", ref: "epassword", placeholder: "enter pass phrase", className: "form-control coinstamp", valueLink: this.linkState('epassword')})
					), 
					React.DOM.div({className: !this.state.econfirm  || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Confirm")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "required", id: "econfirm", ref: "econfirm", placeholder: "confirm pass phrase", className: "form-control coinstamp", valueLink: this.linkState('econfirm')})
					), 
					React.DOM.div({className: "form-group"}, 
					
						React.DOM.p({style: {textAlign:'right'}}, React.DOM.a({onClick: snowUI.methods.togglePassFields}, " Toggle Password Fields ")), 
					
						React.DOM.p(null, "Do ", React.DOM.strong(null, "NOT"), " lose this pass phrase or you will lose your coin.  To be secure you must delete all your old unencrypted backups."), 
					
						snowUI.ButtonToolbar(null, 
							
							React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel"), 
							
							React.DOM.button({disabled: (this.state.requesting || !this.state.epassword || this.state.epassword  !== this.state.econfirm ) ? 'disabled' : '', id: "confirmencrypt", rel: "confirmencrypt", className: "btn  pull-left"}, this.state.requesting ? 'Encrypting... be patient' : 'Encrypt Wallet')
							
						)
					)
				
				)
			)	
		)				
		
	    );
	}
});



/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */


//add new wallet component
snowUI.wallet.add = React.createClass({displayName: 'add',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {
			validated:false,
			refresh:false,
			port:22555
		} 
	},
	componentWillReceiveProps: function (nextProps) {
		
		if(snowUI.debug) snowLog.log('add/update will receive props',nextProps.config.wally)
		
		if(this.state.refresh || (nextProps.config.wally && nextProps.config.wally.key)) {
			this.setState({refresh:false})
			this.setState(nextProps.config.wally)
			this.validator(nextProps.config.wally)
			if(snowUI.debug) snowLog.log(this.state)
			
			return false;
		}
			
		errorDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.adderror').fadeOut()
		successDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.addsuccess').fadeOut()
		
		var newP = Object.keys(this.state),
			newState={};
		
		newP.forEach(function(v) {
			if(v!='requesting')newState[v] = ''
		})
		
		this.setState(newState)
		
	
		
		return false;
		
	},
	componentWillMount: function() {
		if(snowUI.debug) snowLog.log('add/update will mount')
		this.setState(this.props.config.wally)
		this.validator(this.props.config.wally)
	},
	componentWillUnMount: function() {
		if(snowUI.debug) snowLog.log('add/update un-mounted')
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.log('add/update will update')
		this.validator(this.state)
		snowUI.watchLoader()
		
	},
	
	validator: function(state) {
			
		if(state.key && state.name && state.address && state.port && state.coin) {
			
			if(!state.validated) {
				if(snowUI.debug) snowLog.log('update wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else if(state.name && state.port && state.coin && state.address && ((state.apiuser && state.apipassword) || state.apikey)) {
			
			
			if(!state.validated){
				if(snowUI.debug) snowLog.log('new wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else {
			
			
			if(state.validated){
				if(snowUI.debug) snowLog.log(' wally not validated',this.state.validated)
				this.setState({validated:false});
			}
		}
	},
	componentDidMount: function() {
		/* jquery-ui autocompletes */
		var _this = this
		$( this.refs['aw-coin'].getDOMNode()).autocomplete({ source: snowUI.defaultcoins,minLength:0,select: function( event, ui ) {
			_this.setState({'coin':ui.item.value})
			//if(snowUI.debug) snowLog.info(event,ui)
		}}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$( this.refs['aw-cointicker'].getDOMNode()).autocomplete({ source: snowUI.defaultcointickers,minLength:0 }).focus(function(){$(this).autocomplete('search', $(this).val())});
		
		snowUI.loaderRender();
		
	},
	shouldComponentUpdate: function() {
		if(snowUI.debug) snowLog.info('wallet form will update',!this.state.stopUpdate);
		return !this.state.stopUpdate
	},
	walletForm: function(e) {
		
		e.preventDefault();
		
		var formData = $( e.target ).serialize();
		
		if(snowUI.debug) snowLog.log('wallet form',formData);
		
		if(this.state.validated)
		{
			var _this = this
			
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/add-wallet"
			var data = formData
			
			var errorDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.adderror')
			var successDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.addsuccess')
			
			errorDiv.hide()
			successDiv.hide()
			//set the state so we do not update until i am ready
			
			this.setState({validated:false,stopUpdate:true});
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					_this.setState({validated:true,refresh:true});
					
					if(_this.state.key) {
						
						//snowUI.loadingStart();
						//snowUI.fadeRenderOut();	
						bone.async.eachSeries(
						[
							function(next) {
								successDiv.fadeIn().html('Wallet updated');							
								_this.props.setWalletState({refresh:true})
								
								
								next()
							},
							function(next) {
								
								//update the wallets with the new data
								var _wallets = _this.props.config.mywallets,
									_locate = _this.props.config.locatewallet.indexOf(resp.wally.key)
								
								_wallets[_locate] = resp.wally;
								
								snowUI.methods.updateState({'mywallets':_wallets,wally:resp.wally});
								
								next()
								
							},
							function(next) {
								
								console.log(resp.wally)
								_this.setState(resp.wally);
								next()
							},
						
						], function(callback, next) {
							
							return callback.apply(_this, [next]);
						
						}, function() {
							
							//  refresh
							//set connected off so we can reset the ui
							
							//allow update rendering
							_this.setState({stopUpdate:false});
							snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + resp.wally.key + '/update',true)
							
							//snowUI.flash('success','Wallet is Updating',1500)
						
						});
						
								
						
						
					} else {
						_this.setState({stopUpdate:false});
						snowUI.flash('success','New wallet created.',3000)
						snowUI.methods.resetWallets(_this.props.config,function() {
							snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + resp.wally.key )	
						})
						
						
					}
					
				} else {
					
					snowUI.flash('error','Form Error',3500)
					var error
					if (typeof resp.err === 'object') {
						error = resp.err.messag
						var keys = Object.keys(resp.err.errors)
						keys.forEach(function(v) {
							error+='<br /> '+ resp.err.errors[v].message
						})
					} else {
						error = resp.err
					}
					errorDiv.fadeIn().html(error);
					_this.setState({validated:true,stopUpdate:false});
					
				}
				
			})
		}
		
		
	},
	changeWatch: function(e) {
		var value = parseFloat(this.refs['aw-watching'].getDOMNode().value)
		console.log(value)
		var watch = $('.watchWatch'),
			timer = $('.watchInterval')
		watch.toggle(false);
		timer.toggle(false);
		if(value === 2) {
			watch.toggle(400);
		} else if(value === 1) {
			timer.toggle(400);
		} else {
			
		}
	},
	render: function() {
	    
	    
	    _this = this
	    
	    if(snowUI.debug) snowLog.log('wallet add component',this.state,this.props.config.wally)
	    var errormessage,title;
	    if(this.props.message) {
		    errormessage = (snowUI.wallet.messageDisplay({message: this.props.message, type: "requesterror", title: "Please check your configuration"}));
		    title = false
	    } else {
		    title = (React.DOM.div({className: "page-title "}, 
					this.props.config.wally.key ? 'Update ' + this.props.config.wally.name : 'Add A Wallet'
			     ))
	    }
	   
	    
	    var changeorencrypt = this.props.config.lockstatus === 2 ? 'Turn Encryption On':'Change  Passphrase'
		
		var walletbuttons = !this.state.key ? '' : (snowUI.ButtonToolbar(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/backup', className: "btn btn-default btn-sm pull-left"}, React.DOM.span(null, "Backup")), 
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: "btn btn-default btn-sm pull-left"}, React.DOM.span(null, changeorencrypt)), React.DOM.a({onClick: snowUI.deleteWallet, 'data-snowmoon': this.props.config.wally.key, className: "btn btn-danger btn-sm pull-right"}, React.DOM.span(null, "Delete"))))
	    return (
		React.DOM.div({id: "", style: {padding:'35px 20px'}, className: "row"}, 
			errormessage, 
			React.DOM.form({onSubmit: this.walletForm}, 
				title, 
				
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					walletbuttons, 
					React.DOM.div({key: "adderror23", className: "adderror", style: {display:'none'}}), 
					React.DOM.div({key: "addsuccess23", className: "addsuccess ", style: {display:'none'}})
				), 
				React.DOM.div({className: "clearfix"}), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.name ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Name")), 
						React.DOM.input({type: "text", name: "name", valueLink: this.linkState('name'), ref: "aw-name", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.coin ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Coin")), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", name: "coin", valueLink: this.linkState('coin'), ref: "aw-coin", className: "form-control coinstamp input input-labelled input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Stamp")), 
						React.DOM.input({type: "text", name: "coinstamp", defaultValue: this.props.config.wally.coinstamp, ref: "aw-coinstamp", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Fiat")
						), 
						React.DOM.select({name: "currency", value: this.props.config.wally.currency, ref: "aw-currency", className: "form-control coinstamp input-labelled input-faded"}, 
						React.DOM.option({value: "usd"}, "USD"), 
						React.DOM.option({value: "eur"}, "EUR")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Ticker")
						), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", name: "cointicker", defaultValue: this.props.config.wally.cointicker, ref: "aw-cointicker", className: "form-control coinstamp input input-labelled input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Api")
						), 
						React.DOM.select({name: "coinapi", defaultValue: this.props.config.wally.coinapi, ref: "aw-coinapi", className: "form-control coinstamp"}, 
						React.DOM.option({value: "rpc"}, "rpc")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.address ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
						React.DOM.div({style: {width:55,marginLeft:-5}}, "Host")), 
						React.DOM.input({type: "text", name: "address", valueLink: this.linkState('address'), ref: "aw-address", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "SSL")
						), 
						React.DOM.select({name: "isSSL", defaultValue: this.props.config.wally.isSSL ? "1":"0", ref: "aw-ssl", className: "form-control coinstamp"}, 
						React.DOM.option({value: "0"}, "No"), 
						React.DOM.option({value: "1"}, "Yes")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " CA File ")
						), 
						React.DOM.input({type: "text", name: "ca", defaultValue: this.props.config.wally.ca, ref: "aw-ca", placeholder: "full file path", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (this.state.port) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " Port ")
						), 
						React.DOM.input({type: "number", name: "port", valueLink: this.linkState('port'), ref: "aw-port", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (this.state.apiuser || this.state.apikey || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " User")
						), 
						React.DOM.input({type: "text", name: "apiuser", valueLink: this.linkState('apiuser'), ref: "aw-apiuser", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: ((this.state.apipassword && !this.props.config.wally.key) || (this.state.apikey ) || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-8,marginRight:3}}, " Pass or Pin")
						), 
						React.DOM.input({type: "text", name: "apipassword", valueLink: this.linkState('apipassword'), ref: "aw-apipassword", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (!this.state.apiuser && !this.state.apikey && !this.props.config.wally.key) ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " API Key")
						), 
						React.DOM.input({type: "text", name: "apikey", valueLink: this.linkState('apikey'), ref: "aw-apikey", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Watch")
						), 
						React.DOM.select({onChange: this.changeWatch, name: "watching", defaultValue: this.props.config.wally.watching, ref: "aw-watching", className: "form-control coinstamp"}, 
						React.DOM.option({value: "0"}, "No"), 
						React.DOM.option({value: "1"}, "Yes; by timer"), 
						React.DOM.option({value: "2"}, "Yes; by watching a file")
						)
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 1 ? "col-sm-10 col-sm-offset-1 col-md-10 watchInterval  ":"col-sm-10 col-sm-offset-1 col-md-10 watchInterval nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "  Timer ")
						), 
						React.DOM.input({type: "text", name: "interval", defaultValue: this.props.config.wally.interval, ref: "aw-interval", placeholder: "interval time", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " Path ")
						), 
						React.DOM.input({type: "text", name: "watchpath", defaultValue: this.props.config.wally.watchpath, ref: "aw-watchpath", placeholder: "file path without trailing slash (\\)", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "  File ")
						), 
						React.DOM.input({type: "text", name: "watchfile", defaultValue: this.props.config.wally.watchfile, ref: "aw-watchfile", placeholder: "interval time", defaultValue: "wallet.dat", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group"}, 
						snowUI.ButtonToolbar(null, 
						React.DOM.input({type: "hidden", name: "key", ref: "aw-key", value: this.props.config.wally.key}), 
						React.DOM.button({type: "submit", disabled: !this.state.validated ? 'disabled' : '', className: "addwalletbutton btn  awbutton"}, this.state.requesting ? (this.props.config.wally.key ? 'Updateing Wallet' : 'Ading Wallet...') : (this.props.config.wally.key ? 'Update Wallet' : 'Add Wallet')), 
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet, className: "btn btn-default btn-sm pull-right"}, React.DOM.span(null, "Cancel"))
						)
					)
				), 
				React.DOM.div({className: "clearfix"})
			), 
                React.DOM.div({className: "clearfix"})
                )			
		
	    );
	}
});
//update copies add... go figure
snowUI.wallet.update = snowUI.wallet.add;

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */


snowUI.wallet.accounts = React.createClass({displayName: 'accounts',
	_remember: {},
	getInitialState: function() {
		
		var _this = this;
		snowUI.methods.wallet.accounts = {
			newAddressCall: function (wallet,moon,account) {
				var _this = this
				if(snowUI.debug) snowLog.log('grab new address')
				var time=new Date()-2;
				var url = "/api/snowcoins/local/wallet",
					data = { wallet:wallet,moon:moon,account:account,createaddress:'now',checkauth:time},
					_this = this;
				$('.dynamic').fadeOut('slow').html('')
				snowUI.ajax.GET(url,data,function(resp) {
					console.log(resp)
					if(resp.success === true) {
			       			_this.setState({userSettings:resp.userSettings,data:resp.data},function() {
							$('[data-snowaddress="'+resp.info.newaddress+'"]').addClass('bs-success')
							snowUI.flash('success',resp.msg,3500)
							
							setTimeout(function() {
								$('[data-snowaddress="'+resp.info.newaddress+'"]').removeClass('bs-success')
							},12000);
						})
						
					} else {
						snowUI.flash('error',resp.error,3500)
					}
				})
				return false
			}.bind(_this),
			moveToAccountCall: function (form) {
				if(snowUI.debug) snowLog.log('move coin to account')
				var time=new Date()-2;
				var mybtn = $('#'+form+' button')
				var movefrom = $('#'+form+' #movefrom').val()
				var moveto = $('#'+form+' #moveto').val()
				var moveamt = $('#'+form+' #moveamount').val()
				var _this = this,
					url = "/api/snowcoins/local/wallet",
					data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,toaccount:moveto,fromaccount:movefrom,amount:moveamt,movecoin:'now',checkauth:time};
				
				mybtn.prop('disabled', true)
				var oldval = mybtn.text()
				mybtn.text('Moving Coin...')
				snowUI.ajax.GET(url,data,function(resp) {
					console.log(resp)
					if(resp.success === true) {
						_this.setState({userSettings:resp.userSettings,data:resp.data},function() {
							snowUI.flash('success',resp.msg,3500)
							$('.dynamic').fadeOut('slow').html('')
							var minus = $('.eachaccount.'+movefrom.replace(' ','SC14')).find('.balance');
							minus.addClass('bs-danger')
							_this._remember.minus = minus.html()
							minus.html('move '+moveamt+'')
							
							var plus = $('.eachaccount.'+moveto.replace(' ','SC14')).find('.balance');
							plus.addClass('bs-success')
							_this._remember.plus = plus.html()
							plus.html('get '+moveamt)
							
							console.log('move coin',movefrom.replace(' ','SC14'))
							setTimeout(function() {
								
								minus.html(_this._remember.minus)
								plus.html(_this._remember.plus)
							},8000);
							setTimeout(function() {
								$('.eachaccount.'+movefrom.replace(' ','SC14')).find('.balance').removeClass('bs-danger')
								$('.eachaccount.'+moveto.replace(' ','SC14')).find('.balance').removeClass('bs-success')
								
							},12000);
							
						})
					} else {
						mybtn.prop('disabled', false);
						mybtn.text(oldval)
						snowUI.flash('error',resp.error.error.message,3500)
						
					}
				})
				return false
			}.bind(_this),
		}
		
		return {shortcuts:{},genericModal:false,modal:{},showHelp:false,requesting:false,mounted:false,ready:this.props.ready,modals:{addAddressModal:false},openMore:{},userSettings:{}};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(snowUI.debug) snowLog.log('accounts will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({userSettings:resp.userSettings,data:resp.data,mounted:true,shortcuts:resp.shortcuts,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowLog.log('accounts did update',this.props)
		snowUI.watchLoader();
		$('[rel=qrpopover]').popover();
	},
	componentDidMount: function() {
		var _this = this
		if(snowUI.debug) snowLog.log('accounts did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts,mounted:true}) })
		$(document).on('click','.dropzone',function(e) {
			_this.dropZone(e)
			if(snowUI.debug) snowLog.log('drop address')
		})
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	statics: {
		
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowLog.log('account data',props)
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this; 
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			if(resp.success === true) {
				cb(resp)
			} else {
				snowUI.flash('error',resp.error,3500)
				_this.props.setWalletState({connectError:true})
			}
		})
		return false
	},
	newAddress: function(e) {
		e.stopPropagation()
		var EA = $(e.currentTarget).closest('.eachaccount')
		
		var f = EA.find('.dynamic')
		var snowkey = EA.attr('data-snowaccount')
		
		$('.dynamic').not(f).hide();
	
		f.html('<button class="btn btn-info btn-sm" onClick="snowUI.methods.wallet.accounts.newAddressCall(\''+this.props.config.wallet+'\',\''+this.props.config.moon+'\',\''+snowkey+'\')">'+snowUI.snowText.accounts.new.createAddressBtn+'</button> &nbsp; <a  type="button"  onClick="$(\'.eachaccount.'+snowkey.replace(' ','SC14')+'\').find(\'.dynamic\').toggle(\'slow\').html(\'\')"  class="btn btn-default btn-sm">Cancel</a>')
		f.toggle(400)
	},
	moveToAccount: function(e) {
		var _this = this;
		
		var EA = $(e.currentTarget).closest('.eachaccount')
		
		var f = EA.find('.dynamic')
		
		var snowkey = EA.attr('data-snowaccount').replace(' ','SC14')
		
		$('.dynamic').not(f).hide();
		
		var acc = e.currentTarget.dataset.snowtoacc ? 'to  ' + e.currentTarget.dataset.snowtoacc:''
		if(e.currentTarget.dataset.snowamount) {
			var amt = ('<div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">Amount</span><input  id="moveamount"  placeholder="'+e.currentTarget.dataset.snowamount+'" class="form-control coinstamp" /></div>')
			var buttonText = this.state.requesting ? 'Moving '+e.currentTarget.dataset.snowamount+' coin to ' + e.currentTarget.dataset.snowtoacc : 'Move  coin ' + acc
			var title = 'Move Coin Between Accounts'
		} else {
			var buttonText = this.state.requesting ? 'Moving '+e.currentTarget.dataset.snowfromacc+' to ' + e.currentTarget.dataset.snowtoacc : 'Move ' + acc
			var title = 'Move Address'
			var amt = ''
		}
		
		var buttonAble = this.state.requesting ? 'disabled' : ''
		var random = Math.random().toString(36).slice(2)
		var html = ('<div id="'+random+'"><div class="col-xs-12 "><h5 class="profile-form__heading">' + title + '</h5></div><div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">From</span><input readonly="readonly" id="movefrom" placeholder="from" value="'+e.currentTarget.dataset.snowfromacc+'" class="form-control coinstamp" /></div>')
		
		var readonly = e.currentTarget.dataset.snowtoacc !== '' ? 'readonly="readonly"':''
		
		html+=('<div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">To</span><input ' + readonly + ' name="to" id="moveto" value="'+e.currentTarget.dataset.snowtoacc+'" class="form-control coinstamp" /></div>')
		
		
		
		html+=(amt + '<button class="btn btn-info btn-sm" ' + buttonAble + '  onClick="snowUI.methods.wallet.accounts.moveToAccountCall(\''+random+'\')">' + buttonText + '</button><a  type="button"  onClick="$(\'.eachaccount.'+snowkey+'\').find(\'.dynamic\').toggle(\'slow\').html(\'\')"  class="btn btn-default pull-right">Cancel</a></div>')
		
		f.html(html)
		
		if(f.css('display')!=='block')f.toggle('slow')
		
	},
	newAccount: function(e) {
		var newaccount = prompt(snowUI.snowText.accounts.new.promptAccount)
		if(newaccount) {
			this.newAccountCall(newaccount)
		}
	},
	newAccountCall: function(account) {
		var _this = this
		if(snowUI.debug) snowLog.log('new account call')
		
		var fixed = account.replace(' ','SC14')
		
		var time=new Date()-2;
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,account:account ,createaddress:'now',checkauth:time},
			_this = this;
		snowUI.ajax.GET(url,data,function(resp) {
			
			if(resp.success === true) {
				_this.setState({data:resp.data},function() {
					snowUI.flash('success',resp.msg,3500)
					$('.eachaccount.'+fixed).find('.details').addClass('bs-success')
					setTimeout(function() {
						$('.eachaccount.'+fixed).find('.details').removeClass('bs-success')
					},12000);	
					
				})
			} else {
				snowUI.flash('error',resp.error,3500)
			}
		})
		return false
	},
	closeDynamic: function() {
		$('.dynamic').hide().html('');
		$('.dynamic').removeClass('open');
	},
	closeAll: function() {
		$('.dynamic').hide().html('');
		$('.addresses').hide();
		$('.addresses,.dynamic').removeClass('open');
	},
	openAll: function() {
		$('.addresses').hide();
		$('.addresses').toggle('slow');
		$('.addresses').addClass('open');
	},
	_showAllAddresses: false,
	toggleAllAddresses :  function() {
		if(this._showAllAddresses) {
			this._showAllAddresses = false;
			this.dropEnd()
			this.closeAll()
		} else {
			this._showAllAddresses = true;
			this.openAll()
		}
	},
	toggleAddresses: function(e) {
		e.stopPropagation()
		this.dropEnd()
		var f = $(e.currentTarget).closest('.eachaccount').find('.addresses')
		f.toggleClass('open')
		f.toggle(500)
	},
	drop: function(e) {
		
		var f = $(e.target);
		
		if(f.hasClass('hackit') === true) {
			
			f.removeClass('hackit')
		} else {
			f.addClass('hackit')
			f.find('.dropdown-toggle').dropdown("toggle");
		}
	},
	showAddress: function(e) {
		var ea = $(e.currentTarget).closest('.eachaddress')
		var drag = ea.attr('draggable');
		if(drag === 'true') {
			ea.attr('draggable','false') 
			$(e.currentTarget).prev().css('cursor','text')
		} else {
			ea.attr('draggable','true')
			$(e.currentTarget).prev().css('cursor','move')
		}
		ea.toggleClass('bigaddress')
		ea.removeClass('bigbalance')
	},
	showBalance: function(e) {
		var ea = $(e.currentTarget).closest('.eachaddress')
		ea.toggleClass('bigbalance')
		ea.removeClass('bigaddress')
	},
	_sort: {
		sortaccount: {
			asc:'a-z',
			desc:'z-a',
			will:'desc'
		},
		sortbalance: {
			asc:'0-9',
			desc:'9-0',
			will:'asc'
		},
		sortaddresses: {
			asc:'0-9',
			desc:'9-0',
			will:'asc'
		},
	},
	sortCols: function(e) {
		
		var who = $(e.currentTarget).attr('data-snowwho')	
		
		var table = $('.eachaccount').not('.skip').removeClass('sortaccount sortbalance sortaddresses').addClass(who).toArray()
		
		var rows = table.sort(snowUI.comparer)
		
		if (this._sort[who].will === 'desc'){
			rows = rows.reverse()
			$(e.currentTarget).parent().find('#'+who+'by').text(this._sort[who].asc)
			this._sort[who].will='asc'
		} else { 
			$(e.currentTarget).parent().find('#'+who+'by').text(this._sort[who].desc)
			this._sort[who].will='desc'
		}
		var fill = $('#listaccounts')
		fill.not('.skip').remove('.eachaccount');
		for (var i = 0; i < rows.length; i++){fill.append(rows[i])}
	},
	setHelp: function(e) {
		this.setState({showHelp:!this.state.showHelp});
		this.showShortcut(e,true,!this.state.showHelp);
		return false;
	},
	showShortcut: function(e,force,show) {
		
		if(snowUI.debug) snowLog.info('show shortcut e',e);
		
		var parent = $(e.target).closest('.eachaddress');
		var account = parent.closest('.eachaccount').attr('data-snowtrueaccount')
		var address = parent.attr('data-snowaddress');
		if(snowUI.debug) snowLog.info(show,'show help for shortcut');
		var showhelp = show !== undefined ? show : this.state.showHelp;
		var helptext = (showhelp) ? {
			a:(React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.shortcut.text}})),
			b:(React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.sign.text}}) ),
			c:(React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.signphrase.text}}) ),
			d:(React.DOM.div({className: "", dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.lock.lock}})),
			e:(React.DOM.div({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.type.info}})),
			text: 'Hide Help',
		} : {text:'Show Help'};
		
		var html2;
		if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey) {
			html2 = (React.DOM.div(null, React.DOM.p(null, "You can ", React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.link}, " create and add a .link account "), " to give out shortcuts that do not require you expose your wallet manager to the internet. .link will create a seperate server to communicate on and only accept requests from pre-defined source.")));
		}
		
		var html3,html4;
		if(snowUI.link.state === 'off') {
			if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey)
				html4 = React.DOM.span({className: "pull-left", dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.nolink.localon.replace('{link}', snowUI.snowPath.share).replace('{linktext}',snowUI.snowPath.share)}})
					
			html3 = (React.DOM.div({className: "bg-danger"}, 
					html4, 
					React.DOM.span({className: "pull-right"}, 
					 React.DOM.span({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.nolink.linkoff}}), 
					 React.DOM.a({href: snowUI.snowPath.link, onClick: snowUI.methods.hrefRoute}, 
						React.DOM.span({dangerouslySetInnerHTML: {__html: snowUI.snowText.accounts.address.moreinfo.nolink.turnon}})
					 )
					), 
					React.DOM.div({className: "clearfix"})
				));
		}
		
		var linkname = (this.state.userSettings.linkName) ? React.DOM.span({className: "input-group-addon "}, React.DOM.span({style: {fontSize:'16px'}}, " . "), this.state.userSettings.linkName, React.DOM.span({style: {fontSize:'16px'}}, " .")) : React.DOM.span({className: "input-group-addon "}, snowUI.snowPath.share, "/")
		
		if(snowUI.debug) snowLog.info('address, this shortcut, shortcuts',address,this.state.shortcuts[address],this.state.shortcuts);
		
		var def = this.state.shortcuts[address] ? this.state.shortcuts[address] : {sign:{}};
		var deleteme = def.apikey ? React.DOM.span(null, " ", React.DOM.a({style: {marginBottom:0,marginRight:10}, className: "btn btn-danger pull-right", onClick: this.deleteShortcut}, "remove"), "  ") : '';
		/*
		{helptext.b}
		<div className="form-group input-group">
			<span className="input-group-addon  coinstamp">{snowUI.snowText.accounts.address.moreinfo.pin.text}</span>
			<input type="text"  defaultValue={def.sign.pinop || ''} name="pin" id="pin" placeholder={snowUI.snowText.accounts.address.moreinfo.pin.placeholder} className="form-control coinstamp" />
		</div>
		*/
		/*
		{helptext.d} 	
		<div className="form-group input-group">
			<span  className="input-group-addon   coinstamp" style={{borderRight:'1px initial initial',paddingRight:25}}>
				{snowUI.snowText.accounts.address.moreinfo.lock.lockinput}
			</span>
				<select  defaultValue={def.sign.lock ? 'yes':'no'}  id="lock" name="lock" className="form-control coinstamp">
					<option value="no">{snowUI.snowText.accounts.address.moreinfo.lock.option.no}</option>
					<option value="yes">{snowUI.snowText.accounts.address.moreinfo.lock.option.yes}</option>
				</select>
		</div>
			
		
		{helptext.e}
		<div className="form-group input-group">
			<span className="input-group-addon input-group-sm coinstamp">{snowUI.snowText.accounts.address.moreinfo.type.text}</span>
			<select  defaultValue={def.sign.type || '1'}  name="type" id="type"  className="form-control coinstamp">
				<option value="1">{snowUI.snowText.accounts.address.moreinfo.type.option.one}</option>
				<option value="2">{snowUI.snowText.accounts.address.moreinfo.type.option.two}</option>
				<option value="3">{snowUI.snowText.accounts.address.moreinfo.type.option.three}</option>
			</select>
			
		</div>
		*/
		var html = 	React.DOM.div(null, 
					html3, 
					html2, 
					React.DOM.form({onSubmit: this.submitShortcut, id: "shortcutForm"}, 
						React.DOM.div({className: "form-group input-group"}, 
							React.DOM.span({className: "input-group-addon coinstamp"}, snowUI.snowText.accounts.address.moreinfo.head.text, " "), 
						
							React.DOM.input({type: "text", name: "address", id: "address", value: address, onChange: function(e) { this.value = address}, className: "form-control coinstamp"})
						), 
						React.DOM.div({className: "col-xs-12"}, React.DOM.a({className: "pull-right", onClick: this.setHelp}, helptext.text)), 
						
						helptext.a, 
						React.DOM.div({className: "form-group input-group"}, 
							linkname, 
							React.DOM.input({type: "text", name: "shortcut", defaultValue: def.apikey || '', id: "shortcut", placeholder: snowUI.snowText.accounts.address.moreinfo.shortcut.placeholder, className: "form-control coinstamp"})
						), 
						
						helptext.c, 
						React.DOM.div({className: "form-group input-group"}, 
							React.DOM.span({className: "input-group-addon  coinstamp"}, snowUI.snowText.accounts.address.moreinfo.pinphrase.text), 
							React.DOM.input({type: "text", defaultValue: def.sign.keyphrase || '', name: "keyphrase", id: "keyphrase", placeholder: snowUI.snowText.accounts.address.moreinfo.pinphrase.placeholder, className: "form-control coinstamp"})
						), 
						
						React.DOM.div({className: "form-group input-group"}, 
							React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, snowUI.snowText.accounts.address.moreinfo.expires.text), 
							React.DOM.select({defaultValue: def.expires  || 'laina', name: "expires", id: "expires", className: "form-control input input-faded"}, 
								React.DOM.option({value: "laina"}, "Never"), 
								React.DOM.option({value: "burnonimpact"}, "One Use Only"), 
								React.DOM.option({value: "1"}, "1 day"), 
								React.DOM.option({value: "7"}, "1 week"), 
								React.DOM.option({value: "30"}, "30 days"), 
								React.DOM.option({value: "180"}, "6 months"), 
								React.DOM.option({value: "365"}, "1 year")
							)
						), 
						React.DOM.div({className: "form-group"}, 
							React.DOM.input({type: "hidden", id: "coin", name: "coin", value: this.props.config.wally.coin}), 
							React.DOM.input({type: "hidden", id: "account", name: "account", value: account}), 
							React.DOM.input({type: "hidden", id: "key", name: "key", value: def.key}), 
							React.DOM.input({type: "hidden", id: "coinwallet", name: "coinwallet", value: this.props.config.wally.key}), 
							React.DOM.input({type: "hidden", id: "action", name: "action", value: "add-offline"}), 
							React.DOM.button({className: "btn btn-primary", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, (this.state.connecting) ? def.apikey ? snowUI.snowText.accounts.address.moreinfo.button.updating:snowUI.snowText.accounts.address.moreinfo.button.submitting : def.apikey ? snowUI.snowText.accounts.address.moreinfo.button.update:snowUI.snowText.accounts.address.moreinfo.button.submit), 
							
							" ", React.DOM.a({style: {marginBottom:0}, className: "btn btn-default pull-right", onClick: this.showShortcut}, "cancel"), 
							deleteme
						)
					)
					
				);
		
		var openMore = {openMore:{}};
		if(!this.state.openMore[address] || force === true)openMore.openMore[address] = html ;
		this.setState(openMore)
	
	},
	deleteShortcut: function(e) {
		var conf = {
				
			title: 'Confirm deletion of shortcut',
			body: 'Remove <b>' + $('#shortcut').val() + '</b> from  <b>' + $('#address').val() + '</b>',
			confirm: 'Delete Shortcut',
			click: this.deleteShortcutNow,
			
		}
		if(snowUI.debug) snowLog.info(conf)
		this.setState({genericModal:true,modal:conf});
		snowUI.flash('message','Confirm First ',5000);
		return;
	},
	deleteShortcutNow: function(e) {
		e.preventDefault();
		var key = $('#key').val(),
			addr = $('#address').val(),
			_this = this;
			
		
		if(snowUI.debug) snowLog.log('removeNow',key)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-unattended',wid:key}
		
		this.setState({connecting:true,genericModal:false,modal:{}});
		
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently remove " + $('#shortcut').val())
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(snowUI.debug) snowLog.info('remove shortcut resp',resp);
				if(resp.success === true) {
					//var sc = this.state.shortcuts;
					//if(addr) delete sc[addr];
								
					snowUI.flash('success','Shortcut removed',2500)
					_this.getData(_this.props,function(resp){ 
						_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
						_this.showShortcut({target:'#shortcutForm'},true);
						$('#shortcutForm')[0].reset();
						if(snowUI.debug) snowLog.info('removed shortcut',resp); 
					})
					
				} else {
					if(snowUI.debug) snowLog.warn(resp.error)
					snowUI.flash('error',resp.error,3500)
					
				}
			}.bind(this))
		} else {
			
			this.setState({connecting:false})
			
		}
		
		return false;
	},
	submitShortcut: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		
		
		var address = $('#address').val(),
			shortcut = $('#shortcut'),
			pin = $('#pin'),
			keyphrase = $('#keyphrase'),
			lock = $('#lock'),
			key = $('#key').val(),
			type = $('#type'),
			expires = $('#type'),
			btn = $(e.target).find('button').first(),
			error = false, 
			confirmBefore = [];
		
		btn.prop('disabled','disabled');
		
		if(shortcut.val().length < 1) {
			shortcut.closest('.form-group').addClass('has-error');
			error = true;
		} else {
			shortcut.closest('.form-group').removeClass('has-error');
		}
		if(!pin.val()) {
			
			confirmBefore.push('A pinop is not required but suggested.');
			
		} else if(pin.val().length < 4) {
			
			confirmBefore.push('A good pinop is 4 or more characters ' );
			
		}  
		if(keyphrase.val().length > 125) {
			pinphrase.closest('.form-group').addClass('has-error');
			error = true;
			snowUI.flash('error','Keyphrase is too long');
			
		} else if(!keyphrase.val()) {
			
			confirmBefore.push('A key phrase is not required but suggested.');
			
		} 
		if(error) {
			this.setState({connecting:false});
			btn.prop('disabled','');
			snowUI.flash('error','Please fix any errors',5000);
			return false;
		}
		if(confirmBefore.length > 0) {
			confirmBefore.push('<br />Create shortcut for ' + address + '<br />');
			var _l='';
			confirmBefore.forEach(function(v) {
				_l+=v+'<br />';
			});
			var conf = {
				
				title: 'Confirm before submitting',
				body: _l,
				confirm: key ? 'Update Shortcut' : 'Add Shortcut',
				click: this.addShortcut,
				
			}
			this.setState({genericModal:true,modal:conf});
			snowUI.flash('message','Please Confirm First',5000);
			return;
		}
		var conf = {
				
			title: 'Confirm shortcut action',
			body: 'Assign <b>' + shortcut.val() + '</b> to  <b>' + address + '</b>',
			confirm: key ? 'Update Shortcut' : 'Add Shortcut',
			click: this.addShortcut,
			
		}
		this.setState({genericModal:true,modal:conf});
		snowUI.flash('message','Please Confirm First',5000);
		return;
		
		
	},
	addShortcut: function() {
		var address = $('#address').val(),
			shortcut = $('#shortcut'),
			btn = $('#shortcutForm').find('button').first(),
			_this = this;
		
		btn.prop('disabled','');
		
		this.setState({connecting:false,genericModal:false,modal:{}});
		
		var url =  "/api/snowcoins/local/receive/setup"
		var data = $( "#shortcutForm" ).serialize();
		snowUI.ajax.POST(url,data,function(resp) {
			if(resp.success === true) {
				
				if(snowUI.debug) snowLog.info('shortcut saved',resp);
				var msg = resp.msg ? resp.msg : 'shortcut ' + shortcut.val() + ' added successfully';
				snowUI.flash('success',msg,3500)
				
				_this.getData(_this.props,function(resp){ 
					_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
					_this.showShortcut({target:'#shortcutForm'},true);
					if(snowUI.debug) snowLog.info('shortcut refreshed',resp); 
				});
				
				
			} else {
				if(snowUI.debug) snowLog.warn(resp)
				_this.setState({connecting:false});
				snowUI.flash('error',resp.error,3500)
				//_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		}.bind(this));
		
		return false;
	},
	render: function() {
		if(snowUI.debug) snowLog.log('wallet accounts component',this.state)
		var _this = this;
										
		var listaccountsli = function(account) { 
		    var p = _this.state.data.map(function(vl){
			if(vl.name!==account.name) {
				
				return (React.DOM.li({role: "presentation", key: account.name+vl.name+'11'}, 
					React.DOM.a({onClick: _this.moveToAccount, 'data-snowkey': account.name.replace(' ','SC14'), 'data-snowfromacc': account.name, 'data-snowtoacc': vl.name, 'data-snowamount': account.balance, 'data-snowtoamount': vl.balance, role: "menuitem", tabIndex: "-1"}, vl.name)
				))
			} 
		    });
		    return (
			 React.DOM.ul({className: "dropdown-menu ", role: "menu"}, 
				React.DOM.li({role: "presentation"}, React.DOM.a({className: "snowsendfromaccountlink", onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name, role: "menuitem", tabIndex: "-1"}, " Send Coin ")), 
				React.DOM.li({className: "divider", role: "presentation"}), 
				React.DOM.li({role: "presentation"}, React.DOM.a({onClick: _this.moveToAccount, 'data-snowkey': account.name.replace(' ','SC14'), 'data-snowfromacc': account.name, 'data-snowtoacc': "", 'data-snowamount': account.balance, role: "menuitem", tabIndex: "-1"}, " Move coin to a new account ")), 
				React.DOM.li({className: "divider", role: "presentation"}), 
				React.DOM.li({className: "dropdown-header", role: "presentation"}, " Move coin to account "), 
				p
				
				
			)
		    )
		}
		var listaddresses = function(a) {
			if(typeof a.addresses === 'object') {
			    var p = a.addresses.map(function(v){
				var showme = _this.state.openMore[v.a] ? 'block' : 'none';
				var activelink = _this.state.shortcuts[v.a] ? 'shortcut' : '';
				return (React.DOM.div({className: "col-xs-12 col-md-6 eachaddress", key: v.a, 'data-snowaddress': v.a, draggable: "true", onDragEnd: _this.dragEnd, onDragStart: _this.dragStart}, 
						
						
						React.DOM.div({className: "send ", 'data-placement': "top", 'data-toggle': "tooltip", title: "send coin from this address"}, 
							React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/'+ a.name + '/' + v.a}, React.DOM.span({className: "glyphicon glyphicon-share"}))
						), 
						React.DOM.div({className: "qrcode ", title: "Create a .link shortcut"}, 
							React.DOM.a({onClick: _this.showShortcut, className: "shortcutlink " + activelink, title: "Create a .link shortcut", alt: "Create a .link shortcut"}, " ", React.DOM.span({className: "glyphicon glyphicon-globe"}))
						), 
						
						React.DOM.div({className: "address"}, 
							v.a
						), 
						React.DOM.div({className: "more", onClick: _this.showAddress}, 
							"..."
						), 
						React.DOM.div({className: "abalance", onClick: _this.showBalance}, 
							parseFloat(v.b).formatMoney(), React.DOM.span({className: "coinstamp"}, _this.props.config.wally.coinstamp)
						), 
						React.DOM.div({className: "move ", 'data-placement': "top", 'data-trigger': "hover focus", 'data-toggle': "", title: "click to activate drop zones or drag and drop on the account you want to move this address to"}, 
							React.DOM.span({className: "glyphicon glyphicon-move", style: {cursor:'pointer'}, onClick: _this.toggleDropZones})
						), 
						React.DOM.div({className: "clearfix col-xs-12 more-info", style: {display:showme}}, _this.state.openMore[v.a], " ")
					))    
				});
			} else {
				var p
			}
			return (React.DOM.div({className: "clearfix"}, 
					p, 
					React.DOM.div({className: "col-xs-12 col-md-6 eachaddress"}, 
						React.DOM.div({className: "simplelink"}, 
							React.DOM.a({onClick: _this.newAddress}, "    ", snowUI.snowText.accounts.new.createAddress, " ")
						)
					)
				)
				)
		}
		var list = '';
		var total = 0;
		if(this.state.data instanceof Array) {
		    list = this.state.data.map(function(account) {
			   if(typeof account.addresses === 'object') {
				   var atext = account.addresses.length === 1 ? account.addresses.length + ' ' +snowUI.snowText.accounts.address.short.singular : account.addresses.length + ' ' + snowUI.snowText.accounts.address.short.plural
				   var aclick = _this.toggleAddresses
			   } else {
				 var atext =    snowUI.snowText.accounts.new.short
				 var aclick=  _this.newAddress
				   
			   }
			   total += Number(account.balance);
			   return (React.DOM.div({className: "eachaccount  " + account.name.replace(' ','SC14'), key: account.name.replace(' ','SC14'), 'data-snowtrueaccount': account.truename, 'data-snowaccount': account.name, 'data-snowbalance': account.balance, onDrop: _this.dragDrop, onDragOver: _this.dragOver}, 
					React.DOM.div({className: "dropdown"}, 
						React.DOM.div({className: "details", onClick: aclick, onDragLeave: _this.dragLeave}, 
							React.DOM.div({className: "account", onClick: aclick}, 
								account.name, 
								account.truename!==account.name ? ' ('+account.truename+')' : ''
							), 
							React.DOM.div({className: "linkline"}, 
								React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name}, React.DOM.span({className: "badge  snowbg4"}, "send "), " "), 
								React.DOM.a({onClick: aclick, 'data-snowkey': account.name}, React.DOM.span({className: "badge"}, atext, " "), " "), 
								React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}, React.DOM.span({className: "badge bs-info2", href: snowUI.snowPath.root + snowUI.snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}, snowUI.snowText.accounts.tx.text, " "), " ")
							)
						), 
						React.DOM.div({className: "balance ", onClick: _this.drop}, 
							 React.DOM.a({className: "dropdown-toggle", 'data-toggle': "dropdown", 'data-container': ".dropdown"}, parseFloat(account.balance).formatMoney(8), " ", React.DOM.span({className: "caret"}), " "), 
							account.balance > 0 ? listaccountsli(account) : React.DOM.ul({className: "dropdown-menu ", role: "menu"}, React.DOM.li({role: "presentation", style: {padding:10}}, "Add some coin first"))	 
							 
						), 
						React.DOM.div({className: "clearfix"})
					), 
					React.DOM.div({className: "clearfix"}), 
					
					React.DOM.div({className: "dynamic"}), 
					
					React.DOM.div({className: "clearfix"}), 
					
					React.DOM.div({className: "addresses"}, 
						
						listaddresses(account)
					), 
					
					React.DOM.div({className: "clearfix"})
			   
				  )) 
		    });
		}
		var modal = function() {
			return (snowUI.snowModals.genericModal.call(_this,_this.state,function(){ $('button').prop('disabled','');_this.setState({connecting:false,genericModal:false}) }.bind(_this) ));
		};
		return (
		React.DOM.div({style: {padding:'25px 20px'}, id: "snowaccountlist"}, 
			React.DOM.div({className: "page-title"}, 
				"Accounts"
			), 
			React.DOM.div({className: "col-xs-12  navbar navbar-inverse", style: {textAlign:'right',fontSize:'14px'}}, 
				
				React.DOM.ul({className: "nav  pull-right"}, 
					 React.DOM.li({className: "dropdown"}, 
						  React.DOM.a({href: "#", id: "navmenuaccounts", style: {padding:'15px 20px 17px 20px',textTransform:'uppercase'}, className: "dropdown-toggle", 'data-toggle': "dropdown"}, snowUI.snowText.menu.menu.name, " ", React.DOM.span({className: "caret"})), 
						  React.DOM.ul({className: "dropdown-menu dropdown-menu-right", role: "menu"}, 
							    React.DOM.li(null, React.DOM.a({onClick: _this.toggleAllAddresses}, "Toggle Addresses")), 
							    React.DOM.li({className: "divider"}), 
							    React.DOM.li(null, React.DOM.a({onClick: _this.sortCols, 'data-snowwho': "sortaccount"}, "sort by name ", React.DOM.span({id: "sortaccountby"}, _this._sort.sortaccount.desc))), 
							    React.DOM.li(null, React.DOM.a({onClick: _this.sortCols, 'data-snowwho': "sortbalance"}, "sort by balance ", React.DOM.span({id: "sortbalanceby"}, _this._sort.sortbalance.asc))), 
							    React.DOM.li(null, React.DOM.a({onClick: _this.sortCols, 'data-snowwho': "sortaddresses"}, "sort by # addresses ", React.DOM.span({id: "sortaddressesby"}, _this._sort.sortaddresses.asc))), 
							    React.DOM.li({className: "divider"})
						  )
					)				
				), 
				React.DOM.ul({className: "nav navbar-nav  pull-right"}, 
					React.DOM.li(null, React.DOM.a({onClick: _this.newAccount}, snowUI.snowText.accounts.new.account))
				)		
				
			), 
			React.DOM.div({id: "listaccounts"}, 
				React.DOM.div({className: "eachaccount skip"}, 
					
					React.DOM.div({className: "details"}, 
						React.DOM.div({className: "account"}, 
							"total balance"
						)
					), 
					React.DOM.div({className: "balance "}, 
						total
					), 
					React.DOM.div({className: "clearfix"})
				), 	
				React.DOM.div({className: "clearfix"}), 
				list
			), 
			
			modal()
		)			

		);
	},
	zoneToggle: false,
	_dropAddress: false,
	_dropCandidate: false,
	toggleDropZones: function(e) {
		
		var _this = this
					
		if(this.zoneToggle) {
			var highlighted = this._dropCandidate
			_this.dropEnd(e)
			if($(e.currentTarget).closest('.eachaddress').attr('data-snowaddress') !== highlighted.attr('data-snowaddress'))_this.dropStart(e)
			if(snowUI.debug) snowLog.log('end dropping')
		} else {
			_this.dropStart(e)
			if(snowUI.debug) snowLog.log('start dropping')
		}
		
	},
	dropStart: function(e) {
		var highlight = $(e.currentTarget).closest('.eachaddress')
		var balance = $('.eachaccount').not('.skip').find('.balance')
		
		highlight.addClass('dropcandidate')
		balance.append('<div class="dropzone bstooltip" data-placement="top" data-toggle="tooltip"  data-trigger="hover focus" title="Click me to move the selected address to this account"></div>')
		
		this._dropAddress = e.currentTarget.dataset.snowaddress
		this._dropCandidate = highlight
		
		this.zoneToggle = true
		
	},
	dropEnd: function(e) {
		
		var balance = $('.eachaccount').not('.skip').find('.balance')
		balance.find('.dropzone').remove()
		$('.eachaddress').removeClass('dropcandidate')
		this._dropAddress = false
		this._dropCandidate = false
		
		this.zoneToggle = false
		
	},
	dropZone: function(e) {
		var _this = this
		
		var account = $(e.currentTarget).closest('.eachaccount').not('.skip').attr('data-snowaccount'),
			address = this._dropCandidate.attr('data-snowaddress')
			
		
		
		if($(e.currentTarget).closest('.eachaccount').not('.skip').find('.addresses').css('display') === 'none')$(e.currentTarget).closest('.eachaccount').find('.addresses').toggle("fast")
		
		var details = $(e.currentTarget).closest('.details')
			
		var finish = function() {
			
			$('[data-snowaddress="'+address+'"]').addClass('bs-success').fadeIn(5000)
			
			setTimeout(function() {
				
				$('[data-snowaddress="'+address+'"]').removeClass('bs-success')
			},5000);
			
			
		
		}
		
		if($(e.currentTarget).closest('.eachaccount').not('.skip').attr('class')  !== $(this._dropCandidate).closest('.eachaccount').attr('class') ) {
			this._dropCandidate.fadeOut()
			_this.dropEnd()
			_this.moveAddressCall(account,address,finish)
		} else {
			snowUI.flash('error','You can not move this address to nullville',3500)
		}
		
	},
	dragDrop: function(e) {
		var _this = this
		$('.eachaccount').find('.bs-warning').removeClass('bs-warning')
		var account = $(e.currentTarget).closest('.eachaccount').not('.skip').attr('data-snowaccount'),
			address = $(this.dragged).attr('data-snowaddress')
		
		
		var details = $(e.currentTarget).find('.details')
		
		if($(e.currentTarget).find('.addresses').css('display') === 'none')$(e.currentTarget).find('.addresses').toggle("fast")	
		
		var finish = function() {
			
			$('[data-snowaddress="'+address+'"]').addClass('bs-success').fadeIn(5000)
			
			setTimeout(function() {
				
				$('[data-snowaddress="'+address+'"]').removeClass('bs-success')
			},5000);
		}
		
		if($(e.currentTarget).closest('.eachaccount').attr('class') !== $(this.dragged).closest('.eachaccount').attr('class') ) {
			$(this.dragged).fadeOut()
			_this.dropEnd()
			this.moveAddressCall(account,address,finish)
		} else {
			snowUI.flash('error','You can not move this address to nullville',3500)
		}
		
				
	},
	moveAddressCall: function(account,address,cb) {
		
		snowUI.loadingStart()
		var _this = this
		if(snowUI.debug) snowLog.log('move address call')
		var time=new Date()-2;
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,account:account ,address:address ,moveaddress:'now',checkauth:time},
			_this = this;
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			
			if(resp.success === true) {
				_this.setState({data:resp.data},function(){
					snowUI.flash('success',resp.msg,3500)
					cb()	
				})
				
			} else {
				snowUI.flash('error',resp.error,3500)
			}
			snowUI.loadingStop()
		})
		return false
	},
	dragged: false,
	_openAddresses: false,
	dragStart: function(e) {
		
		this.dragged = e.currentTarget;
		$(this.dragged).css('opacity','.9').addClass('dropcandidate')
		
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.dropEffect = 'move';
		
		$(e.currentTarget).closest('.eachaccount').not('.skip').find('.addresses').addClass('skip')
		this._openAddresses = $('.eachaccount').find('.addresses.open')
		//this._openAddresses.not('.skip').hide()
		
		// Firefox requires calling dataTransfer.setData
		// for the drag to properly work
		e.dataTransfer.setData("text/html", e.currentTarget);
	},
	dragEnd: function(e) {
		$(this.dragged).css('opacity','1').removeClass('dropcandidate')
		$('.eachaccount').removeClass('dragover')
		$('.eachaccount').find('.addresses').removeClass('skip')
		if(this._dropCandidate.attr('data-snowaddress') === $(this.dragged).attr('data-snowaddress') )this.dropEnd()
		this._openAddresses = false
	},
	
	over: false,
	dragOver: function(e) {
		e.preventDefault()
		var zone = $(e.target).closest('.eachaccount').not('.skip')
		
		if(zone.hasClass("dragover")) return;
		
		$(this.over).closest('.eachaccount').removeClass('dragover')
		this.over = e.target;
		
		zone.addClass('dragover')
		
	},
	dragLeave: function(e) {
		e.preventDefault()
		//if(!$(e.target).closest('.details').hasClass('placeholder'))$(e.target).closest('.details').removeClass('placeholder')
	},
});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */



//send component
snowUI.wallet.send = React.createClass({displayName: 'send',
	getInitialState: function() {
		
		var _this = this
		
		return {
			requesting:false,
			mounted:false,
			ready:this.props.ready,
			confirm:false,
			unlock:false,
			receipt: false,
			transaction: false,
			error: false,
			persist: {}
			
		};
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(snowUI.debug) snowLog.log('send will receive props',this.state.unlock,nextProps.config.unlocked)
		//this.setState({ready:nextProps.ready})
		if(this.state.unlock === true && nextProps.config.unlocked === true) {
			if(snowUI.debug) snowLog.log('send set to confirm')
			this.setState({unlock:false,confirm:true});
			
		} else {
			if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({accounts:resp.accounts,data:resp.data,snowmoney:resp.snowmoney,mounted:true,ready:nextProps.ready}) })
		}
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowLog.log('send did update',this.props)
		snowUI.watchLoader();
		$('[rel=popover]').popover();
		$('.bstooltip').tooltip()
		
	},
	componentDidMount: function() {
		
	},
	killTooltip: function() {
		$('.snow-send #changeamountspan').tooltip('destroy');
		$('.snow-send #sendcoinamount').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip('destroy');
	},
	componentWillMount: function() {
		var _this = this
		if(snowUI.debug) snowLog.log('send did mount',this.props)
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,snowmoney:resp.snowmoney,accounts:resp.accounts,mounted:true}) })
		this.killTooltip();
		$('.snow-send #convamount').html(' ')
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUpdate: function() {
		this.killTooltip();
		$('.snow-send #convamount').html(' ')
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
		
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowLog.log('send data',props)
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowLog.log(resp)
			if(resp.success === true) {
				cb(resp)
			} else {
				snowUI.flash('error',resp.error,3500)
				_this.props.setWalletState({connectError:true})
			}
		})
		return false
	},
	addressBook: function(e) {
		
		var url= "/api/snowcoins/local/contacts",
			  data= { wallet:this.props.config.wally.key},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowLog.log(resp)
			if(resp.success === true) {
				_this.setState({addressBookHtml:resp.html});
				snowUI.methods.modals.addressBook.open();
			} else {
				snowUI.flash('error',resp.error,3500)
				
			}
		})
		return false
	},
	saveAddressForm: function(e) {
		if(snowUI.debug) snowLog.log('change save address');
		var fields = $('#sendcoinshowname');
		if(fields.css('display') === 'none') {
			fields.toggle(400);
		} else {
			fields.toggle(false);
		}
		
	},
	watchAmount: function(e) {
		
		var currentwally = this.props.config.wally;
		var snowmoney = this.state.snowmoney;
		
		var getfrom=$('.snow-send #snowchangefrom').attr('data-snowticker');
			
		var enteredamount=parseFloat($('.snow-send #sendcoinamount').val());
		if(isNaN(enteredamount))enteredamount=0;
		
		var stamp=$('.snow-send #snowchangefrom').attr('data-snowstamp');
		if(getfrom===currentwally.cointicker) {
			stamp='$ ';
			var to=currentwally.currency,from=getfrom;
		}
		else {
			stamp=' '+currentwally.coinstamp;
			var from=getfrom,to=currentwally.cointicker;
		}
		//if(snowUI.debug) snowLog.log('keyup',from,to,snowmoney[from][to]);
		if(snowmoney[from][to] && snowmoney[from][to].price) {
					
			showvalue=snowmoney[from][to].price * enteredamount;
			if(to==='usd' || to==='eur'){
				$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
				showvalue=parseFloat(showvalue.toFixed(2));
			}
			else {
				$('.snow-send #sendcointrueamount').val(showvalue.toFixed(8).replace(/\.?0+$/, ""));
				showvalue=parseFloat(showvalue.toFixed(8));
				
			}
			$('.snow-send #changeamountbefore').text('');
			$('.snow-send #changeamountafter').text('');
			if(to==='usd')$('.snow-send #changeamountbefore').text(stamp);
			else $('.snow-send #changeamountafter').text(' ' + stamp);
			$('.snow-send #convamount').text(parseFloat(snowmoney[from][to].price).toFixed(8).replace(/\.?0+$/, ""));
			
			$('.snow-send #changeamount').text(showvalue );
			
		}
		else {
			$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
		}
		$('.snow-send #convamountspan').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip({title:'1 ' + from + ' to ' + to + ' equals '}).tooltip('show');				
		var balspan = $('.snow-send .snow-balance-body').find('span').first(),
			availbal = parseFloat($('.snow-send #snow-balance-input').val()),
			minus = $('.snow-send #sendcointrueamount').val(),
			changebalance = availbal - parseFloat(minus);
			
		balspan.text(changebalance.formatMoney(8,',','.'));
		
	},
	watchTicker: function(e) {
		
		var currentwally = this.props.config.wally;
		var snowmoney = this.state.snowmoney;
		
		var theLi = $(e.target).closest('li')
		
		var changeto=theLi.text();
		var changestamp=theLi.attr('data-snowstamp');
		var changeticker=theLi.attr('data-snowticker');
		var currentticker=$('.snow-send #snowchangefrom').attr('data-snowticker');
		var ddclass = 'bg-info';
		if(changeticker===currentwally.cointicker) {
			$('.snow-send #sendcoinamount').addClass('active').next().next().removeClass('active');
			$('.snow-send #changeamountspan').tooltip('destroy');
			$('.snow-send #sendcoinamount').tooltip({title:'We will send this many ' + currentwally.cointicker}).tooltip('show');
		} else {
			$('.snow-send #sendcoinamount').removeClass('active').next().next().addClass('active');
			$('.snow-send #sendcoinamount').tooltip('destroy');
			$('.snow-send #changeamountspan').tooltip({title:'We will send this many ' + currentwally.cointicker}).tooltip('show');
			
		}
		if(changeticker!=currentticker) {
			$('.snow-send #snowchangefrom').attr('data-snowticker',changeticker);
			$('.snow-send #snowchangefrom').attr('data-snowstamp',changestamp);
			$('.snow-send #changestamp').children().first().text(changeto);
			$('.snow-send #sendcoinamount').focus();
			if(changeticker==='usd' || changeticker==='eur')$('.snow-send #sendcoinamount').prop('step','0.01');
			else if(changeticker==='ltc' || changeticker==='btc')$('.snow-send #sendcoinamount').prop('step','0.001');
			else $('.snow-send #sendcoinamount').prop('step','1');
		}	
		
	},
	walletForm: function(e) {
		e.preventDefault()
		var _this = this;
		var currentwally = this.props.config.wally;
		
		var next = true;
		var ticker = $('.snow-send .change-coin-stamp').attr('data-snowticker');
		var amount = parseFloat($('.snow-send #sendcointrueamount').val());
		var to = $('.snow-send #sendcointoaddress').val();
		var bal = parseFloat($('.snow-send-body .snow-balance-body').text().replace(/,/g,''));
		var from = $('.snow-send #sendcoinfromaccount').val();
		if(snowUI.debug) snowLog.log('send',parseInt(amount));
		if(amount<=0 || isNaN(amount) || amount===Infinity)
		{
			$(".snow-send #sendcoinamount").parent().addClass('has-error');
			next=false;
		}
		if(to==='') 
		{
			$(".snow-send #sendcointoaddress").parent().addClass('has-error');
			next=false;
		}
		if(next===true)
		{
			
			var saveAs = $(".snow-send  #sendcoinaddressname").val(),
				saveAddress = $(".snow-send  #sendcoinsaveaddr").val();
			if(snowUI.debug) snowLog.log("save address? ",saveAddress)
			if(saveAddress === 'save' && saveAs) {
				var url = "/api/snowcoins/local/contacts",
					  data = { stop:1,wallet:currentwally.key,action:'add',name:saveAs,address:to};
				snowUI.ajax.GET(url,data,function(resp) {
					if(snowUI.debug) snowLog.log(resp)
					if(resp.success === true) {
						snowUI.flash('success','Address saved as ' + saveAs,3500)
					} else {
						snowUI.flash('error',"Address saved previously",3500)
						
					}
				});
			}
			
			var options = {
				amount: amount,
				ticker: ticker,
				to: to,
				balance: bal,
				from: from,
				saveAs: saveAs,
				memo: $(".snow-send  #sendcoinmemo").val(),
				message: $(".snow-send  #sendcointomessage").val()
							
			};
			
			_this.setState({confirm:true,unlock:false,persist:options});
			
		}
		
	},
	sendConfirmed: function() {
		var 	_this = this,
			nowtime=new Date().getTime(),
			command=(this.state.persist.from==='_default')?'send':'sendfromaccount',
			url= "/api/snowcoins/local/gated",
			data =  { checkauth:nowtime,account:this.state.persist.from,comment:this.state.persist.memo,commentto:this.state.persist.message,wallet: this.props.config.wally.key,command:command,amount:this.state.persist.amount,toaddress:this.state.persist.to};
		
		
		if(_this.props.config.unlocked === false) {
				
			_this.setState({confirm:true,unlock:true});
			snowUI.methods.modals.unlockWallet.open();
			
			return false;	
			
		} else {
			snowUI.ajax.GET(url,data,function(resp) {
				if(snowUI.debug) snowLog.log(resp)
				if(resp.success === true)
				{
					_this.setState({persist:{},confirm:false,receipt:true,transaction:resp.tx});
				}
				else
				{
					_this.setState({confirm:false,error:resp.error,});
				}
			});
				  
			return false;	

		}
		
	},
	cancelConfirm: function() {
		var _this = this; 
		this.getData(this.props,function(resp){
			_this.setState({
				data:resp.data,
				snowmoney:resp.snowmoney,
				accounts:resp.accounts,
				mounted:true,
				persist:{},
				confirm:false,
				receipt:false,
				transaction:false,
				error:false
			});
		});
	},
	render: function() {
		var _this = this;
		
		if(this.state.receipt) {
			/* confirm sending coins */
			return (React.DOM.div({id: "snow-send", className: "snow-send bs-example"}, 
						React.DOM.div({style: {padding:'5px 20px'}}, 
							React.DOM.div({className: "col-xs-12 "}, 
								React.DOM.h4({className: "profile-form__heading"}, "Send Coin Transaction")
							), 
					
							React.DOM.div({dangerouslySetInnerHTML: {__html: _this.state.transaction}}), 
							React.DOM.p(null), 
							React.DOM.button({className: "btn btn-default ", onClick: _this.cancelConfirm}, "Return")
						)
				))
		
		} else if(this.state.confirm) {
			if(snowUI.debug) snowLog.log('wallet confirm send')
			var currentwally = this.props.config.wally;
			var html='<div><div class="adderror" style="dispaly:none;"></div> <span class="send-modal-amount">'+parseFloat(this.state.persist.amount).formatMoney(8)+'</span><span class="coinstamp">'+currentwally.coinstamp+'</span></div><div class="send-modal-text"> to address<p><strong>'+this.state.persist.to+'</strong></p>from account<p class="send-modal-account1"><strong>'+this.state.persist.from+'</strong></p><p><span class="snow-balance-span1" style="font-weight:bold">'+(this.state.persist.balance).formatMoney(8)+'</span> <span class="coinstamp">'+currentwally.coinstamp+' wallet balance after send</span><div id="3456756" style="display:none;">to='+this.state.persist.to+'<br />&account='+this.state.persist.from+'<br />&amount='+this.state.persist.amount+'<br />&checkauth={generate-on-submit}<br />&sendnow=yes</div></p></div>';
			
			/* confirm sending coins */
			return (React.DOM.div({id: "snow-send", className: "snow-send bs-example"}, 
						React.DOM.div({style: {padding:'5px 20px'}}, 
							React.DOM.div({className: "col-xs-12 "}, 
								React.DOM.h4({className: "profile-form__heading"}, "Confirm Send Coins")
							), 
					
						
							React.DOM.div({dangerouslySetInnerHTML: {__html: html}}), 
							
							React.DOM.button({onClick: _this.sendConfirmed, className: _this.props.config.unlocked ? "btn btn-warning" : "btn "}, _this.props.config.unlocked ? "Send Coins Now" : "Unlock Wallet"), 
							React.DOM.span(null, "   "), 
							React.DOM.button({className: "btn btn-default ", onClick: _this.cancelConfirm}, "Cancel")
						)
				))
			
		} else if(this.state.mounted) {
			
			var snowmoney = this.state.snowmoney;
			var wally = this.props.config.wally;
			var tickerlist = function() {
				var lis = [(React.DOM.li({key: "lit", onClick: _this.watchTicker, className: "change-coin-stamp", role: "presentation", 'data-snowstamp': _this.props.config.wally.coinstamp, 'data-snowticker': _this.props.config.wally.cointicker}, React.DOM.a(null, " ", _this.props.config.wally.cointicker.toUpperCase())))]
				if (snowmoney['usd'][wally.cointicker] && snowmoney['usd'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit1", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "USD", 'data-snowticker': "usd", className: "change-coin-stamp"}, React.DOM.a(null, "USD")))
				if (snowmoney['eur'][wally.cointicker] && snowmoney['eur'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit2", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "EUR", 'data-snowticker': "eur", className: "change-coin-stamp"}, React.DOM.a(null, "EUR")))			
				if (snowmoney['btc'][wally.cointicker] && snowmoney['btc'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit3", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "BTC", 'data-snowticker': "btc", className: "change-coin-stamp"}, React.DOM.a(null, "BTC")))
				if (snowmoney['ltc'][wally.cointicker] && snowmoney['ltc'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit4", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "LTC", 'data-snowticker': "ltc", className: "change-coin-stamp"}, React.DOM.a(null, "LTC")))
				if (wally.cointicker!='doge' && snowmoney['doge'][wally.cointicker] && snowmoney['doge'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit5", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "doge", 'data-snowticker': "doge", className: "change-coin-stamp"}, React.DOM.a(null, "DOGE")))
				return lis
			}
			
			if(this.state.accounts instanceof Array) {
				var accs =  this.state.accounts.map(function(v) {
					return (
						React.DOM.option({key: v.name, value: v.name}, v.name)
					);   
				});
					    
			} else {
				var accs = '<option value="">no accounts found</option>'
			}
			/* check for accounts and addresses in the url */
			var param = {from:{},to:{}}
			var pFrom = _this.props.config.params.indexOf('from'),
				pTo = _this.props.config.params.indexOf('to');
			// if there is a from in the url grab the next param which can be an account or address
			param.from.account = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			param.from.address = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			// if there is a to in the url grab the next param which should be an address
			param.to.address = pTo!==-1 ? _this.props.config.params[pTo+1] : '';	
			
			return (
				React.DOM.div(null, 
				React.DOM.div({id: "snow-send", className: "snow-send bs-example"}, 
					React.DOM.div({className: "col-xs-12 col-sm-offset-1 col-sm-10 col-md-10 col-lg-10"}, 
						React.DOM.div({id: "prettysuccess", style: {display:'none'}}, 
							React.DOM.div({className: "alert alert-success alert-dismissable"}, 
								React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
								React.DOM.p(null)
							)
						), 
					React.DOM.div({id: "prettyerror", style: {display:_this.state.error ? 'block' : 'none'}}, 
						React.DOM.div({className: "alert alert-danger alert-dismissable"}, 
							React.DOM.button({'data-dismiss': "alert", 'aria-hidden': "true", className: "close"}, "×"), 
							React.DOM.p(null, _this.state.error)
						)
					), 
					React.DOM.form({onSubmit: this.walletForm, id: "snowsendcoin", className: "snow-block-lg"}, 
					React.DOM.div({className: "snow-block-heading"}), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.div({className: "dropdown"}, 
								React.DOM.a({id: "snowchangefrom", 'data-toggle': "dropdown", 'data-snowstamp': _this.props.config.wally.coinstamp, 'data-snowticker': _this.props.config.wally.cointicker, className: "dropdown-toggle"}, 
									React.DOM.span({id: "changestamp"}, _this.props.config.wally.cointicker.toUpperCase(), " "), "  ", React.DOM.span({className: "caret"})
								), 
								React.DOM.ul({role: "menu", 'aria-labelledby': "dda2", className: "dropdown-menu"}, 
									tickerlist()						
								)
							)
						), 
						React.DOM.span({id: "convamountspan", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "input-group-addon input-group-sm coinstamp bstooltip"}, 
							React.DOM.span({id: "convamount"})
						), 
						React.DOM.input({required: "required", type: "text", pattern: "[-+]?[0-9]*[.,]?[0-9]+", defaultValue: this.state.persist.amount, id: "sendcoinamount", name: "sendcoinamount", placeholder: "Amount", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "form-control coinstamp bstooltip watchme active", title: "We will send this amount", onChange: _this.watchAmount, onKeyUp: _this.watchAmount, onFocus: _this.watchAmount}), 
						React.DOM.input({id: "sendcointrueamount", type: "hidden", defaultValue: this.state.persist.amount || "0"}), 
						
						React.DOM.span({id: "changeamountspan", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "input-group-addon input-group-sm coinstamp watchme"}, 
							
							React.DOM.span({id: "changeamountbefore"}, "$ "), 
							React.DOM.span({id: "changeamount"}, "0"), 
							React.DOM.span({id: "changeamountafter"})
						)
					), 
					React.DOM.div({style: {textAlign:'right',marginTop:-5}}, React.DOM.a({rel: "popover", 'data-container': "body", 'data-toggle': "popover", 'data-placement': "left", 'data-html': "true", 'data-content': "The left bookend selects the currency you want to enter. The right bookend will show you a converted amount.   <br /><br /> Select " + _this.props.config.wally.cointicker.toUpperCase() + " to see a conversion to " + _this.props.config.wally.currency.toUpperCase() + ". You will send the amount entered in the blue box<br /><br /> Select another currency to convert the entered amount to " + _this.props.config.wally.cointicker.toUpperCase() + ". The right bookend will be blue and the amount you send. ", className: "helppopover"}, "help")), 
					React.DOM.div({style: {textAlign:'left'}, className: "snow-send-body"}, 
						React.DOM.div({className: "snow-balance-body"}, 
							React.DOM.span(null, parseFloat(_this.state.data.balance).formatMoney()), 
							React.DOM.input({id: "snow-balance-input", type: "hidden", value: parseFloat(_this.state.data.balance)}), " ", React.DOM.span({style: {color:'#ccc'}, className: "coinstamp"}, " ", _this.props.config.wally.coinstamp, "   after sending")
						)
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "From"), 
						React.DOM.select({id: "sendcoinfromaccount", name: "sendcoinfromaccount", className: "form-control coinstamp", defaultValue: this.state.persist.from || param.from.account}, 
							accs
						)
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "To"), 
						React.DOM.input({required: "required", id: "sendcointoaddress", name: "sendcointoaddress", placeholder: "Coin Address", defaultValue: this.state.persist.to || param.to.address, className: "form-control coinstamp"}), 
						React.DOM.span({style: {cursor:'pointer'}, onClick: _this.addressBook, className: "input-group-addon input-group-sm glyphicon glyphicon-user"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.input({type: "checkbox", id: "sendcoinsaveaddr", value: "save", onChange: _this.saveAddressForm})
						), 
						React.DOM.label({style: {textAlign:'left'}, className: "form-control coinstamp"}, "Save this address to my contacts")
					), 
					React.DOM.div({id: "sendcoinshowname", style: {display:'none'}, className: "form-group input-group bg-info"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
						React.DOM.input({id: "sendcoinaddressname", name: "sendcoinaddressname", placeholder: "name for address", className: "form-control coinstamp", defaultValue: this.state.persist.saveAs})
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Message "), 
					React.DOM.input({id: "sendcointomessage", name: "sendcointomessage", placeholder: "message", className: "form-control coinstamp", defaultValue: this.state.persist.message})
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Memo"), 
					React.DOM.input({id: "sendcoinmemo", name: "sendcoinmemo", placeholder: "memo", className: "form-control coinstamp", defaultValue: this.state.persist.memo})
					), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({type: "submit", id: "buttonsend", className: "btn btn-sm snowsendcoin"}, "Send Coin")
						
					), 
					React.DOM.div({className: "clearfix"})
					)
					), 
					
					React.DOM.div({className: "clearfix"})
				), 		
				snowUI.snowModals.addressBook.call(this)
			)
		    );
		} else {
			return (React.DOM.div(null))
		}
	}
});


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
;/**
 * @jsx React.DOM
 */

//overview list component
snowUI.wallet.transactions = React.createClass({displayName: 'transactions',
	getInitialState: function() {
		return ({
			requesting:false,
			mounted:false,
			start: 0,
			num: 5,
			account:'all'
		})
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		
		
		if(snowUI.debug) snowLog.log('tx will receive props',this.props,nextProps)
		
		if(!this.state.requesting && nextProps.ready) {
			this.setState({requesting:true});
			this.getData(nextProps,function(resp){
				var setme = {data:resp.data,mounted:true,requesting:false}
			
				if(nextProps.config.params[2])setme.account = nextProps.config.params[2];
				if(nextProps.config.params[3])setme.start = nextProps.config.params[3];
				if(nextProps.config.params[4])setme.num = nextProps.config.params[4];
				_this.setState(setme) 
				
			})
		}
	},
	getData: function (props,cb) {
		
		if(snowUI.debug) snowLog.log('tx data',props)
		
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		data.account = props.config.params[2] || this.state.account;
		data.start = props.config.params[3] || this.state.start;
		data.num = props.config.params[4] || this.state.num;
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			if(resp.success === true) {
				cb(resp)
			} else {
				snowUI.flash('error',resp.error,3500)
				_this.props.setWalletState({connectError:true})
			}
		})
		return false
	},
	componentDidMount: function() {
		this.componentWillReceiveProps(this.props)
	},
	componentWillUpdate: function() {
		
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	shouldComponentUpdate: function() {
		return true
	},
	submitForm: function(e) {
		e.preventDefault();
		var num = $('#txrows').val();
		var acc = $('#txaccounts').val();
		var start = 0;
		this.setState({mounted:false,start:start,num:num,account:acc});
		snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + acc + '/' + start + '/' + num,{trigger:true,skipload:true})
	},
	prev: function() {
		var account = this.state.account,
			start = parseFloat(this.state.start) - parseFloat(this.state.num),
			num = this.state.num;
		
		this.setState({mounted:false,start:start,num:num,account:account});
		snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + account + '/' + start + '/' + num,{trigger:true,skipload:true})
		
	},
	next: function() {
		
		var account = this.state.account,
			start = parseFloat(this.state.start) + parseFloat(this.state.num),
			num = this.state.num;
		
		this.setState({mounted:false,start:start,num:num,account:account});
		snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + account + '/' + start + '/' + num,{trigger:true,skipload:true})
		
	}, 
	createTxHtml: function(val) {
		var html ="<div id='"+val.time+"-div'><table class=''><tbody><tr class='skipme'><td> account</td><td>"+val.account+"<tr class='skipme'><td> address<td>"+val.address+"<tr class='skipme'><td> category<td>"+val.category+"<tr class='skipme'><td> amount<td>"+parseFloat(val.amount).formatMoney()+"<tr class='skipme'><td> fee<td>"+parseFloat(val.fee).formatMoney()+"<tr class='skipme'><td> confirmations<td>"+val.confirmations+"<tr class='skipme'><td> blockhash</td><td> "+val.blockhash+"</td></tr><tr class='skipme'><td> blockindex<td>"+val.blockindex+"</td></tr>";
		
		var formattedTime = moment(val.blocktime*1000).format("llll")
		html+="<tr class='skipme'><td> block time<td>"+formattedTime+"<tr class='skipme'><td> transaction id<td><a  href='http://dogechain.info/tx/"+val.txid+"' target='_blank' class='text-muted'>"+val.txid+"</a></td></tr>";
		var Time = moment(val.time*1000).format("llll");
		html+="<tr class='skipme'><td> time<td>"+Time+"</td></tr>";
		var tt = moment(val.timereceived*1000).format("llll")
		html+="<tr class='skipme'><td> time received<td>"+tt+"<tr class='skipme'><td> comment<td>"+val.comment+"<tr class='skipme'><td> to<td>"+val.to+"</td></tr></tbody></table> ";
		return html;
	},
	showTx: function(e) {
		if(snowUI.debug) snowLog.log('showTX')
		var tr = $(e.currentTarget).closest('tr')
		var after = tr.next().is('.txrowsmore');
		$('.txrowsmore').toggle(400,function() {
			this.remove()
		});
		if(!after) {	
			try {
				var data = JSON.parse(tr.attr('data-open')); 
			} catch(e) {
				var data={}
			}
			if(snowUI.debug) snowLog.log(data,'showTX')
			$(e.currentTarget).closest('tr').after('<tr class="txrowsmore"><td></td><td colspan="5">'+this.createTxHtml(data)+'</td></tr>').next().toggle(400);
		}
	},
	render: function() {
	    if(snowUI.debug) snowLog.log('wallet transaction component',this.props,this.state)
		
		var _this = this,
			next = ' disabled',
			account = this.state.account,
			start = this.state.start,
			num = this.state.num;
		var prev = start>0 ? '':' disabled';
		
		if(this.state.mounted) {
			if(typeof this.state.data === 'object') {
				if(typeof this.state.data.transactions === 'object' && this.state.data.transactions.transactions.length>0) {
					   var loop = this.state.data.transactions.transactions;
					   var i = this.state.start;
					   var listtxs = loop.map(function(v) {
						    return (
								React.DOM.tr({key: v.time+(i++), style: {cursor:'pointer'}, 'data-open': JSON.stringify(v), className: "txclickrow", onClick: _this.showTx}, 
								React.DOM.td({className: " snowbg2"}, i), 
								React.DOM.td(null, v.account), 
								React.DOM.td(null, v.amount), 
								React.DOM.td(null, v.address), 
								React.DOM.td(null, 

									v.category
								), 
								React.DOM.td(null, moment(v.time*1000).format("llll"))
								)
							    );   
					    });
					    
					    if(listtxs.length >= num) next = '';
					    
					   
				} else {
					var listtxs = (
						React.DOM.tr({style: {cursor:'pointer'}, 'data-open': "", className: "txclickrow"}, 
							React.DOM.td({colspan: "5"}, "no transactions found")

						)
					    ); 
					
				}
				if(this.state.data.accounts instanceof Array) {
					 var accs =  this.state.data.accounts.map(function(v) {
						return (
							React.DOM.option({key: v.name, value: v.name}, v.name)
						);   
					});
						    
				} else {
					var accs = '<option value="">no accounts found</option>'
				}
				
			} else {
				var listtxs = (
					React.DOM.tr({style: {cursor:'pointer'}, 'data-open': "", className: "txclickrow"}, 
						React.DOM.td({colSpan: "6"}, "no transactions found")

					)
				    ); 
				var accs = '<option value="">no accounts found</option>'
			}
			
			var pagerprev = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'previous pull-left '+prev}, React.DOM.a({onClick: this.prev}, snowUI.snowText.wallet.tx.pager.prev.replace('{num}',this.state.num))));
			
			var pagernext = next.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'next pull-right '+next}, React.DOM.a({onClick: this.next}, snowUI.snowText.wallet.tx.pager.next.replace('{num}',this.state.num))));
			
			var pagerprev2 = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'previous pull-left '+prev}, React.DOM.a({onClick: this.prev}, snowUI.snowText.wallet.tx.pager.prev.replace('{num}',this.state.num))));
			
			var pagernext2 = next.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'next pull-right '+next}, React.DOM.a({onClick: this.next}, snowUI.snowText.wallet.tx.pager.next.replace('{num}',this.state.num))));
			
			return (
				React.DOM.div({style: {padding:'5px 20px'}}, 
					React.DOM.div({className: "page-title"}, 
						"Transactions"
					), 
					React.DOM.div({id: "snow-transactions", className: "bs-example"}, 
						
						React.DOM.form({id: "txoptionsform", onSubmit: this.submitForm}, 
							React.DOM.div({style: {marginLeft:10}, className: "txoptions"}, 
								
								React.DOM.div({className: "pull-left txaccounts"}, 
									React.DOM.select({id: "txaccounts", className: "form-control ", name: "account", defaultValue: this.state.account}, 
										React.DOM.option({value: "all"}, "All"), 
										accs
									)
								), 
							
								React.DOM.div({className: "pull-left txrows"}, 
									React.DOM.select({className: "form-control ", id: "txrows", name: "num", defaultValue: this.state.num}, 
										React.DOM.option({value: "5"}, "5"), 
										React.DOM.option({value: "10"}, "10"), 
										React.DOM.option({value: "20"}, "20"), 
										React.DOM.option({value: "30"}, "30"), 
										React.DOM.option({value: "40"}, "40"), 
										React.DOM.option({value: "50"}, "50"), 
										React.DOM.option({value: "75"}, "75"), 
										React.DOM.option({value: "100"}, "100")
									)
								), 
								React.DOM.div({className: "pull-left"}, 
									React.DOM.button({type: "submit", style: {marginTop:-10}, className: "btn  txgobutton"}, "GO "), 
									React.DOM.input({type: "hidden", value: "0", id: "txstart"})
								)
							), 
							React.DOM.div({className: "clearfix"})
						), 
						
						React.DOM.div({style: {margin:"-10px 10px 0 10px"}, className: "table-responsive"}, 
							React.DOM.ul({className: "pager"}, 
								pagerprev, 
								pagernext
							), 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "#")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "account")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "amount")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "address")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "type")), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "time"))
									)
								), 
								React.DOM.tbody(null, 
									

									listtxs
								)
							), 
							React.DOM.ul({className: "pager"}, 
								pagerprev2, 
								pagernext2
							)
						)
						
					)
				)			
			);
		} else {
			return(React.DOM.div(null))
		}
		
	}
});


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */


;/**
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
		var section = args[0],
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



;	//unique per window
	 var GUID = function () {
                //------------------
                var S4 = function () {
                    return(
                            Math.floor(
                                    Math.random() * 0x10000 /* 65536 */
                                ).toString(16)
                        );
                };
                //------------------

                return (
                        S4() + S4() + "-" +
                        S4() + "-" +
                        S4() + "-" +
                        S4() + "-" +
                        S4() + S4() + S4()
                    );
            };
            //----------------------
	
	/** 
	 * add csrf token to ajax requests - 
	 * we use a revolving nonce 
	 * the requesting object is responsible for resetting the nonce
	 * requests must be synchronous 
	 * use the getCookie function to use a set once nonce
	 * xhr.setRequestHeader("x-snow-token", getCookie('cookie name'));
	 * */
	
	
	
	$(document).ajaxSend(function(event, xhr, settings) {
	
	  function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
		  var cookies = document.cookie.split(';');
		  for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
			  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
			  break;
			}
		  }
		}
		return cookieValue;
	  }

	  function sameOrigin(url) {
		// url could be relative or scheme relative or absolute
		var host = document.location.host; // host + port
		var protocol = document.location.protocol;
		var sr_origin = '//' + host;
		var origin = protocol + sr_origin;
		// Allow absolute or scheme relative URLs to same origin
		return (url === origin || url.slice(0, origin.length + 1) === origin + '/') ||
			   (url === sr_origin || url.slice(0, sr_origin.length + 1) === sr_origin + '/') ||
			   // or any other URL that isn't scheme relative or absolute i.e relative.
			   !(/^(\/\/|http:|https:).*/.test(url));
	  }

	  function safeMethod(method) {
		return (/^(HEAD|OPTIONS|TRACE)$/.test(method));
	  }
		
	  if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
		xhr.setRequestHeader("x-snow-token", snowUI._csrf);
		xhr.setRequestHeader("x-snow-window", window.name);
	  }
	});
	
	/**
	 * 
	 * Catch long ajax requests and show a loading message
	 * 
	 * */
	$(document).ajaxStart(function() {

		snowUI.showLoadingIfTimer = setTimeout(function(){
			snowUI.flash('loadingmessage','Loading ',10000);
			snowUI.showLoadingIfTimerLong = setTimeout(function(){
				snowUI.flash('error','Still Loading ',10000);
			},10000);
		},500);
	});
	/**
	 * 
	 * Catch redirects for logouts and stuff and runs commands
	 * 
	 * */
	$(document).ajaxComplete(function(event, xhr, settings) {
		
		/* stop the loading watch */
		clearTimeout(snowUI.showLoadingIfTimer);
		clearTimeout(snowUI.showLoadingIfTimerLong);
		snowUI.killFlash('loadingmessage');
	
		var data = $.parseJSON(xhr.responseText);
		if(data.redirect) {
			location.href=data.redirect;
		} 
		if(data.path) {
			var resp = data;

			snowUI.snowPath.root = '/' + resp.path.snowcoins;
			snowUI.snowPath.routeRoot = resp.path.snowcoins;
			snowUI.snowPath.router.root = resp.path.snowcoins;
			
			snowUI.snowPath.d2c = '/' + resp.path.d2c;
			snowUI.snowPath.router.d2c = resp.path.d2c;
			
			snowUI.snowPath.d3c = '/' + resp.path.d3c;
			snowUI.snowPath.router.d3c = resp.path.d3c;
			
			snowUI.snowPath.share = '/' + resp.path.share;
			snowUI.snowPath.router.share = resp.path.share;
			
			snowUI.snowPath.logout = '/' + resp.path.logout;
			
			if(data.path.link) {
				if(data.path.link.port)snowUI.link.port = data.path.link.port;
				if(data.path.link.state)snowUI.link.state = data.path.link.state;
				if(data.path.link.sockets !== undefined)snowUI.link.sockets = data.path.link.sockets;
			}
			
			if(resp.path.snowcat)snowUI.snowcat = resp.path.snowcat;
			if(snowUI.debug) snowLog.log(snowUI.snowcat,resp.path);
		}
	});
	
	
	
	if (!window.name.match(/^GUID-/)) {
		window.name = "GUID-" + GUID();
	}
	
$(function() {	
	/* *  
	 * Run as soon as the page loads
	 * we use contacts since it is a simple page.
	 * the page should never reach the route to run the contacts function, 
	 * and SHOULD BE INTERCEPTED by the checkprivatenonce middleware
	 * 
	 * */
	 if(snowUI.debug) snowLog.info(snowUI.snowLanguages)
	$.ajax({async:false,url: "/api/snowcoins/local/contacts/?setnonce=true"})
		.done(function( resp,status,xhr ) {
			snowUI._csrf = xhr.getResponseHeader("x-snow-token");
			if(snowUI.debug) snowLog.info(resp)
			
			//start our app
			bone.router.start({root:resp.path.snowcoins,pushState: true});
			
			if(snowUI.debug) snowLog.info('token, send window name',snowUI._csrf,window.name);
			
	});
	
	/* some stuff just needs to be here */
	
	$(document).on('show.bs.tab','#dynamicaddtabs a[data-toggle="tab"],#dynamicaddtabs a[data-toggle="pill"]', function (e) {
		//e.target // activated tab
		//e.relatedTarget // previous tab
		if(snowUI.debug) snowLog.log('switch tab divs')
			
		var target = e.target.dataset.target;
		$('#fw-useme').val(target)
		$('#maindiv .tab-pane').toggle(400);
			
	})
	$(document).on('click','.snowtablesort th',function(){
			if(snowUI.debug) snowLog.info('sort col')
			if(this.asc === undefined) this.asc = true;
			var table = $(this).parents('table').eq(0)
			
			$('.snowtablesort th').find('.glyphicon-sort-by-alphabet-alt').removeClass("glyphicon-sort-by-alphabet-alt")
			$('.snowtablesort th').find('.glyphicon-sort-by-order-alt').removeClass("glyphicon-sort-by-order-alt")
			
			var rows = table.find('tbody tr').not( ".skipme" ).toArray().sort(snowUI.comparer($(this).index(),this))
			
			//if(snowUI.debug) snowLog.log(table.find('tr:gt(0)').toArray());
			this.asc = !this.asc
			if (!this.asc){
				rows = rows.reverse()
				$(this).find('.glyphicon-sort-by-alphabet').addClass("glyphicon-sort-by-alphabet-alt")
				$(this).find('.glyphicon-sort-by-order').addClass("glyphicon-sort-by-order-alt")
			}
			for (var i = 0; i < rows.length; i++){table.append(rows[i])}
		});
});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
