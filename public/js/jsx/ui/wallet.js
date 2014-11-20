/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
React.initializeTouchEvents(true);


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




var WalletUI = snowUI.wallet


/**
 * wallet components
 * */
//main
WalletUI.UI = React.createClass({
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

		snowlog.log('willreceiveprops main wallet',_this.state, nextProps)
		
		//grab the data for this wallet
		 if(this.state.refresh && nextProps.config.moon === 'update') {
				//we have to grab the wallet status on every update
				//this catches any form changes like host or port and make sure they work
				this.grabWallet(nextProps);
				
		} else if(!this.state.connected  || (nextProps.config.wallet  &&  nextProps.config.wallet !== _this.state.config.wallet)) {
			/* got not connected or a new wallet*/
			
			snowlog.log('grab wallet', nextProps.config.wally)
			
			sendProps.testnet = false;
			
			_this.setState(sendProps)
			
			this.grabWallet(nextProps);
			
		} else if(nextProps.config.wallet && nextProps.config.wallet !== _this.state.config.wallet)  {
			/* got new wallet*/
			if(nextProps.config.wally.name)snowUI.flash('message','Now using wallet '+ nextProps.config.wally.name+'.',4000);
			_this.setState(sendProps)
		
		} else if(!nextProps.config.wallet) {
			/* no wallet*/
			snowlog.log('no wallet')
			sendProps.connecting = false;
			sendProps.ready = true;
			sendProps.testnet = false;
			_this.setState(sendProps)
			
		} else {
			/* pass through to ready*/
			snowlog.log('pass through')
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
				snowlog.log('hitting  server new wallet',resp)
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
						snowlog.warn('No connection available',nextProps)
					
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
		snowlog.info('wallet unmounted')
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
		
		snowlog.log('main wallet component - current state:',showcomp, this.props,this.state)
		
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
	    
		snowlog.log('wallet render component',this.state.connecting,this.props.gates)
	    
		//stop loading
		//snowUI.loaderRender();
		
		if(this.state.connecting) {
			snowlog.warn('not connected render')
			//snowUI.methods.loaderStart();
			return (<div />)
			
		} else if( this.props.gates.showInfoPage) {
			var message =  this.props.gates.showInfo
			return (

				<div className="" id="maindiv"> <WalletUI.messageDisplay type="requestinfo" config={this.props.config} ready={this.state.ready} setWalletState={this.updateState} message={message} /> </div>

			);
				
		} else if( this.props.gates.showSuccessPage) {
			var message =  this.props.gates.showSuccess
			return (

				<div className="" id="maindiv"> <WalletUI.messageDisplay type="requestsuccess"   config={this.props.config} ready={this.state.ready} setWalletState={this.updateState} message={message} /> </div>

			);
				
		} else if( this.props.gates.showWarningPage) {
			var message =  this.props.gates.showWarning
			return (

				<div className="" id="maindiv"> <WalletUI.messageDisplay type="requestwarning"   config={this.props.config} ready={this.state.ready} setWalletState={this.updateState} message={message} /> </div>

			);
				
		} else if((!this.state.connected && this.props.config.moon !== 'update' && this.props.config.moon !== 'remove' || this.props.gates.showErrorPage ) ) {
			var message = (this.props.gates.showErrorPage) ? this.props.gates.showError : this.state.connectError
			return (

				<div className="" id="maindiv"> <WalletUI.connectError  config={this.props.config} ready={this.state.ready} setWalletState={this.updateState} message={message} /> </div>

			);
			
		}  else if( !this.state.ready ) {
			
			snowlog.warn('wallet ui not ready')
			return (<div />)
			
		} else {
			var message = (this.props.showErrorPage) ? this.props.showError : this.state.connectError
			return (
				
				<div className="reactfade" id="maindiv"> <renderMe  config={this.props.config} ready={this.state.ready} setWalletState={this.updateState}  message={message} /> </div>

			);
		}
	}
});

//remove wallet component
WalletUI.remove = React.createClass({
	confirmDelete: function() {
		var confirm = window.prompt(snowtext.wallet.remove.confirm.text.replace(/{name}/g,this.props.config.wally.name))
		var _this = this;
		if(confirm === this.props.config.wally.name) {
			snowlog.warn('Deleting wallet ',this.props.config.wally.name,this.props)
			
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
	    
	    snowlog.log('remove wallet component')
	    _this = this;
	    var message = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ?  snowtext.wallet.remove.goodinfo.text.replace('{name}',_this.props.config.wally.name) :  snowtext.wallet.remove.badinfo.text.replace('{name}',_this.props.config.wally.name)
	    
	    var btn = snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? (<a  onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wally.key}  className="btn btn-default "><span>{snowtext.wallet.remove.btn.cancel}</span></a>) : ''
	    return (
		<div  style={{padding:'10px'}} >
			<div className="page-title"> {snowtext.wallet.remove.title.text + _this.props.config.wally.name}</div>
			<div className=""  style={{paddingTop:'20px'}}>
				
				<div key="adderror3423" className="adderror" style={{display:'none'}}></div>			
				
				<p><span dangerouslySetInnerHTML={{__html: message}} /></p>
				<p>
					<ButtonToolbar>
						
						{btn}
							
						<button  onClick={snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? this.confirmDelete : function(){snowUI.methods.valueRoute(snowPath.wallet)}} className="btn btn-danger "><span>{snowUI._wallets[this.props.config.wally.key] && snowUI._wallets[this.props.config.wally.key].removeKey ? snowtext.wallet.remove.btn.remove:snowtext.wallet.remove.btn.request}</span></button>
			
					</ButtonToolbar>
				
				</p>
			</div>
		</div>			
		
	    );
	}
});
//connect error component
WalletUI.messageDisplay = React.createClass({
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
	    
	    snowlog.log('warning message component')
	    
	    return (<div  style={{padding:'5px 20px'}} >
			<div className={this.props.type}>
				<span> {this.props.title || 'I have an important message for you.'}</span>
				<div className="message">
					<p>{this.props.message}</p>
				</div>
			</div>
			
		</div>);
	}
});
WalletUI.displayMessage = WalletUI.messageDisplay

//connect error component
WalletUI.connectError = React.createClass({
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	render: function() {
	    snowlog.log('connect error component')
	    
	    return (<WalletUI.add  config={this.props.config}  setWalletState={this.props.setWalletState} message={this.props.message}  /> );
	}
});

