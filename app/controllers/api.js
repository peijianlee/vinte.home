var Product = require('../models/product')
var Category = require('../models/category')

var c_type = 'application/json;charset=utf-8'

exports.products = function(req,res){
	// var _callback = req.query.callback
	Product.find({})
		.populate('color material scene sort', 'attributes')
		.exec(function(err, products){
			if(err) console.log(err)
			var data = {
				'start': 0,
				'count': 10,
				'total': products.length,
				'targets': products
			}
			CallbackData(req.query.callback, res, data)
		})
}

exports.product = function(req,res){
	var id = req.params.id
	Product
		.findOne({'_id':id})
		.populate('color material scene sort', 'attributes')
		.exec(function(err, product){
			if(err) console.log(err)
			
			// res.writeHead(200, {'Content-type' : c_type})
			// res.end(JSON.stringify(product))
			CallbackData(req.query.callback, res, product)
		})
}

exports.categories = function(req, res){
	Category
		.find({})
		.exec(function(err, categories){
			if(err) console.log(err)
			// res.writeHead(200, {'Content-type': c_type})
			// res.end(JSON.stringify(categories))
			CallbackData(req.query.callback, res, categories)
		})
}

exports.sort = function(req, res){
	
	var sort = req.params.sort
	Category
		.find({'attributes.zh_cn': sort})
		.populate({
			path: 'pid',
			model: 'Product',
			populate: {
				path: 'sort scene material color',
				select: 'attributes',
				model: 'Category'
			}
		})
		.exec(function(err, categories){
			if(err) console.log(err)
			// res.writeHead(200, {'Content-type': c_type})
			// res.end(JSON.stringify(categories))
			CallbackData(req.query.callback, res, categories)
		})
}


function CallbackData(_callback, res, data){
	if(_callback){
		res.type('text/javascript')
		res.send(_callback + '('+JSON.stringify(data)+')')
	}else{
		res.json(data)
	}
}