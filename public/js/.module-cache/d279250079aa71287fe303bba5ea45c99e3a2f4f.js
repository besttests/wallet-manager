/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
//React.initializeTouchEvents(true);

/* not used but thats how you can use animation and other transition goodies
 * */
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/**
 * we will use yes for true
 * we will use no for false
 * 
 * React has some built ins that rely on state being true/false like classSet()
 * and these will not work with yes/no but can easily be modified / reproduced
 * 
 * this single app uses the yes/no var so if you want you can switch back to true/false
 * 
 * */
var yes = 'yes', no = 'no';
//var yes = true, no = false;



/* bootstrap components
 * */
var Flash = ReactBootstrap.Alert;
var Btn = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;

/* create the container object
 * */
var snowUI = {
	passthrough: {}, //special for passing functions between components
};

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
		console.log(this.props);
		if(!this.state.isVisible)
		    return null;

		var message = this.props.message ? this.props.message : this.props.children;
		return (
		    Flash({bsStyle: this.props.showclass, onDismiss: this.dismissFlash}, 
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
		React.DOM.div({style: this.props.divstyle, dangerouslySetInnerHTML: {__html: snowtext.logoman}})
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
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	render: function() {
		var showmenu = this.state.config.section === snowPath.wallet ? snowUI.walletMenu : (this.state.config.section === snowPath.receive || this.state.config.section === snowPath.settings) ? snowUI.receiveMenu : snowUI.defaultMenu
	    console.log('main menu component',this.state.config)
	    return (
		React.DOM.div(null, showmenu({config: this.state.config}), " ")			
		
	    );
	}
});
//main
snowUI.walletMenu = React.createClass({displayName: 'walletMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	render: function() {
	   
	    console.log('wallet menu component')
	    return (
		React.DOM.div(null, 
		"wallets"
		)			
		
	    );
	}
});
//main
snowUI.receiveMenu = React.createClass({displayName: 'receiveMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	render: function() {
	   
	    console.log('receive menu component')
	    return (
		React.DOM.div(null, 
		"receivers / settings"
		)			
		
	    );
	}
});
//default
snowUI.defaultMenu = React.createClass({displayName: 'defaultMenu',
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	render: function() {
	   
	    console.log('default menu component')
	    return (
		React.DOM.div(null, 
			"menu empty"
		)			
		
	    );
	}
});


/**
 * wallet components
 * */
//main
snowUI.wallet = React.createClass({displayName: 'wallet',
	getInitialState: function() {
		if(this.props.config && this.props.config.moon === false)this.props.config.moon = 'overview'
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.moon === false && this.state.moon === false)nextProps.moon = 'overview'
		console.log(this.state, nextProps)
		this.setState({config:nextProps.config})
	},
	render: function() {
	    console.log('wallet component', this.state)
	    
	    var renderMe = snowUI[this.state.config.moon || 'overview']
	    
	    //stop loading
	    snowUI.methods.loaderStop();
	    
	    return (
		React.DOM.div(null, " ", renderMe({config: this.state.config}), " ")	
		
	    );
	}
});
//overview list component
snowUI.overview = React.createClass({displayName: 'overview',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('wallet component')
	    return (
		React.DOM.div(null, "Overview ")			
		
	    );
	}
});
//wallet dashboard component
snowUI.dashboard = React.createClass({displayName: 'dashboard',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('dashboard component')
	    return (
		React.DOM.div(null, "Dashboard ")			
		
	    );
	}
});
//overview list component
snowUI.send = React.createClass({displayName: 'send',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('send component')
	    return (
		React.DOM.div(null, "Send ")			
		
	    );
	}
});
//overview list component
snowUI.accounts = React.createClass({displayName: 'accounts',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('accounts component')
	    return (
		React.DOM.div(null, "Accounts ")			
		
	    );
	}
});
//overview list component
snowUI.tx = React.createClass({displayName: 'tx',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('transaction component')
	    return (
		React.DOM.div(null, "Transactions ")			
		
	    );
	}
});


