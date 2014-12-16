/**
 * @jsx React.DOM
 */

/**
 * settings components
 * */
//main
snowUI.settings.UI = React.createClass({
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
		
		if(snowUI.debug) snowLog.log('settings willgetprops','false state:',_state,nextProps)
		
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
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('settings did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('settings did mount',this.state.component,this.props.config.page)
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
		if(snowUI.debug) snowLog.info(me)
		//me.tab('show')
		snowUI.methods.valueRoute(snowUI.snowPath.settings + '/' + me[0].dataset.target,options)
	},
	render: function() {
		
		var renderMe,
			showcomp = this.props.config.page || this.state.component
		
		if(snowUI.debug) snowLog.log('settings component',this.state,this.props)
		
		if(!this.state.data) {
			if(snowUI.debug) snowLog.warn('empty render for receive')
			renderMe=(<div />)
		
		} else if(snowUI.settings[showcomp]) {
			
			var po = snowUI.settings[showcomp]
			renderMe = (<po config={this.props.config} state={this.state} UI={this} />)
			var tp ='0px'
		
		} else {
			
			renderMe = (<snowUI.wallet.displayMessage  title = '404 Not Found' message = 'I could not find the page you are looking for. ' type = 'requesterror' />)
			var tp='20px'
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
				<div style={{padding:tp +' 10px 0 10px'}} className="tabbox clearfix" id="maindiv">
					
					<ul className="nav nav-pills dccnavlis"  role="tablist" data-tabs="pills" >
						<li className="active" ><a onClick={this.changeTab}  data-target="rates" role="pill" data-toggle="pill" title={snowUI.snowText.settings.menu.rates.title} >{snowUI.snowText.settings.menu.rates.text}</a></li>
						<li  ><a onClick={this.changeTab}  data-target="language" role="pill" data-toggle="pill" title={snowUI.snowText.settings.menu.language.title}>{snowUI.snowText.settings.menu.language.text}</a></li>
						<li ><a  role="pill" data-toggle="pill"  onClick={snowUI.methods.hrefRoute} title={snowUI.snowText.settings.menu.autobot.title} href={snowUI.snowPath.link}>{snowUI.snowText.settings.menu.autobot.text}</a></li>
						<li><a onClick={this.reload}><span className="glyphicon glyphicon-refresh"></span></a></li>
					</ul>
					<div className="clearfix" style={{marginTop:10}}>
						{renderMe}
					</div>
				</div>
				<div className="clearfix"></div>
			</div>		
		</div>
	    )
	},
	reload: function() {
		location.reload()
	}
});


