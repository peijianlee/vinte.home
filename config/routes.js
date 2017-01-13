// 引入controllers的控制器
var _ = require('underscore')
var Index = require('../app/controllers/index')
var News = require('../app/controllers/news')
var User = require('../app/controllers/user')
var Movie = require('../app/controllers/movie')
var Comment = require('../app/controllers/comment')
var Category = require('../app/controllers/category')
var Banner = require('../app/controllers/banner')


module.exports = function(app){
	// pre handle user
	app.use(function(req,res,next){
		var _user = req.session.user
		app.locals.user = _user

		next()
	})

	//Index
	app.get('/', Index.index)
	// results
	app.get('/results', Index.search)
	// 错误页
	app.use(function (err, req, res, next) {
	    res.status(err.status || 500);
	    res.render('error', {
	        message: err.message,
	        error: {}
	    });
	});

	// news
	app.get('/news/:id', News.detail)
	app.get('/news', News.indexlist)
	app.get('/admin/news/new', News.news)
	app.post('/admin/news', News.save)
	app.post('/admin/news/uedel', News.uedel)
	app.get('/admin/news/update/:id', News.update)
	app.get('/admin/news/list', News.list)

	//User
	app.post('/user/signup', User.signup)
	app.post('/user/signin', User.signin)
	app.get('/signin', User.showSignin)
	app.get('/signup', User.showSignup)
	app.get('/logout', User.logout)
	app.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)
	app.delete('/admin/user/list', User.signinRequired, User.adminRequired, User.del)

	//Movie
	app.get('/movie/:id', Movie.detail)
	app.post('/admin/movie', User.signinRequired, User.adminRequired, Movie.savePoster, Movie.save)
	app.get('/admin/movie/update/:id', User.signinRequired, User.adminRequired, Movie.update)
	app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new)
	app.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
	app.delete('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.del)

	// Comment
	app.post('/user/comment', User.signinRequired, Comment.save)

	// category
	app.get('/admin/movie/category/new', User.signinRequired, User.adminRequired, Category.new)
	app.post('/admin/movie/category', User.signinRequired, User.adminRequired, Category.save)
	app.get('/admin/movie/category/list', User.signinRequired, User.adminRequired, Category.list)
	app.get('/admin/movie/category/update/:id', User.signinRequired, User.adminRequired, Category.update)
	app.delete('/admin/movie/category/list', User.signinRequired, User.adminRequired, Category.del)

	// banner
	app.get('/admin/banner/new', User.signinRequired, User.adminRequired, Banner.new)
	app.post('/admin/banner', User.signinRequired, User.adminRequired, Banner.saveImage, Banner.save)
	app.get('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.list)
	app.get('/admin/banner/update/:id', User.signinRequired, User.adminRequired, Banner.update)
	app.delete('/admin/banner/list', User.signinRequired, User.adminRequired, Banner.del)

}