//overview list component
WalletUI.overview = React.createClass({
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
		snowlog.log('wallet overview component')
		if(this.props.config.mywallets instanceof Array) {
			var _this = this;
			//loop through our wallets and show a table
			var mytable = this.props.config.mywallets.map(function (w) {
				
				return (
					<tr key={w.key}>
						<td><a onClick={_this.menuClick} data-snowmoon={snowPath.wallet + '/' + w.key+ '/update'} ><span className="glyphicon glyphicon-pencil">&nbsp;</span></a></td>
						<td><a onClick={_this.menuClick} data-snowmoon={snowPath.wallet + '/' + w.key+ '/dashboard'}>{ w.name} </a></td>
						<td> { w.coin} </td>
						<td>{ w.address+':'+w.port} </td>
						<td>{w.isSSL ? <span className="glyphicon glyphicon-link" /> : ''}</td>
						<td onClick={_this.deleteWallet} data-snowmoon={w.key} ><span onClick={snowUI.deleteWallet} data-snowmoon={w.key}  style={{cursor:"pointer"}} className="removewallet text-danger glyphicon glyphicon-remove-sign">&nbsp;</span></td>
					</tr>
				);
			});				
				
		}
		return (
			<div id="snow-overview" className="bs-example">
				
				<a className="btn btn-default btn-sm nav-item-add" onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/new'}>Add New Wallet</a>
				<table className="table table-hover snowtablesort">
					<thead>
						<tr key='whead'>
							<th><span className="glyphicon glyphicon-pencil"></span></th>
							<th><span className="glyphicon glyphicon-sort">name</span></th>
							<th><span className="glyphicon glyphicon-sort">coin</span></th>
							<th><span className="glyphicon glyphicon-sort">address</span></th>
							<th className="snowsortisempty"><span className="glyphicon glyphicon-sort">ssl</span></th>
							<th ><span className="text-danger glyphicon glyphicon-remove-sign"></span></th>
						</tr>
					</thead>
					<tbody>
						{mytable}
					</tbody>
				</table>
				
		
		
			</div>			
		
		);
	}
});
//add new wallet component
WalletUI.add = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {
			validated:false,
			refresh:false,
			port:22555
		}
	},
	componentWillReceiveProps: function (nextProps) {
		
		snowlog.log('add/update will receive props',nextProps.config.wally)
		
		if(this.state.refresh || (nextProps.config.wally && nextProps.config.wally.key)) {
			this.setState({refresh:false})
			this.setState(nextProps.config.wally)
			this.validator(nextProps.config.wally)
			snowlog.log(this.state)
			
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
		snowlog.log('add/update will mount')
		this.setState(this.props.config.wally)
		this.validator(this.props.config.wally)
	},
	componentWillUnMount: function() {
		snowlog.log('add/update un-mounted')
	},
	componentDidUpdate: function() {
		snowlog.log('add/update will update')
		this.validator(this.state)
		snowUI.watchLoader()
		
	},
	
	validator: function(state) {
			
		if(state.key && state.name && state.address && state.port && state.coin) {
			
			if(!state.validated) {
				snowlog.log('update wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else if(state.name && state.port && state.coin && state.address && ((state.apiuser && state.apipassword) || state.apikey)) {
			
			
			if(!state.validated){
				snowlog.log('new wally validated',this.state.validated)
				this.setState({validated:true});
			}
			
		} else {
			
			
			if(state.validated){
				snowlog.log(' wally not validated',this.state.validated)
				this.setState({validated:false});
			}
		}
	},
	componentDidMount: function() {
		/* jquery-ui autocompletes */
		var _this = this
		$( this.refs['aw-coin'].getDOMNode()).autocomplete({ source: defaultcoins,minLength:0,select: function( event, ui ) {
			_this.setState({'coin':ui.item.value})
			//snowlog.info(event,ui)
		}}).focus(function(){$(this).autocomplete('search', $(this).val())});
		$( this.refs['aw-cointicker'].getDOMNode()).autocomplete({ source: defaultcointickers,minLength:0 }).focus(function(){$(this).autocomplete('search', $(this).val())});
		
		snowUI.loaderRender();
		
	},
	shouldComponentUpdate: function() {
		snowlog.info('wallet form will update',!this.state.stopUpdate);
		return !this.state.stopUpdate
	},
	walletForm: function(e) {
		
		e.preventDefault();
		
		var formData = $( e.target ).serialize();
		
		snowlog.log('wallet form',formData);
		
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
	    
	    snowlog.log('wallet add component',this.state,this.props.config.wally)
	    var errormessage,title;
	    if(this.props.message) {
		    errormessage = (<WalletUI.messageDisplay message={this.props.message} type="requesterror" title="Please check your configuration" />);
		    title = false
	    } else {
		    title = (<div className="page-title ">
					{this.props.config.wally.key ? 'Update ' + this.props.config.wally.name : 'Add A Wallet'}
			     </div>)
	    }
	   
	    
	    var changeorencrypt = this.props.config.lockstatus === 2 ? 'Turn Encryption On':'Change  Passphrase'
		
		var walletbuttons = !this.state.key ? '' : (<ButtonToolbar><a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/backup'}  className="btn btn-default btn-sm pull-left"><span>Backup</span></a>  
						<a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase'}   className="btn btn-default btn-sm pull-left"><span>{changeorencrypt}</span></a><a onClick={snowUI.deleteWallet} data-snowmoon={this.props.config.wally.key} className="btn btn-danger btn-sm pull-right"><span>Delete</span></a></ButtonToolbar>)
	    return (
		<div id="" style={{padding:'35px 20px'}} className="row">
			{errormessage}
			<form onSubmit={this.walletForm} >
				{title}
				
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					{walletbuttons}
					<div key="adderror23" className="adderror" style={{display:'none'}}></div>
					<div key="addsuccess23" className="addsuccess " style={{display:'none'}}></div>
				</div>
				<div className="clearfix"></div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={!this.state.name ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-md coinstamp"><div style={{width:55,marginLeft:-5}}>Name</div></span>
						<input type="text" name="name" valueLink={this.linkState('name')} ref="aw-name" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={!this.state.coin ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-md coinstamp"><div style={{width:55,marginLeft:-5}}>Coin</div></span>
						<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span>
						<input type="text" name="coin" valueLink={this.linkState('coin')} ref="aw-coin" className="form-control coinstamp input input-labelled input-faded ui-autocomplete-input" autoComplete="off"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp"><div style={{width:55,marginLeft:-5}}>Stamp</div></span>
						<input type="text" name="coinstamp" defaultValue={this.props.config.wally.coinstamp} ref="aw-coinstamp" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>Fiat</div>
						</span>
						<select name="currency" value={this.props.config.wally.currency} ref="aw-currency" className="form-control coinstamp input-labelled input-faded">
						<option value="usd">USD</option>
						<option value="eur">EUR</option>
						</select>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>Ticker</div>
						</span>
						<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span>
						<input type="text" name="cointicker" defaultValue={this.props.config.wally.cointicker} ref="aw-cointicker" className="form-control coinstamp input input-labelled input-faded ui-autocomplete-input" autoComplete="off"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>Api</div>
						</span>
						<select name="coinapi" value={this.props.config.wally.coinapi} ref="aw-coinapi" className="form-control coinstamp">
						<option value="rpc" >rpc</option>
						</select>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={!this.state.address ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-md coinstamp">
						<div style={{width:55,marginLeft:-5}}>Host</div></span>
						<input type="text" name="address"  valueLink={this.linkState('address')}  ref="aw-address" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>SSL</div>
						</span>
						<select name="isSSL" value={this.props.config.wally.isSSL} ref="aw-ssl" className="form-control coinstamp">
						<option value="0">No</option>
						<option value="1">Yes</option>
						</select>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}> CA File </div>
						</span>
						<input type="text" name="ca" defaultValue={this.props.config.wally.ca} ref="aw-ca" placeholder="full file path" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={(this.state.port) ? 'form-group input-group':'form-group input-group has-error'}>
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}> Port </div>
						</span>
						<input type="number" name="port" valueLink={this.linkState('port')}  ref="aw-port"  className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={(this.state.apiuser || this.state.apikey || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}>
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}> User</div>
						</span>
						<input type="text" name="apiuser"  valueLink={this.linkState('apiuser')}  ref="aw-apiuser" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={((this.state.apipassword && !this.props.config.wally.key) || (this.state.apikey ) || this.props.config.wally.key) ? 'form-group input-group':'form-group input-group has-error'}>
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-8,marginRight:3}}> Pass or Pin</div>
						</span>
						<input type="text" name="apipassword"  valueLink={this.linkState('apipassword')}  ref="aw-apipassword" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className={(!this.state.apiuser && !this.state.apikey && !this.props.config.wally.key) ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}> API Key</div>
						</span>
						<input type="text" name="apikey"  valueLink={this.linkState('apikey')}  ref="aw-apikey" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className='form-group input-group'>
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>Watch</div>
						</span>
						<select onChange={this.changeWatch} name="watching" defaultValue={this.props.config.wally.watching} ref="aw-watching" className="form-control coinstamp">
						<option value="0">No</option>
						<option value="1">Yes; by timer</option>
						<option value="2">Yes; by watching a file</option>
						</select>
					</div>
				</div>
				<div className={this.props.config.wally.watching === 1 ? "col-sm-10 col-sm-offset-1 col-md-10 watchInterval  ":"col-sm-10 col-sm-offset-1 col-md-10 watchInterval nodisplay "}>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>  Timer </div>
						</span>
						<input type="text" name="interval" defaultValue={this.props.config.wally.interval} ref="aw-interval" placeholder="interval time" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className={this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}> Path </div>
						</span>
						<input type="text" name="watchpath" defaultValue={this.props.config.wally.watchpath} ref="aw-watchpath" placeholder="file path without trailing slash (\)" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className={this.props.config.wally.watching === 2 ? "col-sm-10 col-sm-offset-1 col-md-10 watchWatch  ":"col-sm-10 col-sm-offset-1 col-md-10 watchWatch nodisplay "}>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-md coinstamp">
							<div style={{width:55,marginLeft:-5}}>  File </div>
						</span>
						<input type="text" name="watchfile" defaultValue={this.props.config.wally.watchfile} ref="aw-watchfile" placeholder="interval time" defaultValue="wallet.dat" className="form-control coinstamp input input-labelled input-faded"/>
					</div>
				</div>
				<div className="col-sm-10 col-sm-offset-1 col-md-10">
					<div className="form-group">
						<ButtonToolbar >
						<input type="hidden" name="key" ref="aw-key" value={this.props.config.wally.key} />
						<button type="submit"  disabled={!this.state.validated ? 'disabled' : ''}  className="addwalletbutton btn  awbutton">{this.state.requesting ? (this.props.config.wally.key ? 'Updateing Wallet' : 'Ading Wallet...') : (this.props.config.wally.key ? 'Update Wallet' : 'Add Wallet')}</button>
						<a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet }  className="btn btn-default btn-sm pull-right"><span>Cancel</span></a> 
						</ButtonToolbar >
					</div>
				</div>
				<div className="clearfix"></div>
			</form>
                <div className="clearfix"></div>
                </div>			
		
	    );
	}
});
//update copies add... go figure
WalletUI.update = WalletUI.add;

