
// var Movie = require('../models/movie')
var Category = require('../models/category')
// var Banner = require('../models/banner')
var Goods = require('../models/goods')
var Message = require('../models/message')
var User = require('../models/user')
var Inquiry = require('../models/inquiry')

var nodemailer = require('nodemailer')

// nodemailer config
// http://www.jianshu.com/p/ee200a67853c
var mailTransport = nodemailer.createTransport({
	host: 'smtp.mxhichina.com',
	port: 25,
	secureConnection: true,
	auth: {
		user: 'server@vinte.xin',
		pass: 'LPJ5548744948jd'
	}
})

var emailHTML = '<div style="background-color:#d0d0d0;padding:40px;">'
			  + '<div style="width:580px;font-size:14px;border-top:3px solid #25a6a4;margin:0px auto;padding:35px 40px 5px;color: rgb(51, 51, 51);background-color:white;border-radius:5px;box-shadow:rgb(153, 153, 153) 3px 3px 10px;">'
			  + '<div style="margin-bottom:25px;">'
			  + '<a href="http://www.vinte.xin"><img src="http://vinte.xin/images/logo-index.png" alt="" /></a></div>'
			  + '<div style="height:2px;border-raidus:1px;background-color:#cbe9e9;"></div>'
			  + '<h2 style="font-weight:bold;font-size:17px;margin:25px 0;color:#25a6a4;">亲爱的用户：</h2>'
			  + '<p>您好！感谢您使用<b>梵特家具网</b>服务，您正在进行邮箱验证，本次请求的验证码为：</p>'
			  + '<p><b style="color:#066;margin-right:15px;font-size:18px;">020123</b>'
			  + '<span style="font-size:12px;color:gray;">(为了保障您帐号的安全性，请在1小时内完成验证。)</span></p>'
			  + '<p style="margin-top:45px;">如果这不是您的邮件请忽略，很抱歉打扰您，请原谅。</p>'
			  + '<ul style="line-height:2em;padding:20px 0;font-size:12px;border-top:1px solid #ddd;">'
			  + '<li>产品反馈: <a style="color:gray;" href="mailto:product@vinte.xin">product@vinte.xin</a></li>'
			  + '<li>客户服务: <a style="color:gray;" href="mailto:server@vinte.xin">server@vinte.xin</a></li>'
			  + '</ul></div></div>'
exports.send = function(req, res) {
	var options = {
		from: 'server@icsscn.com',
		to: '200814174@qq.com',
		subject: '一封来自 Node Mailer 的邮件',
		text: 'test, test, test, test',
		html: emailHTML
	}
	mailTransport.sendMail(options, function (err, msg) {
		if(err) console.log(err)
		console.log(msg)
		res.render('/', {title: '已接收'})
	})

}
//index page
exports.index = function(req,res){
	var user = req.session.user,
		cart = req.session.cart

	Category
		.find({type:'goods'})
		.sort({_id: 1})
		.exec(function(err, categories){
			if(err)console.log(err)

			var goods_attrs = ['style', 'scene', 'sort', 'material', 'color'],
				categoryAttributes = {
					'style': [],
					'scene': [],
					'sort': [],
					'material': [],
					'color': []
				}

			for(i in categories){
				var catName = categories[i].name.toString()
				for( j in goods_attrs ){
					var attr = goods_attrs[j].toString()
					if( catName === attr ){
						categoryAttributes[attr].push(categories[i])
					}
				}
			}

			var INQUIRY_GOODS = getCartGoods(user, cart)

			Goods
				.find({})
				.limit(8)
				.sort({_id: -1})
				.populate('attributes.color attributes.material attributes.scene attributes.sort','attributes')
				.exec(function(err, _recommendGoods){
					if(err)console.log(err)
					res.render('index/index',{
						pstyleCategories: categoryAttributes['style'],
						materialCategories: categoryAttributes['material'],
						sceneCategories: categoryAttributes['scene'],
						sortCategories: categoryAttributes['sort'],
						recommendGoods: _recommendGoods,
						cart_goods: INQUIRY_GOODS,
						cart_goods_num: INQUIRY_GOODS.length
					})
				})
		})
}
// 查找购物车商品数量
function getCartGoods(user, cart){
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
	console.log(cartGoods)
	return cartGoods
}


// 后台首页
exports.admin = function(req, res){
	User.fetch(function(err, users){
		if(err) console.log(err)
		Message.fetch(function(err, messages){
			if(err) console.log(err)
			Goods.fetch(function(err, products){
				if(err) console.log(err)
				Inquiry.fetch(function(err, inquiries){
					if(err) console.log(err)
					res.render('admin/index', {
						title: '后台首页',
						users: users,
						messages: messages,
						products: products,
						inquiries: inquiries
					})
				})
			})
		})
	})
}

// 发送留言
exports.message = function(req, res){
	console.log(getClientIp(req))

	var msgObj = req.body
	msgObj["ip"] = getClientIp(req)
	var message = new Message(msgObj)
	message.save(function(err, _message){
		if(err){
			console.log(err)
			res.json({success: 0})
		}else{
			res.json({success: 1})
		}
	})
	

}

function getClientIp(req) {
	return req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress
}

// 后台留言列表
exports.messageList = function(req, res){
	// Message.fetch(function(err, messages){
	Message.find()
		.sort({_id: -1})
		.exec(function(err, messages){
			if(err) console.log(err)
			res.render('admin/messages/list',{
				title: "用户留言列表",
				messages: messages
			})
		})
}
// 删除留言
exports.messageDel = function(req,res){
	var id = req.query.id
	
	if(!id) return res.json({success:0})

	Message.remove({_id: id},function(err){
		if(err){
			console.log(err)
			res.json({success:0})
		}else{
			res.json({success:1})
		}
	})
}