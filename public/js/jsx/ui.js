/**
 * @jsx React.DOM
 */

/* you can use touch events
 * */
//React.initializeTouchEvents(true);

/* you can use animation and other transition goodies
 * */
snowUI.ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


/* bootstrap components
 * */
snowUI.Flash = ReactBootstrap.Alert;
snowUI.Btn = ReactBootstrap.Button;
snowUI.Button = snowUI.Btn;
snowUI.Modal = ReactBootstrap.Modal;
snowUI.OverlayMixin = ReactBootstrap.OverlayMixin;
snowUI.ButtonToolbar = ReactBootstrap.ButtonToolbar;

/* create the container object
 * */

/* create flash message 
 * */
snowUI.SnowpiFlash = React.createClass({
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(snowUI.debug) snowLog.log(this.props);
		if(!this.state.isVisible)
		    return null;

		var message = this.props.message ? this.props.message : this.props.children;
		return (
		    <snowUI.Flash bsStyle={this.props.showclass} onDismiss={this.dismissFlash}>
			<p>{message}</p>
		    </snowUI.Flash>
		);
	},
	
	dismissFlash: function() {
		this.setState({isVisible: false});
		
	}
});


/* my little man component
 * simple example
 * */
snowUI.SnowpiMan = React.createClass({
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    
	    return this.transferPropsTo(
		<div style={this.props.divstyle} dangerouslySetInnerHTML={{__html: snowUI.snowText.logoman}} />
	    );
	}
});

/**
 * menu components
 * */
