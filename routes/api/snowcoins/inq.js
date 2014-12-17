var keystone = require('keystone'),
	snowcoins = require('wallets'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {
		
		var view = new keystone.View(req, res),
		locals = res.locals;
		locals.data={},locals.data.qq={},
		msg='',
		errors='',
		succ='';
		var Wallets = snowlist.wallets;

		if(req.query.uri)locals.data.qq=JSON.parse(req.query.uri);
		//console.log(locals.data.qq);
		async.series([
			function(next) {
				next();
			}
		], 
			function(err) {	
					view.render('api/inq', { 
						},function(err,list){
							if(err)list=err+'';
							if(errors!='' && !err)err=errors;
							//console.log(err.TypeError,list)
							return res.apiResponse({ success: true, html:list,err:err,msg:msg,succeed:succ });
					});
			}
		);

}


