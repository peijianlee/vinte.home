var Goods = require('../models/goods')
var Category = require('../models/category')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

// 商品收藏
exports.favourite = function (req, res) {
	if (!req.session.user) return res.json({success: 1})
	var uid = req.session.user._id,
		pid = req.body.pid,
		page = req.body.page
	if (typeof pid === 'object') {
		// 批量移除
		Goods.find({_id: {$in: pid}, 'favourite': uid}, function (err, products) {
			if (err) console.log(err)
			for(item in products){
				var pfavourite = products[item].favourite
					index = pfavourite.indexOf(uid)
				pfavourite.splice(index, 1)
				products[item].save(function (err, product) {
					if (err) console.log(err)
				})
			}
			return res.json({success: 0})
		})
	} else {
		Goods.findOne({'_id': pid}, function (err, product) {
			if (err) console.log(err)
			var	pfavourite = product.favourite,
				index = pfavourite.indexOf(uid),
				info = []
			if (index > -1) {
				pfavourite.splice(index,1)
				info = [0, "取消收藏"]
			} else {
				if(page === 'favourite') return res.json({success: 0}) 
				pfavourite.push(uid)
				info = [1, "收藏成功"]
			}
			Goods.update({'_id': pid}, {'favourite': pfavourite}, function (err) {
				if (err) console.log(err)
				return res.json({success: 0, info: info, num: pfavourite.length})
			})
		})
	}
}

// 商品属性
exports.sort = function(req,res){
	var sort=req.params.sort,
		material=req.params.material,
		user = req.session.user,
		cart = req.session.cart

	if(sort){
		var findObj = {'attributes.zh_cn': sort},
			linkSort = 'sort',
			template = 'product_type',
			title = sort+'分类'

	}else{
		var findObj = {'attributes.zh_cn': material},
			linkSort = 'material',
			template = 'index/goods/material',
			title = material+'材质详情介绍'
	}

	Category.find({type:'goods', name:linkSort},function(err, categories){
		if(err) console.log(err)
		Category
			.findOne(findObj)
			.populate({
				path: 'pid',
				model: 'Goods',
				populate: {
					path: 'scene material color',
					select: 'attributes',
					model: 'Category'
				}
			})
			.exec(function(err, category){
				if(err) console.log(err)

				if(!category){
					console.log('该商品属性不存在或者已经被删除了。')
					return res.render('prompt',{
						message:'该商品属性不存在或者已经被删除了。'
					})
				}

				res.render(template,{
					title: title,
					linkSort: linkSort,
					category: category,
					categories: categories,
					products: category.pid,
					allCategoryType: req.session.allCategoryType,
					// href: req._parsedUrl.search,
					cart_goods: CartGoods(user, cart),
					cart_goods_num: CartGoods(user, cart).length
				})
			})
	})
}
// 商品详情页
exports.detail = function(req,res){
	var id = req.params.id,
		user = req.session.user,
		cart = req.session.cart

	// 添加浏览量
	Goods.update({_id:id},{$inc:{pv:1}},function(err){
		if(err) console.log(err)
	})

	// 浏览过的商品
	if(!req.session.view_goods){
		req.session.view_goods = []
	}

	Category
		.find({type:'goods', name: 'sort'})
		.sort({_id: -1})
		.populate('pid', 'title id')
		.exec(function(err, categories){
			if(err)console.log(err)
			Goods
				.findOne({'_id':id})
				.populate('attributes.color attributes.material attributes.scene attributes.sort','attributes')
				.exec(function(err, _goods){
					if(err) console.log(err)
					if(!_goods){
						console.log('该商品不存在或者已经被删除了。')
						return res.render('prompt',{
							message:'该商品不存在或者已经被删除了。'
						})
					}
					// delete req.session.view_goods
					var view_goods = req.session.view_goods
					if(view_goods.indexOf(id) > -1){
						view_goods.splice(view_goods.indexOf(id), 1)
					}else{
						
					}
					view_goods.unshift(id)
					// 找到当前的id在缓存的位置
					var index = view_goods.indexOf(id)

					// 新建并合并新数组，并删除当前的id,并查找
					var new_view_product = []
					var find_view_goods = new_view_product.concat(view_goods)
					find_view_goods.splice(index,1)
					var v_p_num = 4
					if( find_view_goods.length > v_p_num ){
						find_view_goods = find_view_goods.slice(0, v_p_num)
					}
					

					Goods
						.find({_id:{$in:find_view_goods}})
						.populate('attributes.color attributes.material','attributes')
						.exec(function(err, find_view_goods){
							if(err) console.log(err)
							res.render('index/goods/detail',{
								title: _goods.title,
								categories: categories,
								goods: _goods,
								find_view_goods: find_view_goods,
								cart_goods: CartGoods(user, cart),
								cart_goods_num: CartGoods(user, cart).length
							})
						})
				})
		})
}


