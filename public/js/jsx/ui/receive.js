/**
 * @jsx React.DOM
 */

/**
 * receive components
 * */
//main
snowUI.receive.UI = React.createClass({
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
		if(snowUI.debug) snowLog.log('receive willgetprops')
		var _state = this.getFalseState();
		var page = nextProps.config.page || this.state.component
			
		_state[page] = 'in active'
		_state.component = page
		this.setState(_state)
		if(snowUI.debug) snowLog.log('receive willgetprops','false state:',_state,nextProps)
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
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				if(resp.ip && resp.ip!='')snowUI.myip=resp.ip;
				_this.setState({data:resp.data,connecting:false})
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('receive did update')
	},
	componentWillMount: function() {
		//$('body').find('[rel=popover]').popover('destroy');
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('receive did mount')
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
		if(snowUI.debug) snowLog.info(me,them)
		me.tab('show')
		snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		
		
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		if(snowUI.debug) snowLog.log('receive component',this.state)
		
		if(this.state.error ) {
			
			 renderMe = (<snowUI.wallet.displayMessage   message ={this.state.message} type = 'warning' />)
			
			
		} else if(!this.state.data) {
			if(snowUI.debug) snowLog.warn('empty render for receive')
			
		
		} else if(snowUI.receive[showcomp]) {
			
			var po = snowUI.receive[showcomp]
			renderMe = (<po config={this.props.config} state={this.state} />)
		
		} else {
			
			renderMe = (<snowUI.wallet.displayMessage  title = '404 Not Found' message = 'I could not find the page you are looking for. ' type = 'requesterror' />)
			 
		}     
		
	    return (
		
		<div className="snow-body-receive">
			<div id="snow-receive" className=" snow-send snow-receive  snow-dccsetup">
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
				<nav role="navigation" className="navbar navbar-inverse">
					<div className="navbar-header shortmenu">
						<button style={{marginLeft:8,float:'left'}} type="button" data-toggle="collapse" data-target=".navbar-dccnav-collapse" className="navbar-toggle navbar-toggle-menu navbar-toggle-right"><span className="sr-only">Toggle navigation</span><span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span>
						</button>
						<div style={{float:'left'}}  className="shortmenu-text navbar-toggle">{this.props.config.wallet}</div>
					</div>
					<div className="collapse navbar-collapse navbar-dccnav-collapse">
						<ul className="nav navbar-nav dccnavlis"  role="tablist" data-tabs="tabs" >
							
							<li className="active" ><a   data-target="shortcuts"   role="tab" data-toggle="tab"  onClick={this.changeTab} >{snowUI.snowText.receive.tabs.static.text}</a></li>
							<li ><a onClick={this.changeTab}  data-target="dynamic" role="tab" data-toggle="tab" id="lidynamic" >{snowUI.snowText.receive.tabs.dynamic.text}</a></li>
							<li ><a  data-target="keys"  role="tab" data-toggle="tab" onClick={this.changeTab} >{snowUI.snowText.receive.tabs.keys.text}</a></li>
							<li ><a  id="litrackers" data-target="trackers"   role="tab" data-toggle="tab" onClick={this.changeTab} >{snowUI.snowText.receive.tabs.trackers.text}</a></li>

							<li><a onClick={function(){ return location.reload()}}><span className="glyphicon glyphicon-refresh"></span></a></li>
						</ul>
					</div>
				</nav>

				<div style={{padding:'20px 10px 0 10px'}} className="tabbox clearfix tab-content " id="maindiv">
				
				
					{renderMe}
				</div>
				<div className="clearfix"></div>
			</div>		
		</div>
	    )
	}
});


