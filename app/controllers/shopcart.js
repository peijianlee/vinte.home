var Shopcart = require('../models/shopcart')
var Product = require('../models/product')

// 购物清单
exports.detail = function(req,res){
	var user = req.session.user
	if(!req.session.cart) req.session.cart = []

	console.log(req.session.cart)

	if(!user){
		// 批量查找
		Product.find({_id:{$in:req.session.cart}},function(err,product){
			if(err) console.log(err)
			// console.log(product)
			res.render('shopcart',{
				title: 'shopcart' + ' | IMOOC',
				product: product
			})
		})


	}
}

// 添加购物车
exports.add = function(req,res){
	var user = req.session.user
	var cartinfo = req.body
	// 如果用户不存在新建个临时购物表
	if(!req.session.cart) req.session.cart = []
	if(!user){
		// 判断下面临时购物车下是否有重复
		var has_same_pid = false
		for(var i=0;i<req.session.cart.length;i++){
			if(req.session.cart[i]==req.body.pid){
				has_same_pid = true
				break
			}
		}
		if(!has_same_pid){
			req.session.cart.push(cartinfo.pid)
		}else{
			// 不再重复增加返回1
			return res.json({success:1})
		}
		console.log(has_same_pid)
		console.log(req.session.cart)

	}

	res.json({success:2,cart_goods_num:req.session.cart.length})



	
}