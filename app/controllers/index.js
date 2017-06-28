
var Movie = require('../models/movie')
var Category = require('../models/category')
var Banner = require('../models/banner')
var Product = require('../models/product')


//index page
exports.index = function(req,res){
	Category
		.find({}).sort({_id: 1})
		.populate({
			path: 'movies',
			options: {limit:6}
		})
		.exec(function(err, categories){
			if(err)console.log(err)

			Banner.fetch(function(err,banners){
				if(err)console.log(err)
				res.render('index',{
					title:'nodeJS 首页',
					categories: categories,
					banners: banners
				})
			})
		})
}

//search page
exports.search = function(req,res){
	// .query找到路由上的值
	var catId = req.query.cat
	var page = parseInt(req.query.p,4) || 0 
	var count = 4
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
			console.log(_url_key)


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