/**
 * @jsx React.DOM
 */


snowUI.wallet.accounts = React.createClass({
	_remember: {},
	getInitialState: function() {
		
		var _this = this;
		snowUI.methods.wallet.accounts = {
			newAddressCall: function (wallet,moon,account) {
				var _this = this
				if(snowUI.debug) snowLog.log('grab new address')
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
				if(snowUI.debug) snowLog.log('move coin to account')
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
		if(snowUI.debug) snowLog.log('accounts will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({userSettings:resp.userSettings,data:resp.data,mounted:true,shortcuts:resp.shortcuts,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowLog.log('accounts did update',this.props)
		snowUI.watchLoader();
		$('[rel=qrpopover]').popover();
	},
	componentDidMount: function() {
		var _this = this
		if(snowUI.debug) snowLog.log('accounts did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts,mounted:true}) })
		$(document).on('click','.dropzone',function(e) {
			_this.dropZone(e)
			if(snowUI.debug) snowLog.log('drop address')
		})
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
	},
	statics: {
		
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowLog.log('account data',props)
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
	
		f.html('<button class="btn btn-info btn-sm" onClick="snowUI.methods.wallet.accounts.newAddressCall(\''+this.props.config.wallet+'\',\''+this.props.config.moon+'\',\''+snowkey+'\')">'+snowUI.snowText.accounts.new.createAddressBtn+'</button> &nbsp; <a  type="button"  onClick="$(\'.eachaccount.'+snowkey.replace(' ','SC14')+'\').find(\'.dynamic\').toggle(\'slow\').html(\'\')"  class="btn btn-default btn-sm">Cancel</a>')
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
		var newaccount = prompt(snowUI.snowText.accounts.new.promptAccount)
		if(newaccount) {
			this.newAccountCall(newaccount)
		}
	},
	newAccountCall: function(account) {
		var _this = this
		if(snowUI.debug) snowLog.log('new account call')
		
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
		f.toggle(500)
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
		
		var table = $('.eachaccount').not('.skip').removeClass('sortaccount sortbalance sortaddresses').addClass(who).toArray()
		
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
		fill.not('.skip').remove('.eachaccount');
		for (var i = 0; i < rows.length; i++){fill.append(rows[i])}
	},
	setHelp: function(e) {
		this.setState({showHelp:!this.state.showHelp});
		this.showShortcut(e,true,!this.state.showHelp);
		return false;
	},
	showShortcut: function(e,force,show) {
		
		if(snowUI.debug) snowLog.info('show shortcut e',e);
		
		var parent = $(e.target).closest('.eachaddress');
		var account = parent.closest('.eachaccount').attr('data-snowtrueaccount')
		var address = parent.attr('data-snowaddress');
		if(snowUI.debug) snowLog.info(show,'show help for shortcut');
		var showhelp = show !== undefined ? show : this.state.showHelp;
		var helptext = (showhelp) ? {
			a:(<div dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.shortcut.text}} />),
			b:(<div dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.sign.text}} /> ),
			c:(<div dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.signphrase.text}} /> ),
			d:(<div className="" dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.lock.lock}} />),
			e:(<div dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.type.info}} />),
			text: 'Hide Help',
		} : {text:'Show Help'};
		
		var html2;
		if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey) {
			html2 = (<div><p>You can <a onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.link} > create and add a .link account </a> to give out shortcuts that do not require you expose your wallet manager to the internet. .link will create a seperate server to communicate on and only accept requests from pre-defined source.</p></div>);
		}
		
		var html3,html4;
		if(snowUI.link.state === 'off') {
			if(!this.state.userSettings.linkName || !this.state.userSettings.shareKey || !this.state.userSettings.sendKey)
				html4 = <span  className="pull-left" dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.nolink.localon.replace('{link}', snowUI.snowPath.share).replace('{linktext}',snowUI.snowPath.share)}} />
					
			html3 = (<div className="bg-danger">
					{html4}
					<span  className="pull-right"> 
					 <span dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.nolink.linkoff}} /> 
					 <a href={snowUI.snowPath.link} onClick={snowUI.methods.hrefRoute} >
						<span dangerouslySetInnerHTML={{__html: snowUI.snowText.accounts.address.moreinfo.nolink.turnon}} />
					 </a> 
					</span>
					<div className="clearfix" />
				</div>);
		}
		
		var linkname = (this.state.userSettings.linkName) ? <span className="input-group-addon "><span style={{fontSize:'16px'}}> . </span>{this.state.userSettings.linkName}<span style={{fontSize:'16px'}}> .</span></span> : <span className="input-group-addon ">{snowUI.snowPath.share}/</span>
		
		if(snowUI.debug) snowLog.info('address, this shortcut, shortcuts',address,this.state.shortcuts[address],this.state.shortcuts);
		
		var def = this.state.shortcuts[address] ? this.state.shortcuts[address] : {sign:{}};
		var deleteme = def.apikey ? <span> <a style={{marginBottom:0,marginRight:10}} className="btn btn-danger pull-right"  onClick={this.deleteShortcut}>remove</a>  </span> : '';
		/*
		{helptext.b}
		<div className="form-group input-group">
			<span className="input-group-addon  coinstamp">{snowUI.snowText.accounts.address.moreinfo.pin.text}</span>
			<input type="text"  defaultValue={def.sign.pinop || ''} name="pin" id="pin" placeholder={snowUI.snowText.accounts.address.moreinfo.pin.placeholder} className="form-control coinstamp" />
		</div>
		*/
		/*
		{helptext.d} 	
		<div className="form-group input-group">
			<span  className="input-group-addon   coinstamp" style={{borderRight:'1px initial initial',paddingRight:25}}>
				{snowUI.snowText.accounts.address.moreinfo.lock.lockinput}
			</span>
				<select  defaultValue={def.sign.lock ? 'yes':'no'}  id="lock" name="lock" className="form-control coinstamp">
					<option value="no">{snowUI.snowText.accounts.address.moreinfo.lock.option.no}</option>
					<option value="yes">{snowUI.snowText.accounts.address.moreinfo.lock.option.yes}</option>
				</select>
		</div>
			
		
		{helptext.e}
		<div className="form-group input-group">
			<span className="input-group-addon input-group-sm coinstamp">{snowUI.snowText.accounts.address.moreinfo.type.text}</span>
			<select  defaultValue={def.sign.type || '1'}  name="type" id="type"  className="form-control coinstamp">
				<option value="1">{snowUI.snowText.accounts.address.moreinfo.type.option.one}</option>
				<option value="2">{snowUI.snowText.accounts.address.moreinfo.type.option.two}</option>
				<option value="3">{snowUI.snowText.accounts.address.moreinfo.type.option.three}</option>
			</select>
			
		</div>
		*/
		var html = 	<div>
					{html3}
					{html2}
					<form onSubmit={this.submitShortcut} id="shortcutForm">
						<div  className="form-group input-group">
							<span className="input-group-addon coinstamp">{snowUI.snowText.accounts.address.moreinfo.head.text} </span>
						
							<input type="text" name="address" id="address" value={address} onChange={function(e) { this.value = address}} className="form-control coinstamp" />
						</div>
						<div className="col-xs-12"><a className="pull-right" onClick={this.setHelp}>{helptext.text}</a></div>
						
						{helptext.a} 
						<div className="form-group input-group">
							{linkname}
							<input type="text" name="shortcut" defaultValue={def.apikey || ''} id="shortcut" placeholder={snowUI.snowText.accounts.address.moreinfo.shortcut.placeholder} className="form-control coinstamp" />
						</div>
						
						{helptext.c}
						<div className="form-group input-group">
							<span className="input-group-addon  coinstamp">{snowUI.snowText.accounts.address.moreinfo.pinphrase.text}</span>
							<input type="text"  defaultValue={def.sign.keyphrase || ''}  name="keyphrase" id="keyphrase" placeholder={snowUI.snowText.accounts.address.moreinfo.pinphrase.placeholder} className="form-control coinstamp" />
						</div>
						
						<div className="form-group input-group">
							<span className="input-group-addon input-group-sm coinstamp">{snowUI.snowText.accounts.address.moreinfo.expires.text}</span>
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
							<button className="btn btn-primary"  disabled={(this.state.connecting) ? 'disabled' : ''}  style={{marginBottom:0}}>{(this.state.connecting) ? def.apikey ? snowUI.snowText.accounts.address.moreinfo.button.updating:snowUI.snowText.accounts.address.moreinfo.button.submitting : def.apikey ? snowUI.snowText.accounts.address.moreinfo.button.update:snowUI.snowText.accounts.address.moreinfo.button.submit}</button> 
							
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
		if(snowUI.debug) snowLog.info(conf)
		this.setState({genericModal:true,modal:conf});
		snowUI.flash('message','Confirm First ',5000);
		return;
	},
	deleteShortcutNow: function(e) {
		e.preventDefault();
		var key = $('#key').val(),
			addr = $('#address').val(),
			_this = this;
			
		
		if(snowUI.debug) snowLog.log('removeNow',key)
		var url = "/api/snowcoins/local/receive/setup",
			data = {'action':'delete-unattended',wid:key}
		
		this.setState({connecting:true,genericModal:false,modal:{}});
		
		var confirm = window.confirm("Last button, I promise. \r\nPress OK to permanently remove " + $('#shortcut').val())
		if(confirm) {
			snowUI.ajax.POST(url,data,function(resp) {
				if(snowUI.debug) snowLog.info('remove shortcut resp',resp);
				if(resp.success === true) {
					//var sc = this.state.shortcuts;
					//if(addr) delete sc[addr];
								
					snowUI.flash('success','Shortcut removed',2500)
					_this.getData(_this.props,function(resp){ 
						_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
						_this.showShortcut({target:'#shortcutForm'},true);
						$('#shortcutForm')[0].reset();
						if(snowUI.debug) snowLog.info('removed shortcut',resp); 
					})
					
				} else {
					if(snowUI.debug) snowLog.warn(resp.error)
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
				confirm: key ? 'Update Shortcut' : 'Add Shortcut',
				click: this.addShortcut,
				
			}
			this.setState({genericModal:true,modal:conf});
			snowUI.flash('message','Please Confirm First',5000);
			return;
		}
		var conf = {
				
			title: 'Confirm shortcut action',
			body: 'Assign <b>' + shortcut.val() + '</b> to  <b>' + address + '</b>',
			confirm: key ? 'Update Shortcut' : 'Add Shortcut',
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
				
				if(snowUI.debug) snowLog.info('shortcut saved',resp);
				var msg = resp.msg ? resp.msg : 'shortcut ' + shortcut.val() + ' added successfully';
				snowUI.flash('success',msg,3500)
				
				_this.getData(_this.props,function(resp){ 
					_this.setState({connecting:false,userSettings:resp.userSettings,data:resp.data,shortcuts:resp.shortcuts});
					_this.showShortcut({target:'#shortcutForm'},true);
					if(snowUI.debug) snowLog.info('shortcut refreshed',resp); 
				});
				
				
			} else {
				if(snowUI.debug) snowLog.warn(resp)
				_this.setState({connecting:false});
				snowUI.flash('error',resp.error,3500)
				//_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		}.bind(this));
		
		return false;
	},
	render: function() {
		if(snowUI.debug) snowLog.log('wallet accounts component',this.state)
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
				<li role="presentation"><a className="snowsendfromaccountlink" onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name} role="menuitem" tabIndex="-1"> Send Coin </a></li>
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
							<a  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/'+ a.name + '/' + v.a} ><span className="glyphicon glyphicon-share" /></a>
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
							<a  onClick={_this.newAddress}>&nbsp; &nbsp; {snowUI.snowText.accounts.new.createAddress} </a>
						</div>
					</div>
				</div>
				)
		}
		var list = '';
		var total = 0;
		if(this.state.data instanceof Array) {
		    list = this.state.data.map(function(account) {
			   if(typeof account.addresses === 'object') {
				   var atext = account.addresses.length === 1 ? account.addresses.length + ' ' +snowUI.snowText.accounts.address.short.singular : account.addresses.length + ' ' + snowUI.snowText.accounts.address.short.plural
				   var aclick = _this.toggleAddresses
			   } else {
				 var atext =    snowUI.snowText.accounts.new.short
				 var aclick=  _this.newAddress
				   
			   }
			   total += Number(account.balance);
			   return (<div className={"eachaccount  " + account.name.replace(' ','SC14')} key={account.name.replace(' ','SC14')} data-snowtrueaccount={account.truename}   data-snowaccount={account.name} data-snowbalance={account.balance} onDrop={_this.dragDrop}  onDragOver={_this.dragOver} >
					<div className="dropdown">
						<div className="details"  onClick={aclick}  onDragLeave={_this.dragLeave} >
							<div className="account" onClick={aclick} >
								{account.name} 
								{account.truename!==account.name ? ' ('+account.truename+')' : ''}
							</div>
							<div className="linkline">
								<a onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.wallet + '/' + _this.props.config.wallet + '/send/from/' + account.name}><span className="badge  snowbg4">send </span> </a>
								<a onClick={aclick} data-snowkey={account.name}><span className="badge">{atext} </span> </a> 
								<a onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}><span className="badge bs-info2"  href={snowUI.snowPath.root + snowUI.snowPath.wallet + '/' +  _this.props.config.wallet + '/transactions/' + account.name}>{snowUI.snowText.accounts.tx.text} </span> </a> 
							</div>
						</div>
						<div className="balance " onClick={_this.drop} >
							 <a className="dropdown-toggle" data-toggle="dropdown" data-container=".dropdown">{parseFloat(account.balance).formatMoney(8)} <span className="caret"></span> </a>
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
			return (snowUI.snowModals.genericModal.call(_this,_this.state,function(){ $('button').prop('disabled','');_this.setState({connecting:false,genericModal:false}) }.bind(_this) ));
		};
		return (
		<div style={{padding:'25px 20px'}} id="snowaccountlist" >
			<div className="page-title">                                    
				Accounts
			</div>
			<div className="col-xs-12  navbar navbar-inverse" style={{textAlign:'right',fontSize:'14px'}}>
				
				<ul  className="nav  pull-right" >
					 <li className="dropdown">
						  <a href="#" id="navmenuaccounts" style={{padding:'15px 20px 17px 20px',textTransform:'uppercase'}}className="dropdown-toggle" data-toggle="dropdown">{snowUI.snowText.menu.menu.name} <span className="caret"></span></a>
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
					<li><a  onClick={_this.newAccount} >{snowUI.snowText.accounts.new.account}</a></li>
				</ul>		
				
			</div>
			<div id="listaccounts">
				<div className="eachaccount skip">
					
					<div className="details"   >
						<div className="account"  >
							total balance
						</div>
					</div>
					<div className="balance " >
						{total}
					</div>
					<div className="clearfix" />
				</div>	
				<div className="clearfix" />
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
			if(snowUI.debug) snowLog.log('end dropping')
		} else {
			_this.dropStart(e)
			if(snowUI.debug) snowLog.log('start dropping')
		}
		
	},
	dropStart: function(e) {
		var highlight = $(e.currentTarget).closest('.eachaddress')
		var balance = $('.eachaccount').not('.skip').find('.balance')
		
		highlight.addClass('dropcandidate')
		balance.append('<div class="dropzone bstooltip" data-placement="top" data-toggle="tooltip"  data-trigger="hover focus" title="Click me to move the selected address to this account"></div>')
		
		this._dropAddress = e.currentTarget.dataset.snowaddress
		this._dropCandidate = highlight
		
		this.zoneToggle = true
		
	},
	dropEnd: function(e) {
		
		var balance = $('.eachaccount').not('.skip').find('.balance')
		balance.find('.dropzone').remove()
		$('.eachaddress').removeClass('dropcandidate')
		this._dropAddress = false
		this._dropCandidate = false
		
		this.zoneToggle = false
		
	},
	dropZone: function(e) {
		var _this = this
		
		var account = $(e.currentTarget).closest('.eachaccount').not('.skip').attr('data-snowaccount'),
			address = this._dropCandidate.attr('data-snowaddress')
			
		
		
		if($(e.currentTarget).closest('.eachaccount').not('.skip').find('.addresses').css('display') === 'none')$(e.currentTarget).closest('.eachaccount').find('.addresses').toggle("fast")
		
		var details = $(e.currentTarget).closest('.details')
			
		var finish = function() {
			
			$('[data-snowaddress="'+address+'"]').addClass('bs-success').fadeIn(5000)
			
			setTimeout(function() {
				
				$('[data-snowaddress="'+address+'"]').removeClass('bs-success')
			},5000);
			
			
		
		}
		
		if($(e.currentTarget).closest('.eachaccount').not('.skip').attr('class')  !== $(this._dropCandidate).closest('.eachaccount').attr('class') ) {
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
		var account = $(e.currentTarget).closest('.eachaccount').not('.skip').attr('data-snowaccount'),
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
		if(snowUI.debug) snowLog.log('move address call')
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
		
		$(e.currentTarget).closest('.eachaccount').not('.skip').find('.addresses').addClass('skip')
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
		var zone = $(e.target).closest('.eachaccount').not('.skip')
		
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

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
