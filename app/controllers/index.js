
var Movie = require('../models/movie')
var Category = require('../models/category')
var Banner = require('../models/banner')
var Product = require('../models/product')
var Message = require('../models/message')
var User = require('../models/user')


//index page
exports.index = function(req,res){
	var user = req.session.user
	var cart = req.session.cart
	var id=req.params.id

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
	var catId = req.query.cat
	var page = parseInt(req.query.p,8) || 0 
	var count = 8
	var index = page*count
	var user = req.session.user
	var cart = req.session.cart


	if(user){
		var cartGoods = user.shopcartgoods
		var cartGoodsNum = user.shopcartgoods.length
	}else{
		var cartGoods = []
		var cartGoodsNum = 0
		if(cart && cart.length > 0){
			var cartGoodsNum = cart.length
			for(var i=0; i < cartGoodsNum; i++){
				cartGoods.push(cart[i].pid)
			}
		}
	}

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
			var _keyword = req.query.q,
				_searchObj = req.session.searchObj,
				_url_key = '',
				_sort = ['sort', 'scene', 'material', 'color']
			// 获取页面的当前属性
			for(var i=0; i < _sort.length; i++){
				var attr_key = _sort[i]
				var attr_value = _searchObj[''+attr_key+'']
				if(attr_value){
					_url_key += '&'+attr_key+'='+ attr_value
				}
			}


			Product
				.find(_searchObj)
				.populate({
					path: 'sort color material scene',
					select: 'name attributes',
					model: 'Category'
				})
				.exec(function(err, products){
					if(err)console.log(err)

					var results = products.slice(index, index + count)

					res.render('results',{
						title:'搜索结果页',
						keyword: _keyword,
						products_total: products.length,
						currentPage: (page + 1),
						totalPage: Math.ceil(products.length / count),
						products: results,
						allCategoryType: req.session.allCategoryType,
						href: req._parsedUrl.search,
						url_pathname: req._parsedUrl.pathname,
						url_key: _url_key,
						cart_goods: cartGoods,
						cart_goods_num: cartGoodsNum
					})

				})
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