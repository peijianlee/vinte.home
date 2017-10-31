
var Category = require('../models/category')

//fetch all category type
exports.fetchAllCategoryType = function(req, res, next){
	function MatchUrl (url) {
		var url_pathname = req._parsedUrl.pathname
		return url_pathname.indexOf(url) > 0
	}
	Category.find({type: 'product'}, function(err, categories){
		var allCategoryType = [],
			type_names
		// 对产品类目进行分类
		if(MatchUrl('store')){
			type_names = ["sort", "scene", "material", "color"]
		}else if(MatchUrl('results')){
			type_names = ["scene", "sort", "material", "color"]
		}else{
			type_names = ["pstyle", "scene", "sort", "material", "color"]
		}
		


		for(n in type_names) {
			var name = {
				'zh_cn': type_names[n] === 'pstyle' ? '风格' : type_names[n] === 'sort' ? '类型' : type_names[n] === 'scene' ? '场景' : type_names[n] === 'material' ? '材质' : '颜色' ,
				'en_us': type_names[n]
			}
			allCategoryType.push( { name:name, cid:[] } )
		}

		for( i in categories ){
			var that = categories[i]
			var cid = {
				id: that.id,
				attributes: that.attributes,
				pid: that.pid
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