//dynamic component
snowUI.receive.dynamic = React.createClass({
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
		if(snowUI.debug) snowLog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('dynamic did update')
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
		$("#dccadddynamic #receivertype").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
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
		if(snowUI.debug) snowLog.info('submit dynamic add form',e)
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
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Dynamic receiver added',2500)
					this.setState({requesting:false});
				
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('opem remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' dynamic receiver ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
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
					if(snowUI.debug) snowLog.error(resp)
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
		if(snowUI.debug) snowLog.log('dynamic component', this.props)
		
		var text = snowUI.snowText.receive.dynamic,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					<tr id={val._id} key={val._id} >
						<td  data-dccwid={val._id} data-dcciden={val.name} onClick={this.removeAsk} style={{cursor:"pointer"}} > <span  data-dccwid={val._id}  data-dcciden={val.name}  className="removedccwallet text-danger glyphicon glyphicon-remove"> &nbsp; </span></td>
						<td> {val.coin} </td>
						<td> {val.name} </td>
						<td> {val.wallet ? val.wallet.name : '--'} </td>
						<td> {val.confirmations} </td>
						<td> {val.account || '--'}  </td>
						<td> {val.address || '--'}  </td>
					</tr>
				);
			}.bind(this));
		}
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						<option key={ w.key} value={w.key}  >{w.name}</option>
					);
				});
			}
			return (
				<div>
					<form id="dccadddynamic" onSubmit={this.submitForm} className="easytab reversetab">
						
						<div className="adderror"></div>
						<div style={{marginLeft:10}}>
							<ul id="dynamicaddtabs" className="nav nav-pills"  role="tablist" data-tabs="pills">
								<li className="active"><a data-target="TABwallet" role="pill" data-toggle="pill">From Wallet</a></li>
								<li><a data-target="TABaddress" role="pill" data-toggle="pill">Manual</a></li>
							</ul>
						</div>
						<div className="tab-content">
							<div className="form-group input-group">
								<span className="input-group-addon input-group-sm coinstamp">Name</span>
								<input type="text" ref="name" name="name" placeholder="name of dynamic receiver" className="form-control coinstamp input input-faded" />
							</div>
							<div id="TABwallet" className="tab-pane active ">
								<div className="form-group input-group">
									<span className="input-group-addon input-group-sm coinstamp">Wallet</span>
									<select ref="dccaddwallet" id="dccaddwallet" name="dccaddwallet" className="form-control input input-faded" >
										<option>Select A Wallet</option>
										{wallets}
									</select>
								</div>
								<div className="form-group input-group">
									<span className="input-group-addon input-group-sm coinstamp">Send to Format</span>
									<select ref="format" id="addreceiverformat" name="format" className="form-control input input-faded" >
										<option value="1">New Account &amp; Address per transaction</option>
										<option value="2">One Account + New Address per transaction</option>
										<option value="3">One Account &amp; Address for a single transaction</option>
									</select>
								</div>
								<div id="addreceiveraccount" style={{display:"none"}} className="form-group input-group">
									<span className="input-group-addon input-group-sm coinstamp">Account</span>
									<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span><input type="text" ref="account" id="account" name="account" placeholder="new or current account" className="form-control coinstamp input input-faded input input-faded ui-autocomplete-input" autoComplete="off" />
								</div>
							</div>
							<div id="TABaddress" className="tab-pane ">
								<p className="text-warning">*Blockchain monitoring support not functional yet and these receivers can not be tracked.</p>
								<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Coin Address</span>
									<input type="text" id="address" name="address" ref="address" placeholder="address" className="form-control coinstamp input input-faded" />
								</div>
								<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Coin Type</span>
									<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span><input type="text" id="receivertype" ref="receivertype" name="receivertype" className="form-control coinstamp input input-faded input input-faded ui-autocomplete-input" autoComplete="off" />
								</div>
							</div>
							<div className="form-group input-group">
								<span className="input-group-addon input-group-sm coinstamp">Total Offset<span style={{marginLeft:3}} data-toggle="tooltip" data-placement="right" data-container="body" title="" className="glyphicon glyphicon-info-sign bstooltip" title="If you plan on accepting multiple coins for payment you should set an offset.  If you charge 55000 Ð and accept Ð, BTC and LTC for payment the conversion may leave a payment at 49990 Ð.  If you set the offset to 10 Ð the order would be considered complete."></span></span>
								<input type="text" id="totaloffset" name="totaloffset" ref="totaloffset" className="form-control coinstamp input input-faded" />
							</div>
							<div className="form-group input-group">
								<span className="input-group-addon input-group-sm coinstamp">Confirmations
									<span style={{marginLeft:3}} data-toggle="tooltip" data-placement="right" data-container="body" title="" className="glyphicon glyphicon-info-sign bstooltip" title="The number of confirmations needed to consider a transaction payment complete."></span>
									</span>
								<input type="text" id="confirmations" name="confirmations" ref="confimations" className="form-control coinstamp input input-faded" />
							</div>
							<div className="form-group">
								<button    disabled={(this.state.requesting) ? 'disabled' : ''}  className="btn " >{this.state.requesting ? 'Adding...' : 'Add Dynamic Receiver'}</button>
								<a type="button"  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component}   className="btn btn-default pull-right" >Cancel</a>
							</div>
						</div>
						<input type="hidden" ref="action" name="action" defaultValue="add-wallet" />
						<input type="hidden" name="useme" ref="useme" id="fw-useme" defaultValue='TABwallet' className="fw-useme" />
					</form>
				</div>
			)
		}.bind(this)
		var renderList = function() {
			return (
			<div >
				<div id="dynamicpage" className={"col-md-12  tab-pane fade in active"}>
					<div className="snow-block-body">
						  <a type="button"  onClick={snowUI.methods.hrefRoute}  href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add'} className="btn btn-sm btn-default adddccwalletbutton">{text.button.add.text}</a>
						  <div className="table-responsive">
							<table className="table table-hover snowtablesort"  >
								<thead>
									<tr>
										<th><span className="glyphicon glyphicon-remove"></span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.coin.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.receiver.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.wallet.text}</span></th>
										<th   title="confirmations"><span className="glyphicon glyphicon-sort-by-order">{text.table.th.cfms.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.account.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-order">{text.table.th.address.text}</span></th>
									</tr>
								</thead>
								<tbody>
									{results}
								</tbody>
							</table>
						  </div>
						
					</div>
					<div className="clearfix"></div>
				</div>
				{snowUI.snowModals.removeItem.call(this,this.removeNow)}
			</div>			
		
			);
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			<div  style={{padding:'5px 20px'}} >
			
				
			
				{really()}
			</div>
		)
	}
});

