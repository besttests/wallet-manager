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

var Routes = ReactRouter.Routes,
	Link = ReactRouter.Link,
	Route = ReactRouter.Route,
	NotFoundRoute = ReactRouter.NotFoundRoute,
	DefaultRoute = ReactRouter.DefaultRoute;

/* bootstrap components
 * */
var Flash = ReactBootstrap.Alert;
var Btn = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;


/* create flash message 
 * */
var SnowpiFlash = React.createClass({displayName: 'SnowpiFlash',
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(!this.state.isVisible)
		    return null;

		var message = this.props.children;
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
var SnowpiMan = React.createClass({displayName: 'SnowpiMan',
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    
	    return this.transferPropsTo(
		React.DOM.div({style: this.props.divstyle, dangerouslySetInnerHTML: {__html: snowtext.logoman}})
	    );
	}
});


var UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		var now = new Date();
		/**
		 * initialize the app
		 * the plan is to keep only active references in root state.  
		 * we should use props for the fill outs
		 * */
		return {};
	},
	componentWillReceiveProps: function() {
		/**
		 * should be a mimic of initial
		 * 
		 * */
		//this.setState({response:no});
		return false;
	},
	changeTheme: function() {
		
	},
	render: function() {
		return (
			React.DOM.div({id: "snowpi-wrapper"}, 
				React.DOM.div({id: "snowpi-body"}, 
					React.DOM.div({id: "walletbar", className: "affix"}, 
					  React.DOM.div({className: "wallet"}, 
						React.DOM.div({className: "button-group"}, 
							Btn({bsStyle: "link", 'data-toggle': "dropdown", className: "dropdown-toggle"}, snowtext.menu.menu.name), 
							React.DOM.ul({className: "dropdown-menu", role: "menu"}, 
								React.DOM.li({className: "nav-item-add"}, " ", React.DOM.a(null, React.DOM.link({to: ""}, snowtext.menu.plus.name))), 					
								React.DOM.li({className: "nav-item-home"}, " ", React.DOM.a(null, React.DOM.link({to: "overview"}, snowtext.menu.list.name))), 
								React.DOM.li({className: "nav-item-receive"}, React.DOM.a(null, React.DOM.link({to: "receive"}, snowtext.menu.receive.name))), 
								React.DOM.li({className: "divider"}), 
								React.DOM.li({className: "nav-item-snowcat"}, React.DOM.link({to: ""})), 
								React.DOM.li({className: "divider"}), 
								React.DOM.li(null, 
									React.DOM.div(null, 
										React.DOM.div({onClick: this.changeTheme, className: "walletmenuspan changetheme bstooltip", title: "Switch between the light and dark theme", 'data-toggle': "tooltip", 'data-placement': "bottom", 'data-container': "body"}, React.DOM.span({className: "glyphicon glyphicon-adjust"})), 
										React.DOM.div({className: "walletmenuspan bstooltip", title: "inquisive queue", 'data-toggle': "tooltip", 'data-placement': "bottom", 'data-container': "body"}, " ", React.DOM.link({to: "inq"}, React.DOM.span({className: "nav-item-inq"}))), 
										React.DOM.div({className: "walletmenuspan bstooltip", title: "Logout", 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body"}, " ", React.DOM.a({href: "/signout"}, " ", React.DOM.span({className: "glyphicon glyphicon-log-out"}))), 
										React.DOM.div({className: "clearfix"})
									)
								)
							)
						)
					)
				)
			), 
			/* this is the important part */
			this.props.activeRouteHandler(null)
			)
		);
	}
});

var routes1 = (
	Routes({location: "history"}, 
		Route({path: "/react", handler: UI}
			
		), 
		Route({path: "/", handler: UI}
			
		), 
		Route({path: "", handler: UI}
			
		), 
		NotFoundRoute({handler: UI})
	)
);

//React.renderComponent(routes, document.getElementById('snowcoins-react'));

var App = React.createClass({displayName: 'App',
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.header(null, 
          React.DOM.ul(null, 
            React.DOM.li(null, Link({to: "app"}, "Dashboard")), 
            React.DOM.li(null, Link({to: "inbox"}, "Inbox")), 
            React.DOM.li(null, Link({to: "calendar"}, "Calendar"))
          ), 
          "Logged in as Joe"
        ), 

        /* this is the important part */
        this.props.activeRouteHandler(null)
      )
    );
  }
});

var routes = (
  Routes({location: "history"}, 
    Route({name: "app", path: "/react", handler: App}
      
    )
  )
);

React.renderComponent(routes, document.body);
