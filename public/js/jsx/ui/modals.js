/**
 * @jsx React.DOM
 */



// Our custom component is managing whether the Modal is visible
snowUI.addModal = React.createClass({
	mixins: [snowUI.OverlayMixin], 

	getInitialState: function () {
		return {
			isModalOpen: this.props.open || false
		};
	},
	componentDidMount: function() {
		
	},
	componentDidUpdate: function() {
		
		
	},
	componentWillUpdate: function() {
		
	},
	componentWillUnmount: function() {
		
	},
	componentWillReceiveProps: function(np) {
		this.setState({isModalOpen:np.open})
		
	},
	handleToggle: function () {
		this.setState({
			isModalOpen: !this.state.isModalOpen
		});
		
		if(this.props.close) {
			this.props.close()
		} else {
			snowUI.methods.modals.close(this.props.me)
		}
	},

	render: function () {
		
		return (
			<span />
		);
	},

	// This is called by the `snowUI.OverlayMixin` when this component
	// is mounted or updated and the return value is appended to the body.
	renderOverlay: function () {
		if (!this.state.isModalOpen) {
			
			return <span/>;
		}
		var foot = (
			<div>
				<div className="pull-left">
					{this.props.buttons}
				</div>
				<div className="pull-right">
					<snowUI.Button bsStyle="default" onClick={this.handleToggle}>Cancel</snowUI.Button>
				</div>
			</div>
		)
		return (
			<snowUI.Modal title={this.props.title} onRequestHide={this.handleToggle}>
				<div className="modal-body">
					{this.props.children}
				</div>
				<div className="modal-footer">
					{ this.props.footer ? <div className="clearfix"><p>  {this.props.footer} </p> </div> : '' }
					{!this.props.hideFooter ? foot : ''}
					
				</div>
			</snowUI.Modal>
		);
	}
});


/**
 * Our controllers are always functions and must be included as a method 
 * 
 * you must apply SCOPE (apply/call) to any method generated from a controller
 * 
 * the modals get included in UI intialState
 * 
 * Use snowUI.methods.modals.encryptWallet.open.call(this)
 * 
 * You CAN NOT access these methods directly...
 * 
 * */		 

snowUI.controllers.ui.modals = function() {
	var _this = this;
	return {
		/* each modal has its own methods */
		addressBook: {
			open: function() {
				var modals = _this.state.modals;
				modals.addressBook = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('addressBook')
			},
				
		},
		genericModal: {
			open: function() {
				var modals = _this.state.modals;
				modals.genericModal = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('genericModal')
			},
				
		},		
		removeItem: {
			open: function() {
				var modals = _this.state.modals;
				modals.removeItem = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('removeItem')
			},
				
		},
		encryptWallet: {
			open: function() {
				var modals = _this.state.modals;
				modals.encryptWallet = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('encryptWallet')
			},
				
		},
		unlockWallet: {
			open: function() {
				var modals = _this.state.modals;
				modals.unlockWallet = true;
				_this.setState({modals:modals});
			},
			close: function() {
				snowUI.methods.modals.close('unlockWallet')
			},
			request: function(e) {
				e.preventDefault();
				
				_this.setState({requesting:true});
				if(snowUI.debug) snowLog.log('unlock wallet',snowUI.methods)
				if(_this.state.unlockphrase)
				{
					var nowtime=new Date().getTime()
					var url = "/api/snowcoins/local/gated"
					var timeout = _this.refs.unlocktime.getDOMNode().value.trim()
					var data = { checkauth:nowtime,wallet: _this.props.wallet,command:'unlock',passphrase:_this.state.unlockphrase,timeout:timeout}
					var errorDiv = $(_this.refs.unlocktime.getDOMNode()).parent().parent().find('.adderror')
					
					errorDiv.fadeOut()
					
					snowUI.ajax.GET(url,data,function(resp) {
						if(resp.success === true) {							
							var tt=(new Date().getTime());
							snowUI.methods.changelock(Math.floor(tt+timeout*1000));
							snowUI.methods.modals.unlockWallet.close()
							
						} else {
							snowUI.flash('error',resp.error,3500)
							errorDiv.fadeIn().html(resp.error);
							_this.setState({requesting:false});
							//snowUI.methods.updateState({connectError:true})
						}
					})
					
				}
				
			}
			
		},
		close: function(me) {
			
			if(_this.state.modals[me]) {
				var modals = _this.state.modals;
				modals[me] = false;
				_this.setState({requesting:false,modals:modals})
				
			} else {
				_this.setState({requesting:false,modals: {
					unlockWallet: false,
					encryptWallet: false,
					removeItem: false,
					genericModal: false,
					addressBook: false,
				}});
			}
		},
		/* moved these so set some pointers.  
		 * someone could clean this up by changing calls in UI and Wallet 
		 * */
		open: {
			encryptWallet: function() {
				return snowUI.methods.modals.encryptWallet.open.call(this)
			},
			unlockWallet: function() {
				return snowUI.methods.modals.unlockWallet.open.call(this)
				
			},
			
		}
	}
}

/* end controllers */

/**
 * all of our modals are defined here.  call them with the function() 
 * */
snowUI.snowModals = {}

