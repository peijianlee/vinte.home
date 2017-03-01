
var Product = require('../models/product')
var Category = require('../models/category')
var Comment = require('../models/comment')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')
var moment = require('moment')

// 前台首页
exports.indexlist = function(req,res){
	// var user = req.session.user

	// res.render('product',{
	// 	title: 'IMOOC 产品列表'
	// })
	// Category.find({type:'product'}, function(err, categories){
	Category
		.find({type:'product'})
		.sort({_id: 1})
		.populate('products')
		.exec(function(err, categories){
			if(err)console.log(err)
			res.render('product',{
				title:'IMOOC 产品列表',
				categories: categories
			})
		})
		
}
// 商品详情页
exports.detail = function(req,res){
	var id=req.params.id
	Category
		.find({type:'product'})
		.sort({_id: -1})
		.populate('products', 'title id')
		.exec(function(err, categories){
			if(err)console.log(err)
			console.log(categories)

			Product.findById(id,function(err,_product){
				if(err) console.log(err)
				res.render('product_detail',{
					title: _product.title + ' | IMOOC',
					categories: categories,
					product: _product
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
		.populate('category', 'name')
		.exec(function(err, products){
			if(err)console.log(err)
			// 截取当前商品总数
			// var results = products.slice(index, index + count)

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

	Category.find({type:'product'}, function(err, categories){
		if(err)console.log(err)
		res.render('admin/product_add',{
			title:'新建商品编辑页',
			categories: categories,
			product: {}
		})
	})
}
// admin new product save
exports.save = function(req,res){
	var productObj = req.body.product
	var id = productObj._id
	var categoryId = productObj.category

	if(id){
		// 更新
		Product.findById(id, function(err, _product){
			if(err)console.log(err)

			// 如果修改商品分类
			if(productObj.category.toString() !== _product.category.toString()){
				// 找到商品对应的原商品分类
				Category.findById(_product.category,function(err,_oldCat){
					if(err) console.log(err)

					// 在原商品分类的products属性中找到该商品的id值并将其删除
					var index = _oldCat.products.indexOf(id)
					_oldCat.products.splice(index,1)
					_oldCat.save(function(err){
						if(err) console.log(err)
					})
				})

			 	// 找到商品对应的新商品分类
			 	Category.findById(productObj.category,function(err,_newCat){
			 		if(err) console.log(err)

					// 添加类别名称
			 		// 将其id值添加到商品分类的products属性中并保存
			 		_newCat.products.push(id)
			 		_newCat.save(function(err){
			 			if(err) console.log(err)
			 		})
			 	})
			}


			// 使用underscore模块的extend函数更新变化的属性
			_product = _.extend(_product, productObj)

			_product.save(function(err,_product){
				if(err)console.log(err)
				res.redirect('/admin/product/list')
			})
		})
	}else{
		// 创建新商品
		var	product = new Product(productObj)


		// 找到对应分类插入ID
		Category.findById(categoryId,function(err,_category){
			if(err) console.log(err)
			// 保存商品数据
			product.save(function(err,_newcategory){
				if(err) console.log(err)
				// 创建一个以当前ID为名的文件夹
				var filename = product._id
				fs.mkdir(__dirname + '/../../public/images_data/'+filename,function(err){
					if(err) console.log(err)
					console.log('创建目录成功')
				})

				// 在商品分类添加选中的类别
				_category.products.push(_newcategory._id)
				_category.save(function(err){
					if(err) console.log(err)
					res.redirect('/admin/product/list')
				})
			})
		})
	}
	

}


// admin new product update
exports.update = function(req,res){
	var id = req.params.id
	var edittype = req.query.edit
	
	console.log(edittype)



	if(edittype=='photo'){
		Product.findById(id,function(err,product){
			if(err)console.log(err)
			res.render('admin/product_add_photo',{
				title: '商品<'+product.title+'> - 图片管理',
				product: product
			})
		})
		return false
	}else if(edittype=='content'){
		Product.findById(id,function(err,product){
			if(err)console.log(err)
			res.render('admin/product_add_content',{
				title: '商品<'+product.title+'> - 商品详情',
				product: product
			})
		})
		return false
	}


	if(id){
		Category.find({type:'product'}, function(err, categories){
			Product.findById(id,function(err,product){
				if(err)console.log(err)
				res.render('admin/product_add',{
					title: '商品<'+product.title+'> - 基本信息',
					categories: categories,
					product: product
				})
			})
		})
	}
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
