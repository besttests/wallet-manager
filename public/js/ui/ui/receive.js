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



var ReceiveUI = snowUI.receive



/**
 * receive components
 * */
//main
ReceiveUI.UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		return ({
			dynamic:'active in',
			static:'',
			keys:'',
			trackers:'',
			component: 'shortcuts',
			connecting:true,
			error: false,
			message: false,
			data:false
		})
	},
	getFalseState: function() {
		return ({
			dynamic:'',
			static:'',
			keys:'',
			trackers:'',
			data: false
			
		})
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowlog.log('receive willgetprops')
		var _state = this.getFalseState();
		var page = nextProps.config.page || this.state.component
			
		_state[page] = 'in active'
		_state.component = page
		this.setState(_state)
		if(snowUI.debug) snowlog.log('receive willgetprops','false state:',_state,nextProps)
		/* now get our data */
		this.getPage(page)
		
		
	},
	getPage: function(page) {
		if(!page)page = this.state.component
		
		var _this = this,
			url = "/api/snowcoins/local/receive/setup",
			data = {page:page},
			po = page;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowlog.info('got data for ' + po,resp.data,po)
				if(resp.ip && resp.ip!='')snowUI.myip=resp.ip;
				_this.setState({data:resp.data,connecting:false})
			} else {
				if(snowUI.debug) snowlog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.info('receive did update')
	},
	componentWillMount: function() {
		//$('body').find('[rel=popover]').popover('destroy');
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowlog.info('receive did mount')
		var me = $('a[data-target="'+this.props.config.page+'"]')
		me.tab('show')	
	},
	changeTab: function(e) {
		var me = $(e.target);
		var them = $('.tab-pane');
		var options = {
			skipload:false,
			trigger:true
		}
		if(snowUI.debug) snowlog.info(me,them)
		me.tab('show')
		snowUI.methods.valueRoute(snowPath.receive + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		
		
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		if(snowUI.debug) snowlog.log('receive component',this.state)
		
		if(this.state.error ) {
			
			 renderMe = (WalletUI.displayMessage({message: this.state.message, type: "warning"}))
			
			
		} else if(!this.state.data) {
			if(snowUI.debug) snowlog.warn('empty render for receive')
			
		
		} else if(ReceiveUI[showcomp]) {
			
			var po = ReceiveUI[showcomp]
			renderMe = (po({config: this.props.config, state: this.state}))
		
		} else {
			
			renderMe = (WalletUI.displayMessage({title: "404 Not Found", message: "I could not find the page you are looking for. ", type: "requesterror"}))
			 
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
				React.DOM.nav({role: "navigation", className: "navbar navbar-inverse"}, 
					React.DOM.div({className: "navbar-header shortmenu"}, 
						React.DOM.button({style: {marginLeft:8,float:'left'}, type: "button", 'data-toggle': "collapse", 'data-target': ".navbar-dccnav-collapse", className: "navbar-toggle navbar-toggle-menu navbar-toggle-right"}, React.DOM.span({className: "sr-only"}, "Toggle navigation"), React.DOM.span({className: "icon-bar"}), React.DOM.span({className: "icon-bar"}), React.DOM.span({className: "icon-bar"})
						), 
						React.DOM.div({style: {float:'left'}, className: "shortmenu-text navbar-toggle"}, this.props.config.wallet)
					), 
					React.DOM.div({className: "collapse navbar-collapse navbar-dccnav-collapse"}, 
						React.DOM.ul({className: "nav navbar-nav dccnavlis", role: "tablist", 'data-tabs': "tabs"}, 
							
							React.DOM.li({className: "active"}, React.DOM.a({'data-target': "shortcuts", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowtext.receive.tabs.static.text)), 
							React.DOM.li(null, React.DOM.a({onClick: this.changeTab, 'data-target': "dynamic", role: "tab", 'data-toggle': "tab", id: "lidynamic"}, snowtext.receive.tabs.dynamic.text)), 
							React.DOM.li(null, React.DOM.a({'data-target': "keys", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowtext.receive.tabs.keys.text)), 
							React.DOM.li(null, React.DOM.a({id: "litrackers", 'data-target': "trackers", role: "tab", 'data-toggle': "tab", onClick: this.changeTab}, snowtext.receive.tabs.trackers.text)), 

							React.DOM.li(null, React.DOM.a({onClick: function(){ return location.reload()}}, React.DOM.span({className: "glyphicon glyphicon-refresh"})))
						)
					)
				), 

				React.DOM.div({style: {padding:'20px 10px 0 10px'}, className: "tabbox clearfix tab-content ", id: "maindiv"}, 
				
				
					renderMe
				), 
				React.DOM.div({className: "clearfix"})
			)		
		)
	    )
	}
});