//search page
exports.search = function(req,res){
	var user = req.session.user,
		pageNum = parseInt(req.query.p) || 0 ,
		LIMIT = 12,
		SKIP = pageNum*LIMIT,
		cart = req.session.cart,
		q = req.query.q,
		goods_attributes = {}


	// 将URL参数转为对象
	var URL_REQUEST = {},
		URL_QUERY = req._parsedUrl.query,
		GET_URL_HREF = ''
	if(URL_QUERY !== null){
		var	URL = req._parsedUrl.query.split("&")
		for (var i = 0; i < URL.length; i++) {
			　　var url = URL[i].split("=")
				if(url[0] !== 'p'){
					// 对象，获取当前已经选中的商品属性
					URL_REQUEST[url[0]] = url[1]
					// 字符串，获取当前的url地址，不包含“p=”
					GET_URL_HREF += '&'+url[0] + '=' + url[1]
					
					if(url[0] !== 'q'){
						//字符串，获取数据库要查找的商品属性ID
						goods_attributes['attributes.'+url[0]] = url[1]
					}
				}
		}
	}

	// 是否是搜索页面
	if( typeof(q) === 'string' ){
		goods_attributes.title = new RegExp( q+'.*','i' )
		var tp_page = 'index/goods/results'
		var tp_title = '搜索结果页'
	} else {
		var tp_page = 'index/goods/store'
		var tp_title = JSON.stringify(req.query) === '{}'? '所有商品' : '类型选择 - 所有商品'
	}
	

	Category.aggregate([{
		'$group': {
			_id: '$name', 
			cid: {$push: '$$ROOT'}
		}
	}], function(err, _categories){
		Goods.find(goods_attributes).count().exec(function(err, GOODS_TOTAL){
			console.log('GOODS_TOTAL：' + GOODS_TOTAL)
			Goods
				.find(goods_attributes)
				.sort({_id: -1})
				.skip(SKIP)
				.limit(LIMIT)
				.populate({
					path: 'attributes.sort attributes.color attributes.material attributes.scene',
					select: 'name attributes',
					model: 'Category'
				})
				.exec(function(err, _goods){
					if(err)console.log(err)

					res.render( tp_page ,{
						title:tp_title,
						keyword: q,
						goods_total: GOODS_TOTAL,
						currentPage: pageNum + 1,
						totalPage: Math.ceil(GOODS_TOTAL / LIMIT),
						goods: _goods,
						allCategoryType: GetCategoryArray(_categories),
						url_href: GET_URL_HREF.substring(1),
						url_key_obj: URL_REQUEST,
						cart_goods: CartGoods(user, cart),
						cart_goods_num: CartGoods(user, cart).length
					})
				})
		})
	})
}

// admin product list
exports.list = function(req,res){
	// .query找到路由上的值
	var page = parseInt(req.query.p,10) || 1 
	var count = 6
	var page = page-1
	var index = page*count

	Goods
		.find({})
		.sort({_id: -1})
		.populate('sort', 'attributes')
		.exec(function(err, products){
			if(err)console.log(err)
			// 截取当前商品总数
			var results = products.slice(index, index + count)

			res.render('admin/goods/list',{
				title:'后台产品列表',
				currentPage: (page + 1),
				totalPage: Math.ceil(products.length / count),
				products: results
			})
		})
}

