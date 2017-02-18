
exports.list = function(req,res){
	// var user = req.session.user

	res.render('product',{
		title: 'IMOOC 产品列表'
	})
}