//dynamic component
ReceiveUI.dynamic = React.createClass({displayName: 'dynamic',
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
		if(snowUI.debug) snowlog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.info('dynamic did update')
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
		$("#dccadddynamic #receivertype").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#dccadddynamic #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dccadddynamic #dccaddwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
							//console.log(data);
							//_csrf = xhr.getResponseHeader("x-snow-token");
							var re = $.ui.autocomplete.escapeRegex(req.term);
							console.log(re);
							var matcher = new RegExp( re, "i" );
							response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$('#addreceiverformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#addreceiveraccount').fadeIn();
			else $('#addreceiveraccount').fadeOut();
		});
		
	},
	submitForm: function(e) {
		if(snowUI.debug) snowlog.info('submit dynamic add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var addw=this.refs.dccaddwallet.getDOMNode().value.trim(),
			useme=this.refs.useme.getDOMNode().value.trim(),
			name=this.refs.name.getDOMNode().value.trim(),
			address=this.refs.address.getDOMNode().value.trim(),
			next = true;
		
		if(name==='') {
			
			$(this.refs.name.getDOMNode()).parent().addClass('has-error');
			next=false;
			
		} else $(this.refs.name.getDOMNode()).parent().removeClass('has-error');
			
		if (addw==='Select A Wallet' && useme==='TABwallet') {
			
			$("#maindiv #dccaddwallet").parent().addClass('has-error');
			next = false
			
		} else $("#maindiv #dccaddwallet").parent().removeClass('has-error');
		
		if (useme==='TABaddress' && address==='') {
			
			$("#maindiv #address").parent().addClass('has-error');
			next = false
			
		} else $("#maindiv #address").parent().removeClass('has-error');
		
		if(next===false) {
			
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
			
		} else {
			
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dccadddynamic" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Dynamic receiver added',2500)
					this.setState({requesting:false});
				
				} else {
					if(snowUI.debug) snowlog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowlog.log('opem remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' dynamic receiver ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowlog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete',wally:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
	
					snowUI.flash('success','Dynamic receiver removed',2500)
				
				} else {
					if(snowUI.debug) snowlog.error(resp)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		if(snowUI.debug) snowlog.log('dynamic component', this.props)
		
		var text = snowtext.receive.dynamic,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", val.coin, " "), 
						React.DOM.td(null, " ", val.name, " "), 
						React.DOM.td(null, " ", val.wallet ? val.wallet.name : '--', " "), 
						React.DOM.td(null, " ", val.confirmations, " "), 
						React.DOM.td(null, " ", val.account || '--', "  "), 
						React.DOM.td(null, " ", val.address || '--', "  ")
					)
				);
			}.bind(this));
		}
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
					React.DOM.form({id: "dccadddynamic", onSubmit: this.submitForm, className: "easytab reversetab"}, 
						
						React.DOM.div({className: "adderror"}), 
						React.DOM.div({style: {marginLeft:10}}, 
							React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills", role: "tablist", 'data-tabs': "pills"}, 
								React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABwallet", role: "pill", 'data-toggle': "pill"}, "From Wallet")), 
								React.DOM.li(null, React.DOM.a({'data-target': "TABaddress", role: "pill", 'data-toggle': "pill"}, "Manual"))
							)
						), 
						React.DOM.div({className: "tab-content"}, 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
								React.DOM.input({type: "text", ref: "name", name: "name", placeholder: "name of dynamic receiver", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({id: "TABwallet", className: "tab-pane active "}, 
								React.DOM.div({className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet"), 
									React.DOM.select({ref: "dccaddwallet", id: "dccaddwallet", name: "dccaddwallet", className: "form-control input input-faded"}, 
										React.DOM.option(null, "Select A Wallet"), 
										wallets
									)
								), 
								React.DOM.div({className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Send to Format"), 
									React.DOM.select({ref: "format", id: "addreceiverformat", name: "format", className: "form-control input input-faded"}, 
										React.DOM.option({value: "1"}, "New Account & Address per transaction"), 
										React.DOM.option({value: "2"}, "One Account + New Address per transaction"), 
										React.DOM.option({value: "3"}, "One Account & Address for a single transaction")
									)
								), 
								React.DOM.div({id: "addreceiveraccount", style: {display:"none"}, className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Account"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", ref: "account", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
								)
							), 
							React.DOM.div({id: "TABaddress", className: "tab-pane "}, 
								React.DOM.p({className: "text-warning"}, "*Blockchain monitoring support not functional yet and these receivers can not be tracked."), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Coin Address"), 
									React.DOM.input({type: "text", id: "address", name: "address", ref: "address", placeholder: "address", className: "form-control coinstamp input input-faded"})
								), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Coin Type"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", id: "receivertype", ref: "receivertype", name: "receivertype", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
								)
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Total Offset", React.DOM.span({style: {marginLeft:3}, 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body", title: "", className: "glyphicon glyphicon-info-sign bstooltip", title: "If you plan on accepting multiple coins for payment you should set an offset.  If you charge 55000 Ð and accept Ð, BTC and LTC for payment the conversion may leave a payment at 49990 Ð.  If you set the offset to 10 Ð the order would be considered complete."})), 
								React.DOM.input({type: "text", id: "totaloffset", name: "totaloffset", ref: "totaloffset", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Confirmations", 
									React.DOM.span({style: {marginLeft:3}, 'data-toggle': "tooltip", 'data-placement': "right", 'data-container': "body", title: "", className: "glyphicon glyphicon-info-sign bstooltip", title: "The number of confirmations needed to consider a transaction payment complete."})
									), 
								React.DOM.input({type: "text", id: "confirmations", name: "confirmations", ref: "confimations", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? 'Adding...' : 'Add Dynamic Receiver'), 
								React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
							)
						), 
						React.DOM.input({type: "hidden", ref: "action", name: "action", defaultValue: "add-wallet"}), 
						React.DOM.input({type: "hidden", name: "useme", ref: "useme", id: "fw-useme", defaultValue: "TABwallet", className: "fw-useme"})
					)
				)
			)
		}.bind(this)
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "dynamicpage", className: "col-md-12  tab-pane fade in active"}, 
					React.DOM.div({className: "snow-block-body"}, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text), 
						  React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.coin.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.receiver.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.wallet.text)), 
										React.DOM.th({title: "confirmations"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.cfms.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"})
				), 
				removeItem.call(this,this.removeNow)
			)			
		
			);
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
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

