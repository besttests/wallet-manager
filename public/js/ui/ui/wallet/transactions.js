/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
React.initializeTouchEvents(true);

//overview list component
WalletUI.transactions = React.createClass({displayName: 'transactions',
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
		
		
		if(snowUI.debug) snowlog.log('tx will receive props',this.props,nextProps)
		
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
		
		if(snowUI.debug) snowlog.log('tx data',props)
		
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
		if(snowUI.debug) snowlog.log('showTX')
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
			if(snowUI.debug) snowlog.log(data,'showTX')
			$(e.currentTarget).closest('tr').after('<tr class="txrowsmore"><td></td><td colspan="5">'+this.createTxHtml(data)+'</td></tr>').next().toggle(400);
		}
	},
	render: function() {
	    if(snowUI.debug) snowlog.log('wallet transaction component',this.props,this.state)
		
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
								React.DOM.tr({key: v.time+(i++), style: {cursor:'pointer'}, 'data-open': JSON.stringify(v), className: "txclickrow", onClick: _this.showTx}, 
								React.DOM.td({className: " snowbg2"}, i), 
								React.DOM.td(null, v.account), 
								React.DOM.td(null, v.amount), 
								React.DOM.td(null, v.address), 
								React.DOM.td(null, 

									v.category
								), 
								React.DOM.td(null, moment(v.time*1000).format("llll"))
								)
							    );   
					    });
					    
					    if(listtxs.length >= num) next = '';
					    
					   
				} else {
					var listtxs = (
						React.DOM.tr({style: {cursor:'pointer'}, 'data-open': "", className: "txclickrow"}, 
							React.DOM.td({colspan: "5"}, "no transactions found")

						)
					    ); 
					
				}
				if(this.state.data.accounts instanceof Array) {
					 var accs =  this.state.data.accounts.map(function(v) {
						return (
							React.DOM.option({key: v.name, value: v.name}, v.name)
						);   
					});
						    
				} else {
					var accs = '<option value="">no accounts found</option>'
				}
				
			} else {
				var listtxs = (
					React.DOM.tr({style: {cursor:'pointer'}, 'data-open': "", className: "txclickrow"}, 
						React.DOM.td({colSpan: "6"}, "no transactions found")

					)
				    ); 
				var accs = '<option value="">no accounts found</option>'
			}
			
			var pagerprev = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'previous pull-left '+prev}, React.DOM.a({onClick: this.prev}, snowtext.wallet.tx.pager.prev.replace('{num}',this.state.num))));
			
			var pagernext = next.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'next pull-right '+next}, React.DOM.a({onClick: this.next}, snowtext.wallet.tx.pager.next.replace('{num}',this.state.num))));
			
			var pagerprev2 = prev.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'previous pull-left '+prev}, React.DOM.a({onClick: this.prev}, snowtext.wallet.tx.pager.prev.replace('{num}',this.state.num))));
			
			var pagernext2 = next.trim() === 'disabled' || this.state.account === 'all' ? '':(React.DOM.li({className: 'next pull-right '+next}, React.DOM.a({onClick: this.next}, snowtext.wallet.tx.pager.next.replace('{num}',this.state.num))));
			
			return (
				React.DOM.div({style: {padding:'5px 20px'}}, 
					React.DOM.div({className: "page-title"}, 
						"Transactions"
					), 
					React.DOM.div({id: "snow-transactions", className: "bs-example"}, 
						
						React.DOM.form({id: "txoptionsform", onSubmit: this.submitForm}, 
							React.DOM.div({style: {marginLeft:10}, className: "txoptions"}, 
								
								React.DOM.div({className: "pull-left txaccounts"}, 
									React.DOM.select({id: "txaccounts", className: "form-control ", name: "account", defaultValue: this.state.account}, 
										React.DOM.option({value: "all"}, "All"), 
										accs
									)
								), 
							
								React.DOM.div({className: "pull-left txrows"}, 
									React.DOM.select({className: "form-control ", id: "txrows", name: "num", defaultValue: this.state.num}, 
										React.DOM.option({value: "5"}, "5"), 
										React.DOM.option({value: "10"}, "10"), 
										React.DOM.option({value: "20"}, "20"), 
										React.DOM.option({value: "30"}, "30"), 
										React.DOM.option({value: "40"}, "40"), 
										React.DOM.option({value: "50"}, "50"), 
										React.DOM.option({value: "75"}, "75"), 
										React.DOM.option({value: "100"}, "100")
									)
								), 
								React.DOM.div({className: "pull-left"}, 
									React.DOM.button({type: "submit", style: {marginTop:-10}, className: "btn  txgobutton"}, "GO "), 
									React.DOM.input({type: "hidden", value: "0", id: "txstart"})
								)
							), 
							React.DOM.div({className: "clearfix"})
						), 
						
						React.DOM.div({style: {margin:"-10px 10px 0 10px"}, className: "table-responsive"}, 
							React.DOM.ul({className: "pager"}, 
								pagerprev, 
								pagernext
							), 
							React.DOM.table({className: "table table-hover snowtablesort"}, 
								React.DOM.thead(null, 
									React.DOM.tr(null, 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "#")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "account")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "amount")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "address")), 
										React.DOM.th(null, React.DOM.span({className: "glyphicon glyphicon-sort-by-alphabet"}, "type")), 
										React.DOM.th({className: "snowsortdate"}, React.DOM.span({className: "glyphicon glyphicon-sort-by-order"}, "time"))
									)
								), 
								React.DOM.tbody(null, 
									

									listtxs
								)
							), 
							React.DOM.ul({className: "pager"}, 
								pagerprev2, 
								pagernext2
							)
						)
						
					)
				)			
			);
		} else {
			return(React.DOM.div(null))
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


