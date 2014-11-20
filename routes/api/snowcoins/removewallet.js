var keystone = require('keystone'),
	snowcoins = require('snowcoins'),
	snowlist = snowcoins.get('lists');

exports = module.exports = function(req, res) {

	var Wallet = snowlist.wallets;
	if(req.query.action === 'request') {
		
		Wallet.model.removeKey(req.query.wally,function(key) {
			return res.apiResponse({ success: true,key:key });	
		})
		
	} else if(req.query.action === 'remove') {
		
		Wallet.model.findOne({ 'key': req.query.wally, permissions: {removeKey: req.query.removeKey} }, function(err,wally) {
			if (err) return res.apiResponse({ success: false, err: err });
			wally.remove(function(err){
				if (err) return res.apiResponse({ success: false, err: err });
				return res.apiResponse({ success: true,msg:'Wallet deleted successfully' });
			});
			
		});
	}
	else
	{
		return res.apiResponse({ success: false, err: 'No action' });
	}
}