//main
snowUI.leftMenu = React.createClass({
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.router.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidMount: function() {
		$('.menufade').fadeTo(1000,1.0);
	},
	render: function() {
		var showmenu
		
		if(this.state.config.section === snowUI.snowPath.router.wallet) {
			
			if(this.state.config.wallet && this.state.config.wallet !== 'new')
				showmenu = snowUI.walletMenu 
			else
				showmenu = snowUI.defaultMenu
				
		} else if(this.state.config.section === snowUI.snowPath.router.receive || this.state.config.section === snowUI.snowPath.router.settings) {
			
			showmenu = snowUI.receiveMenu
			
		} else {
			
			showmenu = snowUI.defaultMenu
		}	
		
		if(snowUI.debug) snowLog.log('main menu component',this.state.config)
		
		return (
			<div className="menufade"><showmenu config={this.state.config} /> </div>			

		);
	}
});
//wallet menu
snowUI.walletMenu = React.createClass({
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.wallet,wallet:false,moon:false}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidUpdate: function() {
		$('.dogemenulink').removeClass('active');
		var moon = this.state.config.moon
		if(!moon && this.state.config.wallet !== 'new')moon = 'dashboard'
		$('.dogemenulink[data-snowmoon="'+moon+'"]').addClass('active');
	},
	componentDidMount: function() {
		this.componentDidUpdate()
		
	},
	menuClick: function(e) {
		
		e.preventDefault();
		
		var moon = $(e.target).parent()[0].dataset.snowmoon;
		
		if(moon !== undefined)
			snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.state.config.wallet + '/' + moon);
		else {
			
			var moon = $(e.target)[0].dataset.snowmoon;
			if(moon !== undefined) {
				snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + this.state.config.wallet + '/' + moon);
			} else {
				snowUI.flash('error','Link error',1000)
				
			}
			
		}
		
		
		
		return false
	},
	removeWallet: function(e){
		var _this = this	
		var url = "/api/snowcoins/local/remove-wallet"
		var data = {'action':'request',wally:_this.props.config.wally.key}
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowLog.info('remove wallet request from wallet menu',resp)
			if(resp.success === true) {			
				
				snowUI._wallets[_this.props.config.wally.key] = {removeKey: resp.key};
				snowUI.methods.valueRoute(snowUI.snowPath.wallet + '/' + _this.props.config.wally.key + '/remove');
			
			} else {
				
				if(resp.error)errorDiv.fadeIn().html(resp.error)
				snowUI.flash('error','Error requesting to request to remove wallet',4000);
			}
		});
				
		
		return false;
	},
	render: function() {
		var testnet = this.state.config.testnet ? (<div id="testnet-flash" title="" data-toggle="tooltip" data-placement="right" data-container="body" className="dogemenulink" data-original-title="This wallet is on the TESTNET!" style={{display:'block'}}><span className="glyphicon glyphicon-text-width"></span> TESTNET </div>) : ''
		
		var _this = this;
	    if(snowUI.debug) snowLog.log('wallet menu component')
	    return (
		
			<div id="menuwallet " >
				{testnet}
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/dashboard'} data-snowmoon="dashboard" id="dogedash" data-container="#menuspy"  className="dogemenulink " title={snowUI.snowText.menu.dashboard.title}> <span className="glyphicon glyphicon-th"></span> {snowUI.snowText.menu.dashboard.name}</a>
				
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/accounts'} data-snowmoon="accounts" id="dogeacc" data-container="#menuspy"  className="dogemenulink" title={snowUI.snowText.menu.accounts.title}> <span className="glyphicon glyphicon-list"></span> {snowUI.snowText.menu.accounts.name}</a>
				
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send'}data-snowmoon="send" id="dogesend" data-container="#menuspy"  className="dogemenulink" title={snowUI.snowText.menu.send.title}> <span className="glyphicon glyphicon-share"></span> {snowUI.snowText.menu.send.name}</a>
				
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/transactions'} data-snowmoon="transactions" id="dogetx" data-container="#menuspy" className="dogemenulink" title={snowUI.snowText.menu.tx.title}> <span className="glyphicon glyphicon-list-alt"></span> {snowUI.snowText.menu.tx.name}</a>
				
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/update'} data-snowmoon="update" id="dogeupdate" data-container="#menuspy"  className="dogemenulink" title={snowUI.snowText.menu.update.title}><span className="glyphicon glyphicon-pencil"></span> {snowUI.snowText.menu.update.name} <span id="updatecoinspan" style={{display:"none"}}></span></a>
				
				<a onClick={this.removeWallet} data-snowmoon="remove" id="dogeremove" data-container="#menuspy"  className="dogemenulink" title={snowUI.snowText.menu.remove.title}><span className="glyphicon glyphicon-trash"></span> {snowUI.snowText.menu.remove.name} <span id="updatecoinspan" style={{display:"none"}}></span></a>
			</div>
				
		
	    );
	}
});
//main menu
snowUI.receiveMenu = React.createClass({
	getInitialState: function() {
		return ({
			config:this.props.config || {section:snowUI.snowPath.wallet,wallet:'all',moon:'overview'}
		})
	},
	componentWillReceiveProps: function(nextProps) {
		
		if(nextProps.config)this.setState({config:nextProps.config})
		
	},
	componentDidUpdate: function() {
		$('.dogedccmenulink').removeClass('active');
		$('.dogedccmenulink[data-snowmoon="'+this.state.config.section+'"]').addClass('active');
	},
	render: function() {
	   
	    if(snowUI.debug) snowLog.log('receive menu component')
	    return (
		
			<div id="menudcc" >
				<a  onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet } data-snowmoon={snowUI.snowPath.router.wallet} id="dogewallets" data-container="#menuspy"  className="dogedccmenulink" title={snowUI.snowText.menu.left.wallet.title}> <span onClick={this.menuClick}  data-snowmoon={snowUI.snowPath.wallet}  className="glyphicon glyphicon-briefcase"></span> {snowUI.snowText.menu.left.wallet.name}</a>
				
				<a onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.receive }  data-snowmoon={snowUI.snowPath.router.receive} id="dogedccsetup" data-container="#menuspy" className="dogedccmenulink" title={snowUI.snowText.menu.left.receive.title}> <span  onClick={this.menuClick}  data-snowmoon={snowUI.snowPath.receive} className="glyphicon glyphicon-tasks"></span> {snowUI.snowText.menu.left.receive.name}</a>
				
				<a onClick={snowUI.methods.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.settings }  data-snowmoon={snowUI.snowPath.router.settings} id="dogedccsettings" data-container="#menuspy"  className="dogedccmenulink" title={snowUI.snowText.menu.left.settings.title}> <span  onClick={this.menuClick}  data-snowmoon={snowUI.snowPath.settings} className="glyphicon glyphicon-cog"></span> {snowUI.snowText.menu.left.settings.name}</a>
				
			</div>
				
		
	    );
	}
});
//default
snowUI.defaultMenu = snowUI.receiveMenu