//wallet dashboard component
WalletUI.dashboard = React.createClass({
	getInitialState: function() {
		
		return {mounted:false,ready:this.props.ready,modals:{encryptModal:false}};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		snowlog.log('dashboard will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({data:resp.data,mounted:true,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		snowlog.log('dashboard did update',this.props)
		snowUI.watchLoader();
	},
	componentDidMount: function() {
		var _this = this
		snowlog.log('dashboard did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,mounted:true}) })
		
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	getData: function (props,cb) {
		snowlog.log('data',props)
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
		
		snowlog.log('wallet dashboard component',this.state.mounted)
		
		if(this.state.mounted) {
			var data = this.state.data;
			
			var loop = (data instanceof Object) ? Object.keys(data) : [];
			var mystatus = loop.map(function(k,v) {
		
				return (
					<div key={k} className="col-xs-12 col-sm-6 col-md-6">
						<div className="snow-status snow-block">
							<div className="snow-block-heading">
								<p>{k}</p>
							</div>
							<div className="snow-status-body">
								<p>{data[k]}</p>
							</div>
						</div>
					</div>
				);
			}); 

			var lockdiv;
			if(this.props.config.locked && !this.props.config.unlocked) {
				lockdiv = (
					 <div id="unlockwalletbutton">
					    Your wallet is locked
					   <div>
						<a onClick={snowUI.methods.modals.open.unlockWallet} className="k"><span>Unlock Wallet</span></a>
					   </div><div>	
						<a   onClick={snowUI.methods.hrefRoute} href={ snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase'}  className=""><span>Change Wallet Passphrase</span></a>
					   </div>	
					   
					 </div>
				)
			} else if(this.props.config.unlocked) {
				lockdiv = (
				
					<div id="unlockwalletbutton">
					    <p>Your wallet is unlocked for <span className="locktimer" /> seconds.</p>
					    <ButtonToolbar>
						
						<a   onClick={snowUI.methods.hrefRoute} href={ snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase'}  className=""><span>Change Wallet Passphrase</span></a>
						
					    </ButtonToolbar>
					 </div>
				)
				
			} else if(this.props.config.lockstatus === 2) {
				lockdiv = (
					<div id="encryptwallet" >
						<div id="encryptwalletbutton" >
							<p>Your wallet is not secure. Anyone with access to a copy of <kbd>wallet.dat</kbd> can send coin without using a passphrase.</p>
							<a  onClick={snowUI.methods.hrefRoute} href={ snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase'} className="">Set Passphrase Now</a>
						</div>
					</div>
				)
			}
			return (
			<div className="snow-dashboard">
				<div className="page-title">
					Dashboard
				</div>
				<div className="snow-block snow-balance">
					<div className="snow-block-heading">
						<p>balance</p>
					</div>
					<div className="snow-balance-body">
						<p>{data.balance} <span className="coinstamp">{this.props.config.wally.coinstamp} </span></p>
					</div>
				</div>
				<div className="col-xs-12 col-sm-6 col-md-6">
					<div className="snow-block-lg snow-options">
						<div className="snow-block-heading">
							<p>wallet options</p>
						</div> 
						<div className="snow-block-body"> 
							<div><a  onClick={snowUI.methods.hrefRoute} href={ snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/backup'}  className="backupwalletbutton text-muted">Backup Wallet</a></div>
							<div><a  onClick={snowUI.methods.hrefRoute} href={ snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/update'} className="updatecoin">Update {this.props.config.wally.name.toUpperCase()}  	</a></div> 
						</div>
					</div>
				</div>
				<div className="col-xs-12 col-sm-6 col-md-6">
					<div className="snow-block-lg snow-options">
						<div className="snow-block-heading">
							<p>wallet lock status</p>
						</div>
						<div className="snow-block-body">
							{lockdiv}
							
							
						</div>
						
					</div>
				</div>
				<div className="clearfix" />
				<div className="snow-status">
					{mystatus}
				</div>
			</div>			

			);
		} else {
			return(<div />)
		}
	}
});
//overview list component
WalletUI.send = React.createClass({
	getInitialState: function() {
		
		var _this = this
		
		return {requesting:false,mounted:false,ready:this.props.ready,modalAddressBook:false};
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		snowlog.log('send will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({accounts:resp.accounts,data:resp.data,snowmoney:resp.snowmoney,mounted:true,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		snowlog.log('send did update',this.props)
		snowUI.watchLoader();
		$('[rel=popover]').popover();
		$('.bstooltip').tooltip()
		
	},
	componentDidMount: function() {
		
	},
	componentWillMount: function() {
		var _this = this
		snowlog.log('send did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,snowmoney:resp.snowmoney,accounts:resp.accounts,mounted:true}) })
		$('.snow-send #changeamountspan').tooltip('destroy');
		$('.snow-send #sendcoinamount').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip('destroy');
		$('.snow-send #convamount').html(' ')
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUpdate: function() {
		$('.snow-send #changeamountspan').tooltip('destroy');
		$('.snow-send #sendcoinamount').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip('destroy');
		$('.snow-send #convamount').html(' ')
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
		
	},
	getData: function (props,cb) {
		snowlog.log('send data',props)
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
	addressBook: function(e) {
		
		var url= "/api/snowcoins/local/contacts",
			  data= { wallet:this.props.config.wally.key},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			if(resp.success === true) {
				_this.setState({adsressBookHtml:resp.html,modalAddressBook:true});
			} else {
				snowUI.flash('error',resp.error,3500)
				
			}
		})
		return false
	},
	saveAddressForm: function(e) {
		console.log('change save address');
		var fields = $('#sendcoinshowname');
		if(fields.css('display') === 'none') {
			fields.toggle(400);
		} else {
			fields.toggle(false);
		}
		
	},
	watchAmount: function(e) {
		
		var currentwally = this.props.config.wally;
		var snowmoney = this.state.snowmoney;
		
		var getfrom=$('.snow-send #snowchangefrom').attr('data-snowticker');
			
		var enteredamount=parseFloat($('.snow-send #sendcoinamount').val());
		if(isNaN(enteredamount))enteredamount=0;
		
		var stamp=$('.snow-send #snowchangefrom').attr('data-snowstamp');
		if(getfrom===currentwally.cointicker) {
			stamp='$ ';
			var to=currentwally.currency,from=getfrom;
		}
		else {
			stamp=' '+currentwally.coinstamp;
			var from=getfrom,to=currentwally.cointicker;
		}
		//console.log('keyup',from,to,snowmoney[from][to]);
		if(snowmoney[from][to] && snowmoney[from][to].price) {
					
			showvalue=snowmoney[from][to].price * enteredamount;
			if(to==='usd' || to==='eur'){
				$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
				showvalue=parseFloat(showvalue.toFixed(2));
			}
			else {
				$('.snow-send #sendcointrueamount').val(showvalue.toFixed(8).replace(/\.?0+$/, ""));
				showvalue=parseFloat(showvalue.toFixed(8));
				
			}
			$('.snow-send #changeamountbefore').text('');
			$('.snow-send #changeamountafter').text('');
			if(to==='usd')$('.snow-send #changeamountbefore').text(stamp);
			else $('.snow-send #changeamountafter').text(' ' + stamp);
			$('.snow-send #convamount').text(parseFloat(snowmoney[from][to].price).toFixed(8).replace(/\.?0+$/, ""));
			
			$('.snow-send #changeamount').text(showvalue );
			
		}
		else {
			$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
		}
		$('.snow-send #convamountspan').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip({title:'1 ' + from + ' to ' + to + ' equals '}).tooltip('show');				
		var balspan = $('.snow-send .snow-balance-body').find('span').first(),
			availbal = parseFloat($('.snow-send #snow-balance-input').val()),
			minus = $('.snow-send #sendcointrueamount').val(),
			changebalance = availbal - parseFloat(minus);
			
		balspan.text(changebalance.formatMoney(8,',','.'));
		
	},
	watchTicker: function(e) {
		
		var currentwally = this.props.config.wally;
		var snowmoney = this.state.snowmoney;
		
		var theLi = $(e.target).closest('li')
		
		var changeto=theLi.text();
		var changestamp=theLi.attr('data-snowstamp');
		var changeticker=theLi.attr('data-snowticker');
		var currentticker=$('.snow-send #snowchangefrom').attr('data-snowticker');
		var ddclass = 'bg-info';
		if(changeticker===currentwally.cointicker) {
			$('.snow-send #sendcoinamount').addClass('active').next().next().removeClass('active');
			$('.snow-send #changeamountspan').tooltip('destroy');
			$('.snow-send #sendcoinamount').tooltip({title:'We will send this many ' + currentwally.cointicker}).tooltip('show');
		} else {
			$('.snow-send #sendcoinamount').removeClass('active').next().next().addClass('active');
			$('.snow-send #sendcoinamount').tooltip('destroy');
			$('.snow-send #changeamountspan').tooltip({title:'We will send this many ' + currentwally.cointicker}).tooltip('show');
			
		}
		if(changeticker!=currentticker) {
			$('.snow-send #snowchangefrom').attr('data-snowticker',changeticker);
			$('.snow-send #snowchangefrom').attr('data-snowstamp',changestamp);
			$('.snow-send #changestamp').children().first().text(changeto);
			$('.snow-send #sendcoinamount').focus();
			if(changeticker==='usd' || changeticker==='eur')$('.snow-send #sendcoinamount').prop('step','0.01');
			else if(changeticker==='ltc' || changeticker==='btc')$('.snow-send #sendcoinamount').prop('step','0.001');
			else $('.snow-send #sendcoinamount').prop('step','1');
		}	
		
	},
	walletForm: function(e) {
		e.preventDefault()
		
		var currentwally = this.props.config.wally;
		
		var next=true;
		var ticker=$('.snow-send .change-coin-stamp').attr('data-snowticker');
		var amount=parseFloat($('.snow-send #sendcointrueamount').val());
		var to=$('.snow-send #sendcointoaddress').val();
		var bal=parseFloat($('.snow-send-body .snow-balance-body').text().replace(/,/g,''));
		var from=$('.snow-send #sendcoinfromaccount').val();
		//console.log('send',parseInt(amount));
		if(amount<=0 || isNaN(amount) || amount===Infinity)
		{
			$(".snow-send #sendcoinamount").parent().addClass('has-error');
			next=false;
		}
		if(to==='') 
		{
			$(".snow-send #sendcointoaddress").parent().addClass('has-error');
			next=false;
		}
		if(next===true)
		{
			snowvars.html='<div><div class="adderror" style="dispaly:none;"></div> <span class="send-modal-amount">'+parseFloat(amount).formatMoney(8)+'</span><span class="coinstamp">'+currentwally.coinstamp+'</span></div><div class="send-modal-text"> to address<p><strong>'+to+'</strong></p>from account<p class="send-modal-account1"><strong>'+from+'</strong></p><p><span class="snow-balance-span1" style="font-weight:bold">'+(bal).formatMoney(8)+'</span> <span class="coinstamp">'+currentwally.coinstamp+' wallet balance after send</span><div id="3456756" style="display:none;">to='+to+'<br />&account='+from+'<br />&amount='+amount+'<br />&checkauth={generate-on-submit}<br />&sendnow=yes</div></p></div>';
			snowvars.buttons=$('#confirmbuttons').html();
			snowvars.unlockme=$('#confirmpassphrase').html();
			snowvars.unlockbuttons='<button type="submit" id="confirmunlock" class="btn btn-warning " rel="send">Unlock Wallet</button> &nbsp;<button style="float:right;" type="button" class="btn  btn-default  pull-right" data-dismiss="modal">Cancel</button>';
			var nowtime=new Date().getTime();
			var body=(lockstatus.locked===2 || lockstatus.time>nowtime)?snowvars.html:snowvars.unlockme;
			var footer=(lockstatus.locked===2 || lockstatus.time>nowtime)?snowvars.buttons:snowvars.unlockbuttons;
			
		}
		
	},
	render: function() {
		snowlog.log('wallet send component')
		var _this = this;
		
		if(this.state.mounted) {
			
			var snowmoney = this.state.snowmoney;
			var wally = this.props.config.wally;
			var tickerlist = function() {
				var lis = [(<li key="lit" onClick={_this.watchTicker} className="change-coin-stamp" role="presentation" data-snowstamp={_this.props.config.wally.coinstamp} data-snowticker={_this.props.config.wally.cointicker}><a> {_this.props.config.wally.cointicker.toUpperCase()}</a></li>)]
				if (snowmoney['usd'][wally.cointicker] && snowmoney['usd'][wally.cointicker].price) 
					lis.push(<li key="lit1" onClick={_this.watchTicker} role="presentation" data-snowstamp="USD" data-snowticker="usd" className="change-coin-stamp"><a>USD</a></li>)
				if (snowmoney['eur'][wally.cointicker] && snowmoney['eur'][wally.cointicker].price) 
					lis.push(<li key="lit2" onClick={_this.watchTicker} role="presentation" data-snowstamp="EUR" data-snowticker="eur" className="change-coin-stamp"><a>EUR</a></li>)			
				if (snowmoney['btc'][wally.cointicker] && snowmoney['btc'][wally.cointicker].price) 
					lis.push(<li key="lit3" onClick={_this.watchTicker} role="presentation" data-snowstamp="BTC" data-snowticker="btc" className="change-coin-stamp"><a>BTC</a></li>)
				if (snowmoney['ltc'][wally.cointicker] && snowmoney['ltc'][wally.cointicker].price) 
					lis.push(<li key="lit4" onClick={_this.watchTicker} role="presentation" data-snowstamp="LTC" data-snowticker="ltc" className="change-coin-stamp"><a>LTC</a></li>)
				if (wally.cointicker!='doge' && snowmoney['doge'][wally.cointicker] && snowmoney['doge'][wally.cointicker].price) 
					lis.push(<li key="lit5" onClick={_this.watchTicker} role="presentation" data-snowstamp="doge" data-snowticker="doge" className="change-coin-stamp"><a>DOGE</a></li>)
				return lis
			}
			
			if(this.state.accounts instanceof Array) {
				var accs =  this.state.accounts.map(function(v) {
					return (
						<option key={v.name} value={v.name}>{v.name}</option>
					);   
				});
					    
			} else {
				var accs = '<option value="">no accounts found</option>'
			}
			var param = {from:{},to:{}}
			var pFrom = _this.props.config.params.indexOf('from'),
				pTo = _this.props.config.params.indexOf('to');
			param.from.account = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			param.from.address = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			param.to.address = pTo!==-1 ? _this.props.config.params[pTo+1] : '';	
			
			return (
				<div>
				<div id="snow-send" className="snow-send bs-example">
					<div className="col-xs-12 col-sm-offset-1 col-sm-10 col-md-10 col-lg-10">
						<div id="prettysuccess" style={{display:'none'}}>
							<div className="alert alert-success alert-dismissable">
								<button data-dismiss="alert" aria-hidden="true" className="close">×</button>
								<p></p>
							</div>
						</div>
					<div id="prettyerror" style={{display:'none'}}>
						<div className="alert alert-danger alert-dismissable">
							<button data-dismiss="alert" aria-hidden="true" className="close">×</button>
							<p></p>
						</div>
					</div>
					<form  onSubmit={this.walletForm} id="snowsendcoin" className="snow-block-lg">
					<div className="snow-block-heading"></div>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"> 
							<div className="dropdown">
								<a id="snowchangefrom" data-toggle="dropdown" data-snowstamp={_this.props.config.wally.coinstamp} data-snowticker={_this.props.config.wally.cointicker} className="dropdown-toggle">
									<span id="changestamp">{_this.props.config.wally.cointicker.toUpperCase()} </span>&nbsp; <span className="caret"></span>
								</a>
								<ul role="menu" aria-labelledby="dda2" className="dropdown-menu">
									{tickerlist()}						
								</ul>
							</div>
						</span>
						<span id="convamountspan" data-toggle="tooltip"  data-placement="top" data-container="#snow-send" className="input-group-addon input-group-sm coinstamp bstooltip" > 
							<span id="convamount" ></span>
						</span>
						<input required="required" type="text" pattern="[-+]?[0-9]*[.,]?[0-9]+" id="sendcoinamount" name="sendcoinamount" placeholder="Amount" data-toggle="tooltip" data-placement="top"  data-container="#snow-send" className="form-control coinstamp bstooltip watchme active" title="We will send this amount" onChange={_this.watchAmount} onKeyUp={_this.watchAmount} onFocus={_this.watchAmount} />
						<input id="sendcointrueamount" type="hidden" value="0" />
						
						<span id="changeamountspan" data-toggle="tooltip" data-placement="top" data-container="#snow-send" className="input-group-addon input-group-sm coinstamp watchme" > 
							
							<span id="changeamountbefore">$ </span>
							<span id="changeamount" >0</span>
							<span id="changeamountafter"></span>
						</span>
					</div>
					<div style={{textAlign:'right',marginTop:-5}}><a rel="popover" data-container="body" data-toggle="popover" data-placement="left" data-html="true" data-content={"The left bookend selects the currency you want to enter. The right bookend will show you a converted amount.   <br /><br /> Select " + _this.props.config.wally.cointicker.toUpperCase() + " to see a conversion to " + _this.props.config.wally.currency.toUpperCase() + ". You will send the amount entered in the blue box<br /><br /> Select another currency to convert the entered amount to " + _this.props.config.wally.cointicker.toUpperCase() + ". The right bookend will be blue and the amount you send. "} className="helppopover">help</a></div>
					<div style={{textAlign:'left'}} className="snow-send-body">
						<div className="snow-balance-body"> 
							<span>{parseFloat(_this.state.data.balance).formatMoney()}</span>
							<input id="snow-balance-input" type="hidden" value={parseFloat(_this.state.data.balance)} /> <span style={{color:'#ccc'}} className="coinstamp"> {_this.props.config.wally.coinstamp} &nbsp; after sending</span>
						</div>
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp">From</span>
						<select id="sendcoinfromaccount" name="sendcoinfromaccount" className="form-control coinstamp" defaultValue={param.from.account}>
							{accs}
						</select>
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp">To</span>
						<input required="required" id="sendcointoaddress" name="sendcointoaddress" placeholder="Coin Address" defaultValue={param.to.address} className="form-control coinstamp" />
						<span  style={{cursor:'pointer'}} onClick={_this.addressBook} className="input-group-addon input-group-sm glyphicon glyphicon-user"></span>
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp">
							<input type="checkbox" id="sendcoinsaveaddr" value="save" onChange={_this.saveAddressForm} />
						</span>
						<label  style={{textAlign:'left'}} className="form-control coinstamp">Save this address to my contacts</label>
					</div>
					<div id="sendcoinshowname" style={{display:'none'}} className="form-group input-group bg-info">
						<span className="input-group-addon input-group-sm coinstamp">Name</span>
						<input id="sendcoinaddressname" name="sendcoinaddressname" placeholder="name for address" value="" className="form-control coinstamp" />
					</div>
					<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Message </span>
					<input id="sendcointomessage" name="sendcointomessage" placeholder="message" value="" className="form-control coinstamp" />
					</div>
					<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Memo</span>
					<input id="sendcoinmemo" name="sendcoinmemo" placeholder="memo" value="" className="form-control coinstamp" />
					</div>
					<div className="form-group">
						<button type="submit" id="buttonsend" className="btn btn-sm snowsendcoin">Send Coin</button>
						
					</div>
					<div className="clearfix"></div>
					</form>
					</div>
					
					<div className="clearfix"></div>
				</div>		
				{snowModals.addressBook.call(this)}
			</div>
		    );
		} else {
			return (<div />)
		}
	}
});
//backup
WalletUI.backup = React.createClass({
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
		
		snowlog.log('backup wallet')
		
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
	    
		var encrypt = function(){ if(_this.props.config.lockstatus === 2 ) return (<button type="button" onClick={function(){snowUI.methods.valueRoute(snowPath.wallet + '/' + _this.props.config.wallet + '/passphrase')}}  className="btn btn-info pull-right" >Set Passphrase Now</button> ); else return '' }
	   
		snowlog.log('backup component')
	    
	    
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
	
		var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+this.props.config.wally.key+'.dat.bak';
	    
		return (
		<div  style={{padding:'5px 20px'}} >
			<div className="col-xs-12 ">
				<h4 className="profile-form__heading">{"Backup " + this.props.config.wally.name}</h4>
			</div>	
			<div className="col-sm-10 col-sm-offset-1 col-md-10">
				<form id="backupform"  onSubmit={this.request}>
					<div id="backupdiv">
						<div style={{display:'none'}} className="adderror"></div>
						<div style={{display:'none'}} className="addsuccess"></div>
						<div role="form" className="row">
							<p> 
								Enter an optional directory without trailing slash{'(/)'}. 
							</p>
							<p> Your wallet decides how to process the file.  For RPC a backup is created where the RPC server is.   </p>
						</div>
						<div role="form" className="row">
							<div className={!this.state.snowbackuplocation  ? 'form-group input-group ':'form-group input-group'}>
								<span className="input-group-addon input-group-md coinstamp"><div style={{width:70,marginLeft:-5}}>Directory</div></span>
								<input id="snowbackuplocation" ref="snowbackuplocation" placeholder="/remote/path" className="form-control coinstamp"  valueLink={this.linkState('snowbackuplocation')}   />
							</div>
							<div className={!this.state.snowbackupname  ? 'form-group input-group has-error':'form-group input-group'}>
								<span className="input-group-addon input-group-md coinstamp"><div style={{width:70,marginLeft:-5}}>File Name</div></span>
								<input id="snowbackupname" ref="snowbackupname" placeholder={fname}  className="form-control coinstamp"  valueLink={this.linkState('snowbackupname')}   />
							</div>
							<div className="form-group">
								<ButtonToolbar>
									<button  disabled={(this.state.requesting ||  this.state.snowbackupname  ) ? '' : 'disabled'}  id="backupwalletsubmit" className="btn " rel="backupwalletsubmit">{this.state.requesting ? 'Backing Up...' : 'Backup'}</button>
								
									<a type="button" onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + ''}   className="btn btn-default pull-right" >Cancel</a>
									{encrypt()}
								</ButtonToolbar>
							</div>
						</div>
						
					</div>
					
				</form>
			</div>	
		</div>				
		
	    );
	}
});
//change passphrase
WalletUI.passphrase = React.createClass({
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
	    
	    snowlog.log('change pass component',isP)
	    return (
		<div  style={{padding:'5px 20px'}} >
			<div className="col-xs-12 ">
				<h4 className="profile-form__heading">{"Change passphrase for " + this.props.config.wally.name}</h4>
			</div>
				
			<div className="col-sm-10 col-sm-offset-1 col-md-10">
				<form id="changewalletpassform"  onSubmit={this.request}>
					<div style={{display:'none'}} className="adderror"></div>
					<div style={{display:'none'}} className="addsuccess"></div>
					<p>Enter your current passphrase first</p>
					<div className={!this.state.currentphrase ? 'form-group input-group has-error':'form-group input-group'}> 
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:70,marginLeft:-5}}>Passphrase</div></span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="" id="currentphrase" ref="currentphrase" placeholder="current  passphrase" className="form-control coinstamp"  valueLink={this.linkState('currentphrase')}  />
					</div>
					<p>Enter your new passphrase and confirm</p>
					<div className={!this.state.changephrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}> 
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:70,marginLeft:-5}}>Passphrase</div></span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="" id="changephrase" ref="changephrase" placeholder="new passphrase" className="form-control coinstamp"  valueLink={this.linkState('changephrase')} />
					</div>
					<div className={!this.state.confirmphrase  || this.state.confirmphrase !== this.state.changephrase ? 'form-group input-group has-error':'form-group input-group'}> 
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:70,marginLeft:-5}}>Confirm</div></span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="" id="confirmphrase" ref="confirmphrase" placeholder="confirm passphrase" className="form-control coinstamp" valueLink={this.linkState('confirmphrase')}  />
					</div>
					
					<p style={{textAlign:'right'}}><a onClick={snowUI.methods.togglePassFields}> {toggle} </a></p>
					<div className="form-group">
						<button    disabled={(this.state.requesting ||  !this.state.currentphrase  || (this.state.changephrase  !== this.state.confirmphrase )) ? 'disabled' : ''}  id="confirmchangepassphrase" className="btn " >{this.state.requesting ? 'Changing...' : 'Change Passphrase'}</button>
						<a type="button"  onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + ''}   className="btn btn-default pull-right" >Cancel</a>
					</div>
				</form>
			</div>	
		</div>				
		
	    );
	}
});
//change passphrase
WalletUI.setpassphrase = React.createClass({
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
		snowlog.log('encrypt wallet')
		
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
	    snowlog.log('change pass component')
	    return (
		<div  style={{padding:'5px 20px'}} >
			<div className="col-xs-12 ">
				<h4 className="profile-form__heading">{"Set passphrase for " + this.props.config.wally.name}</h4>
			</div>
				
			<div className="col-sm-10 col-sm-offset-1 col-md-10">
				<form id="setwalletpassform" onSubmit={this.request}>
					<div style={{display:'none'}} className="adderror"></div>
					<p style={{fontWeight:'bold'}} >Your wallet software will have to stop to encrypt.  Be sure you can restart it before you continue.</p>
					
					<div className={!this.state.epassword || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:70,marginLeft:-5}}>Passphrase</div></span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="required" id="epassword" ref="epassword" placeholder="enter pass phrase" className="form-control coinstamp"  valueLink={this.linkState('epassword')} />
					</div>
					<div className={!this.state.econfirm  || this.state.epassword  !== this.state.econfirm ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:70,marginLeft:-5}}>Confirm</div></span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="required" id="econfirm" ref="econfirm" placeholder="confirm pass phrase" className="form-control coinstamp"  valueLink={this.linkState('econfirm')}  />
					</div>
					<div className="form-group">
					
						<p style={{textAlign:'right'}}><a onClick={snowUI.methods.togglePassFields}> Toggle Password Fields </a></p>
					
						<p>Do <strong>NOT</strong> lose this pass phrase or you will lose your coin.  To be secure you must delete all your old unencrypted backups.</p> 
					
						<ButtonToolbar>
							
							<a  type="button"  onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + ''}   className="btn btn-default pull-right">Cancel</a>
							
							<button     disabled={(this.state.requesting || !this.state.epassword || this.state.epassword  !== this.state.econfirm ) ? 'disabled' : ''} id="confirmencrypt" rel="confirmencrypt" className="btn  pull-left">{this.state.requesting ? 'Encrypting... be patient' : 'Encrypt Wallet'}</button> 
							
						</ButtonToolbar>
					</div>
				
				</form>
			</div>	
		</div>				
		
	    );
	}
});

