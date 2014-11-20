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
 * receive components
 * */
//main
snowUI.receive = React.createClass({displayName: 'receive',
	componentWillUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
	},
	componentDidUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	componentWillMount: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
		
	},
	componentDidMount: function() {
			
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	render: function() {
	    snowlog.log('receive component')
	snowUI.methods.loaderStop();
	    return (
		React.DOM.div({className: "reactfade-enter", id: "maindiv"}, "  Receive ")		
		
	    )
	}
});
//settings component
snowUI.settings = React.createClass({displayName: 'settings',
	componentWillUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
	},
	componentDidUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	componentWillMount: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
		
	},
	componentDidMount: function() {
			
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	render: function() {
	    snowlog.log('settings component')
	    snowUI.methods.loaderStop();
	    return (
		React.DOM.div({className: "reactfade-enter", id: "maindiv"}, "  Settings ")				
		
	    );
	}
});
//inq component
snowUI.inq = React.createClass({displayName: 'inq',
	componentWillUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
	},
	componentDidUpdate: function() {
		
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	componentWillMount: function() {
		
		$('#maindiv').addClass('reactfade-enter ');
		$('#maindiv').removeClass('reactfade-enter-active');
		
		
	},
	componentDidMount: function() {
			
		$('#maindiv').addClass('reactfade-enter-active');
		
	},
	render: function() {
		snowlog.log('inqueue component')
		snowUI.methods.loaderStop();
		return (
			React.DOM.div({className: "reactfade-enter", id: "maindiv"}, "  Inqueue ")			
		
		);
	}
});