//rate component
snowUI.settings.rates = React.createClass({
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
		if(snowUI.debug) snowLog.info('rates receive props' ,nextProps)
		
	},
	shouldComponentUpdate: function() {
		return this.state.canUpdate
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('rates did update')
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
		if(snowUI.debug) snowLog.info('submit rate parameter form',e)
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
				if(snowUI.debug) snowLog.error(resp)
				this.setState({requesting:false});
				snowUI.flash('error',resp.err,3500)
				
			}
		}.bind(this))
			
		
	},
	render: function() {
		if(snowUI.debug) snowLog.log('rates component', this.props)
		
		var text = snowUI.snowText.settings.rates,
			results,
			snowmoney = this.props.state.data.snowmoney,
			rates = this.props.state.data.rates;
		var _this = this
		
		//if we have snowmoney.usd print a chart
		var shortlist = function() {
			
			if (snowmoney.usd) {
				
				return (<div className="table-responsive">
					<table className="table" style={{fontSize:14}}>
						<tbody>
							<tr>
								<td style={{border:'none'}}>
									<div className="crcurrency" >1 USD </div>
									<div>
										{parseFloat(snowmoney.usd.btc.price).formatMoney(8)} 
										<span className="coinstamp"> BTC </span>
									</div>
									<div> 
										{parseFloat(snowmoney.usd.ltc.price).formatMoney(8)} 
										<span className="coinstamp"> LTC</span>
									</div>
									<div> 
										{snowmoney.usd.doge.price ? parseFloat(snowmoney.usd.doge.price).formatMoney(8) : 'n/a'} 
										<span className="coinstamp"> Ð</span>
									</div>
									<div> 
										<span className="coinstamp">  € </span>
										<span> {snowmoney.eur.usd.price ? parseFloat((1/snowmoney.eur.usd.price)).formatMoney(8) : 'n/a'} </span>
									</div>
								</td>
							
								<td style={{border:'none'}}>
									<div className="crcurrency" >1 BTC </div>
									<div>
										<span className="coinstamp"> $ </span>{parseFloat(snowmoney.btc.usd.price).formatMoney(8) || 'n/a'} 
										
									</div>
									<div> 
										{(1/parseFloat(snowmoney.ltc.btc.price)).formatMoney(8) || 'n/a'}  
										<span className="coinstamp"> LTC</span>
									</div>
									<div> 
										{(1/parseFloat(snowmoney.doge.btc.price)).formatMoney(8) || 'n/a'} 
										<span className="coinstamp"> Ð</span>
									</div>
									<div> 
										<span className="coinstamp">  € </span>
										<span> {parseFloat(snowmoney.btc.eur.price).formatMoney(8) || 'n/a'} </span>
									</div>
								</td>
							
								<td style={{border:'none'}}>
									<div className="crcurrency" >1 EUR </div>
									<div>
										{parseFloat(snowmoney.eur.btc.price).formatMoney(8) || 'n/a'}  
										<span className="coinstamp"> BTC </span>
									</div>
									<div> 
										{(parseFloat(snowmoney.eur.ltc.price)).formatMoney(8) || 'n/a'}
										<span className="coinstamp"> LTC</span>
									</div>
									<div> 
										{(parseFloat(snowmoney.eur.doge.price)).formatMoney(8) || 'n/a'} 
										<span className="coinstamp"> Ð</span>
									</div>
									<div> 
										<span className="coinstamp">  $ </span>
										<span> {parseFloat(snowmoney.eur.usd.price).formatMoney(8) || 'n/a'} </span>
									</div>
								</td>
							</tr>		
						</tbody>
					</table>
				</div>)
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
						
						<tr id={val.ticker} key={val.ticker} >
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals "+ i }>{i}</span></td>
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals " + (val.btc.price || 'n/a' )+ " BTC" }>{val.btc.price || ''}</span></td>
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals " + (val.usd.price || 'n/a' )+ " USD" }>{val.usd.price || ''}</span></td>
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals " + (val.eur.price || 'n/a' )+ " EUR" }>{val.eur.price || ''}</span></td>
							
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals " + (val.ltc.price || 'n/a') + " LTC" }>{val.ltc.price || ''}</span></td>
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"1 " + i.toUpperCase() + " equals " + (val.doge.price || 'n/a') + " DOGE" }>{val.doge.price || ''}</span></td>
							<td> <span className="bstooltip" data-toggle="tooltip"  data-placement="bottom" title={"value recorded at " + val.published }>{moment(val.published).format("YYYY-MM-DD HH:mm:ss")}</span></td>
						</tr>
					);
				} 
			}.bind(this));
		}
		var addItem = function() {
			
			return (
				<div>
					<div id="ratespage" className={"col-md-12  tab-pane fade in active"}>
						<div  style={{padding:'5px 20px'}} >
							<div className="col-xs-12 ">
								<h4 className="profile-form__heading">Set parameters for syncing rates</h4>
							</div>
							<form id="ratesupdateform" onSubmit={this.submitForm}>
								<div className="adderror" />
								<p> Last Run: {moment(this.props.state.data.rateparameters.last).format("LLLL")}</p>
								<p> Next Run: {moment(this.props.state.data.rateparameters.last).add(this.props.state.data.rateparameters.interval,'ms').format("LLLL")}</p>
								<div className="form-group">
									<label htmlFor="crupdatetime"> {text.schedule.label.when}</label>
									<div className="clearfix" />
									<div className="col-md-6 col-xs-12">
										<select id="when" name="when" className="form-control" defaultValue={this.props.state.data.rateparameters.interval/1000}>
											
											<option value='15' > 15 secs</option>
											<option value='60'> 1 minutes</option>
											<option value='900' > 15 minutes</option>
											<option value='1800'> 30 minutes</option>
											<option value='2700' > 45 minutes</option>
											<option value='3600' > 60 minutes</option>
											<option value='5400' > 90 minutes</option>
											<option value='7200'>2 hours</option>
											<option value='14400' > 4 hours</option>
											<option value='21600' > 6 hours</option>
											<option value='28800'> 8 hours</option>
											<option value='36000'> 10 hours</option>
											<option value='43200' > 12 hours</option>
											<option value='64800' > 18 hours</option>
											<option value='86400' > 24 hours</option>
										</select>
									</div>
								</div>		
								<div className="clearfix" />
								<div className="form-group" style={{marginTop:15}}>
									<label htmlFor="crapi"> {text.schedule.label.which}</label>
									<div className="clearfix" />
									<div className="col-md-6 col-xs-12 clearfix">
										<select id="api" name="api" className="form-control" defaultValue={this.props.state.data.rateparameters.doGrab.arguments}>
											<option> cryptocoincharts </option>
											<option disabled> prelude.io </option>
										</select>
									</div>	
								</div>
								<div className="clearfix"  style={{marginTop:15}}/>
								<div className="form-group"   style={{marginTop:15}}>
									<input type="hidden" name="action" value="setcurrencyrates" />
									<button    disabled={(this.state.requesting) ? 'disabled' : ''}  id="updaterates" className="btn " >{this.state.requesting ? 'Updating...' : 'Update Parameters'}</button>
									 &nbsp; &nbsp; <a type="button"  onClick={snowUI.methods.hrefRoute} href={snowUI.snowPath.root + snowUI.snowPath.settings + '/' + _this.props.config.page + ''}   className="btn btn-default" >Cancel</a>
								</div>
							</form>
						</div>
					</div>
				</div>
			)
		}.bind(_this)
		var renderList = function() {
			return (
			<div >
				<div id="ratespage" className={"col-md-12  tab-pane fade in active"}>
					<div className="snow-block-body">
						  <div className="table-responsive">
							
							{shortlist()}				
							 
							 <a type="button"  onClick={snowUI.methods.hrefRoute}  href={snowUI.snowPath.root + snowUI.snowPath.settings + '/' + this.props.state.component + '/update'} className="btn btn-sm btn-default ">{text.button.add.text}</a>
						 
							<table className="table table-hover snowtablesort"  >
								<thead>
									<tr>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.coin.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.btc.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.usd.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.eur.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.ltc.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.doge.text}</span></th>
										<th  ><span className="glyphicon glyphicon-sort">{text.table.th.time.text}</span></th>
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
				
			</div>			
		
			);
		}.bind(_this)
		
		//include our page
		if(this.props.config.moon === 'update') {
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
//language component
snowUI.settings.language = React.createClass({
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
		
		if(snowUI.snowLanguages.list.indexOf(newl) > -1) {
			snowUI.ajax.GET(url,data,function(resp) {
				if(resp.success === true && resp.data.language) {
					
					if(snowUI.debug) snowLog.info('set user language')
					
					snowUI.snowLanguages.mylanguage = newl
					snowUI.snowLanguages.language = resp.data.language;
					
					snowUI.flash('success',snowUI.snowText.settings.messages.success.changeLanguage,15000);
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false})
						
					
				} else {
					if(snowUI.debug) snowLog.error(resp)
					snowUI.flash('error','Error changing language. ' + resp.err) 
				}
				return false
			})
		} else {
			snowUI.flash('error','Language ' + newl + ' is not available')
		}
		
		
	},
	render: function() {
		if(snowUI.debug) snowLog.log('language component')
		var _this = this;
		var l = snowUI.snowLanguages.list;
		var listlanguages = l.map(function(v){
			var list = (v === snowUI.snowLanguages.mylanguage) ? (<strong> {v.toUpperCase()}</strong>) : v;
			if(v!=='default' && v !== 'mylanguage')return (<div key={v} style={{padding:'4px 0',fontSize:16}} title={snowUI.snowText.settings.language.switch.text + v.toUpperCase()}><a onClick={_this.changeLanguage} data-snowlanguage={v} className={v === snowUI.snowLanguages.mylanguage ? 'active':''}>{list}</a></div>)
		})
		return (<div  style={{padding:'5px 20px'}} >
			
				<div id="languagepage" className={"col-md-12  "}>
					<div  style={{padding:'5px 20px'}} >
						<div className="col-xs-12 ">
							<h4 className="profile-form__heading">{snowUI.snowText.settings.language.choose.text}</h4>
						</div>	
						<div>
						{listlanguages}
						
						</div>
					</div>
				</div>
			</div>);
	}
});

