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




