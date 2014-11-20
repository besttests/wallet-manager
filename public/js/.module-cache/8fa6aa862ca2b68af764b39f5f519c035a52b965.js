/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
//React.initializeTouchEvents(true);

/* not used but thats how you can use animation and other transition goodies
 * */
//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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
			wally:false
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this;

		snowlog.log('willreceiveprops main wallet',_this.state, nextProps)
		
		//grab the data for this wallet
		if(nextProps.config.wallet && nextProps.config.wallet !== _this.state.config.wallet) {
			
			this.grabWallet(nextProps);
			
		}
		
		_this.setState({config:nextProps.config})
	},
	componentDidMount: function() {
		if(this.state.config.wallet)
			this.grabWallet(this.state);
	},
	grabWallet: function(nextProps) {
		if(nextProps.config.wallet && nextProps.config.wallet !== 'new') {
			//our wallet config data is in config.mywallets
			//a matching pointer array is in config.locatewallet
			//this is a new selection so get some initial data from the api if it is rpc
			var _this = this;
			
			var wally = this.state.config.mywallets[this.state.config.locatewallet.indexOf(this.state.config.wallet)];
			snow.log('grab wallet', wally)
			snowmessage('message','Now using wallet '+ resp.wally.name+'.',2000);
			
			if(wally.coinapi==='rpc')
			{
				$.ajax({
				  url: "/api/snowcoins/local/wallet",
				  data: { wallet:nextProps.config.wallet,moon:'status' }
				})
				.done(function( resp,status,xhr ) {
					snowlog.log('hitting rpc server new wallet')
					_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						
						//if(resp.data)changelock(resp.data.unlocked_until);
						if(resp.data && resp.data.testnet===true)
						{
							//cleartestnet(true)
						}
						else
						{
							//cleartestnet()
						}
						//changelock(resp.data.unlocked_until || 0);
						
					} else {
						snowmessage('killerror','Please try again. <br />'+resp.error,3000);
					}
				});
			} else {
				//cleartestnet()
			}
			
			_this.setState({wally:resp.wally});
		}
				
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
		React.DOM.div(null, " ", renderMe({config: this.state.config}), " ")	
		
	    );
	}
});
//overview list component
snowUI.overview = React.createClass({displayName: 'overview',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet overview component')
	    return (
		React.DOM.div(null, "Overview ")			
		
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
	
	render: function() {
	    snowUI.methods.loaderStop();
	    snowlog.log('wallet dashboard component')
	    return (
		React.DOM.div(null, "Dashboard ")			
		
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