// admin new goods
var {GetCategoryArray} = require('../utils/global')
exports.new = function(req,res){
	var id = req.params.id
	var edittype = req.query.edit


	Category.aggregate([{
			'$group': {
				_id: '$name', 
				cid: {$push: '$$ROOT'}
			}
		}], function(err, _categories){
			if(err) console.log(err)

			if(!id){
				res.render('admin/goods/add',{
					title: '新建商品编辑页',
					allCategoryType: GetCategoryArray(_categories),
					goods: {}
				})
			} else {
				Goods.findById(id,function(err,goods){
					if(err)console.log(err)
					// 更新页面
					if(edittype=='photo'){
						return res.render('admin/goods/add_photo',{
							title: '商品 "'+goods.title+'" - 图片管理',
							goods: goods
						})
					}else if(edittype=='content'){
						req.session.ueditortype = {type:"goods", dirname:id}
						return res.render('admin/goods/add_content',{
							title: '商品 "'+goods.title+'" - 商品详情',
							goods: goods
						})
					}else{
						res.render('admin/goods/add',{
							title: '商品 "'+goods.title+'" - 基本信息',
							allCategoryType: GetCategoryArray(_categories),
							goods: goods
						})
					}
				})
			}
		})
}


// admin new product save
exports.save = function(req,res){
	var goodsObj = req.body.goods
	var id = goodsObj._id

	if(!id){
		// 新增
		var	goods = new Goods(goodsObj)

		goods.save(function(err,_goods){
			if(err) console.log(err)

			var ATTR = _goods.attributes,
				style = ATTR.style,
				sort = ATTR.sort,
				scene = ATTR.scene,
				material = ATTR.material,
				color = ATTR.color

			function cat_add_pid(obj){
				if(obj === undefined) return false
				if(obj.length > 0){
					for(var i = 0; i < obj.length; i++){
						console.log(obj[i])
						Category.update({'_id': obj[i]},{$push: {'pid': _goods._id}}, function(err){
							if(err) console.log(err)
						})
					}
				}else{
					Category.update({'_id': obj},{$push: {'pid': _goods._id}}, function(err){
						if(err) console.log(err)
					})
				}
			}
			cat_add_pid(style)
			cat_add_pid(sort)
			cat_add_pid(scene)
			cat_add_pid(material)
			cat_add_pid(color)
			// 创建一个以当前ID为名的文件夹
			Mkdir('/../../public/data/goods/'+_goods._id)

			res.redirect('/admin/goods/update/'+_goods._id+'?edit=photo')
		})
	}else{
		// 更新
		Goods.findById(id, function(err, _product){
			if(err) console.log(err)

			var updateProduct = {
				title: goodsObj.title,
				description: goodsObj.description,
				size: {
					h: goodsObj.size.h,
					w: goodsObj.size.w,
					d: goodsObj.size.d,
				},
				price: goodsObj.price,
				sale: goodsObj.sale
			}

			_product = _.extend(_product, updateProduct)
			_product.save(function(err){
				if(err) console.log(err)
				// goods/update/5c7ce3921f59078e046a736f?edit=info
				res.redirect('/admin/goods/update/'+goodsObj._id+'?edit=info')
			})
		})

	}

}

