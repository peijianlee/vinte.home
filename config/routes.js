// 引入controllers的控制器
var _ = require('underscore')
var Index = require('../app/controllers/index')
var News = require('../app/controllers/news')
var Goods = require('../app/controllers/goods')
// var Newscategory = require('../app/controllers/news_category')
var User = require('../app/controllers/user')
var Comment = require('../app/controllers/comment')
var Category = require('../app/controllers/category')
var Banner = require('../app/controllers/banner')
var Shopcart = require('../app/controllers/shopcart')
var Inquiry = require('../app/controllers/inquiry')
var Global = require('../app/controllers/global')
var Api = require('../app/controllers/api')
var ueditor = require('ueditor')

var path = require('path')

module.exports = function(app){
	// pre handle user
	app.use( function (req, res, next) {
		var _user = req.session.user
		app.locals.user = _user
		return next()
	})

	//Index
	app.get('/', User.createCaptcha, Index.index)
	app.get('/send', Index.send)
	// results
	app.get('/results', Global.fetchAllCategoryType, Global.categoryTypeHref, Goods.search)
	// 错误页
	app.use(function (err, req, res, next) {
	    res.status(err.status || 500)
	    res.render('error', {
	        message: err.message,
	        error: {}
	    })
	})


	app.post('/message', Index.message)

	// goods
	// app.get('/store', Goods.store)
	app.get('/store', User.createCaptcha, Goods.search)
	app.get('/goods/id/:id', User.createCaptcha, Goods.detail)
	// app.get('/store/sort/:sort', User.createCaptcha, Global.fetchAllCategoryType, Global.categoryTypeHref, Goods.sort)
	app.get('/store/:category_name/:target_id_cn_name', Goods.sort)
	app.post('/goods/favourite', Goods.favourite)

	// admin goods
	app.get('/admin/goods/list', User.signinRequired, User.adminRequired, Goods.list)
	app.post('/admin/goods/save', User.signinRequired, User.adminRequired, Goods.save)
	app.get('/admin/goods/add', User.signinRequired, User.adminRequired, Goods.new)
	app.post('/admin/goods/category/change', User.signinRequired, User.adminRequired, Goods.changecategory)
	app.get('/admin/goods/update/:id', User.signinRequired, User.adminRequired, Goods.new)
	app.post('/admin/update/checkedimagesdata', Goods.checkImageData)
	app.post('/admin/goods/update/photo', User.signinRequired, User.adminRequired, Goods.updatephoto)
	app.post('/admin/goods/update/content', User.signinRequired, User.adminRequired, Goods.updatecontent)
	app.delete('/admin/goods/del', User.signinRequired, User.adminRequired, Goods.del)
	
	// shopcart
	// app.get('/shopcart', Shopcart.matchcart, Shopcart.detail)
	app.get('/inquiry', User.createCaptcha, Shopcart.detail)
	app.get('/create/inquiry/info', Shopcart.createInquiryInfo)
	app.get('/create/inquiry/success/:id', Shopcart.createInquirySuccess)
	app.post('/create/inquiry', Shopcart.createInquiry)
	app.post('/shopcart/add', Shopcart.add)
	app.delete('/shopcart/del', Shopcart.del)

	// 后台首页
	app.get('/admin/index', User.signinRequired, User.adminRequired, Index.admin)

	// 用户留言
	app.get('/admin/messages/list', User.signinRequired, User.adminRequired, Index.messageList)
	app.delete('/admin/messages/del', User.signinRequired, User.adminRequired, Index.messageDel)

	// Inquiry
	app.get('/admin/inquiry/list', User.signinRequired, User.adminRequired, Inquiry.adminList)
	app.get('/admin/inquiry/:id', User.signinRequired, User.adminRequired, Inquiry.detail)
	app.post('/inquiry/delete', User.signinRequired, User.adminRequired, Inquiry.delete)

	// news
	app.get('/news/:id', News.pv, News.detail)
	app.get('/news/comment', News.detail)
	app.get('/news', News.indexlist)
	app.get('/admin/news/new', User.signinRequired, User.adminRequired, News.news)
	app.post('/admin/news', User.signinRequired, User.adminRequired, News.save)
	app.post('/admin/news/uedel', User.signinRequired, User.adminRequired, News.uedel)
	app.get('/admin/news/update/:id', User.signinRequired, User.adminRequired, News.update)
	app.get('/admin/news/list', User.signinRequired, User.adminRequired, News.list)
	app.get('/admin/news/category/list', User.signinRequired, User.adminRequired, Category.list)
	app.delete('/admin/news/list', User.signinRequired, User.adminRequired, News.del)

	//User
	app.get('/captcha',User.createCaptcha)
	app.get('/user/:name', User.signinRequired, User.detail)
	// app.get('/user/:name/:page', User.signinRequired, User.detail)
	// app.get('/user/:name/:page/:id', User.signinRequired, User.detail)
	app.get('/user/:name/inquiries', User.signinRequired, User.inquiries)
	app.get('/user/:name/inquiries/:id', User.signinRequired, User.inquiries)
	app.get('/user/:name/favourite', User.signinRequired, User.favourite)
	app.get('/signup', User.userRequired, User.createCaptcha, User.sign)
	app.get('/signin', User.userRequired, User.createCaptcha, User.sign)
	app.get('/logout', User.logout)
	app.post('/user/changeword', User.signinRequired, User.changeword)
	app.post('/user/signup', User.signup, Shopcart.matchcart)
	app.post('/user/signin', User.checkedCaptcha, User.signin, Shopcart.matchcart)

	// 后台用户列表
	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)
	app.get('/admin/user/:name', User.signinRequired, User.adminRequired, User.adminDetail)
	app.delete('/admin/user/del', User.signinRequired, User.adminRequired, User.del)

	// category
	// app.get('/admin/goods/category/list', User.signinRequired, User.adminRequired, Global.fetchAllCategoryType, Category.list)
	app.get('/admin/goods/category/list', User.signinRequired, User.adminRequired, Category.list)
	app.post('/admin/category/save', User.signinRequired, User.adminRequired, Category.save)
	app.delete('/admin/category/del', User.signinRequired, User.adminRequired, Category.del)

	// Comment
	app.post('/user/save', User.signinRequired, Comment.save)
	app.post('/user/comment', User.signinRequired, Comment.comment)

	// banner
	app.get('/admin/banner/new', User.signinRequired, User.adminRequired, Banner.new)
	app.post('/admin/banner', User.signinRequired, User.adminRequired, Banner.saveImage, Banner.save)
	app.get('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.list)

	app.get('/admin/banner/:attr/list', User.signinRequired, User.adminRequired, Banner.goodsBanner)
	// app.get('/admin/banner/style/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	// app.get('/admin/banner/sort/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	// app.get('/admin/banner/scene/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	// app.get('/admin/banner/material/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)

	app.get('/admin/banner/info/:id', User.signinRequired, User.adminRequired, Banner.getBannerInfo)
	app.post('/admin/banner/save', User.signinRequired, User.adminRequired, Banner.saveImage, Banner.goodsBannerSave)
	app.get('/admin/banner/update/:id', User.signinRequired, User.adminRequired, Banner.update)
	app.delete('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.del)


	// api接口
	// app.get('/api/products', Api.products)
	// app.get('/api/product/:id', Api.product)
	app.get('/api/categories', Api.categories)
	app.get('/api/categories/:sort', Api.sort)

	app.post('/api/goods/addcart', Api.addShoppingCart)
}