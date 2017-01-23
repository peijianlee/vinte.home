
var Newscategory = require('../models/news_category')
var _ = require('underscore')

//category new page
exports.new = function(req,res){
	res.render('admin/news_category_add',{
		title:'文章分类录入页',
		newscategory:{}
	})
}

// category update page 
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		Newscategory.findById(id,function(err,newscategories){
			res.render('admin/news_category_add',{
				title: '文章分类名称修改',
				newscategory: newscategories
			})
		})
	}
}
exports.updatesave = function(req,res){
	var newsCategoryObj=req.body.newscategory
}

//newsCategory post page
exports.save = function(req,res){
	var newsCategoryObj=req.body.newscategory
	var id = newsCategoryObj._id
	var	newsCategory = new Newscategory(newsCategoryObj)

	console.log('-----------------------')
	console.log(id)
	console.log('-----------------------')

	if(id){
		// 更新
		Newscategory.findById(id, function(err, _newsCategory){
			if(err)console.log(err)

			// 使用underscore模块的extend函数更新电影变化的属性
			_newsCategory = _.extend(_newsCategory, newsCategoryObj)
			_newsCategory.save(function(err,_newsCategory){
				if(err)console.log(err)
				res.redirect('/admin/news/category/list')
			})
		})
	}else{
		// 新增
		newsCategory.save(function(err,newsCategory){
			if(err)console.log(err)

			res.redirect('/admin/news/category/list')
		})

	}

}

//category list page
exports.list = function(req,res){

	Newscategory
		.find({}).sort({_id: -1})
		.exec(function(err, newscategories){
			if(err)console.log(err)

			res.render('admin/news_category_list', {
				title: '文章分类列表页',
				newscategories: newscategories
			})

		})
}

//list delete category
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		Newscategory.remove({_id: id},function(err,newscategories){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}