//client component
snowUI.receive.shortcuts = React.createClass({
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
		if(snowUI.debug) snowLog.info('receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('static did update')
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
		$("#dccaddofflineform #coin").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
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
		if(snowUI.debug) snowLog.info('submit shortcut add form',e)
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
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Shortcut ' + shortcut + ' added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' static receiver ' + iden,removeItem:true});
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
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
					if(snowUI.debug) snowLog.warn(resp.error)
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
		var text = snowUI.snowText.receive.static,
			results,
			_this = this;
		var list = this.props.state.data[this.props.state.component]
		if(snowUI.debug) snowLog.log('static receiver component', list)
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				var format = val.sign.format === '1' ? 'Share' : val.sign.format === '2' ? ' Share & Pay' : 'Payments';
				var locked = val.sign.lock ? 'Will Encrypt' : 'Viewable';
				var sharehost = snowUI.link.state === 'on' ? snowUI.snowPath.linkServer.host + '.' + _this.props.config.userSettings.linkName + '.' + val.apikey : snowUI.snowPath.share + '/' + val.apikey;
				return (
					
					<tr id={val._id} key={val._id} >
						<td  data-dccwid={val._id} data-dcciden={val.name} onClick={this.removeAsk} style={{cursor:"pointer"}} > <span  data-dccwid={val._id}  data-dcciden={val.name}  className="removedccwallet text-danger glyphicon glyphicon-remove"> &nbsp; </span></td>
						<td> <a href={sharehost} target="_blank">{val.apikey}</a> </td>
						<td> {val.coin} <br /> {format} </td>
						<td> {val.sign.pinop} <br /> {val.sign.keyphrase}  </td>
						<td> {val.address} <br /> {locked}  </td>
						<td> {moment(val.expires).format("llll")} </td>
					</tr>
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			<div >
				<div id="staticpage" className={"col-md-12  tab-pane fade  in active"}>
					<snowUI.ButtonToolbar>
						  <a type="button"  onClick={snowUI.methods.hrefRoute}  href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add'} className="btn btn-sm btn-default adddccwalletbutton">{text.button.add.text}</a>
					</snowUI.ButtonToolbar >
					<div className="snow-block-body">
						
						<div className="table-responsive">
							<table className="table table-hover snowtablesort" >
								<thead>
									<tr>
										<th><span className="glyphicon glyphicon-remove"></span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.findme.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.coin.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.account.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-order">{text.table.th.address.text}</span></th>
										<th  className="snowsortdate"><span className="glyphicon glyphicon-sort-by-order">{text.table.th.expires.text}</span></th>
									</tr>
								</thead>
								<tbody>
									{results}
								</tbody>
							</table>
						  </div>
						
					</div>
					<div className="clearfix"></div>
					{snowUI.snowModals.removeItem.call(this,this.removeNow)}
				</div>
			</div>			
		
			)
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						<option key={ w.key} value={w.key}  >{w.name}</option>
					);
				});
			}
			return (
				<div>
				
				  <form id="dccaddofflineform" onSubmit={this.submitForm} className="easytab reversetab">
				    <div className="adderror"></div>
					<div style={{marginLeft:10}}>
					      <ul id="dynamicaddtabs" className="nav nav-pills">
						<li className="active"><a data-target="TABfromwallet" data-toggle="pill">From Wallet</a></li>
						<li><a data-target="TABmanual" data-toggle="pill">Manual</a></li>
						
					      </ul>
					</div>    
				    <div className="tab-content">
					      
				      <div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>
							shortcut &nbsp;
							<a  className="helppopover" rel="popover" data-trigger="click focus" title="Accessing Share Pages" data-html="true" data-container="body" data-content={"<p>You can access share pages by the shortcut.</p><p>With a   <a href='http://snowcoins.link/snowcat' target='_blank'>.link account</a> you can share addresses like so: <a href='http://snowcoins.link/.snowkeeper.donate' target='_blank' >http://snowcoins.link/.snowkeeper.donate</a></p><p>There is also a <a href='"+snowUI.snowPath.share+"' target='_blank' >local page</a> you can expose to the internet instead of using a .link account.</p>"} data-toggle="popover" data-placement="bottom" ><span className="glyphicon glyphicon-question-sign "/> </a>
						</span>
						<input type="text" id="shortcut" name="shortcut" placeholder="must be unique" className="form-control coinstamp input input-faded" />
						<input type="hidden" name="action" defaultValue="add-offline" />
						<input type="hidden" name="useme" id="fw-useme" defaultValue="TABfromwallet" className="fw-useme" />
				      </div>
				      <div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Expires</span>
					<select name="expires" className="form-control input input-faded" >
					  <option value="laina">Never</option>
					  <option value="burnonimpact">One Use Only</option>
					  <option value="1">1 day</option>
					  <option value="7">1 week</option>
					  <option value="30">30 days</option>
					  <option value="180">6 months</option>
					  <option value="365">1 year</option>
					</select>
					</div>
				      <div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Display</span>
					<textarea type="textarea" rows="3" id="display" name="display" placeholder="Comments to the sender." className="form-control coinstamp input input-faded" /> 
				      </div>
				      
				      <div id="TABmanual" className="tab-pane ">
					
					<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Coin</span>
					  <span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span><input type="text" id="coin" name="coin" className="form-control coinstamp input input-faded ui-autocomplete-input" autoComplete="off" />
					</div>
				</div>
				<div id="TABfromwallet" className="tab-pane active">
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Wallet</span>
							<select id="fw-pickwallet" name="coinwallet" className="form-control input input-faded" >
								<option>Select A Wallet</option>
								{wallets}
							</select>
					</div>
					<div id="offlineaccount"  className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Account</span>
						<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span>
						<input type="text" id="account" name="account" placeholder="new or current account" className="form-control coinstamp input input-faded input input-faded ui-autocomplete-input" autoComplete="off" />
					</div>
					
				</div>
					
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>Address</span>
						<input type="text" id="address" name="address" placeholder="address" className="form-control coinstamp input input-faded" />
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon  coinstamp" style={{textTransform:'capitalize'}}>{snowUI.snowText.accounts.address.moreinfo.pin.text}</span>
						<input type="text"  name="pin" id="pin" placeholder={snowUI.snowText.accounts.address.moreinfo.pin.placeholder} className="form-control coinstamp" />
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon  coinstamp"  style={{textTransform:'capitalize'}}>{snowUI.snowText.accounts.address.moreinfo.pinphrase.text}</span>
						<input type="text"    name="keyphrase" id="keyphrase" placeholder={snowUI.snowText.accounts.address.moreinfo.pinphrase.placeholder} className="form-control coinstamp" />
					</div>
					<div className="form-group input-group">
						<span  className="input-group-addon   coinstamp" style={{textTransform:'capitalize',borderRight:'1px initial initial',paddingRight:25}}>
							{snowUI.snowText.accounts.address.moreinfo.lock.lockinput}
						</span>
							<select    id="lock" name="lock" className="form-control coinstamp">
								<option value="no">{snowUI.snowText.accounts.address.moreinfo.lock.option.no}</option>
								<option value="yes">{snowUI.snowText.accounts.address.moreinfo.lock.option.yes}</option>
							</select>
					</div>
					<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp"  style={{textTransform:'capitalize'}}>type</span>
						<select id="offlineformat" name="type" className="form-control input input-faded" >
						    <option value="1">Share</option>
						    <option value="2">Share and Payments</option>
						    <option value="3">Payments only</option>
						</select>
					</div>
				
					<div className="form-group">
						<button    disabled={(this.state.requesting) ? 'disabled' : ''}  className="btn " >{this.state.requesting ? 'Adding shortcut...' : 'Add Shortcut'}</button>
						<a type="button"  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component}   className="btn btn-default pull-right" >Cancel</a>
					</div>
				  </div>
					
				   
				</form>
				</div>
			)
		}.bind(this)
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			<div  style={{padding:'5px 20px'}} >
				{really()}
			</div>
		) 
	}
});


