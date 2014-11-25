/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
React.initializeTouchEvents(true);

//send component
WalletUI.send = React.createClass({displayName: 'send',
	getInitialState: function() {
		
		var _this = this
		
		return {requesting:false,mounted:false,ready:this.props.ready,modalAddressBook:false};
		
	},
	componentWillReceiveProps: function (nextProps) {
		var _this = this
		if(snowUI.debug) snowlog.log('send will receive props',this.props,nextProps)
		//this.setState({ready:nextProps.ready})
		if(this.props.config.wallet !== nextProps.config.wallet)this.getData(nextProps,function(resp){_this.setState({accounts:resp.accounts,data:resp.data,snowmoney:resp.snowmoney,mounted:true,ready:nextProps.ready}) })
		
	},
	componentDidUpdate: function () {
		var _this = this
		if(snowUI.debug) snowlog.log('send did update',this.props)
		snowUI.watchLoader();
		$('[rel=popover]').popover();
		$('.bstooltip').tooltip()
		
	},
	componentDidMount: function() {
		
	},
	killTooltip: function() {
		$('.snow-send #changeamountspan').tooltip('destroy');
		$('.snow-send #sendcoinamount').tooltip('destroy');
		$('.snow-send #convamountspan').tooltip('destroy');
	},
	componentWillMount: function() {
		var _this = this
		if(snowUI.debug) snowlog.log('send did mount',this.props)
		//_this.setState({mounted:true})
		this.getData(this.props,function(resp){ _this.setState({data:resp.data,snowmoney:resp.snowmoney,accounts:resp.accounts,mounted:true}) })
		this.killTooltip();
		$('.snow-send #convamount').html(' ')
		$('[rel=qrpopover]').popover();
	
	},
	componentWillUpdate: function() {
		this.killTooltip();
		$('.snow-send #convamount').html(' ')
	},
	componentWillUnMount: function() {
		this.setState({mounted:false,data:false,ready:false})
		
	},
	getData: function (props,cb) {
		if(snowUI.debug) snowlog.log('send data',props)
		var url = "/api/snowcoins/local/wallet",
			data = { wallet:props.config.wallet,moon:props.config.moon},
			_this = this;
		
		snowUI.ajax.GET(url,data,function(resp) {
			if(snowUI.debug) snowlog.log(resp)
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
			if(snowUI.debug) snowlog.log(resp)
			if(resp.success === true) {
				_this.setState({adsressBookHtml:resp.html,modalAddressBook:true});
			} else {
				snowUI.flash('error',resp.error,3500)
				
			}
		})
		return false
	},
	saveAddressForm: function(e) {
		if(snowUI.debug) snowlog.log('change save address');
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
		//if(snowUI.debug) snowlog.log('keyup',from,to,snowmoney[from][to]);
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
		
		var next = true;
		var ticker = $('.snow-send .change-coin-stamp').attr('data-snowticker');
		var amount = parseFloat($('.snow-send #sendcointrueamount').val());
		var to = $('.snow-send #sendcointoaddress').val();
		var bal = parseFloat($('.snow-send-body .snow-balance-body').text().replace(/,/g,''));
		var from = $('.snow-send #sendcoinfromaccount').val();
		if(snowUI.debug) snowlog.log('send',parseInt(amount));
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
			var body=(lockstatus.locked===2 || lockstatus.time>nowtime) ? snowvars.html : snowvars.unlockme;
			var footer=(lockstatus.locked===2 || lockstatus.time>nowtime) ? snowvars.buttons : snowvars.unlockbuttons;
			
		}
		
	},
	render: function() {
		if(snowUI.debug) snowlog.log('wallet send component')
		var _this = this;
		
		if(this.state.mounted) {
			
			var snowmoney = this.state.snowmoney;
			var wally = this.props.config.wally;
			var tickerlist = function() {
				var lis = [(React.DOM.li({key: "lit", onClick: _this.watchTicker, className: "change-coin-stamp", role: "presentation", 'data-snowstamp': _this.props.config.wally.coinstamp, 'data-snowticker': _this.props.config.wally.cointicker}, React.DOM.a(null, " ", _this.props.config.wally.cointicker.toUpperCase())))]
				if (snowmoney['usd'][wally.cointicker] && snowmoney['usd'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit1", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "USD", 'data-snowticker': "usd", className: "change-coin-stamp"}, React.DOM.a(null, "USD")))
				if (snowmoney['eur'][wally.cointicker] && snowmoney['eur'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit2", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "EUR", 'data-snowticker': "eur", className: "change-coin-stamp"}, React.DOM.a(null, "EUR")))			
				if (snowmoney['btc'][wally.cointicker] && snowmoney['btc'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit3", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "BTC", 'data-snowticker': "btc", className: "change-coin-stamp"}, React.DOM.a(null, "BTC")))
				if (snowmoney['ltc'][wally.cointicker] && snowmoney['ltc'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit4", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "LTC", 'data-snowticker': "ltc", className: "change-coin-stamp"}, React.DOM.a(null, "LTC")))
				if (wally.cointicker!='doge' && snowmoney['doge'][wally.cointicker] && snowmoney['doge'][wally.cointicker].price) 
					lis.push(React.DOM.li({key: "lit5", onClick: _this.watchTicker, role: "presentation", 'data-snowstamp': "doge", 'data-snowticker': "doge", className: "change-coin-stamp"}, React.DOM.a(null, "DOGE")))
				return lis
			}
			
			if(this.state.accounts instanceof Array) {
				var accs =  this.state.accounts.map(function(v) {
					return (
						React.DOM.option({key: v.name, value: v.name}, v.name)
					);   
				});
					    
			} else {
				var accs = '<option value="">no accounts found</option>'
			}
			/* check for accounts and addresses in the url */
			var param = {from:{},to:{}}
			var pFrom = _this.props.config.params.indexOf('from'),
				pTo = _this.props.config.params.indexOf('to');
			// if there is a from in the url grab the next param which can be an account or address
			param.from.account = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			param.from.address = pFrom!==-1 ? _this.props.config.params[pFrom+1] : '';
			// if there is a to in the url grab the next param which should be an address
			param.to.address = pTo!==-1 ? _this.props.config.params[pTo+1] : '';	
			
			return (
				React.DOM.div(null, 
				React.DOM.div({id: "snow-send", className: "snow-send bs-example"}, 
					React.DOM.div({className: "col-xs-12 col-sm-offset-1 col-sm-10 col-md-10 col-lg-10"}, 
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
					React.DOM.form({onSubmit: this.walletForm, id: "snowsendcoin", className: "snow-block-lg"}, 
					React.DOM.div({className: "snow-block-heading"}), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.div({className: "dropdown"}, 
								React.DOM.a({id: "snowchangefrom", 'data-toggle': "dropdown", 'data-snowstamp': _this.props.config.wally.coinstamp, 'data-snowticker': _this.props.config.wally.cointicker, className: "dropdown-toggle"}, 
									React.DOM.span({id: "changestamp"}, _this.props.config.wally.cointicker.toUpperCase(), " "), "  ", React.DOM.span({className: "caret"})
								), 
								React.DOM.ul({role: "menu", 'aria-labelledby': "dda2", className: "dropdown-menu"}, 
									tickerlist()						
								)
							)
						), 
						React.DOM.span({id: "convamountspan", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "input-group-addon input-group-sm coinstamp bstooltip"}, 
							React.DOM.span({id: "convamount"})
						), 
						React.DOM.input({required: "required", type: "text", pattern: "[-+]?[0-9]*[.,]?[0-9]+", id: "sendcoinamount", name: "sendcoinamount", placeholder: "Amount", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "form-control coinstamp bstooltip watchme active", title: "We will send this amount", onChange: _this.watchAmount, onKeyUp: _this.watchAmount, onFocus: _this.watchAmount}), 
						React.DOM.input({id: "sendcointrueamount", type: "hidden", value: "0"}), 
						
						React.DOM.span({id: "changeamountspan", 'data-toggle': "tooltip", 'data-placement': "top", 'data-container': "#snow-send", className: "input-group-addon input-group-sm coinstamp watchme"}, 
							
							React.DOM.span({id: "changeamountbefore"}, "$ "), 
							React.DOM.span({id: "changeamount"}, "0"), 
							React.DOM.span({id: "changeamountafter"})
						)
					), 
					React.DOM.div({style: {textAlign:'right',marginTop:-5}}, React.DOM.a({rel: "popover", 'data-container': "body", 'data-toggle': "popover", 'data-placement': "left", 'data-html': "true", 'data-content': "The left bookend selects the currency you want to enter. The right bookend will show you a converted amount.   <br /><br /> Select " + _this.props.config.wally.cointicker.toUpperCase() + " to see a conversion to " + _this.props.config.wally.currency.toUpperCase() + ". You will send the amount entered in the blue box<br /><br /> Select another currency to convert the entered amount to " + _this.props.config.wally.cointicker.toUpperCase() + ". The right bookend will be blue and the amount you send. ", className: "helppopover"}, "help")), 
					React.DOM.div({style: {textAlign:'left'}, className: "snow-send-body"}, 
						React.DOM.div({className: "snow-balance-body"}, 
							React.DOM.span(null, parseFloat(_this.state.data.balance).formatMoney()), 
							React.DOM.input({id: "snow-balance-input", type: "hidden", value: parseFloat(_this.state.data.balance)}), " ", React.DOM.span({style: {color:'#ccc'}, className: "coinstamp"}, " ", _this.props.config.wally.coinstamp, "   after sending")
						)
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "From"), 
						React.DOM.select({id: "sendcoinfromaccount", name: "sendcoinfromaccount", className: "form-control coinstamp", defaultValue: param.from.account}, 
							accs
						)
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "To"), 
						React.DOM.input({required: "required", id: "sendcointoaddress", name: "sendcointoaddress", placeholder: "Coin Address", defaultValue: param.to.address, className: "form-control coinstamp"}), 
						React.DOM.span({style: {cursor:'pointer'}, onClick: _this.addressBook, className: "input-group-addon input-group-sm glyphicon glyphicon-user"})
					), 
					React.DOM.div({className: "form-group input-group"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, 
							React.DOM.input({type: "checkbox", id: "sendcoinsaveaddr", value: "save", onChange: _this.saveAddressForm})
						), 
						React.DOM.label({style: {textAlign:'left'}, className: "form-control coinstamp"}, "Save this address to my contacts")
					), 
					React.DOM.div({id: "sendcoinshowname", style: {display:'none'}, className: "form-group input-group bg-info"}, 
						React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Name"), 
						React.DOM.input({id: "sendcoinaddressname", name: "sendcoinaddressname", placeholder: "name for address", value: "", className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Message "), 
					React.DOM.input({id: "sendcointomessage", name: "sendcointomessage", placeholder: "message", value: "", className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group input-group"}, React.DOM.span({className: "input-group-addon input-group-sm coinstamp"}, "Memo"), 
					React.DOM.input({id: "sendcoinmemo", name: "sendcoinmemo", placeholder: "memo", value: "", className: "form-control coinstamp"})
					), 
					React.DOM.div({className: "form-group"}, 
						React.DOM.button({type: "submit", id: "buttonsend", className: "btn btn-sm snowsendcoin"}, "Send Coin")
						
					), 
					React.DOM.div({className: "clearfix"})
					)
					), 
					
					React.DOM.div({className: "clearfix"})
				), 		
				snowModals.addressBook.call(this)
			)
		    );
		} else {
			return (React.DOM.div(null))
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
