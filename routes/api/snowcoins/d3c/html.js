exports = module.exports = function(req, res) {  
	var name = req.params.view;
	res.render('api/d3c/' + name,{d3ckey:req.params.d3ckey});
};
