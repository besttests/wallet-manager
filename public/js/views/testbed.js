$(function() {
	$('#runtest').click(function(){
		var url=$('#url').val()+'?nonce='+$('#nonce').val()+'&command='+$('#command').val()+'&action='+$('#action').val()+'&'+$('#query').val();

		$.ajax({
			url: url
		})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			$('#nonce').val(resp.nonce);
			$('#results').html(JSON.stringify(resp, null, 4));
			
		});
		
	});	

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
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
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
		return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
			   (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
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
	$.ajax({async:false,url: "/api/d3c"})
		.done(function( resp,status,xhr ) {
			_csrf = xhr.getResponseHeader("x-snow-token");
			$('#nonce').val(resp.nonce);
			console.log('token, send window name',_csrf,window.name);
	});


})
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
