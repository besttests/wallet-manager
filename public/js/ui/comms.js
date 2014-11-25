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
	 * Catch long ajax requests and show a loading message
	 * 
	 * */
	$(document).ajaxStart(function() {

		snowUI.showLoadingIfTimer = setTimeout(function(){
			snowUI.flash('loadingmessage','Loading ',10000);
			snowUI.showLoadingIfTimerLong = setTimeout(function(){
				snowUI.flash('error','Still Loading ',10000);
			},10000);
		},500);
	});
	/**
	 * 
	 * Catch redirects for logouts and stuff and runs commands
	 * 
	 * */
	$(document).ajaxComplete(function(event, xhr, settings) {
		
		/* stop the loading watch */
		clearTimeout(snowUI.showLoadingIfTimer);
		clearTimeout(snowUI.showLoadingIfTimerLong);
		snowUI.killFlash('loadingmessage');
	
		var data = $.parseJSON(xhr.responseText);
		if(data.redirect) {
			location.href=data.redirect;
		} 
		if(data.path) {
			resp = data;

			snowPath.root = '/' + resp.path.snowcoins;
			snowPath.routeRoot = resp.path.snowcoins;
			snowPath.router.root = resp.path.snowcoins;
			
			snowPath.d2c = '/' + resp.path.d2c;
			snowPath.router.d2c = resp.path.d2c;
			
			snowPath.d3c = '/' + resp.path.d3c;
			snowPath.router.d3c = resp.path.d3c;
			
			snowPath.share = '/' + resp.path.share;
			snowPath.router.share = resp.path.share;
			
			snowPath.logout = '/' + resp.path.logout;
			
			if(data.path.link) {
				if(data.path.link.port)snowUI.link.port = data.path.link.port;
				if(data.path.link.state)snowUI.link.state = data.path.link.state;
				if(data.path.link.sockets !== undefined)snowUI.link.sockets = data.path.link.sockets;
			}
			
			if(resp.path.snowcat)snowUI.snowcat = resp.path.snowcat;
			if(snowUI.debug) snowlog.log(snowUI.snowcat,resp.path);
		}
	});
	
	
	
	if (!window.name.match(/^GUID-/)) {
		window.name = "GUID-" + GUID();
	}
	
$(function() {	
	/* *  
	 * Run as soon as the page loads
	 * we use contacts since it is a simple page.
	 * the page should never reach the route to run the contacts function, 
	 * and SHOULD BE INTERCEPTED by the checkprivatenonce middleware
	 * 
	 * */
	 if(snowUI.debug) snowlog.info(snowlanguages)
	$.ajax({async:false,url: "/api/snowcoins/local/contacts/?setnonce=true"})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			if(snowUI.debug) snowlog.info(resp)
			
			//start our app
			bone.router.start({root:resp.path.snowcoins,pushState: true});
			
			if(snowUI.debug) snowlog.info('token, send window name',_csrf,window.name);
			
	});
	
	/* some stuff just needs to be here */
	
	$(document).on('show.bs.tab','#dynamicaddtabs a[data-toggle="tab"],#dynamicaddtabs a[data-toggle="pill"]', function (e) {
		//e.target // activated tab
		//e.relatedTarget // previous tab
		if(snowUI.debug) snowlog.log('switch tab divs')
			
		var target = e.target.dataset.target;
		$('#fw-useme').val(target)
		$('#maindiv .tab-pane').toggle(400);
			
	})
	$(document).on('click','.snowtablesort th',function(){
			if(snowUI.debug) snowlog.info('sort col')
			if(this.asc === undefined) this.asc = true;
			var table = $(this).parents('table').eq(0)
			
			$('.snowtablesort th').find('.glyphicon-sort-by-alphabet-alt').removeClass("glyphicon-sort-by-alphabet-alt")
			$('.snowtablesort th').find('.glyphicon-sort-by-order-alt').removeClass("glyphicon-sort-by-order-alt")
			
			var rows = table.find('tbody tr').not( ".skipme" ).toArray().sort(snowUI.comparer($(this).index(),this))
			
			//if(snowUI.debug) snowlog.log(table.find('tr:gt(0)').toArray());
			this.asc = !this.asc
			if (!this.asc){
				rows = rows.reverse()
				$(this).find('.glyphicon-sort-by-alphabet').addClass("glyphicon-sort-by-alphabet-alt")
				$(this).find('.glyphicon-sort-by-order').addClass("glyphicon-sort-by-order-alt")
			}
			for (var i = 0; i < rows.length; i++){table.append(rows[i])}
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
