
var Product = require('../models/product')
var Category = require('../models/category')
var Comment = require('../models/comment')
var _ = require('underscore')
var fs = require('fs')
var moment = require('moment')

// 前台首页
exports.indexlist = function(req,res){
	// var user = req.session.user

	res.render('product',{
		title: 'IMOOC 产品列表'
	})
}

// admin porduct list
exports.list = function(req,res){
	// .query找到路由上的值
	var page = parseInt(req.query.p,10) || 1 
	var count = 6
	var page = page-1
	var index = page*count


	// var user = req.session.user
	// Product.find({},function(err, products){
	// 	res.render('admin/product_list',{
	// 		title: '后台产品列表',
	// 		products: products
	// 	})

	// })
	Product
		.find({})
		.sort({_id: -1})
		.populate('category', 'name')
		.exec(function(err, products){
			if(err)console.log(err)
			// 截取当前文章总数
			// var results = products.slice(index, index + count)

			res.render('admin/product_list',{
				title:'后台产品列表',
				currentPage: (page + 1),
				totalPage: Math.ceil(products.length / count),
				products: products
			})
		})
}
// admin new porduct
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
// admin new porduct save
exports.save = function(req,res){
	var productObj = req.body.product
	var id = productObj._id
	var categoryId = productObj.category


	// 创建新文章
	var	product = new Product(productObj)

	// 找到对应分类插入ID
	Category.findById(categoryId,function(err,_category){
		if(err) console.log(err)
		// 保存文章数据
		product.save(function(err,_newcategory){
			if(err) console.log(err)

			// 在文章分类添加选中的类别
			_category.products.push(_newcategory._id)
			_category.save(function(err){
				if(err) console.log(err)
				res.redirect('/admin/product/list')
			})
		})
	})

	

}