//client component
snowUI.receive.keys = React.createClass({
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
		if(snowUI.debug) snowLog.info('receive props keyspage' ,nextProps)
		return false;
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		return false;
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('keyspage did update')
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
		$("#keyspageform #type").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
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
		if(snowUI.debug) snowLog.info('submit keyspageform add form',e)
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
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','API Access granted',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.err,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
		return false;
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open remove modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' client api key ' + iden,removeItem:true});
		return false;
		//snowUI.methods.modals.removeItem.open();
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state._candidate)
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
					if(snowUI.debug) snowLog.warn(resp.error)
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
		if(snowUI.debug) snowLog.log('client keys component')
		snowUI.loaderRender();
		var text = snowUI.snowText.receive.keys,
			results;
			
		var addItem = function() {
			return (
			
			<div>
				<form id="keyspageform" onSubmit={this.submitForm} >
					<div className="snow-block-heading">{text.form.name.title}</div>
						<div className="adderror"></div>
					
					
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:65,marginLeft:-5}}>{text.form.name.text}</div></span>
						<input type="text" id="name" name="name" placeholder="name of master" className="form-control coinstamp input input-faded" />
					</div>
					
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:65,marginLeft:-5}}>{text.form.apikey.text}</div></span>
						<input type="text" id="apikey" name="apikey" placeholder="leave blank to generate a key" className="form-control coinstamp input input-faded" />
						<input type="hidden" name="action" value="client-api" />
					</div>
					<div className="col-xs-6   " style={{marginBottom:12,fontWeight:'bold',textAlign:'left'}}>
						{text.form.controls.master}
					</div>
					
					<div className="col-xs-6  "  style={{marginBottom:12,fontWeight:'bold',textAlign:'right'}}>
						{text.form.controls.client}
					</div>
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp"><div style={{width:65,marginLeft:-5}}>{text.form.auth.text}</div></span>
						<select name="authlevel" className="form-control input input-faded" defaultValue="8">
							<optgroup label="D3C Master Keys" >
								<option value="1">{text.form.controls.select.a}</option>
								<option value="2">{text.form.controls.select.b}</option>
								<option value="3">{text.form.controls.select.c}</option>
								<option value="4">{text.form.controls.select.d}</option>
								<option value="5">{text.form.controls.select.e}</option>
							</optgroup>
							<optgroup label="D2C Client Keys" >
								<option value="6">{text.form.controls.select.f}</option>
								<option value="7">{text.form.controls.select.g}</option>
								<option value="8">{text.form.controls.select.h}</option>
								<option value="9">{text.form.controls.select.i}</option>
								<option value="10">{text.form.controls.select.j}</option>
							</optgroup>
						</select>
					</div>
					
					<div className="form-group input-group">
						<span className="input-group-addon input-group-sm coinstamp">
							<div style={{width:65,marginLeft:-5}}>
								{text.form.range.text} 
								<a  style={{marginLeft:7}} data-toggle="popover" data-placement="bottom" data-container="body"  rel="popover" data-trigger="focus click"  title="Limiting Access By IP Range" data-html="true" data-content={text.form.range.title}>
									<span className="glyphicon glyphicon-info-sign " />
								</a>
							</div>
						</span>
						<div className="col-sm-8">
							<input type="text" ref="ip" name="ip" placeholder="0.0.0.0/0" className="form-control coinstamp input input-faded" />
						</div>
						<div className="col-sm-4">
							<select ref="pickip" className="form-control input input-faded" defaultValue="3" onChange={this.ipRange}>
								
								<option value="2">{text.form.ip.select.a}</option>
								<option value="4">{text.form.ip.select.b}</option>
								<option value="5">{text.form.ip.select.c}</option>
								<option value="6">{text.form.ip.select.d}</option>
								<option value="1">{text.form.ip.select.e}</option>
								<option value="3" >{text.form.ip.select.f}</option>
								
							</select>
						</div>
					</div>
					<div className="form-group">
						<button    disabled={(this.state.requesting) ? 'disabled' : ''}  className="btn " >{this.state.requesting ? text.form.button.adding : text.form.button.add}</button>
						<a type="button"  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component}   className="btn btn-default pull-right" >{text.form.button.cancel}</a>
					</div>
				</form>
			</div>
			
			
			)
		}.bind(this)
		
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				
				return (
					
					<tr id={val._id} key={val._id} >
						<td  data-dccwid={val._id} data-dcciden={val.name} onClick={this.removeAsk} style={{cursor:"pointer"}} > <span  data-dccwid={val._id}  data-dcciden={val.name}  className="removedccwallet text-danger glyphicon glyphicon-remove"> &nbsp; </span></td>
						<td> {val.name} </td>
						<td> <a href={(val.type === 'master' ?  snowUI.snowPath.d3c :  snowUI.snowPath.d2c) + '/' + val.apikey} target="_blank" >{val.type}</a> </td>
						<td> {val.apikey} </td>
						<td> {val.ip || '--'}  </td>
						<td> {val.clients.length>0 ? val.clients.map(function(v){ return ' ' + v.name + ' ' }) : val.type === 'master' ? 'all clients' : '--'}  </td>
					</tr>
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
				<div >
					<div id="keyspage" className={"col-md-12  tab-pane fade  in active"}>
						<div className="snow-block-body">
							<snowUI.ButtonToolbar>
								  <a type="button"  onClick={snowUI.methods.hrefRoute}  href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add'} className="btn btn-sm btn-default ">{text.button.add.text}</a>
							  
							</snowUI.ButtonToolbar >
							<div className="table-responsive">
								<table className="table table-hover snowtablesort" >
									<thead>
										<tr>
											<th><span className="glyphicon glyphicon-remove"></span></th>
											<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.name.text}</span></th>
											<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.type.text}</span></th>
											<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.key.text}</span></th>
											<th  ><span className="glyphicon glyphicon-sort-by-order">{text.table.th.ip.text}</span></th>
											<th  className="snowsortcountitems"><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.manages.text}</span></th>
										</tr>
									</thead>
									<tbody>
										{results}
									</tbody>
								</table>
							  </div>
							
						</div>
						<div className="clearfix"></div>
					</div>
					
					{snowUI.snowModals.removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this) )}
				</div>			
			)
		}.bind(this)
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			<div  style={{padding:'5px 20px'}} >
				{really()}
			</div>
		)
	}
});



