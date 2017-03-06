var Shopcart = require('../models/shopcart')
var Product = require('../models/product')


// 购物清单
exports.detail = function(req,res){
	var user = req.session.user
	if(!req.session.cart) req.session.cart = []
	console.log(req.session.cart)

	if(!user){
		var session_cart = req.session.cart

		console.log(req.session.cart)
		var data_cart = []
		var data_quantity = []
		for(var i=0; i<session_cart.length; i++){
			data_cart.push(session_cart[i]._id)
			data_quantity.push(session_cart[i].quantity)
		}
		// 批量查找
		Product.find({_id:{$in:data_cart}},function(err,product){
			if(err) console.log(err)
			res.render('shopcart',{
				title: 'shopping cart' + ' | IMOOC',
				product: product,
				cart_goods_num: product.length
			})
		})

	}else{

		Shopcart
			.findOne({'uid':user._id})
			.populate('products', 'id')
			.exec(function(err, shopcart){
				if(err) console.log(err)

				console.log(shopcart)

				var cart_goods_num = shopcart.products.length
				res.render('shopcart',{
					title: 'dfsdfsdfsdf' + ' | IMOOC',
					product: shopcart
				})
			})

	}
}

// 添加购物车
exports.add = function(req,res){
	var user = req.session.user
	var cartinfo = req.body
	var cart_goods_num = 0
	if(!user){
		// 如果用户不存在新建个临时购物表
		if(!req.session.cart) req.session.cart = []
		// 判断下面临时购物车下是否有重复
		var has_same_pid = false
		for(var i=0;i<req.session.cart.length;i++){
			if(req.session.cart[i]._id==req.body._id){
				has_same_pid = true
				break
			}
		}
		if(!has_same_pid){
			req.session.cart.push(cartinfo)
			return res.json({success:2,cart_goods_num:req.session.cart.length})

		}else{
			// 不再重复增加返回1
			return res.json({success:1})
		}
		console.log(has_same_pid)
		console.log(req.session.cart)

	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)
			console.log(shopcart)
			var check_same_id = false
			for(var i=0; i<shopcart.products.length; i++){
				if(shopcart.products[i]._id == cartinfo._id){
					check_same_id = true
				}
			}
			console.log(check_same_id)
			if(check_same_id){
				return res.json({success:1})
			}else{
				shopcart.products.push(cartinfo)
				shopcart.save(function(err){
					console.log(err)
					console.log(cartinfo)
					res.json({success:2,cart_goods_num:shopcart.products.length})
				})
			}

			// res.json({success:1})

		})

	}

}

// 删除购物车
exports.del = function(req,res){
	var user = req.session.user
	var id = req.query.id

	if(!user){
		console.log(id)
		var cart = req.session.cart
		for(var i=0; i<cart.length; i++){
			console.log('------')
			console.log(cart[i]._id +'=='+ id)
			if(cart[i]._id == id){
				req.session.cart.splice(i, 1)
				res.json({success:1,cart_goods_num:cart.length})
				return false
			}
		}
		res.json({success:0})
	}

}