//overview list component
WalletUI.accounts = React.createClass({
	_remember: {},
	getInitialState: function() {
		
		var _this = this
		
		snowUI.methods.wallet.accounts = {
			newAddressCall: function (wallet,moon,account) {
				var _this = this
				snowlog.log('grab new address')
				var time=new Date()-2;
				var url = "/api/snowcoins/local/wallet",
					data = { wallet:wallet,moon:moon,account:account,createaddress:'now',checkauth:time},
					_this = this;
				$('.dynamic').fadeOut('slow').html('')
				snowUI.ajax.GET(url,data,function(resp) {
					console.log(resp)
					if(resp.success === true) {
						_this.setState({userSettings:resp.userSettings,data:resp.data},function() {
							$('[data-snowaddress="'+resp.info.newaddress+'"]').addClass('bs-success')
							snowUI.flash('success',resp.msg,3500)
							
							setTimeout(function() {
								$('[data-snowaddress="'+resp.info.newaddress+'"]').removeClass('bs-success')
							},12000);
						})
						
					} else {
						snowUI.flash('error',resp.error,3500)
					}
				})
				return false
			}.bind(_this),
			moveToAccountCall: function (form) {
				snowlog.log('move coin to account')
				var time=new Date()-2;
				var mybtn = $('#'+form+' button')
				var movefrom = $('#'+form+' #movefrom').val()
				var moveto = $('#'+form+' #moveto').val()
				var moveamt = $('#'+form+' #moveamount').val()
				var _this = this,
					url = "/api/snowcoins/local/wallet",
					data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,toaccount:moveto,fromaccount:movefrom,amount:moveamt,movecoin:'now',checkauth:time};
				
				mybtn.prop('disabled', true)
				var oldval = mybtn.text()
				mybtn.text('Moving Coin...')
				snowUI.ajax.GET(url,data,function(resp) {
					console.log(resp)
					if(resp.success === true) {
						_this.setState({userSettings:resp.userSettings,data:resp.data},function() {
							snowUI.flash('success',resp.msg,3500)
							$('.dynamic').fadeOut('slow').html('')
							var minus = $('.eachaccount.'+movefrom.replace(' ','SC14')).find('.balance');
							minus.addClass('bs-danger')
							_this._remember.minus = minus.html()
							minus.html('move '+moveamt+'')
							
							var plus = $('.eachaccount.'+moveto.replace(' ','SC14')).find('.balance');
							plus.addClass('bs-success')
							_this._remember.plus = plus.html()
							plus.html('get '+moveamt)
							
							console.log('move coin',movefrom.replace(' ','SC14'))
							setTimeout(function() {
								
								minus.html(_this._remember.minus)
								plus.html(_this._remember.plus)
							},8000);
							setTimeout(function() {
								$('.eachaccount.'+movefrom.replace(' ','SC14')).find('.balance').removeClass('bs-danger')
								$('.eachaccount.'+moveto.replace(' ','SC14')).find('.balance').removeClass('bs-success')
								
							},12000);
							
						})
					} else {
						mybtn.prop('disabled', false);
						mybtn.text(oldval)
						snowUI.flash('error',resp.error.error.message,3500)
						
					}
				})
				return false
			}.bind(_this),
		}
		
		return {shortcuts:{},genericModal:false,modal:{},showHelp:false,requesting:false,mounted:false,ready:this.props.ready,modals:{addAddressModal:false},openMore:{},userSettings:{}};
		
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		snowlog.log('accounts will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({userSettings:resp.userSettings,data:resp.data,mounted:true,shortcuts:resp.shortcuts,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		snowlog.log('accounts did update',this.props)
		snowUI.watchLoader();
		$('[rel=qrpopover]').popover();
	},
	componentDidMount: function() {
		var _this = this
		snowlog.log('accounts did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts,mounted:true}) })
		$(document).on('click','.dropzone',function(e) {
			_this.dropZone(e)
			snowlog.log('drop address')
		})
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	statics: {
		
	},
	getData: function (props,cb) {
		snowlog.log('account data',props)
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
	newAddress: function(e) {
		e.stopPropagation()
		var EA = $(e.currentTarget).closest('.eachaccount')
		
		var f = EA.find('.dynamic')
		var snowkey = EA.attr('data-snowaccount')
		
		$('.dynamic').not(f).hide();
	
		f.html('<button class="btn btn-info btn-sm" onClick="snowUI.methods.wallet.accounts.newAddressCall(\''+this.props.config.wallet+'\',\''+this.props.config.moon+'\',\''+snowkey+'\')">'+snowtext.accounts.new.createAddressBtn+'</button> &nbsp; <a  type="button"  onClick="$(\'.eachaccount.'+snowkey.replace(' ','SC14')+'\').find(\'.dynamic\').toggle(\'slow\').html(\'\')"  class="btn btn-default btn-sm">Cancel</a>')
		f.toggle(400)
	},
	moveToAccount: function(e) {
		var _this = this;
		
		var EA = $(e.currentTarget).closest('.eachaccount')
		
		var f = EA.find('.dynamic')
		
		var snowkey = EA.attr('data-snowaccount').replace(' ','SC14')
		
		$('.dynamic').not(f).hide();
		
		var acc = e.currentTarget.dataset.snowtoacc ? 'to  ' + e.currentTarget.dataset.snowtoacc:''
		if(e.currentTarget.dataset.snowamount) {
			var amt = ('<div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">Amount</span><input  id="moveamount"  placeholder="'+e.currentTarget.dataset.snowamount+'" class="form-control coinstamp" /></div>')
			var buttonText = this.state.requesting ? 'Moving '+e.currentTarget.dataset.snowamount+' coin to ' + e.currentTarget.dataset.snowtoacc : 'Move  coin ' + acc
			var title = 'Move Coin Between Accounts'
		} else {
			var buttonText = this.state.requesting ? 'Moving '+e.currentTarget.dataset.snowfromacc+' to ' + e.currentTarget.dataset.snowtoacc : 'Move ' + acc
			var title = 'Move Address'
			var amt = ''
		}
		
		var buttonAble = this.state.requesting ? 'disabled' : ''
		var random = Math.random().toString(36).slice(2)
		var html = ('<div id="'+random+'"><div class="col-xs-12 "><h5 class="profile-form__heading">' + title + '</h5></div><div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">From</span><input readonly="readonly" id="movefrom" placeholder="from" value="'+e.currentTarget.dataset.snowfromacc+'" class="form-control coinstamp" /></div>')
		
		var readonly = e.currentTarget.dataset.snowtoacc !== '' ? 'readonly="readonly"':''
		
		html+=('<div class="form-group input-group"><span class="input-group-addon input-group-sm coinstamp">To</span><input ' + readonly + ' name="to" id="moveto" value="'+e.currentTarget.dataset.snowtoacc+'" class="form-control coinstamp" /></div>')
		
		
		
		html+=(amt + '<button class="btn btn-info btn-sm" ' + buttonAble + '  onClick="snowUI.methods.wallet.accounts.moveToAccountCall(\''+random+'\')">' + buttonText + '</button><a  type="button"  onClick="$(\'.eachaccount.'+snowkey+'\').find(\'.dynamic\').toggle(\'slow\').html(\'\')"  class="btn btn-default pull-right">Cancel</a></div>')
		
		f.html(html)
		
		if(f.css('display')!=='block')f.toggle('slow')
		
	},
	newAccount: function(e) {
		var newaccount = prompt(snowtext.accounts.new.promptAccount)
		if(newaccount) {
			this.newAccountCall(newaccount)
		}
	},
	newAccountCall: function(account) {
		var _this = this
		snowlog.log('new account call')
		
		var fixed = account.replace(' ','SC14')
		
		var time=new Date()-2;
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,account:account ,createaddress:'now',checkauth:time},
			_this = this;
		snowUI.ajax.GET(url,data,function(resp) {
			
			if(resp.success === true) {
				_this.setState({data:resp.data},function() {
					snowUI.flash('success',resp.msg,3500)
					$('.eachaccount.'+fixed).find('.details').addClass('bs-success')
					setTimeout(function() {
						$('.eachaccount.'+fixed).find('.details').removeClass('bs-success')
					},12000);	
					
				})
			} else {
				snowUI.flash('error',resp.error,3500)
			}
		})
		return false
	},
	closeDynamic: function() {
		$('.dynamic').hide().html('');
		$('.dynamic').removeClass('open');
	},
	closeAll: function() {
		$('.dynamic').hide().html('');
		$('.addresses').hide();
		$('.addresses,.dynamic').removeClass('open');
	},
	openAll: function() {
		$('.addresses').hide();
		$('.addresses').toggle('slow');
		$('.addresses').addClass('open');
	},
	_showAllAddresses: false,
	toggleAllAddresses :  function() {
		if(this._showAllAddresses) {
			this._showAllAddresses = false;
			this.dropEnd()
			this.closeAll()
		} else {
			this._showAllAddresses = true;
			this.openAll()
		}
	},
	toggleAddresses: function(e) {
		e.stopPropagation()
		this.dropEnd()
		var f = $(e.currentTarget).closest('.eachaccount').find('.addresses')
		f.toggleClass('open')
		f.toggle('slow')
	},
	drop: function(e) {
		
		var f = $(e.target);
		
		if(f.hasClass('hackit') === true) {
			
			f.removeClass('hackit')
		} else {
			f.addClass('hackit')
			f.find('.dropdown-toggle').dropdown("toggle");
		}
	},
	showAddress: function(e) {
		var ea = $(e.currentTarget).closest('.eachaddress')
		var drag = ea.attr('draggable');
		if(drag === 'true') {
			ea.attr('draggable','false') 
			$(e.currentTarget).prev().css('cursor','text')
		} else {
			ea.attr('draggable','true')
			$(e.currentTarget).prev().css('cursor','move')
		}
		ea.toggleClass('bigaddress')
		ea.removeClass('bigbalance')
	},
	showBalance: function(e) {
		var ea = $(e.currentTarget).closest('.eachaddress')
		ea.toggleClass('bigbalance')
		ea.removeClass('bigaddress')
	},
	_sort: {
		sortaccount: {
			asc:'a-z',
			desc:'z-a',
			will:'desc'
		},
		sortbalance: {
			asc:'0-9',
			desc:'9-0',
			will:'asc'
		},
		sortaddresses: {
			asc:'0-9',
			desc:'9-0',
			will:'asc'
		},
	},
	sortCols: function(e) {
		
		var who = $(e.currentTarget).attr('data-snowwho')	
		
		var table = $('.eachaccount').removeClass('sortaccount sortbalance sortaddresses').addClass(who).toArray()
		
		var rows = table.sort(snowUI.comparer)
		
		if (this._sort[who].will === 'desc'){
			rows = rows.reverse()
			$(e.currentTarget).parent().find('#'+who+'by').text(this._sort[who].asc)
			this._sort[who].will='asc'
		} else { 
			$(e.currentTarget).parent().find('#'+who+'by').text(this._sort[who].desc)
			this._sort[who].will='desc'
		}
		var fill = $('#listaccounts')
		fill.remove('.eachaccount')
		for (var i = 0; i < rows.length; i++){fill.append(rows[i])}
	},
	setHelp: function(e) {
		this.setState({showHelp:!this.state.showHelp});
		this.showShortcut(e,true,!this.state.showHelp);
		return false;
	},
	showShortcut: function(e,force,show) {
		
		snowlog.info('show shortcut e',e);
		
		var parent = $(e.target).closest('.eachaddress');
		var account = parent.closest('.eachaccount').attr('data-snowtrueaccount')
		var address = parent.attr('data-snowaddress');
		snowlog.info(show,'show help for shortcut');
		var showhelp = show !== undefined ? show : this.state.showHelp;
		var helptext = (showhelp) ? {
			a:(<div dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.shortcut.text}} />),
			b:(<div dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.sign.text}} /> ),
			c:(<div dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.signphrase.text}} /> ),
			d:(<div className="" dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.lock.lock}} />),
			e:(<div dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.type.info}} />),
			text: 'Hide Help',
		} : {text:'Show Help'};
		
		var html2;
		if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey) {
			html2 = (<div><p>You can <a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.link} > create and add a .link account </a> to give out shortcuts that do not require you expose your wallet manager to the internet. .link will create a seperate server to communicate on and only accept requests from pre-defined source.</p></div>);
		}
		
		var html3,html4;
		if(snowUI.link.state === 'off') {
			if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey)
				html4 = <span  className="pull-left" dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.nolink.localon.replace('{link}', snowPath.share).replace('{linktext}',snowPath.share)}} />
					
			html3 = (<div className="bg-danger">
					{html4}
					<span  className="pull-right"> 
					 <span dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.nolink.linkoff}} /> 
					 <a href={snowPath.link} onClick={snowUI.methods.hrefRoute} >
						<span dangerouslySetInnerHTML={{__html: snowtext.accounts.address.moreinfo.nolink.turnon}} />
					 </a> 
					</span>
					<div className="clearfix" />
				</div>);
		}
		
		var linkname = (this.state.userSettings.linkName) ? <span className="input-group-addon "><span style={{fontSize:'16px'}}> . </span>{this.state.userSettings.linkName}<span style={{fontSize:'16px'}}> .</span></span> : <span className="input-group-addon ">{snowPath.share}/</span>
		
		snowlog.info('address, this shortcut, shortcuts',address,this.state.shortcuts[address],this.state.shortcuts);
		
		var def = this.state.shortcuts[address] ? this.state.shortcuts[address] : {sign:{}};
		var deleteme = def.apikey ? <span> <a style={{marginBottom:0,marginRight:10}} className="btn btn-danger pull-right"  onClick={this.deleteShortcut}>remove</a>  </span> : '';
		var html = 	<div>
					{html3}
					{html2}
					<form onSubmit={this.submitShortcut} id="shortcutForm">
						<div  className="form-group input-group">
							<span className="input-group-addon coinstamp">{snowtext.accounts.address.moreinfo.head.text} </span>
						
							<input type="text" name="address" id="address" value={address} onChange={function(e) { this.value = address}} className="form-control coinstamp" />
						</div>
						<div className="col-xs-12"><a className="pull-right" onClick={this.setHelp}>{helptext.text}</a></div>
						
						{helptext.a} 
						<div className="form-group input-group">
							{linkname}
							<input type="text" name="shortcut" defaultValue={def.apikey || ''} id="shortcut" placeholder={snowtext.accounts.address.moreinfo.shortcut.placeholder} className="form-control coinstamp" />
						</div>
						{helptext.b}
						<div className="form-group input-group">
							<span className="input-group-addon  coinstamp">{snowtext.accounts.address.moreinfo.pin.text}</span>
							<input type="text"  defaultValue={def.sign.pinop || ''} name="pin" id="pin" placeholder={snowtext.accounts.address.moreinfo.pin.placeholder} className="form-control coinstamp" />
						</div>
						{helptext.c}
						<div className="form-group input-group">
							<span className="input-group-addon  coinstamp">{snowtext.accounts.address.moreinfo.pinphrase.text}</span>
							<input type="text"  defaultValue={def.sign.keyphrase || ''}  name="keyphrase" id="keyphrase" placeholder={snowtext.accounts.address.moreinfo.pinphrase.placeholder} className="form-control coinstamp" />
						</div>
						
						{helptext.d} 	
						<div className="form-group input-group">
							<span  className="input-group-addon   coinstamp" style={{borderRight:'1px initial initial',paddingRight:25}}>
								{snowtext.accounts.address.moreinfo.lock.lockinput}
							</span>
								<select  defaultValue={def.sign.lock ? 'yes':'no'}  id="lock" name="lock" className="form-control coinstamp">
									<option value="no">{snowtext.accounts.address.moreinfo.lock.option.no}</option>
									<option value="yes">{snowtext.accounts.address.moreinfo.lock.option.yes}</option>
								</select>
						</div>
							
						
						{helptext.e}
						<div className="form-group input-group">
							<span className="input-group-addon input-group-sm coinstamp">{snowtext.accounts.address.moreinfo.type.text}</span>
							<select  defaultValue={def.sign.type || '1'}  name="type" id="type"  className="form-control coinstamp">
								<option value="1">{snowtext.accounts.address.moreinfo.type.option.one}</option>
								<option value="2">{snowtext.accounts.address.moreinfo.type.option.two}</option>
								<option value="3">{snowtext.accounts.address.moreinfo.type.option.three}</option>
							</select>
							
						</div>
						<div className="form-group input-group">
							<span className="input-group-addon input-group-sm coinstamp">{snowtext.accounts.address.moreinfo.expires.text}</span>
							<select  defaultValue={def.expires  || 'laina'}  name="expires" id="expires" className="form-control input input-faded" >
								<option value="laina">Never</option>
								<option value="burnonimpact">One Use Only</option>
								<option value="1">1 day</option>
								<option value="7">1 week</option>
								<option value="30">30 days</option>
								<option value="180">6 months</option>
								<option value="365">1 year</option>
							</select>
						</div>
						<div className="form-group">
							<input type="hidden" id="coin" name="coin" value={this.props.config.wally.coin}/>
							<input type="hidden" id="account" name="account" value={account}/>
							<input type="hidden" id="key" name="key" value={def.key}/>
							<input type="hidden" id="coinwallet" name="coinwallet" value={this.props.config.wally.key}/>
							<input type="hidden" id="action" name="action" value='add-offline'/>
							<button className="btn btn-primary"  disabled={(this.state.connecting) ? 'disabled' : ''}  style={{marginBottom:0}}>{(this.state.connecting) ? def.apikey ? snowtext.accounts.address.moreinfo.button.updating:snowtext.accounts.address.moreinfo.button.submitting : def.apikey ? snowtext.accounts.address.moreinfo.button.update:snowtext.accounts.address.moreinfo.button.submit}</button> 
							
							&nbsp;<a style={{marginBottom:0}} className="btn btn-default pull-right"  onClick={this.showShortcut}>cancel</a>
							{deleteme}
						</div>
					</form>
					
				</div>;
		
		var openMore = {openMore:{}};
		if(!this.state.openMore[address] || force === true)openMore.openMore[address] = html ;
		this.setState(openMore)
	
	},
	deleteShortcut: function(e) {
		var conf = {
				
			title: 'Confirm deletion of shortcut',
			body: 'Remove <b>' + $('#shortcut').val() + '</b> from  <b>' + $('#address').val() + '</b>',
			confirm: 'Delete Shortcut',
			click: this.deleteShortcutNow,
			
		}
		snowlog.info(conf)
		this.setState({genericModal:true,modal:conf});
		snowUI.flash('message','Confirm First ',5000);
		return;
	},
	deleteShortcutNow: function(e) {
		e.preventDefault();
		var key = $('#key').val(),
			addr = $('#address').val(),
			_this = this;
			
		
		snowlog.log('removeNow',key)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-unattended',wid:key}
		
		this.setState({connecting:true,genericModal:false,modal:{}});
		
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently remove " + $('#shortcut').val())
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				snowlog.info('remove shortcut resp',resp);
				if(resp.success === true) {
					//var sc = this.state.shortcuts;
					//if(addr) delete sc[addr];
								
					snowUI.flash('success','Shortcut removed',2500)
					_this.getData(_this.props,function(resp){ 
						_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
						_this.showShortcut({target:'#shortcutForm'},true);
						$('#shortcutForm')[0].reset();
						snowlog.info('removed shortcut',resp); 
					})
					
				} else {
					snowlog.warn(resp.error)
					snowUI.flash('error',resp.error,3500)
					
				}
			}.bind(this))
		} else {
			
			this.setState({connecting:false})
			
		}
		
		return false;
	},
	submitShortcut: function(e) {
		e.preventDefault();
		this.setState({connecting:true});
		
		
		var address = $('#address').val(),
			shortcut = $('#shortcut'),
			pin = $('#pin'),
			keyphrase = $('#keyphrase'),
			lock = $('#lock'),
			key = $('#key').val(),
			type = $('#type'),
			expires = $('#type'),
			btn = $(e.target).find('button').first(),
			error = false, 
			confirmBefore = [];
		
		btn.prop('disabled','disabled');
		
		if(shortcut.val().length < 1) {
			shortcut.closest('.form-group').addClass('has-error');
			error = true;
		} else {
			shortcut.closest('.form-group').removeClass('has-error');
		}
		if(!pin.val()) {
			
			confirmBefore.push('A pinop is not required but suggested.');
			
		} else if(pin.val().length < 4) {
			
			confirmBefore.push('A good pinop is 4 or more characters ' );
			
		}  
		if(keyphrase.val().length > 125) {
			pinphrase.closest('.form-group').addClass('has-error');
			error = true;
			snowUI.flash('error','Keyphrase is too long');
			
		} else if(!keyphrase.val()) {
			
			confirmBefore.push('A key phrase is not required but suggested.');
			
		} 
		if(error) {
			this.setState({connecting:false});
			btn.prop('disabled','');
			snowUI.flash('error','Please fix any errors',5000);
			return false;
		}
		if(confirmBefore.length > 0) {
			confirmBefore.push('<br />Create shortcut for ' + address + '<br />');
			var _l='';
			confirmBefore.forEach(function(v) {
				_l+=v+'<br />';
			});
			var conf = {
				
				title: 'Confirm before submitting',
				body: _l,
				confirm: key ? 'Update Shortcut':'Add Shortcut',
				click: this.addShortcut,
				
			}
			this.setState({genericModal:true,modal:conf});
			snowUI.flash('message','Please Confirm First',5000);
			return;
		}
		var conf = {
				
			title: 'Confirm shortcut action',
			body: 'Assign <b>' + shortcut.val() + '</b> to  <b>' + address + '</b>',
			confirm: key ? 'Update Shortcut':'Add Shortcut',
			click: this.addShortcut,
			
		}
		this.setState({genericModal:true,modal:conf});
		snowUI.flash('message','Please Confirm First',5000);
		return;
		
		
	},
	addShortcut: function() {
		var address = $('#address').val(),
			shortcut = $('#shortcut'),
			btn = $('#shortcutForm').find('button').first(),
			_this = this;
		
		btn.prop('disabled','');
		
		this.setState({connecting:false,genericModal:false,modal:{}});
		
		var url =  "/api/snowcoins/local/receive/setup"
		var data = $( "#shortcutForm" ).serialize();
		snowUI.ajax.POST(url,data,function(resp) {
			if(resp.success === true) {
				
				snowlog.info('shortcut saved',resp);
				var msg = resp.msg ? resp.msg : 'shortcut ' + shortcut.val() + ' added successfully';
				snowUI.flash('success',msg,3500)
				
				_this.getData(_this.props,function(resp){ 
					_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
					_this.showShortcut({target:'#shortcutForm'},true);
					snowlog.info('shortcut refreshed',resp); 
				});
				
				
			} else {
				snowlog.warn(resp)
				_this.setState({connecting:false});
				snowUI.flash('error',resp.error,3500)
				//_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		}.bind(this));
		
		return false;
	},
	render: function() {
		snowlog.log('wallet accounts component',this.state)
		var _this = this;
										
		var listaccountsli = function(account) { 
		    var p = _this.state.data.map(function(vl){
			if(vl.name!==account.name) {
				
				return (<li role="presentation" key={account.name+vl.name+'11'}>
					<a onClick={_this.moveToAccount}  data-snowkey={account.name.replace(' ','SC14')} data-snowfromacc={account.name} data-snowtoacc={vl.name} data-snowamount={account.balance} data-snowtoamount={vl.balance} role="menuitem" tabIndex="-1">{vl.name}</a>
				</li>)
			} 
		    });
		    return (
			 <ul className="dropdown-menu " role="menu" >
				<li role="presentation"><a className="snowsendfromaccountlink" onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name} role="menuitem" tabIndex="-1"> Send Coin </a></li>
				<li className="divider" role="presentation" ></li>
				<li role="presentation"><a onClick={_this.moveToAccount}  data-snowkey={account.name.replace(' ','SC14')} data-snowfromacc={account.name} data-snowtoacc='' data-snowamount={account.balance} role="menuitem" tabIndex="-1"> Move coin to a new account </a></li>
				<li className="divider" role="presentation" ></li>
				<li className="dropdown-header" role="presentation"> Move coin to account </li>
				{p}
				
				
			</ul>
		    )
		}
		var listaddresses = function(a) {
			if(typeof a.addresses === 'object') {
			    var p = a.addresses.map(function(v){
				var showme = _this.state.openMore[v.a] ? 'block' : 'none';
				var activelink = _this.state.shortcuts[v.a] ? 'shortcut' : '';
				return (<div className="col-xs-12 col-md-6 eachaddress" key={v.a} data-snowaddress={v.a} draggable="true" onDragEnd={_this.dragEnd} onDragStart={_this.dragStart} >
						
						
						<div className="send " data-placement="top" data-toggle="tooltip"   title="send coin from this address">
							<a  onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/'+ a.name + '/' + v.a} ><span className="glyphicon glyphicon-share" /></a>
						</div>
						<div className="qrcode " title="Create a .link shortcut">
							<a onClick={_this.showShortcut} className={"shortcutlink " + activelink} title="Create a .link shortcut" alt="Create a .link shortcut"> <span className="glyphicon glyphicon-globe" /></a>
						</div>
						
						<div className="address" >
							{v.a}
						</div>
						<div className="more"  onClick={_this.showAddress}>
							...
						</div>
						<div className="abalance" onClick={_this.showBalance}>
							{parseFloat(v.b).formatMoney()}<span className="coinstamp">{_this.props.config.wally.coinstamp}</span>
						</div>
						<div className="move " data-placement="top" data-trigger="hover focus" data-toggle="" title="click to activate drop zones or drag and drop on the account you want to move this address to">
							<span className="glyphicon glyphicon-move" style={{cursor:'pointer'}} onClick={_this.toggleDropZones} />
						</div>
						<div className="clearfix col-xs-12 more-info" style={{display:showme}} >{_this.state.openMore[v.a]} </div>
					</div>)    
				});
			} else {
				var p
			}
			return (<div className="clearfix">
					{p}
					<div className="col-xs-12 col-md-6 eachaddress">
						<div className="simplelink">
							<a  onClick={_this.newAddress}>&nbsp; &nbsp; {snowtext.accounts.new.createAddress} </a>
						</div>
					</div>
				</div>
				)
		}
		var list = '';
		if(this.state.data instanceof Array) {
		    list = this.state.data.map(function(account) {
			   if(typeof account.addresses === 'object') {
				   var atext = account.addresses.length === 1 ? account.addresses.length + ' ' +snowtext.accounts.address.short.singular : account.addresses.length + ' ' + snowtext.accounts.address.short.plural
				   var aclick = _this.toggleAddresses
			   } else {
				 var atext =    snowtext.accounts.new.short
				 var aclick=  _this.newAddress
				   
			   }
			   return (<div className={"eachaccount  " + account.name.replace(' ','SC14')} key={account.name.replace(' ','SC14')} data-snowtrueaccount={account.truename}   data-snowaccount={account.name} data-snowbalance={account.balance} onDrop={_this.dragDrop}  onDragOver={_this.dragOver} >
					<div className="dropdown">
						<div className="details"  onClick={aclick}  onDragLeave={_this.dragLeave} >
							<div className="account" onClick={aclick} >
								{account.name} 
								{account.truename!==account.name ? ' ('+account.truename+')':''}
							</div>
							<div className="linkline">
								<a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name}><span className="badge  snowbg4">send </span> </a>
								<a onClick={aclick} data-snowkey={account.name}><span className="badge">{atext} </span> </a> 
								<a onClick={snowUI.methods.hrefRoute} href={snowPath.root + snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}><span className="badge bs-info2"  href={snowPath.root + snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}>{snowtext.accounts.tx.text} </span> </a> 
							</div>
						</div>
						<div className="balance " onClick={_this.drop} >
							 <a className="dropdown-toggle" data-toggle="dropdown" data-container=".dropdown">{parseFloat(account.balance).formatMoney()} <span className="caret"></span> </a>
							{account.balance > 0 ? listaccountsli(account) : <ul  className="dropdown-menu " role="menu" ><li  role="presentation" style={{padding:10}}>Add some coin first</li></ul>}	 
							 
						</div>
						<div className="clearfix" />
					</div>
					<div className="clearfix" />
					
					<div className="dynamic" />
					
					<div className="clearfix" />
					
					<div className="addresses">
						
						{listaddresses(account)}
					</div>
					
					<div className="clearfix" />
			   
				  </div>) 
		    });
		}
		var modal = function() {
			return (snowModals.genericModal.call(_this,_this.state,function(){ $('button').prop('disabled','');_this.setState({connecting:false,genericModal:false}) }.bind(_this) ));
		};
		return (
		<div style={{padding:'25px 20px'}} id="snowaccountlist" >
			<div className="page-title">                                    
				Accounts
			</div>
			<div className="col-xs-12  navbar navbar-inverse" style={{textAlign:'right',fontSize:'14px'}}>
				
				<ul  className="nav  pull-right" >
					 <li className="dropdown">
						  <a href="#" id="navmenuaccounts" style={{padding:'15px 20px 17px 20px',textTransform:'uppercase'}}className="dropdown-toggle" data-toggle="dropdown">{snowtext.menu.menu.name} <span className="caret"></span></a>
						  <ul className="dropdown-menu dropdown-menu-right" role="menu">
							    <li ><a   onClick={_this.toggleAllAddresses} >Toggle Addresses</a></li>
							    <li className="divider"></li>
							    <li><a onClick={_this.sortCols} data-snowwho='sortaccount'>sort by name <span id="sortaccountby">{_this._sort.sortaccount.desc}</span></a></li>
							    <li><a  onClick={_this.sortCols} data-snowwho='sortbalance'>sort by balance <span id="sortbalanceby">{_this._sort.sortbalance.asc}</span></a></li>
							    <li><a  onClick={_this.sortCols} data-snowwho='sortaddresses'>sort by # addresses <span id="sortaddressesby">{_this._sort.sortaddresses.asc}</span></a></li>
							    <li className="divider"></li>
						  </ul>
					</li>				
				</ul>
				<ul  className="nav navbar-nav  pull-right" >
					<li><a  onClick={_this.newAccount} >{snowtext.accounts.new.account}</a></li>
				</ul>		
				
			</div>
			<div id="listaccounts">
				{list}
			</div>
			{modal()}
		</div>			

		);
	},
	zoneToggle: false,
	_dropAddress: false,
	_dropCandidate: false,
	toggleDropZones: function(e) {
		
		var _this = this
					
		if(this.zoneToggle) {
			var highlighted = this._dropCandidate
			_this.dropEnd(e)
			if($(e.currentTarget).closest('.eachaddress').attr('data-snowaddress') !== highlighted.attr('data-snowaddress'))_this.dropStart(e)
			snowlog.log('end dropping')
		} else {
			_this.dropStart(e)
			snowlog.log('start dropping')
		}
		
	},
	dropStart: function(e) {
		var highlight = $(e.currentTarget).closest('.eachaddress')
		var balance = $('.eachaccount').find('.balance')
		
		highlight.addClass('dropcandidate')
		balance.append('<div class="dropzone bstooltip" data-placement="top" data-toggle="tooltip"  data-trigger="hover focus" title="Click me to move the selected address to this account"></div>')
		
		this._dropAddress = e.currentTarget.dataset.snowaddress
		this._dropCandidate = highlight
		
		this.zoneToggle = true
		
	},
	dropEnd: function(e) {
		
		var balance = $('.eachaccount').find('.balance')
		balance.find('.dropzone').remove()
		$('.eachaddress').removeClass('dropcandidate')
		this._dropAddress = false
		this._dropCandidate = false
		
		this.zoneToggle = false
		
	},
	dropZone: function(e) {
		var _this = this
		
		var account = $(e.currentTarget).closest('.eachaccount').attr('data-snowaccount'),
			address = this._dropCandidate.attr('data-snowaddress')
			
		
		
		if($(e.currentTarget).closest('.eachaccount').find('.addresses').css('display') === 'none')$(e.currentTarget).closest('.eachaccount').find('.addresses').toggle("fast")
		
		var details = $(e.currentTarget).closest('.details')
			
		var finish = function() {
			
			$('[data-snowaddress="'+address+'"]').addClass('bs-success').fadeIn(5000)
			
			setTimeout(function() {
				
				$('[data-snowaddress="'+address+'"]').removeClass('bs-success')
			},5000);
			
			
		
		}
		
		if($(e.currentTarget).closest('.eachaccount').attr('class')  !== $(this._dropCandidate).closest('.eachaccount').attr('class') ) {
			this._dropCandidate.fadeOut()
			_this.dropEnd()
			_this.moveAddressCall(account,address,finish)
		} else {
			snowUI.flash('error','You can not move this address to nullville',3500)
		}
		
	},
	dragDrop: function(e) {
		var _this = this
		$('.eachaccount').find('.bs-warning').removeClass('bs-warning')
		var account = $(e.currentTarget).closest('.eachaccount').attr('data-snowaccount'),
			address = $(this.dragged).attr('data-snowaddress')
		
		
		var details = $(e.currentTarget).find('.details')
		
		if($(e.currentTarget).find('.addresses').css('display') === 'none')$(e.currentTarget).find('.addresses').toggle("fast")	
		
		var finish = function() {
			
			$('[data-snowaddress="'+address+'"]').addClass('bs-success').fadeIn(5000)
			
			setTimeout(function() {
				
				$('[data-snowaddress="'+address+'"]').removeClass('bs-success')
			},5000);
		}
		
		if($(e.currentTarget).closest('.eachaccount').attr('class') !== $(this.dragged).closest('.eachaccount').attr('class') ) {
			$(this.dragged).fadeOut()
			_this.dropEnd()
			this.moveAddressCall(account,address,finish)
		} else {
			snowUI.flash('error','You can not move this address to nullville',3500)
		}
		
				
	},
	moveAddressCall: function(account,address,cb) {
		
		snowUI.loadingStart()
		var _this = this
		snowlog.log('move address call')
		var time=new Date()-2;
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:_this.props.config.wallet,moon:_this.props.config.moon,account:account ,address:address ,moveaddress:'now',checkauth:time},
			_this = this;
		snowUI.ajax.GET(url,data,function(resp) {
			console.log(resp)
			
			if(resp.success === true) {
				_this.setState({data:resp.data},function(){
					snowUI.flash('success',resp.msg,3500)
					cb()	
				})
				
			} else {
				snowUI.flash('error',resp.error,3500)
			}
			snowUI.loadingStop()
		})
		return false
	},
	dragged: false,
	_openAddresses: false,
	dragStart: function(e) {
		
		this.dragged = e.currentTarget;
		$(this.dragged).css('opacity','.9').addClass('dropcandidate')
		
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.dropEffect = 'move';
		
		$(e.currentTarget).closest('.eachaccount').find('.addresses').addClass('skip')
		this._openAddresses = $('.eachaccount').find('.addresses.open')
		//this._openAddresses.not('.skip').hide()
		
		// Firefox requires calling dataTransfer.setData
		// for the drag to properly work
		e.dataTransfer.setData("text/html", e.currentTarget);
	},
	dragEnd: function(e) {
		$(this.dragged).css('opacity','1').removeClass('dropcandidate')
		$('.eachaccount').removeClass('dragover')
		$('.eachaccount').find('.addresses').removeClass('skip')
		if(this._dropCandidate.attr('data-snowaddress') === $(this.dragged).attr('data-snowaddress') )this.dropEnd()
		this._openAddresses = false
	},
	
	over: false,
	dragOver: function(e) {
		e.preventDefault()
		var zone = $(e.target).closest('.eachaccount')
		
		if(zone.hasClass("dragover")) return;
		
		$(this.over).closest('.eachaccount').removeClass('dragover')
		this.over = e.target;
		
		zone.addClass('dragover')
		
	},
	dragLeave: function(e) {
		e.preventDefault()
		//if(!$(e.target).closest('.details').hasClass('placeholder'))$(e.target).closest('.details').removeClass('placeholder')
	},
});
//overview list component
WalletUI.transactions = React.createClass({
	getInitialState: function() {
		return ({
			requesting:false,
			mounted:false,
			start: 0,
			num: 5,
			account:'all'
		})
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		
		
		snowlog.log('tx will receive props',this.props,nextProps)
		
		if(!this.state.requesting && nextProps.ready) {
			this.setState({requesting:true});
			this.getData(nextProps,function(resp){
				var setme = {data:resp.data,mounted:true,requesting:false}
			
				if(nextProps.config.params[2])setme.account = nextProps.config.params[2];
				if(nextProps.config.params[3])setme.start = nextProps.config.params[3];
				if(nextProps.config.params[4])setme.num = nextProps.config.params[4];
				_this.setState(setme) 
				
			})
		}
	},
	getData: function (props,cb) {
		
		snowlog.log('tx data',props)
		
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		data.account = props.config.params[2] || this.state.account;
		data.start = props.config.params[3] || this.state.start;
		data.num = props.config.params[4] || this.state.num;
		
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
	componentDidMount: function() {
		this.componentWillReceiveProps(this.props)
	},
	componentWillUpdate: function() {
		
	},
	componentDidUpdate: function() {
		snowUI.watchLoader();
	},
	shouldComponentUpdate: function() {
		return true
	},
	submitForm: function(e) {
		e.preventDefault();
		var num = $('#txrows').val();
		var acc = $('#txaccounts').val();
		var start = 0;
		this.setState({mounted:false,start:start,num:num,account:acc});
		snowUI.methods.valueRoute(snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + acc + '/' + start + '/' + num,{trigger:true,skipload:true})
	},
	prev: function() {
		var account = this.state.account,
			start = parseFloat(this.state.start) - parseFloat(this.state.num),
			num = this.state.num;
		
		this.setState({mounted:false,start:start,num:num,account:account});
		snowUI.methods.valueRoute(snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + account + '/' + start + '/' + num,{trigger:true,skipload:true})
		
	},
	next: function() {
		
		var account = this.state.account,
			start = parseFloat(this.state.start) + parseFloat(this.state.num),
			num = this.state.num;
		
		this.setState({mounted:false,start:start,num:num,account:account});
		snowUI.methods.valueRoute(snowPath.wallet + '/' + this.props.config.wallet + '/' + this.props.config.moon + '/' + account + '/' + start + '/' + num,{trigger:true,skipload:true})
		
	},
	createTxHtml: function(val) {
		var html ="<div id='"+val.time+"-div'><table class=''><tbody><tr class='skipme'><td> account</td><td>"+val.account+"<tr class='skipme'><td> address<td>"+val.address+"<tr class='skipme'><td> category<td>"+val.category+"<tr class='skipme'><td> amount<td>"+parseFloat(val.amount).formatMoney()+"<tr class='skipme'><td> fee<td>"+parseFloat(val.fee).formatMoney()+"<tr class='skipme'><td> confirmations<td>"+val.confirmations+"<tr class='skipme'><td> blockhash</td><td> "+val.blockhash+"</td></tr><tr class='skipme'><td> blockindex<td>"+val.blockindex+"</td></tr>";
		
		var formattedTime = moment(val.blocktime*1000).format("llll")
		html+="<tr class='skipme'><td> block time<td>"+formattedTime+"<tr class='skipme'><td> transaction id<td><a  href='http://dogechain.info/tx/"+val.txid+"' target='_blank' class='text-muted'>"+val.txid+"</a></td></tr>";
		var Time = moment(val.time*1000).format("llll");
		html+="<tr class='skipme'><td> time<td>"+Time+"</td></tr>";
		var tt = moment(val.timereceived*1000).format("llll")
		html+="<tr class='skipme'><td> time received<td>"+tt+"<tr class='skipme'><td> comment<td>"+val.comment+"<tr class='skipme'><td> to<td>"+val.to+"</td></tr></tbody></table> ";
		return html;
	},
	showTx: function(e) {
		snowlog.log('showTX')
		var tr = $(e.currentTarget).closest('tr')
		var after = tr.next().is('.txrowsmore');
		$('.txrowsmore').toggle(400,function() {
			this.remove()
		});
		if(!after) {	
			try {
				var data = JSON.parse(tr.attr('data-open')); 
			} catch(e) {
				var data={}
			}
			snowlog.log(data,'showTX')
			$(e.currentTarget).closest('tr').after('<tr class="txrowsmore"><td></td><td colspan="5">'+this.createTxHtml(data)+'</td></tr>').next().toggle(400);
		}
	},
	render: function() {
	    snowlog.log('wallet transaction component',this.props,this.state)
		
		var _this = this,
			next = ' disabled',
			account = this.state.account,
			start = this.state.start,
			num = this.state.num;
		var prev = start>0 ? '':' disabled';
		
		if(this.state.mounted) {
			if(typeof this.state.data === 'object') {
				if(typeof this.state.data.transactions === 'object' && this.state.data.transactions.transactions.length>0) {
					   var loop = this.state.data.transactions.transactions;
					   var i = this.state.start;
					   var listtxs = loop.map(function(v) {
						    return (
								<tr key={v.time+(i++)} style={{cursor:'pointer'}} data-open={JSON.stringify(v)} className="txclickrow" onClick={_this.showTx}>
								<td className=" snowbg2">{i}</td>
								<td>{v.account}</td>
								<td>{v.amount}</td>
								<td>{v.address}</td>
								<td>

									{v.category}
								</td>
								<td>{moment(v.time*1000).format("llll")}</td>
								</tr>
							    );   
					    });
					    
					    if(listtxs.length >= num) next = '';
					    
					   
				} else {
					var listtxs = (
						<tr style={{cursor:'pointer'}} data-open="" className="txclickrow">
							<td colspan="5">no transactions found</td>

						</tr>
					    ); 
					
				}
				if(this.state.data.accounts instanceof Array) {
					 var accs =  this.state.data.accounts.map(function(v) {
						return (
							<option key={v.name} value={v.name}>{v.name}</option>
						);   
					});
						    
				} else {
					var accs = '<option value="">no accounts found</option>'
				}
				
			} else {
				var listtxs = (
					<tr style={{cursor:'pointer'}} data-open="" className="txclickrow">
						<td colSpan="6">no transactions found</td>

					</tr>
				    ); 
				var accs = '<option value="">no accounts found</option>'
			}
			
			var pagerprev = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(<li className={'previous pull-left '+prev}><a onClick={this.prev} >{snowtext.wallet.tx.pager.prev.replace('{num}',this.state.num)}</a></li>);
			
			var pagernext = next.trim() === 'disabled' || this.state.account === 'all' ? '':(<li className={'next pull-right '+next}><a onClick={this.next} >{snowtext.wallet.tx.pager.next.replace('{num}',this.state.num)}</a></li>);
			
			var pagerprev2 = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(<li className={'previous pull-left '+prev}><a onClick={this.prev} >{snowtext.wallet.tx.pager.prev.replace('{num}',this.state.num)}</a></li>);
			
			var pagernext2 = next.trim() === 'disabled' || this.state.account === 'all' ? '':(<li className={'next pull-right '+next}><a onClick={this.next} >{snowtext.wallet.tx.pager.next.replace('{num}',this.state.num)}</a></li>);
			
			return (
				<div style={{padding:'5px 20px'}} >
					<div className="page-title">
						Transactions
					</div>
					<div id="snow-transactions" className="bs-example">
						
						<form id="txoptionsform" onSubmit={this.submitForm}>
							<div style={{marginLeft:10}} className="txoptions">
								
								<div className="pull-left txaccounts"> 
									<select id="txaccounts" className="form-control " name="account" defaultValue={this.state.account} >
										<option value="all">All</option>
										{accs}
									</select>
								</div>
							
								<div className="pull-left txrows">
									<select className="form-control " id="txrows" name="num" defaultValue={this.state.num}>
										<option value="5">5</option>
										<option value="10" >10</option>
										<option value="20">20</option>
										<option value="30">30</option>
										<option value="40">40</option>
										<option value="50">50</option>
										<option value="75">75</option>
										<option value="100">100</option>
									</select>
								</div>
								<div className="pull-left">
									<button type="submit"  style={{marginTop:-10}} className="btn  txgobutton">GO </button>
									<input type="hidden" value="0" id="txstart" />
								</div>
							</div>
							<div className="clearfix"></div>
						</form>
						
						<div style={{margin:"-10px 10px 0 10px"}} className="table-responsive">
							<ul className="pager">
								{pagerprev}
								{pagernext}
							</ul>
							<table className="table table-hover snowtablesort">
								<thead>
									<tr>
										<th><span className="glyphicon glyphicon-sort-by-order">#</span></th>
										<th><span className="glyphicon glyphicon-sort-by-alphabet">account</span></th>
										<th><span className="glyphicon glyphicon-sort-by-order">amount</span></th>
										<th><span className="glyphicon glyphicon-sort-by-alphabet">address</span></th>
										<th><span className="glyphicon glyphicon-sort-by-alphabet">type</span></th>
										<th className="snowsortdate"><span className="glyphicon glyphicon-sort-by-order">time</span></th>
									</tr>
								</thead>
								<tbody>
									

									{listtxs}
								</tbody>
							</table>
							<ul className="pager">
								{pagerprev2}
								{pagernext2}
							</ul>
						</div>
						
					</div>
				</div>			
			);
		} else {
			return(<div />)
		}
		
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
