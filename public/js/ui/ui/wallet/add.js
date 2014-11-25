/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
React.initializeTouchEvents(true);

//add new wallet component
WalletUI.add = React.createClass({displayName: 'add',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {
			validated:false,
			refresh:false,
			port:22555
		}
	},
	componentWillReceiveProps: function (nextProps) {
		
		if(snowUI.debug) snowlog.log('add/update will receive props',nextProps.config.wally)
		
		if(this.state.refresh || (nextProps.config.wally && nextProps.config.wally.key)) {
			this.setState({refresh:false})
			this.setState(nextProps.config.wally)
			this.validator(nextProps.config.wally)
			if(snowUI.debug) snowlog.log(this.state)
			
			return false;
		}
			
		errorDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.adderror').fadeOut()
		successDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.addsuccess').fadeOut()
		
		var newP = Object.keys(this.state),
			newState={};
		
		newP.forEach(function(v) {
			if(v!='requesting')newState[v] = ''
		})
		
		this.setState(newState)
		
	
		
		return false;
		
	},
	componentWillMount: function() {
		if(snowUI.debug) snowlog.log('add/update will mount')
		this.setState(this.props.config.wally)
		this.validator(this.props.config.wally)
	},
	componentWillUnMount: function() {
		if(snowUI.debug) snowlog.log('add/update un-mounted')
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowlog.log('add/update will update')
		this.validator(this.state)
		snowUI.watchLoader()
		
	},
	
	validator: function(state) {
			
		if(state.key && state.name && state.address && state.port && state.coin) {
			
			if(!state.validated) {
				if(snowUI.debug) snowlog.log('update wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else if(state.name && state.port && state.coin && state.address && ((state.apiuser && state.apipassword) || state.apikey)) {
			
			
			if(!state.validated){
				if(snowUI.debug) snowlog.log('new wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else {
			
			
			if(state.validated){
				if(snowUI.debug) snowlog.log(' wally not validated',this.state.validated)
				this.setState({validated:false});
			}
		}
	},
	componentDidMount: function() {
		/* jquery-ui autocompletes */
		var _this = this
		$( this.refs['aw-coin'].getDOMNode()).autocomplete({ source: defaultcoins,minLength:0,select: function( event, ui ) {
			_this.setState({'coin':ui.item.value})
			//if(snowUI.debug) snowlog.info(event,ui)
		}}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$( this.refs['aw-cointicker'].getDOMNode()).autocomplete({ source: defaultcointickers,minLength:0 }).focus(function(){$(this).autocomplete('search', $(this).val())});
		
		snowUI.loaderRender();
		
	},
	shouldComponentUpdate: function() {
		if(snowUI.debug) snowlog.info('wallet form will update',!this.state.stopUpdate);
		return !this.state.stopUpdate
	},
	walletForm: function(e) {
		
		e.preventDefault();
		
		var formData = $( e.target ).serialize();
		
		if(snowUI.debug) snowlog.log('wallet form',formData);
		
		if(this.state.validated)
		{
			var _this = this
			
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/add-wallet"
			var data = formData
			
			var errorDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.adderror')
			var successDiv = $(this.refs['aw-name'].getDOMNode()).parent().parent().parent().find('.addsuccess')
			
			errorDiv.hide()
			successDiv.hide()
			//set the state so we do not update until i am ready
			
			this.setState({validated:false,stopUpdate:true});
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					_this.setState({validated:true,refresh:true});
					
					if(_this.state.key) {
						
						//snowUI.loadingStart();
						//snowUI.fadeRenderOut();	
						bone.async.eachSeries(
						[
							function(next) {
								successDiv.fadeIn().html('Wallet updated');							
								_this.props.setWalletState({refresh:true})
								
								
								next()
							},
							function(next) {
								
								//update the wallets with the new data
								var _wallets = _this.props.config.mywallets,
									_locate = _this.props.config.locatewallet.indexOf(resp.wally.key)
								
								_wallets[_locate] = resp.wally;
								
								snowUI.methods.updateState({'mywallets':_wallets,wally:resp.wally});
								
								next()
								
							},
							function(next) {
								
								console.log(resp.wally)
								_this.setState(resp.wally);
								next()
							},
						
						], function(callback, next) {
							
							return callback.apply(_this, [next]);
						
						}, function() {
							
							//  refresh
							//set connected off so we can reset the ui
							
							//allow update rendering
							_this.setState({stopUpdate:false});
							snowUI.methods.valueRoute(snowPath.wallet + '/' + resp.wally.key + '/update',true)
							
							//snowUI.flash('success','Wallet is Updating',1500)
						
						});
						
								
						
						
					} else {
						_this.setState({stopUpdate:false});
						snowUI.flash('success','New wallet created.',3000)
						snowUI.methods.resetWallets(_this.props.config,function() {
							snowUI.methods.valueRoute(snowPath.wallet + '/' + resp.wally.key )	
						})
						
						
					}
					
				} else {
					
					snowUI.flash('error','Form Error',3500)
					var error
					if (typeof resp.err === 'object') {
						error = resp.err.messag
						var keys = Object.keys(resp.err.errors)
						keys.forEach(function(v) {
							error+='<br /> '+ resp.err.errors[v].message
						})
					} else {
						error = resp.err
					}
					errorDiv.fadeIn().html(error);
					_this.setState({validated:true,stopUpdate:false});
					
				}
				
			})
		}
		
		
	},
	changeWatch: function(e) {
		var value = parseFloat(this.refs['aw-watching'].getDOMNode().value)
		console.log(value)
		var watch = $('.watchWatch'),
			timer = $('.watchInterval')
		watch.toggle(false);
		timer.toggle(false);
		if(value === 2) {
			watch.toggle(400);
		} else if(value === 1) {
			timer.toggle(400);
		} else {
			
		}
	},
	render: function() {
	    
	    
	    _this = this
	    
	    if(snowUI.debug) snowlog.log('wallet add component',this.state,this.props.config.wally)
	    var errormessage,title;
	    if(this.props.message) {
		    errormessage = (WalletUI.messageDisplay({message: this.props.message, type: "requesterror", title: "Please check your configuration"}));
		    title = false
	    } else {
		    title = (React.DOM.div({className: "page-title "}, 
					this.props.config.wally.key ? 'Update ' + this.props.config.wally.name : 'Add A Wallet'
			     ))
	    }
	   
	    
	    var changeorencrypt = this.props.config.lockstatus === 2 ? 'Turn Encryption On':'Change  Passphrase'
		
		var walletbuttons = !this.state.key ? '' : (ButtonToolbar(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/backup', className: "btn btn-default btn-sm pull-left"}, React.DOM.span(null, "Backup")), 
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: "btn btn-default btn-sm pull-left"}, React.DOM.span(null, changeorencrypt)), React.DOM.a({onClick: snowUI.deleteWallet, 'data-snowmoon': this.props.config.wally.key, className: "btn btn-danger btn-sm pull-right"}, React.DOM.span(null, "Delete"))))
	    return (
		React.DOM.div({id: "", style: {padding:'35px 20px'}, className: "row"}, 
			errormessage, 
			React.DOM.form({onSubmit: this.walletForm}, 
				title, 
				
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					walletbuttons, 
					React.DOM.div({key: "adderror23", className: "adderror", style: {display:'none'}}), 
					React.DOM.div({key: "addsuccess23", className: "addsuccess ", style: {display:'none'}})
				), 
				React.DOM.div({className: "clearfix"}), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.name ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Name")), 
						React.DOM.input({type: "text", name: "name", valueLink: this.linkState('name'), ref: "aw-name", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.coin ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Coin")), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", name: "coin", valueLink: this.linkState('coin'), ref: "aw-coin", className: "form-control coinstamp input input-labelled input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:55,marginLeft:-5}}, "Stamp")), 
						React.DOM.input({type: "text", name: "coinstamp", defaultValue: this.props.config.wally.coinstamp, ref: "aw-coinstamp", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Fiat")
						), 
						React.DOM.select({name: "currency", value: this.props.config.wally.currency, ref: "aw-currency", className: "form-control coinstamp input-labelled input-faded"}, 
						React.DOM.option({value: "usd"}, "USD"), 
						React.DOM.option({value: "eur"}, "EUR")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Ticker")
						), 
						React.DOM.span({role: "status", 'aria-live': "polite", className: "ui-helper-hidden-accessible"}), 
						React.DOM.input({type: "text", name: "cointicker", defaultValue: this.props.config.wally.cointicker, ref: "aw-cointicker", className: "form-control coinstamp input input-labelled input-faded ui-autocomplete-input", autoComplete: "off"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Api")
						), 
						React.DOM.select({name: "coinapi", defaultValue: this.props.config.wally.coinapi, ref: "aw-coinapi", className: "form-control coinstamp"}, 
						React.DOM.option({value: "rpc"}, "rpc")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: !this.state.address ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
						React.DOM.div({style: {width:55,marginLeft:-5}}, "Host")), 
						React.DOM.input({type: "text", name: "address", valueLink: this.linkState('address'), ref: "aw-address", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "SSL")
						), 
						React.DOM.select({name: "isSSL", defaultValue: this.props.config.wally.isSSL ? "1":"0", ref: "aw-ssl", className: "form-control coinstamp"}, 
						React.DOM.option({value: "0"}, "No"), 
						React.DOM.option({value: "1"}, "Yes")
						)
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " CA File ")
						), 
						React.DOM.input({type: "text", name: "ca", defaultValue: this.props.config.wally.ca, ref: "aw-ca", placeholder: "full file path", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (this.state.port) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " Port ")
						), 
						React.DOM.input({type: "number", name: "port", valueLink: this.linkState('port'), ref: "aw-port", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (this.state.apiuser || this.state.apikey || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " User")
						), 
						React.DOM.input({type: "text", name: "apiuser", valueLink: this.linkState('apiuser'), ref: "aw-apiuser", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: ((this.state.apipassword && !this.props.config.wally.key) || (this.state.apikey ) || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-8,marginRight:3}}, " Pass or Pin")
						), 
						React.DOM.input({type: "text", name: "apipassword", valueLink: this.linkState('apipassword'), ref: "aw-apipassword", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: (!this.state.apiuser && !this.state.apikey && !this.props.config.wally.key) ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " API Key")
						), 
						React.DOM.input({type: "text", name: "apikey", valueLink: this.linkState('apikey'), ref: "aw-apikey", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "Watch")
						), 
						React.DOM.select({onChange: this.changeWatch, name: "watching", defaultValue: this.props.config.wally.watching, ref: "aw-watching", className: "form-control coinstamp"}, 
						React.DOM.option({value: "0"}, "No"), 
						React.DOM.option({value: "1"}, "Yes; by timer"), 
						React.DOM.option({value: "2"}, "Yes; by watching a file")
						)
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 1 ? "col-sm-10 col-sm-offset-1 col-md-10 watchInterval  ":"col-sm-10 col-sm-offset-1 col-md-10 watchInterval nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "  Timer ")
						), 
						React.DOM.input({type: "text", name: "interval", defaultValue: this.props.config.wally.interval, ref: "aw-interval", placeholder: "interval time", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, " Path ")
						), 
						React.DOM.input({type: "text", name: "watchpath", defaultValue: this.props.config.wally.watchpath, ref: "aw-watchpath", placeholder: "file path without trailing slash (\\)", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}, 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, 
							React.DOM.div({style: {width:55,marginLeft:-5}}, "  File ")
						), 
						React.DOM.input({type: "text", name: "watchfile", defaultValue: this.props.config.wally.watchfile, ref: "aw-watchfile", placeholder: "interval time", defaultValue: "wallet.dat", className: "form-control coinstamp input input-labelled input-faded"})
					)
				), 
				React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
					React.DOM.div({className: "form-group"}, 
						ButtonToolbar(null, 
						React.DOM.input({type: "hidden", name: "key", ref: "aw-key", value: this.props.config.wally.key}), 
						React.DOM.button({type: "submit", disabled: !this.state.validated ? 'disabled' : '', className: "addwalletbutton btn  awbutton"}, this.state.requesting ? (this.props.config.wally.key ? 'Updateing Wallet' : 'Ading Wallet...') : (this.props.config.wally.key ? 'Update Wallet' : 'Add Wallet')), 
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet, className: "btn btn-default btn-sm pull-right"}, React.DOM.span(null, "Cancel"))
						)
					)
				), 
				React.DOM.div({className: "clearfix"})
			), 
                React.DOM.div({className: "clearfix"})
                )			
		
	    );
	}
});
//update copies add... go figure
WalletUI.update = WalletUI.add;

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
