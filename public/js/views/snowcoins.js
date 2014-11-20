$(function() {
	
	
	var path = {client:'d2c',master:'d3c',wm:'snowcoins',offline:'share'},
		currenthash,
		currenttab,
		currentwally,
		hash,
		longhash,
		lockstatus = {},
		myip,
		snow = {},
		returnmoon,
		previousmoon,
		dfr;
	/* messages */
	var snowmessage = function(type,msg,delay,div) {
		if(delay==='')delay=4000;
		if('killerror' === type || !isNaN(type)) {
			var changediv = div || '.dogeboard-left .content';
			//if we have prettyerrors use it
			var pretty = $('#prettyerror');
			//console.log(pretty);
			if(pretty.length>0) {
				pretty.show().find('p').html(msg);
				$(changediv).css('visibility','visible').hide().delay(400).fadeIn();				
				$('.dogeboard-left .loading').fadeOut("slow");
			} else {
				//clear loading and fill the return zone
				console.log('killerror not div')
				if($('.fadeerror').css('display')==='none')$('.fadeerror').html('Request could not be completed.').fadeIn().delay(delay).fadeOut();
				$(changediv).html('<div class="requesterror"><span>'+msg+'</span></div>').css('visibility','visible').hide().delay(400).fadeIn();
				$('.dogeboard-left .loading').delay(100).fadeOut("slow");
			}
			
			
		} else {
			//flash a message type
			$('.fade'+type).html(msg).fadeIn().delay(delay).fadeOut();
		}	
	}
	/* add error and success divs when removed by user */
	var alertbind = function() {
		$(document).bind('closed.bs.alert', function () {
			setTimeout(function(){
				var e = $('#prettyerror'),
					s = $('#prettysuccess');
				if(!$.trim(e.html()))e.html('<div class="alert alert-danger alert-dismissable"><button data-dismiss="alert" aria-hidden="true" class="close">×</button><p></p></div>').hide();
				if(!$.trim(s.html()))s.html('<div class="alert alert-success alert-dismissable"><button data-dismiss="alert" aria-hidden="true" class="close">×</button><p></p></div>').hide();
				
			}, 3000);
		});
	}
	/* clear menus */
	var clearmenus = function(clear,add) {
		var off = (!clear || clear==='all') ? '#menuwallet,#menudcc' : '#menu'+clear; 
		$(off).fadeOut("slow");
		if(add)$('#menu'+add).fadeIn('slow');
		
	}
	/* set loading */
	var setloading = function() {
		$('.dogeboard-left .loading').fadeIn();
		$('.dogeboard-left .content').css('visibility','hidden');
	}
	/* clear loading */
	var loadingsuccess = function(html,callback) {
		$('.dogeboard-left .content').css('visibility','visible').hide().html(html).fadeIn("slow",callback);
		$('.dogeboard-left .loading').delay(100).fadeOut("slow");
	}
	/* this sets the current tab after a content refresh - used in snowreceivesettings and snowdccresponse */
	var settab = function() {
		$('.dogeboard-left .tabbox').css('min-height',$('#div'+snow.list).css('height'));	
		$('.dccsetuphide').hide();
		$('.dccnavlis').find('li').removeClass('active');
		var sections = $('#li'+snow.list);
		$(sections).addClass('active');
		$('#div'+snow.list).delay(300).fadeIn('slow',function(){
			$('.navbar-dccnav-collapse').removeClass('in');
			//$('.dogeboard-left .tabbox').css('min-height','100px');
		});
		
	}
	/* clear ssl */
	var clearssl = function(on) {
		if(on)
			$('#wallet-ssl').removeClass('hidden');
		else
			$('#wallet-ssl').addClass('hidden');
	}
	/* close wallet form */
	var closewalletform = function() {
		$('#addwalletwrap').slideUp();
	}
	/* assign the enter key to modal submits */
	var pressenter = function(wrap,btn) {
		$(document).on('keydown',wrap,function(event){    
			if(event.keyCode===13){
				//console.log(btn);
			   $(btn).trigger('click');
			   //console.log('enter pressed',wrap);
			   event.preventDefault();
			}
		});
	}
	/* clear testnet */
	var cleartestnet = function (on) {
		if(on) {
			$('#testnet-flash').fadeIn();
			$('.dogemenu').addClass('testnet');
		} else {
			$('#testnet-flash').hide();
			$('.dogemenu').removeClass('testnet');
		}
	}
	/* save profile listener*/
	var watchprofile = function() {
		$(document).on('click','#profileformbtn',function(){
			console.log('profile submit');
			var btn = $('#profileformbtn');
			btn.button('loading');
			var name=$('#snowcat-profile [name="username"]').val();
			if(name==='') {
				snowmessage('error','Please enter a username.','3000');
				btn.button('reset');
				console.log('profile error');
				$('#snowcat-profile [name="username"]').parent().addClass('has-error');
			}
			else {
				console.log('profile post',$('#snowcat-profile [name="theme"]').val());
				setloading();
				$.post("/snowcat",$( "#snowcat-profile" ).serialize())
				.done(function( resp,status,xhr ) {
					_csrf = xhr.getResponseHeader("x-snow-token");
					if($('#snowcat-profile [name="theme"]').val()!=$('#snowcat-profile [name="themewas"]').val())
						$('.changetheme').trigger('click')
					loadingsuccess(resp.html);
					btn.button('reset');
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		})
	}
	/* nice selectbox  */
	var addselectbox = function(el) {
		var find = $(el) || $('#snowpi-body select:not([multiple])');
		find.selectbox();
		console.log('selectbox',find)
		return find;
	}
	/** handle hash(page) changes  
	 * */		
	$(window).hashchange(function(){
		//console.log(currentwally);
		longhash = location.hash.substring(1).split("?"),
		hash=longhash[0];
		snow = {};
		var q= longhash[1] ? longhash[1].split("&") : [];
		q.forEach(function(val,index) {
			var t=val.split("=");
			snow[t[0]]=t[1];
		});
		var gotomoon = function() {
			dfr = $.Deferred();
			if(snow.moon==='info') {
				return snowinfo();
				
			} else if(!hash || hash==='' || hash===undefined || hash==='overview') {
				return snowhome();
			} else if(snow.moon==='update') {
				if(hash===currenthash) return snowopenwalletform()
				else return snowhash(snowopenwalletform)
			} else if(hash==='receive') {
				return snowreceivesettings();
				
			} else if(hash==='snowcat') {
				return snowcat();
				
			} else if(hash==='inqueue') {
				return snowinq();		
			} else if(hash!='') {
				return snowhash(snowhashpage);
			}	
		}
		var returntomoon = function() {
			dfr.resolve();
			//set the return
			returnmoon=previousmoon;
			previousmoon=snow.moon;	
		}
		$.when(gotomoon()).then(returntomoon());
		$('.snow-send #sendcoinamount, .snow-send #changeamountspan').tooltip('destroy');
	});
	/*home page*/
	function snowhome() {
		clearssl()
		closewalletform()
		setloading()
		clearmenus()
		changelock('off');
		snowchangehashselect();
		currenthash=hash;
		snowupdatemoon({moon:'overview'});
		$.ajax({
			url: "/api/snowcoins/local/change-wallet",
			data: { wallet:'all' }
		})
		.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
			currentwally='';
			loadingsuccess(resp.html);
			sortCol('#snow-overview th');
			addselectbox();
		});
		
		
	}
	
	/*receive setup page*/
	function snowreceivesettings() {
		console.log('snowtab',snow.tab);
		if(!snow.tab) {
			
			//location.href='/' + path.wm + '#receive?tab=dcc';
			//return;
			snow.tab = 'dcc';
			
		}
		if(snow.list && currenthash===hash && currenttab===snow.tab) {
			settab();
			return;
		}
		console.log('run snow receive');
		currenttab=snow.tab;
		var aa = currenthash!=hash ? true: $('body').hasClass('snow-body-receive')===true ? false:true;
		snowupdatemoon({moon:snow.tab});
		setloading()
		changelock('off');
		snowchangehashselect();
		//change menus
		clearmenus('wallet','dcc');
		currenthash=hash;
		$('.tab-content').removeClass('active in');
		clearssl()
		closewalletform()
		$.ajax({
			url: "/api/snowcoins/local/receive/setup",
			data: { wallet:'all',uri:JSON.stringify(snow) }
		})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			currentwally='';
			if(resp.ip && resp.ip!='')myip=resp.ip;
			if(resp.error)snowmessage('killerror',resp.error+'<p><a onclick="location.reload()">Try again</a></p>',3000);
			if(resp.msg)snowmessage('message',resp.msg,3000);
			loadingsuccess(resp.html)
			sortCol('#snow-receive th');
			ZeroClipboard.config({ debug: false });
			var client = new ZeroClipboard($(".copyme"), { moviePath: "/js/lib/zeroclipboard/ZeroClipboard.swf" });
			$(document).on('click','a[data-toggle="tab"]', function () {
			  var o=$(this).attr('data-target'), c=o.substr(0,3);
			  if(c==='TAB') {
				  $('#confirm-modal .easytab .tab-pane').hide();
				  $('#confirm-modal .fw-useme').val(o);
				  $('#confirm-modal .easytab a[data-target="'+o+'"]').tab('show');
				  $('#confirm-modal .easytab .tab-content #'+o).fadeIn("slow");
			  } else {
				if(snow.tab!=o)$('#confirm-modal .tab-pane').fadeOut();
				location.href='#receive?tab='+o;  
			  }
			  
			});
			
			if(snow.list)settab();
			$('.bstooltip').tooltip({container: 'body',html:true});
			$('#li'+snow.list).find('a').trigger('click');
			cleartestnet();
			alertbind();
		});		
	}
	
	/*help and info page*/
	function snowinfo() {
		snowchangehashselect();
		closewalletform()
		currenthash=hash;
		setloading()
		snowupdatemoon(snow);
		if(hash && hash==='receive')
			clearmenus('wallet','dcc');
		else if(hash && hash!='inq' && hash!='overview'
		&& hash!='snowcat')
			clearmenus('dcc','wallet');
		$.ajax({
			url: "/api/snowcoins/local/change-wallet",
			data: { action:'info',wallet:hash }
		})
		.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
			currentwally='';
			if(resp.error)snowmessage('error',resp.error.path,3000);
			if(resp.msg)snowmessage('message',resp.msg,3000);
			loadingsuccess(resp.html)
			cleartestnet()
			addselectbox();
		});
		delete snow.moon;
		
	}
	
	/*profile page*/
	function snowcat() {
		snowchangehashselect();
		closewalletform()
		currenthash=hash;
		setloading()
		snowupdatemoon(snow);
		clearmenus();
		$.ajax({
			type:'post',
			url: "/snowcat",
			data: $( "#scowcat-profile" ).serialize()
		})
		.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
			currentwally='';
			if(resp.error)snowmessage('error',resp.error.path,3000);
			if(resp.msg)snowmessage('message',resp.msg,3000);
			loadingsuccess(resp.html)
			cleartestnet()
			watchprofile()
			addselectbox();
		});
		delete snow.moon;
		
	}
	
	/*inq management*/
	function snowinq() {
		snowchangehashselect();
		clearssl()
		closewalletform()
		clearmenus()
		changelock('off');
		setloading()
		currenthash=hash;
		$.ajax({
			url: "/api/snowcoins/local/inq",
			data: { action:'info' }
		})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			currentwally='';
			if(resp.error)snowmessage('error',resp.error.path,3000);
			if(resp.msg)snowmessage('message',resp.msg,3000);
			loadingsuccess(resp.html,function(){snowupdatemoon({moon:'iq'})});
			cleartestnet();
			addselectbox();
		});
		snow.moon='';
		
	}
	
	/*hash change */
	function snowhash(callback) {
		clearmenus('dcc','wallet')
		if(typeof callback !== 'function')callback=console.log();
		if(!snow.moon)snow.moon='dashboard';
		closewalletform()
		//if the hash changed we need to reload the walet data with the new one
		if(hash!=currenthash)
		{
			currenthash=hash;
			//$('#updatecoinspan').text(hash);
			setloading()
			snowchangehashselect();
			$.ajax({
			  url: "/api/snowcoins/local/change-wallet",
			  data: { wallet:hash },
			})
			.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
				if(resp.success === true)
				{
					clearssl(resp.wally.isSSL)
					snowmessage('message','Now using wallet '+ resp.wally.name+'.',2000);
					currentwally=resp.wally;
					$('.dogemenulink').removeClass('active');
					//RPC based wallets need to check for lock status
					if(currentwally.coinapi==='rpc')
					{
						$.ajax({
						  url: "/api/snowcoins/local/wallet",
						  data: { wallet:hash,moon:'status' }
						})
						.done(function( resp,status,xhr ) {
							if(resp.success === true)
							{
								_csrf = xhr.getResponseHeader("x-snow-token");
								if(resp.data)changelock(resp.data.unlocked_until);
								if(resp.data && resp.data.testnet===true)
								{
									cleartestnet(true)
								}
								else
								{
									cleartestnet()
								}
								changelock(resp.data.unlocked_until || 0);
								return callback();
							} else {
								snowmessage('killerror','Please try again. <br />'+resp.error,3000);
							}
						});
					} else {
						cleartestnet()
						return callback();
					}
				}
				else
				{
					snowmessage('killerror','Please try again. <br />'+resp.error,3000);
				}
			});
		}
		else {
			//the hash is the same just run snowhashpage via the callback
			return callback();	
		}
	}

	/*subpage change*/
	function snowhashpage()
	{
			if(snow.moon)
			{
				setloading()
				$.ajax({
				  url: "/api/snowcoins/local/wallet",
				  data: { wallet:hash,moon:snow.moon,uri:JSON.stringify(snow) }
				})
				.done(function( resp,status,xhr ) {
					_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						if(resp.successmsg)snowmessage('success',''+ resp.successmsg+'',4000);
						//$('#console').html(hash+' '+resp.data.unlocked_until);
						$('.helppopover').popover('destroy');
						$('[rel=qrpopover]').popover('destroy');
						
						//console.log(resp.data.unlocked_until);
						if(resp.data.unlocked_until)changelock(resp.data.unlocked_until);
						loadingsuccess(resp.html)
						snowupdatemoon(snow);
						if(resp.snowmoney) {
							snowmoney=resp.snowmoney;
						}
						/*if(resp.rates) {
							 set up rates array 
							snowmoney['usd']={};
							snowmoney['eur']={};
							resp.rates.forEach(function(v,i) {
								//console.log(v.ticker);
								if(v.ticker==='eur')return;
								snowmoney[v.ticker]={};
								snowmoney['usd'][v.ticker]={'time':v.createdDate,'price':(1/v.usd)};
								snowmoney[v.ticker]['usd']={'time':v.createdDate,'price':v.usd};
								snowmoney[v.ticker]['eur']={'time':v.createdDate,'price':v.eur};
								snowmoney[v.ticker]['btc']={'time':v.createdDate,'price':v.btc};
								snowmoney[v.ticker]['ltc']={'time':v.createdDate,'price':v.ltc};
								snowmoney[v.ticker]['doge']={'time':v.createdDate,'price':v.doge};
								if(v.eur)snowmoney['eur'][v.ticker]={'time':v.createdDate,'price':(1/v.eur)};
								
							});
							if('Object' !=== typeof snowmoney['btc']['doge'])snowmoney['btc']['doge']={'time':resp.rates[0].createdDate,'price':1/snowmoney['doge']['btc'].price};
						
						
						}*/
						
						$('[rel=qrpopover]').popover({trigger:'click'});
						$('[rel=qrpopover]').on('shown.bs.popover', function () {
							var qr= $(this).attr('data-qr');
							//$('#'+qr).html('test');
							$('#'+qr).qrcode({text:qr,label:qr,mode:0,fontname: 'sans-serif',size:290,fill:'#FFF',mSize:0.04,});
							
						});
						$('.bstooltip').tooltip();
						alertbind();
						addselectbox();
					}
					else
					{
						snowmessage('killerror','Please try again. '+resp.error,4000);
					}
					
				});
			}
			else
			{
				snowmessage('killerror','Page not found. ',4000);
			}
			
	}
	

	/* alterations by page */
	function snowupdatemoon(snow)
	{
		$('.dogemenulink,.dogedccmenulink').removeClass('active');
		$("a[snowlink='"+snow.moon+"']").addClass('active');
		var div =$('#snowpi-wrapper,#snowpi-body');
		div.removeClass();
		switch(snow.moon)
		{
			case "status":
				div.addClass('snow-body-status');
				
				break;
			case "dashboard":
				div.addClass('snow-body-dashboard');
				
				break;
			case "send":
				div.addClass('snow-body-send');
				
				break;
			case "receive":
			case "settings":
			case "dcc":
				div.addClass('snow-body-receive');
				
				break;
			case "info":
				div.addClass('snow-body-status');
				
				break;
			case "iq":
				div.addClass('snow-body-status');
				
				break;
			case "D3C":
				div.addClass('snow-body-receive');
				break;
			case "accounts":
				div.addClass('snow-body-accounts');
				sortCol('#snow-accounts th');
				break;
			case "transactions":
				div.addClass('snow-body-overview');
				sortCol('#snow-transactions th',false);
				$("#txaccounts").selectbox();
				$("#txrows").selectbox();
				break;
			default:
				div.addClass('snow-body-overview');
				
				break;
		}
		
	}
	/* update wallet select input on hash change */
	function snowchangehashselect()
	{
		var setme = (hash==='receive')?'receive?tab=dcc':hash || 'overview';
		$("#walletselect").selectbox("detach").val(setme);
			$("#walletselect").selectbox({
				onChange: function (val, inst) {
					var lh = ((val!='receive?tab=dcc' && val!='overview') && snow.moon) ? '?moon='+snow.moon : '';
					//console.log('#'+val+lh);
					if(snow.moon===val)lh+='&'+new Date().getTime();
					location.href='#'+val+lh;	
				},
				effect: "fade"
			});
	}
	/*** run on start ***/
	snowchangehashselect();
		
	
	/*menu links*/
	$('.dogemenulink').on("click",function(){
		var val=$(this).attr('snowlink');
		$('.dogemenulink').tooltip('hide');
		if(currenthash || val==='info') {
			//console.log(currenthash);
			if(currenthash!='overview' && currenthash!='receive') {
				var extra=(val==='transactions')?'&account=all&num=10':'';
				if(snow.moon===val)extra+='&'+new Date().getTime();
				location.href='#'+currenthash+'?moon='+val+extra;
			} else if(val==='info') {
				location.href='#'+currenthash+'?moon='+val;
			}else snowmessage('error','Pick a wallet first shibe.',3000);
		} else snowmessage('error','Pick a wallet first shibe.',3000);
	});
	$('.dogedccmenulink').on("click",function(){
		var val=$(this).attr('snowlink'),
			extra='';
		$('.dogedccmenulink').tooltip('hide');
		if(snow.tab===val)extra+='&'+new Date().getTime();
		location.href='#receive?tab='+val+extra;
	});

	
	
	
	
	/*change hash for update wallet*/
	$(document).on('click','.updatecoin',function(){
		if(currenthash!='') {
			var d=new Date()-2000000;	
			location.href='#'+currenthash+'?moon=update&'+d;
		} else snowmessage('error','Select a wallet first shibe',3000);
	});
	
	
		
	/* jquery-ui autocompletes */
	$( "#aw-coin").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
	$( "#aw-cointicker").autocomplete({ source: defaultcointickers  }).focus(function(){$(this).autocomplete('search', $(this).val())});
	

	/* open wallet form */
	function snowopenwalletform() {
		//console.log(currentwally);
		snowupdatemoon(snow);
		$('.dogeboard-left .loading').delay(100).fadeOut("slow");
		$('#aw-name').val(currentwally.name);
		$('#aw-cointicker').val(currentwally.cointicker);
		$('#aw-currency').val(currentwally.currency);
		$('#aw-apikey').val((currentwally.apikey==='undefined')?'':currentwally.apikey);
		$('#aw-coinapi').val(currentwally.coinapi);
		$('#aw-key').val(currentwally.key);
		$('#aw-address').val(currentwally.address);
		$('#aw-port').val(currentwally.port);
		$('#aw-apiuser').val(currentwally.apiuser);
		$('#aw-ca').val(currentwally.ca);
		var ssl = (currentwally.isSSL)?1:0;
		$('#aw-ssl').val(ssl);
		/*$('#aw-apipassword').val(currentwally.apipassword); -- encrypted no use */
		$('#aw-coin').val(currentwally.coin);
		$('#aw-coinstamp').val(currentwally.coinstamp);
		$('.addwalletbutton').text('Update Wallet');
		$('#addwalletwrap').slideDown(1000,function(){
			
		});
		$('.adderror').hide().html('');
	}
	
	/*add wallet*/
	$('.awbutton').click(function(){
		var next=true,ca=$('#aw-ca').val(),key=$('#aw-key').val(),ssl=$('#aw-ssl').val(),coin=$('#aw-coin').val(),coinstamp=$('#aw-coinstamp').val(),name=$('#aw-name').val(), address=$('#aw-address').val(), port=$('#aw-port').val(),apikey=$('#aw-apikey').val(), apiuser=$('#aw-apiuser').val(), coinapi=$('#aw-coinapi').val(), currency=$('#aw-currency').val(), cointicker=$('#aw-cointicker').val(), apipassword=$('#aw-apipassword').val();
		if(name==='') {
			$("#aw-name").parent().addClass('has-error');
			next=false;
		} else $("#aw-name").parent().removeClass('has-error');
		if(address==='') {
			$("#aw-address").parent().addClass('has-error');
			next=false;
		} else $("#aw-address").parent().removeClass('has-error');
		if(coin==='') {
			$("#aw-coin").parent().addClass('has-error');
			next=false;
		} else $("#aw-coin").parent().removeClass('has-error');
		if(apipassword==='' && key==='') {
			$("#aw-apipassword").parent().addClass('has-error');
			next=false;
		} else $("#aw-apipassword").parent().removeClass('has-error');
		if((apiuser==='' && apikey==='')) {
			$("#aw-apiuser").parent().addClass('has-error');
			$("#aw-apikey").parent().addClass('has-error');
			next=false;
		} else {
			$("#aw-apiuser").parent().removeClass('has-error');
			$("#aw-apikey").parent().removeClass('has-error');
		}
		if(next===true) {
			$.ajax({
			  url: "/api/snowcoins/local/add-wallet",
			  data: {key:key,name: name,coin:coin,coinstamp:coinstamp,currency:currency,cointicker:cointicker,coinapi:coinapi,apikey:apikey,address:address,ssl:ssl,ca:ca,port:port,apipassword:apipassword,apiuser:apiuser }
			})
			.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
				if(resp.success === true)
				{
					$('#addwalletwrap').slideToggle();
					$('#addwallet input').val('');
					$('#aw-port').val('22555');
					$('.adderror').hide().html('');
					var meg=(resp.wally.id===currentwally.id)?'Wallet updated successfully':'New wallet added.';
					$('.walletmsg').html(meg).fadeIn(function()
					{
						if(currenthash!=resp.wally.key && currenthash!='' )
						{
							
							$('#walletselect #'+currenthash).val(resp.wally.key).text(resp.wally.name).attr('id',resp.wally.key);
							$("#walletselect").selectbox("detach").selectbox("attach");
						}
						else if(resp.wally.id!=currentwally.id)
						{
							$("#walletselect").selectbox("detach").append('<option value="'+resp.name+'" selected="selected">'+resp.name+'</option>').selectbox("attach");
						}
						//currenthash='';
						//var longhash = location.hash.substring(1).split("?");
						//var moon = (longhash[1])?longhash[1].split('&'):'';
						//var lh = moon ? '?'+moon[0] : '';
						
						var goback = returnmoon || 'dashboard'
						console.log('return moon',goback);
						snowupdatemoon({moon:goback})	
						if(($('.dogeboard-left .content').html()==='' || $('.dogeboard-left .content').css('visibility')==='hidden'))location.href='#'+resp.wally.key+'?moon='+goback;						
						
					}).delay(4000).fadeOut();
				}
				else
				{
					snowmessage('error','Error adding wallet!',5000);
					
				}
			});	
		}
		else {
			snowmessage('error','Name, host, coin type and username/password or pin/api required!',5000);
		}
		
	});
	/* remove wallet modal*/
	$(document).on('click','.removewallet',function(){
		var wid;
		wid=$(this).attr('data-wid');
		var name=$(this).parent().prev().prev().prev().prev().text();
		snowcreatemodal('<h2 style="margin-top:-15px" class="text-warning"> <strong>'+name+'</strong></h2> <p>Are you sure you want to delete this wallet?</p><p>You can not undo this action!</p>' ,'Delete Wallet ','<button data-wid="'+wid+'" type="submit" id="removewalletsubmit" class="btn  btn-danger" rel="removewalletsubmit">Yes, delete wallet '+name+' now</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>');
		
	});
	/* remove wallet*/
	$(document).on('click','#removewalletsubmit',function(e){
			var wid=$(this).attr('data-wid');
			if(!wid) {
				snowmessage('error','Can not delete the unknown; shibe.','3000');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/remove-wallet",
					data: {'action':'remove',wally:wid}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.error)snowmessage('error',resp.error.path,3000);
					if(resp.msg)snowmessage('message',resp.msg,3000);
					if(resp.succeed)snowmessage('success',resp.succeed,3000);
					snowhome();
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	/*opens wallet add div*/
	$(document).on('click','.nav-item-add',function(){
		var spantext=$(this).find('span').text();
		$('#addwallet input').val('');
		$('#aw-port').val('22555');
		$('.addwalletbutton').text('Add Wallet');
		
		$('#addwalletwrap').slideDown(function(){
			
		});
		
		
		$('.adderror').hide().html('');
	});
	$('.closeaddwallet').on('click',function(){
		$('#addwalletwrap').slideUp();
	});
	
	
	/* Wallet */
	
	
	/* unlock request modal */
	$(document).on('click','.snowunlockwalletclick',function(){
		snowcreatemodal('#confirmpassphrase','Unlock '+currentwally.name.toUpperCase(),'<button type="submit" id="confirmunlock" class="btn btn-warning" rel="modal">Unlock Wallet</button> &nbsp;<button style="float:right;" type="button" class="btn  btn-default  pull-right" data-dismiss="modal">Cancel</button>',function(){});	
	});
	$(document).on('click','#confirmunlock',function(){
		$('#unlockwalletform').submit();
	});
	/* unlock request from send*/
	$(document).on('submit','#unlockwalletform',function(e){
			e.preventDefault();
			$("#confirm-modal #unlockphrase").parent().removeClass('has-error');
			$('#confirm-modal .modal-body .adderror').hide().html();
			var passphrase=$('#confirm-modal #unlockphrase').val(),
				timeout=parseInt($('#confirm-modal #unlocktime').val());
			if(passphrase==='') {
				$("#confirm-modal #unlockphrase").parent().addClass('has-error');
				$('#confirm-modal .modal-body .adderror').fadeIn().html('Please enter a pass phrase.');
			}
			else {
				var nowtime=new Date().getTime();
				$.ajax({
					url: "/api/snowcoins/local/gated",
					data: { checkauth:nowtime,wallet: currentwally.key,command:'unlock',passphrase:passphrase,timeout:timeout}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						var modal=$('#confirm-modal #confirmunlock').attr('rel');
						console.log('modal',modal);
						if(modal==='modal') {
								$('#confirm-modal').modal('hide');
								snowmessage('success',''+ currentwally.name+' unlocked for '+timeout+' seconds. ',4000);
						}
						else {
							$('#confirm-modal .modal-body').html(snowvars.html);
							$('#confirm-modal .modal-footer').html(snowvars.buttons);
						}
						var tt=(new Date().getTime());
						//console.log(tt,timeout,Math.floor(tt+timeout));
						changelock(Math.floor(tt+timeout*1000));
					}
					else
					{
						$('#confirm-modal .modal-body .adderror').fadeIn().html('Please try again.<br>'+resp.error);
						$("#confirm-modal #unlockphrase").parent().addClass('has-error');
						console.log(resp);
					}
				});	
			}
		
	});
	
	
	/* change wallet passphrase request modal */
	$(document).on('click','.snowchangewalletpassclick',function(){
		snowcreatemodal('#changepassphrase','Change passphrase for '+currentwally.name.toUpperCase(),'<button type="submit" id="confirmchangepassphrase" class="btn btn-warning" rel="modal">Change Passphrase</button> &nbsp;<button style="float:right;" type="button" class="btn  btn-default  pull-right" data-dismiss="modal">Cancel</button>',function(){});	
	});
	$(document).on('click','#confirmchangepassphrase',function(){
		$('#changewalletpassform').submit();
	});
	/* change wallet passphrase */
	$(document).on('submit','#changewalletpassform',function(e){
			e.preventDefault();
			console.log('change pass');
			$("#changewalletpassform").removeClass('has-error');
			$('#changewalletpassform .adderror').hide().html();
			var currentphrase=$('#changewalletpassform #currentphrase').val(),
				newphrase=$('#changewalletpassform #changephrase').val(),
				confirmphrase=$('#changewalletpassform #confirmphrase').val();
			if(currentphrase==='') {
				$("#changewalletpassform #currentphrase").parent().addClass('has-error');
				$('#changewalletpassform   .adderror').fadeIn().html('Please enter a pass phrase.');
			} else if(newphrase==='' || confirmphrase==='' || (newphrase !== confirmphrase)) {
				$("#changewalletpassform #changephrase").parent().addClass('has-error');
				$('#changewalletpassform  .adderror').fadeIn().html('Passphrase must match.');
			} 
			else {
				var nowtime=new Date().getTime();
				$.ajax({
					url: "/api/snowcoins/local/gated",
					data: { checkauth:nowtime,wallet: currentwally.key,command:'changepassphrase',oldpassphrase:currentphrase,newpassphrase:newphrase,confirm:confirmphrase}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						snowmessage('success',''+ currentwally.name+' passphrase changed. ',4000);
						$('#confirm-modal').modal('hide');
					}
					else
					{
						$('#changewalletpassform .adderror').fadeIn().html(resp.error);
						$("#changewalletpassform #currentphrase").parent().addClass('has-error');
						console.log(resp);
					}
				});	
			}
		
	});
	
	
	
	
	/*backup wallet modal*/
	$(document).on('click','.backupwalletbutton',function(){
		var date=new Date();
		var m = (date.getMonth()< 10) ? '0'+(date.getMonth()+1):(date.getMonth()+1),d =(date.getDate()< 10) ? '0'+date.getDate():date.getDate(),y = date.getFullYear(),min = (date.getMinutes()< 10) ? '0'+date.getMinutes():date.getMinutes(),s = (date.getSeconds()< 10) ? '0'+date.getSeconds():date.getSeconds(),h = (date.getHours()< 10) ? '0'+date.getHours():date.getHours();
		var fname=y+''+m+''+d+''+h+''+min+''+s+'.'+currentwally.key+'.dat.bak';
		var home = fname;
		snowcreatemodal('#snowbackupwallet','Backup '+currentwally.name.toUpperCase(),'<button type="button" id="backupwalletsubmit" class="btn btn-warning" rel="backupwalletsubmit">Backup</button> &nbsp;<button type="button" class="btn btn-default   pull-right" data-dismiss="modal">Cancel</button>',function() {
			$('#confirm-modal #backupwalletpath').text(home);
			$('#confirm-modal #snowbackuplocation').attr('placeholder','/remote/path/'+home);
		});
	});
	/* backup wallet send*/
	$(document).on('click','#backupwalletsubmit',function(e){
			$("#confirm-modal #snowbackuplocation").parent().removeClass('has-error');
			$('#confirm-modal .modal-body .adderror').hide().html();
			var backupto=$('#confirm-modal #snowbackuplocation').val();
			if(backupto==='') {
				$("#confirm-modal #snowbackuplocation").parent().addClass('has-error');
				$('#confirm-modal .modal-body .adderror').fadeIn().html('Please enter a file path.');
			}
			else {
				var nowtime=new Date().getTime();
				$.ajax({
					url: "/api/snowcoins/local/gated",
					data: { checkauth:nowtime,wallet: currentwally.key,command:'backup',filepath:backupto}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						var html='<p>Your wallet was backed up successfully to:<br />'+backupto+' <br /></p><p><button type="button" class="btn  btn-default" data-dismiss="modal">Close</button></p>';
						$('#confirm-modal .modal-body').html(html);
						$('#confirm-modal .modal-footer').html('');						
					}
					else
					{
						$('#confirm-modal .modal-body .adderror').fadeIn().html('Please try again.<br>'+resp.error);
						$("#confirm-modal #snowbackuplocation").parent().addClass('has-error');
						console.log(resp);
					}
				});	
			}
		
	});
	/* encrypt wallet */
	$(document).on('click','#confirmencrypt',function(e){
			$("#encryptwalletform ").children().removeClass('has-error');
			$('#encryptwalletform .adderror').hide().html();
			var p1=$('#encryptwalletform #epassword').val();
			var p2=$('#encryptwalletform #econfirm').val();
			if(p1==='' || p1!=p2) {
				$("#encryptwalletform").find('.input-group').addClass('has-error');
				$('#encryptwalletform  .adderror').fadeIn().html('Your phrases need to match and contain a value.');
			}
			else {
				$('.dogeboard-left .loading').show();
				$('.snow-dashboard #encryptwallet').hide();
				var nowtime=new Date().getTime();
				$.ajax({
					url: "/api/snowcoins/local/gated",
					data: { checkauth:nowtime,wallet:currentwally.key,command:'encrypt',p1:p2,p2:p2}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					if(resp.success === true)
					{
						
						$('#encryptwallet').html(resp.msg).show();
						changelock(0);	
						snowmessage('success','Wallet encrypted',5000);
						$('.dogeboard-left .loading').hide();					
					}
					else
					{
						$('.snow-dashboard #encryptwallet').show();
						$('.dogeboard-left .loading').hide();
						$('#encryptwalletform .adderror').fadeIn().html(''+resp.error);
						$("#encryptwalletform").find('.input-group').addClass('has-error');
						console.log(resp);
						snowmessage('error',resp.error,5000);
						
					}
				});	
			}
		
	});	
	/* send request */
	$(document).on('click','#confirmsendcoinsubmit',function(){
			var btn = $('#confirm-modal #confirmsendcoinsubmit');
			btn.button('loading');
			var amount=$('.snow-send #sendcointrueamount').val();
			var to=$('.snow-send #sendcointoaddress').val();
			var from=$('.snow-send #sendcoinfromaccount').val();
			var memo=$('.snow-send #sendcoinmemo').val();
			var tomsg=$('.snow-send #sendcointomessage').val();
			var saveme=$('.snow-send #sendcoinsaveaddr').val();
			var savename=$('.snow-send #sendcoinaddressname').val();
			var command=(from==='default')?'send':'sendfromaccount';
			var nowtime=new Date().getTime();
			if(saveme==='save' && savename!='') {
				$.ajax({
					async:false,
					url: "/api/snowcoins/local/contacts",
					data: { stop:1,wallet:currentwally._id,action:'add',name:savename,address:to}
				}).done(function( resp,status,xhr ) {_csrf = xhr.getResponseHeader("x-snow-token")});
			}
			$.ajax({
			  url: "/api/snowcoins/local/gated",
			  data: { checkauth:nowtime,account:from,comment:memo,commentto:tomsg,wallet: currentwally.key,command:command,amount:amount,toaddress:to}
			})
			.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
				if(resp.success === true)
				{
					console.log(resp);
					$('#snowsendcoin')[0].reset();
					$('#snowsendcoin :input')
					 .not(':button, :submit, :reset')
					 .val('')
					 .removeAttr('checked')
					 .removeAttr('selected');
					$('#sendcoinshowname').slideUp();
					$('#confirm-modal .modal-body').html('Success Receipt.<br /> '+resp.tx);
					$('#confirm-modal .modal-footer').html('');
					snowhashpage();
				}
				else
				{
					btn.button('reset');
					if(resp.code==='-13')
					{
						$('#confirm-modal .modal-body').html(snowvars.unlockme);
						$('#confirm-modal .modal-footer').html(snowvars.unlockbuttons);
						$('#confirm-modal .modal-body .adderror').show().html(''+resp.error);
					}
					else
					{
						$('#confirm-modal .modal-body .adderror').show().html(''+resp.error);
					}
					console.log(resp);
				}
			});	
		
	});
	
	/*send coin modal*/
	var snowvars={};
	$(document).on('submit','#snowsendcoin',function(e){
		e.preventDefault();
		var next=true;
		var ticker=$('.snow-send .change-coin-stamp').attr('data-snowticker');
		var amount=parseFloat($('.snow-send #sendcointrueamount').val());
		var to=$('.snow-send #sendcointoaddress').val();
		var bal=parseFloat($('.snow-send-body .snow-balance-body').text().replace(/,/g,''));
		var from=$('.snow-send #sendcoinfromaccount').val();
		//console.log('send',parseInt(amount));
		if(amount<=0 || isNaN(amount) || amount===Infinity)
		{
			$("#snow-send #sendcoinamount").parent().addClass('has-error');
			next=false;
		}
		if(to==='') 
		{
			$("#snow-send #sendcointoaddress").parent().addClass('has-error');
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
			$('#confirm-modal .modal-header h4').html('Confirm Send Coin');
			$('#confirm-modal .modal-body').html(body);
			$('#confirm-modal .modal-footer').html(footer);
			$('#confirm-modal').modal('toggle');
		}
		
	});
	
	/*address book contacts save watcher */
	$(document).on('change','#sendcoinsaveaddr',function() {
		$('#sendcoinshowname').slideToggle();
	});
	/*address book delete address */
	$(document).on('click','.delcontact',function() {
		var address = $(this).attr('data-address');
		$.ajax({
			  url: "/api/snowcoins/local/contacts",
			  data: { wallet:currentwally._id,action:'delete',address:address}
			}).done(function(resp,status,xhr){
				_csrf = xhr.getResponseHeader("x-snow-token");
				$('#'+address).fadeOut();
				snowmessage('success','Address Deleted',3000);
				
			})
	});
	/*address book modal*/
	$(document).on('click','#snowsendaddressbook',function(){
		var html='address book';
		$.ajax({
			  url: "/api/snowcoins/local/contacts",
			  data: { wallet:currentwally._id}
			})
			.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
				if(resp.success === true)
				{
					console.log(resp);
					$('#confirm-modal .modal-body').html(resp.html);
				}
				else
				{
					$('#confirm-modal .modal-body').html(resp.error);
					//console.log(resp);
				}
				$('#confirm-modal .modal-header h4').html('Saved Addresses');
				$('#confirm-modal .modal-footer').html('<button type="button" class="btn btn-default  pull-right" data-dismiss="modal" >Cancel</button>');
				$('#confirm-modal').modal('toggle');
			});
		
	});
	
	
	/*add address modal */
	$(document).on('click','.snowaddaccount',function(){
		var html=$('#snowaddaddress').html(),
			time = new Date().getTime();
		$('#confirm-modal .modal-dialog').attr('snow-data-time',time);
		pressenter('[snow-data-time="'+time+'"]','#addaddresssubmit');
		$('#confirm-modal .modal-header h4').html('Add new address');
		$('#confirm-modal .modal-body').html( '<div >'+html+'</div>');
		$('#confirm-modal .modal-footer').html('<button type="button" id="addaddresssubmit" class="btn btn-primary" rel="addaddresssubmit">Save changes</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button> ');
		var name=$(this).attr('data-snowacc');
		if(name==='(unassigned)')name='';
		$("#confirm-modal .modal-body #addaddressname").val(name);
		$('#confirm-modal').modal('toggle');
			
	});
	
	/*add address submit*/
	$(document).on('click','[rel="addaddresssubmit"]',function(){
		var name=$("#confirm-modal .modal-body #addaddressname").val();
		//if(name.length===0 || name.length>100)
		if(!currenthash) {
			$("#confirm-modal .modal-body #addaddressname").parent().parent().addClass('has-error').addClass('has-feedback');			
		} else {
			$('#confirm-modal').modal('hide');
			var time=new Date()-2;
			location.href='#'+currenthash+'?moon=accounts&account='+name+'&createaddress=now&checkauth='+time;	
		}
		
	});	

	/*submit move address to new account*/
	$(document).on('click','[rel="moveaddresssubmit"]',function(){
		var name=$("#confirm-modal .modal-body #moveaddressname").val();
		var addr=$("#confirm-modal .modal-body #moveaddressaddress").val();
		$('#confirm-modal').modal('hide');	
		var time=new Date()-2;
		location.href='#'+currenthash+'?moon=accounts&account='+name+'&address='+addr+'&moveaddress=now&checkauth='+time;
	});
	
	/*move address to another account modal*/
	$(document).on('click','.snowmoveaddresslink',function(){
		var name=$(this).attr('data-snowacc');
		var addr=$(this).attr('data-address');
		var html=$('#snowmoveaddress').html(),
			time = new Date().getTime();
		$('#confirm-modal .modal-dialog').attr('snow-data-time',time);
		pressenter('[snow-data-time="'+time+'"]','#moveaddresssubmit');
		
			$('#confirm-modal .modal-header h4').html('Confirm move address');
			$('#confirm-modal .modal-body').html( '<div >'+html+'</div>');
			$('#confirm-modal .modal-footer').html('<button type="button" id="moveaddresssubmit" class="btn btn-primary" rel="moveaddresssubmit">Save changes</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>');
			$(' #confirm-modal .modal-body #moveaddressaddress').val(addr);
		if(name!='new')
		{
			$(' #confirm-modal .modal-body #moveaddressname').val(name).prop('readonly',true);
			//$("#confirm-modal .modal-body #moveaddressname").parent().parent().addClass('has-success');
		}
		//$("#confirm-modal .modal-body #moveaddressaddress").parent().parent().addClass('has-success');
		$('#confirm-modal').modal('toggle');
	});
	
	
	/*move coin between accounts modal*/
	$(document).on('click','.snowmovecoinlink',function(){
		var to=$(this).attr('data-snowtoacc');
		var from=$(this).attr('data-snowfromacc');
		var amt=$(this).attr('data-snowamount');
		var toamt=$(this).attr('data-snowtoamount');
		if(toamt===undefined)toamt=0;
		var html=$('#snowmovecoin').html(),
			time = new Date().getTime();
		$('#confirm-modal .modal-dialog').attr('snow-data-time',time);
		pressenter('[snow-data-time="'+time+'"]','#movecoinsubmit');
		$('#confirm-modal .modal-header h4').html('Move coin between accounts');
		$('#confirm-modal .modal-body').html( '<div >'+html+'</div>');
		$('#confirm-modal .modal-footer').html('<button type="button" id="movecoinsubmit" class="btn btn-primary" rel="movecoinsubmit">Save changes</button> &nbsp;<button type="button" class="btn btn-default  pull-right" data-dismiss="modal">Cancel</button>');	
		//$(' #confirm-modal .modal-body #moveaddressaddress').val(addr);
		if(to==='new')
			$('#confirm-modal .modal-body #movecointoaccount').prop("readonly",false);
		else
		{
			$('#confirm-modal .modal-body #movecointoaccount').val(to);
		}
		$('#confirm-modal .modal-body #movecoinfromaccount').val(from);
		$('#confirm-modal .modal-body #smcamt').text(amt+' '+currentwally.coinstamp);
		$('#confirm-modal .modal-body #smctoamt').text(toamt+' '+currentwally.coinstamp);
		$('#confirm-modal').modal('toggle');	
	});
	/*submit move coin to account*/
	$(document).on('click','[rel="movecoinsubmit"]',function(){
		var to=$("#confirm-modal .modal-body #movecointoaccount").val();
		var from=$("#confirm-modal .modal-body #movecoinfromaccount").val();
		var amt=$("#confirm-modal .modal-body #movecoinamount").val();
		if((to.length<100) && (amt.length>0))
		{
			$('#confirm-modal').modal('hide');	
			var time=new Date()-2;
			location.href='#'+currenthash+'?moon=accounts&toaccount='+to+'&fromaccount='+from+'&amount='+amt+'&movecoin=now&checkauth='+time;
		}
		else
		{
			if(to.length>100)$("#confirm-modal .modal-body #movecointoaccount").parent().parent().addClass('has-error').removeClass('has-success');
			else $("#confirm-modal .modal-body #movecointoaccount").parent().parent().removeClass('has-error').addClass('has-success');
			if(amt.length===0)$("#confirm-modal .modal-body #movecoinamount").parent().parent().addClass('has-error').removeClass('has-success');
			else $("#confirm-modal .modal-body #movecoinamount").parent().parent().removeClass('has-error').addClass('has-success');
		}
	}); 
	
	/* transaction option form */
	$(document).on('submit','#txoptionsform',function(e) {
		e.preventDefault();
		console.log('sugmit tx');
		var acc = $('#txaccounts').val();
		var num = $('#txrows').val();
		var start = $('#txstart').val();
		location.href='#'+currentwally.key+'?moon=transactions&start='+start+'&num='+num+'&account='+acc;
	});
	/* transaction view more row*/
	$(document).on('click','.txclickrow',function(e){
		var me = $(this);
		var val=JSON.parse(me.attr('data-open'));
		var showdiv = $('#'+val.time+'-div');
		me.parent().find('tr').removeClass('stayhover');
		var aa = showdiv.css('display');
		$('.removemetxrow').remove();
		if(aa!='block') {
			me.addClass('stayhover');
			var html = createTxHtml(val);
			$(this).after('<tr id="'+val.time+'" class="skipme removemetxrow"><td colspan="5" class="txrowsmore skipme">'+html+'</td></tr>');
			$('#'+val.time+'-div').find('td').html(function(i, v) {
			  return v.replace(/undefined/g, '');    
			});
			showdiv.slideDown("slow");
			
		}			
	});
	function createTxHtml(val) {
		var html ="<div id='"+val.time+"-div'><table class=''><tbody><tr class='skipme'><td> account</td><td>"+val.account+"<tr class='skipme'><td> address<td>"+val.address+"<tr class='skipme'><td> category<td>"+val.category+"<tr class='skipme'><td> amount<td>"+val.amount+"<tr class='skipme'><td> fee<td>"+val.fee+"<tr class='skipme'><td> confirmations<td>"+val.confirmations+"<tr class='skipme'><td> blockhash</td><td> <a  href='http://dogechain.info/block/"+val.blockhash+"' target='_blank' class='text-muted'>"+val.blockhash+"</a></td></tr><tr class='skipme'><td> blockindex<td>"+val.blockindex+"</td></tr>";
		var date = new Date(val.blocktime*1000);
		var formattedTime = date.toLocaleString();
		html+="<tr class='skipme'><td> block time<td>"+formattedTime+"<tr class='skipme'><td> transaction id<td><a  href='http://dogechain.info/tx/"+val.txid+"' target='_blank' class='text-muted'>"+val.txid+"</a></td></tr>";
		var date = new Date(val.time*1000);
		var Time = date.toLocaleString();
		html+="<tr class='skipme'><td> time<td>"+Time+"</td></tr>";
		var date = new Date(val.timereceived*1000);
		var tt = date.toLocaleString();
		html+="<tr class='skipme'><td> time received<td>"+tt+"<tr class='skipme'><td> comment<td>"+val.comment+"<tr class='skipme'><td> to<td>"+val.to+"</td></tr></tbody></table> ";
		return html;
	}
	/* RECEIVE */
	/*dcc attended receiver add modal*/
	$(document).on('click','.adddccwalletbutton',function(){
		snowcreatemodal('#dccaddwalletdiv','Add  a new Coin Attendant','<button type="submit" data-loading-text="Adding New Attended Receiver..." id="dccaddsubmit" class="btn  btn-primary" rel="dccaddsubmit">Add Receiver</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>',
			function(){
				$("#confirm-modal #receivertype").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
				$("#confirm-modal #account").autocomplete({ 
					source: function(req, response) { 
							   $.ajax({
								url: '/api/snowcoins/simple/get-accounts/?wally='+$("#confirm-modal #dccaddwallet").val(),
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
			}
	);
	});
	/* dcc add attended receiver*/
	$(document).on('click','#dccaddsubmit',function(e){
			//$('#dccaddwalletform').preventDefault();
			var btn = $('#confirm-modal #dccaddsubmit');
			btn.button('loading');
			var addw=$('#confirm-modal #dccaddwallet').val(),
				useme=$('#confirm-modal #fw-useme').val(),
				address=$('#confirm-modal #address').val();
			if(addw==='Select A Wallet' && useme==='TABwallet') {
				snowmessage('error','Please select a wallet.','3000');
				btn.button('reset');
				$("#confirm-modal #dccaddwallet").parent().addClass('has-error');
			} else if (useme==='TABaddress' && address==='') {
				snowmessage('error','Please add an address.','3000');
				btn.button('reset');
				$("#confirm-modal #address").parent().addClass('has-error');
			} else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: $( "#confirm-modal #dccaddwalletform" ).serialize()
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccresponse(resp,function(){$('#liattended').find('a').trigger('click')});
					btn.button('reset');
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	/*dcc attended receiver remove modal*/
	$(document).on('click','.removedccwallet',function(){
		var wid;
		wid=$(this).attr('data-dccwid');
		var name=$(this).parent().next().next().text();
		snowcreatemodal('Are you sure you want to stop accepting coins to '+name+'?' ,'Stop accepting coins to wallet','<button data-dccwid="'+wid+'" data-loading-text="Removing receiver..." type="submit" id="dccremovesubmit" class="btn  btn-warning" rel="dccaddsubmit">Yes, stop accepting coins to '+name+'</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>');
	});
	/* dcc remove attended receiver*/
	$(document).on('click','#dccremovesubmit',function(e){
			var btn = $('#confirm-modal #dccremovesubmit');
			btn.button('loading');
			var wid=$(this).attr('data-dccwid');
			if(!wid) {
				snowmessage('error','Can not delete the unknown; shibe.','3000');
				btn.button('reset');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: {'action':'delete',wally:wid}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccremoveresponse(resp,function(){$('#liattended').find('a').trigger('click')});
					btn.button('reset');
				});
			}
		
	});
	
	/*dcc tracker add modal*/
	$(document).on('click','.addtrackerbutton',function(){
		snowcreatemodal('#dccaddtrackerdiv','Add  a new Address Tracker','<button type="submit" data-loading-text="Adding New Tracker..." id="dcctrackersubmit" class="btn  btn-primary" rel="dcctrackersubmit">Add Tracker</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>',
			function(){
				$("#confirm-modal #receivertype").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
				$("#confirm-modal #account").autocomplete({ 
					source: function(req, response) { 
							  $.ajax({
								url: '/api/snowcoins/simple/get-accounts/?wally='+$("#confirm-modal #trackerwallet").val(),
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
				//addresses for selected account
				$("#confirm-modal #account,#confirm-modal #trackerwallet").blur(function(){
					$("#confirm-modal #dccpickaddress").find('option').remove().append('<option id="loading">loading... mobile users reselect</option>');
									$.ajax({
										url: '/api/snowcoins/simple/get-addresses/?wally='+$("#confirm-modal #trackerwallet").val()+'&account='+$("#confirm-modal #account").val(),
										dataType: "json",
										success: function( data,status,xhr ) {
											//_csrf = xhr.getResponseHeader("x-snow-token");
											data.forEach(function(val) {
												//console.log(val);
												$("#confirm-modal #dccpickaddress").find('#loading').remove().end().append('<option value="'+val+'">'+val+'</option>');
											});
											$("#confirm-modal #dccpickaddress").append('<option value="new">Create New Address</option>');
											$("#confirm-modal #dccpickaddress").selectbox('detach').selectbox('attach')
										}	
									});
				});
			}
		);
	});
	/* dcc add tracker*/
	$(document).on('click','#dcctrackersubmit',function(e){
			//$('#dccaddwalletform').preventDefault();
			var btn = $('#confirm-modal #dcctrackersubmit');
			btn.button('loading');
			var addw=$('#confirm-modal #trackerwallet').val(),
				useme=$('#confirm-modal #fw-useme').val(),
				address=$('#confirm-modal #address').val();
			if(addw==='Select A Wallet' && useme==='TABwallet') {
				snowmessage('error','Please select a wallet.','3000');
				btn.button('reset');
				$("#confirm-modal #trackerwallet").parent().addClass('has-error');
			} else if (useme==='TABaddress' && address==='') {
				snowmessage('error','Please add an address.','3000');
				btn.button('reset');
				$("#confirm-modal #address").parent().addClass('has-error');
			} else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: $( "#confirm-modal #dccaddtrackerform" ).serialize()
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccresponse(resp,function(){$('#litrackers').find('a').trigger('click')});
					btn.button('reset');
				});
			}
		
	});
	
	/*dcc tracker remove modal*/
	$(document).on('click','.removetracker',function(){
		var wid;
		wid=$(this).attr('data-dcctid');
		var address=$(this).parent().next().next().next().next().next().text(),
			name=$(this).parent().next().text();
		snowcreatemodal('Are you sure you want to stop tracking address: <br /><p><strong>'+address+'</strong></p>' ,'Stop tracking address','<button data-dcctid="'+wid+'" data-loading-text="Removing tracker..." type="submit" id="trackerremovesubmit" class="btn  btn-warning" rel="trackerremovesubmit">Yes, remove tracker '+name+'</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>');
	});
	/* dcc remove tracker*/
	$(document).on('click','#trackerremovesubmit',function(e){
			var btn = $('#confirm-modal #trackerremovesubmit');
			btn.button('loading');
			var wid=$(this).attr('data-dcctid');
			if(!wid) {
				snowmessage('error','Can not delete the unknown; shibe.','3000');
				btn.button('reset');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: {'action':'delete-tracker',tracker:wid}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccremoveresponse(resp,function(){$('#litrackers').find('a').trigger('click')});
					btn.button('reset');
				});
			}
		
	});
	
	/*dcc  add client modal*/
	$(document).on('click','.adddccclientbutton',function(){
		snowcreatemodal('#dccaddclientdiv','Create D3C key for Client','<button type="submit" data-loading-text="Adding Client..." id="dccaddclientsubmit" class="btn  btn-primary" rel="dccaddclientsubmit">Add Client D3C Key</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>',function(){
			
			$(document).on('change','#confirm-modal #pickip',function(){
				var val=$(this).val();
				if(val===2)$('#confirm-modal #ip').val(myip+'/32')
				else if(val===1)$('#confirm-modal #ip').val('0.0.0.0/0')
				else if(val===4)$('#confirm-modal #ip').val(myip+'/24')
				else $('#confirm-modal #ip').val('')
			});
		});
	});
	/*dcc  add master modal*/
	$(document).on('click','.adddccmasterbutton',function(){
		snowcreatemodal('#dccaddmasterdiv','Create D3C key for Master','<button type="submit" data-loading-text="Adding Master..." id="dccaddclientsubmit" class="btn  btn-primary" rel="dccaddmastersubmit">Add Master D3C Key</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>',function(){
			$('.bstooltip').tooltip({container: '#confirm-modal',html:true});
			$(document).on('change','#confirm-modal #pickip',function(){
				var val=$(this).val();
				if(val===2)$('#confirm-modal #ip').val(myip+'/32')
				else if(val===1)$('#confirm-modal #ip').val('0.0.0.0/0')
				else if(val===4)$('#confirm-modal #ip').val(myip+'/24')
				else $('#confirm-modal #ip').val('')
			});
		});
	});
	/* dcc add client/master*/
	$(document).on('click','#dccaddclientsubmit',function(e){
			//$('#dccaddwalletform').preventDefault();
			var btn = $('#confirm-modal #dccaddclientsubmit');
			btn.button('loading');
			var name=$('#confirm-modal #name').val();
			if(name==='') {
				snowmessage('error','Please enter a name.','3000');
				btn.button('reset');
				$("#confirm-modal #name").parent().addClass('has-error');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: $( "#confirm-modal #dccaddclientform" ).serialize()
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccresponse(resp,function(){$('#liapi').find('a').trigger('click')});
					btn.button('reset');
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	/*dcc api remove modal*/
	$(document).on('click','.removedcccc',function(){
		var wid;
		wid=$(this).attr('data-dcccid');
		var name=$(this).parent().next().next().text();
		snowcreatemodal('Are you sure you want to revoke the D3C key for '+name+'?','Revoke D3C key','<button data-loading-text="Revoking Access..." data-dcccid="'+wid+'" type="submit" id="dccremoveclientsubmit" class="btn btn-warning " rel="dccaddsubmit">Yes, revoke D3C key for '+name+'</button> &nbsp;<button type="button" class="btn btn-default  pull-right" data-dismiss="modal">Cancel</button>');
	});
	/* dcc remove client/master api*/
	$(document).on('click','#dccremoveclientsubmit',function(e){
			var btn = $('#confirm-modal #dccremoveclientsubmit');
			btn.button('loading');
			var wid=$(this).attr('data-dcccid');
			if(!wid) {
				snowmessage('error','Can not delete the unknown; shibe.','3000');
				btn.button('reset');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: {'action':'delete-client',ccid:wid}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccremoveresponse(resp,function(){$('#liapi').find('a').trigger('click')});
					btn.button('reset');
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	
	/*dcc add unattended modal*/
	$(document).on('click','.addofflinebutton',function(){
		snowcreatemodal('#dccaddofflinediv','Add unattended receiver','<button type="submit" id="dccaddofflinesubmit" class="btn btn-primary  " rel="dccaddofflinesubmit" data-loading-text="Adding Receiver...">Add Unattended Receiver</button> &nbsp;<button type="button" class="btn btn-default  pull-right" data-dismiss="modal">Cancel</button>',
			function(){
				$("#confirm-modal #type").autocomplete({ source: defaultcoins,minLength:0}).focus(function(){$(this).autocomplete('search', $(this).val())});
				$("#confirm-modal #account").autocomplete({ 
					source: function(req, response) { 
							   $.ajax({
								url: '/api/snowcoins/simple/get-accounts/?wally='+$("#confirm-modal #fw-pickwallet").val(),
								dataType: "json",
								success: function( data,status,xhr ) {
									//console.log(data);
									//_csrf = xhr.getResponseHeader("x-snow-token");
									var re = $.ui.autocomplete.escapeRegex(req.term);
									//console.log(re);
									var matcher = new RegExp( re, "i" );
									response($.grep(data, function(item){return matcher.test(item);}) );
									}
								});
							 },
					 minLength: 0
				}).focus(function() {
					$(this).autocomplete('search', $(this).val())
				});
				$('#offlineformat').change(function() {
					var val = $(this).val();
					if(val>1)$('#offlineaccount').fadeIn("slow");
					else $('#offlineaccount').fadeOut("slow");
				});
			}
		);
	});
	/* dcc add unattended receiver*/
	$(document).on('click','#dccaddofflinesubmit',function(e){
			//$('#dccaddwalletform').preventDefault();
			var btn = $('#confirm-modal #dccaddofflinesubmit');
			btn.button('loading');
			var next = true,
				name=$('#confirm-modal #name').val(),
				address=$('#confirm-modal #address').val(),
				wallet=$('#confirm-modal #fw-pickwallet').val(),
				useme=$('#confirm-modal #fw-useme').val()==='TABmanual'?2:1,
				type=$('#confirm-modal #type').val();
			//check req
			if(name==='') {
			$("#confirm-modal #name").parent().addClass('has-error');
			next=false;
			} else $("#confirm-modal #name").parent().removeClass('has-error');
			if(useme===2) {
				if(address==='') {
					$("#confirm-modal #address").parent().addClass('has-error');
					next=false;
				} else $("#confirm-modal #address").parent().removeClass('has-error');
				if(type==='') {
					$("#confirm-modal #type").parent().addClass('has-error');
					next=false;
				} else $("#confirm-modal #type").parent().removeClass('has-error');
			} else {
				if(wallet==='Select A Wallet') {
					$("#confirm-modal #fw-pickwallet").parent().addClass('has-error');
					next=false;
				} else $("#confirm-modal #fw-pickwallet").parent().removeClass('has-error');
			}
			if(next===false) {
				snowmessage('error','Please fill in required fields.','3000');
				btn.button('reset');	
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: $( "#confirm-modal #dccaddofflineform" ).serialize()
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccresponse(resp,function(){$('#liunattended').find('a').trigger('click')});
					btn.button('reset');
					
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	/*dcc remove unattended modal*/
	$(document).on('click','.removeoffline',function(){
		var wid;
		wid=$(this).attr('data-offlineid');
		var name=$(this).parent().next().text();
		snowcreatemodal('Are you sure you want to stop accepting unattended coins to '+name+'?' ,'Stop accepting unattended coins to address','<button data-dccwid="'+wid+'" data-loading-text="Deleting Un-Attended Receiver..." type="submit" id="dccoffremovesubmit" class="btn  btn-warning" rel="dccoffremovesubmit" >Yes, stop accepting unattended coins to '+name+'</button> &nbsp;<button type="button" class="btn  btn-default pull-right" data-dismiss="modal">Cancel</button>');
		
	});
	/* dcc remove unattended reciever*/
	$(document).on('click','#dccoffremovesubmit',function(e){
			var btn = $('#confirm-modal #dccoffremovesubmit');
			btn.button('loading');
			var wid=$(this).attr('data-dccwid');
			if(!wid) {
				snowmessage('error','Can not delete the unknown; shibe.','3000');
				btn.button('reset');
			}
			else {
				$.ajax({
					type:'post',
					url: "/api/snowcoins/local/receive/setup",
					data: {'action':'delete-unattended',wid:wid}
				})
				.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
					snowdccremoveresponse(resp,function(){$('#liunattended').find('a').trigger('click')});
					btn.button('reset')
				});
				//$('#dccaddwalletdiv').attr('method','post').submit();
			}
		
	});
	
	
	/*dcc auto withdrawal add modal*/
	$(document).on('click','#awaddbymodal',function(){
		snowcreatemodal('#dccawdiv','Auto Withdrawal','<button type="submit" id="dccawsubmit" class="btn btn-primary" rel="dccawsubmit">Add Auto Withdrawal</button> &nbsp;<button type="button" class="btn btn-default   pull-right" data-dismiss="modal">Cancel</button>');
	});
	/*dcc conversion rates update modal*/
	$(document).on('click','#craddbymodal',function(){
		snowcreatemodal('#dcccrdiv','Currency Conversion Rates','<button type="button" id="dccsrsubmitupdate" class="btn btn-primary" rel="dccsrsubmitupdate" data-loading-text="Fetching..." data-toggle="button">Save and Update Now</button> &nbsp; <button type="button" class="btn   btn-default pull-right" data-dismiss="modal">Cancel</button>');
	});
	/* dcc save rates and update*/
	$(document).on('click','#dccsrsubmitupdate,#dcccrsubmit',function(e){	
		if($(this).attr('id')==='dccsrsubmitupdate')
			var btn = $('#confirm-modal #dccsrsubmitupdate'),sbtn = $('#confirm-modal #dcccrsubmit');
		else
			var sbtn = $('#confirm-modal #dccsrsubmitupdate'),btn = $('#confirm-modal #dcccrsubmit');
		btn.button('loading'),sbtn.hide();
		var action = (btn.attr('id')==='dcccrsubmit') ? 'setcurrencyrates':'setcurrencyratesnow';
		$.ajax({
			type:'post',
			url: "/api/snowcoins/local/receive/setup",
			data: {'action':action,api:$('#confirm-modal #crapi').val(),when:$('#confirm-modal #crupdatetime').val()}
		})
		.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
			snowdccresponse(resp,function(){$('#licurrency').find('a').trigger('click')});
			console.log(resp);
			btn.button('reset'),sbtn.show();
		});	
	});
	
	/* generic dcc response  */	
	function snowdccremoveresponse(resp,cb) {
		if(resp.success===false) {
			snowmessage('error',resp.error,3000);
		} else if(!resp._id) {
			snowdccresponse(resp,cb);
		} else {
			$('#confirm-modal').modal('hide');
			if(resp.msg)snowmessage('message',resp.msg,3000);
			if(resp.message)snowmessage('success',resp.message,3000);
			$('#'+resp._id).addClass('bg-danger').delay(2000).fadeOut("slow",function(){
				$('#'+resp._id).remove();
			});
		}
	}
	function snowdccresponse(resp,cb) {
		
		if(resp.success===false) {
			snowmessage('error',resp.error,3000);
		} else {
			$('.dogeboard-left .content').css('visibility','hidden');
			$('#confirm-modal').modal('hide');
			if(resp.msg)snowmessage('message',resp.msg,3000);
			if(resp.succeed)snowmessage('success',resp.succeed,3000);
			$('.dogeboard-left .content').css('visibility','visible').hide().html(resp.html).show();
			$('.dogeboard-left .loading').delay(400).fadeOut("slow");
			sortCol('#snow-receive th');
			settab()
			$('.bstooltip').tooltip({container: 'body'});
			addselectbox('#confirm-modal select');
			if(cb && typeof cb === 'function')cb();	
		}
		
	}
	/* end DCC */
	
	/* generic modal screen */	
	function snowcreatemodal(htmlordiv,headtext,buttons,callback) {
		var isDiv = htmlordiv.substr(0,1) === '#' ? true:false;
		var html=(isDiv)? $(htmlordiv).html():htmlordiv;
		var time = new Date().getTime();
		$('#confirm-modal .modal-header h4').html(headtext);
		$('#confirm-modal .modal-body').html( '<div  >'+html+'</div>');
		if(isDiv)$('#confirm-modal .modal-body '+htmlordiv).show();
		$('#confirm-modal .modal-footer').html(buttons);
		$('#confirm-modal').modal('toggle');
		$('.bstooltip').tooltip({container: '#confirm-modal',html:true});
		$('#confirm-modal .modal-dialog').attr('snow-data-time',time);
		pressenter('[snow-data-time="'+time+'"]','#'+$('#confirm-modal .modal-footer').find('button').first().prop('id'));
		addselectbox('#confirm-modal select:not([multiple])');
		if (typeof callback === 'function')callback();
	}
	
	
	/* currency convert */
	var snowmoney=new Object;
	$(document).on('click','.change-coin-stamp',function(){
		var changeto=$(this).text();
		var changestamp=$(this).attr('data-snowstamp');
		var changeticker=$(this).attr('data-snowticker');
		var currentticker=$('.snow-send #snowchangefrom').attr('data-snowticker');
		var ddclass = 'bg-info';
		if(changeticker===currentwally.cointicker) {
			$('.snow-send #sendcoinamount').css('background-color','#D4E8FF').next().next().css('background-color','#EEE');
			$('.snow-send #changeamountspan').tooltip('destroy');
			$('.snow-send #sendcoinamount').tooltip({title:'We will send this Amount'}).tooltip('show');
		} else {
			$('.snow-send #sendcoinamount').css('background-color','#fff').next().next().css('background-color','#D4E8FF');
			$('.snow-send #sendcoinamount').tooltip('destroy');
			$('.snow-send #changeamountspan').tooltip({title:'We will send this Amount'}).tooltip('show');
			
		}
		if(changeticker!=currentticker) {
			$('.snow-send #snowchangefrom').attr('data-snowticker',changeticker);
			$('.snow-send #snowchangefrom').attr('data-snowstamp',changestamp);
			$('.snow-send #changestamp').text(changeto);
			$('.snow-send #sendcoinamount').focus();
			if(changeticker==='usd' || changeticker==='eur')$('.snow-send #sendcoinamount').prop('step','0.01');
			else if(changeticker==='ltc' || changeticker==='btc')$('.snow-send #sendcoinamount').prop('step','0.001');
			else $('.snow-send #sendcoinamount').prop('step','1');
		}	
	});

	$(document).on('keyup change focus','#snow-receive #sendcoinamount,#snow-send #sendcoinamount',function(){
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
					
					showvalue=snowmoney[from][to].price*enteredamount;
					if(to==='usd' || to==='eur'){
						$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
						showvalue=parseFloat(showvalue.toFixed(2));
					}
					else {
						$('.snow-send #sendcointrueamount').val(showvalue.toFixed(8).replace(/\.?0+$/, ""));
						showvalue=parseFloat(showvalue.toFixed(4));
						
					}
					$('.snow-send #changeamountbefore').text('');
					$('.snow-send #changeamountafter').text('');
					if(to==='usd')$('.snow-send #changeamountbefore').text(stamp);
					else $('.snow-send #changeamountafter').text(stamp);
					$('.snow-send #changeamount').text(showvalue);
				
			}
			else {
				$('.snow-send #sendcointrueamount').val(enteredamount.toFixed(8).replace(/\.?0+$/, ""));
			}				
			var balspan = $('.snow-send .snow-balance-body').find('span').first(),
				availbal = parseFloat($('.snow-send #snow-balance-input').val()),
				minus = $('.snow-send #sendcointrueamount').val(),
				changebalance = availbal - parseFloat(minus);
			balspan.text(changebalance.formatMoney(8,',','.'));
	});

	/*modal helper */
	$('#confirm-modal').on('hidden.bs.modal', function (e) {
		$('#confirm-modal .modal-header h4').text();
		$('#confirm-modal .modal-body').text();
		$('#confirm-modal .modal-footer').text();
	});
	/*help popovers*/
	
	$('body').popover({
		selector: '[rel=popover]'
	});
	
	/*tooltips */
	$('#wallet-unlock,#wallet-lock,#wallet-ssl').tooltip();	
	$('.dogemenulink, .dogedccmenulink').tooltip({placement:'right'});	
	
	/*reset api key*/
	$('#resetapikeynow').click(function(){	
		
			$('#confirmkeyadd').modal('hide');
			$.ajax({
			  url: "/api/snowcoins/local/new-key",
			  data: { }
			})
			.done(function( resp,status,xhr ) {
				_csrf = xhr.getResponseHeader("x-snow-token");
				if(resp.success === true)
				{
					$('#apikey').val(resp.apikey);
					snowmessage('message','API key reset successfully. key: '+resp.apikey,5000);
				}
				else
				{
					snowmessage('error','ERROR: '+resp.error,8000);
				}
			});	
		
		
	});
	
	/*changes lock display*/
	function changelock(lock)
	{
		if(lock==='off') {
			$('#wallet-lock').addClass('hidden');
			$('#wallet-unlock').addClass('hidden');
		} else if(!currentwally || currentwally.coinapi!='rpc') {
			$('#wallet-unlock').removeClass('hidden');
			$('#wallet-lock').addClass('hidden');
			lockstatus.locked=2;
		
		/* 0=encrypted,1=unlocked until lockstatus.time,2=not encrypted */ 
		} else if(lock===0 || lock==='Locked') {
			$('#wallet-lock').removeClass('hidden');
			$('#wallet-unlock').addClass('hidden');
			$('#wallet-unlocked').addClass('hidden');
			lockstatus.locked=0;
		}else if(lock>0) {
			var usetime=lock;
			$('#wallet-lock').addClass('hidden');
			$('#wallet-unlock').addClass('hidden');
			$('#wallet-unlocked').removeClass('hidden');
			var date = new Date(usetime);
			console.log(lock,usetime,new Date().getTime());
			var hours = date.getHours(),
				minutes = date.getMinutes(),
				seconds = date.getSeconds();
			var formattedTime = hours + ':' + minutes + ':' + seconds;
			lockstatus.locked=1;
			lockstatus.time=lock;
			lockstatus.formatTime=formattedTime;
			
			$('#wallet-unlocked').html('<span class="153567433"></span> secs').removeClass('hidden');
			
			snowcountdown('153567433',usetime);			
		} else {
			$('#wallet-unlock').removeClass('hidden');
			$('#wallet-lock').addClass('hidden');
			$('#wallet-unlocked').addClass('hidden');
			lockstatus.locked=2;
		}
	}
	
	

	/*menu affix helpers*/
	
	$('#menuspy').on('affixed.bs.affix',function() {
		$('#menuspyhelper').removeClass('hidden');
		
	});
	$('#menuspy').on('affix-top.bs.affix',function() {
		$('#menuspyhelper').addClass('hidden');
	});
	$('#walletbar').on('affixed.bs.affix',function() {
		$('#walletbarspyhelper').show();
		
	});
	$('#walletbar').on('affix-top.bs.affix',function() {
		$('#walletbarspyhelper').hide();
	});
	
	
	
	/*dropdown fix for mobile... ugh*/
	var z=500;
	$(document).on('show.bs.dropdown','.dropdown', function (e) {
		//get the x of our dropdown
		var ch=$(this).closest('table').parent().height(),
			place=e.currentTarget.offsetTop,
			win=$(window).height(),
			winoff=$(window).offset(),
			menuh=$(this).find(' .dropdown-menu').height(),
			frombottom=win-place;
		if((frombottom<(menuh+180) && ch>200 && place>(menuh+25)))
			$(this).addClass('dropup');
		else 
			if(ch<200)$(this).closest('table').parent().height(ch+menuh+(200-ch+menuh));
		
		$(this).css('z-index',z++);
	});
	

	/* table column sorter */
	function sortCol(who,skip)
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
		else if($(who).find("span").text()==='balance')
			return function(a, b) {
				var valA = getCellValue(a, index).split(currentwally.coinstamp), valB = getCellValue(b, index).split(currentwally.coinstamp);
				//console.log( " val : ", currentwally.coinstamp," valA : ", valA[0].replace(/,/g,''));
				return  parseFloat(valA[0].replace(/,/g,'')) - parseFloat(valB[0].replace(/,/g,'')) 
			}
		else if($(who).is(".snowsortisempty"))
			return function(a, b) {
				var valA = ($(a).children('td').eq(index).html().trim()==='')?0:1,
					valB = ($(b).children('td').eq(index).html().trim()==='')?0:1;
				//console.log( " a : ", valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).is(".snowsortdate"))
			return function(a, b) {
				var valA =  Date.parse($(a).children('td').eq(index).html().trim()),
					valB = Date.parse($(b).children('td').eq(index).html().trim());
				//console.log( " a : ", valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}	
		else
			return function(a, b) {
				
				var valA = getCellValue(a, index), valB = getCellValue(b, index)
				//console.log( " a : ", valA," b : ", valB);
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
	}
	function getCellValue(row, index){ return $(row).children('td').eq(index).text() }
	
	function isIP(num) {
		 var ary = num;
		 var ip = true;
		 
		 for (var i in ary) { ip = (!ary[i].match(/^\d{1,3}$/) || (Number(ary[i]) > 255)) ? false : ip; }
		 ip = (ary.length != 4) ? false : ip;

		 if (!ip) {    // the value is NOT a valid IP address
			return false;
		 } else { return true; } // the value IS a valid IP address
	}
	
	Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
		var n = this,
		decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
		decSeparator = decSeparator === undefined ? "." : decSeparator,
		thouSeparator = thouSeparator === undefined ? "," : thouSeparator,
		sign = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
		return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "").replace(/\.?0+$/, "");
	};
	/*countdown*/
	function snowcountdown(div,time) {
		var days, hours, minutes, seconds;
		var countdown = $('.'+div);
		var stop=false;
		//console.log(div,time,new Date().getTime());
		var runme=setInterval(function () {
			// find the amount of "seconds" between now and target
			var current_date = new Date().getTime();
			//console.log(time,current_date);
			var seconds_left = parseInt((time - current_date) / 1000);
			/* do some time calculations
			days = parseInt(seconds_left / 86400);
			seconds_left = seconds_left % 86400;
			hours = parseInt(seconds_left / 3600);
			seconds_left = seconds_left % 3600; 
			minutes = parseInt(seconds_left / 60);
			seconds = parseInt(seconds_left % 60);
			console.log(seconds); 
			 format countdown string + set tag value
			*/
			countdown.html(seconds_left);  
			if(seconds_left<0 && stop===false) {
				$('#unlockedwallet').hide();
				$('#unlockwallet').show();
				$('#unlockwalletbutton').show();
				$('#unlockwalletbalanceform').hide();
				stop=true;
				changelock(0);
				//console.log(seconds_left);
				clearInterval(runme);
				return;
			}
		}, 1000);
		
	}
	
		//unique per window
	 var GUID = function () {
                //------------------
                var S4 = function () {
                    return(
                            Math.floor(
                                    Math.random() * 0x10000 /* 65536 */
                                ).toString(16)
                        );
                };
                //------------------

                return (
                        S4() + S4() + "-" +
                        S4() + "-" +
                        S4() + "-" +
                        S4() + "-" +
                        S4() + S4() + S4()
                    );
            };
            //----------------------
	
	/** 
	 * add csrf token to ajax requests - 
	 * we use a revolving nonce 
	 * the requesting object is responsible for resetting the nonce
	 * requests must be synchronous 
	 * use the getCookie function to use a set once nonce
	 * xhr.setRequestHeader("x-snow-token", getCookie('cookie name'));
	 * */
	
	
	
	$(document).ajaxSend(function(event, xhr, settings) {
	
	  function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
		  var cookies = document.cookie.split(';');
		  for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
			  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
			  break;
			}
		  }
		}
		return cookieValue;
	  }

	  function sameOrigin(url) {
		// url could be relative or scheme relative or absolute
		var host = document.location.host; // host + port
		var protocol = document.location.protocol;
		var sr_origin = '//' + host;
		var origin = protocol + sr_origin;
		// Allow absolute or scheme relative URLs to same origin
		return (url === origin || url.slice(0, origin.length + 1) === origin + '/') ||
			   (url === sr_origin || url.slice(0, sr_origin.length + 1) === sr_origin + '/') ||
			   // or any other URL that isn't scheme relative or absolute i.e relative.
			   !(/^(\/\/|http:|https:).*/.test(url));
	  }

	  function safeMethod(method) {
		return (/^(HEAD|OPTIONS|TRACE)$/.test(method));
	  }
		
	  if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
		xhr.setRequestHeader("x-snow-token", _csrf);
		xhr.setRequestHeader("x-snow-window", window.name);
	  }
	});
	
	/**
	 * 
	 * Catch redirects for logouts and stuff and runs commands
	 * 
	 * */
	$(document).ajaxComplete(function(event, xhr, settings) {
		var data = $.parseJSON(xhr.responseText);
		if(data.redirect)location.href=data.redirect;
		else {
			try {
				//addselectbox()
			} catch(e) {
				console.log(e);
			}
		}
	});
	
	
	
	if (!window.name.match(/^GUID-/)) {
		window.name = "GUID-" + GUID();
	}
	
	
	/* *  
	 * Run as soon as the page loads
	 * */
	$.ajax({async:false,url: "/api/snowcoins/local/contacts/?setnonce=true"})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			$(window).hashchange();
			console.log('token, send window name',_csrf,window.name);
	});
	
});
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