// 更改商品属性
exports.changecategory = function(req, res){
	var PID = req.body.pid,
		CID = req.body.cid,
		check = req.body.check,
		TYPE = req.body.type,
		e_sort_id = req.body.e_sort_id

	console.log(req.body)

	var GOODS_TODO = {},
		CATEGORY_TODO = {},
		METHOD = '$pull'
	if(check.toString() === 'true'){
		METHOD = '$push'
	}
	GOODS_TODO[METHOD] = {}
	GOODS_TODO[METHOD][TYPE] = CID
	CATEGORY_TODO[METHOD] = {'pid': PID}

	console.log('GOODS_TODO :')
	console.log(GOODS_TODO)
	console.log('CATEGORY_TODO :')
	console.log(CATEGORY_TODO)
	// res.json({success:0})
	Goods.findOneAndUpdate(
		{'_id': PID},
		GOODS_TODO,
		function(err){
			if(err) console.log(err)
			Category.findOneAndUpdate(
				{'_id': CID},
				CATEGORY_TODO, 
				function(err){
					if(err){
						console.log(err)
						res.json({success:0})
					} else {
						res.json({success:1})
					}
				})
		})


	// 复选框
	// if(check.toString() === 'true'){
	// 	// // 			p_type.push(cid)
	// 	Goods.findOneAndUpdate(
	// 		{'_id': pid},
	// 		{'$push': {'material': pid}},
	// 		function(err){
	// 			if(err) console.log(err)
	// 			Category.findOneAndUpdate(
	// 				{'_id': cid},
	// 				{$push: {'pid': pid}}, 
	// 				function(err, pcategory){
	// 					if(err){
	// 						console.log(err)
	// 						res.json({success:0})
	// 					} else {
	// 						res.json({success:1})
	// 					}
	// 				})
	// 		})
	// } else {
	// 	Goods.findOneAndUpdate(
	// 		{'_id': pid},
	// 		{'$pull': {'material': pid}},
	// 		function(err){
	// 			if(err) console.log(err)
	// 			Category.findOneAndUpdate(
	// 				{'_id': cid},
	// 				{'$pull': {'pid': pid}}, 
	// 				function(err, pcategory){
	// 					if(err){
	// 						console.log(err)
	// 						res.json({success:0})
	// 					} else {
	// 						res.json({success:1})
	// 					}
	// 				})
	// 		})
	// }


	// Goods.findById(pid, function(err, _goods){
	// 	if(err) console.log(err)

	// 	// console.log(req.body)
	// 	console.log(_goods)

	// 	if(type==='pstyle'){
	// 		var p_type = _goods.p_type
	// 	}else if(type==='sort'){
	// 		var p_type = _goods.sort
	// 	}else if(type==='scene'){
	// 		var p_type = _goods.scene
	// 	}else if(type==='material'){
	// 		var p_type = _goods.material
	// 	}else if(type==='color'){
	// 		var p_type = _goods.color
	// 	}else{
	// 		return res.json({success:0})
	// 	}

	// // 	if(e_sort_id){
	// // 		// 单选框
	// // 		if(p_type && e_sort_id.toString() === p_type.toString()){
	// // 			return res.json({success:2})
	// // 		}else{
	// // 			Category.findByIdAndUpdate(e_sort_id, {$push: {'pid': pid}}, function(err){
	// // 				if(err) console.log(err)
	// // 			})
	// // 			Category.findById(p_type, function(err, category){
	// // 				if(err) console(err)
	// // 				if(category){
	// // 					var c_index = category.pid.indexOf(pid)
	// // 					category.pid.splice(c_index, 1)
	// // 					category.save(function(err){
	// // 						if(err) console.log(err)
	// // 					})
	// // 				}
	// // 			})
	// // 			_goods.sort = e_sort_id
	// // 			_goods.save(function(err,p){
	// // 				if(err) console.log(err)
	// // 				return res.json({success:1})
	// // 			})
	// // 		}
	// // 	}else{
	// // 		// 复选框
	// // 		if(check.toString() === 'true'){
	// // 			p_type.push(cid)
	// // 			_goods.save(function(err){
	// // 				if(err) console.log(err)
	// // 				Category.findByIdAndUpdate(cid, {$push: {'pid': pid}}, function(err){
	// // 					if(err) console.log(err)
	// // 				})
	// // 			})
	// // 			return res.json({success:1})
	// // 		}else{
	// // 			var index = p_type.indexOf(cid)
	// // 			p_type.splice(index,1)
	// // 			_goods.save(function(err){
	// // 				if(err) console(err)
	// // 				Category.findOneAndUpdate(
	// // 					{'_id': cid},
	// // 					{'$pull':{'pid': pid}}, 
	// // 					function(err, pcategory){
	// // 						if(err) console.log(err)
	// // 					})
	// // 			})
	// // 			return res.json({success:1})
	// // 		}
	// // 	}
	// // })
	// })
}

exports.checkImageData = function(req, res){
	var files = req.files.productCover
	if(!files.originalFilename || files.size > 10485760 || files.type.indexOf('image') == -1){
		return res.json({success:1})
	}else{
		return res.json({success:0})
	}
}


var {Mkdir, WiteFile, DeletelFile} = require('../utils/file')

