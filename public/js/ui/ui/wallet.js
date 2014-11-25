/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
React.initializeTouchEvents(true);

var yes = 'yes', no = 'no';
//var yes = true, no = false;

var WalletUI = snowUI.wallet

/**
 * wallet components
 * */
//main
WalletUI.UI = React.createClass({displayName: 'UI',
	getInitialState: function() {
		var mystate = {
			config:this.props.config || {section:snowPath.wallet,wallet:false,moon:false},
			wally:false,
			testnet:false,
			ready:false,
			connectError:false,
			connected:true,
			connecting:false,
			refresh:false,
		}
		if(this.props.config.section === snowPath.wallet && (!this.props.config.wallet || this.props.config.wallet === 'overview')) {
			mystate.connecting = false;
			mystate.connected = true;
		}
		return (mystate)
	},
	
	componentWillReceiveProps: function(nextProps) {
		
		var _this = this,
			sendProps = {config:nextProps.config,connectError:false};

		if(snowUI.debug) snowlog.log('willreceiveprops main wallet',_this.state, nextProps)
		
		//grab the data for this wallet
		 if(this.state.refresh && nextProps.config.moon === 'update') {
				//we have to grab the wallet status on every update
				//this catches any form changes like host or port and make sure they work
				this.grabWallet(nextProps);
				
		} else if(!this.state.connected  || (nextProps.config.wallet  &&  nextProps.config.wallet !== _this.state.config.wallet)) {
			/* got not connected or a new wallet*/
			
			if(snowUI.debug) snowlog.log('grab wallet', nextProps.config.wally)
			
			sendProps.testnet = false;
			
			_this.setState(sendProps)
			
			this.grabWallet(nextProps);
			
		} else if(nextProps.config.wallet && nextProps.config.wallet !== _this.state.config.wallet)  {
			/* got new wallet*/
			if(nextProps.config.wally.name)snowUI.flash('message','Now using wallet '+ nextProps.config.wally.name+'.',4000);
			_this.setState(sendProps)
		
		} else if(!nextProps.config.wallet) {
			/* no wallet*/
			if(snowUI.debug) snowlog.log('no wallet')
			sendProps.connecting = false;
			sendProps.ready = true;
			sendProps.testnet = false;
			_this.setState(sendProps)
			
		} else {
			/* pass through to ready*/
			if(snowUI.debug) snowlog.log('pass through')
			sendProps.ready = true;
			sendProps.connecting = false;
			sendProps.connected = true;
			_this.setState(sendProps)
			
		}
		
		//if(nextProps.config.moon !== _this.state.config.moon)snowUI.methods.fadeOut();
		
		
	},
	grabWallet: function(nextProps,blockcalls) {
		if(nextProps.config.wallet && nextProps.config.wallet !== 'new') {
			
			var _this = this;
			
			//run a status call and set connected state
			snowUI.ajax.GET("/api/snowcoins/local/wallet",{ wallet:nextProps.config.wallet,moon:'status' },function(resp) {
				if(snowUI.debug) snowlog.log('hitting  server new wallet',resp)
				if(resp.success === true)
				{
					
					snowUI.flash('message','Now using wallet '+ nextProps.config.wally.name +'.',4000);
					if(resp.data && resp.data.testnet===true) {
						
						_this.setState({testnet:true,ready:true,connected:true,connecting:false,refresh:false})
						
					} else {
						
						_this.setState({testnet:false,ready:true,connected:true,connecting:false,refresh:false})
					
					}
					
					/* figure out the lock status */
						if(resp.data.unlocked_until === 'Locked')
							var dd = 0;
						else if(resp.data.unlocked_until === 'Not Encrypted')
							var dd = false;
						else if(resp.data.unlocked_until)
							var dd = new Date(resp.data.unlocked_until).getTime();
						else
							var dd = false;
							
						if(dd && isNaN(dd)) dd = false;
					
						if(!blockcalls)snowUI.methods.changelock(dd);
					/* end lock status */
					
				} else {
										
						_this.setState({testnet:false,ready:true,connectError:resp.error,connected:false,connecting:false,refresh:false})
						//snowUI.flash('error','Connection Error... Check wallet configuration.',2500);
						if(snowUI.debug) snowlog.warn('No connection available',nextProps)
					
				}
			
			})
	
		} else {
			this.setState({ready:true,connected:true,connecting:false,refresh:false})
		}		
	},
	componentWillUpdate: function() {
		
		//if(this.props.config.moon !== this.state.config.moon)snowUI.methods.fadeOut();
		//if(!this.props.config.wallet && !this.state.ready) this.setState({ready:true});
	},
	componentDidUpdate: function() {
		if(this.state.connected) 
			$('#walletbar').removeClass('bg-danger')
		else 
			$('#walletbar').addClass('bg-danger')
		//snowUI.methods.fadeIn();
		if(this.state.testnet !== this.props.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	componentWillMount: function() {
		if(!this.props.config.wallet) this.setState({ready:true});			
	},
	componentWillUnMount: function() {
		if(snowUI.debug) snowlog.info('wallet unmounted')
		$('#walletbar').removeClass('bg-danger')
		//snowUI.methods.fadeOut();
				
	},
	componentDidMount: function() {
		
		if(this.state.config.wallet )
			this.grabWallet(this.state);
		
		//snowUI.methods.fadeIn();
		
		if(this.props.config.wally.name)snowUI.flash('message','Now using wallet '+ this.props.config.wally.name +'.',4000);
		
		if(this.state.testnet !== this.props.config.testnet)snowUI.methods.updateState({testnet:this.state.testnet});
	},
	updateState:function(state) {
		this.setState(state);
	},
	render: function() {
			    
		var showcomp = (this.props.config.moon) ? this.props.config.moon : 'skippedmoondostuffotherstuff'
		
		if(snowUI.debug) snowlog.log('main wallet component - current state:',showcomp, this.props,this.state)
		
		var renderMe; 
		
		if(WalletUI[showcomp]) {
			
			if(this.props.config.lockstatus === 2 && showcomp === 'passphrase')showcomp = 'setpassphrase'
			
			renderMe = WalletUI[showcomp]
		
		} else if(this.props.config.wallet) {
			
			if(this.props.config.wallet === 'new') 
				renderMe = WalletUI.add
			else
				renderMe = WalletUI.dashboard

		} else {
			
			renderMe = WalletUI.overview
			
		}     
	    
		if(snowUI.debug) snowlog.log('wallet render component',this.state.connecting,this.props.gates)
	    
		//stop loading
		//snowUI.loaderRender();
		
		if(this.state.connecting) {
			if(snowUI.debug) snowlog.warn('not connected render')
			//snowUI.methods.loaderStart();
			return (React.DOM.div(null))
			
		} else if( this.props.gates.showInfoPage) {
			var message =  this.props.gates.showInfo
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", WalletUI.messageDisplay({type: "requestinfo", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if( this.props.gates.showSuccessPage) {
			var message =  this.props.gates.showSuccess
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", WalletUI.messageDisplay({type: "requestsuccess", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if( this.props.gates.showWarningPage) {
			var message =  this.props.gates.showWarning
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", WalletUI.messageDisplay({type: "requestwarning", config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
				
		} else if((!this.state.connected && this.props.config.moon !== 'update' && this.props.config.moon !== 'remove' || this.props.gates.showErrorPage ) ) {
			var message = (this.props.gates.showErrorPage) ? this.props.gates.showError : this.state.connectError
			return (

				React.DOM.div({className: "", id: "maindiv"}, " ", WalletUI.connectError({config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
			
		}  else if( !this.state.ready ) {
			
			if(snowUI.debug) snowlog.warn('wallet ui not ready')
			return (React.DOM.div(null))
			
		} else {
			var message = (this.props.showErrorPage) ? this.props.showError : this.state.connectError
			return (
				
				React.DOM.div({className: "reactfade", id: "maindiv"}, " ", renderMe({config: this.props.config, ready: this.state.ready, setWalletState: this.updateState, message: message}), " ")

			);
		}
	}
});

//remove wallet component
WalletUI.remove = React.createClass({displayName: 'remove',
	confirmDelete: function() {
		var confirm = window.prompt(snowtext.wallet.remove.confirm.text.replace(/{name}/g,this.props.config.wally.name))
		var _this = this;
		if(confirm === this.props.config.wally.name) {
			if(snowUI.debug) snowlog.warn('Deleting wallet ',this.props.config.wally.name,this.props)
			
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/remove-wallet"
			var data = {'action':'remove',removeKey:snowUI._wallets[this.props.config.wally.key].removeKey,wally:this.props.config.wally.key}
			
			var errorDiv = $('#removeerror')
			
			errorDiv.hide()
			
			snowUI.ajax.GET(url,data,function(resp) {
				console.info(resp)
				if(resp.success === true) {			
					
					snowUI.flash('success',snowtext.wallet.remove.removed.success.text.replace(/{name}/g,_this.props.config.wally.name),7000)
					snowUI.methods.valueRoute(snowPath.wallet);
				
				} else {
					if(resp.error)errorDiv.fadeIn().html(resp.error)
					snowUI.flash('error',snowtext.wallet.remove.removed.success.text.replace('{name}',_this.props.config.wally.name),3000);
				}
			});
				
				
		} else if(confirm && confirm !== this.props.config.wally.name) {
			snowUI.flash('error',snowtext.wallet.remove.removed.wrong.text,10000);
		} else {
			return false
		}
	},
	componentDidMount: function() {
		//snowUI.loaderRender();
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	render: function() {
	    
	    if(snowUI.debug) snowlog.log('remove wallet component')
	    _this = this;
	    var message = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ?  snowtext.wallet.remove.goodinfo.text.replace('{name}',_this.props.config.wally.name) :  snowtext.wallet.remove.badinfo.text.replace('{name}',_this.props.config.wally.name)
	    
	    var btn = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? (React.DOM.a({onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wally.key, className: "btn btn-default "}, React.DOM.span(null, snowtext.wallet.remove.btn.cancel))) : ''
	    return (
		React.DOM.div({style: {padding:'10px'}}, 
			React.DOM.div({className: "page-title"}, " ", snowtext.wallet.remove.title.text + _this.props.config.wally.name), 
			React.DOM.div({className: "", style: {paddingTop:'20px'}}, 
				
				React.DOM.div({key: "adderror3423", className: "adderror", style: {display:'none'}}), 			
				
				React.DOM.p(null, React.DOM.span({dangerouslySetInnerHTML: {__html: message}})), 
				React.DOM.p(null, 
					ButtonToolbar(null, 
						
						btn, 
							
						React.DOM.button({onClick: snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? this.confirmDelete : function(){snowUI.methods.valueRoute(snowPath.wallet)}, className: "btn btn-danger "}, React.DOM.span(null, snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? snowtext.wallet.remove.btn.remove:snowtext.wallet.remove.btn.request))
			
					)
				
				)
			)
		)			
		
	    );
	}
});
//connect error component
WalletUI.messageDisplay = React.createClass({displayName: 'messageDisplay',
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	componentDidMount: function() {
		this.componentDidUpdate()
	},	
	render: function() {
	    
	    if(snowUI.debug) snowlog.log('warning message component')
	    
	    return (React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: this.props.type}, 
				React.DOM.span(null, " ", this.props.title || 'I have an important message for you.'), 
				React.DOM.div({className: "message"}, 
					React.DOM.p(null, this.props.message)
				)
			)
			
		));
	}
});
WalletUI.displayMessage = WalletUI.messageDisplay

//connect error component
WalletUI.connectError = React.createClass({displayName: 'connectError',
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	render: function() {
	    if(snowUI.debug) snowlog.log('connect error component')
	    
	    return (WalletUI.add({config: this.props.config, setWalletState: this.props.setWalletState, message: this.props.message}) );
	}
});

//overview list component
WalletUI.overview = React.createClass({displayName: 'overview',
	menuClick: function(e) {
		
		e.preventDefault();
		
		var moon = $(e.target).parent()[0].dataset.snowmoon;
		
		snowUI.methods.valueRoute(moon);
		
		return false
	},
	
	componentDidUpdate: function() {
		
		snowUI.watchLoader();
	
		snowUI.sortCol('#snow-overview th');
		
	},	
	componentDidMount: function() {
		snowUI.watchLoader();	
		snowUI.sortCol('#snow-overview th');
	},
	
	render: function() {
		if(snowUI.debug) snowlog.log('wallet overview component')
		if(this.props.config.mywallets instanceof Array) {
			var _this = this;
			//loop through our wallets and show a table
			var mytable = this.props.config.mywallets.map(function (w) {
				
				return (
					React.DOM.tr({key: w.key}, 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowPath.wallet + '/' + w.key+ '/update'}, React.DOM.span({className: "glyphicon glyphicon-pencil"}, " "))), 
						React.DOM.td(null, React.DOM.a({onClick: _this.menuClick, 'data-snowmoon': snowPath.wallet + '/' + w.key+ '/dashboard'},  w.name, " ")), 
						React.DOM.td(null, " ",  w.coin, " "), 
						React.DOM.td(null,  w.address+':'+w.port, " "), 
						React.DOM.td(null, w.isSSL ? React.DOM.span({className: "glyphicon glyphicon-link"}) : ''), 
						React.DOM.td({onClick: _this.deleteWallet, 'data-snowmoon': w.key}, React.DOM.span({onClick: snowUI.deleteWallet, 'data-snowmoon': w.key, style: {cursor:"pointer"}, className: "removewallet text-danger glyphicon glyphicon-remove-sign"}, " "))
					)
				);
			});				
				
		}
		return (
			React.DOM.div({id: "snow-overview", className: "bs-example"}, 
				
				React.DOM.a({className: "btn btn-default btn-sm nav-item-add", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/new'}, "Add New Wallet"), 
				React.DOM.table({className: "table table-hover snowtablesort"}, 
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

//wallet dashboard component
WalletUI.dashboard = React.createClass({displayName: 'dashboard',
	getInitialState: function() {
		
		return {mounted:false,ready:this.props.ready,modals:{encryptModal:false}};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(snowUI.debug) snowlog.log('dashboard will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({data:resp.data,mounted:true,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowlog.log('dashboard did update',this.props)
		snowUI.watchLoader();
	},
	componentDidMount: function() {
		var _this = this
		if(snowUI.debug) snowlog.log('dashboard did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,mounted:true}) })
		
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowlog.log('data',props)
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			if(resp.success === true) {
				cb(resp)
			} else {
				snowUI.flash('error',resp.error,3500)
				_this.props.setWalletState({connectError:true})
			}
		})
		return false
	},
	encryptModal: function() {
		var modals = _this.state.modals;
		modals.encryptModal = true;
		_this.setState({modals:modals});
		
	},
	closeModals: function() {
		this.setState({modals: {
			encryptModal: false,
			encryptWallet: false,
			backupWallet: false,
			changePassWallet: false,
		}});
	},
	render: function() {
		
		_this = this
		
		if(snowUI.debug) snowlog.log('wallet dashboard component',this.state.mounted)
		
		if(this.state.mounted) {
			var data = this.state.data;
			
			var loop = (data instanceof Object) ? Object.keys(data) : [];
			var mystatus = loop.map(function(k,v) {
		
				return (
					React.DOM.div({key: k, className: "col-xs-12 col-sm-6 col-md-6"}, 
						React.DOM.div({className: "snow-status snow-block"}, 
							React.DOM.div({className: "snow-block-heading"}, 
								React.DOM.p(null, k)
							), 
							React.DOM.div({className: "snow-status-body"}, 
								React.DOM.p(null, data[k])
							)
						)
					)
				);
			}); 

			var lockdiv;
			if(this.props.config.locked && !this.props.config.unlocked) {
				lockdiv = (
					 React.DOM.div({id: "unlockwalletbutton"}, 
					    "Your wallet is locked", 
					   React.DOM.div(null, 
						React.DOM.a({onClick: snowUI.methods.modals.open.unlockWallet, className: "k"}, React.DOM.span(null, "Unlock Wallet"))
					   ), React.DOM.div(null, 	
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, React.DOM.span(null, "Change Wallet Passphrase"))
					   )	
					   
					 )
				)
			} else if(this.props.config.unlocked) {
				lockdiv = (
				
					React.DOM.div({id: "unlockwalletbutton"}, 
					    React.DOM.p(null, "Your wallet is unlocked for ", React.DOM.span({className: "locktimer"}), " seconds."), 
					    ButtonToolbar(null, 
						
						React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, React.DOM.span(null, "Change Wallet Passphrase"))
						
					    )
					 )
				)
				
			} else if(this.props.config.lockstatus === 2) {
				lockdiv = (
					React.DOM.div({id: "encryptwallet"}, 
						React.DOM.div({id: "encryptwalletbutton"}, 
							React.DOM.p(null, "Your wallet is not secure. Anyone with access to a copy of ", React.DOM.kbd(null, "wallet.dat"), " can send coin without using a passphrase."), 
							React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase', className: ""}, "Set Passphrase Now")
						)
					)
				)
			}
			return (
			React.DOM.div({className: "snow-dashboard"}, 
				React.DOM.div({className: "page-title"}, 
					"Dashboard"
				), 
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
							React.DOM.div(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/backup', className: "backupwalletbutton text-muted"}, "Backup Wallet")), 
							React.DOM.div(null, React.DOM.a({onClick: snowUI.methods.hrefRoute, href:  snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/update', className: "updatecoin"}, "Update ", this.props.config.wally.name.toUpperCase(), "   "))
						)
					)
				), 
				React.DOM.div({className: "col-xs-12 col-sm-6 col-md-6"}, 
					React.DOM.div({className: "snow-block-lg snow-options"}, 
						React.DOM.div({className: "snow-block-heading"}, 
							React.DOM.p(null, "wallet lock status")
						), 
						React.DOM.div({className: "snow-block-body"}, 
							lockdiv
							
							
						)
						
					)
				), 
				React.DOM.div({className: "clearfix"}), 
				React.DOM.div({className: "snow-status"}, 
					mystatus
				)
			)			

			);
		} else {
			return(React.DOM.div(null))
		}
	}
});
//backup
WalletUI.backup = React.createClass({displayName: 'backup',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentWillMount: function() {
		this.setState({snowbackupname:this.props.config.snowbackupname});
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		
		e.preventDefault();
		
		_this = this
		
		_this.setState({requesting:true});
		
		if(snowUI.debug) snowlog.log('backup wallet')
		
		if(_this.state.snowbackupname)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var fpath = _this.state.snowbackuplocation + '/' + _this.state.snowbackupname
			var data = { checkauth:nowtime,wallet: _this.props.config.wallet,command:'backup',filepath:fpath}
			
			var errorDiv = $(_this.refs.snowbackuplocation.getDOMNode()).parent().parent().parent().find('.adderror')
			var successDiv = $(_this.refs.snowbackuplocation.getDOMNode()).parent().parent().parent().find('.addsuccess')
			
			errorDiv.fadeOut()
			successDiv.fadeOut()
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					
					snowUI.flash('success','Wallet backed up',1000);
					var html='Your wallet was backed up successfully to:<br />' + fpath + ' ';
					
					successDiv.fadeIn().html(html)
					_this.setState({requesting:false});
					//snowUI.methods.modals.backupWallet.close()
					
				} else {
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
					//snowUI.methods.updateState({connectError:true})
				}
			})
		}
	},
	render: function() {
	    
		_this = this
	    
		var encrypt = function(){ if(_this.props.config.lockstatus === 2 ) return (React.DOM.button({type: "button", onClick: function(){snowUI.methods.valueRoute(snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase')}, className: "btn btn-info pull-right"}, "Set Passphrase Now") ); else return '' }
	   
		if(snowUI.debug) snowlog.log('backup component')
	    
	    
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate() : date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes() : date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds() : date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours() : date.getHours();
	
		var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+this.props.config.wally.key+'.dat.bak';
	    
		return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Backup " + this.props.config.wally.name)
			), 	
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "backupform", onSubmit: this.request}, 
					React.DOM.div({id: "backupdiv"}, 
						React.DOM.div({style: {display:'none'}, className: "adderror"}), 
						React.DOM.div({style: {display:'none'}, className: "addsuccess"}), 
						React.DOM.div({role: "form", className: "row"}, 
							React.DOM.p(null, 
								"Enter an optional directory without trailing slash", '(/)', "." 
							), 
							React.DOM.p(null, " Your wallet decides how to process the file.  For RPC a backup is created where the RPC server is.   ")
						), 
						React.DOM.div({role: "form", className: "row"}, 
							React.DOM.div({className: !this.state.snowbackuplocation  ? 'form-group input-group ':'form-group input-group'}, 
								React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Directory")), 
								React.DOM.input({id: "snowbackuplocation", ref: "snowbackuplocation", placeholder: "/remote/path", className: "form-control coinstamp", valueLink: this.linkState('snowbackuplocation')})
							), 
							React.DOM.div({className: !this.state.snowbackupname  ? 'form-group input-group has-error':'form-group input-group'}, 
								React.DOM.span({className: "input-group-addon input-group-md coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "File Name")), 
								React.DOM.input({id: "snowbackupname", ref: "snowbackupname", placeholder: fname, className: "form-control coinstamp", valueLink: this.linkState('snowbackupname')})
							), 
							React.DOM.div({className: "form-group"}, 
								ButtonToolbar(null, 
									React.DOM.button({disabled: (this.state.requesting ||  this.state.snowbackupname  ) ? '' : 'disabled', id: "backupwalletsubmit", className: "btn ", rel: "backupwalletsubmit"}, this.state.requesting ? 'Backing Up...' : 'Backup'), 
								
									React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel"), 
									encrypt()
								)
							)
						)
						
					)
					
				)
			)	
		)				
		
	    );
	}
});
//change passphrase
WalletUI.passphrase = React.createClass({displayName: 'passphrase',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		
		e.preventDefault();
		
		_this = this
		
		_this.setState({requesting:true});
		
		if(_this.state.currentphrase && _this.state.changephrase)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var data = { checkauth:nowtime,wallet: _this.props.config.wally.key,command:'changepassphrase',oldpassphrase:_this.refs.currentphrase.getDOMNode().value.trim(),newpassphrase:_this.refs.changephrase.getDOMNode().value.trim(),confirm:_this.refs.confirmphrase.getDOMNode().value.trim()}
		
			var errorDiv = $(_this.refs.currentphrase.getDOMNode()).parent().parent().find('.adderror')
				
			errorDiv.fadeOut()
			
			var successDiv = $(_this.refs.currentphrase.getDOMNode()).parent().parent().find('.addsuccess')
				
			successDiv.fadeOut()
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true)
				{
					snowUI.flash('success',''+ _this.props.config.wally.name+' passphrase changed. ',2500);
					successDiv.fadeIn().html(_this.props.config.wally.name+' passphrase changed.');
				}
				else
				{
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
				}
				
			})
		}
	},
	render: function() {
	    
	    _this = this
	    
	    var isP = snowUI.methods.forms.passwordORnot.call(this).toString()
	    var toggle = isP === 'text' ? snowtext.ui.hidepassphrase : snowtext.ui.showpassphrase;
	    
	    if(snowUI.debug) snowlog.log('change pass component',isP)
	    return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Change passphrase for " + this.props.config.wally.name)
			), 
				
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "changewalletpassform", onSubmit: this.request}, 
					React.DOM.div({style: {display:'none'}, className: "adderror"}), 
					React.DOM.div({style: {display:'none'}, className: "addsuccess"}), 
					React.DOM.p(null, "Enter your current passphrase first"), 
					React.DOM.div({className: !this.state.currentphrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "currentphrase", ref: "currentphrase", placeholder: "current  passphrase", className: "form-control coinstamp", valueLink: this.linkState('currentphrase')})
					), 
					React.DOM.p(null, "Enter your new passphrase and confirm"), 
					React.DOM.div({className: !this.state.changephrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "changephrase", ref: "changephrase", placeholder: "new passphrase", className: "form-control coinstamp", valueLink: this.linkState('changephrase')})
					), 
					React.DOM.div({className: !this.state.confirmphrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Confirm")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "", id: "confirmphrase", ref: "confirmphrase", placeholder: "confirm passphrase", className: "form-control coinstamp", valueLink: this.linkState('confirmphrase')})
					), 
					
					React.DOM.p({style: {textAlign:'right'}}, React.DOM.a({onClick: snowUI.methods.togglePassFields}, " ", toggle, " ")), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({disabled: (this.state.requesting ||  !this.state.currentphrase  || (this.state.changephrase  !== this.state.confirmphrase )) ? 'disabled' : '', id: "confirmchangepassphrase", className: "btn "}, this.state.requesting ? 'Changing...' : 'Change Passphrase'), 
						React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel")
					)
				)
			)	
		)				
		
	    );
	}
});
//change passphrase
WalletUI.setpassphrase = React.createClass({displayName: 'setpassphrase',
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {}
	},
	componentDidMount: function() {
		snowUI.watchLoader();
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	request: function(e) {
		e.preventDefault();
		_this = this
				
		_this.setState({requesting:true});
		if(snowUI.debug) snowlog.log('encrypt wallet')
		
		if(_this.state.epassword)
		{
			var nowtime=new Date().getTime();
			var url = "/api/snowcoins/local/gated"
			var data = { checkauth:nowtime,wallet:_this.props.config.wally.key,command:'encrypt',p1:_this.state.epassword,p2:_this.state.econfirm}
			
			var errorDiv = $(_this.refs.epassword.getDOMNode()).parent().parent().find('.adderror')
			
			errorDiv.fadeOut()
			
			
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true) {							
					
					snowUI.methods.updateState({requesting:false,gates:{showInfoPage:true,showInfo:resp.msg}});
					snowUI.flash('success','Wallet encrypted',5000);
					setTimeout(function(){snowUI.methods.changelock(0);},2000)
					
					
					
				} else {
					snowUI.flash('error',resp.error,3500)
					errorDiv.fadeIn().html(resp.error);
					_this.setState({requesting:false});
					//snowUI.methods.updateState({connectError:true})
				}
			})
		}
	},
	render: function() {
	    var _this = this;
	    if(snowUI.debug) snowlog.log('change pass component')
	    return (
		React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: "col-xs-12 "}, 
				React.DOM.h4({className: "profile-form__heading"}, "Set passphrase for " + this.props.config.wally.name)
			), 
				
			React.DOM.div({className: "col-sm-10 col-sm-offset-1 col-md-10"}, 
				React.DOM.form({id: "setwalletpassform", onSubmit: this.request}, 
					React.DOM.div({style: {display:'none'}, className: "adderror"}), 
					React.DOM.p({style: {fontWeight:'bold'}}, "Your wallet software will have to stop to encrypt.  Be sure you can restart it before you continue."), 
					
					React.DOM.div({className: !this.state.epassword || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Passphrase")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "required", id: "epassword", ref: "epassword", placeholder: "enter pass phrase", className: "form-control coinstamp", valueLink: this.linkState('epassword')})
					), 
					React.DOM.div({className: !this.state.econfirm  || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, React.DOM.div({style: {width:70,marginLeft:-5}}, "Confirm")), 
						React.DOM.input({type: snowUI.methods.forms.passwordORnot.call(this), required: "required", id: "econfirm", ref: "econfirm", placeholder: "confirm pass phrase", className: "form-control coinstamp", valueLink: this.linkState('econfirm')})
					), 
					React.DOM.div({className: "form-group"}, 
					
						React.DOM.p({style: {textAlign:'right'}}, React.DOM.a({onClick: snowUI.methods.togglePassFields}, " Toggle Password Fields ")), 
					
						React.DOM.p(null, "Do ", React.DOM.strong(null, "NOT"), " lose this pass phrase or you will lose your coin.  To be secure you must delete all your old unencrypted backups."), 
					
						ButtonToolbar(null, 
							
							React.DOM.a({type: "button", onClick: snowUI.methods.hrefRoute, href: snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '', className: "btn btn-default pull-right"}, "Cancel"), 
							
							React.DOM.button({disabled: (this.state.requesting || !this.state.epassword || this.state.epassword  !== this.state.econfirm ) ? 'disabled' : '', id: "confirmencrypt", rel: "confirmencrypt", className: "btn  pull-left"}, this.state.requesting ? 'Encrypting... be patient' : 'Encrypt Wallet')
							
						)
					)
				
				)
			)	
		)				
		
	    );
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
