(function() {
  var bone, boneScripts = {}, fs, pathutil;
  
  var keystone = require('keystone'),
	snowcoins = require('wallets'),
	jade = require('jade'),
	_ = require('lodash'),
	util = require("util"),
	path = require('path');
	
 

  fs = require('fs');
	
  pathutil = path;

  bone = {};
  

function addslashes( str ) {
	return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/* convert the templates to js */
function addjade(file,varname) {
    
	var name = varname || false;
	
	var html = jade.renderFile(file, {local:keystone.get('locals'),snowtext:snowcoins.get('mylanguage')});
   
	if(!name) {
		var s = file.split('/');
		var d = s.pop().split('.');
		
		var name = d[0];
		if(!name) return;
		
	}
	//console.log(name);
	return 'snowUI.bonehtml.' + name + " = function(options) { return " + JSON.stringify(html) + "; }\n";		 
	
}
var templates = 'snowUI.bonehtml["404"] = function(){ return \'<div class="requesterror" style="margin:40px"><span> You did something I am not prepared for.  Please do something else next time.</span></div>\'}; ';
templates =  templates + addjade(snowcoins.get('moduleDir') + '/templates/views/api/d3c/login.jade');
	//console.log(templates,'templates');
templates = templates + addjade(snowcoins.get('moduleDir') + '/templates/views/api/d3c/chatbox.jade');
templates = templates + addjade(snowcoins.get('moduleDir') + '/templates/views/api/d3c/forms/ledger.jade','ledgerform');
templates = templates + addjade(snowcoins.get('moduleDir') + '/templates/views/api/d3c/forms/transaction.jade','txform');
   
bone["static"] = module.exports = function(options) {
    return function(request, response, next) {
      var  scriptName;
		//console.log('run language scripts');
	
	
	if (request.url === ("/bonetemplates")) {
	  
		response.set('Content-Type', 'text/javascript');
		var snowdone = function() {
			
			var contents = 'snowUI.bonehtml = {};' + "\n"; 
			
			contents = contents + templates;
	 
			return response.send(contents);
			
		}	
		snowdone();

	} else {
		return next();
	}
      
      
    };
  };


}).call(this);
