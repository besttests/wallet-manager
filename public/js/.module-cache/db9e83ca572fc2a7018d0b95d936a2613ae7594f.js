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
			testnet:false,
			ready:false,
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
				snowUI.methods.ajax.callwaiting("/api/snowcoins/local/wallet",{ wallet:nextProps.config.wallet,moon:'status' },function(resp) {
					snowlog.log('hitting rpc server new wallet',resp)
					if(resp.success === true)
					{
						
						//if(resp.data)changelock(resp.data.unlocked_until);
						if(resp.data && resp.data.testnet===true) {
							
							
							_this.setState({testnet:true,ready:true})
							
						} else {
							
							
							_this.setState({testnet:false,ready:true})
						
						}
						//changelock(resp.data.unlocked_until || 0);
						
					} else {
						_this.setState({testnet:false,ready:true})
						snowmessage('error','Please try again. <br />'+resp.error,3000);
					}
				
				})
				
			} else {
				_this.setState({testnet:false,ready:true})
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

			React.DOM.div({className: "reactfade", id: "maindiv"}, " ", renderMe({config: this.state.config, ready: this.state.ready}), " ")

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
		
		return {mounted:false,ready:this.props.ready};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(this.state.ready || nextProps.ready)this.getData(function(resp){_this.setState({data:resp.data,mounted:true}) })
		snowlog.log('dashboard will receive props',this.props)
	},
	componentWillUpdate: function () {
		var _this = this
		//if(this.state.ready)this.getData(function(resp){ _this.setState({data:resp.data,mounted:true}) })
		snowlog.log('dashboard will update',this.props)
	},
	componentDidMount: function() {
		var _this = this
		snowlog.log('dashboard did mount',this.props)
		//_this.setState({data:resp.data,mounted:true})
		if(this.state.ready)this.getData(function(resp){ _this.setState({data:resp.data,mounted:true}) })
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false})
	},
	getData: function (cb) {
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:this.props.config.wallet,moon:this.props.config.moon};
		snowlog.log('data',data)
		snowUI.methods.ajax.callwaiting(url,data,function(resp) {
			console.log(resp)
			cb(resp)
		})
		return false
	},
	
	render: function() {
		
		
		snowlog.log('wallet dashboard component')
		
		if(this.state.mounted) {
			snowUI.methods.loaderStop();
			var data = this.state.data;
			
			var loop = Object.keys(data);
			snowlog.log('dashboard data',loop,data)
			var status = loop.forEach(function(k,v) {
				console.log(k,v)
				return (
					React.DOM.div({key: v, className: "col-xs-12 col-sm-6 col-md-6"}, 
						React.DOM.div({className: "snow-status snow-block"}, 
							React.DOM.div({className: "snow-block-heading"}, 
								React.DOM.p(null, v)
							), 
							React.DOM.div({className: "snow-status-body"}, 
								React.DOM.p(null, data[k])
							)
						)
					)
				);
			}); 

			
			return (
			React.DOM.div({className: "snow-dashboard"}, 
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
							React.DOM.div(null, React.DOM.a({className: "backupwalletbutton text-muted"}, "Backup Wallet")), 
							React.DOM.div(null, React.DOM.a({className: "updatecoin"}, "Update ", this.props.config.wally.name.toUpperCase(), "   "))
						)
					)
				), 
				React.DOM.div({className: "clearfix"}), 
				React.DOM.div({className: "snow-status"}, 
					status
				)
			)			

			);
		} else {
			return(React.DOM.div(null))
		}

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


