
var Movie = require('../models/movie')
var Category = require('../models/category')
var Banner = require('../models/banner')


//index page
exports.index = function(req,res){
	Category
		.find({}).sort({_id: 1})
		.populate({
			path: 'movies',
			options: {limit:6}
		})
		.exec(function(err, categories){
			if(err)console.log(err)

			Banner.fetch(function(err,banners){
				if(err)console.log(err)
				res.render('index',{
					title:'nodeJS 首页',
					categories: categories,
					banners: banners
				})
			})
		})
}


//index page
exports.err = function(req,res, next){
	// console.log('这只是一个404页面')
	// var errinfo = 'Password is not matched'

	// res.render('err',{
	// 	title:'404错误页'
	// })


  // ueditor 客户发起上传图片请求
	if(req.query.action === 'uploadimage'){

		// 这里你可以获得上传图片的信息
		var foo = req.ueditor;
		console.log(foo.filename); // exp.png
		console.log(foo.encoding); // 7bit
		console.log(foo.mimetype); // image/png

		// 下面填写你要把图片保存到的路径 （ 以 path.join(__dirname, 'public') 作为根路径）
		var img_url = 'yourpath';
		res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
	}
  //  客户端发起图片列表请求
	else if (req.query.action === 'listimage'){
		var dir_url = 'your img_dir'; // 要展示给客户端的文件夹路径
		res.ue_list(dir_url) // 客户端会列出 dir_url 目录下的所有图片
	}
  // 客户端发起其它请求
	else {

		res.setHeader('Content-Type', 'application/json');
		// 这里填写 ueditor.config.json 这个文件的路径
		res.redirect('/ueditor/ueditor.config.json')
	}
}


//search page
exports.search = function(req,res){
	// .query找到路由上的值
	var catId = req.query.cat
	var page = parseInt(req.query.p,10) || 0 
	var q = req.query.q
	var count = 2
	var index = page*count

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

				res.render('results',{
					title:'电影分类列表页',
					keyword: category.name,
					currentPage: (page + 1),
					query: 'cat='+catId,
					totalPage: Math.ceil(movies.length / count),
					movies: results
				})
			})
		}else{
			Movie
				.find({title: new RegExp(q+'.*','i')})
				.exec(function(err, movies){
					if(err)console.log(err)

					var results = movies.slice(index, index + count)

					res.render('results',{
						title:'搜索结果页',
						keyword: '搜索到 '+movies.length+' 条关键词为 " '+q+' " 的电影',
						currentPage: (page + 1),
						query: 'q='+q,
						totalPage: Math.ceil(movies.length / count),
						movies: results
					})

				})
		}
}