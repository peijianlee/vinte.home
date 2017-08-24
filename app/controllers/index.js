
var Movie = require('../models/movie')
var Category = require('../models/category')
var Banner = require('../models/banner')
var Product = require('../models/product')
var Message = require('../models/message')
var User = require('../models/user')


//index page
exports.index = function(req,res){
	var user = req.session.user,
		cart = req.session.cart,
		id=req.params.id

	Category
		.find({type:'product'})
		.sort({_id: 1})
		.exec(function(err, categories){
			if(err)console.log(err)

			var materialCategories = [],
				sceneCategories = [],
				sortCategories = []
			for(i in categories){
				// console.log(categories[i].name)
				var catName = categories[i].name
				if( catName.toString() === 'material' ){
					materialCategories.push(categories[i])
				}else if( catName.toString() === 'scene' ){
					sceneCategories.push(categories[i])
				}else {
					sortCategories.push(categories[i])
				}
			}
			Product
				.find({})
				.limit(8)
				.sort({'pv': -1})
				.populate('color material scene sort','attributes')
				.exec(function(err, recommendProducts){
					if(err)console.log(err)
					res.render('index',{
						materialCategories: materialCategories,
						sceneCategories: sceneCategories,
						sortCategories: sortCategories,
						recommendProducts: recommendProducts,
						cart_goods: CartGoods(user, cart),
						cart_goods_num: CartGoods(user, cart).length
					})
				})
		})
}
// 查找购物车商品数量
function CartGoods(user, cart){
	var cartGoods = []
	if(user){
		cartGoods = user.shopcartgoods
	}else{
		if(cart && cart.length > 0){
			cartGoodsNum = cart.length
			for(var i=0; i < cartGoodsNum; i++){
				cartGoods.push(cart[i].pid)
			}
		}
	}
	return cartGoods
}

//search page
exports.search = function(req,res){
	// .query找到路由上的值
	var user = req.session.user,
		catId = req.query.cat,
		page = parseInt(req.query.p,8) || 0 ,
		count = 2,
		index = page*count,
		cart = req.session.cart

	if(catId){
		// 在分类上找到路由上对应的值
		Category
			.find({_id: catId})
			.populate({
				path: 'movies',
				select: 'title poster'
				// options: {limit:2, skip:index}
			})
			.exec(function(err, categories){
				if(err)console.log(err)

				var category = categories[0] || {}
				var movies = category.movies || []
				// 截取当前电影总数
				var results = movies.slice(index, index + count)

				res.render('porudct_results',{
					title:'电影分类列表页',
					keyword: category.name,
					currentPage: (page + 1),
					query: 'cat='+catId,
					totalPage: Math.ceil(movies.length / count),
					movies: results
				})
			})
	}else{
		// 移至 product.js
	}
}


// 后台首页
exports.admin = function(req, res){
	User.fetch(function(err, users){
		if(err) console.log(err)
		Message.fetch(function(err, messages){
			if(err) console.log(err)
			Product.fetch(function(err, products){
				if(err) console.log(err)
				res.render('admin/index', {
					title: '后台首页',
					users: users,
					messages: messages,
					products: products
				})
			})
		})
	})
}

// 发送留言
exports.message = function(req, res){
	console.log(getClientIp(req))

	var msgObj = req.body
	msgObj["ip"] = getClientIp(req)
	var message = new Message(msgObj)
	message.save(function(err, _message){
		if(err){
			console.log(err)
			res.json({success: 0})
		}else{
			res.json({success: 1})
		}
	})
	

}

function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress
}

// 后台留言列表
exports.messageList = function(req, res){
	Message.fetch(function(err, messages){
		if(err) console.log(err)
		console.log(messages)
		res.render('admin/messages_list',{
			title: "用户留言列表",
			messages: messages
		})
	})
}