//wallet select
snowUI.walletSelect = React.createClass({
	componentDidMount: function() {
		this.updateSelect();
	},
	componentDidUpdate: function() {
		this.updateSelect();
	},
	componentWillUpdate: function() {
		$("#walletselect").selectbox("detach");
	},
	updateSelect: function() {
		var _this = this
		$("#walletselect").selectbox({
			onChange: function (val, inst) {
				var config = snowUI.methods.config()
				if(val.charAt(0)==='/') {
					_this.props.route(val)	
				} else {
					if(!config.moon)config.moon = 'dashboard';
					_this.props.route(snowUI.snowPath.wallet + '/' + val + '/' + config.moon)
				}
			},
			effect: "fade"
		});
		//if(snowUI.debug) snowLog.log('wallet select updated')
	},
	render: function() {
		var wallets;
		if(this.props.wally instanceof Array) {
			var wallets = this.props.wally.map(function (w) {
				return (
					<option key={ w.key} value={w.key}  >{w.name}</option>
				);
			});
		}
		if(this.props.section === snowUI.snowPath.router.wallet) {
			var _df = (this.props.wallet) ? this.props.wallet : snowUI.snowPath.root + snowUI.snowPath.wallet;
		} else {
			var _df = '/' + this.props.section;
		} 
		//if(snowUI.debug) snowLog.log(_df)
		return this.transferPropsTo(
			<div className="list">
				<div className="walletmsg" style={{display:'none'}} />
				<select onChange={this.props.route} id="walletselect" value={_df}>
					<option  value={snowUI.snowPath.root + snowUI.snowPath.wallet} >{snowUI.snowText.menu.selectWallet.name}</option>
					{wallets}
					<optgroup></optgroup>
					<option  value={snowUI.snowPath.wallet + '/new'}  >{snowUI.snowText.menu.plus.name}</option>
					<option value={snowUI.snowPath.receive}  >{snowUI.snowText.menu.receive.name}</option>
					<option value={snowUI.snowPath.settings}  >{snowUI.snowText.menu.settings.name}</option>
					<option value={snowUI.snowPath.link}  >{snowUI.snowText.menu.link.name}</option>
				</select>
			</div>
		);
	}
});