//client component
ReceiveUI.shortcuts = React.createClass({displayName: 'shortcuts',
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
		if(snowUI.debug) snowlog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.info('static did update')
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
		$("#dccaddofflineform #coin").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#dccaddofflineform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dccaddofflineform  #fw-pickwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$("#dccaddofflineform #address").autocomplete({ 
			source: function(req, response) { 
					   if($('#dccaddofflineform #fw-useme').val()!=='TABmanual')$.ajax({
						url: '/api/snowcoins/simple/get-addresses/?wally='+$("#dccaddofflineform #fw-pickwallet").val()+'&account='+$("#dccaddofflineform #account").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		
		$('#dccaddofflineform #offlineformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#dccaddofflineform #offlineaccount').fadeIn();
			else $('#dccaddofflineform #offlineaccount').fadeOut();
		});
		
		$('#dccaddofflineform').find('[rel=popover]').popover();
	},
	submitForm: function(e) {
		if(snowUI.debug) snowlog.info('submit shortcut add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var next = true,
			shortcut=$('#dccaddofflineform #shortcut').val(),
			address=$('#dccaddofflineform #address').val(),
			wallet=$('#dccaddofflineform #fw-pickwallet').val(),
			useme=$('#dccaddofflineform #fw-useme').val()==='TABmanual'?2:1,
			type=$('#dccaddofflineform #type').val();
		//check req
		if(shortcut==='') {
			$("#dccaddofflineform #shortcut").parent().addClass('has-error');
			next=false;
		} else $("#dccaddofflineform #shortcut").parent().removeClass('has-error');
		if(useme===2) {
			if(address==='') {
				$("#dccaddofflineform #address").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #address").parent().removeClass('has-error');
			if(type==='') {
				$("#dccaddofflineform #type").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #type").parent().removeClass('has-error');
		} else {
			if(wallet==='Select A Wallet') {
				$("#dccaddofflineform #fw-pickwallet").parent().addClass('has-error');
				next=false;
			} else $("#dccaddofflineform #fw-pickwallet").parent().removeClass('has-error');
		}
		if(next===false) {
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
		}
		else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dccaddofflineform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Shortcut ' + shortcut + ' added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowlog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowlog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' static receiver ' + iden,removeItem:true});
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowlog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-unattended',wid:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
					snowUI.flash('success','Shortcut removing now.',2500)
				
				} else {
					if(snowUI.debug) snowlog.warn(resp.error)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		
		snowUI.loaderRender();
		var text = snowtext.receive.static,
			results,
			_this = this;
		var list = this.props.state.data[this.props.state.component]
		if(snowUI.debug) snowlog.log('static receiver component', list)
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				var format = val.sign.format === '1' ? 'Share' : val.sign.format === '2' ? ' Share & Pay' : 'Payments';
				var locked = val.sign.lock ? 'Will Encrypt' : 'Viewable';
				var sharehost = snowUI.link.state === 'on' ? snowPath.linkServer.host + '.' + _this.props.config.userSettings.linkName + '.' + val.apikey : snowPath.share + '/' + val.apikey;
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", React.DOM.a({href: sharehost, target: "_blank"}, val.apikey), " "), 
						React.DOM.td(null, " ", val.coin, " ", React.DOM.br(null), " ", format, " "), 
						React.DOM.td(null, " ", val.sign.pinop, " ", React.DOM.br(null), " ", val.sign.keyphrase, "  "), 
						React.DOM.td(null, " ", val.address, " ", React.DOM.br(null), " ", locked, "  "), 
						React.DOM.td(null, " ", moment(val.expires).format("llll"), " ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "staticpage", className: "col-md-12  tab-pane fade  in active"}, 
					ButtonToolbar(null, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text)
					), 
					React.DOM.div({className: "snow-block-body"}, 
						
						React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.findme.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.coin.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text)), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.expires.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"}), 
					removeItem.call(this,this.removeNow)
				)
			)			
		
			)
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
				
				  React.DOM.form({id: "dccaddofflineform", onSubmit: this.submitForm, className: "easytab reversetab"}, 
				    React.DOM.div({className: "adderror"}), 
					React.DOM.div({style: {marginLeft:10}}, 
					      React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills"}, 
						React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABfromwallet", 'data-toggle': "pill"}, "From Wallet")), 
						React.DOM.li(null, React.DOM.a({'data-target': "TABmanual", 'data-toggle': "pill"}, "Manual"))
						
					      )
					), 
				    React.DOM.div({className: "tab-content"}, 
					      
				      React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, 
							"shortcut  ", 
							React.DOM.a({className: "helppopover", rel: "popover", 'data-trigger': "click focus", title: "Accessing Share Pages", 'data-html': "true", 'data-container': "body", 'data-content': "<p>You can access share pages by the shortcut.</p><p>With a   <a href='http://snowcoins.link/snowcat' target='_blank'>.link account</a> you can share addresses like so: <a href='http://snowcoins.link/.snowkeeper.donate' target='_blank' >http://snowcoins.link/.snowkeeper.donate</a></p><p>There is also a <a href='"+snowPath.share+"' target='_blank' >local page</a> you can expose to the internet instead of using a .link account.</p>", 'data-toggle': "popover", 'data-placement': "bottom"}, React.DOM.span({className: "glyphicon glyphicon-question-sign "}), " ")
						), 
						React.DOM.input({type: "text", id: "shortcut", name: "shortcut", placeholder: "must be unique", className: "form-control coinstamp input input-faded"}), 
						React.DOM.input({type: "hidden", name: "action", defaultValue: "add-offline"}), 
						React.DOM.input({type: "hidden", name: "useme", id: "fw-useme", defaultValue: "TABfromwallet", className: "fw-useme"})
				      ), 
				      React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Expires"), 
					React.DOM.select({name: "expires", className: "form-control input input-faded"}, 
					  React.DOM.option({value: "laina"}, "Never"), 
					  React.DOM.option({value: "burnonimpact"}, "One Use Only"), 
					  React.DOM.option({value: "1"}, "1 day"), 
					  React.DOM.option({value: "7"}, "1 week"), 
					  React.DOM.option({value: "30"}, "30 days"), 
					  React.DOM.option({value: "180"}, "6 months"), 
					  React.DOM.option({value: "365"}, "1 year")
					)
					), 
				      React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Display"), 
					React.DOM.textarea({type: "textarea", rows: "3", id: "display", name: "display", placeholder: "Comments to the sender.", className: "form-control coinstamp input input-faded"})
				      ), 
				      
				      React.DOM.div({id: "TABmanual", className: "tab-pane "}, 
					
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Coin"), 
					  React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", id: "coin", name: "coin", className: "form-control coinstamp input input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({id: "TABfromwallet", className: "tab-pane active"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Wallet"), 
							React.DOM.select({id: "fw-pickwallet", name: "coinwallet", className: "form-control input input-faded"}, 
								React.DOM.option(null, "Select A Wallet"), 
								wallets
							)
					), 
					React.DOM.div({id: "offlineaccount", className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Account"), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
					)
					
				), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "Address"), 
						React.DOM.input({type: "text", id: "address", name: "address", placeholder: "address", className: "form-control coinstamp input input-faded"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon  coinstamp", style: {textTransform:'capitalize'}}, snowtext.accounts.address.moreinfo.pin.text), 
						React.DOM.input({type: "text", name: "pin", id: "pin", placeholder: snowtext.accounts.address.moreinfo.pin.placeholder, className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon  coinstamp", style: {textTransform:'capitalize'}}, snowtext.accounts.address.moreinfo.pinphrase.text), 
						React.DOM.input({type: "text", name: "keyphrase", id: "keyphrase", placeholder: snowtext.accounts.address.moreinfo.pinphrase.placeholder, className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon   coinstamp", style: {textTransform:'capitalize',borderRight:'1px initial initial',paddingRight:25}}, 
							snowtext.accounts.address.moreinfo.lock.lockinput
						), 
							React.DOM.select({id: "lock", name: "lock", className: "form-control coinstamp"}, 
								React.DOM.option({value: "no"}, snowtext.accounts.address.moreinfo.lock.option.no), 
								React.DOM.option({value: "yes"}, snowtext.accounts.address.moreinfo.lock.option.yes)
							)
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp", style: {textTransform:'capitalize'}}, "type"), 
						React.DOM.select({id: "offlineformat", name: "type", className: "form-control input input-faded"}, 
						    React.DOM.option({value: "1"}, "Share"), 
						    React.DOM.option({value: "2"}, "Share and Payments"), 
						    React.DOM.option({value: "3"}, "Payments only")
						)
					), 
				
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? 'Adding shortcut...' : 'Add Shortcut'), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
					)
				  )
					
				   
				)
				)
			)
		}.bind(this)
		//include our page
		if(this.props.config.moon === 'add') {
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


//client component
ReceiveUI.keys = React.createClass({displayName: 'keys',
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
		if(snowUI.debug) snowlog.info('receive props keyspage' ,nextProps)
		return false;
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		return false;
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.info('keyspage did update')
		this.listen()
		snowUI.watchLoader();
		$('#keyspageform').find('[rel=popover]').popover();
		return false;
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
		return false;		
	},
	componentWillUnMount: function() {
		return false;
				
	},
	componentDidMount: function() {
		snowUI.watchLoader();
		this.listen();
		$('#keyspageform').find('[rel=popover]').popover();
		return false;
	},
	listen: function() {
		$("#keyspageform #type").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$("#keyspageform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#keyspageform  #fw-pickwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
								var re = $.ui.autocomplete.escapeRegex(req.term);
								console.log(re);
								var matcher = new RegExp( re, "i" );
								response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0,
			 
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		$('#keyspageform #offlineformat').change(function() {
			var val = $(this).val();
			if(val>1)$('#dccaddofflineform #offlineaccount').fadeIn();
			else $('#dccaddofflineform #offlineaccount').fadeOut();
		});
		return false;
	},
	submitForm: function(e) {
		if(snowUI.debug) snowlog.info('submit keyspageform add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var next = true,
			name=$('#keyspageform #name').val(),
			address=$('#keyspageform #address').val(),
			wallet=$('#keyspageform #fw-pickwallet').val(),
			useme=$('#keyspageform #fw-useme').val()==='TABmanual'?2:1,
			type=$('#keyspageform #type').val();
		//check req
		if(name==='') {
			$("#keyspageform #name").parent().addClass('has-error');
			next=false;
		} else $("#keyspageform #name").parent().removeClass('has-error');
		if(useme===2) {
			if(address==='') {
				$("#keyspageform #address").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #address").parent().removeClass('has-error');
			if(type==='') {
				$("#keyspageform #type").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #type").parent().removeClass('has-error');
		} else {
			if(wallet==='Select A Wallet') {
				$("#keyspageform #fw-pickwallet").parent().addClass('has-error');
				next=false;
			} else $("#keyspageform #fw-pickwallet").parent().removeClass('has-error');
		}
		if(next===false) {
			snowUI.flash('error','Please fill in required fields.','3000');
			this.setState({requesting:false});
		}
		else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#keyspageform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','API Access granted',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowlog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
		return false;
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowlog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' client api key ' + iden,removeItem:true});
		return false;
		//snowUI.methods.modals.removeItem.open();
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowlog.log('removeNow',this.state._candidate)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-client',ccid:this.state._candidate}
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					
					snowUI.flash('success','API access removed',2500)
				
				} else {
					if(snowUI.debug) snowlog.warn(resp.error)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		}  else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
		return false;
	}, 
	ipRange: function(e) {
		
		var el= this.refs['pickip'].getDOMNode(),
			entered=parseFloat(el.value.trim()),
			input = this.refs['ip'].getDOMNode();
		
		if(entered===2)input.value = snowUI.myip+'/32'
		else if(entered===1)input.value = '0.0.0.0/0'
		else if(entered===4)input.value = snowUI.myip+'/24'
		else if(entered===5)input.value = this.props.config.userSettings.ddnsIP+'/32'
		else if(entered===6)input.value = this.props.config.userSettings.ddnsIP+'/24'
		else input.value = ''
		return false;
			
	},
	render: function() {
		if(snowUI.debug) snowlog.log('client keys component')
		snowUI.loaderRender();
		var text = snowtext.receive.keys,
			results;
			
		var addItem = function() {
			return (
			
			React.DOM.div(null, 
				React.DOM.form({id: "keyspageform", onSubmit: this.submitForm}, 
					React.DOM.div({className: "snow-block-heading"}, text.form.name.title), 
						React.DOM.div({className: "adderror"}), 
					
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.name.text)), 
						React.DOM.input({type: "text", id: "name", name: "name", placeholder: "name of master", className: "form-control coinstamp input input-faded"})
					), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.apikey.text)), 
						React.DOM.input({type: "text", id: "apikey", name: "apikey", placeholder: "leave blank to generate a key", className: "form-control coinstamp input input-faded"}), 
						React.DOM.input({type: "hidden", name: "action", value: "client-api"})
					), 
					React.DOM.div({className: "col-xs-6   ", style: {marginBottom:12,fontWeight:'bold',textAlign:'left'}}, 
						text.form.controls.master
					), 
					
					React.DOM.div({className: "col-xs-6  ", style: {marginBottom:12,fontWeight:'bold',textAlign:'right'}}, 
						text.form.controls.client
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:65,marginLeft:-5}}, text.form.auth.text)), 
						React.DOM.select({name: "authlevel", className: "form-control input input-faded", defaultValue: "8"}, 
							React.DOM.optgroup({label: "D3C Master Keys"}, 
								React.DOM.option({value: "1"}, text.form.controls.select.a), 
								React.DOM.option({value: "2"}, text.form.controls.select.b), 
								React.DOM.option({value: "3"}, text.form.controls.select.c), 
								React.DOM.option({value: "4"}, text.form.controls.select.d), 
								React.DOM.option({value: "5"}, text.form.controls.select.e)
							), 
							React.DOM.optgroup({label: "D2C Client Keys"}, 
								React.DOM.option({value: "6"}, text.form.controls.select.f), 
								React.DOM.option({value: "7"}, text.form.controls.select.g), 
								React.DOM.option({value: "8"}, text.form.controls.select.h), 
								React.DOM.option({value: "9"}, text.form.controls.select.i), 
								React.DOM.option({value: "10"}, text.form.controls.select.j)
							)
						)
					), 
					
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.div({style: {width:65,marginLeft:-5}}, 
								text.form.range.text, 
								React.DOM.a({style: {marginLeft:7}, 'data-toggle': "popover", 'data-placement': "bottom", 'data-container': "body", rel: "popover", 'data-trigger': "focus click", title: "Limiting Access By IP Range", 'data-html': "true", 'data-content': text.form.range.title}, 
									React.DOM.span({className: "glyphicon glyphicon-info-sign "})
								)
							)
						), 
						React.DOM.div({className: "col-sm-8"}, 
							React.DOM.input({type: "text", ref: "ip", name: "ip", placeholder: "0.0.0.0/0", className: "form-control coinstamp input input-faded"})
						), 
						React.DOM.div({className: "col-sm-4"}, 
							React.DOM.select({ref: "pickip", className: "form-control input input-faded", defaultValue: "3", onChange: this.ipRange}, 
								
								React.DOM.option({value: "2"}, text.form.ip.select.a), 
								React.DOM.option({value: "4"}, text.form.ip.select.b), 
								React.DOM.option({value: "5"}, text.form.ip.select.c), 
								React.DOM.option({value: "6"}, text.form.ip.select.d), 
								React.DOM.option({value: "1"}, text.form.ip.select.e), 
								React.DOM.option({value: "3"}, text.form.ip.select.f)
								
							)
						)
					), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', className: "btn "}, this.state.requesting ? text.form.button.adding : text.form.button.add), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, text.form.button.cancel)
					)
				)
			)
			
			
			)
		}.bind(this)
		
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   ")), 
						React.DOM.td(null, " ", val.name, " "), 
						React.DOM.td(null, " ", React.DOM.a({href: (val.type === 'master' ?  snowPath.d3c :  snowPath.d2c) + '/' + val.apikey, target: "_blank"}, val.type), " "), 
						React.DOM.td(null, " ", val.apikey, " "), 
						React.DOM.td(null, " ", val.ip || '--', "  "), 
						React.DOM.td(null, " ", val.clients.length>0 ? val.clients.map(function(v){ return ' ' + v.name + ' ' }) : val.type === 'master' ? 'all clients' : '--', "  ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
				React.DOM.div(null, 
					React.DOM.div({id: "keyspage", className: "col-md-12  tab-pane fade  in active"}, 
						React.DOM.div({className: "snow-block-body"}, 
							ButtonToolbar(null, 
								  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default "}, text.button.add.text)
							  
							), 
							React.DOM.div({className: "table-responsive"}, 
								React.DOM.table({className: "table table-hover snowtablesort"}, 
									React.DOM.thead(null, 
										React.DOM.tr(null, 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.name.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.type.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.key.text)), 
											React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.ip.text)), 
											React.DOM.th({className: "snowsortcountitems"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.manages.text))
										)
									), 
									React.DOM.tbody(null, 
										results
									)
								)
							  )
							
						), 
						React.DOM.div({className: "clearfix"})
					), 
					
					removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this))
				)			
			)
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
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



