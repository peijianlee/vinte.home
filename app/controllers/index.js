
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
	var page = parseInt(req.query.p,10) || 0 
	var q = req.query.q
	var count = 10
	var index = page*count

	console.log(q)

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
			Product
				.find({title: new RegExp(q+'.*','i')})
				.populate('category', 'name')
				.exec(function(err, products){
					if(err)console.log(err)

					// console.log(products)

					var results = products.slice(index, index + count)

					res.render('results',{
						title:'搜索结果页',
						keyword: '搜索到 '+products.length+' 条关键词为 <b class=cRed>" '+q+' "</b> 的商品',
						searchword: q,
						currentPage: (page + 1),
						query: 'q='+q,
						totalPage: Math.ceil(products.length / count),
						products: results
					})

				})
		}
}