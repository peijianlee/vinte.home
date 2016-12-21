
var Category = require('../models/category')

//category new page
exports.new = function(req,res){
	res.render('category_add',{
		title:'nodeJS 分类录入页',
		category:{}
	})
}

//category post page
exports.save = function(req,res){
	var _category=req.body.category
	var	category = new Category(_category)

	category.save(function(err,category){
		if(err)console.log(err)

		res.redirect('/admin/category/list')
	})
}

//category list page
exports.list = function(req,res){
	Category.fetch(function(err,categories){
		if(err)console.log(err)

		res.render('category_list', {
			title: 'imooc 分类列表页',
			categories: categories
		})
	})
}


//list delete movie
exports.del = function(req,res){
	var id = req.query.id
	if(id){
		Movie.remove({_id: id},function(err,movie){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}