//inq component
snowUI.link.UI = React.createClass({
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
		
		if(snowUI.debug) snowLog.log('link willgetprops','false state:',_state,nextProps)
		
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
				if(snowUI.debug) snowLog.info('got data for ' + po,resp.data,po)
				cb(resp.data)
			} else {
				if(snowUI.debug) snowLog.error(resp)
				_this.setState({error:true,message:'Error retrieving data',connecting:false})
			}
		})
	},
	componentWillUpdate: function() {
		
		
	},
	componentDidUpdate: function() {
		if(snowUI.debug) snowLog.info('link did update')
		this.componentDidMount()
	},
	componentWillMount: function() {
		this.componentWillReceiveProps(this.props);
				
	},
	componentWillUnMount: function() {
		
				
	},
	componentDidMount: function() {
		if(snowUI.debug) snowLog.info('link did mount',this.props.config.wallet)
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
						if(snowUI.debug) snowLog.info('update DDNS',resp);
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
					if(snowUI.debug) snowLog.error(resp);
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
						if(snowUI.debug) snowLog.info('remove DDNS',resp);
						snowUI.flash('success',resp.data.link.data.message,10000);
						var _state={}
						_state.data = data;
						_state.connecting = false;
						_state.ready = true;
						_state.showddns = false;
						_this.setState(_state)
						
					});
					
				} else {
					if(snowUI.debug) snowLog.error(resp);
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
					if(snowUI.debug) snowLog.info('set share key',resp);
					if(!resp.data.userSettings.linkName) {
						snowUI.flash('error',snowUI.snowText.link.messages.success.setsharekey + ' :: Share key is not valid! ',15000);
					} else {
						snowUI.flash('success',snowUI.snowText.link.messages.success.setsharekey,15000);
					}
					_this.setState({showsharekey:false});
					//fake out the UI and refresh
					snowUI.methods.updateState({showErrorPage:false,connecting:false});
				} else {
					if(snowUI.debug) snowLog.error(resp);
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
					if(snowUI.debug) snowLog.info('set send key');
					snowUI.flash('success',snowUI.snowText.link.messages.success.setsendkey,15000);
					//fake out the UI and refresh
					_this.setState({showsendkey:false,connecting:false});
					snowUI.methods.updateState({showErrorPage:false});
				} else {
					if(snowUI.debug) snowLog.error(resp);
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
			if(snowUI.debug) snowLog.info('ping',resp)
			if(resp.success === true) {
				snowUI.killFlash('message');
				if(snowUI.debug) snowLog.info('pinged .link remote server');
				snowUI.flash('success','Ping Sent and Received successfully.',6000);
				//fake out the UI and refresh
				_this.setState({connecting:false});
				
			} else {
				if(snowUI.debug) snowLog.error(resp);
				snowUI.killFlash('message');
				var _state = {connecting:false}
				_this.setState(_state);
				snowUI.flash('error','' + resp.err,10000) ;
			}
			return false;
		})
			
	},
	render: function() {
		if(snowUI.debug) snowLog.log('link component',this.state)
		var _this = this;
		if(this.state.ready) {
			var shareKey = this.state.data.userSettings.shareKey,
				sendKey = this.state.data.userSettings.sendKey,
				linkName = this.state.data.userSettings.linkName,
				hostname = this.state.data.userSettings.ddnsHostname;
				
			var setkey;
			var inputkeyshare = [];
			if(shareKey) {
				 inputkeyshare.push (<div key="aa123"  className="clearfix"><p>shareKey: <strong>{shareKey}</strong></p><p>linkName:  <strong>{linkName}</strong></p></div>);
			} else {
				inputkeyshare.push(<div key="aaa1234"><p><span dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.nosharekey.text}} /> </p></div>);
				if(!this.state.showsharekey)inputkeyshare.push(<div key="bb12345"> <p> You do not have a share key on file. </p></div>)
			}
			if(this.state.showsharekey) {
				 inputkeyshare.push (<div style={{clear:'both'}} />);
				 inputkeyshare.push (<div key="aa12" className="clearfix"><form className="" role="form"  onSubmit={_this.setShare}>
							 <div className="form-group">
								<label  className="sr-only" htmlFor="sharekeyinput">{snowUI.snowText.link.access.addsharekey.text} </label>
								<input type="text" className="form-control" ref="sharekeyinput" placeholder={snowUI.snowText.link.access.addsharekey.text} />
							
							</div>
							<div className="form-group">
								<button className="btn "  disabled={(this.state.connecting) ? 'disabled' : ''}  style={{marginBottom:0}}>{(this.state.connecting) ? snowUI.snowText.link.access.addsharekey.loading:snowUI.snowText.link.access.addsharekey.text}</button> 
								&nbsp;<a style={{marginBottom:0}} className="btn btn-default pull-right"  onClick={_this.showShareInput}>cancel</a>
							</div>
							</form>
							<div className="clearfix" style={{height:25,width:100,position:'relative'}} />
							</div>
				);
			}	
			var inputkeysend;
			if(this.state.showsendkey) {
				inputkeysend = (<div>
							<form className="" role="form" onSubmit={_this.setSend}>
								<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addsendkey.info}} /> 
							 <div className="form-group">
								<label className="sr-only" htmlFor="sendkeyinput">{snowUI.snowText.link.access.addsendkey.text} </label>
								<input style={{width:'100%'}} type="text" className="form-control" ref="sendkeyinput" placeholder={snowUI.snowText.link.access.addsendkey.text} />						
							</div>
							<div className="form-group">
								<button className="btn "  disabled={(this.state.connecting) ? 'disabled' : ''}  style={{marginBottom:0}}>{(this.state.connecting) ? snowUI.snowText.link.access.addsendkey.loading:snowUI.snowText.link.access.addsendkey.text}</button>
								&nbsp;<a style={{marginBottom:0}} className="btn btn-default pull-right" onClick={_this.showSendInput}>cancel</a>
							</div>
							</form>
							<div className="clearfix" style={{height:25,width:100,position:'relative'}} />
							</div>
				);
			} else if(sendKey) {
				 inputkeysend =  (<div className="col-xs-12"><div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.setsendkey.text}} /></div>);
			} else {
				inputkeysend = (<div><p>{snowUI.snowText.link.access.setsendkey.absent}<br /> </p></div>);
			}
			
			var ddns;
			if(this.state.showddns) {
				ddns = (<div className=" link-info">
						<form className="" role="form" onSubmit={_this.setDDNS}>
							<div className="col-xs-12  col-md-6" style={{padding:'5px'}}>
								<div className="link-head">
									{snowUI.snowText.link.linkaccount.ddns}	
								</div>
								<div  style={{padding:'5px'}}>
									<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.text}} /> 
									<div className="form-group input-group col-xs-12">
										<input ref="oldhostname" type="hidden" value={hostname} />
										<input style={{textAlign:'right'}} type="text" className="form-control" ref="hostname" placeholder={snowUI.snowText.link.access.addddns.text} defaultValue={hostname} />
										<span className="input-group-addon input-group ">.{snowUI.snowText.link.domain}</span>
															
									</div>
									<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.ddnsInfo}} /> 
									<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.trackerInfo}} />
								</div>
								<div className="clearfix" style={{marginBottom:'25px'}} />
								
							</div>
							
							<div className="col-xs-12 col-md-6"  style={{padding:'5px'}}>
								<div className="link-head">
									{snowUI.snowText.link.linkaccount.link}	
								</div>
								<div  style={{padding:'5px'}}>
									<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.linkAsk}} />
									
										
										<div  className="col-xs-12 form-group input-group ">
											<select style={{width:'100px',fontSize:'16px'}} ref="use"  className="form-control coinstamp"  defaultValue={this.state.data.userSettings.linkServer}>
												<option value="off">{snowUI.snowText.accounts.address.moreinfo.lock.option.no}</option>
												<option value="on">{snowUI.snowText.accounts.address.moreinfo.lock.option.yes}</option>
											</select>
											<span style={{width:'60px'}} className="input-group-addon input-group ">{snowUI.snowText.link.access.addddns.port}</span>
											<input style={{width:'auto'}}  type="text" className="form-control" ref="port" placeholder="port (12777)" defaultValue={snowUI.link.port} />
											
										</div>
										<div  className="col-xs-12 " dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.allow.replace('{port}',snowUI.link.port)}} />
									
									<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.access.addddns.linkInfo.replace('{port}',snowUI.snowPath.link.port)}} />
									
								</div>
							</div>
							
							
							<div className="clearfix" />
							<div className="form-group col-xs-12 " style={{padding:'0 10px'}}>
								<button className="btn center-block"   disabled={(this.state.connecting) ? 'disabled' : ''}   style={{marginBottom:0}}>{this.state.connecting ? snowUI.snowText.link.access.addddns.buttonadding : snowUI.snowText.link.access.addddns.button}</button>
								 &nbsp; &nbsp; <a style={{marginBottom:0}} className="btn btn-default center-block" onClick={_this.showDDNSInput}>cancel</a>
							</div>
						</form>
						
					</div>
				);
			} else if(hostname) {
				 var hostb = this.state.data.userSettings.ddnsHostB ? <div> <a target="_blank" href={"http://" + this.state.data.userSettings.ddnsHostB} >  {this.state.data.userSettings.ddnsHostB} </a> </div>: '';
				 
				 var list2 = snowUI.link.sockets + ' open connections.';
				 var linkserver = snowUI.link.state === 'on' ? <div><a title="Only accepts valid requests from snowcoins.link" target="_blank" href={this.state.data.userSettings.ddnsProtocol +  this.state.data.userSettings.ddnsHost + ':' + snowUI.link.port}>{snowUI.link.port}</a> <br />{list2}<br /><a title="Test the server out.  This will ping the remote .link server and ask it to check in with our local .link server." onClick={this.linkPhoneHome}>Test Connection</a></div> : <b>.link off</b>;
				
				 ddns =  (<div className="col-xs-12 table-responsive">
					
					<input ref="oldhostname" type="hidden" value={hostname} />
					
					<table  className="table snowtablesort">
						 
						<thead>
							<th>machine </th>
							<th>DDNS </th>
							<th>Port</th>
							<th>IP Address</th>
							<th>Last Updated</th>
							<th>.link Port</th>
							<th style={{textAlign:'center'}}>Remove</th>
						</thead>
						<tbody>
							<tr>
								<td>{this.state.data.userSettings.ddnsHostname}</td>
								<td>
									<a target="_blank" href={'http://' + this.state.data.userSettings.ddnsHost} >{this.state.data.userSettings.ddnsHost}</a>
									{hostb}
								</td>
								<td dangerouslySetInnerHTML={{__html: this.state.data.userSettings.ddnsPort}} />
								<td>{this.state.data.userSettings.ddnsIP}</td>
								<td>{moment(this.state.data.userSettings.ddnsLastUpdated).format("llll")}</td>
								
								<td >{linkserver}</td>
								
								<td data-snowddns={hostname} className="bg-danger" style={{cursor:'pointer',textAlign:'center'}} onClick={_this.removeDDNS} ><span className="text-not-white glyphicon glyphicon-remove-sign"></span></td>
							</tr>
							<tr>
								<td colSpan="5"><a  className="btn btn-default btn-sm" onClick={_this.showDDNSInput}>{snowUI.snowText.link.access.addddns.addbutton}</a></td>
							</tr>
						</tbody>
					</table>
				 </div>);
			} else {
				ddns = (<div className=" link-info"><p>{snowUI.snowText.link.access.addddns.absent}</p><a  className="btn btn-default btn-sm" onClick={_this.showDDNSInput}>{snowUI.snowText.link.access.addddns.addbutton}</a></div>);
			}
				
			
			return (<div  style={{padding:'5px 20px'}} >
				
					<div id="linkpage" className={"col-md-12  "}>
						<div  style={{padding:'5px 20px'}} >
							<div className="col-xs-12 ">
								<h4 className="profile-form__heading">{snowUI.snowText.link.title.text}</h4>
								<div dangerouslySetInnerHTML={{__html: snowUI.snowText.link.title.info}} />
							</div>
							<div className="clearfix" />
							<div style={{height:'30px',position:'relative',width:'100%'}} />
							<div className="col-xs-12 col-md-6 link-info">
								<div className="link-head">
									{snowUI.snowText.link.sharekey.text}
									<a  className="btn btn-default btn-xs pull-right" onClick={_this.showShareInput}>Change</a>
								</div>
								<div className=" link-info">
									{inputkeyshare}
								</div>
							</div>
							<div className="col-xs-12 col-md-6  link-info">
								<div className="link-head">
									{snowUI.snowText.link.sendkey.text}
									<a  className="btn btn-default btn-xs pull-right" onClick={_this.showSendInput}>Change</a>
								</div>
								<div className=" link-info">
									{inputkeysend}
								</div>
							</div>
							<div className="col-xs-12 link-info">
								<div className="link-head">
									{snowUI.snowText.link.linkaccount.text}
									
								</div>
								<div >
									
									{ddns}
									
								</div>
							</div>
						</div>
						
					</div>
				</div>
			);
		
		} else {
			
			return (<div />);
			
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
