var Product = require('../models/product')
var Category = require('../models/category')
var Comment = require('../models/comment')
var Shopcart = require('../models/shopcart')
var User = require('../models/user')
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
		Product.find({_id: {$in: pid}, 'favourite': uid}, function (err, products) {
			if (err) console.log(err)
			for(item in products){
				var pfavourite = products[item].favourite
					index = pfavourite.indexOf(uid)
				pfavourite.splice(index, 1)
				products[item].save(function (err, product) {
					if (err) console.log(err)
					console.log(product.favourite)
				})
			}
			return res.json({success: 0})
		})
	} else {
		Product.findOne({'_id': pid}, function (err, product) {
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
			Product.update({'_id': pid}, {'favourite': pfavourite}, function (err) {
				if (err) console.log(err)
				return res.json({success: 0, info: info, num: pfavourite.length})
			})
		})
	}
	// User.findOne({'_id': uid}, function (err, user) {
	// 	if (err) console.log(err)
	// 	var ufavourite = user.favouritegoods

	// 	if (typeof pid === 'object') {
	// 		// 批量移除
	// 		for (var i = 0; i < pid.length; i++) {
	// 			var index = ufavourite.indexOf(pid[i])
	// 			if (index > -1) ufavourite.splice(index, 1)
	// 		}
	// 		User.update({_id: uid}, {'favouritegoods': ufavourite}, function (err, _user) {
	// 			if (err) console.log(err)
	// 			Product.find({_id: {$in: pid}}, function (err, products) {
	// 				for(item in products){
	// 					var pfavourite = products[item].favourite
	// 						index = pfavourite.indexOf(uid)
	// 					console.log(pfavourite)
	// 					pfavourite.splice(index, 1)
	// 					products[item].save(function (err, product) {
	// 						console.log(product.favourite)
	// 					})
	// 				}
	// 			})
	// 			return res.json({success:0})
	// 		})
	// 	} else {
	// 		var	index = ufavourite.indexOf(pid),
	// 			info = []
	// 		if (index > -1) {
	// 			ufavourite.splice(index,1)
	// 			info = [0, "取消收藏"]
	// 		} else {
	// 			ufavourite.push(pid)
	// 			info = [1, "收藏成功"]
	// 		}
	// 		User.update({_id: uid}, {'favouritegoods': ufavourite}, function (err, _user) {
	// 			if (err) console.log(err)
	// 			Product.findOne({'_id': pid}, function (err, product) {
	// 				if (err) console.log(err)
	// 				var pfavourite = product.favourite
	// 				if (!info[0]) {
	// 					var index = pfavourite.indexOf(uid)
	// 					pfavourite.splice(index, 1)
	// 				} else {
	// 					pfavourite.push(uid)
	// 				}
	// 				Product.update({_id: pid}, {'favourite': pfavourite}, function (err, _product) {
	// 					console.log(pfavourite.length)
	// 					return res.json({success: 0, info: info, num: pfavourite.length})
	// 				})
	// 			})
	// 		})
	// 	}
	// })
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
			template = 'product_material',
			title = material+'材质详情介绍'
	}

	Category.find({type:'product', name:linkSort},function(err, categories){
		if(err) console.log(err)
		Category
			.findOne(findObj)
			.populate({
				path: 'pid',
				model: 'Product',
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
	Product.update({_id:id},{$inc:{pv:1}},function(err){
		if(err) console.log(err)
	})

	// 浏览过的商品
	if(!req.session.view_product){
		req.session.view_product = []
	}

	Category
		.find({type:'product', name: 'sort'})
		.sort({_id: -1})
		.populate('pid', 'title id')
		.exec(function(err, categories){
			if(err)console.log(err)
			Product
				.findOne({'_id':id})
				.populate('color material scene sort','attributes')
				.exec(function(err, _product){
					if(err) console.log(err)
					if(!_product){
						console.log('该商品不存在或者已经被删除了。')
						return res.render('prompt',{
							message:'该商品不存在或者已经被删除了。'
						})
					}
					// delete req.session.view_product
					var view_product = req.session.view_product
					if(view_product.indexOf(id) > -1){
						view_product.splice(view_product.indexOf(id), 1)
					}else{
						
					}
					view_product.unshift(id)
					// 找到当前的id在缓存的位置
					var index = view_product.indexOf(id)

					// 新建并合并新数组，并删除当前的id,并查找
					var new_view_product = []
					var find_view_product = new_view_product.concat(view_product)
					find_view_product.splice(index,1)
					var v_p_num = 6
					if( find_view_product.length > v_p_num ){
						find_view_product = find_view_product.slice(0, v_p_num)
					}
					

					Product
						.find({_id:{$in:find_view_product}})
						.populate('color material','attributes')
						.exec(function(err, find_view_products){
							if(err) console.log(err)
							res.render('product_detail',{
								title: _product.title,
								categories: categories,
								product: _product,
								find_view_products: find_view_products,
								cart_goods: CartGoods(user, cart),
								cart_goods_num: CartGoods(user, cart).length
							})
						})
				})
		})
}


//search page
exports.search = function(req,res){
	// .query找到路由上的值
	var user = req.session.user,
		page = parseInt(req.query.p,8) || 0 ,
		count = 8,
		index = page*count,
		cart = req.session.cart,
		q = req.query.q,
		product_attributes = req.session.product_attributes,
		product_attributes_url = req.session.product_attributes_url

		// 是否是搜索页面
		if( typeof(q) === 'string' ){
			product_attributes.title = new RegExp( q+'.*','i' )
			var tp_page = 'results'
			var tp_title = '搜索结果页'
		} else {
			var tp_page = 'store'
			var tp_title = JSON.stringify(req.query) === '{}'? '所有商品' : '类型选择 - 所有商品'
		}

	Product
		.find(product_attributes)
		.populate({
			path: 'sort color material scene',
			select: 'name attributes',
			model: 'Category'
		})
		.exec(function(err, products){
			if(err)console.log(err)

			var results = products.slice(index, index + count)

			res.render( tp_page ,{
				title:tp_title,
				keyword: q,
				products_total: products.length,
				currentPage: (page + 1),
				totalPage: Math.ceil(products.length / count),
				products: results,
				allCategoryType: req.session.allCategoryType,
				url_pathname: req._parsedUrl.pathname,
				url_key: product_attributes_url,
				cart_goods: CartGoods(user, cart),
				cart_goods_num: CartGoods(user, cart).length
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

	Product
		.find({})
		.sort({_id: -1})
		.populate('sort', 'attributes')
		.exec(function(err, products){
			if(err)console.log(err)
			// 截取当前商品总数
			var results = products.slice(index, index + count)

			res.render('admin/product_list',{
				title:'后台产品列表',
				currentPage: (page + 1),
				totalPage: Math.ceil(products.length / count),
				products: results
			})
		})
}
// admin new product
exports.new = function(req,res){
	var id = req.params.id
	var edittype = req.query.edit


	Category.find({type:'product'}, function(err, categories){
		if(err)console.log(err)

		var categories_sort = [],
			categories_scene = [],
			categories_material = [],
			categories_color = []

		// 对产品类目进行分类
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
		if(!id){
			// 新建页面
			res.render('admin/product_add',{
				title:'新建商品编辑页',
				categories_sort: categories_sort,
				categories_scene: categories_scene,
				categories_material: categories_material,
				categories_color: categories_color,
				product: {}
			})
		}else{
			Product.findById(id,function(err,product){
				if(err)console.log(err)
				// 更新页面
				if(edittype=='photo'){
					return res.render('admin/product_add_photo',{
						title: '商品 "'+product.title+'" - 图片管理',
						product: product
					})
				}else if(edittype=='content'){
					req.session.ueditortype = {type:"product", dirname:id}
					return res.render('admin/product_add_content',{
						title: '商品 "'+product.title+'" - 商品详情',
						product: product
					})
				}else{
					res.render('admin/product_add',{
						title: '商品 "'+product.title+'" - 基本信息',
						categories_sort: categories_sort,
						categories_scene: categories_scene,
						categories_material: categories_material,
						categories_color: categories_color,
						product: product
					})
				}
			})

		}
	})
}


// admin new product save
exports.save = function(req,res){
	var productObj = req.body.product
	var id = productObj._id

	if(!id){
		// 新增
		var	product = new Product(productObj)

		product.save(function(err,_product){
			if(err) console.log(err)

			var sort = _product.sort,
				scene = _product.scene,
				material = _product.material,
				color = _product.color

			function cat_add_pid(obj){
				if(obj === undefined) return false
				if(obj.length > 0){
					for(var i = 0; i < obj.length; i++){
						console.log(obj[i])
						Category.update({'_id': obj[i]},{$push: {'pid': _product._id}}, function(err){
							if(err) console.log(err)
						})
					}
				}else{
					Category.update({'_id': obj},{$push: {'pid': _product._id}}, function(err){
						if(err) console.log(err)
					})
				}
			}
			cat_add_pid(sort)
			cat_add_pid(scene)
			cat_add_pid(material)
			cat_add_pid(color)
			// 创建一个以当前ID为名的文件夹
			var filename = 'p'+_product._id
			fs.mkdir(__dirname + '/../../public/data/products/'+filename, function(err){
				if(err) console.log(err)
				console.log('创建目录成功')
			})

			res.redirect('/admin/product/update/'+_product._id+'?edit=photo')
		})
	}else{
		// 更新
		Product.findById(id, function(err, _product){
			if(err) console.log(err)
			var updateProduct = {
				_id: productObj._id,
				description: productObj.description,
				size: {
					h: productObj.size.h,
					w: productObj.size.w,
					d: productObj.size.d,
				},
				price: productObj.price,
				sale: productObj.sale
			}
			_product = _.extend(_product, updateProduct)
			_product.save(function(err){
				if(err) console.log(err)
				res.redirect('/admin/product/list')
			})
		})

	}

}

// 更改商品属性
exports.changecategory = function(req, res){
	var pid = req.body.pid,
		cid = req.body.cid,
		check = req.body.check,
		type = req.body.type,
		e_sort_id = req.body.e_sort_id

	Product.findById(pid, function(err, product){
		if(err) console.log(err)

		if(type==='sort'){
			var p_type = product.sort
		}else if(type==='scene'){
			var p_type = product.scene
		}else if(type==='material'){
			var p_type = product.material
		}else if(type==='color'){
			var p_type = product.color
		}else{
			return res.json({success:0})
		}

		if(e_sort_id){
			// 单选框
			if(p_type && e_sort_id.toString() === p_type.toString()){
				return res.json({success:2})
			}else{
				Category.findByIdAndUpdate(e_sort_id, {$push: {'pid': pid}}, function(err){
					if(err) console.log(err)
				})
				Category.findById(p_type, function(err, category){
					if(err) console(err)
					if(category){
						var c_index = category.pid.indexOf(pid)
						category.pid.splice(c_index, 1)
						category.save(function(err){
							if(err) console.log(err)
						})
					}
				})
				product.sort = e_sort_id
				product.save(function(err,p){
					if(err) console.log(err)
					return res.json({success:1})
				})
			}
		}else{
			// 复选框
			if(check.toString() === 'true'){
				p_type.push(cid)
				product.save(function(err){
					if(err) console.log(err)
					Category.findByIdAndUpdate(cid, {$push: {'pid': pid}}, function(err){
						if(err) console.log(err)
					})
				})
				return res.json({success:1})
			}else{
				var index = p_type.indexOf(cid)
				p_type.splice(index,1)
				product.save(function(err){
					if(err) console(err)
					Category.findById(cid, function(err, category){
						if(err) console(err)
						var c_index = category.pid.indexOf(pid)
						category.pid.splice(c_index, 1)
						category.save(function(err){
							if(err) console.log(err)
						})
					})
				})
				return res.json({success:1})
			}
		}
	})
}

exports.checkImageData = function(req, res){
	var files = req.files.productCover
	if(!files.originalFilename || files.size > 10485760 || files.type.indexOf('image') == -1){
		return res.json({success:1})
	}else{
		return res.json({success:0})
	}
}

exports.updatephoto = function(req,res){
	var id = req.body.product._id
	var cover = req.body.product.cover
	var files = req.files.productCover
	var filePath = files.path

	if(!files.originalFilename || files.size > 10485760 || files.type.indexOf('image') == -1){
		return res.redirect('/admin/product/update/'+id+'?edit=photo')
	}

	fs.readFile(filePath,function(err,data){

		var timestamp = Date.now()
		var type = files.type.split('/')[1] ? "jpeg" : "jpg"
		if(type == 'jpeg') type = "jpg"
		var imgsrc = timestamp + '.' +type
		// fs.mkdir(__dirname + '/../../public/images_data/'+filename,function(err){
		var newPath = path.join(__dirname, '../../', '/public/data/products/p'+id+'/'+imgsrc)

		fs.writeFile(newPath, data, function(err){
			if(err)console.log(err)
			// 删除旧图片
			if(cover){
				rmdirSync(__dirname + '/../../public/data/products/p'+id+'/'+cover, function(err){
					if(err) console.log(err)
					console.log("删除目录以及子目录成功")
				})
			}
			// 保存新图片
			Product.findById(id,function(err,_product){
				if(err)console.log(err)
				_product.cover = imgsrc
				_product.save(function(err){
					if(err)console.log(err)
					res.redirect('/admin/product/update/'+id+'?edit=photo')
				})
			})
		})
	})
}

exports.updatecontent = function(req, res){
	var postProductInfo = req.body.product,
		id = postProductInfo._id,
		content = postProductInfo.content,
		uid = postProductInfo.uid
	Product.findById(id, function(err, product){
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
		res.redirect('/admin/product/update/'+id+'?edit=content')
	})
}

// 查找购物车商品数量
function CartGoods(user, cart){
	var cartGoods = []
	if(user){
		cartGoods = user.shopcartgoods
	}else{
		if(cart && cart.length > 0){
			cartGoodsNum = cart.length
			for(var i=0; i < cartGoodsNum; i++){
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
		Product.findById(id,function(err,product){
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
			Product.remove({_id: id},function(err,product){
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
