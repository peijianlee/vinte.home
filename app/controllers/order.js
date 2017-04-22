var Order = require('../models/order')

exports.adminList = function(req, res){
	// Order.fetch(function(err, orders){
	Order
		.find({})
		.populate('uid', 'name')
		.exec(function(err, orders){
			if(err) console.log(err)
			console.log(orders)
			res.render('admin/order_list',{
				title: "订单列表",
				orders: orders
			})
		})
}