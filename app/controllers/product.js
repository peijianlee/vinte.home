
var Product = require('../models/product')
var Category = require('../models/category')
var Comment = require('../models/comment')
var Shopcart = require('../models/shopcart')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')
var moment = require('moment')

// 前台首页
exports.indexlist = function(req,res){
	var user = req.session.user
	var id=req.params.id
	Category
		.find({type:'product'})
		.sort({_id: 1})
		.populate('products')
		.exec(function(err, categories){
			if(err)console.log(err)
			if(!user){
				if(!req.session.cart) req.session.cart = []
				res.render('product',{
					title:'IMOOC 产品列表',
					categories: categories,
					cart_goods_num: req.session.cart.length
				})
			}else{
				Shopcart.findOne({'uid':user._id},function(err,shopcart){
					if(err)console.log(err)
					if(shopcart){
						var cart_goods_num = shopcart.products.length
					}else{
						var cart_goods_num = 0
					}
					res.render('product',{
						title:'IMOOC 产品列表',
						categories: categories,
						cart_goods_num: cart_goods_num
					})
				})
			}
		})
		
}

exports.search = function(req,res){
	var goods=req.params.goods
	Category
		.find({name:goods})
		.sort({_id: -1})
		.populate('products')
		.exec(function(err, categories){
			if(err)console.log(err)
			res.render('product_type',{
				title:'IMOOC 产品列表',
				categories: categories
			})
		})
}
// 商品详情页
exports.detail = function(req,res){
	var id=req.params.id
	var goods=req.params.goods
	Category
		.find({type:'product'})
		.sort({_id: -1})
		.populate('products', 'title id')
		.exec(function(err, categories){
			if(err)console.log(err)
			console.log(categories)

			Product.findById(id,function(err,_product){
				if(err) console.log(err)
				if(!_product){
					console.log('该商品不存在或者已经被删除了。')
					return res.render('prompt',{
						message:'该商品不存在或者已经被删除了。'
					})
				}
				res.render('product_detail',{
					title: _product.title + ' | IMOOC',
					categories: categories,
					product: _product,
					goods:goods
				})
			})

		});

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
			// var results = products.slice(index, index + count)

			console.log(products)


			res.render('admin/product_list',{
				title:'后台产品列表',
				currentPage: (page + 1),
				totalPage: Math.ceil(products.length / count),
				products: products
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
			// 更新页面
			if(edittype=='photo'){
				Product.findById(id,function(err,product){
					if(err)console.log(err)
					return res.render('admin/product_add_photo',{
						title: '商品<'+product.title+'> - 图片管理',
						product: product
					})
				})
			}else if(edittype=='content'){
				Product.findById(id,function(err,product){
					if(err)console.log(err)
					return res.render('admin/product_add_content',{
						title: '商品<'+product.title+'> - 商品详情',
						product: product
					})
				})
			}


			
			Product.findById(id,function(err,product){
				if(err)console.log(err)

				res.render('admin/product_add',{
					title: '商品<'+product.title+'> - 基本信息',
					categories_sort: categories_sort,
					categories_scene: categories_scene,
					categories_material: categories_material,
					categories_color: categories_color,
					product: product
				})
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
			var filename = _product._id
			fs.mkdir(__dirname + '/../../public/images_data/'+filename,function(err){
				if(err) console.log(err)
				console.log('创建目录成功')
			})

			res.redirect('/admin/product/list')
		})
	}else{
		// 更新
		Product.findById(id, function(err, _product){
			if(err) console.log(err)
			_product = _.extend(_product, productObj)
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



exports.updatephoto = function(req,res){
	var id = req.body.product._id
	var files = req.files.productCover
	var filePath = files.path
	console.log(id)


	// for(var i=0;i<files.length;i++){
	// 	console.log(files[i].name)
	// }
	fs.readFile(filePath,function(err,data){
		var timestamp = Date.now()
		var type = files.type.split('/')[1]
		var imgsrc = timestamp + '.' +type
		// fs.mkdir(__dirname + '/../../public/images_data/'+filename,function(err){
		var newPath = path.join(__dirname, '../../', '/public/images_data/'+id+'/'+imgsrc)

		fs.writeFile(newPath, data, function(err){
			if(err)console.log(err)
			req.imgsrc = imgsrc
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
	return false;
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
					res.json({success:1})
				}
			})
		})
	}
}
