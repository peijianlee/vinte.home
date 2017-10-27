
var Movie = require('../models/movie')
var Category = require('../models/category')
var Banner = require('../models/banner')
var Product = require('../models/product')
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
		cart = req.session.cart,
		id=req.params.id

	Category
		.find({type:'product'})
		.sort({_id: 1})
		.exec(function(err, categories){
			if(err)console.log(err)

			var goods_attrs = ['pstyle', 'scene', 'sort', 'material', 'color'],
				categoryAttributes = {
					'pstyle': [],
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


			Product
				.find({})
				.limit(8)
				.sort({'pv': -1})
				.populate('color material scene sort','attributes')
				.exec(function(err, recommendProducts){
					if(err)console.log(err)
					res.render('index',{
						pstyleCategories: categoryAttributes['pstyle'],
						materialCategories: categoryAttributes['material'],
						sceneCategories: categoryAttributes['scene'],
						sortCategories: categoryAttributes['sort'],
						recommendProducts: recommendProducts,
						cart_goods: CartGoods(user, cart),
						cart_goods_num: CartGoods(user, cart).length
					})
				})
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
//search page
exports.search = function(req,res){
	// .query找到路由上的值
	var user = req.session.user,
		catId = req.query.cat,
		page = parseInt(req.query.p,8) || 0 ,
		count = 2,
		index = page*count,
		cart = req.session.cart

	if(catId){
		// 在分类上找到路由上对应的值
		Category
			.find({_id: catId})
			.populate({
				path: 'movies',
				select: 'title poster'
				// options: {limit:2, skip:index}
			})
			.exec(function(err, categories){
				if(err)console.log(err)

				var category = categories[0] || {}
				var movies = category.movies || []
				// 截取当前电影总数
				var results = movies.slice(index, index + count)

				res.render('porudct_results',{
					title:'电影分类列表页',
					keyword: category.name,
					currentPage: (page + 1),
					query: 'cat='+catId,
					totalPage: Math.ceil(movies.length / count),
					movies: results
				})
			})
	}else{
		// 移至 product.js
	}
}


// 后台首页
exports.admin = function(req, res){
	User.fetch(function(err, users){
		if(err) console.log(err)
		Message.fetch(function(err, messages){
			if(err) console.log(err)
			Product.fetch(function(err, products){
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
	Message.fetch(function(err, messages){
		if(err) console.log(err)
		console.log(messages)
		res.render('admin/messages_list',{
			title: "用户留言列表",
			messages: messages
		})
	})
}