snowUI.UI = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getDefaultProps: function() {
		return {
			section: snowUI.snowPath.router.wallet,
			moon:  false,
			wallet:  false,
			params: false,
		}
	},
	getInitialState: function() {
		/**
		 * initialize the app
		 * the plan is to keep only active references in root state.  
		 * we should use props for the fill outs
		 * */
		 var _this = this
		/* methods - the root is impled as UI but there is also a circle back
		 * create placeholders for each component that creates methods for better debugging
		 * */
		 snowUI.methods =  {
			ui: snowUI.methods,
			wallet: {},
			receive: {},
			settings: {},
			resetUI: _this.resetMe,
			hrefRoute: _this.hrefRoute,
			buttonRoute: _this.buttonRoute,
			valueRoute: _this.valueRoute,
			updateState: _this.updateState,
			resetWallets: _this.getWallets,
			togglePassFields: _this.togglePassFields,
			home: function() {_this.valueRoute(_this.props.section + this.props.wallet)},
			/*create an object */
			config: function(){ return _this.config.call(this) }.bind(_this),
			/*create an object */
			modals: snowUI.controllers.ui.modals.call(_this),
			forms: {
				passwordORnot: _this.passwordORnot,
			},
			
			/* statics dont have acccess to the UI Object unless binded with _this */
			removeRow: function(div,cb) {
				$(div).addClass('bg-danger').delay(2000).fadeOut("slow",function(){
					$(this).remove();
					if(typeof cb === 'function')cb()
				});
			},
			killLock: function(state) {
				clearInterval(snowUI.intervals.locktimer)
				snowUI.intervals.locktimer = false
				$('#walletbar').removeClass('flash-to-success')
				if(snowUI.debug) snowLog.log('reset lock status')
				if(state)_this.setState({locked:true,unlocked:false,lockstatus:0,unlockeduntil:false,unlockedtimeformat:false})
			},
			changelock: function(lock){
				/* lockstatus -- 0=encrypted,1=unlocked until unlockeduntil,2=not encrypted */
				var _this = this;
				$('#walletbar').removeClass('flash-to-success')
				if(lock==='off') {
					this.setState({locked:false,unlocked:true,lockstatus:3}) //fake the lock out and turn it off
				} else if(!this.state.wally || this.state.wally.coinapi!='rpc') {
					this.setState({locked:false,unlocked:false,lockstatus:2})
				} else if(lock===0 || lock==='Locked') {
					this.setState({locked:true,unlocked:false,lockstatus:0})
				}else if(lock>0) {
					
					var usetime=lock;
					var date = new Date(usetime);
					var long = lock - new Date().getTime()
					
					var hours = date.getHours(),minutes = date.getMinutes(),seconds = date.getSeconds();
					var formattedTime = hours + ':' + minutes + ':' + seconds;
					
					this.setState({locked:true,unlocked:true,lockstatus:1,unlockeduntil:lock,unlockedtimeformat:formattedTime})
					
					var i=0;
					timeout = Math.round(parseFloat(long) / 1000)
					
					var showTime = function(html) { $('.locktimer').html(html) }
					var walletbar = function(on) { if(on)$('#walletbar').addClass('flash-to-success'); else $('#walletbar').removeClass('flash-to-success') }
					
					snowUI.flash('success',_this.state.wally.name + ' unlocked for ' + timeout + ' seconds.',3000)
					walletbar(true)
					if(!snowUI.intervals.locktimer) {
						snowUI.intervals.locktimer = setInterval(function() {
							showTime(timeout - i)
							//snowUI.flash('success',_this.state.wally.name + ' unlocked for ' + (timeout - i) + ' seconds.','off')								
							
							if(i>=timeout) {
								clearInterval(snowUI.intervals.locktimer)
								snowUI.intervals.locktimer = false
								walletbar(false)
								if(snowUI.debug) snowLog.log('reset lock status')
								_this.setState({locked:true,unlocked:false,lockstatus:0,unlockeduntil:false,unlockedtimeformat:false})
							}
							i++;
						},1000)

					}
								
				} else {
					this.setState({locked:false,unlocked:false,lockstatus:2})
				}
			}.bind(_this),/*end changelock - binded to snowUI React component*/
		}
		return {
			section: snowUI.snowPath.router.wallet,
			moon:  false,
			wallet:  false,
			page: false,
			params: false,
			mywallets: [],
			locatewallet: [],
			mounted:false,
			wally:{},
			testnet: false,
			isSSL: false,
			locked: false,
			unlocked: false,
			lockstatus:3,
			requesting: false,
			modals: {
				unlockWallet: false,
				encryptWallet: false,
				removeItem: false,
				addressBook: false,
			},
			showPasswords: false,
			gates: {
				showErrorPage: false,
				showWarningPage: false,
				showInfoPage: false,
				showSuccessPage: false
			}
		};
	},
	//set up the config object
	config: function() {
		var _this = this
		if(this.state) {
			/* lets try and just pass arouns state. There is a redundency with snowUI.methods, but we need snowUI.methods */
			//return this.state
			return {
				section:_this.props.section,
				wallet:_this.props.wallet,
				page:_this.props.wallet,
				params:_this.props.params,
				moon:_this.props.moon,
				mywallets: _this.state.mywallets,
				locatewallet: _this.state.locatewallet,
				wally: _this.state.wally,
				testnet: _this.state.testnet,
				isSSL: _this.state.isSSL,
				locked: _this.state.locked,
				unlocked: _this.state.unlocked,
				lockstatus:_this.state.lockstatus,
				userSettings:_this.state.userSettings,
				snowbackupname: _this.state.snowbackupname,
				modals: _this.state.modals
			}
		}
	},
	componentWillMount: function() {
		//this.loadToggle()
		if(snowUI.debug) snowLog.log('ui will mount')
		//snowUI.loadingStart();
		return false
	},
	componentDidMount: function() {
		
		if(!this.state.mounted) {
			if(snowUI.debug) snowLog.log('ui is mounted')
			var update = {}
			if(this.props.section !== undefined)update.section = this.props.section;
			if(this.props.moon !== undefined)update.moon = this.props.moon;
			if(this.props.wallet !== undefined) {
				update.wallet = this.props.wallet;
				update.page = this.props.wallet;
			}
			if(this.props.params !== undefined)update.params = this.props.params;
			
			this.getWallets(this.props,update)			
		}
		$('.bstooltip').tooltip();
	},
	componentWillUpdate: function() {
		
		snowUI.methods.resetUI()
	},
	componentDidUpdate: function() {
		
		$('.bstooltip').tooltip();
	},
	getWallets: function (props,addstate) {
		
		//use a callback if it is last in argument list
		var args = Array.prototype.slice.call(arguments);
		var last = args[args.length-1];
		if(typeof last !== 'function')last = function(){ return true }
		
		var newState = (typeof addstate === 'object') ? addstate : {};
		
		//grab array of available wallets
			var _this = this
			if(snowUI.debug) snowLog.log('update wallet list on new wallet')			
			$.ajax({async:false,url: "/api/snowcoins/local/change-wallet"})
				.done(function( resp,status,xhr ) {
					
					snowUI._csrf = xhr.getResponseHeader("x-snow-token");
					if(snowUI.debug) snowLog.log('got wallies',resp.wally, props.wallet)
					
					//locater
					var a = []; 
					var ix = resp.wally.length;
					for(i=0;i<ix;i++) {
						a[i]=resp.wally[i].key
					}
							 
					if(props.wallet) {
						
						var newWally = resp.wally[a.indexOf(props.wallet)];
						if(!newWally) {
							
							newWally = {}
							var fname;
							
						} else {
							
							var date=new Date();
							var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
							
							var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+newWally.key+'.dat.bak';
							
						}
						
						newState.locatewallet = a;
						newState.mounted = true;
						newState.mywallets = resp.wally;
						newState.wally = newWally;
						newState.isSSL = newWally.isSSL;
						newState.snowbackupname = fname;
						
					
					} else {
						
						newState.locatewallet = a;
						newState.mounted = true;
						newState.mywallets = resp.wally;
					
					}
					newState.userSettings = resp.userSettings;
					if(snowUI.debug) snowLog.log('set ui state ',newState)
					_this.setState(newState);
					
					
			}.bind(this));
		//run callback	
		last()
		return true
	},
	componentWillReceiveProps: function(nextProps) {
		
		var update = {
			modals: {
				unlockWallet: false,
				encryptWallet: false,
			},
			gates: {
				showErrorPage: false,
				showWarningPage: false,
				showInfoPage: false,
				showSuccessPage: false
			}
		}
		
		if(nextProps.section !== undefined)update.section = nextProps.section;
		if(nextProps.moon !== undefined)update.moon = nextProps.moon;
		if(nextProps.wallet !== undefined) {
			update.wallet = nextProps.wallet;
			update.page = nextProps.wallet;
		}
		if(nextProps.params !== undefined)update.params = nextProps.params;
		
		//wallet list
		if(nextProps.mywallets)update.mywallets = nextProps.mywallets;		
		
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
		
		/* this is for wallet.  I wanted to move it to Wallet, 
		* but to many state changes affect the base UI,
		* so it seems easier to keep all of our info here
		* */
		if(nextProps.section === snowUI.snowPath.router.wallet && nextProps.wallet && nextProps.wallet !== undefined) {
			if(nextProps.wallet === 'new') {
				
				//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				
				update.wally = {};
				update.isSSL = false;
				update.lockstatus = 3;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
				
			} else if(nextProps.wallet !== this.state.wallet) {
				
				if(snowUI.debug) snowLog.log('should be a new wallet',nextProps.wallet ,this.state.wallet)
				
				React.unmountComponentAtNode(document.getElementById('snowcoins'));
				
				var newWally = this.state.mywallets[this.state.locatewallet.indexOf(nextProps.wallet)];
				
				update.wally = newWally;
				update.isSSL = newWally.isSSL
				update.lockstatus=3;
				update.unlockeduntil=false;
				update.unlockedtimeformat=false;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
				
				//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				update.snowbackupname = y+''+m+''+d+''+h+''+min+''+s+'.'+newWally.key+'.dat.bak';	
				
				 
							
			} else {
				
				update.snowbackupname = y+''+m+''+d+''+h+''+min+''+s+'.'+this.state.wally.key+'.dat.bak';
				
			}
			
			
			
			
		} else {
			//kill intervals
				if(snowUI.intervals.locktimer)snowUI.methods.killLock();
				
				update.wally = {};
				update.isSSL = false;
				update.lockstatus = 3;
				update.testnet=false;
				update.locked=false;
				update.unlocked=false;
		}
		
		//error pages
		update.showErrorPage = (nextProps.showErrorPage !== undefined) ? nextProps.showErrorPage : false;
		
		update.requesting = false;
		
		if(snowUI.debug) snowLog.log('ui get props update state',update)
		
		/* this is a grabber for the wallets
		 * I let it run on every page change in case changes are made outside of this session
		 * but it really only needs to run for the wallet section
		 * if(nextProps.section === snowUI.snowPath.router.wallet && nextProps.wallet !== this.state.wallet)
		 * */
		if(nextProps.wallet !== this.state.wallet)
			this.getWallets(nextProps,update)
		else
			this.setState(update);
		
		return false
		
	},
	
	updateState: function(prop) {
		if(typeof prop === 'object')
			this.setState(prop);
		if(snowUI.debug) snowLog.log('update state from outside/child component',prop)	
		return false
	},
	changeTheme: function() {
		
		var mbody = $('body');
		if(mbody.hasClass('themeable-snowcoinslight')==true) {
			mbody.removeClass('themeable-snowcoinslight');
			var theme = 'snowcoins dark'
		} else {
			mbody.addClass('themeable-snowcoinslight');
			var theme = 'snowcoins light'
		}
		var _this = this,
			url = "/api/snowcoins/local/settings",
			data = {page:'setusersettings',newsettings:JSON.stringify({'theme':theme})};
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.success === true) {
				if(snowUI.debug) snowLog.info('set user theme')
				
			} else {
				if(snowUI.debug) snowLog.error(resp)
				
			}
			return false
		})
		
		
	},
	valueRoute: function(route,options) {
		if(typeof options === 'object') {
			var skipload = options.skipload,
				trigger = options.trigger === 'undefined' ? true:options.trigger
		} else {
			var skipload = options,
				trigger = true
		}
		if(skipload) {
			bone.router.navigate(route, {trigger:trigger});
		} else {
			snowUI.loaderFetch(function(){
				bone.router.navigate(route, {trigger:trigger});
			});
		}
		if(snowUI.debug) snowLog.log('value route', 'skip loading: '+skipload+', trigger: '+trigger,snowUI.snowPath.root + route)
		return false
	},
	hrefRoute: function(route) {
		route.preventDefault();
		var _this = this
		var newroute = $(route.target)	
		snowUI.loaderFetch(function(){
			if(snowUI.debug) snowLog.log('href loader route',snowUI.snowPath.root,newroute)
			var moon =  newroute[0] ? newroute.closest('a')[0].pathname : false
			if(moon) {
				moon = moon.replace(("/" + snowUI.snowPath.router.root + "/"),'')
				if(snowUI.debug) snowLog.log('moon owner',moon)
				bone.router.navigate(moon, {trigger:true});
			} else {
				snowUI.flash('error','Link error',2000)
				_this.setState({showErrorPage:false}); //this is a quick way to rerender the page since we are mid laod
			}
			
		});
		
		
		return false
	},
	buttonRoute: function(route) {
		route.preventDefault();
		snowUI.loaderFetch(function(){
			bone.router.navigate(snowUI.snowPath.root + $(route.target)[0].dataset.snowmoon, {trigger:true});
			if(snowUI.debug) snowLog.log('button route',$(route.target)[0].dataset.snowmoon)

		});
		return false
	},
	eggy: function() {
		
		snowUI.eggy();
	},
	togglePassFields: function() {
		this.setState({showPasswords:!this.state.showPasswords})
	},
	passwordORnot: function() {
		if(this.state.showPasswords)
			return "text"
		else
			return "password"
	},
	resetMe: function() {
		
		//clean up from previous renders
		$('#walletbar').removeClass('bg-danger');
		$('body').find('[rel=popover]').popover('destroy');
		
	},
	render: function() {
		
		//set up our psuedo routes
		var comp = {}
		comp[snowUI.snowPath.router.wallet]=snowUI.wallet.UI;
		comp[snowUI.snowPath.router.receive]=snowUI.receive.UI;
		comp[snowUI.snowPath.router.settings]=snowUI.settings.UI;
		comp[snowUI.snowPath.router.inq]=snowUI.link.UI;
		
		var gates = this.state.gates
		
		var mycomp = comp[this.props.section]
		if(!mycomp){
			if(snowUI.debug) snowLog.info(' mycomp failed, probably a 404:',this.props.section,mycomp,comp[this.props.section])
			mycomp=snowUI.wallet.UI
			gates.showWarning = '404 Not Found';
			gates.showWarningPage = true;
		}
		
		if(snowUI.debug) snowLog.log('check state UI',this.state.mounted,mycomp,this.props.section,gates);
		
		if(this.state.mounted) {
			var mountwallet = function() {
				return (<snowUI.walletSelect route={this.valueRoute} section={this.props.section} wallet={this.props.wallet} wally={this.state.mywallets}/>)
			}.bind(this)
			var mountpages = function() {
				return (<mycomp methods={snowUI.methods} config={this.config()} gates={gates}   />)
			}.bind(this)
			
		} else {
			var mountwallet = function(){};
			var mountpages = function(){};
		}
		
		var ssl = this.props.wallet && this.state.isSSL ? {display:'block'} : {display:'none'}
		
		var lockedwallet = this.props.wallet &&  this.state.locked && !this.state.unlocked ? "pointer  bstooltip fade in active" : "pointer hidden bstooltip fade out"
		var openwallet = this.state.lockstatus === 2 || this.state.lockstatus === 1  ? "pointer bstooltip  fade in active" : "pointer  bstooltip hidden  fade out"
		var unlockedwallet = this.props.wallet &&  this.state.unlocked ? "locktimer pointer  bstooltip  fade in active" : "pointer hidden bstooltip  fade out"
		
		var testnet = this.state.testnet ? 'testnet':''
		
		if(snowUI.debug) snowLog.log('testnet',this.state.testnet)
		  	
		//mount
		return (
			<div id="snowpi-body">
				<div id="walletbarspyhelper" style={{display:'block'}} />
				<div id="walletbar"  className="walletbar affix">
					  <div className="wallet">
						<div className="button-group">
							<snowUI.Btn bsStyle="link" data-toggle="dropdown" className="dropdown-toggle">{snowUI.snowText.menu.menu.name}</snowUI.Btn>
							<ul className="dropdown-menu" role="menu" >
												
								<li className="nav-item-home"> <a onClick={this.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.wallet } >{snowUI.snowText.menu.list.name}</a></li>
								<li className="nav-item-receive"><a onClick={this.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.receive} title={snowUI.snowText.menu.receive.title}>{snowUI.snowText.menu.receive.name}</a></li>
								<li className="nav-item-add"> <a onClick={this.hrefRoute} href={snowUI.snowPath.wallet + '/new'} >{snowUI.snowText.menu.plus.name}</a></li>
								<li className="nav-item-settings"><a onClick={this.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.settings} title={snowUI.snowText.menu.settings.title}>{snowUI.snowText.menu.settings.name}</a></li>
								
								<li className="divider" />
								<li className="nav-item-settings"><a onClick={this.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.settings + '/language'} title={snowUI.snowLanguages.mylanguage}>{snowUI.snowLanguages.mylanguage}</a></li>
								<li className="divider" />
								<li className="nav-item-settings"><div><div className="walletmenuspan">{snowUI.snowcat}</div><div className="clearfix" /> </div></li>
								<li className="divider" />
								<li>
									<div>
										<div onClick={this.changeTheme} className="walletmenuspan changetheme " title='Switch between the light and dark theme' data-toggle="" data-placement="bottom" data-container="body" data-trigger="hover focus" style={{cursor:'pointer'}}><span className="glyphicon glyphicon-adjust" /></div>
										<div className="walletmenuspan " title='.link' data-toggle="" data-placement="bottom" data-container="body" data-trigger="hover focus"> <a  onClick={this.hrefRoute} href={ snowUI.snowPath.root + snowUI.snowPath.inq } ><span className="glyphicon glyphicon-globe" /></a></div>
										<div className="walletmenuspan " title='Logout' data-toggle="" data-placement="right" data-container="body" data-trigger="hover focus"> <a href='/snowout'> <span className="glyphicon glyphicon-log-out" /></a></div>
										<div className="clearfix" /> 
									</div>
								</li>
								
							</ul>
						</div>
					</div>
					
					
					{mountwallet()}
					
					
					
					<div  onClick={snowUI.methods.modals.open.unlockWallet} className={lockedwallet} id="wallet-lock" data-toggle="tooltip" data-placement="bottom"  alt="Wallet is encrypted and locked"  title="Wallet is encrypted and locked"></div>
					
					<div  onClick={snowUI.methods.modals.open.encryptWallet} className={openwallet} id="wallet-unlock" snowlink="dashboard" data-toggle="tooltip" data-placement="bottom"   title="You should encrypt this wallet soon.  Coins can be sent from your wallet without supplying a passphrase first."></div>
					
					<div className={unlockedwallet} id="wallet-unlocked"  data-toggle="tooltip" data-placement="bottom"   title="Wallet is unlocked and capable of sending coin."></div>
					
					<div style={ssl} id="wallet-ssl" data-toggle="tooltip" data-placement="bottom" alt="ssl connection" className=" bstooltip" title="SSL Connection to wallet"><span className="glyphicon glyphicon-link"></span></div>
					
					
					<div className="logo" onClick={this.eggy}><a title="inquisive.io snowcoins build info" data-container="body" data-placement="bottom" data-toggle="tooltip" className="walletbar-logo"></a></div>
					
				</div>
				<div className="container-fluid">
					<div id="menuspy " className={"affix dogemenu col-xs-1 col-md-2 " + testnet}  >
						<snowUI.leftMenu  config={this.config()} />
					</div>
					
					<div className="dogeboard col-xs-offset-1 col-xs-11 col-md-offset-2 col-md-10">
						<snowUI.AppInfo />
						<div className="dogeboard-left col-xs-12 col-md-12">
							<div className="content"> {mountpages()} </div>
						</div>
					</div>
				</div>
			{/* add the modals */}	
			{snowUI.snowModals.unlockWallet.call(this)}
			{snowUI.snowModals.encryptWallet.call(this)}
				
			{/* end snowpi-body */}
			</div>
		)
	}
});