/**
 * receive components
 * */
//main
snowUI.receive = React.createClass({displayName: 'receive',
	
	render: function() {
	    console.log('receive component')
	snowUI.methods.loaderStop();
	    return (
		React.DOM.div(null)			
		
	    )
	}
});
//settings component
snowUI.settings = React.createClass({displayName: 'settings',
	
	render: function() {
	    console.log('settings')
	    snowUI.methods.loaderStop();
	    return (
		React.DOM.div(null)				
		
	    );
	}
});
//inq component
snowUI.inq = React.createClass({displayName: 'inq',
	
	render: function() {
		console.log('inqueue')
		snowUI.methods.loaderStop();
		return (
			React.DOM.div(null)			
		
		);
	}
});

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
				_this.props.route(val)	
			},
			effect: "fade"
		});
		//console.log('wallet select updated')
	},
	render: function() {
		var wallets;
		if(this.props.wally instanceof Array) {
			var wallets = this.props.wally.map(function (w) {
				return (
					React.DOM.option({key:  w.key, value: snowPath.wallet + '/' + w.key}, w.name)
				);
			});
		}
		if(this.props.section === snowPath.wallet) {
			var _df = (this.props.wallet) ? snowPath.wallet + '/' + this.props.wallet : snowPath.wallet;
		} else {
			var _df = this.props.section;
		} 
		//console.log(_df)
		return this.transferPropsTo(
			React.DOM.div({className: "list"}, 
				React.DOM.div({className: "walletmsg", style: {display:'none'}}), 
				React.DOM.select({onChange: this.props.route, id: "walletselect", value: _df}, 
					wallets, 
					React.DOM.optgroup(null), 
					React.DOM.option({value: snowPath.wallet + '/new'}, snowtext.menu.plus.name), 
					React.DOM.option({value: snowPath.wallet}, snowtext.menu.list.name), 
					React.DOM.option({value: snowPath.receive}, snowtext.menu.receive.name), 
					React.DOM.option({value: snowPath.settings}, snowtext.menu.settings.name), 
					React.DOM.option({value: snowPath.inq}, snowtext.menu.inqueue.name)
				)
			)
		);
	}
});




var UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		/**
		 * initialize the app
		 * the plan is to keep only active references in root state.  
		 * we should use props for the fill outs
		 * */
		 var _this = this
		 snowUI.methods =  {
			hrefRoute: _this.hrefRoute,
			valueRoute: _this.valueRoute,
			updateState: _this.updateState,
			loaderStart: _this.loaderStart,
			loaderStop: _this.loaderStop,
			config: _this.config,
		}
		return {
			section: this.props.section || 'wallet',
			moon: this.props.moon || false,
			wallet: this.props.wallet || false,
			mywallets: [],
			
		};
	},
	//set up the config object
	get config() {
		console.log(_this.state.section)
		var _this = this
		return {
			section:_this.state.section,
			wallet:_this.state.wallet,
			moon:_this.state.moon
		}
	},
	componentDidMount: function() {
		
		//grab our initial data
		$.get("/api/snowcoins/local/contacts/?setnonce=true")
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			console.log('wally',resp.wally)
			
			this.setState({mywallets:resp.wally});
			
		}.bind(this));
		
	},
	componentWillReceiveProps: function(nextProps) {

		if(nextProps.section)this.setState({section:nextProps.section});
		if(nextProps.moon)this.setState({moon:nextProps.moon});
		if(nextProps.wallet)this.setState({wallet:nextProps.wallet});
		
		//wallet list
		if(nextProps.mywallets)this.setState({mywallets:nextProps.mywallets});		
		
		//if(nextProps.section)this.loaderStart()
		
		return false;
		
	},
	componentWillUpdate: function() {
		this.loaderStart()
		return false
	},
	updateState: function(prop,value) {
		this.setState({prop:value});	
		return false
	},
	loaderStart: function() {
		$('.loader').fadeIn();
		return false
	},
	loaderStop: function() {
		$('.loader').delay(500).fadeOut("slow");
		return false
	},
	changeTheme: function() {
		
		var mbody = $('body');
		if(mbody.hasClass('themeable-snowcoinslight')==true) {
			mbody.removeClass('themeable-snowcoinslight');
		} else {
			mbody.addClass('themeable-snowcoinslight');
		}
		return false
		
	},
	valueRoute: function(route) {
		bone.router.navigate(snowPath.root + route, {trigger:true});
		console.log(snowPath.root + route)
		return false
	},
	hrefRoute: function(route) {
		route.preventDefault();
		bone.router.navigate(snowPath.root + $(route.target)[0].pathname, {trigger:true});
		console.log(snowPath.root + $(route.target)[0].pathname)
		return false
	},
	eggy: function() {
		
		eggy();
	},
	render: function() {
		
		//set up our psuedo routes
		var comp = {}
		comp[snowPath.wallet]=snowUI.wallet;
		comp[snowPath.receive]=snowUI.receive;
		comp[snowPath.settings]=snowUI.settings;
		comp[snowPath.inq]=snowUI.inq;
		
		var mycomp = comp[this.state.section]
		
		console.log('get current state config',this.state.config,this.state.section)
		
		return (
			React.DOM.div(null, 
				React.DOM.div({id: "snowpi-body"}, 
					React.DOM.div({id: "walletbarspyhelper", style: {display:'block'}}), 
					React.DOM.div({id: "walletbar", className: "affix"}, 
						  React.DOM.div({className: "wallet"}, 
							React.DOM.div({className: "button-group"}, 
								Btn({bsStyle: "link", 'data-toggle': "dropdown", className: "dropdown-toggle"}, snowtext.menu.menu.name), 
								React.DOM.ul({className: "dropdown-menu", role: "menu"}, 
									React.DOM.li({className: "nav-item-add"}, " ", React.DOM.a({onClick: this.hrefRoute, href: snowPath.wallet + '/new'}, snowtext.menu.plus.name)), 					
									React.DOM.li({className: "nav-item-home"}, " ", React.DOM.a({onClick: this.hrefRoute, href: snowPath.wallet}, snowtext.menu.list.name)), 
									React.DOM.li({className: "nav-item-receive"}, React.DOM.a({onClick: this.hrefRoute, href: snowPath.receive}, snowtext.menu.receive.name)), 
									React.DOM.li({className: "nav-item-settings"}, React.DOM.a({onClick: this.hrefRoute, href: snowPath.settings}, snowtext.menu.settings.name)), 
									React.DOM.li({className: "divider"}), 
									React.DOM.li({className: "nav-item-snowcat"}), 
									React.DOM.li({className: "divider"}), 
									React.DOM.li(null, 
										React.DOM.div(null, 
											React.DOM.div({onClick: this.changeTheme, className: "walletmenuspan changetheme bstooltip", title: "Switch between the light and dark theme", 'data-toggle': "tooltip", 'data-placement': "bottom", 'data-container': "body"}, React.DOM.span({className: "glyphicon glyphicon-adjust"})), 
											React.DOM.div({className: "walletmenuspan bstooltip", title: "inquisive queue", 'data-toggle': "tooltip", 'data-placement': "bottom", 'data-container': "body"}, " ", React.DOM.a({onClick: this.hrefRoute, href: snowPath.inq, className: "nav-item-inq"})), 
											React.DOM.div({className: "walletmenuspan bstooltip", title: "Logout", 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body"}, " ", React.DOM.a({href: "/signout"}, " ", React.DOM.span({className: "glyphicon glyphicon-log-out"}))), 
											React.DOM.div({className: "clearfix"})
										)
									)
								)
							)
						), 
						
						snowUI.walletSelect({route: this.valueRoute, section: this.state.section, wallet: this.state.wallet, wally: this.state.mywallets}), 
						
						React.DOM.div({className: "logo", onClick: this.eggy}, React.DOM.a({title: "inquisive.io snowcoins build info", 'data-container': "body", 'data-placement': "bottom", 'data-toggle': "tooltip", className: "walletbar-logo"}))
						
					), 
					React.DOM.div({className: "container-fluid"}, 
						React.DOM.div({id: "menuspy", className: "dogemenu col-xs-1 col-md-2", 'data-spy': "affix", 'data-offset-top': "0"}, 
							snowUI.leftMenu({config: this.state.config})
						), 
						React.DOM.div({id: "menuspyhelper", className: "dogemenu col-xs-1 col-md-2"}), 
						React.DOM.div({className: "dogeboard col-xs-11 col-md-10"}, 
							snowUI.AppInfo(null), 
							React.DOM.div({className: "dogeboard-left col-xs-12 col-md-12"}, 
								
								
								mycomp({methods: snowUI.methods, config: this.state.config})
							)
						)
					)
				/* end snowpi-body */
				)
			)		
			
		);
	}
});

