var Shopcart = require('../models/shopcart')
var Product = require('../models/product')
var User = require('../models/user')
var Order = require('../models/order')
var _ = require('underscore')


// 购物清单
exports.detail = function(req,res){
	var user = req.session.user
	if(!user){
		if(!req.session.cart) req.session.cart = []
		var session_cart = req.session.cart
		// 非常愚蠢的循环出来又循环进去
		var session_pid = []
		var session_quantity = []
		if(session_cart.length > 0){
			for(var i = 0; i < session_cart.length; i++){
				session_pid.push(session_cart[i].pid)
				session_quantity.push(session_cart[i].quantity)
			}
		}
		Product
			.find({_id:{$in:session_pid}})
			.populate('sort color material scene','attributes')
			.exec(function(err,products){
				if(err) console.log(err)
				// 非常愚蠢的循环出来又循环进去
				var productsObj = []
				for(var i=0; i < session_quantity.length; i++){
					var p_obj = {
						'quantity':session_quantity[i],
						'pid': products[i]
					}
					productsObj.push(p_obj)
				}
				res.render('shopcart',{
					title: 'inquiry list' + ' | ITEST',
					products: productsObj,
					captcha: req.session.captcha,
					cart_goods_num: products.length
				})
			})
	}else{
		// populate多层查找
		Shopcart
			.findOne({'uid':user._id})
			.populate({
				path: 'products.pid',
				model: 'Product',
				populate: {
					path: 'sort color material scene',
					select: 'attributes',
					model: 'Category'
				}
			})
			.exec(function(err, shopcart){
				if(err) console.log(err)
				if(shopcart){
					var products = shopcart.products
					var cart_goods_num = shopcart.products.length
				}else{
					var products = []
					var cart_goods_num = 0
				}
				res.render('shopcart',{
					title: 'dfsdfsdfsdf' + ' | IMOOC',
					products: products,
					cart_goods_num: cart_goods_num
				})

			})
	}
}

// 创建购物清单及填写个人信息
exports.createInquirylist = function(req, res){
	var orderObj = req.body.order.pid

	Product
		.find({_id: {$in: orderObj}})
		.populate('sort color material scene','attributes')
		.exec(function(err, products){
			res.render('create_order',{
				title: '创建询价单' + ' | IMOOC',
				products: products
			})

		})
}
// 创建订单
exports.createOrder = function(req, res){
	var orderInfo = req.body.order

	Product
		.find({_id: {$in: orderInfo.products.id}})
		.exec(function(err, products){
			// console.log(products)
			if(products && products.length > 0){
				var orderObj = {
					uid: orderInfo.uid,
					from: orderInfo.from,
					products:[]
				}
				for(var i=0; i<products.length; i++){
					var productObj = {
						'_id': products[i].id,
						'title': products[i].title,
						'cover': products[i].cover,
						'price': products[i].price,
						'size': products[i].size,
						'sale': products[i].sale,
						'color': products[i].color,
						'material': products[i].material,
						'scene': products[i].scene,
						'quantity': orderInfo.products.quantity[i],
						'fromprice': orderInfo.products.fromprice[i]
					}
					orderObj.products.push(productObj)
				}
				var _orderObj = new Order(orderObj)
				_orderObj.save(function(err, order){
					if(err) console.log(err)
					// req.session.user.order.id = order.id
					// req.session.user.order.data = order.meta.createAt
					req.session.user.order = {
						id: order.id,
						data: order.meta.createAt
					}
					res.redirect('order/success')
				})
			}
			return false
		})
}
// 创建订单成功信息
exports.createOrderSuccess = function(req, res){
	console.log(req.session.user)
	res.render('create_order_success',{
		title: '询价单创建成功 | IMOOC',
		order: req.session.user.order
	})
}

