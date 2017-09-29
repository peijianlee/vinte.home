var Inquiry = require('../models/inquiry')

exports.adminList = function(req, res){
	// Inquiry.fetch(function(err, inquirys){
	var name = req.query.name
	if(name){
		var findObj = {'uid': name}
	}else if(req.query.type == 'company'){
		var findObj = {'from.company': {$ne:''}}
	}else if(req.query.type == 'user'){
		var findObj = {'from.company': ''}
	}
	Inquiry
		.find(findObj || {})
		.sort({'_id': -1})
		.populate('uid', 'name')
		.exec(function(err, inquiries){
			console.log(inquiries)
			if(err) console.log(err)
			res.render('admin/inquiry_list',{
				title: "订单列表",
				inquiries: inquiries,
				type: req.query.type,
				name: name
			})
		})
}

exports.detail = function(req, res){
	var id=req.params.id
	Inquiry
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
		.exec(function(err, inquiry){
			if(err) console.log(err)
			res.render('admin/inquiry_detail', {
				title: "订单详情",
				inquiry: inquiry
			})
		})
}
exports.delete = function(req, res){
	var uid = req.session.user._id,
		pid = req.body.pid,
		page = req.body.page
	if (typeof pid === 'object') {
		// 批量移除
		Inquiry.find({_id: {$in: pid}}, function (err, inquirys) {
			for(item in inquirys){
				inquirys[item].update({'udelete': 1}, function (err) {
					if (err) console.log(err)
				})
			}
		})
		return res.json({success:0})
	} else {
		Inquiry.findOne({'_id': pid}, function (err, inquiry) {
			if (err) console.log(err)
			inquiry.update({'udelete': 1}, function (err, inquiry) {
				if (err) console.log(err)
			})
		})
		return res.json({success:0})
	}
}