//app info
snowUI.AppInfo = React.createClass({displayName: 'AppInfo',
	render: function() {
		return (
			React.DOM.div({id: "easter-egg", style: {display:'none'}}, 
				React.DOM.div(null, 
				React.DOM.div({className: "blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, 
				  React.DOM.h4(null, "Get Snowcoins"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, React.DOM.a({href: "https://github.com/inquisive/snowcoins", target: "_blank"}, "GitHub / Installation")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, " ", React.DOM.a({href: "https://github.com/inquisive/snowcoins/latest.zip", target: "_blank"}, "Download zip"), " | ", React.DOM.a({href: "https://github.com/inquisive/snowcoins/latest.tar.gz", target: "_blank"}, "Download gz"))
				  ), 
				  React.DOM.h4(null, "Built With"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://nodejs.org", target: "_blank"}, "nodejs")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://keystonejs.com", target: "_blank"}, "KeystoneJS")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://getbootstrap.com/", target: "_blank"}, "Bootstrap")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "https://github.com/countable/node-dogecoin", target: "_blank"}, "node-dogecoin")), 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://mongoosejs.com/", target: "_blank"}, "mongoose"))
				  ), 
				  React.DOM.h4(null, "Donate"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({title: "iq", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, "iq: ", React.DOM.a({href: "https://inquisive.com/iq/snowkeeper", target: "_blank"}, "snowkeeper")), 
				    React.DOM.div({title: "Dogecoin", className: "col-sm-6 col-md-4"}, React.DOM.a({href: "https://snow.snowpi.org/share/dogecoin", target: "_blank"}, "Ðogecoin")), 
				    React.DOM.div({title: "Bitcoin", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "https://snow.snowpi.org/share/bitcoin", target: "_blank"}, "Bitcoin")), 
				    React.DOM.div({title: "Litecoin", className: "col-sm-6 col-md-4"}, React.DOM.a({href: "https://snow.snowpi.org/share/litecoin", target: "_blank"}, "Litecoin")), 
				    React.DOM.div({title: "Darkcoin", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, React.DOM.a({href: "https://snow.snowpi.org/share/darkcoin", target: "_blank"}, "Darkcoin"))
				  )
				), 
				React.DOM.div({className: "blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, 
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
				  React.DOM.h4(null, "Links"), 
				  React.DOM.div({className: "row"}, 
				    React.DOM.div({className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"}, React.DOM.a({href: "http://reddit.com/r/snowcoins", target: "_blank"}, "/r/snowcoins")), 
				    React.DOM.div({className: "col-sm-6 col-md-4"}, React.DOM.a({href: "http://reddit.com/r/dogecoin", target: "_blank"}, "/r/dogecoin"))
				  )
				), 
				React.DOM.div({className: "clearfix"})
			      )
			)
		);
	}
});