//app info
snowUI.AppInfo = React.createClass({
	render: function() {
		return (
			<div id="easter-egg" style={{display:'none'}} >
				<div>
				<div className="blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4">
				  
				  <h4>Get Wallet Manager</h4>
				  <div className="row">
				    <div className="col-sm-offset-1 col-sm-11"><a href="https://github.com/inquisive/wallets" target="_blank">GitHub / Installation</a></div>
				    <div className="col-sm-offset-1 col-sm-11"><a href="https://www.npmjs.com/package/wallets" target="_blank">NPM</a></div>
				    <div className="col-sm-offset-1 col-sm-11"> <a href="https://github.com/inquisive/wallets/latest.zip" target="_blank">Download zip</a>&nbsp;|&nbsp;<a href="https://github.com/snowkeeper/snowcoins/latest.tar.gz" target="_blank">Download gz</a></div>
				  </div>
				  <div style={{borderBottom:'transparent 15px solid'}} />
				  <h4>Built With</h4>
				  <div className="row">
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"><a href="http://nodejs.org" target="_blank">nodejs</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://keystonejs.com" target="_blank">KeystoneJS</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"><a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></div>
				    <div className="col-sm-6 col-md-4"><a href="https://github.com/countable/node-dogecoin" target="_blank">node-dogecoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4"><a href="http://mongoosejs.com/" target="_blank">mongoose</a></div>
				  </div>
				 
				</div>
				<div className="blocks col-xs-offset-1 col-xs-10 col-md-offset-1 col-md-5 col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-4">
				   <h4>Share</h4>
				  <div className="row">
				    <div title="inquisive.link/.wallets.share" className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"> <a href="https://inquisive.link/.wallets.share" target="_blank">.wallets.share</a></div>
				  </div>
				  <div style={{borderBottom:'transparent 15px solid'}} />
				  <h4>Digital Coin Wallets</h4>
				  <div className="row">
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://dogecoin.com" target="_blank">dogecoin</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://bitcoin.org" target="_blank">bitcoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://litecoin.org" target="_blank">litecoin</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://vertcoin.org" target="_blank">vertcoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://octocoin.org" target="_blank">888</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://auroracoin.org" target="_blank">auroracoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://blackcoin.co" target="_blank">blackcoin</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://digibyte.co" target="_blank">digibyte</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://digitalcoin.co" target="_blank">digitalcoin</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://darkcoin.io" target="_blank">darkcoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://maxcoin.co.uk" target="_blank">maxcoin</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://mintcoin.co" target="_blank">mintcoin</a></div>
				    <div className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"><a href="http://einsteinium.org" target="_blank">einsteinium</a></div>
				    <div className="col-sm-6 col-md-4"><a href="http://peercoin.net" target="_blank">peercoin	</a></div>
				  </div>
				  <div className="row">
				  </div>
				</div>
				<div className="clearfix"></div>
			      </div>
			</div>
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
