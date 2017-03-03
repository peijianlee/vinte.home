var Shopcart = require('../models/shopcart')

// 购物清单
exports.detail = function(req,res){

	res.render('shopcart',{
		title: 'shopcart' + ' | IMOOC'
	})
}