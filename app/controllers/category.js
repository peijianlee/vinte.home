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

// category update page
// exports.update = function(req,res){
// 	var id = req.params.id

// 	if(id){
// 		Category.findById(id,function(err,categories){
// 			res.render('admin/category_add',{
// 				title: 'nodeJS 分类名称修改',
// 				category: categories
// 			})
// 		})
// 	}
// }


//category list page
exports.list = function(req,res){
	// var href=req._parsedOriginalUrl.href,
	// 	title,categories_type
	// if(href.indexOf('movie')>0){
	// 	title = '电影分类列表页'
	// 	categories_type = 'movie'
	// }else if(href.indexOf('news')>0){
	// 	title = '文章分类列表页'
	// 	categories_type = 'news'
	// }else if(href.indexOf('goods')>0){
	// 	title = '产品分类列表页'
	// 	categories_type = 'goods'
	// }
	
	// Category.findOne({"name":"jieJueZuoYongYu"},function(err){
	// 	if(err) console.log(err)
	// 	res.render('admin/category/list',{
	// 		title: title,
	// 		allCategoryType: req.session.allCategoryType
	// 	})
	// })

	// 	[ { name: { zh_cn: '风格', en_us: 'pstyle' },
	// 	cid: [ [Object], [Object], [Object] ] },
	//   { name: { zh_cn: '场景', en_us: 'scene' },
	// 	cid: [ [Object], [Object], [Object], [Object] ] },
	//   { name: { zh_cn: '类型', en_us: 'sort' }, cid: [ [Object] ] },
	//   { name: { zh_cn: '材质', en_us: 'material' },
	// 	cid: [ [Object], [Object] ] },
	//   { name: { zh_cn: '颜色', en_us: 'color' }, cid: [] } ]

	// ["pstyle", "scene", "sort", "material", "color"]

	var baseCategory = {
		pstyle: {
			name: {zh_cn: '风格', en_us: 'pstyle'},
			cid: []
		},
		scene: {
			name: {zh_cn: '场景', en_us: 'scene'},
			cid: []
		},
		sort: {
			name: {zh_cn: '类型', en_us: 'sort'},
			cid: []
		},
		material: {
			name: {zh_cn: '材质', en_us: 'material'},
			cid: []
		},
		color: {
			name: {zh_cn: '颜色', en_us: 'color'},
			cid: []
		}
	}

	Category.aggregate([{
			'$group': {
				_id: '$name', 
				cid: {$push: '$$ROOT'}
			}
		}], function(err, category){
			if(err) console.log(err)
			// 获取所有的分类类型分组，并将 baseCategory 赋值
			category.forEach(function(item){
				baseCategory[item._id].cid = item.cid
			})
			// baseCategory 对象转为数组
			var allCategoryType = []
			Object.keys(baseCategory).forEach(function(key, index){
				allCategoryType[index] = baseCategory[key]
			})
			res.render('admin/category/list',{
				title: '产品分类列表页',
				allCategoryType: allCategoryType
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