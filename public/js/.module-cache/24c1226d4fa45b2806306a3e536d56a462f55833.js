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
		if(this.props.config && this.props.config.moon === false)this.props.config.moon = 'overview'
		return ({
			config:this.props.config || {section:snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		if(nextProps.moon === false && this.state.moon === false)nextProps.moon = 'overview'
		console.log('willreceiveprops main wallet',this.state, nextProps)
		this.setState({config:nextProps.config})
	},
	render: function() {
	    console.log('main wallet component - current state:', this.state)
	    
	    var showcomp = (this.state.config.moon) ? this.state.config.moon : this.state.config.wallet ? 'dashboard' : 'overview'
	    var renderMe = snowUI[showcomp] ? snowUI[showcomp] : this.state.config.wallet ? snowUI.dashboard : snowUI.overview
	    
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
	    console.log('wallet overview component')
	    return (
		React.DOM.div(null, "Overview ")			
		
	    );
	}
});
//wallet dashboard component
snowUI.dashboard = React.createClass({displayName: 'dashboard',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('wallet dashboard component')
	    return (
		React.DOM.div(null, "Dashboard ")			
		
	    );
	}
});
//overview list component
snowUI.send = React.createClass({displayName: 'send',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('wallet send component')
	    return (
		React.DOM.div(null, "Send ")			
		
	    );
	}
});
//overview list component
snowUI.accounts = React.createClass({displayName: 'accounts',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('wallet accounts component')
	    return (
		React.DOM.div(null, "Accounts ")			
		
	    );
	}
});
//overview list component
snowUI.transactions = React.createClass({displayName: 'transactions',
	
	render: function() {
	    snowUI.methods.loaderStop();
	    console.log('wallet transaction component')
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
	    console.log('settings component')
	    snowUI.methods.loaderStop();
	    return (
		React.DOM.div(null)				
		
	    );
	}
});
//inq component
snowUI.inq = React.createClass({displayName: 'inq',
	
	render: function() {
		console.log('inqueue component')
		snowUI.methods.loaderStop();
		return (
			React.DOM.div(null)			
		
		);
	}
});