exports.updatephoto = function(req,res){
	var id = req.body.goods._id
	var cover = req.body.goods.cover
	var files = req.files.productCover

	if(!files.originalFilename || files.size > 10485760 || files.type.indexOf('image') == -1){
		return res.redirect('/admin/goods/update/'+id+'?edit=photo')
	}


	WiteFile(files, '/public/data/goods/'+id+'/', function(new_file_name){
		// 删除旧图片
		if(cover){
			DeletelFile('/public/data/goods/'+id+'/'+cover, function(re) {
				console.log("删除旧图片成功")
			})
		}
		// 保存新图片
		Goods.findById(id,function(err,_product){
			if(err)console.log(err)
			_product.cover = new_file_name
			_product.save(function(err){
				if(err)console.log(err)
				res.redirect('/admin/goods/update/'+id+'?edit=photo')
			})
		})
	})

	// fs.readFile(filePath,function(err,data){

	// 	var timestamp = Date.now()
	// 	var type = files.type.split('/')[1] ? "jpeg" : "jpg"
	// 	if(type == 'jpeg') type = "jpg"
	// 	var imgsrc = timestamp + '.' +type
	// 	// fs.mkdir(__dirname + '/../../public/images_data/'+filename,function(err){
	// 	var newPath = path.join(__dirname, '../../', '/public/data/products/p'+id+'/'+imgsrc)

	// 	fs.writeFile(newPath, data, function(err){
	// 		if(err)console.log(err)
	// 		// 删除旧图片
	// 		if(cover){
	// 			// rmdirSync(__dirname + '/../../public/data/products/p'+id+'/'+cover, function(err){
	// 			// 	if(err) console.log(err)
	// 			// 	console.log("删除目录以及子目录成功")
	// 			// })
	// 			DeletelFile('/public/data/products/p'+id+'/'+cover, function(re) {
	// 				console.log("删除旧图片成功")
	// 			})
	// 		}
	// 		// 保存新图片
	// 		Goods.findById(id,function(err,_product){
	// 			if(err)console.log(err)
	// 			_product.cover = imgsrc
	// 			_product.save(function(err){
	// 				if(err)console.log(err)
	// 				res.redirect('/admin/goods/update/'+id+'?edit=photo')
	// 			})
	// 		})
	// 	})
	// })
}

exports.updatecontent = function(req, res){
	var postProductInfo = req.body.goods,
		id = postProductInfo._id,
		content = postProductInfo.content,
		uid = postProductInfo.uid
	Goods.findById(id, function(err, product){
		if(err) console.log(err)
		if(product.uid.toString() !== uid.toString()){
			product.uid = uid
		}

		if(!product.content || product.content.toString() !== content.toString()){
			product.content = content
			product.save(function(err){
				if(err) console.log(err)
			})
		}
		res.redirect('/admin/goods/update/'+id+'?edit=content')
	})
}

// 查找购物车商品数量
function CartGoods(user, cart){
	var cartGoods = []
	if(user){
		cartGoods = user.shopcartgoods
	}else{
		if(cart && cart.length > 0){
			for(var i in cart){
				cartGoods.push(cart[i].pid)
			}
		}
	}
	return cartGoods
}

//product delete category
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		Goods.findById(id,function(err,product){
			if(err) console.log(err)

			// 查找到所以分类的id
			var product_id = []
			product_id.push(product.sort)

			for_cat_id(product.scene)
			for_cat_id(product.material)
			for_cat_id(product.color)
			function for_cat_id(obj){
				for(var i=0; i<obj.length; i++){
					product_id.push(obj[i])
				}
			}
			console.log(product_id)

			for(var i=0; i<product_id.length; i++){
				Category.findById(product_id[i],function(err,category){
					// 在分类pid数组中查找该值所在位置并删除 保存
					var index = category.pid.indexOf(id)
					category.pid.splice(index,1)
					category.save(function(err){
						if(err) console.log(err)
					})

				})
			}
			// 删除
			Goods.remove({_id: id},function(err,product){
				if(err){
					console.log(err)
					res.json({success:0})
				}else{
					rmdirSync(__dirname + '/../../public/data/products/p'+id, function(err){
						if(err) console.log(err)
						console.log("删除目录以及子目录成功")
					})
					res.json({success:1})
				}
			})
		})
	}
}

// 删除文件夹及文件夹下的所有文件
var rmdirSync = (function(){
	function iterator(url, dirs){
		var stat = fs.statSync(url)
		if(stat.isDirectory()){
			// 收集目录
			dirs.unshift(url)
			inner(url, dirs)
		}else if(stat.isFile()){
			// 直接删除文件
			fs.unlinkSync(url)
		}
	}
	function inner(path, dirs){
		var arr = fs.readdirSync(path)
		for(var i=0, el; el = arr[i++];){
			iterator(path+"/"+el, dirs)
		}
	}
	return function(dir, cb){
		cb = cb || function(){}
		var dirs = []
		try{
			iterator(dir, dirs)
			for(var i=0, el; el = dirs[i++];){
				fs.rmdirSync(el)
			}
			cb()
		}catch(e){
			e.code === "ENOENT" ? cb() : cb(e)
		}
	}
})()
