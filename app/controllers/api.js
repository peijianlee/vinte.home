var Goods = require('../models/goods')
var Category = require('../models/category')
var Shopcart = require('../models/shopcart')

var c_type = 'application/json;charset=utf-8'

exports.products = function(req,res){
	// var _callback = req.query.callback
	Goods.find({})
		// .populate('attributes.color attributes.material attributes.scene attributes.sort', 'attributes')
		.populate({
			path: 'attributes.scene attributes.material attributes.color',
			select: 'attributes',
			model: 'Category'
		})
		.exec(function(err, products){
			if(err) console.log(err)
			var data = {
				// 'start': 0,
				// 'count': 10,
				'total': products.length,
				'targets': products
			}
			CallbackData(req.query.callback, res, data)
		})
}

exports.product = function(req,res){
	var id = req.params.id
	Goods
		.findOne({'_id':id})
		.populate('color material scene sort', 'attributes')
		.exec(function(err, product){
			if(err) console.log(err)
			
			// res.writeHead(200, {'Content-type' : c_type})
			// res.end(JSON.stringify(product))
			CallbackData(req.query.callback, res, product)
		})
}

exports.categories = function(req, res){
	Category
		.find({})
		.exec(function(err, categories){
			if(err) console.log(err)
			// res.writeHead(200, {'Content-type': c_type})
			// res.end(JSON.stringify(categories))
			CallbackData(req.query.callback, res, categories)
		})
}

exports.sort = function(req, res){
	var sort = req.params.sort
	Category
		.find({'attributes.zh_cn': sort})
		.populate({
			path: 'pid',
			model: 'Goods',
			populate: {
				path: 'sort scene material color',
				select: 'attributes',
				model: 'Category'
			}
		})
		.exec(function(err, categories){
			if(err) console.log(err)
			// res.writeHead(200, {'Content-type': c_type})
			// res.end(JSON.stringify(categories))
			CallbackData(req.query.callback, res, categories)
		})
}


function CallbackData(_callback, res, data){
	if(_callback){
		res.type('text/javascript')
		res.send(_callback + '('+JSON.stringify(data)+')')
	}else{
		res.json(data)
	}
}


exports.addShoppingCart = function (req, res) {
	var user = req.session.user,
		cartinfo = req.body,
		pid = cartinfo.pid,
		cart_goods_num = 0


	console.log(req.session.cart)

	if(!user){
		// 如果用户不存在新建个临时购物表
		if(!req.session.cart) req.session.cart = []
		EditCart (
			req.session.cart,
			user
		)
	}else{
		Shopcart.findOne({'uid':user._id},function(err,shopcart){
			if(err) console.log(err)
			EditCart (
				shopcart,
				user
			)
		})

	}

	function EditCart (ShopCart, isUser) {
		var check_same_pid = false,
			ShopCartArr = isUser ?  ShopCart.goods : ShopCart

		if (ShopCartArr.length > 0) {
			// 判断下面临时购物车下是否有重复
			for(var i in ShopCartArr) {
				if(ShopCartArr[i].pid + '' === pid + ''){
					check_same_pid = true
					break
				}
			}
		}
		if(check_same_pid) {return res.json({success:1})}

		
		if(!isUser) {
			ShopCartArr.push(cartinfo)
			return res.json({
				success:2,
				cart_goods_num:ShopCartArr.length
			})
		} else {
			ShopCartArr.push(cartinfo)
			ShopCart.save(function(err, _shopcart){
				if(err) console.log(err)
				// console.log(user.shopcartgoods)
				// console.log(pid)
				// console.log(user.shopcartgoods.indexOf(pid))
				// console.log(user.shopcartgoods.indexOf(pid) > -1)
				if(user.shopcartgoods.indexOf(pid) > -1) user.shopcartgoods.push(pid)
				
				return res.json({
					success:2,
					cart_goods_num:_shopcart.goods.length
				})
			})
		}
	}
}