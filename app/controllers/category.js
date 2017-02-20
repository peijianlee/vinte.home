
var Category = require('../models/category')
var _ = require('underscore')

//category new page
exports.new = function(req,res){
	res.render('admin/category_add',{
		title:'电影分类录入页',
		category:{},
		category_type:'news'
	})
}

//category post page
exports.save = function(req,res){
	var categoryObj=req.body.category
	var type = categoryObj.type
	var id = categoryObj._id
	var	category = new Category(categoryObj)

	console.log('--------------')
	console.log('--------------')

	if(id){
		// 更新
		Category.findById(id, function(err, _category){
			if(err)console.log(err)

			// 使用underscore模块的extend函数更新电影变化的属性
			_category = _.extend(_category, categoryObj)
			_category.save(function(err,_category){
				if(err)console.log(err)
				res.redirect('/admin/'+type+'/category/list')
			})
		})
	}else{
		// 新增
		category.save(function(err,category){
			if(err)console.log(err)

			res.redirect('/admin/'+type+'/category/list')
		})

	}

}

// category update page
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		Category.findById(id,function(err,categories){
			res.render('admin/category_add',{
				title: 'nodeJS 分类名称修改',
				category: categories
			})
		})
	}
}

//category list page
exports.list = function(req,res){
	var href=req._parsedOriginalUrl.href
	if(href=='/admin/movie/category/list'){
		var title = '电影分类列表页'
		var type = 'movie'
		var categories_type = 'movie'
	}else if(href=='/admin/news/category/list'){
		var title = '文章分类列表页'
		var type = 'news'
		var categories_type = 'news'
	}else if(href=='/admin/product/category/list'){
		var title = '产品分类列表页'
		var type = 'product'
		var categories_type = 'product'
	}
	Category
		.find({type:type})
		.exec(function(err, categories){
			if(err)console.log(err)
			res.render('admin/category_list',{
				title: title,
				categories: categories,
				categories_type: categories_type
			})
		})
}


//list delete category
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		Category.remove({_id: id},function(err,categories){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}