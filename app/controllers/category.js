var Category = require('../models/category')
var _ = require('underscore')

//category new page
// exports.new = function(req,res){
// 	res.render('admin/category_add',{
// 		title:'电影分类录入页',
// 		category:{},
// 		category_type:'news'
// 	})
// }

//category post page
exports.save = function(req,res){
	var categoryObj=req.body.category,
		attributes = categoryObj.attributes,
		type = categoryObj.type,
		name = categoryObj.name,
		id = categoryObj._id

	console.log('---attributes----')
	console.log(attributes)
	console.log(type)
	console.log(name)
	console.log(id)
	console.log('---attributes----')

	Category.findOne({"name":name,"attributes":attributes},function(err,category){
		if(err) console.log(err)
		if(!category){
			if(!id){
				var newcategory = new Category(categoryObj)
				newcategory.save(function(err){
					if(err) console.log(err)
					console.log("新增成功")
					res.redirect('/admin/'+type+'/category/list')
				})
			}else{
				Category.findByIdAndUpdate(id,{"attributes":attributes},function(err){
					if(err) console.log(err)
					console.log("更新成功")
					res.redirect('/admin/'+type+'/category/list')
				})
			}
		}else{
			console.log("已经存在了")
			res.redirect('/admin/'+type+'/category/list')
		}
		
	})

}

//category list page
var {GetCategoryArray} = require('../utils/global')
exports.list = function(req,res){
	Category.aggregate([{
			'$group': {
				_id: '$name', 
				cid: {$push: '$$ROOT'}
			}
		}], function(err, category){
			if(err) console.log(err)
			res.render('admin/category/list',{
				title: '产品分类列表页',
				allCategoryType: GetCategoryArray(category)
			})
		})
}


//list delete category
exports.del = function(req,res){
	var id = req.query.id
	
	if(!id) return res.json({success:0})

	Category.findByIdAndRemove(id, function(err){
		if(err){
			console.log(err)
			res.json({success:0})
		}else{
			res.json({success:1})
		}
	})
}