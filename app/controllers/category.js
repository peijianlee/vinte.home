
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
	var attr_name = categoryObj.attributes.name
	var type = categoryObj.type
	var name = categoryObj.name

	Category.findOne({"name":name},function(err,categories){
		if(err) console.log(err)

		if(!categories){
			// 新增
			var	category = new Category(categoryObj)
			category.save(function(err,category){
				if(err)console.log(err)
				res.redirect('/admin/'+type+'/category/list')
			})
		}else{
			// 查找是否有匹配的属性名
			Category.findOne({"name":name,"attributes.name":attr_name},function(err,catename){
				if(err) console.log(err)

				if(catename){
					res.redirect('/admin/'+type+'/category/list')
				}else{
					// 添加
					var newAttributes = {name: attr_name}
					categories.attributes.push(newAttributes)
					categories.save(function(err){
						if(err) console.log(err)
						res.redirect('/admin/'+type+'/category/list')
					})

				}
			})
		}

	})

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

	if(href.indexOf('movie')>0){
		var title = '电影分类列表页'
		var categories_type = 'movie'
	}else if(href.indexOf('news')>0){
		var title = '文章分类列表页'
		var categories_type = 'news'
	}else if(href.indexOf('product')>0){
		var title = '产品分类列表页'
		var categories_type = 'product'
	}
	Category
		.find({type:categories_type})
		.exec(function(err, categories){
			if(err)console.log(err)

			res.render('admin/category_list',{
				title: title,
				categories:categories,
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