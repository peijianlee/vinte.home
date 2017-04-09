
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
			console.log(req.query.sort)
			console.log(req.query.scene)
			console.log(req.query.material)
			console.log(req.query.color)

			if(req.query.sort){
				var searchObj = {
					'title': new RegExp(q+'.*','i'),
					'sort': req.query.sort
				}
			}else if(req.query.color){
				var searchObj = {
					'title': new RegExp(q+'.*','i'),
					'color': req.query.color
				}
			}else{
				var searchObj = {
					'title': new RegExp(q+'.*','i')
				}
			}

			Product
				.find(searchObj)
				.populate('sort', 'name attributes')
				.populate('color material scene','attributes')
				.exec(function(err, products){
					if(err)console.log(err)

					// console.log(products)
					var sort_array = []
					var color_array = []
					var material_array = []
					var scene_array = []
					if(products && products.length > 0){
						for(var i=0; i < products.length; i++){
							// 查找商品类型
							var sort = products[i].sort
							var sort_index = sort_array.indexOf(sort)
							if(sort_index === -1){
								sort_array.push(sort)
							}
							// 查找商品颜色
							findAttributes(products[i].color,'color')
							// 查找商品材质
							findAttributes(products[i].material,'material')
							// 查找商品场景
							findAttributes(products[i].scene,'scene')

						}
					}
					function findAttributes(obj,type){
						var attributes = obj
						if(attributes && attributes.length > 0){
							for(var j=0; j < attributes.length; j++){
								var attr = attributes[j]
								switch(type){
									case 'color':
										var	attray = color_array
										break
									case 'material':
										var attray = material_array
										break
									case 'scene':
										var attray = scene_array
										break
									default:
										break
								}
								var	attr_index = attray.indexOf(attr)
								if(attr_index === -1){
									attray.push(attributes[j])
								}
							}
						}
					}
					var attributes_array = [
						{
							'name': 'sort',
							'cnname': '类型',
							'attributes': sort_array
						},
						{
							'name': 'scene',
							'cnname': '场景',
							'attributes': scene_array
						},
						{
							'name': 'material',
							'cnname': '材料',
							'attributes': material_array
						},
						{
							'name': 'color',
							'cnname': '颜色',
							'attributes': color_array
						}
					]

					// console.log(attributes_array)

					var results = products.slice(index, index + count)

					res.render('results',{
						title:'搜索结果页',
						keyword: '搜索到 '+products.length+' 条关键词为 <b class=cRed>" '+q+' "</b> 的商品',
						searchword: q,
						currentPage: (page + 1),
						query: 'q='+q,
						totalPage: Math.ceil(products.length / count),
						products: results,
						attributes: attributes_array,
						sort: req.query.sort,
						scene: req.query.scene,
						material: req.query.material,
						color: req.query.color
					})

				})
		}
}