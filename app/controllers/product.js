
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
	// var user = req.session.user

	res.render('admin/product_list',{
		title: '后台产品列表'
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
		console.log('----------------')
		console.log(productObj)
		console.log('----------------')
		console.log(product)
		console.log('----------------')


	product.save(function(err){
		res.redirect('/admin/product/list')
	})

	// 找到对应分类插入ID
	// Category.findById(categoryId,function(err,_category){
	// 	if(err) console.log(err)



	// 	// 清除所有标签并保存在text
	// 	// var _content = product.content
	// 	// _content = _content.replace(/<\/?[^>]*>/g,''); //去除HTML tag
	// 	// _content = _content.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
	// 	// _content=_content.replace(/ /ig,'');//去掉 
	// 	// product.text = _content
	// 	// 保存文章数据
	// 	productObj.save(function(err,_newcategory){
	// 		if(err) console.log(err)

	// 		// 在文章分类添加选中的类别
	// 		_category.products.push(_newcategory._id)
	// 		_category.save(function(err){
	// 			if(err) console.log(err)
	// 			res.redirect('/admin/product/list')
	// 		})
	// 	})
	// })

	

}

