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
var snowUI = {};

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

//loading div
snowUI.loading = React.createClass({displayName: 'loading',
	render: function() {
	    console.log('loading')
	    return this.transferPropsTo(
		
			
				React.DOM.div({key: "load", className: "loader"}, 
					"Loading ", React.DOM.br(null), 
					React.DOM.div({id: "loadgif"})
				)
			
		
	    );
	}
});

//wallet component
snowUI.wallet = React.createClass({displayName: 'wallet',
	
	componentDidMount: function() {
		console.log('wallet')
		this.props.methods.updateState({loading:false});
	},
	render: function() {
	    return this.transferPropsTo(
		React.DOM.div(null)			
		
	    );
	}
});
//receive component
snowUI.receive = React.createClass({displayName: 'receive',
	componentDidMount: function() {
		this.props.methods.updateState({loading:false});
	},
	render: function() {
	    console.log('receive component')
	    return (
		React.DOM.div(null)			
		
	    )
	}
});
//settings component
snowUI.settings = React.createClass({displayName: 'settings',
	
	componentDidMount: function() {
		this.props.methods.updateState({loading:false});
	},
	render: function() {
	    console.log('settings')
	    return (
		React.DOM.div(null)				
		
	    );
	}
});
//inq component
snowUI.inq = React.createClass({displayName: 'inq',
	componentDidMount: function() {
		this.props.methods.updateState({loading:false});
	},
	render: function() {
		console.log('inqueue')
		
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
		return {
			section: this.props.section || 'wallet',
			moon: this.props.moon || false,
			wallet: this.props.wallet || false,
			loading: true,
			mywallets: [],
		};
	},
	componentDidMount: function() {
		//stop the loader
		this.setState({loading: false});
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
		
		if(nextProps.loading) {
			this.setState({loading:nextProps.loading})
		} else {
			this.setState({loading:true})
		}
		return false;
		
	},
	updateState: function(prop,value) {
		this.setState({prop:value});	
		return false
	},
	loader: function() {
		this.setState({loading:!this.state.loading});
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
		return false
	},
	hrefRoute: function(route) {
		route.preventDefault();
		bone.router.navigate(snowPath.root + $(route.target)[0].pathname, {trigger:true});
		return false;
	},
	render: function() {
		
		var loader = this.state.loading ? React.DOM.div({key: "loadme"}, snowUI.loading(null)) :'';
		var methods = {
			hrefRoute: this.hrefRoute,
			valueRoute: this.valueRoute,
			updateState: this.updateState,
			loader: this.loader,
		}
		var comp = {}
		comp[snowPath.wallet]=snowUI.wallet;
		comp[snowPath.receive]=snowUI.receive;
		comp[snowPath.settings]=snowUI.settings;
		comp[snowPath.inq]=snowUI.inq;
		
		var mycomp = comp[this.state.section]
		console.log(mycomp,this.state.section)
		return this.transferPropsTo(
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
						
						React.DOM.div({className: "logo"}, React.DOM.a({title: "inquisive.io snowcoins build info", 'data-container': "body", 'data-placement': "bottom", 'data-toggle': "tooltip", className: "walletbar-logo"}))
						
					), 
					React.DOM.div({className: "container-fluid"}, 
						React.DOM.div({id: "menuspy", className: "dogemenu col-xs-1 col-md-2", 'data-spy': "affix", 'data-offset-top': "0"}
							
						), 
						React.DOM.div({id: "menuspyhelper", className: "dogemenu col-xs-1 col-md-2"}), 
						React.DOM.div({className: "dogeboard col-xs-11 col-md-10"}, 
							snowUI.AppInfo(null), 
							React.DOM.div({className: "dogeboard-left col-xs-12 col-md-12"}, 
								ReactCSSTransitionGroup({transitionName: "loading", component: React.DOM.div}, 
									loader
								), 
								mycomp({methods: methods})
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