//trackers component
ReceiveUI.trackers = React.createClass({displayName: 'trackers',
	getInitialState: function() {
		return {
			requesting:false,
			_candidate:false,
			canUpdate: true,
			_iden: false,
			getIden: function() {return this.state._iden}.bind(this),
			listen:false
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(snowUI.debug) snowlog.info('tracker receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.info('trackers did update')
		if(!this.state.listen)this.listen()
		
		snowUI.watchLoader();
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
				
	},
	componentWillUnMount: function() {
		
			
	},
	componentDidMount: function() {
		if(snowUI.debug) snowlog.info('trackers did mount')
		snowUI.watchLoader();
		if(!this.state.listen)this.listen()
	},
	listen: function() {
		if(!this.state.listen)this.setState({listen:true});
		$("#dcctrackerform #receivertype").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
		//fill account drop down from wallet selection
		$("#dcctrackerform #account").autocomplete({ 
			source: function(req, response) { 
					   $.ajax({
						url: '/api/snowcoins/simple/get-accounts/?wally='+$("#dcctrackerform #trackerwallet").val(),
						dataType: "json",
						success: function( data,status,xhr ) {
							var re = $.ui.autocomplete.escapeRegex(req.term);
							console.log(re);
							var matcher = new RegExp( re, "i" );
							response($.grep(data, function(item){return matcher.test(item);}) );
							}
						});
					 },
			 minLength: 0
		}).focus(function() {
			$(this).autocomplete('search', $(this).val())
		});
		
		//addresses for selected account
		$("#dcctrackerform #account,#dcctrackerform #trackerwallet").blur(function(){
			$("#dcctrackerform #dccpickaddress")
			.find('option')
			.remove()
			.append('<option id="loading">loading... mobile users reselect</option>');
			
			var url= '/api/snowcoins/simple/get-addresses/?wally='+$("#dcctrackerform #trackerwallet").val()+'&account='+$("#dcctrackerform #account").val()
			snowUI.ajax.GET(url,{},function(data) {
				$("#dcctrackerform #dccpickaddress").append('<option value="">No Address</option>');
				$("#dcctrackerform #dccpickaddress").append('<option value="new">Create New Address</option>');
				data.forEach(function(val) {
					//console.log(val);
					$("#dcctrackerform #dccpickaddress").find('#loading').remove().end().append('<option value="'+val+'">'+val+'</option>');
				});
				
			});
			
		});
		
		
	},
	submitForm: function(e) {
		if(snowUI.debug) snowlog.info('submit trackers add form',e)
		e.preventDefault();
		var _this = this
		this.setState({requesting:true});
		
		var addw=this.refs.trackerwallet.getDOMNode().value.trim(),
			useme=this.refs.useme.getDOMNode().value.trim(),
			root=this.refs.root.getDOMNode().value.trim();
		if(addw==='Select A Wallet' && useme==='TABwallet') {
			
			snowUI.flash('error','Please select a wallet.','3000');
			this.setState({requesting:false});
			$("#maindiv #dccaddwallet").parent().addClass('has-error');
			
		} else if (useme==='TABwatch' && root==='') {
			
			snowUI.flash('error','Please add a root path.','3000');
			this.setState({requesting:false});
			$("#maindiv #root").parent().addClass('has-error');
			
		} else {
			var url =  "/api/snowcoins/local/receive/setup"
			var data = $( "#dcctrackerform" ).serialize()
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.valueRoute(snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Tracker added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowlog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowlog.log('open tracker modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' tracker ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowlog.log('removeNow',this.state)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-tracker',tracker:this.state._candidate}
		
		this.setState({canUpdate:false,removeItem:false});
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently delete " + this.state._iden)
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(resp.success === true) {
					
					snowUI.methods.removeRow('#'+this.state._candidate,function(){this.setState({_candidate:false,canUpdate:true});}.bind(this))
					snowUI.flash('success','Tracker removed',2500)
				
				} else {
					if(snowUI.debug) snowlog.error(resp)
					this.setState({_candidate:false,canUpdate:true});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
		} else {
			
			this.setState({_candidate:false,canUpdate:true})
			
		}
	}, 
	render: function() {
		if(snowUI.debug) snowlog.log('trackers component', this.props)
		
		var text = snowtext.receive.trackers,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				if(typeof val.owner !== 'object' || val.owner === null)val.owner = {name: {first:'',last:''}}
				//console.log(typeof val.owner,val.owner.name)
				var removeme = (val.type === 'user' || val.type === 'leech') ? (React.DOM.td({'data-dccwid': val._id, 'data-dcciden': val.name, onClick: this.removeAsk, style: {cursor:"pointer"}}, " ", React.DOM.span({'data-dccwid': val._id, 'data-dcciden': val.name, className: "removedccwallet text-danger glyphicon glyphicon-remove"}, "   "))) : (React.DOM.td(null))
				return (
					
					React.DOM.tr({id: val._id, key: val._id}, 
						removeme, 
						React.DOM.td({className: "bstooltip", 'data-toggle': "tooltip", 'data-placement': "top", title: 'Owner: '+val.owner.name.first.charAt(0).toUpperCase() + '. ' + val.owner.name.last}, " ", val.name, " "), 
						
						React.DOM.td(null, " ", val.type, " "), 
						React.DOM.td(null, " ", val.watch.watching ===  true ? 'watch':val.interval/1000<3600 ? val.interval/1000+' secs':val.interval/1000/60 > 59 ? Math.floor(val.interval/1000/60/60)+' hrs': val.interval/1000/60+' mins', " "), 
						React.DOM.td(null, moment(val.last).format("llll"), " "), 
						React.DOM.td(null, " ", val.wallet ? val.wallet.name : '--', " "), 
						
						React.DOM.td(null, " ", val.account || '--', "  "), 
						React.DOM.td(null, " ", val.address || '--', "  ")
					)
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			React.DOM.div(null, 
				React.DOM.div({id: "trackerspage", className: "col-md-12  tab-pane fade in active"}, 
					React.DOM.div({className: "snow-block-body"}, 
						  React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component + '/add', className: "btn btn-sm btn-default adddccwalletbutton"}, text.button.add.text), 
						  React.DOM.div({className: "table-responsive"}, 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-remove"})), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.name.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.type.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.interval.text)), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet "}, text.table.th.date.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.wallet.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, text.table.th.account.text)), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, text.table.th.address.text))
									)
								), 
								React.DOM.tbody(null, 
									results
								)
							)
						  )
						
					), 
					React.DOM.div({className: "clearfix"})
				), 
				removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this))
			)			
		
			);
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						React.DOM.option({key:  w.key, value: w.key}, w.name)
					);
				});
			}
			return (
				React.DOM.div(null, 
					React.DOM.form({id: "dcctrackerform", onSubmit: this.submitForm, className: "easytab reversetab"}, 
						
						React.DOM.div({className: "adderror"}), 
						
						React.DOM.div({style: {marginLeft:10}}, 
							React.DOM.ul({id: "dynamicaddtabs", className: "nav nav-pills", role: "tablist", 'data-tabs': "pills"}, 
								React.DOM.li({className: "active"}, React.DOM.a({'data-target': "TABwallet", role: "pill", 'data-toggle': "pill"}, "Interval")), 
								React.DOM.li(null, React.DOM.a({'data-target': "TABwatch", role: "pill", 'data-toggle': "pill"}, "File Watcher"))
							)
						), 
						React.DOM.div({className: "tab-content"}, 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
								React.DOM.input({type: "text", ref: "name", name: "name", placeholder: "name of tracker", className: "form-control coinstamp input input-faded"})
							), 
							React.DOM.div({className: "form-group input-group"}, 
								React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet"), 
								React.DOM.select({ref: "trackerwallet", id: "trackerwallet", name: "trackerwallet", className: "form-control input input-faded"}, 
									React.DOM.option(null, "Select A Wallet"), 
									wallets
								)
							), 
							React.DOM.div({id: "addreceiveraccount", className: "form-group input-group"}, 
									React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Account"), 
									React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), React.DOM.input({type: "text", ref: "account", id: "account", name: "account", placeholder: "new or current account", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input", autoComplete: "off"})
							), 
							React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Address"), 
										React.DOM.select({id: "dccpickaddress", name: "dccpickaddress", className: "form-control input input-faded"}, 
										React.DOM.option({id: "cnao", value: ""}, "No Address"), 
										React.DOM.option({id: "cna", value: "new"}, "Create New Address")
									)
								 ), 
							React.DOM.div({id: "TABwallet", className: "tab-pane active "}
								
								
								
								
							), 
							React.DOM.div({id: "TABwatch", className: "tab-pane "}, 
								React.DOM.p({className: ""}, "File watcher will watch a local wallet file and process transactions when it changes."), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "File Path"), 
									React.DOM.input({type: "text", id: "root", name: "root", ref: "root", placeholder: "/full/file/path/without/trailing/slash", className: "form-control coinstamp input input-faded"})
								), 
								React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Wallet file"), 
									React.DOM.input({type: "text", id: "dat", ref: "dat", name: "dat", defaultValue: "wallet.dat", className: "form-control coinstamp input input-faded input input-faded ui-autocomplete-input"})
								)
								
							), 
							
							React.DOM.div({className: "form-group"}, 
								React.DOM.button({disabled: (this.state.requesting) ? 'disabled' : '', id: "confirmchangepassphrase", className: "btn "}, this.state.requesting ? 'Adding...' : 'Add Tracker'), 
								React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.receive + '/' + this.props.state.component, className: "btn btn-default pull-right"}, "Cancel")
							)
						), 
						React.DOM.input({type: "hidden", ref: "action", name: "action", value: "add-tracker"}), 
						React.DOM.input({type: "hidden", name: "useme", ref: "useme", id: "fw-useme", defaultValue: "TABwallet", className: "fw-useme"})
					)
				)
			)
		}.bind(this)
		
		
		//include our page
		if(this.props.config.moon === 'add') {
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


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
