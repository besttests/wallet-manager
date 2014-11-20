$(function() {  
	var mastersocket = false,
		simplecheck = false,
		primesocket = false,
		chatbone=bone,
		snowchat = false,
		snowsocket = false,
		chatsocket = false,
		_rememberRoute = false,
		clients = {d3c:{},d2c:{},inhouse:{}},
		snowmoney = new Object,
		mainkey ="id" + Math.random().toString(16).slice(2);
	
		
		/** *
	 * views
	 ** */
	function startboneviews() {
		
		/* view menu */
		bone.view.View = bone.view('#menubar .view .body', {
			events: {
				'click .ledger': 'ledger',
				'click .item': 'item',
				'click .tx': 'tx'
			},
			ledger: function(event) {
				bone.router.navigate('/d2c/ledger', {trigger: true});
			},
			item: function(data) {
				bone.router.navigate('/d2c/view/item', {trigger: true});
			},
			tx: function(data) {
				bone.router.navigate('/d2c/view/tx', {trigger: true});
			}
		});
		/* connect menu */
		bone.view.Connect = bone.view('#menubar .connect .body', {
			events: {
				'click .client': 'client',
				'click .customer': 'customer',
			},
			client: function(event) {
				bone.router.navigate('/d2c/connect/client', {trigger: true});
			},
			customer: function(data) {
				bone.router.navigate('/d2c/connect/customer', {trigger: true});
			}
		});
		
		/* chatbox */
		bone.view.Message = bone.view('#chatbox ', {
			events: {
				'click .sendbox #s-send': 'send',
				'click .userbox #chatusers a': 'room',
				
			},
			send: function(event) {
				snowchat.message({room:el.chatroom.val(),message:this.$('#s-message').val()});
				el.inputs.sendchat.val('');
			},
			room: function(event) {
				var me = $(event.currentTarget),
					room = me.parent().attr('data-snow-room') || '';
					
				this.$('li').removeClass('active');
				me.parent().addClass('active');
				
				/* set the hidden room input */
				el.chatroom.val(room);
				
				/*set the chat room to show only user and room */
				el.chatmessages.hide();
				console.log('room',room)
				showchatmessages(room);
			}
		});
		
		/* modal actions */
		bone.view.Modal = bone.view('#confirm-modal ', {
			events: {
				'click #cancelledger': 'cancelledger',
				'click #deleteledger': 'deleteledger',
			},
			cancelledger: function(e) {
				var key = this.$('#cancelkey').val();
				snowsocket.action({command:'ledger',action:'modify',status:'cancelled',ledgerid:key});
				bone.router.navigate('/d2c/ledger/' + key + '/cancelled/', {replace: true});
				bone.view.Modal.close();
			},
			deleteledger: function(e) {
				var key = this.$('#deletekey').val();
				snowsocket.action({command:'ledger',action:'modify',status:'deleted',ledgerid:key});
				bone.router.navigate('/d2c/ledger/' + key + '/deleted/', {replace: true});
				bone.view.Modal.close();
			},
			close: function(e) {
				this.$el.modal('hide');
			}
		});
		
		/* manage content */
		bone.view.Manage = bone.view('#manage .content ', {
			events: {
				
				'click #cancelledger': 'cancelledger',
				'click #deleteledger': 'deleteledger',
			},
			cancelledger: function(event) {
				var options = {}
				options.headtext = 'Cancel Ledger';
				options.htmlordiv = '<h3>You are about to cancel ledger ' + el.inputs.ledgerkey.val() + '.</h3><p>  All transactions will be marked as cancelled and trackers stopped.</p><p>  The ledger will still be available via search.</p>';
				options.buttons = '<input type="hidden" value="' + el.inputs.ledgerkey.val() + '" id="cancelkey"><button class="pull-left btn btn-warning " id="cancelledger">Cancel ' + el.inputs.ledgerkey.val() + ' Now</button><button type="button" class="btn   btn-default pull-right" data-dismiss="modal">No Changes</button>';
				el.modal = options;
				
			},
			deleteledger: function(event) {
				var options = {}
				options.headtext = 'Delete Ledger';
				options.htmlordiv = '<h3>You are about to <strong>delete</strong> ledger ' + el.inputs.ledgerkey.val() + '.  </h3><p>All transactions will be marked as deleted and trackers removed. </p> <p>The ledger will <strong>not</strong>  be permanently deleted (history). </p><p> You can delete a ledger permanently via <a href="/keystone/" target="_blank">keystone</a>, but this is not recommended.</p><p>If you need to view the ledger it will be available only via direct ledger id search or <a href="/keystone/" target="_blank">keystone</a>.</p>';
				options.buttons = '<button class="pull-left btn btn-danger" id="deleteledger">Delete ' + el.inputs.ledgerkey.val() + ' Now</button><input type="hidden" value="' + el.inputs.ledgerkey.val() + '" id="deletekey"><button type="button" class="btn   btn-default pull-right" data-dismiss="modal">No Changes</button>';
				el.modal = options;
				
			},
			
		});
		
		/* end views */
	}
	
	/* routes for history */
	function startboneroutes() {
		
		/* middleware */
		var middleware = {
			// 
			clearpretty: function(route, next) {
				clearpretty()
				next();
			},
			isStarted: function(route, next) {
				if(simplecheck)			
					next();
				else {
					/* remember the route and try again after we start the app */
					_rememberRoute = route;
				}
			}
		};
		bone.router({
			routes: {
				"d2c/find/:what/:query":          "search",   
				"d2c/ledger/:lid":    	"ledger",
				"d2c/ledger":    	"ledger",
				"d2c/view/:what":    		"view",     
				"d2c/connect/:who":   		"connect",    
				"d2c/reset":   		"reset",
				"d2c/login":   		"login",   
			},
			middleware: [
				middleware.isStarted,
				middleware.clearpretty
			],
			wait: function() {},
			reset: function() { setui('off') },
			login: function() { setui('off') },
			ledger: function(lid) {
				console.log('ledger route',lid)
				
				if(lid) {
					console.log('route view ledger',lid)
					simplemainhtml('<div id="viewledger"></div>');
					el.viewledger = lid;
					
				} else {
					console.log('view all ledgers')
					simplemainhtml('<div id="listledgers"></div>');
					//snowsocket.action({command:'find',action:'ledger'});
					el.listledgers = false;
				}
										
			},
			view: function(what,which) {
				console.log(which,what)
				switch (what) {
					case 'tx':
						simplemainhtml('<div id="listtransactions"></div>');
						snowsocket.action({command:'find',action:'transaction'});
						break;
					case 'item':
						simplemainhtml('<div id="listitems"></div>');
						snowsocket.action({command:'find',action:'items'});
						break;
					default: 
						simplemainhtml('<div id="listledgers"></div>');
						snowsocket.action({command:'find',action:'ledger'});
						break;
				}				
			},
			connect: function(who) {
				
				console.log('connect');
				el.manage.hide()
				el.chatbox.fadeTo("slow",1);
				
				if(snowchat)snowchat.getclients();
				resizechat();
				el.chatbox.keypress(function(e) {
					if (e.keyCode == 13) {
						bone.view.Message.send();
					}
				});
				el.inputs.sendchat.focus();
				
				
			},
			
		});
		bone.router.start({pushState: true});
	
	
	}
	
	
	/* elements */
	var el = {
		ledgerentries: {
			_order: [],
			_data: [],
			set: function(data,skip) {
				/* loop through data and update or add */
				var push = (el.ledgerentries._data.length<1) ? true : false;
				data.forEach(function(val,i) {
					if(val) {
						var used = el.ledgerentries._order.indexOf(val.ledgerID);
						if(used<0 && push) {
							el.ledgerentries._order.push(val.ledgerID);
							el.ledgerentries._data[el.ledgerentries._order.indexOf(val.ledgerID)] = val;
						} else if(used<0 && !push) {
							el.ledgerentries._order.unshift(val.ledgerID);
							el.ledgerentries._data.unshift(val);
						} else {
							el.ledgerentries._data[el.ledgerentries._order.indexOf(val.ledgerID)] = val;
						}
								
					} else {
						return;
					}	
				});
				
				if(!skip) {
					this._list.forEach(function(val) {
						if(el) el[val]= el.ledgerentries._data;
					});
				}
			},
			set addlist(add) {
				this._list.push(add);
			},
			_list: ['listledgers','viewledger'],
		},
		get listledgers() { return $('#listledgers') },
		set listledgers (data) {
			
			var tmp = ['<div class="table-responsive"><table class="table table-hover">','<thead>','<th>','<th><span class="glyphicon glyphicon-sort "></span> Ledger # ','<th class="snowsorttotal"> <span class="glyphicon glyphicon-sort "></span> Total ','<th  class="snowsorttotal"><span class="glyphicon glyphicon-sort "></span> Received ','<th><span class="glyphicon.glyphicon-sort "> Status </span>','<th class="snowsortdate"><span class="glyphicon glyphicon-sort "></span> Created ','</thead>','<tbody>'];
			//console.log('data',data)
			if((data instanceof Array) === false)data = el.ledgerentries._data;
			if(data && data.length>0 && data instanceof Array) {
				data.forEach(function(val) {
					if(!val.total)val.total=0;
					if(!val.totalreceived)val.totalreceived=0;
					tmp.push('<tr>');
					tmp.push('<td class="">');
					tmp.push('<td><a onclick="bone.router.navigate(\'/d2c/ledger/'+val.ledgerID+'\', {trigger: true});">'+val.ledgerID+'</a>');
					tmp.push('<td>'+val.total.formatMoney(8)+' '+val.currency);
					
					var rcolor = val.complete ? '':'notcomplete';
					tmp.push('<td class="' + rcolor + '">'+val.totalreceived.formatMoney(8));
					
					tmp.push('<td><span class="badge ' + val.status + '" style="font-weight:normal">' + val.status + '</span>');
					
					tmp.push('<td class="">' + moment(val.createdDate).format('YYYY-MM-D h:mm:ss a Z'));
					
					tmp.push('</tr>');
				});
				tmp.push('</tbody></table></div>');
				console.log('view ledger entries');
				
				$('#listledgers').html(tmp.join(' '));
				$('#listledgers table th').sortcol();
			}
		},
		get viewledger() { return $('#viewledger') },
		set viewledger (ledger) {
			
			var _l = ledger;
			//console.log('ledger value... ',_l);
			
			if(ledger && el.ledgerentries._order.indexOf(ledger) != -1)el._currentledger = ledger;
			if((!ledger || ledger instanceof Array) && el._currentledger)ledger = el._currentledger;
			
			var tmp = [];
			
			
			val = el.ledgerentries._data[el.ledgerentries._order.indexOf(ledger)];
			
			if(val && val.ledgerID) {
				console.log('view single ledger');
				
				tmp.push('<div class="col-xs-12 badges">');	
						
						
					if(!val.complete) {
						tmp.push('<span class="badge notcomplete-bg " style="font-weight:normal"> not complete</span>');
					}
					tmp.push('<span class="badge ' + val.status + '" style="font-weight:normal">' + val.status + '</span>');
					
				tmp.push('</div>');
				
				tmp.push('<div class="col-xs-12 ledgerid">');	
						
					tmp.push(val.ledgerID);	
					
				tmp.push('</div>');
				
				tmp.push('<div class="clearfix"><input type="hidden" value="' + val.ledgerID + '" id="ledgerID"></div>');
				
				tmp.push('<div class="col-xs-12 totalrow">');
					
					/* total */
					tmp.push('<div class="col-xs-12 col-sm-12  col-md-6 total">');
				
						tmp.push('<div class=" col-xs-9 col-sm-8 col-md-9  clients ">');
							
							tmp.push('Total');
							
						tmp.push('</div>');
						tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><button class="btn btn-default btn-xs pull-right" id="switchtotal"><span class="swapchange">Change</span><span class="swapchange" style="display:none">Cancel</span></button></div>');
						
						tmp.push('<div class="col-xs-12 col-sm-4 col-md-8 hangereceived swaptotal" style="display:none;" ><input name="total" id="total" class="form-control" style=""></div>');
						tmp.push('<div class="col-xs-6 col-sm-4 col-md-8 changereceived  swaptotal"  style="display:none;" ><select id="ledgercurrency" name="type" class="form-control"></select></div>');
						tmp.push('<div class="col-xs-4 col-sm-4 col-md-4  changereceived swaptotal" style="display:none;" ><button class="btn btn-default" id="changetotal">Update</button></div>');
						
						tmp.push('<div class="col-xs-12 money">' + val.total.formatMoney(8) + '&nbsp;<span class="coinstamp">' + val.currency  + '</span></div>');
						
						
						
						/* loop through wallets and show conversion for each */
						//console.log('wallets',snowmodel.wallets,snowmodel.wallets._data instanceof Array);
						if(snowmodel.wallets instanceof Array) {
							snowmodel.wallets.forEach(function(v) {
								var coin = v.wallet.cointicker,
									fiat = v.wallet.currency
									p = 0;
								
								var vA = 0, vB = 0, vC = 0, vD = 0;
								if(val.currency === coin) {
									p = val.total;
																	
								} else if(snowmoney[val.currency] && snowmoney[val.currency][coin]) {
									/* we have a easy value so use it */
									p = val.total * snowmoney[val.currency][coin].price;
								
								} else if(snowmoney[coin] && snowmoney[coin][val.currency]) {
									/* we have ther reverse so math */
									p = val.total / snowmoney[coin][val.currency].price;
								
								} else if(val.currency !== 'usd') {
									/* we have something so try and convert val to usd and etc etc etc */
									vA = snowmoney.usd[val.currency].price || 0;
									vB = snowmoney.usd[coin].price || 0;
									if(vA && vB) {
										vC = val.total / vA;
										vD = vC * vB;
										p = vD;
									} else {
										p = 0;
									}
							
								}
								
								tmp.push('<div class="col-xs-12 list">');
									//tmp.push('<div class="col-md-3 ">( ' + v.name + ' )</div>');
									tmp.push('<div class="col-md-12 ">' + p.formatMoney(8) + ' &nbsp;<span class="cointicker">' + coin + '</span></div>');
								tmp.push('</div>');
								
								
							});
							
							tmp.push('<div class="col-xs-12 list">');
							if (val.currency !== 'usd' && snowmoney.usd[val.currency]) {
								var p =  val.total / snowmoney.usd[val.currency].price;
								if(typeof p !== 'number')p = parseFloat(p);
								
									tmp.push('<div class="col-xs-6 ">[ <span class="cointicker">$</span>' + p.formatMoney(2) + ' ]</div>');
								
							}
							if (val.currency !== 'eur' && snowmoney[val.currency].eur) {
								var p =  val.total * snowmoney[val.currency].eur.price;
								if(typeof p !== 'number')p = parseFloat(p);
									tmp.push('<div class="col-xs-6 ">[ <span class="cointicker">&#128;</span>' + p.formatMoney(2) + ' ]</div>');
								
							}
							tmp.push('</div>');
						
						
						}
						
						
						
					tmp.push('</div>');
					
					/* total received */
					tmp.push('<div class="col-xs-12 col-sm-12  col-md-6  totalreceived">');
						
						var realV = ( val.totalreceived - val.total);
						var diff = val.totalreceived - (val.total - val.totaloffset);
						
						if(val.complete) {
							if(realV<0) {
								
								var diffcolor = {color:'green',text:'<span class="coinstamp"> completed via offset of </span>(' + realV.formatMoney(8) + ') <span class="coinstamp">' + val.currency  + '</span>'}
								
							} else if(realV>0) {
								
								var diffcolor = {color:'green',text:'(' + realV.formatMoney(8) + ')&nbsp;<span class="coinstamp">' + val.currency  + ' overpaid </span>'}
								
							} else {
								
								var diffcolor = {color:'green',text:'<span class="coinstamp"> completed </span>'}
								
							}
						
						} else {
							var diffcolor = {color:'notcomplete',text:'(' + realV.formatMoney(8) + ')&nbsp;<span class="coinstamp">' + val.currency  + ' needed </span>'}
						}
						
						tmp.push('<div class=" col-xs-9 col-sm-8 col-md-9   clients ">Total Received</div>');
						tmp.push('<div class="col-xs-3  col-sm-4 col-md-3  buttons  "><button class="btn btn-default btn-xs pull-right" id="switchtotalreceived"><span class="swapchange">Change</span><span class="swapchange" style="display:none">Cancel</span></button></div>');
						
						tmp.push('<div class="col-xs-12 col-sm-5 col-md-5 changereceived swaptr" style="display:none;" ><input name="received" id="totalreceived" class="form-control" style=""></div>');
						tmp.push('<div class="col-xs-4 col-sm-3 col-md-4 changereceived swaptr" style="display:none;" ><select id="totalreceivedtype" name="type" class="form-control"><option value="totalreceivedplus">plus</option><option value="totalreceivedminus">minus</option><option value="totalreceived">total</option></select></div>');
						tmp.push('<div class="col-xs-4 col-sm-2 col-md-2 changereceived swaptr" style="display:none;" ><button class="btn btn-default" id="changereceived">Update</button></div>');
						
						tmp.push('<div class="col-xs-12 money">' + val.totalreceived.formatMoney(8) + '&nbsp;<span class="coinstamp">' + val.currency  + '</span></div>' );
						
						tmp.push('<div class="col-xs-12  small ' + diffcolor.color + '">' + diffcolor.text + '</div>' );
					
					tmp.push('</div>');
					
				
				tmp.push('</div>');/* end total row */
				
				/* offset */
				tmp.push('<div class="col-xs-12 col-sm-6 col-md-6  totaloffset">');
				
					tmp.push('<div class="  col-xs-9 col-sm-8 col-md-9  clients ">Total Offset</div>');
					tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><button class="btn btn-default btn-xs pull-right" id="switchoffset"><span class="swapchange">Change</span><span class="swapchange" style="display:none">Cancel</span></button></div>');
					
					tmp.push('<div class=" col-xs-8 changereceived swapoffset" style="display:none;" ><input name="totaloffset" id="totaloffset" class="form-control" style=""></div>');
					tmp.push('<div class="col-xs-4 changereceived swapoffset" style="display:none;" ><button class="btn btn-default" id="changeoffset">Update</button></div>');
					
					tmp.push('<div class="col-xs-12 money">' + val.totaloffset.formatMoney(8) + '&nbsp;<span class="coinstamp">' + val.currency  + '</span></div>');
					
					tmp.push('<div class="clearfix" style="height:15px;"></div>');	
						
				tmp.push('</div>');
				
				/* manage */
				tmp.push('<div class="col-xs-12 col-sm-6 col-md-6  actions">');
				
					tmp.push('<div class="  col-xs-12  clients ">Actions</div>');
					
					tmp.push('<div class="   col-xs-9 col-sm-8 col-md-9  manageitem  ">Cancel Ledger</div>');
					if(val.status !== 'cancelled') {
						tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><button class="btn btn-warning " id="cancelledger">Cancel</button></div>');
					} else {
						tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><p style="padding-top:8px;">isCancelled</p></div>');
					}
					
					tmp.push('<div class="   col-xs-9 col-sm-8 col-md-9  manageitem  ">Delete Ledger</div>');
					if(val.status !== 'deleted') {
						tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><button class="btn btn-danger " id="deleteledger">Delete</button></div>');
					} else {
						tmp.push('<div class=" col-xs-3 col-sm-4 col-md-3  buttons  "><p style="padding-top:8px;">isDeleted</div>');
					}
					
					
					
					tmp.push('<div class="clearfix" style="height:15px;"></div>');	
						
				tmp.push('</div>');
				
				/* transactions */
				tmp.push('<div class="col-xs-12 tx">');
					tmp.push('<div class="col-xs-8 col-sm-9 col-md-10 clients">Transactions</div>');
					tmp.push('<div class="col-xs-4  col-sm-3 col-md-2 buttons">');
						tmp.push('<div class=" button-grp pull-right " style="max-width:110px">');	
							tmp.push('<button class="btn btn-default btn-xs " id="switchtx"><span class="swapchange">Add Tx</span><span class="swapchange" style="display:none">Cancel</span></button>');
							tmp.push('<button class="btn btn-default btn-xs dropdown-toggle" style="margin-left:-3px;" data-toggle="dropdown"><span class="caret"></span><span class="sr-only">Toggle</span></button>');
							tmp.push('<ul style="" class=" dropdown-menu" role="menu">');
								tmp.push('<li class="switchtx"><a>Tracked</a></li>');
								tmp.push('<li  id="addtxmanual"><a>Manual</a></li>');
							tmp.push('</ul>');
						tmp.push('</div>');	
					tmp.push('</div>');
					tmp.push('<div class="col-xs-6 col-sm-6 col-md-5 hidetx"><input id="txtotal" class="form-control coinstamp" type="text" placeholder="' + snowtext.d3c.txform.inputs.amount.placeholder + '" name="amount"></div>');
					tmp.push('<div class="col-xs-6 col-sm-6 col-md-5 hidetx"><select class="form-control currencyselect" id="txattended" name="attended" ></select></div>');
					tmp.push('<div class="col-xs-offset-8 col-xs-4 col-sm-offset-10 col-sm-2 col-md-offset-0 col-md-2 hidetx"><button class="btn btn-default pull-right" id="addautotx">Add</button></div>');
					
					tmp.push('');
					tmp.push('<div class=" txlist">' + val.transaction + '</div></div>');
					
				tmp.push('</div>');
				
				tmp.push('<div class="clearfix"></div>');
				
				/* items */
				tmp.push('<div class="col-xs-12 tx">');
					tmp.push('<div class="col-xs-8 col-sm-7 col-md-9 clients">Items</div>');
					tmp.push('<div class="col-xs-4  col-sm-5 col-md-3 buttons ">');
						tmp.push('<button class="btn btn-default btn-xs pull-right" id="additem">Add Item</button>');
					tmp.push('</div>');
					
					
					tmp.push('');
					tmp.push('<div class=" txlist">' + val.txitems + '</div></div>');
					
				tmp.push('</div>');
				
				tmp.push('<div class="clearfix"></div>');
				
				/* clients */
				var listclis = function() {
					var t = '<table class="table table-hover"><thead><th>Name</th><th>ApiKey</th></thead><tbody>';
					val.clients.forEach(function(v) {
						t = t + '<tr><td>' + v.name + '</td>';
						t = t + '<td>' + v.apikey + '</td>';	
					});
					t = t + '</tbody></table>';
					return t;
				}
				var clis = val.clients === undefined ? 'All' : (val.clients instanceof Array && val.clients.length>0) ? listclis() : 'All';
				tmp.push('<div class="col-xs-12 col-sm-6 col-md-6 clientsdiv">');
					tmp.push('<div class=" clients">Clients</div>');
					tmp.push('<div class=" clientslist table-responsive">' + clis + '</div>');
				tmp.push('</div>');
				
				/* dates */
				var cdate = new Date(val.createdDate).toLocaleString();
				var udate = new Date(val.updatedOn).toLocaleString();
				tmp.push('<div class="updatedOn col-xs-12 col-sm-6  col-md-6 ">');
				
					tmp.push('<div class=" col-xs-12 clients">created on</div>');
					tmp.push('<p>' + cdate + '</p>');
									
					tmp.push('<div class=" clients col-xs-12">last modified</div>');
					tmp.push('<p>' + udate + '</p>');
					
					tmp.push('<div class=" clients col-xs-12">valid till</div>');
					tmp.push('<p>' + new Date(val.validTill).toLocaleString() + '</p>');
					
				tmp.push('</div>');
				tmp.push('<div class="clearfix"></div>');
				
				console.log('view ledger entry');
				
				$('#viewledger').html(tmp.join(' '));
				
				el.ledgercurrencyselect = false;
				el.inputs.totalreceivedtype.selectbox();
				el.ledgercurrencyselect.selectbox('detach').val(val.currency).selectbox('attach');
				pressenter('#viewledger #totalreceived','#viewledger #changereceived');
				pressenter('#viewledger #total','#viewledger #changetotal');
				
				
			} else if( _l != '' && (_l instanceof Array)===false) {
				/* we search for the ledger  */
				snowsocket.action({command:'ledger',action:'find',ledger:_l,populate:1});
				
			} else {
				//this runs at odd times so do nothing on miss or you will regret it later
				console.log('update ledger view skipped over');
			}
		},
		
		wallets: {
			_order: [],
			_data: [],
			set: function(data) {
				data.forEach(function(val,i) {
					if(val) {
						var used = $.inArray(val.key,el.wallets._order);
						var push = (el.wallets._data.length<1) ? true : false;
						if(used<0 && push) {
							/* new value and data is empty so we can just push */
							el.wallets._order.push(val.key);
							el.wallets._data[$.inArray(val.key,el.wallets._order)] = val;
						} else if(used<0 && !push) {
							/* new value and _data exists so we place on the front */
							el.wallets._order.unshift(val.key);
							el.wallets._data.unshift(val);
						} else {
							/* value exists so update */
							el.wallets._data[$.inArray(val.key,el.wallets._order)] = val;
						}
								
					} else {
						return;
					}	
				});
				this._list.forEach(function(val) {
					if(el) el[val] = el.wallets._data;
				});
			},
			set addlist(add) {
				this._list.push(add);
			},
			_list: ['currencyselect','ledgercurrencyselect'],
		},
		get ledgercurrencyselect() { return $('#ledgercurrency') },
		set ledgercurrencyselect (data) {
			var tmp = [];
			if(!(data instanceof Array))data = el.wallets._data;
			if(!data)data=[];
			tmp.push('<option value="usd" >usd</option>');
			tmp.push('<option value="eur">eur</option>');
			data.forEach(function(val) {
				tmp.push('<option value="'+val.wallet.cointicker+'">' + val.wallet.cointicker + '</option>');
			});
			console.log('update ledger currency');
			$('#ledgercurrency').selectbox("detach").html(tmp.join(' ')).selectbox('attach');
		},
		get currencyselect() { return $('.currencyselect') },
		set currencyselect (data) {
			var tmp = ['<option >wallet</option>'];
			if(!(data instanceof Array))data = el.wallets._data;
			if(!data)data=[];
			data.forEach(function(val) {
				tmp.push('<option value="'+val.key+'">' + val.coin + ' (' + val.name + ')</option>');
			});
			console.log('update .currencyslelect');
			
			$('.currencyselect').selectbox("detach").html(tmp.join(' ')).selectbox('attach');
		},
		set addressselect (data) {
			var tmp = ['<option >select an address</option>'];
			if(!data)data=['<option>no addresses found</option>'];
			data.forEach(function(val) {
				tmp.push('<option value="'+val+'">' + val + '</option>');
			});
			console.log('update #txaddress');
			
			$('#txaddress').selectbox("detach").html(tmp.join(' ')).selectbox('attach');
		},
		set attendedaccounts (data) {
			/* create a ui dropdown */
			if(data) {
				console.log('add accounts to autocomplete');
				snowsocket.action({command:'find',action:'addresses',attended:el.currencyselect.val(),account:0});
				el.manage.find('.attendedaccounts')
				.autocomplete({ 
					source: data,
					minLength:0,
					select: function( event, ui ) {
						/* get addresses for this account*/
						var wallet = el.currencyselect.val(),
							account = ui.item.value;
						snowsocket.action({command:'find',action:'addresses',attended:wallet,account:account});
					},
					change: function(event, ui) {
						
					}
				})
				.focus(function(){
					$(this).autocomplete('search', $(this).val())
				});
			}
							
		},
		clients: {
			set: function(data) {
				this._data = data;
				this._list.forEach(function(val) {
					if(el)  el[val] = data;
				});
			},
			set addlist(add) {
				this._list.push(add);
			},
			_list: ['clientlist'],
		},
		
		set clientlist (data) {
			var tmp = ['<optGroup label="blank adds all clients">'];
			if(!data)data = el.clients._data;
			data.forEach(function(val) {
				if(val.type=='client')tmp.push('<option value="'+val.apikey+'">'+val.name+'</option>');
			});
			tmp.push('<optGroup>');
			$('#ledgerclients').html(tmp.join());
		},
		
		set modal(options) {
			
			if(typeof options === 'object') {
				
				var hord = !options.htmlordiv ? '' : options.htmlordiv;
				var isDiv = hord.charAt(0) == '#' ? true:false;
				var html=(isDiv)? $(hord).html():hord;
				var time = new Date().getTime();
				
				$('#confirm-modal .modal-header h4').html(options.headtext);
				$('#confirm-modal .modal-body').html( '<div  >'+html+'</div>');
				$('#confirm-modal .modal-footer').html(options.buttons);
				
				$('#confirm-modal').modal('toggle');
				
				$('.bstooltip').tooltip({container: '#confirm-modal',html:true});
				
				$('#confirm-modal .modal-dialog').attr('snow-data-time',time);
				pressenter('[snow-data-time="'+time+'"]','#'+$('#confirm-modal .modal-footer').find('button').first().prop('id'));
				
				addselectbox('#confirm-modal select:not([multiple])');
				
				if (typeof options.callback === 'function')options.callback();
			}
		},
		get modal() { return $('#confirm-modal') },
		
		get d3c() {return  $('#snow-d3c')},
		get prettysuccess() { return $('#snow-d3c #prettysuccess'); },
		get prettyerror() { return $('#snow-d3c #prettyerror'); },
		
		get login() {return $('#snow-login')},
		get loginprettysuccess() { return $('#snow-login #prettysuccess'); },
		get loginprettyerror() { return $('#snow-login #prettyerror'); },
		
		get manage() {return $('#content #manage .content')},
		
		buttons: {
			reset: function(btn) {
				//$('button , submit , '+btn).button('reset');
			},
			loading: function(btn) {
				//$(btn).button('loading');
			},
			get changereceived() {return $('#viewledger #changereceived') },
			get changetotal() { return $('#viewledger #changetotal') },
			get findme() { return $('#walletbar #findme') },
			get deleteledger() { return $('#viewledger #deleteledger') },
			get cancelledger() { return $('#walletbar #cancelledger') },
		},

		inputs : {
			get d3ckey() {return $('#d3ckey')},
			get sendchat() {return  $('#chatbox .sendbox #s-message')},
			get chatroom() { return $('#chatbox .sendbox #s-room') },
			get find() { return $('#walletbar #findme') },
			
			/*ledger view */
			get ledgerkey() {return $('#viewledger #ledgerID'); },
			get totalreceivedtype() {return $('#viewledger #totalreceivedtype') },
			get totalreceived() { return $('#viewledger #totalreceived') },
			get ledgertotal() {return $('#viewledger #total') },
			get ledgertotaloffset() {return $('#viewledger #totaloffset') },
			get ledgercurrency() {return $('#viewledger #ledgercurrency') },
			
			/*tx */
			get txaccount() {return el.manage.find('#txaccount'); },
			get txledgerkey() {return el.manage.find('#ledgerid'); },
		},
		
		window : $( window ),
		document : $( document ),
		
		get searchfor() { return $('#walletbar #searchfor') },
		
		get chatbox() { return  $("#chatbox")},
		get chatuserbox() { return  $("#chatbox .userbox")},
		get chatusers() { return  $("#chatbox .userbox #chatusers")},
		get chatsendbox() { return  $("#chatbox .sendbox")},
		get chatroom() { return $('#chatbox .sendbox #s-room') },
		get chatmessagebox() { return  $("#chatbox .messagebox")},
		get chatdiv() { return  $("#chatbox .messagebox #chatmessages")},
		get chat() { return $('#chatmessages .chatmessage')},
		get chatmessages() { return  $("#chatmessages .chatmessage")},
		
		/* ledger  */
		get swaptotal() { return $('#viewledger .swaptotal') },
		get swaptotalreceived() { return $('#viewledger .swaptr') },
		get swaptotaloffset() { return $('#viewledger .swapoffset') },
		get ledgerform() { return el.manage.find('#ledgerForm')  },
		
		/* tx */
		get hidetx() { return el.manage.find('.hidetx') },
		get txform() { return el.manage.find('#txForm')  },
		
		get walletbar() { return $('#walletbar') },
		get menubar() { return $('#menubar') },
		get searchbar() {
			
			
			if(el.ledgerentries._order) {
				$('#searchbar')
				.autocomplete({ 
					source: el.ledgerentries._order,
					minLength:0,
					select: function( event, ui ) {
						console.log($(event.target.id))
						bone.router.navigate('/d2c/ledger/'+ui.item.value, {trigger: true});
						$('#searchbar').prop('placeholder',ui.item.value);
						setTimeout(function(){$('#searchbar').val('').blur();},750)
					},
					change: function(event, ui) {
						
					}
				})
				.focus(function(){
					$(this).autocomplete('search', $(this).val())
				});
			}
			
			return $('#searchbar');
		}, 
		set searchbar (ignore) {
			pressenter($('#searchbar'),el.inputs.find);
			return el.searchbar;
		},
	}
	
	
	
	/* model */
	var snowmodel = {
		set: function(model,data,elref) {
			if (this[model]) {
				this[model] = {data:data,elref:elref}
			} else {
				
				Object.defineProperty(this, model, {
				    configurable:true,
				    enumerable:true,			    
				    get: function() {
					return this['_'+model].data;
				    },
				    set: function(obj) {
					
					var tmp = {}
					
					if(obj.data)tmp.data = obj.data;
					if(obj.elref)tmp.el = el[obj.elref];
					if(obj.elref)tmp.elref = obj.elref;
					
					tmp.updatedOn = new Date().getTime();
					
					var has_set = (tmp.el) ? Object.getOwnPropertyDescriptor(el,obj.elref) : {};
					//console.log('has_set',has_set.value);
					if(has_set.value && has_set.value.set) {
						has_set.value.set(obj.data)
					} else {
						has_set = obj.data;
					}
					
					this['_'+model] = tmp;
				    }
				});
				
				this[model] = {data:data,elref:elref}
			}
		},
		
	}
	
	
	/* create our models */

	/* route the incoming actions */
	var incomingaction = {
		find: {
			clients: function(resp) { snowmodel.set('clients',resp.data.data,'clients') },
			wallets: function(resp) { snowmodel.set('wallets',resp.data.data,'wallets') },
			ledger: function(resp) { snowmodel.set('ledgerentries',resp.data.data,'ledgerentries') },
			currencyrates: function(resp) { 
				var _d = resp.data.data;
				if(_d instanceof Array) {
				/* set up rates array */
					snowmoney['usd']={};
					snowmoney['eur']={};
					_d.forEach(function(v,i) {
						//console.log(v.ticker);
						if(v.ticker=='eur')return;
						snowmoney[v.ticker]={};
						snowmoney['usd'][v.ticker]={'time':v.createdDate,'price':(1/v.usd)};
						snowmoney[v.ticker]['usd']={'time':v.createdDate,'price':v.usd};
						snowmoney[v.ticker]['eur']={'time':v.createdDate,'price':v.eur};
						snowmoney[v.ticker]['btc']={'time':v.createdDate,'price':v.btc};
						snowmoney[v.ticker]['ltc']={'time':v.createdDate,'price':v.ltc};
						snowmoney[v.ticker]['doge']={'time':v.createdDate,'price':v.doge};
						if(v.eur)snowmoney['eur'][v.ticker]={'time':v.createdDate,'price':(1/v.eur)};
						
					});
					if('Object' !== typeof snowmoney['btc']['doge'])snowmoney['btc']['doge']={'time':_d[0].createdDate,'price':1/snowmoney['doge']['btc'].price};
				}	
				
				
				snowmodel.set('snowmoney',snowmoney); 
				console.log(snowmodel.snowmoney,'snowmoney') 
			},
			accounts: function(resp) {
				console.log('received wallet accounts',resp.data.data)
				el.attendedaccounts = resp.data.data;
			},
			addresses: function(resp) {
				console.log('received wallet account addresses',resp.data.data)
				el.addressselect = resp.data.data;
			},
		},
		ledger: {
			find: function(resp) { 
				if(resp.data.success == true && resp.data.results==1) {
					el.ledgerentries.set(resp.data.data);
					console.log(resp.data);
					if((resp.refresh !== 1) || ( (el.inputs.ledgerkey.val() === resp.data.data[0].ledgerID) && (resp.refresh === 1) ))el.viewledger = resp.data.data[0].ledgerID;
					
				} else if(resp.data.success == true && resp.data.results>1) {
					el.ledgerentries.set(resp.data.data);
					//bone.router.navigate('/d2c/find/' + resp.data.query.ledger + '/results', {repalce: true});
					simplemainhtml('<div id="listledgers"></div>');
					el.listledgers = resp.data.data;
				} else {
					console.log('no ledger found',resp.data.data);
					var error = resp.data.error || 'Try a different search term.';
					snowmessage('prettyerror','I did not find any matching entries. <br />' + error)
				}
			},
			create: function(resp) { 
				el.buttons.reset();
				if(resp.data.success==true) {
					
					if(el.ledgerentries._order.indexOf(resp.data.data.ledgerID)<0)
					{
						var l = el.ledgerentries._data.length;
						el.ledgerentries._order.unshift(resp.data.data.ledgerID);
						el.ledgerentries._data.unshift(resp.data.data.doc);
						
					}
					bone.router.navigate('/d2c/ledger/'+resp.data.data.ledgerID, {trigger: true});
					
				} else {
					//show errors
					console.log('create ledger error');
					snowmessage('prettyerror',resp.data.error);
				}
			},
			modify: function(resp) { 
				
				if(resp.data.success==true) {
					
					el.ledgerentries.set([resp.data.data.doc]);
					console.log('modified ledger',resp.data);
					el.viewledger = resp.data.data.ledgerID;
					
				} else {
					//show errors
					console.log('modify ledger error');
					snowmessage('prettyerror',resp.data.error);
				}
			},
		}
	}
	
	
	
	/* watch window resize */
	el.window.on('resize',function() {
		resizechat();
	});
	
	/* messages */
	function snowmessage(type,msg,delay,div) {
		if(delay=='')delay=4000;
		if('prettyerror' == type  || 'prettysuccess' == type) {
			//if we have prettyerrors use it
			var pretty = div || el[type];
			
			if(pretty.length>0) {
				console.log('pretty',pretty);
				pretty.show().find('p').html(msg);
			} else {
				//fill the return zone
				var changediv = div || el.manage;
				console.log('killerror not div')
				if($('.fadeerror').css('display')=='none')$('.fadeerror').html('Request could not be completed.').fadeIn().delay(delay).fadeOut();
				$(changediv).html('<div class="requesterror"><span>'+msg+'</span></div>').fadeIn();
			}
			
			
		} else {
			//flash a message type
			$('.fade'+type).html(msg).fadeIn().delay(delay).fadeOut();
		}	
	}
	function clearpretty() {
		el.prettysuccess.hide();
		el.prettyerror.hide();
		el.loginprettysuccess.hide();
		el.loginprettyerror.hide();
	}
	/* add error and success divs when removed by user */
		el.document.bind('closed.bs.alert', function () {
			setTimeout(function(){
				console.log('add pretty back')
				var e = el.prettyerror,
					s = el.prettysuccess,
					le = el.loginprettyerror,
					ls = el.loginprettysuccess,
					fill = '<div class="alert alert-success alert-dismissable"><button data-dismiss="alert" aria-hidden="true" class="close">×</button><p></p></div>',
					fillerror = '<div class="alert alert-danger alert-dismissable"><button data-dismiss="alert" aria-hidden="true" class="close">×</button><p></p></div>';
				if(!$.trim(e.html()))e.html(fillerror).hide();
				if(!$.trim(s.html()))s.html(fill).hide();
				if(!$.trim(le.html()))le.html(fillerror).hide();
				if(!$.trim(ls.html()))ls.html(fill).hide();
				
			}, 750);
		});
	
	
	/* assign the enter key to modal submits */
	function pressenter(wrap,btn) {
		$(wrap).keypress(function(event){    
			if(event.keyCode==13){
				//console.log(btn);
			   $(btn).trigger('click');
			   //console.log('enter pressed',wrap);
			   event.preventDefault();
			}
		});
	}
	
	/* add  enter presses */
	
	
	
	/* main html -- fade out, replace, fade in  - using opacity to retain page height */
	var updatemaintemplate = function(template,options,div,cb) {
		
		if(!div)div=el.manage;
		if(!options)options={};
		
		console.log('update template');
		el.chatbox.hide();
		
		if('function' !== typeof bonehtml[template])template = '404';
		console.log('template',template);
		
		if('function' === typeof bonehtml[template])div.fadeTo(0,0).show().html(bonehtml[template](options)).delay(200).fadeTo("slow",1);
		
		addselectbox();
		
		
		
		if('function' === typeof cb)cb();
	}
	var simplemainhtml = function(html,div) {
		if(!div)div=el.manage;
		el.chatbox.hide();
		div.show().html(html);
	}
	var updatemainhtml = function(html,div) {
		if(!div)div=el.manage;
		console.log('update html');
		el.chatbox.hide();
		div.show().fadeTo(0,0).html(html).delay(200).fadeTo("slow",1);
		addselectbox();
		//el.menubar.affix({ offset: { top: 50 } });
	}
	var appendmainhtml = function(html,div) {
		if(!div)div=el.manage;
		console.log('append html');
		el.chatbox.hide();
		div.append(html);
	}
	
	el.document.on('affixed.bs.affix','#menubar',function() {
		//$('#menuspy').removeClass('hidden');
		
	});
	el.document.on('affix-top.bs.affix','#menubar',function() {
		//$('#menuspy').addClass('hidden');
	});
	
	
	/* turn the ui off and show login when not authorized */
	function setui(on,err) {
		if(on=='on') {
			el.login.fadeOut();
			simplecheck = true;
			//el.d3c.fadeIn('slow');
		} else {
			if(mastersocket)mastersocket.disconnect();
			
			if(el.login.css('display') === 'none') {
				el.d3c.html('');
				el.login.find('.content').html(bonehtml.login({d3ckey:mykey}));
				pressenter(el.inputs.d3ckey,'#joind4html .btn');
			}
			el.login.fadeIn('slow');
			el.inputs.d3ckey.focus();
			
			simplecheck = false;
			if(err)snowmessage('prettyerror',err,null,el.loginprettyerror);
		}
	}
	
	/* add a chat message */
	function resizechat() {
		var H = el.window.height() - 105;
		el.chatbox.height(H);
		el.chatuserbox.height(H - 45);
		el.chatmessagebox.height(H - 45);
		el.chatdiv.css('max-height',H - 45);
	}
	function htmlentities(value) {
		return $('<div />').text(value).html();
	}
	function message(from, msg, room) {
		
		var mepost = (from == mykey) ? 'mymessage' : (from == 'd3c') ? 'd3cmessage' : '',
			currentroom = el.inputs.chatroom.val(),
			alls = ['d3c','d2c','inhouse'],
			display = (currentroom == from || currentroom == '' || alls.indexOf(currentroom) != -1) ? 'none' : 'none',
			align = (from != mykey) ? 'left' : 'right';
		
		var AA = '<div class="col-xs-2 pad messagefrom " style="text-align:' + align + '">' + htmlentities(from) + '</div>',
			BB = '<div class="col-xs-8 message pad " style="text-align:' + align + '">' + htmlentities(msg) + '</div>',
			BBB = '<div class="col-xs-offset-2 col-xs-8 message pad  ' + mepost  + '" style="text-align:' + align + '">' + htmlentities(msg) + '</div>',
			CC = '<div class="col-xs-2 messagetime pad  ' + mepost  + '" style="text-align:' + align + '">' + htmlentities((new Date().toLocaleTimeString())) + '</div>';
		
		if(from != mykey) {
			var msghtml = '<div style="display: ' + display + '" class="chatmessage  ' + room + ' ' + from + '  clearfix">' + AA + BB + CC + '</div>';
		} else {
			var msghtml = '<div style="display: ' + display + '" class="chatmessage  ' + room + ' ' + from + ' clearfix">'  + BBB + CC + '</div>';
		}
		
		el.chatdiv.append(msghtml);
		
		while (el.chatmessages.size() > 200) {
			el.chatmessages.find(':firstchild').remove();
		}
		
		resizechat()
		showchatmessages(currentroom)
		//el.chatbox.scrollTo(el.chatboxmessage.find(':lastchild')), 100);
	}
	
	/* show chat messages per room */
	function showchatmessages(room) {
		if(room == '') {
			el.chatmessages.fadeIn();
		} else if(room == 'd3c') {
			el.chatdiv.find('.d3c').fadeIn();
		} else if(room == 'd2c') {
			el.chatdiv.find('.d2c').fadeIn();
		} else if(room == 'inhouse') {
			el.chatdiv.find('.inhouse').fadeIn();
		} else {
			el.chatdiv.find('.' + room + '.' + mykey ).fadeIn();
		}
	}
	/* populate chat select with clients */
	var setclientchatselect = function(users) {
			
		if(!users) users = clients
		
		var	O = [];
					
		O.push('<ul class="nav nav-info nav-pills nav-stacked">');
		O.push('<li data-snow-room="" ><a>Lobby</a></li>');
		O.push('<li role="presentation" class="dropdown-header">d3c</li>');
		O.push('<li data-snow-room="d3c" class=""><a>All</a></li>');
		$.each(users.d3c, function(value, key)
		{
			O.push('<li data-snow-room="'+ value +'"><a>'+ value +'</a></li>');
		});
		
		O.push('<li role="presentation" class="dropdown-header">d2c</li>');
		O.push('<li data-snow-room="d2c"><a>All</a></li>');
		$.each(users.d2c, function( value)
		{
			O.push('<li data-snow-room="'+ value +'"><a>'+ value +'</a></li>');
		});
		O.push('<li role="presentation" class="dropdown-header">inhouse</li>');
		O.push('<li data-snow-room="inhouse"><a>All</a></li>');
		$.each(users.inhouse, function( value)
		{
			O.push('<li data-snow-room="'+ value +'"><a>'+ value +'</a></li>');
		});
		
		O.push('</ul>');
		
		el.chatusers.html(O.join(''));
		
		var currentroom = el.inputs.chatroom.val();
		
		el.chatusers.find("[data-snow-room='" + currentroom + "']").addClass('active');
	}
	
	/* nice selectbox  */
	function addselectbox(el) {
		var find = el || '#snowpi-body select:not([multiple])';
		$(find).selectbox();
		return $(find);
	}
	
	
	el.login.on('click','#joind4html .btn',function() {
		mykey = $('#d3ckey').val();
		connectsock(mykey,true);
	});
	$(document).on('click','.changetheme',function() {
		var mbody = $('body');
		if(mbody.hasClass('themeable-snowcoinslight')==true) {
			mbody.removeClass('themeable-snowcoinslight');
		} else {
			mbody.addClass('themeable-snowcoinslight');
		}
	});
	
	
	/* extend jquery */
	jQuery.fn.extend({
		/* table column sorter */
		sortcol: function() {
			return this.each(function() {
				$(this).click(function(){
					var table = $(this).parents('table').eq(0)
					var rows = table.find('tbody tr').not( ".skipme" ).toArray().sort(comparer($(this).index(),this))
					
					//console.log(table.find('tr:gt(0)').toArray());
					this.asc = !this.asc
					if (!this.asc){rows = rows.reverse()}
					for (var i = 0; i < rows.length; i++){table.append(rows[i])}
				});
			});
		},
	});
	function sortcol(who,skip)
	{
		$(who).click(function(){
			var table = $(this).parents('table').eq(0)
			
			var rows = table.find('tbody tr').not( ".skipme" ).toArray().sort(comparer($(this).index(),this))
			
			//console.log(table.find('tr:gt(0)').toArray());
			this.asc = !this.asc
			if (!this.asc){rows = rows.reverse()}
			for (var i = 0; i < rows.length; i++){table.append(rows[i])}
		});
	}
	
	function comparer(index,who) {
		if($(who).is(".snowsortcountitems"))
			return function(a, b) {
				var valA = $(a).children('td').eq(index).children().length;
				var valB = $(b).children('td').eq(index).children().length;
				//console.log( " a : ", valA," b : ", valB);
				//var valA = getCellValue(a, index), valB = getCellValue(b, index)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).is(".snowsorttotal"))
			return function(a, b) {
				var valA = getCellValue(a, index).split(" "), valB = getCellValue(b, index).split(' ');
				//console.log( " val : ", currentwally.coinstamp," valA : ", valA[0].replace(/,/g,''));
				return  parseFloat(valA[0].replace(/,/g,'')) - parseFloat(valB[0].replace(/,/g,'')) 
			}
		else if($(who).is(".snowsortisempty"))
			return function(a, b) {
				var valA = ($(a).children('td').eq(index).html().trim()=='')?0:1,
					valB = ($(b).children('td').eq(index).html().trim()=='')?0:1;
				//console.log( " a : ", valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).is(".snowsortdate"))
			return function(a, b) {
				var valA =  moment($(a).children('td').eq(index).html().trim(),'YYYY-MM-D h:mm:ss a Z'),
					valB = moment($(b).children('td').eq(index).html().trim(),'YYYY-MM-D h:mm:ss a Z');
				
				return valB.isAfter(valA);
			}	
		else
			return function(a, b) {
				
				var valA = getCellValue(a, index), valB = getCellValue(b, index)
				//console.log( " a : ", valA," b : ", valB);
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
	}
	function getCellValue(row, index){ return $(row).children('td').eq(index).text() }
	/* end sorter */
	
	
	/* format currency */
	Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
		var n = this,
		decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
		decSeparator = decSeparator == undefined ? "." : decSeparator,
		thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
		sign = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
		return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "").replace(/\.?0+$/, "");
	};
	
	
	
	
	/* our sockets */ 
	function connectsock(token,retry) {
			console.log('token',token,mykey)
			
			var options = {
			 query: 'snowclient=' + token + '&key=' + mainkey,
			 'sync disconnect on unload': true
			}
			
			//rememberTransport: false,
			// 'reopen delay': 1000
			var uri = '//';
			//set the socket host.  we get socketio from dcc.jade
			if(socketio.host) uri = uri + socketio.host;
			if(socketio.port) uri = uri + ':' + socketio.port;
			if(socketio.ssl)  options.secure=true;
			if(retry) {
				options['force new connection']=true;
				//if(primesocket)primesocket.disconnect();
				if(mastersocket)mastersocket.disconnect();
				if(chatsocket)chatsocket.disconnect();
				if(token === 'reset' || token === 'login'){ return setui('off'); }
				return authmaster(uri,options);
			}
			

			mastersocket = false, chatsocket = false;
			  
			primesocket = io.connect(uri,options);
			
			primesocket.on('error', function (err) {
					console.log('error',err);
					setui('off')
					//bone.router.navigate('/d2c/reset/', {trigger: true});

			}).on('connect', function () {
				/** we connected to the server
				 *  now try the namespace
				 * */
				console.log('main connected');
				if(token === 'reset' || token === 'login'){ return setui('off'); }
				authmaster(uri,options);
				
			}).on('authfail:d2c', function (data) {
				console.log('authfail',data.err);
				setui('off',data.err)
				
			}).on('disconnect', function () {
				setui('off') 
				bone.router.navigate('/d2c/reset/', {trigger: true});
				console.log('disconnected');
				//if(mastersocket)mastersocket.disconnect();
				//if(chatsocket)chatsocket.disconnect();
				el.ledgerentries._data= [];
				el.ledgerentries._order= []
				
			});
	}
	
	function authmaster(uri,options) {
		
		console.log('start d2c auth connect');
		
		/* start routes */
		startboneroutes();
		bone.router.navigate('/d2c/login/', {trigger: true});
		
		uri = uri + '/d2c';// namespace
		mastersocket = io.connect(uri,options);
		console.log(mastersocket,options)
		
		mastersocket.on('error', function (err) {
			console.log('error',err);
			setui('off')

		}).on('connect', function () {
			/* connected to d3c!!!!!!!!! */
				
				console.log('authenticated /d2c');
				/* start the comms socket */
				chatsock(mykey,true)
				
				/* set ui on and start bone */
				setui('on')
				startmaster();
			
		});
	}
	
	/* chat socket */
	function chatsock(token,retry) {
			var chatoptions = {
			 query: 'snowclient=' + token,
			 'sync disconnect on unload': true
			}
			console.log('token3',token,mykey)
			if(retry)chatoptions['force new connection']=true;

			var uri = '//';
			//set the socket host.  we get socketio from dcc.jade
			if(socketio.host) uri = uri + socketio.host;
			if(socketio.port) uri = uri + ':' + socketio.port;
			if(socketio.ssl)  chatoptions.secure=true;

			uri = uri + '/comms';// namespace
			
			chatsocket = io.connect(uri,chatoptions);
			
			console.log('token3',token,chatoptions)
			//console.log('d3c',mastersocket);
			//console.log('chat',chatsocket);

			chatsocket.on('connect', function () {
				console.log('chat connected');
				//snowchat.init();
				startchatter()
			});
	}
	
	
	/* start chat connectors on successful connect */
	function startmaster() { 
		snowsocket = bone.io('d2c', {
			config: {
				socket: mastersocket
			},
			outbound: {
				routes: ['template', 'sort','register','leave','action']
			},
			inbound: {
				sort: function(data, context) {
					var gotdata = data
					appendmainhtml(gotdata.data)
					
				},
				template: function(data, context) {
					var gotdata = data
					var div = data.div ? $(data.div) : false;
					updatemainhtml(gotdata.html,div)
				},
				start: function(data, context) {
					var gotdata = data
					var div = data.div ? $(data.div) : false;
					updatemainhtml(gotdata.html,div)
					startboneviews()
					if(_rememberRoute) {
						bone.router.navigate(_rememberRoute, {trigger: true});
						delete _rememberRoute;
					} else {
						bone.router.navigate('/d2c/ledger', {trigger: true});
					}
					/* autocompletes */
					el.searchbar = 1;
					el.menubar.find('a span').tooltip({trigger:'hover',html:true});
				},
				action: function(data,context) {
					if(incomingaction[data.command][data.action])incomingaction[data.command][data.action](data);
				},
			}
		});
		
		snowsocket.register();
	}
	
	/* start chat connectors on successful connect */
	function startchatter() {
		snowchat = chatbone.io('chatter', {
			config: {
				socket: chatsocket
			},
			outbound: {
				routes: ['message', 'register', 'getclients']
			},
			inbound: {
				message: function(data, context) {
					var gotdata = data
					message(gotdata.from,gotdata.html,gotdata.room);
					if(gotdata.clients)setclientchatselect(gotdata.clients)
				},
				setclients: function(data, context) {
					console.log('got clients',data)
					var gotdata = data
					setclientchatselect(gotdata.clients)
				}
			}
			
		});
		snowchat.register();
	}

	
	
	
	/* try and connect - this also shows the login form */
	connectsock(mykey);
})
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
