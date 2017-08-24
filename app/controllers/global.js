
var Category = require('../models/category')

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
	// var g_sort=req.query.sort,
	// 	g_scene=req.query.scene,
	// 	g_material=req.query.material,
	// 	g_color=req.query.color

	// function Person(sort, scene, material, color){
	// 	req.query.q? this.title = new RegExp(req.query.q+'.*','i') : false
	// 	sort? this.sort = sort : false
	// 	scene? this.scene = scene : false
	// 	material? this.material = material : false
	// 	color? this.color = color : false
	// }


	// if(g_sort && g_scene && g_material && g_color){
	// 	req.session.searchObj = new Person(g_sort, g_scene,g_material, g_color)
	// 	var href = "?sort="+g_sort+"&scene="+g_scene+"material="+g_material+"&color="+g_color
	// }else if(g_sort && g_scene && g_material){
	// 	req.session.searchObj = new Person(g_sort, g_scene, g_material, null)
	// 	var href = "?sort="+g_sort+"&scene="+g_scene+"material="+g_material
	// }else if(g_sort && g_scene && g_color){
	// 	req.session.searchObj = new Person(g_sort, g_scene, null, g_color)
	// 	var href = "?sort="+g_sort+"&scene="+g_scene+"&color="+g_color
	// }else if(g_sort && g_material && g_color){
	// 	req.session.searchObj = new Person(g_sort, null, g_material, g_color)
	// 	var href = "?sort="+g_sort+"material="+g_material+"&color="+g_color
	// }else if(g_scene && g_material && g_color){
	// 	req.session.searchObj = new Person(null, g_scene, g_material, g_color)
	// 	var href = "&scene="+g_scene+"material="+g_material+"&color="+g_color
	// }else if(g_sort && g_scene){
	// 	req.session.searchObj = new Person(g_sort, g_scene, null, null)
	// 	var href = "?sort="+g_sort+"&scene="+g_scene
	// }else if(g_sort && g_material){
	// 	req.session.searchObj = new Person(g_sort, null, g_material, null)
	// 	var href = "?sort="+g_sort+"material="+g_material
	// }else if(g_sort && g_color){
	// 	req.session.searchObj = new Person(g_sort,null,null,g_color)
	// 	var href = "?sort="+g_sort+"&color="+g_color
	// }else if(g_material && g_color){
	// 	req.session.searchObj = new Person(null, null, g_material, g_color)
	// 	var href = "?material="+g_material+"&color="+g_color
	// }else if(g_scene && g_color){
	// 	req.session.searchObj = new Person(null,g_scene,null,g_color)
	// 	var href = "?scene="+g_scene+"&color="+g_color
	// }else if(g_scene && g_material){
	// 	req.session.searchObj = new Person(null,g_scene,g_material,null)
	// 	var href = "?scene="+g_scene+"material="+g_material
	// }else if(g_sort){
	// 	req.session.searchObj = new Person(g_sort,null,null,null)
	// 	var href = "?sort="+g_sort
	// }else if(g_scene){
	// 	req.session.searchObj = new Person(null,g_scene,null,null)
	// 	var href = "?scene="+g_scene
	// }else if(g_material){
	// 	req.session.searchObj = new Person(null,null,g_material,null)
	// 	var href = "?material="+g_material
	// }else if(g_color){
	// 	req.session.searchObj = new Person(null,null,null,g_color)
	// 	var href = "?color="+g_color
	// }else{
	// 	req.session.searchObj = new Person(null,null,null,null)
	// }

	
	var product_attributes_url = ''
	var product_attributes = {
		'sort': req.query.sort,
		'scene': req.query.scene,
		'material': req.query.material,
		'color': req.query.color
	}
	for(item in product_attributes){
		if(!product_attributes[item]){
			delete product_attributes[item]
		}else{
			product_attributes_url += '&' + item + '=' + product_attributes[item]
		}
	}
	req.session.product_attributes = product_attributes
	req.session.product_attributes_url = product_attributes_url

	next()
}