snowUI.snowModals.unlockWallet = function() {
	var uButtons = <button onClick={snowUI.methods.modals.unlockWallet.request}  disabled={!this.state.unlockphrase || this.state.requesting ? 'disabled' : ''}  id="confirmunlock" className="btn btn-warning" rel="modal">{this.state.requesting ? 'Unlocking...' : 'Unlock Wallet'}</button>
	if(snowUI.debug) snowLog.log('unlock wallet',this.state)
	var toggle = this.state.showPasswords ? snowUI.snowText.ui.hidepassphrase : snowUI.snowText.ui.showpassphrase;
	return (<snowUI.addModal me="unlockWallet" methods={{}} open={this.state.modals.unlockWallet} title={"Unlock " + this.state.wally.name} buttons={uButtons}  >
			<div> 
				
					<div style={{display:'none'}} className="adderror"></div>
					<p>Please unlock your wallet to continue.</p>
					
					<div className="form-group input-group"> 
						<span className="input-group-addon input-group-sm coinstamp">Timeout (sec)</span>
						<select id="unlocktime" ref="unlocktime" className="form-control coinstamp col-md-4"  >
						<option value="5">5</option>
						<option value="15">15</option>
						<option value="30">30</option>
						<option value="45">45</option>
						<option value="60">60</option>
						<option value="120">120</option>
						<option value="180">180</option>
						<option value="300">300</option>
						</select>
					</div>
					<div className={!this.state.unlockphrase ? 'form-group input-group has-error':'form-group input-group'}>
						<span className="input-group-addon input-group-sm coinstamp">Pass Phrase</span>
						<input type={snowUI.methods.forms.passwordORnot.call(this)} required="" id="unlockphrase" ref="unlockphrase" placeholder="enter pass phrase" className="form-control coinstamp"  valueLink={this.linkState('unlockphrase')}  />
					</div>
					<p style={{textAlign:'right'}}><a onClick={this.togglePassFields}> {toggle} </a></p>
				
			</div>
		</snowUI.addModal> )
}


snowUI.snowModals.encryptWallet = function() {
	var _this = this
	
	var config = _this.config()
	if(snowUI.debug) snowLog.log('config in encrypt wallet',config)
	if(!config.locked) {
		var eButtons = (
				<snowUI.ButtonToolbar >
				<button id="confirmencryptbackup" onClick={function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/passphrase')}} className="btn btn-warning pull-right">{snowUI.snowText.modals.encrypt.buttons.encrypt}</button>
				<button className="btn btn-info backupwalletbutton  pull-right"  onClick={function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/backup')}} ><span>{snowUI.snowText.modals.encrypt.buttons.backup}</span></button>
				</snowUI.ButtonToolbar>
		)
		var text = (<div id="encryptwalletbackupfirst" dangerouslySetInnerHTML={{__html: snowUI.snowText.modals.encrypt.notlocked.text}} />)
		
	} else {
		var eButtons = (
				<snowUI.ButtonToolbar >
				<button className="btn btn-info backupwalletbutton  pull-right"  onClick={function(){snowUI.methods.modals.close();snowUI.methods.valueRoute(_this.props.section + '/' + _this.props.wallet + '/backup')}} ><span>{snowUI.snowText.modals.encrypt.buttons.backup}</span></button>
				</snowUI.ButtonToolbar>
		)
		var text = (<div id="encryptwalletbackupfirst" dangerouslySetInnerHTML={{__html: snowUI.snowText.modals.encrypt.locked.text}} />)
	}
	return (<snowUI.addModal me="encryptWallet"  methods={{}} buttons={eButtons} open={this.state.modals.encryptWallet} title={"Encrypt " + this.state.wally.name}   >
		{text}			
		
	</snowUI.addModal>)
		
}

snowUI.snowModals.genericModal = function(conf,close) {
	var _this = this,
		config = conf.modal;
	
	if(!config.confirm)config.confirm = 'Confirm';
	
	var eButtons = (
			<snowUI.ButtonToolbar >
			<button onClick={config.click}    id="removegenericmodalbutton" className={"btn " + config.btnClass } rel="modal">{config.confirm} </button>
			
			</snowUI.ButtonToolbar>
		)
		return (<snowUI.addModal me="generic"  methods={{close:close}} buttons={eButtons} open={this.state.genericModal}  title={config.title}   >
						
			<div  >
				<div dangerouslySetInnerHTML={{__html: config.body}} />
			</div>
		</snowUI.addModal>)
		
}


snowUI.snowModals.removeItem = function(click,close) {
	var _this = this
	var eButtons = (
			<snowUI.ButtonToolbar >
			<button onClick={click}  data-snowdata={this.state.id}  id="removedynamicmodalbutton" className="btn btn-danger" rel="modal">Permanently Remove Item Now </button>
			</snowUI.ButtonToolbar>
		)
		return (<snowUI.addModal me="removeDynamic"  methods={{close:close}} buttons={eButtons} open={this.state.removeItem}  title={"Remove Item "}   >
						
			<div id="removemenow" >
				<p style={{fontWeight:'bold'}}> This action is permanent  </p>
				<p>
					Do you want to continue and remove {this.state.getIden()}?
				</p>
				
				
				
			</div>
		</snowUI.addModal>)
		
}


snowUI.snowModals.addressBook = function() {
	var _this = this;
	return (<snowUI.addModal me="addressBook"   open={this.props.config.modals.addressBook}  title={"Saved Addresses "}   >
			<div dangerouslySetInnerHTML={{__html: this.state.addressBookHtml}} />
			
		</snowUI.addModal>)
		
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
