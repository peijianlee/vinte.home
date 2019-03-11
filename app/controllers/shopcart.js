var Shopcart = require('../models/shopcart')
var Goods = require('../models/goods')
var User = require('../models/user')
var Inquiry = require('../models/inquiry')
var _ = require('underscore')


// 购物清单
exports.detail = function(req,res){
	var user = req.session.user

	if(!user){
		var cart = req.session.cart
		if(!cart) req.session.cart = []
		// 非常愚蠢的循环出来又循环进去
		var session_cart = cart,
			session_gid = [],
			session_quantity = []
		
		console.log('用户不存在的情况下')
		console.log(user)
		
		if(session_cart && session_cart.length > 0){
			for(var i = 0; i < session_cart.length; i++){
				session_gid.push(session_cart[i].pid)
				session_quantity.push(session_cart[i].quantity)
			}
		}

		Goods
			.find({_id:{$in:session_gid}})
			.populate('sort color material scene','attributes')
			.exec(function (err,goods){
				if(err) console.log(err)

				// 非常愚蠢的循环出来又循环进去
				var productsObj = []
				for(var i=0; i < session_quantity.length; i++){
					var p_obj = {
						'quantity':session_quantity[i],
						'pid': goods[i]
					}
					productsObj.push(p_obj)
				}
				res.render('index/inquiry/',{
					title: '询价单',
					goods: productsObj,
					captcha: req.session.captcha,
					cart_goods: goods
				})
			})
	}else{
		// populate多层查找
		Shopcart
			.findOne({'uid':user._id})
			.populate({
				path: 'goods.pid',
				model: 'Goods',
				populate: {
					path: 'sort color material scene',
					select: 'attributes',
					model: 'Category'
				}
			})
			.exec(function (err, shopcart){
				if(err) console.log(err)
				if(shopcart){
					var goods = shopcart.goods
				}else{
					var goods = []
				}
				res.render('index/inquiry/index',{
					title: '询价单',
					goods: goods,
					cart_goods: goods
				})

			})
	}
}

// 创建购物清单及填写个人信息
exports.createInquiryInfo = function(req, res){
	var inquiryObj = req.query.inquiry.pid

	Goods
		.find({_id: {$in: inquiryObj}})
		.populate('sort color material scene','attributes')
		.exec(function(err, goods){
			res.render('index/inquiry/create',{
				title: '创建询价单',
				goods: goods,
				cart_goods: req.session.user.shopcartgoods
			})

		})
}
// 创建订单
exports.createInquirySuccess = function(req, res){
	var inquiryInfo = req.body.inquiry

	Goods
		.find({_id: {$in: inquiryInfo.goods.id}})
		.exec(function(err, goods){
			// console.log(goods)
			if(goods && goods.length > 0){
				var inquiryObj = {
					uid: inquiryInfo.uid,
					from: inquiryInfo.from,
					goods:[]
				}
				for(var i=0; i<goods.length; i++){
					var productObj = {
						'_id': goods[i].id,
						'title': goods[i].title,
						'cover': goods[i].cover,
						'price': goods[i].price,
						'size': goods[i].size,
						'sale': goods[i].sale,
						'color': goods[i].color,
						'material': goods[i].material,
						'scene': goods[i].scene,
						'quantity': inquiryInfo.goods.quantity[i],
						'fromprice': inquiryInfo.goods.fromprice[i]
					}
					inquiryObj.goods.push(productObj)
				}
				var _inquiryObj = new Inquiry(inquiryObj)
				_inquiryObj.save(function(err, inquiry){
					if(err) console.log(err)
					// req.session.user.inquiry.id = inquiry.id
					// req.session.user.inquiry.data = inquiry.meta.createAt
					// req.session.user.inquiry = {
					// 	id: inquiry.id,
					// 	data: inquiry.meta.createAt
					// }
					// res.redirect('inquiry/success')
					res.render('index/inquiry/create_success',{
						title: '询价单创建成功',
						inquiry: {
							id: inquiry.id,
							data: inquiry.meta.createAt
						},
						cart_goods: req.session.user.shopcartgoods
					})
				})
			}
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
			for(var i=0; i<shopcart.goods.length; i++){
				if(shopcart.goods[i].pid.toString() === pid.toString()){
					check_same_id = true
					break
				}
			}
			if(check_same_id) return res.json({success:1})


			shopcart.goods.push(cartinfo)
			shopcart.save(function(err, _shopcart){
				console.log(err)
				user.shopcartgoods.push(pid)
				
				// User.findByIdAndUpdate(user.id, {$set:{shopcartgoods:1}}, function(err){
				// 	if(err) console.log(err)
				// })
				return res.json({success:2,cart_goods_num:_shopcart.goods.length})
			})

		})

	}

}

