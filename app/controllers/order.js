var Order = require('../models/order')

exports.adminList = function(req, res){
	// Order.fetch(function(err, orders){
	var name = req.query.name
	if(name){
		var findObj = {'uid': name}
	}else if(req.query.type == 'company'){
		var findObj = {'from.company': {$ne:''}}
	}else if(req.query.type == 'user'){
		var findObj = {'from.company': ''}
	}
	Order
		.find(findObj || {})
		.sort({'_id': -1})
		.populate('uid', 'name')
		.exec(function(err, orders){
			console.log(orders)
			if(err) console.log(err)
			res.render('admin/order_list',{
				title: "订单列表",
				orders: orders,
				type: req.query.type,
				name: name
			})
		})
}

exports.detail = function(req, res){
	var id=req.params.id
	Order
		.findOne({_id: id})
		.populate('uid', 'name')
		.populate('products.sort products.color products.material products.scene', 'attributes')
		// .populate({
		// 	path: 'products._id',
		// 	model: 'Product',
		// 	populate: {
		// 		path: 'sort color material scene',
		// 		select: 'attributes',
		// 		model: 'Category'
		// 	}
		// })
		.exec(function(err, order){
			if(err) console.log(err)
			console.log(order.products)
			res.render('admin/order_detail', {
				title: "订单详情",
				order: order
			})
		})
}