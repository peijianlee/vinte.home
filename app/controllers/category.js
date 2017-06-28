
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

	console.log(categoryObj)
	// return false

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

//fetch all category type
exports.fetchAllCategoryType = function(req, res, next){
	// var sort=req.params.sort
	Category.find({type: 'product'}, function(err, categories){
		req.session.allCategoryType = [
			{name:'scene', cid:[]},
			{name:'sort', cid:[]},
			{name:'material', cid:[]},
			{name:'color', cid:[]}
		]
		// 对产品类目进行分类
		for(var i=0; i < categories.length; i++){
			var that = categories[i]
			var cid = {
				id: that.id,
				attributes: that.attributes
			}
			// console.log('属性类型：'+that.name+':'+cid.attributes.zh_cn)
			
			if(that.name === "scene"){
				req.session.allCategoryType[0].cid.push(cid)
			}else if(that.name === "sort"){
				req.session.allCategoryType[1].cid.push(cid)
			}else if(that.name === "material"){
				req.session.allCategoryType[2].cid.push(cid)
			}else if(that.name === "color"){
				req.session.allCategoryType[3].cid.push(cid)
			}
		}
	})
	next()
}

// 当前分类链接状态
exports.categoryTypeHref = function(req, res, next){
	var q = req.query.q,
		g_sort=req.query.sort,
		g_scene=req.query.scene,
		g_material=req.query.material,
		g_color=req.query.color

	function Person(sort, scene, material, color){
		req.query.q? this.title = new RegExp(req.query.q+'.*','i') : false
		sort? this.sort = sort : false
		scene? this.scene = scene : false
		material? this.material = material : false
		color? this.color = color : false
	}

	if(g_sort && g_scene && g_material && g_color){
		req.session.searchObj = new Person(g_sort, g_scene,g_material, g_color)
		var href = "?sort="+g_sort+"&scene="+g_scene+"material="+g_material+"&color="+g_color
	}else if(g_sort && g_scene && g_material){
		req.session.searchObj = new Person(g_sort, g_scene, g_material, null)
		var href = "?sort="+g_sort+"&scene="+g_scene+"material="+g_material
	}else if(g_sort && g_scene && g_color){
		req.session.searchObj = new Person(g_sort, g_scene, null, g_color)
		var href = "?sort="+g_sort+"&scene="+g_scene+"&color="+g_color
	}else if(g_sort && g_material && g_color){
		req.session.searchObj = new Person(g_sort, null, g_material, g_color)
		var href = "?sort="+g_sort+"material="+g_material+"&color="+g_color
	}else if(g_scene && g_material && g_color){
		req.session.searchObj = new Person(null, g_scene, g_material, g_color)
		var href = "&scene="+g_scene+"material="+g_material+"&color="+g_color
	}else if(g_sort && g_scene){
		req.session.searchObj = new Person(g_sort, g_scene, null, null)
		var href = "?sort="+g_sort+"&scene="+g_scene
	}else if(g_sort && g_material){
		req.session.searchObj = new Person(g_sort, null, g_material, null)
		var href = "?sort="+g_sort+"material="+g_material
	}else if(g_sort && g_color){
		req.session.searchObj = new Person(g_sort,null,null,g_color)
		var href = "?sort="+g_sort+"&color="+g_color
	}else if(g_material && g_color){
		req.session.searchObj = new Person(null, null, g_material, g_color)
		var href = "?material="+g_material+"&color="+g_color
	}else if(g_scene && g_color){
		req.session.searchObj = new Person(null,g_scene,null,g_color)
		var href = "?scene="+g_scene+"&color="+g_color
	}else if(g_scene && g_material){
		req.session.searchObj = new Person(null,g_scene,g_material,null)
		var href = "?scene="+g_scene+"material="+g_material
	}else if(g_sort){
		req.session.searchObj = new Person(g_sort,null,null,null)
		var href = "?sort="+g_sort
	}else if(g_scene){
		req.session.searchObj = new Person(null,g_scene,null,null)
		var href = "?scene="+g_scene
	}else if(g_material){
		req.session.searchObj = new Person(null,null,g_material,null)
		var href = "?material="+g_material
	}else if(g_color){
		req.session.searchObj = new Person(null,null,null,g_color)
		var href = "?color="+g_color
	}else{
		req.session.searchObj = new Person(null,null,null,null)
	}

	

	next()
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

			var categories_sort = [],
				categories_scene = [],
				categories_material = [],
				categories_color = []

			// 对产品类目进行分类
			if(categories_type === "product"){
				for(var i=0; i < categories.length; i++){
					var that = categories[i]
					if(that.name === "sort"){
						categories_sort.push(that)
					}else if(that.name === "scene"){
						categories_scene.push(that)
					}else if(that.name === "material"){
						categories_material.push(that)
					}else if(that.name === "color"){
						categories_color.push(that)
					}
				}
			}

			res.render('admin/category_list',{
				title: title,
				categories:categories,
				categories_sort: categories_sort,
				categories_scene: categories_scene,
				categories_material: categories_material,
				categories_color: categories_color,
				categories_type: categories_type
			})
		})
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