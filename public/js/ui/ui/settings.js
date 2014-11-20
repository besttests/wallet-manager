/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
//React.initializeTouchEvents(true);

/* not used but thats how you can use animation and other transition goodies
 * */
//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var SettingsUI = snowUI.settings



/**
 * settings components
 * */
//main
SettingsUI.UI = React.createClass({displayName: 'UI',
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
		
		snowlog.log('settings willgetprops','false state:',_state,nextProps)
		
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
				snowlog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				snowlog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		snowlog.info('settings did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		snowlog.info('settings did mount',this.state.component,this.props.config.page)
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
		snowlog.info(me)
		//me.tab('show')
		snowUI.methods.valueRoute(snowPath.settings + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		snowlog.log('settings component',this.state,this.props)
		
		if(!this.state.data) {
			snowlog.warn('empty render for receive')
			renderMe=(React.DOM.div(null))
		
		} else if(SettingsUI[showcomp]) {
			
			var po = SettingsUI[showcomp]
			renderMe = (po({config: this.props.config, state: this.state, UI: this}))
			var tp ='0px'
		
		} else {
			
			renderMe = (WalletUI.displayMessage({title: "404 Not Found", message: "I could not find the page you are looking for. ", type: "requesterror"}))
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
						React.DOM.li({className: "active"}, React.DOM.a({onClick: this.changeTab, 'data-target': "rates", role: "pill", 'data-toggle': "pill", title: snowtext.settings.menu.rates.title}, snowtext.settings.menu.rates.text)), 
						React.DOM.li(null, React.DOM.a({onClick: this.changeTab, 'data-target': "language", role: "pill", 'data-toggle': "pill", title: snowtext.settings.menu.language.title}, snowtext.settings.menu.language.text)), 
						React.DOM.li(null, React.DOM.a({role: "pill", 'data-toggle': "pill", onClick: snowUI.methods.hrefRoute, title: snowtext.settings.menu.autobot.title, href: snowPath.link}, snowtext.settings.menu.autobot.text)), 
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
SettingsUI.rates = React.createClass({displayName: 'rates',
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
		snowlog.info('rates receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		snowlog.info('rates did update')
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
		snowlog.info('submit rate parameter form',e)
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
				snowlog.error(resp)
				this.setState({requesting:false});
				snowUI.flash('error',resp.err,3500)
				
			}
		}.bind(this))
			
		
	},
	render: function() {
		snowlog.log('rates component', this.props)
		
		var text = snowtext.settings.rates,
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
									 "    ", React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.settings + '/' + _this.props.config.page + '', className: "btn btn-default"}, "Cancel")
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
							 
							 React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.settings + '/' + this.props.state.component + '/update', className: "btn btn-sm btn-default "}, text.button.add.text), 
						 
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
SettingsUI.language = React.createClass({displayName: 'language',
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
		
		if(snowlanguages.list.indexOf(newl) > -1) {
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true && resp.data.language) {
					
					snowlog.info('set user language')
					
					snowtext = resp.data.language;
					
					snowlanguages.mylanguage = newl
					snowlanguages.language = snowtext;
					
					snowUI.flash('success',snowtext.settings.messages.success.changeLanguage,15000);
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false})
						
					
				} else {
					snowlog.error(resp)
					snowUI.flash('error','Error changing language. ' + resp.err) 
				}
				return false
			})
		} else {
			snowUI.flash('error','Language ' + newl + ' is not available')
		}
		
		
	},
	render: function() {
		snowlog.log('language component')
		var _this = this;
		var l = snowlanguages.list;
		var listlanguages = l.map(function(v){
			var list = (v === snowlanguages.mylanguage) ? (React.DOM.strong(null, " ", v.toUpperCase())) : v;
			if(v!=='default' && v !== 'mylanguage')return (React.DOM.div({key: v, style: {padding:'4px 0',fontSize:16}, title: snowtext.settings.language.switch.text + v.toUpperCase()}, React.DOM.a({onClick: _this.changeLanguage, 'data-snowlanguage': v, className: v === snowlanguages.mylanguage ? 'active':''}, list)))
		})
		return (React.DOM.div({style: {padding:'5px 20px'}}, 
			
				React.DOM.div({id: "languagepage", className: "col-md-12  "}, 
					React.DOM.div({style: {padding:'5px 20px'}}, 
						React.DOM.div({className: "col-xs-12 "}, 
							React.DOM.h4({className: "profile-form__heading"}, snowtext.settings.language.choose.text)
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
snowUI.link.UI = React.createClass({displayName: 'UI',
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
		
		snowlog.log('link willgetprops','false state:',_state,nextProps)
		
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
				snowlog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				snowlog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		snowlog.info('link did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		snowlog.info('link did mount',this.props.config.wallet)
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
						snowlog.info('update DDNS',resp);
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
					snowlog.error(resp);
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
						snowlog.info('remove DDNS',resp);
						snowUI.flash('success',resp.data.link.data.message,10000);
						var _state={}
						_state.data = data;
						_state.connecting = false;
						_state.ready = true;
						_state.showddns = false;
						_this.setState(_state)
						
					});
					
				} else {
					snowlog.error(resp);
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
					snowlog.info('set share key',resp);
					if(!resp.data.userSettings.linkName) {
						snowUI.flash('error',snowtext.link.messages.success.setsharekey + ' :: Share key is not valid! ',15000);
					} else {
						snowUI.flash('success',snowtext.link.messages.success.setsharekey,15000);
					}
					_this.setState({showsharekey:false});
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false,connecting:false});
				} else {
					snowlog.error(resp);
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
					snowlog.info('set send key');
					snowUI.flash('success',snowtext.link.messages.success.setsendkey,15000);
					//fake out the UI and refresh
					_this.setState({showsendkey:false,connecting:false});
					snowUI.methods.updateState({showErrorPage:false});
				} else {
					snowlog.error(resp);
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
			snowlog.info('ping',resp)
			if(resp.success === true) {
				snowUI.killFlash('message');
				snowlog.info('pinged .link remote server');
				snowUI.flash('success','Ping Sent and Received successfully.',6000);
				//fake out the UI and refresh
				_this.setState({connecting:false});
				
			} else {
				snowlog.error(resp);
				snowUI.killFlash('message');
				var _state = {connecting:false}
				_this.setState(_state);
				snowUI.flash('error','' + resp.err,10000) ;
			}
			return false;
		})
			
	},
	render: function() {
		snowlog.log('link component',this.state)
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
				inputkeyshare.push(React.DOM.div({key: "aaa1234"}, React.DOM.p(null, React.DOM.span({dangerouslySetInnerHTML: {__html: snowtext.link.access.nosharekey.text}}), " ")));
				if(!this.state.showsharekey)inputkeyshare.push(React.DOM.div({key: "bb12345"}, " ", React.DOM.p(null, " You do not have a share key on file. ")))
			}
			if(this.state.showsharekey) {
				 inputkeyshare.push (React.DOM.div({style: {clear:'both'}}));
				 inputkeyshare.push (React.DOM.div({key: "aa12", className: "clearfix"}, React.DOM.form({className: "", role: "form", onSubmit: _this.setShare}, 
							 React.DOM.div({className: "form-group"}, 
								React.DOM.label({className: "sr-only", htmlFor: "sharekeyinput"}, snowtext.link.access.addsharekey.text, " "), 
								React.DOM.input({type: "text", className: "form-control", ref: "sharekeyinput", placeholder: snowtext.link.access.addsharekey.text})
							
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({className: "btn ", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, (this.state.connecting) ? snowtext.link.access.addsharekey.loading:snowtext.link.access.addsharekey.text), 
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
								React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addsendkey.info}}), 
							 React.DOM.div({className: "form-group"}, 
								React.DOM.label({className: "sr-only", htmlFor: "sendkeyinput"}, snowtext.link.access.addsendkey.text, " "), 
								React.DOM.input({style: {width:'100%'}, type: "text", className: "form-control", ref: "sendkeyinput", placeholder: snowtext.link.access.addsendkey.text})						
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({className: "btn ", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, (this.state.connecting) ? snowtext.link.access.addsendkey.loading:snowtext.link.access.addsendkey.text), 
								" ", React.DOM.a({style: {marginBottom:0}, className: "btn btn-default pull-right", onClick: _this.showSendInput}, "cancel")
							)
							), 
							React.DOM.div({className: "clearfix", style: {height:25,width:100,position:'relative'}})
							)
				);
			} else if(sendKey) {
				 inputkeysend =  (React.DOM.div({className: "col-xs-12"}, React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.setsendkey.text}})));
			} else {
				inputkeysend = (React.DOM.div(null, React.DOM.p(null, snowtext.link.access.setsendkey.absent, React.DOM.br(null), " ")));
			}
			
			var ddns;
			if(this.state.showddns) {
				ddns = (React.DOM.div({className: " link-info"}, 
						React.DOM.form({className: "", role: "form", onSubmit: _this.setDDNS}, 
							React.DOM.div({className: "col-xs-12  col-md-6", style: {padding:'5px'}}, 
								React.DOM.div({className: "link-head"}, 
									snowtext.link.linkaccount.ddns	
								), 
								React.DOM.div({style: {padding:'5px'}}, 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.text}}), 
									React.DOM.div({className: "form-group input-group col-xs-12"}, 
										React.DOM.input({ref: "oldhostname", type: "hidden", value: hostname}), 
										React.DOM.input({style: {textAlign:'right'}, type: "text", className: "form-control", ref: "hostname", placeholder: snowtext.link.access.addddns.text, defaultValue: hostname}), 
										React.DOM.span({className: "input-group-addon input-group "}, ".", snowtext.link.domain)
															
									), 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.ddnsInfo}}), 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.trackerInfo}})
								), 
								React.DOM.div({className: "clearfix", style: {marginBottom:'25px'}})
								
							), 
							
							React.DOM.div({className: "col-xs-12 col-md-6", style: {padding:'5px'}}, 
								React.DOM.div({className: "link-head"}, 
									snowtext.link.linkaccount.link	
								), 
								React.DOM.div({style: {padding:'5px'}}, 
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.linkAsk}}), 
									
										
										React.DOM.div({className: "col-xs-12 form-group input-group "}, 
											React.DOM.select({style: {width:'100px',fontSize:'16px'}, ref: "use", className: "form-control coinstamp", defaultValue: this.state.data.userSettings.linkServer}, 
												React.DOM.option({value: "off"}, snowtext.accounts.address.moreinfo.lock.option.no), 
												React.DOM.option({value: "on"}, snowtext.accounts.address.moreinfo.lock.option.yes)
											), 
											React.DOM.span({style: {width:'60px'}, className: "input-group-addon input-group "}, snowtext.link.access.addddns.port), 
											React.DOM.input({style: {width:'auto'}, type: "text", className: "form-control", ref: "port", placeholder: "port (12777)", defaultValue: snowUI.link.port})
											
										), 
										React.DOM.div({className: "col-xs-12 ", dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.allow.replace('{port}',snowUI.link.port)}}), 
									
									React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.access.addddns.linkInfo.replace('{port}',snowPath.link.port)}})
									
								)
							), 
							
							
							React.DOM.div({className: "clearfix"}), 
							React.DOM.div({className: "form-group col-xs-12 ", style: {padding:'0 10px'}}, 
								React.DOM.button({className: "btn center-block", disabled: (this.state.connecting) ? 'disabled' : '', style: {marginBottom:0}}, this.state.connecting ? snowtext.link.access.addddns.buttonadding : snowtext.link.access.addddns.button), 
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
								React.DOM.td({colSpan: "5"}, React.DOM.a({className: "btn btn-default btn-sm", onClick: _this.showDDNSInput}, snowtext.link.access.addddns.addbutton))
							)
						)
					)
				 ));
			} else {
				ddns = (React.DOM.div({className: " link-info"}, React.DOM.p(null, snowtext.link.access.addddns.absent), React.DOM.a({className: "btn btn-default btn-sm", onClick: _this.showDDNSInput}, snowtext.link.access.addddns.addbutton)));
			}
				
			
			return (React.DOM.div({style: {padding:'5px 20px'}}, 
				
					React.DOM.div({id: "linkpage", className: "col-md-12  "}, 
						React.DOM.div({style: {padding:'5px 20px'}}, 
							React.DOM.div({className: "col-xs-12 "}, 
								React.DOM.h4({className: "profile-form__heading"}, snowtext.link.title.text), 
								React.DOM.div({dangerouslySetInnerHTML: {__html: snowtext.link.title.info}})
							), 
							React.DOM.div({className: "clearfix"}), 
							React.DOM.div({style: {height:'30px',position:'relative',width:'100%'}}), 
							React.DOM.div({className: "col-xs-12 col-md-6 link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowtext.link.sharekey.text, 
									React.DOM.a({className: "btn btn-default btn-xs pull-right", onClick: _this.showShareInput}, "Change")
								), 
								React.DOM.div({className: " link-info"}, 
									inputkeyshare
								)
							), 
							React.DOM.div({className: "col-xs-12 col-md-6  link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowtext.link.sendkey.text, 
									React.DOM.a({className: "btn btn-default btn-xs pull-right", onClick: _this.showSendInput}, "Change")
								), 
								React.DOM.div({className: " link-info"}, 
									inputkeysend
								)
							), 
							React.DOM.div({className: "col-xs-12 link-info"}, 
								React.DOM.div({className: "link-head"}, 
									snowtext.link.linkaccount.text
									
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