// 添加购物车
exports.add = function(req,res){
	var user = req.session.user
	var cartinfo = req.body
	var pid = cartinfo.pid
	var cart_goods_num = 0

	if(!user){
		var check_same_pid = false
		if(!req.session.cart){
			// 如果用户不存在新建个临时购物表
			req.session.cart = []
		}else{
			// 判断下面临时购物车下是否有重复
			for(var i=0;i<req.session.cart.length;i++){
				if(req.session.cart[i].pid==pid){
					check_same_pid = true
					break
				}
			}
		}

		if(check_same_pid) return res.json({success:1})

		// 新增
		var cart_product = {
			'quantity': cartinfo.quantity,
			'pid': pid
		}
		req.session.cart.push(cart_product)
		return res.json({
			success:2,
			cart_goods_num:req.session.cart.length
		})
	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)

			var check_same_id = false
			for(var i=0; i<shopcart.products.length; i++){
				if(shopcart.products[i].pid.toString() === pid.toString()){
					check_same_id = true
					break
				}
			}
			if(check_same_id) return res.json({success:1})


			shopcart.products.push(cartinfo)
			shopcart.save(function(err, _shopcart){
				console.log(err)
				user.shopcartgoods.push(pid)
				
				// User.findByIdAndUpdate(user.id, {$set:{shopcartgoods:1}}, function(err){
				// 	if(err) console.log(err)
				// })
				return res.json({success:2,cart_goods_num:_shopcart.products.length})
			})

		})

	}

	console.log(user)

}

// 删除购物车
exports.del = function(req,res){
	var user = req.session.user
	var cart = req.session.cart
	var id = req.query.id
	if(!user){
		console.log(cart)
		for(var i=0; i<cart.length; i++){
			if(cart[i].pid == id){
				req.session.cart.splice(i, 1)
				return res.json({success:1,cart_goods_num:cart.length})
			}
		}

		return res.json({success:0})
	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)
			if(shopcart){

				for(var i=0; i<shopcart.products.length; i++){
					// 查找购物车里对应的product id,并删除
					if(shopcart.products[i].pid==id){
						shopcart.products.splice(i,1)
						break
					}
				}

				// 删除usersession里面的shopcartgoods
				var index = user.shopcartgoods.indexOf(id)
				user.shopcartgoods.splice(index, 1)

				shopcart.save(function(err){
					if(err) console.log(err)
					// user.shopcartnum = shopcart.products.length
					// User.findByIdAndUpdate(user.id, {$inc:{shopcartnum:-1}}, function(err){
					// 	if(err) console.log(err)
					// })
					res.json({success:1,cart_goods_num:shopcart.products.length})
				})
			}else{
				res.json({success:0})
			}
		})
	}
}

// 比对购物车
exports.matchcart = function(req, res){
	var s_shopcart = req.session.cart
	var user = req.session.user

	// if(!s_shopcart || s_shopcart.length == 0) return false

	Shopcart
		.findOne({'uid':user._id})
		// .populate({
		// 	path: 'products.pid',
		// 	model: 'Product',
		// 	populate: {
		// 		path: 'category',
		// 		select: 'name',
		// 		model: 'Category'
		// 	}
		// })
		.exec(function(err, shopcart){
			if(err) console.log(err)
			if(!shopcart){
				console.log('新增并合并缓存数据')
				var newShopcart = new Shopcart({"uid":user._id,"pid":[]})
				// newShopcart = _.extend(newShopcart, s_shopcart)

				if(s_shopcart  && s_shopcart.length > 0){
					for(var i=0; i<s_shopcart.length; i++){
						newShopcart.products.push(s_shopcart[i])
					}
					delete req.session.cart
				}
				newShopcart.save(function(err, _newShopcart){
					if(err) console.log(err)

					user.shopcartgoods = new Object(returnShopcartGoods(_newShopcart))


					console.log('------')
					console.log(returnShopcartGoods(_newShopcart))
					console.log(user.shopcartgoods)
					console.log(user)

					if(req.url.indexOf('signup') > -1){
						res.redirect('/store')
					}else{
						res.json({success:1})
					}
				})
			}else{
				console.log('合并缓存数据')

				var products = shopcart.products

				if(s_shopcart  && s_shopcart.length > 0){
					for(var i=0; i<s_shopcart.length; i++){
						var is_same_id = false
						for(var j=0; j<products.length; j++){
							if(s_shopcart[i].pid==products[j].pid){
								is_same_id = true
								break
							}
						}
						if(!is_same_id){
							products.push(s_shopcart[i])
						}
					}
					// delete req.session.cart
				}
				shopcart.save(function(err, _shopcart){
					if(err) console.log(err)
					user.shopcartgoods = returnShopcartGoods(_shopcart)
					// console.log('-----shopcartnum数量为-------')
					if(req.url.indexOf('signup') > -1){
						res.redirect('/store')
					}else{
						res.json({success:1})
					}
				})

			}
			// 获取所有购物车的商品ID
			function returnShopcartGoods(obj){
				var shopcartgoods = []
				if(obj && obj.products.length > 0){
					for(var i=0; i < obj.products.length; i++){
						shopcartgoods.push(obj.products[i].pid)
					}
				}
				return shopcartgoods
			}

		})
}