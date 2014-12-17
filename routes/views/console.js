var k = require('keystone'),
	async = require('async'),
	path = require('path'),
	_ = require('lodash'),
	fs = require('fs');

exports = module.exports = function(req, res) {
	var l = console.log
	
	//l(k.list('Ledger').schema.paths,_.keys(k.list('Ledger').schema.paths));
	
	return res.apiResponse({ success: true, hello:'hello' });

}