//trackers component
snowUI.receive.trackers = React.createClass({
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
		if(snowUI.debug) snowLog.info('tracker receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('trackers did update')
		if(!this.state.listen)this.listen()
		
		snowUI.watchLoader();
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props)
				
	},
	componentWillUnMount: function() {
		
			
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('trackers did mount')
		snowUI.watchLoader();
		if(!this.state.listen)this.listen()
	},
	listen: function() {
		if(!this.state.listen)this.setState({listen:true});
		$("#dcctrackerform #receivertype").autocomplete({ source: snowUI.defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
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
		if(snowUI.debug) snowLog.info('submit trackers add form',e)
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
					
					snowUI.methods.valueRoute(snowUI.snowPath.receive + '/' + _this.props.config.page)
					snowUI.flash('success','Tracker added',2500)
					this.setState({requesting:false});
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					_this.setState({requesting:false});
					snowUI.flash('error',resp.error,3500)
					//_this.setState({error:true,message:'Error retrieving data',connecting:false})
				}
			}.bind(this))
			
		}
	},
	removeAsk: function(e) {
		
		if(snowUI.debug) snowLog.log('open tracker modal',e.target,e.target.dataset.dccwid)
		
		var target = e.target.dataset.dccwid,
			iden = e.target.dataset.dcciden;
		this.setState({_candidate:target,_iden:' tracker ' + iden,removeItem:true});
		
		
		
	},
	removeNow: function(e) {
		if(snowUI.debug) snowLog.log('removeNow',this.state)
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
					if(snowUI.debug) snowLog.error(resp)
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
		if(snowUI.debug) snowLog.log('trackers component', this.props)
		
		var text = snowUI.snowText.receive.trackers,
			results;
		
		var list = this.props.state.data[this.props.state.component]
		
		if(list instanceof Array) {
			var results = list.map(function (val) {
				if(typeof val.owner !== 'object' || val.owner === null)val.owner = {name: {first:'',last:''}}
				//console.log(typeof val.owner,val.owner.name)
				var removeme = (val.type === 'user' || val.type === 'leech') ? (<td  data-dccwid={val._id} data-dcciden={val.name} onClick={this.removeAsk} style={{cursor:"pointer"}} > <span  data-dccwid={val._id}  data-dcciden={val.name}  className="removedccwallet text-danger glyphicon glyphicon-remove"> &nbsp; </span></td>) : (<td></td>)
				return (
					
					<tr id={val._id} key={val._id} >
						{removeme}
						<td className="bstooltip" data-toggle="tooltip" data-placement="top"  title={'Owner: '+val.owner.name.first.charAt(0).toUpperCase() + '. ' + val.owner.name.last}> {val.name} </td>
						
						<td> {val.type} </td>
						<td> {val.watch.watching ===  true ? 'watch':val.interval/1000<3600 ? val.interval/1000+' secs':val.interval/1000/60 > 59 ? Math.floor(val.interval/1000/60/60)+' hrs': val.interval/1000/60+' mins' } </td>
						<td>{moment(val.last).format("llll")} </td>
						<td> {val.wallet ? val.wallet.name : '--'} </td>
						
						<td> {val.account || '--'}  </td>
						<td> {val.address || '--'}  </td>
					</tr>
				);
			}.bind(this));
		}
		var renderList = function() {
			return (
			<div >
				<div id="trackerspage" className={"col-md-12  tab-pane fade in active"}>
					<div className="snow-block-body">
						  <a type="button"  onClick={snowUI.methods.hrefRoute}  href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component + '/add'} className="btn btn-sm btn-default adddccwalletbutton">{text.button.add.text}</a>
						  <div className="table-responsive">
							<table className="table table-hover snowtablesort">
								<thead>
									<tr>
										<th><span className="glyphicon glyphicon-remove"></span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.name.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.type.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.interval.text}</span></th>
										<th className="snowsortdate" ><span className="glyphicon glyphicon-sort-by-alphabet ">{text.table.th.date.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.wallet.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-alphabet">{text.table.th.account.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort-by-order">{text.table.th.address.text}</span></th>
									</tr>
								</thead>
								<tbody>
									{results}
								</tbody>
							</table>
						  </div>
						
					</div>
					<div className="clearfix"></div>
				</div>
				{snowUI.snowModals.removeItem.call(this,this.removeNow,function(){ this.setState({removeItem:false}) }.bind(this) )}
			</div>			
		
			);
		}.bind(this)
		var addItem = function() {
			if(this.props.config.mywallets instanceof Array) {
				var wallets = this.props.config.mywallets.map(function (w) {
					return (
						<option key={ w.key} value={w.key}  >{w.name}</option>
					);
				});
			}
			return (
				<div>
					<form id="dcctrackerform" onSubmit={this.submitForm} className="easytab reversetab">
						
						<div className="adderror"></div>
						
						<div style={{marginLeft:10}}>
							<ul id="dynamicaddtabs" className="nav nav-pills"  role="tablist" data-tabs="pills">
								<li className="active"><a data-target="TABwallet" role="pill" data-toggle="pill">Interval</a></li>
								<li><a data-target="TABwatch" role="pill" data-toggle="pill">File Watcher</a></li>
							</ul>
						</div>
						<div className="tab-content">
							<div className="form-group input-group">
								<span className="input-group-addon input-group-sm coinstamp">Name</span>
								<input type="text" ref="name" name="name" placeholder="name of tracker" className="form-control coinstamp input input-faded" />
							</div>
							<div className="form-group input-group">
								<span className="input-group-addon input-group-sm coinstamp">Wallet</span>
								<select ref="trackerwallet" id="trackerwallet" name="trackerwallet" className="form-control input input-faded" >
									<option>Select A Wallet</option>
									{wallets}
								</select>
							</div>
							<div id="addreceiveraccount"  className="form-group input-group">
									<span className="input-group-addon input-group-sm coinstamp">Account</span>
									<span role="status" aria-live="polite" className="ui-helper-hidden-accessible"></span><input type="text" ref="account" id="account" name="account" placeholder="new or current account" className="form-control coinstamp input input-faded input input-faded ui-autocomplete-input" autoComplete="off" />
							</div>
							<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Address</span>
										<select id="dccpickaddress" name="dccpickaddress" className="form-control input input-faded" >
										<option id="cnao" value="">No Address</option>
										<option id="cna" value="new">Create New Address</option>
									</select>
								 </div>
							<div id="TABwallet" className="tab-pane active ">
								
								
								
								
							</div>
							<div id="TABwatch" className="tab-pane ">
								<p className="">File watcher will watch a local wallet file and process transactions when it changes.</p>
								<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">File Path</span>
									<input type="text" id="root" name="root" ref="root" placeholder="/full/file/path/without/trailing/slash" className="form-control coinstamp input input-faded" />
								</div>
								<div className="form-group input-group"><span className="input-group-addon input-group-sm coinstamp">Wallet file</span>
									<input type="text" id="dat" ref="dat" name="dat" defaultValue="wallet.dat" className="form-control coinstamp input input-faded input input-faded ui-autocomplete-input" />
								</div>
								
							</div>
							
							<div className="form-group">
								<button    disabled={(this.state.requesting) ? 'disabled' : ''}  id="confirmchangepassphrase" className="btn " >{this.state.requesting ? 'Adding...' : 'Add Tracker'}</button>
								<a type="button"  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.receive + '/' + this.props.state.component}   className="btn btn-default pull-right" >Cancel</a>
							</div>
						</div>
						<input type="hidden" ref="action" name="action" value="add-tracker" />
						<input type="hidden" name="useme" ref="useme" id="fw-useme" defaultValue='TABwallet' className="fw-useme" />
					</form>
				</div>
			)
		}.bind(this)
		
		
		//include our page
		if(this.props.config.moon === 'add') {
			var really = addItem
		} else {
			var really = renderList
		}
		return (
			<div  style={{padding:'5px 20px'}} >
			
				
			
				{really()}
			</div>
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
