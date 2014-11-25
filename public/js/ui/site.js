/* commons
 * */

/* our languages are stored in snowlanguages which is retrieved on start
 * the default is snowcoins.get('language') or 'en-us'
 * 
 * changing saves across sessions  by adding the value to the users settings document
 * newsettings:{'language':'en-uk'}
 * 
 * the relaod is a json file
 * */
var snowtext = snowlanguages.language;

var snowPath = {
	linkServer: {
		host: 'http://snow8:12888/',
	},
	router: {
		root: 'snowcoins',
		wallet: 'wallet',
		receive: 'receive',
		settings: 'settings',
		profile: 'profile',
		inq: '.link',
		link: '.link',
		d2c: 'd2c',
		d3c: 'd3c'
	},
	routeRoot: 'snowcoins',
	root: '/snowcoins',
	wallet: '/wallet',
	receive: '/receive',
	settings: '/settings',
	profile: '/profile',
	inq: '/.link',
	link: '/.link',
	d2c: '/d2c',
	d3c: '/d3c',
	share: '/share',
} 
var snowUI = {
	debug: true,
	snowcat: 'snowcat',
	userSettings: {},
	wallet: {},
	_wallets: {},
	receive: {},
	settings: {},
	link:{},
	methods : {
		wallet:{},
		receive:{},
		settings:{},
	},
	intervals: {},
	controllers : {
		ui:{},
		wallet:{},
		receive:{},
		settings:{},
	},
	_flash:{},
	killFlash: function(who) {
		clearTimeout(snowUI._flash[who])
		$('.fade'+who).fadeOut();
	},
	flash:function(type,msg,delay,kill) {
		if(isNaN(delay))delay=4000;
		
		var clear = function(who) {
			clearTimeout(snowUI._flash[who])
			$('.fade'+who).fadeOut();
		}
		var keys = Object.keys(snowUI._flash)
		keys.forEach(function(v) {
			if(kill || v === type)clear(v)
		})
		$('.fade'+type).fadeIn().find('.html').html(msg)
		snowUI._flash[type] = setTimeout(function() {
			$('.fade'+type).fadeOut();
		},delay);
		
	},
	fadeRenderOut: function (cb) {
		
		$('#maindiv')
		.fadeTo("slow",0.00)
		.promise()
		.done(function() {
			if(snowUI.debug) snowlog.log('fadeout')
			if(cb)cb()
		});
		//$('#maindiv').css('opacity',0.01);
	},
	fadeRenderIn: function (cb) {
		
		$('#maindiv')
		.delay(450)
		.fadeTo("slow",1.0)
		.promise()
		.done(function() {
			if(snowUI.debug) snowlog.log('fadein') 
			if(cb)cb()
		});
	}, 
	loaderFetch: function(callback) {
		//get a new route
		var run = function() {
			$('#maindiv')
			.fadeTo(100,0.0)
			.promise()
			.done(function() {
				if(snowUI.debug) snowlog.log('fade out') 
				if(callback)callback()
			});
		}
		if($('.loader').css('display') !== 'none') {
			run()
		} else {
			$('.loader')
			.toggle(500)
			.promise()
			.done(function() {
				run()
				
			});
		}
		return false
	},
	loaderRender: function(callback) {
		//return a new route
		$('#maindiv')
		.fadeTo(100,1.0)
		.promise()
		.done(function() {
			if($('.loader').css('display') === 'none') {
				if(snowUI.debug) snowlog.log('fade in - loader already hidden') 
				if(callback)callback()
			} else {
				$('.loader')
				.toggle(150)
				.promise()
				.done(function() {
					if(snowUI.debug) snowlog.log('fade in') 
					if(callback)callback()
					//make sure that load is gone
					snowUI.killLoader()
				});
			}
		});
	
		return false
	},
	loadingStart: function(cb) {
		$('.loader')
		.toggle(true)
		.delay(250)
		.promise()
		.done(function() {
			if(snowUI.debug) snowlog.log('show load gif') 
			if(cb)cb()
		});
		return false
	},
	loadingStop: function(cb) {
		$('.loader')
		.delay(250)
		.toggle(false)
		.promise()
		.done(function() {
			if(snowUI.debug) snowlog.log('hide load gif') 
			if(cb)cb()
		});
		return false
	},
	killLoader: function(cb) {
		if($('.loader').css('display') !== 'none')$('.loader').hide()
		
		return false
	},
	_watching: false,
	watchLoader: function() {
		
		if(this._watching)clearTimeout(this._watching)
		
		this._watching = setTimeout(function() { snowUI.loaderRender() },750)
	},
	deleteWallet: function(e){
		
		
		var wallet = e.target.dataset.snowmoon
		if(!wallet) wallet = e.target.parentElement.dataset.snowmoon;
		
		if(snowUI.debug) snowlog.info(wallet,e.target)
		
		if(!wallet) {
			snowUI.flash('error','Can not find a link for the wallet requested',2500)
			return false
		}
		
		var url = "/api/snowcoins/local/remove-wallet"
		var data = {'action':'request',wally:wallet}
		
		snowUI.ajax.GET(url,data,function(resp) {
			console.info(resp)
			if(resp.success === true) {			
				
				snowUI._wallets[wallet] = {removeKey: resp.key};
				snowUI.methods.valueRoute(snowPath.wallet + '/' + wallet + '/remove');
			
			} else {
				snowUI.loaderRender();
				if(resp.error)errorDiv.fadeIn().html(resp.error)
				snowUI.flash('error','Error receiving permissions',3000);
			}
		});
				
		
		return false;
	},
	ajax: {
		running: false,
		GET: function(url,data,callback) {
			snowUI.ajax._send('GET',url,data,callback)
		},
		request: function(url,data,callback) {
			this.GET(url,data,callback)
		},
		post: function(url,data,callback) {
			this.POST(url,data,callback)
		},
		POST: function(url,data,callback) {
			snowUI.ajax._send('POST',url,data,callback)
		},
		/* use call waiting if you want all requests to be ignored until you get a response
		 * does not block
		 * */
		callwaiting: function(type,url,data,callback) {
			if(!snowUI.ajax.running) snowUI.ajax.running = url
			snowUI.ajax._send(type,url,data,callback)
		},
		
		/* we do this so that we can use a nice ignore instead of an async block
		 * only use this method internally 
		 * */
		_send: function(type,url,data,callback) {
			if(!snowUI.ajax.running) {
				snowUI.ajax.forced(type,url,data,callback)
			} else {
				snowUI.flash('message','call in progress... ' + snowUI.ajax.running,2000)
			}
		},
		
		/* 
		 * sometimes you want to ignore the ignore
		 * hit forced directly to do so
		 * */
		forced: function(type,url,data,callback) {
			
			if(!type)var type = 'GET'
			
			$.ajax({type:type,url: url,data:data})
			.done(function( resp,status,xhr ) {
				
				_csrf = xhr.getResponseHeader("x-snow-token");
				snowUI.ajax.running = false
				if(snowUI.debug) snowlog.log(type + 'call return')
				callback(resp)	
			});					
				
		},
		
	},/*end ajax*/
	isArray: function(arr) {
		return (Object.prototype.toString.call(arr) === '[object Array]')
	},
	_sorted: [],
	sortCol: function(who)
	{
		return false
		if(snowUI.debug) snowlog.info('sort col',who,this._sorted)
		
		if(this._sorted.indexOf(who))
			return false;
		
		this._sorted.push(who)
		
		
		
	},
	comparer: function(index,who) {
		if($(who).hasClass("sortaccount")) {
			
				var valA = $(index).attr('data-snowaccount');
				var valB = $(who).attr('data-snowaccount');
				if(snowUI.debug) snowlog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).hasClass("sortbalance")) {
				
				var valA = $(index).attr('data-snowbalance');
				var valB = $(who).attr('data-snowbalance');
				if(snowUI.debug) snowlog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).hasClass("sortaddresses")) {
				var valA = $(index).find('.addresses .eachaddress').children().length-1;
				var valB = $(who).find('.addresses .eachaddress').children().length-1;
				if(snowUI.debug) snowlog.info(valA,valB)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
						
		} else if($(who).is(".snowsortcountitems"))
			return function(a, b) {
				var valA = $(a).children('td').eq(index).children().length;
				var valB = $(b).children('td').eq(index).children().length;
				//console.log( " a : ", valA," b : ", valB);
				//var valA = getCellValue(a, index), valB = getCellValue(b, index)
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
		else if($(who).find("span").text()==='balance')
			return function(a, b) {
				var valA = snowUI.getCellValue(a, index).split(snowUI.methods.config.wally.coinstamp), valB = snowUI.getCellValue(b, index).split(snowUI.methods.config.wally.coinstamp);
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
				var valA =  Date.parse($(a).children('td').eq(index).text().trim()),
					valB = Date.parse($(b).children('td').eq(index).text().trim());
				//console.log( " a : ",$(a).children('td').eq(index).text().trim(), valA," b : ", valB);
				//console.log($(who).text());
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}	
		else
			return function(a, b) {
				
				var valA = snowUI.getCellValue(a, index), valB = snowUI.getCellValue(b, index)
				//console.log( " a : ", valA," b : ", valB);
				return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
			}
	},
	getCellValue: function(row, index) {
		 return $(row).children('td').eq(index).text() 
	},	
	isIP: function(num) {
		 var ary = num;
		 var ip = true;
		 
		 for (var i in ary) { ip = (!ary[i].match(/^\d{1,3}$/) || (Number(ary[i]) > 255)) ? false : ip; }
		 ip = (ary.length != 4) ? false : ip;

		 if (!ip) {    // the value is NOT a valid IP address
			return false;
		 } else { return true; } // the value IS a valid IP address
	},
	
}
/* messages */
var snowmessage = snowUI.flash;

		
	var $navbarLogo = $('.walletbar-logo'),
		$easterEgg = $('#easter-egg'),
		$oldLogo = $('#old-logo');
	
	var hasOpened = false;
	
	function eggy(e) {
		var $navbarLogo = $('.walletbar-logo'),
		$easterEgg = $('#easter-egg')
				
		if ($navbarLogo.hasClass('clicked')) {
			
			$navbarLogo.removeClass('clicked');
			
			$easterEgg.animate({ height: 0 }, 1000, function() {
				
				//$easterEgg.css({ height: 0 });
			});
			
			
		} else {
			
			$navbarLogo.addClass('clicked');
			
			$easterEgg.show();
			
			var height = $easterEgg.height();
			
			$easterEgg.css({ height: 0 });
			
			$easterEgg.animate({ height: '400px' }, 1000);
			
			if (!hasOpened) {
				hasOpened = true;
			} 
			
		}
	
	}
	


	/*form label click to focus*/
	$('label').click(function(){
			var name=this.htmlFor;
			//alert('input[name='+name+']');
			$('input[name='+name+']').focus();
			$('input#'+name).focus();
	});
	
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
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
