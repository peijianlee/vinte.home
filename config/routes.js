// 引入controllers的控制器
var _ = require('underscore')
var Index = require('../app/controllers/index')
var News = require('../app/controllers/news')
var Product = require('../app/controllers/product')
// var Newscategory = require('../app/controllers/news_category')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
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
	app.get('/results', Global.fetchAllCategoryType, Global.categoryTypeHref, Product.search)
	// 错误页
	
	app.use(function (err, req, res, next) {
	    res.status(err.status || 500)
	    res.render('error', {
	        message: err.message,
	        error: {}
	    })
	})


	app.post('/message', Index.message)

	// product
	// app.get('/store', Product.store)
	app.get('/store', User.createCaptcha, Global.fetchAllCategoryType, Global.categoryTypeHref, Product.search)
	app.get('/store/id/:id', User.createCaptcha, Product.detail)
	app.get('/store/sort/:sort', User.createCaptcha, Global.fetchAllCategoryType, Global.categoryTypeHref, Product.sort)
	app.get('/store/material/:material', Product.sort)
	app.post('/goods/favourite', Product.favourite)
	app.get('/admin/product/list', User.signinRequired, User.adminRequired, Product.list)
	app.get('/admin/product/category/list', User.signinRequired, User.adminRequired, Global.fetchAllCategoryType, Category.list)
	app.post('/admin/product', User.signinRequired, User.adminRequired, Product.save)
	app.get('/admin/product/add', User.signinRequired, User.adminRequired, Product.new)
	app.post('/admin/product/changecategory', User.signinRequired, User.adminRequired, Product.changecategory)
	app.get('/admin/product/update/:id', User.signinRequired, User.adminRequired, Product.new)
	app.post('/admin/update/checkedimagesdata', Product.checkImageData)
	app.post('/admin/product/update/photo', User.signinRequired, User.adminRequired, Product.updatephoto)
	app.post('/admin/product/update/content', User.signinRequired, User.adminRequired, Product.updatecontent)
	app.delete('/admin/product/list', User.signinRequired, User.adminRequired, Product.del)
	
	// shopcart
	// app.get('/shopcart', Shopcart.matchcart, Shopcart.detail)
	app.get('/inquiry', User.createCaptcha, Shopcart.detail)
	app.post('/create/inquiry/info', Shopcart.createInquiryInfo)
	app.post('/create/inquiry/success', Shopcart.createInquirySuccess)
	app.post('/shopcart/add', Shopcart.add)
	app.delete('/shopcart/del', Shopcart.del)


	// 后台首页
	app.get('/admin/index', User.signinRequired, User.adminRequired, Index.admin)
	// 用户留言
	app.get('/admin/messages/list', User.signinRequired, User.adminRequired, Index.messageList)
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
	app.get('/user/:name', User.signinRequired, User.detail)
	app.get('/user/:name/:page', User.signinRequired, User.detail)
	app.get('/user/:name/:page/:id', User.signinRequired, User.detail)
	app.post('/user/changeword', User.signinRequired, User.changeword)
	app.get('/captcha',User.createCaptcha)
	app.post('/user/signup', User.signup, Shopcart.matchcart)
	app.post('/user/signin', User.checkedCaptcha, User.signin, Shopcart.matchcart)
	app.get('/signup', User.userRequired, User.createCaptcha, User.showSignup)
	app.get('/signin', User.userRequired, User.createCaptcha, User.showSignin)
	app.get('/logout', User.logout)
	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)
	app.get('/admin/user/:name', User.signinRequired, User.adminRequired, User.adminDetail)
	app.delete('/admin/user/list', User.signinRequired, User.adminRequired, User.del)

	//Movie
	app.get('/movie/:id', Movie.detail)
	app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save)
	app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
	app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
	app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
	app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)
	app.get('/admin/movie/category/list', User.signinRequired, User.adminRequired, Category.list)

	// category
	app.post('/admin/category/save', User.signinRequired, User.adminRequired, Category.save)
	app.delete('/admin/category/list', User.signinRequired, User.adminRequired, Category.del)

	// Comment
	app.post('/user/save', User.signinRequired, Comment.save)
	app.post('/user/comment', User.signinRequired, Comment.comment)

	// banner
	app.get('/admin/banner/new', User.signinRequired, User.adminRequired, Banner.new)
	app.post('/admin/banner', User.signinRequired, User.adminRequired, Banner.saveImage, Banner.save)
	app.get('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.list)

	app.get('/admin/goods/pstyle/banner/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	app.get('/admin/goods/sort/banner/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	app.get('/admin/goods/scene/banner/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)
	app.get('/admin/goods/material/banner/list', User.signinRequired, User.adminRequired, Banner.goodsbanner)

	app.get('/admin/goods/banner/update/:id', User.signinRequired, User.adminRequired, Banner.goodsbannerupdate)
	app.post('/admin/goods/banner/save', User.signinRequired, User.adminRequired, Banner.saveImage, Banner.goodsbannersave)
	app.get('/admin/banner/update/:id', User.signinRequired, User.adminRequired, Banner.update)
	app.delete('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.del)


	// api接口
	app.get('/api/products', Api.products)
	app.get('/api/product/:id', Api.product)
	app.get('/api/categories', Api.categories)
	app.get('/api/categories/:sort', Api.sort)

}