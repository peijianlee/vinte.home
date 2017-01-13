var News = require('../models/news')
var _ = require('underscore')
var fs = require('fs')

//新建文章
exports.news = function(req,res){
	res.render('admin/news_add',{
		title:'新建文章编辑页'
	})
}

//news post page
exports.save = function(req,res){
	var newsObj = req.body.news
	var id = newsObj._id

	var	news = new News(newsObj)

	
	if(id){
		// 更新
		News.findById(id, function(err, _news){
			if(err)console.log(err)

			// 如果都未修改过的则不更新直接跳转到列表
			if(_news.title==newsObj.title && _news.content==newsObj.content){
				res.redirect('/admin/news/list')
			}else{
				// 使用underscore模块的extend函数更新变化的属性
				_news = _.extend(_news, newsObj)
				// 清除所有标签
				var _content = _news.content
				_content = _content.replace(/<\/?[^>]*>/g,''); //去除HTML tag
				_content = _content.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
				_content=_content.replace(/ /ig,'');//去掉
				_news.text = _content

				_news.save(function(err,_news){
					if(err)console.log(err)
					res.redirect('/admin/news/list')
				})
			}
		})
	}else{
		// 新增文章
		// 清除所有标签
		var _content = news.content
		_content = _content.replace(/<\/?[^>]*>/g,''); //去除HTML tag
		_content = _content.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
		_content=_content.replace(/ /ig,'');//去掉 
		news.text = _content

		news.save(function(err,newsObj){
			if(err)console.log(err)
			res.redirect('/admin/news/list')
		})

	}
}



// news update page
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		News.findById(id,function(err,news){
			if(err)console.log(err)
			res.render('admin/news_update',{
				title: '修改文章详情页',
				news: news
			})
		})
	}
}

//index news list page
exports.indexlist = function(req,res){
	News.fetch(function(err,news){
		if(err)console.log(err)

		// 查找到该内容下的图片
		for(var i=0; i<news.length; i++){
			findIMAGE(news,i)

			// 截取字符
			var _text = news[i].text
			_text.substring(0,50)
			news[i].text = news[i].text.substring(0,200)
		}
		res.render('news_index', {
			title: 'icoom文章列表页',
			news: news
		})
	})
}

exports.detail = function(req,res){
	var id=req.params.id
	console.log(id)
	
	News.findById(id,function(err,news){
		res.render('news_detail',{
			title: '文章详情页',
			news: news
		})
	})
}



//后台文章列表页
exports.list = function(req,res){
	// .query找到路由上的值
	var page = parseInt(req.query.p,10) || 1 
	var count = 6
	var page = page-1
	var index = page*count


	News
		.find({})
		.sort({_id: -1})
		.exec(function(err, news){
			if(err)console.log(err)

			// 截取当前电影总数
			var results = news.slice(index, index + count)

			for(var i=0; i<news.length; i++){
				findIMAGE(news,i)
			}

			res.render('admin/news_list',{
				title:'后台文章列表页',
				currentPage: (page + 1),
				totalPage: Math.ceil(news.length / count),
				news: results
			})
		})
}

// 查找到该内容下的图片
function findIMAGE(obj,i){
	var _content = obj[i].content
	var imgReg = /<img[^>]*src[=\'\"\s]+([^\"\']*)[\"\']?[^>]*>/gi
	var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
	var arr = _content.match(imgReg)

	if(arr!==null){
		var index = 0
		for(var j=0; j<arr.length; j++) {
			var src = arr[j].match(srcReg)
			if(src[1]){
				obj[i].img[index++]=src[1]
			}
		}	
	}
}
// ueditor删除图片
exports.uedel = function(req,res){
	var name=req.query.name

	// fs.unlink('public/news/'+img, function(err) {
	fs.unlink('public/'+name, function(err) {
		if (err){
			console.error(err)
			res.json({success:0})
		}
		res.json({success:1})
		console.log("文件删除成功！")
	});
}