// 删除购物车
exports.del = function(req,res){
	var user = req.session.user,
		id = req.query.id,
		pid = req.body.pid
	// console.log(pid)
	// console.log(typeof pid)
	if(!user){
		var cart = req.session.cart
		// console.log('未登录')
		// console.log(typeof cart[0].pid)
		// console.log(cart[0].pid)
		var diff_cart = diff(pid, cart)
		return res.json({success:1, cart_goods_num:diff_cart.length})

	} else {
		Shopcart.findOne({'uid':user._id}, function (err,shopcart){
			if(err) console.log(err)
			// console.log('登录')
			// console.log(typeof shopcart.goods[0].pid)
			// console.log(shopcart.goods[0].pid)
			var diff_cart = diff(pid, shopcart.goods, user.shopcartgoods)
			shopcart.goods = diff_cart
			shopcart.save(function (err){
				if(err) console.log(err)
				return res.json({success:1, cart_goods_num:diff_cart.length})
			})
		})
	}
	function diff(pid_arr, cart_arr, u_cart) {
		if(typeof pid_arr === 'object'){
			for (var i in pid_arr) {
				for(var j in cart_arr){
					if(cart_arr[j].pid + '' === pid_arr[i] + ''){
						cart_arr.splice(j, 1)
						u_cart && EditUCart(pid_arr[i])
					}
				}
			}
		} else {
			for(var i in cart_arr){
				if(cart_arr[i].pid + '' === pid_arr + ''){
					cart_arr.splice(i, 1)
					u_cart && EditUCart(pid_arr)
				}
			}
		}
		function EditUCart(pid) {
			// 删除usersession里面的shopcartgoods
			var index = u_cart.indexOf(pid)
			u_cart.splice(index, 1)
		}
		return cart_arr
		// return res.json({success:1,cart_goods_num:cart_arr.length})
	}
}

// 比对购物车
exports.matchcart = function(req, res){
	var s_shopcart = req.session.cart
	var user = req.session.user

	Shopcart
		.findOne({'uid':user._id})
		.exec(function(err, shopcart){
			if(err) console.log(err)
			if(!shopcart){
				console.log('新增并合并缓存数据')
				var newShopcart = new Shopcart({"uid":user._id,"pid":[]})
				// newShopcart = _.extend(newShopcart, s_shopcart)

				if(s_shopcart  && s_shopcart.length > 0){
					for(var i=0; i<s_shopcart.length; i++){
						newShopcart.goods.push(s_shopcart[i])
					}
					delete req.session.cart
				}
				newShopcart.save(function(err, _newShopcart){
					if(err) console.log(err)

					user.shopcartgoods = new Object(returnShopcartGoods(_newShopcart))
					res.json({success:1})
				})
			}else{
				console.log('合并缓存数据')

				var goods = shopcart.goods

				if(s_shopcart  && s_shopcart.length > 0){
					for(var i=0; i<s_shopcart.length; i++){
						var is_same_id = false
						for(var j=0; j<goods.length; j++){
							if(s_shopcart[i].pid==goods[j].pid){
								is_same_id = true
								break
							}
						}
						if(!is_same_id){
							goods.push(s_shopcart[i])
						}
					}
					// delete req.session.cart
				}
				shopcart.save(function(err, _shopcart){
					if(err) console.log(err)
					user.shopcartgoods = returnShopcartGoods(_shopcart)
					res.json({success:1})
				})

			}
			// 获取所有购物车的商品ID
			function returnShopcartGoods(obj){
				var shopcartgoods = []
				if(obj && obj.goods.length > 0){
					for(var i=0; i < obj.goods.length; i++){
						shopcartgoods.push(obj.goods[i].pid)
					}
				}
				return shopcartgoods
			}

		})
}