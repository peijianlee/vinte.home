
var Category = require('../models/category')

//fetch all category type
exports.fetchAllCategoryType = function(req, res, next){
	// var sort=req.params.sort
	var url_pathname = req._parsedUrl.pathname
	Category.find({type: 'product'}, function(err, categories){
		var allCategoryType = []
		// 对产品类目进行分类
		if(url_pathname.indexOf('store') > 0){
			var type_names = ["sort", "scene", "material", "color"]
		}else{
			var type_names = ["scene", "sort", "material", "color"]
		}
		
		for(n in type_names) allCategoryType.push( { name:type_names[n], cid:[] } )

		for( i in categories ){
			var that = categories[i]
			var cid = {
				id: that.id,
				attributes: that.attributes
			}
			for( j in type_names ){
				if( that.name === type_names[j] ){
					allCategoryType[j].cid.push(cid)
				}
			}
		}
		req.session.allCategoryType = allCategoryType
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