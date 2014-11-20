/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
//React.initializeTouchEvents(true);


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




/**
 * wallet components
 * */
//main
snowUI.wallet = React.createClass({displayName: 'wallet',
	getInitialState: function() {
		
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:false,moon:false},
			wally:false,
			testnet:false
		})
	},
	
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this;

		snowlog.log('willreceiveprops main wallet',_this.state, nextProps)
		
		
		//grab the data for this wallet
		if(nextProps.config.wallet && nextProps.config.wallet !== _this.state.config.wallet) {
			
			this.grabWallet(nextProps);
			
		}
		
		snowUI.methods.fadeOut();
		
		_this.setState({config:nextProps.config})
	},
	
	grabWallet: function(nextProps) {
		if(nextProps.config.wallet && nextProps.config.wallet !== 'new') {
			//our wallet config data is in config.mywallets
			//a matching pointer array is in config.locatewallet
			//this is a new selection so get some initial data from the api if it is rpc
			var _this = this;
			
			var wally = nextProps.config.wally;
			
			
			
			snowlog.log('grab wallet', wally)
			snowmessage('message','Now using wallet '+ wally.name+'.',2000);
			
			if(wally.coinapi==='rpc')
			{
				$.ajax({
				  url: "/api/snowcoins/local/wallet",
				  data: { wallet:nextProps.config.wallet,moon:'status' }
				})
				.done(function( resp,status,xhr ) {
					snowlog.log('hitting rpc server new wallet',resp)
					_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						
						//if(resp.data)changelock(resp.data.unlocked_until);
						if(resp.data && resp.data.testnet===true) {
							
							
							_this.setState({testnet:true})
							
						} else {
							
							
							_this.setState({testnet:false})
						
						}
						//changelock(resp.data.unlocked_until || 0);
						
					} else {
						_this.setState({testnet:false})
						snowmessage('killerror','Please try again. <br />'+resp.error,3000);
					}
				});
			} else {
				_this.setState({testnet:false})
			}
			
		}
				
	},
	componentWillUpdate: function() {
		
		snowUI.methods.fadeOut();
		
	},
	componentDidUpdate: function() {
		
		snowUI.methods.fadeIn();
		if(this.state.testnet !== this.state.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	componentWillMount: function() {
		
		snowUI.methods.fadeOut();
				
	},
	componentWillUnMount: function() {
		
		snowUI.methods.fadeOut();
				
	},
	componentDidMount: function() {
		
		if(this.state.config.wallet)
			this.grabWallet(this.state);
		
		snowUI.methods.fadeIn();
		if(this.state.testnet !== this.state.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	
	render: function() {
		
		snowlog.log('main wallet component - current state:', this.state)
	    
		var showcomp = (this.state.config.moon) ? this.state.config.moon : ''
		
		var renderMe; 
		
		if(snowUI[showcomp]) {
			renderMe = snowUI[showcomp]
		} else if(this.state.config.wallet) {
			
			if(this.state.config.wallet === 'new') 
				renderMe = snowUI.add
			else
				renderMe = snowUI.dashboard

		} else {
			
			renderMe = snowUI.overview
			
		}     
	    
		//stop loading
		snowUI.methods.loaderStop();

		return (

			React.DOM.div({className: "reactfade", id: "maindiv"}, " ", renderMe({config: this.state.config}), " ")

		);
	}
});
//overview list component
snowUI.overview = React.createClass({displayName: 'overview',
	menuClick: function(e) {
		
		e.preventDefault();
		
		var moon = $(e.target).parent()[0].dataset.snowmoon;
		
		snowUI.methods.valueRoute(moon);
		
		return false
	},
	deleteWallet: function(){
		
		return false;
	},
	componentDidUpdate: function() {
		
		sortCol('#snow-overview th');
		
	},	
	componentDidMount: function() {
			
		sortCol('#snow-overview th');
		
	},
	
	render: function() {
		snowUI.methods.loaderStop();
		snowlog.log('wallet overview component')
		if(this.props.config.mywallets instanceof Array) {
			var _this = this;
			//loop through our wallets and show a table
			var mytable = this.props.config.mywallets.map(function (w) {
				
				return (
					React.DOM.tr({key: w.key}, 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowPath.wallet + '/' + w.key+ '/update'}, React.DOM.span({className: "glyphicon glyphicon-pencil"}, " "))), 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowPath.wallet + '/' + w.key+ '/dashboard'},  w.name, " ")), 
						React.DOM.td(null, " ",  w.coin, " "), 
						React.DOM.td(null,  w.address, " "), 
						React.DOM.td(null, w.isSSL ? React.DOM.span({className: "glyphicon glyphicon-link"}) : ''), 
						React.DOM.td({onClick: _this.deleteWallet, 'data-snowmoon': w.key}, React.DOM.span({style: {cursor:"pointer"}, className: "removewallet text-danger glyphicon glyphicon-remove-sign"}, " "))
					)
				);
			});				
				
		}
		return (
			React.DOM.div({id: "snow-overview", className: "bs-example"}, 
				
				React.DOM.button({className: "btn btn-info btn-xs nav-item-add", onClick: snowUI.methods.buttonRoute, 'data-snowmoon': snowPath.wallet + '/new'}, "Add New Wallet"), 
				React.DOM.table({className: "table table-hover"}, 
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
//add new wallet component
snowUI.add = React.createClass({displayName: 'add',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet add component')
	    return (
		React.DOM.div(null, "Add New Wallet ")			
		
	    );
	}
});
//wallet dashboard component
snowUI.dashboard = React.createClass({displayName: 'dashboard',
	getInitialState: function() {
		this.getData()
		return ({});
		
	},
	componentWillUpdate: function () {
		this.getData()
		
	},
	getData: function () {
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:this.props.config.wallet,moon:this.props.config.moon};
			
		snowUI.methods.ajax.call(url,data,function(resp) {
			this.setState({data:resp.data});
		}.bind(this))
	},
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet dashboard component')
	    var data = this.state.data;
	    return (
		React.DOM.div(null, 
			React.DOM.div({class: "snow-block snow-balance"}, 
				React.DOM.div({class: "snow-block-heading"}, 
					React.DOM.p(null, "balance")
				), 
				React.DOM.div({class: "snow-balance-body"}, 
					React.DOM.p(null, data.balance.format('0,0.00000000').replace(/\.?0+$/, ""), " ", React.DOM.span({class: "coinstamp"}, "drk "))
				)
			)
		
		)			
		
	    );
	}
});
//overview list component
snowUI.send = React.createClass({displayName: 'send',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet send component')
	    return (
		React.DOM.div(null, "Send ")			
		
	    );
	}
});
//overview list component
snowUI.accounts = React.createClass({displayName: 'accounts',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet accounts component')
	    return (
		React.DOM.div(null, "Accounts ")			
		
	    );
	}
});
//overview list component
snowUI.transactions = React.createClass({displayName: 'transactions',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet transaction component')
	    return (
		React.DOM.div(null, "Transactions ")			
		
	    );
	}
});


