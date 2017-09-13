
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
	var categoryObj=req.body.category,
		attributes = categoryObj.attributes,
		type = categoryObj.type,
		name = categoryObj.name,
		id = categoryObj._id

	Category.findOne({"name":name,"attributes":attributes},function(err,category){
		if(err) console.log(err)
		if(!category){
			if(!id){
				var newcategory = new Category(categoryObj)
				newcategory.save(function(err){
					if(err) console.log(err)
					console.log("新增成功")
				})
			}else{
				Category.findByIdAndUpdate(id,{"attributes":attributes},function(err){
					if(err) console.log(err)
					console.log("更新成功")
				})
			}
		}else{
			console.log("已经存在了")
		}
		res.redirect('/admin/'+type+'/category/list')
		
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
	
	Category.findOne({"name":"jieJueZuoYongYu"},function(err,category){
		if(err) console.log(err)
		res.render('admin/category_list',{
			title: title,
			allCategoryType: req.session.allCategoryType
		})
	})
	// Category
	// 	.find({type:categories_type})
	// 	.exec(function(err, categories){
	// 		if(err)console.log(err)

	// 		var categories_sort = [],
	// 			categories_scene = [],
	// 			categories_material = [],
	// 			categories_color = []

	// 		// 对产品类目进行分类
	// 		if(categories_type === "product"){
	// 			for(var i=0; i < categories.length; i++){
	// 				var that = categories[i]
	// 				if(that.name === "sort"){
	// 					categories_sort.push(that)
	// 				}else if(that.name === "scene"){
	// 					categories_scene.push(that)
	// 				}else if(that.name === "material"){
	// 					categories_material.push(that)
	// 				}else if(that.name === "color"){
	// 					categories_color.push(that)
	// 				}
	// 			}
	// 		}

	// 		res.render('admin/category_list',{
	// 			title: title,
	// 			categories:categories,
	// 			categories_sort: categories_sort,
	// 			categories_scene: categories_scene,
	// 			categories_material: categories_material,
	// 			categories_color: categories_color,
	// 			categories_type: categories_type
	// 		})
	// 	})
}


//list delete category
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		Category.findByIdAndRemove(id, function(err){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}