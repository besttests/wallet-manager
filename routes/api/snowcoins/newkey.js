var keystone = require('keystone'),
	sanitizer=require("sanitizer"),
	hat=require('hat');

exports = module.exports = function(req, res) {
	if(req.user)
	{
			var key=hat();
			//console.log(key);
			var fields=['apikey'];
			var adds=[];
			adds['apikey']=key;
			
		req.user.getUpdateHandler(req).process(adds, {
			fields:fields,
			flashErrors: true
		}, function(err) {
		
			if (err) {
				return res.apiResponse({ success:false,err: err });
			}
			
			//req.flash('success', 'Your key has been reset.');
			return res.apiResponse({ success:true,apikey: key });
		
		});
	}
	

}
