var News = require('../models/news')
var fs = require('fs')

//新建文章
exports.news = function(req,res){
	res.render('news_add',{
		title:'新建文章编辑页'
	})
}

//index news list page
exports.indexlist = function(req,res){
	News.fetch(function(err,news){
		if(err)console.log(err)

		// 查找到该内容下的图片
		for(var i=0; i<news.length; i++){
			var _content = news[i].content
			var imgReg = /<img[^>]*src[=\'\"\s]+([^\"\']*)[\"\']?[^>]*>/gi
			var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
			var arr = _content.match(imgReg)

			console.log(arr)

			if(arr!==null){
				var index = 0
				for(var j=0; j<arr.length; j++) {
					var src = arr[j].match(srcReg)
					if(src[1]){
						news[i].img[index++]=src[1]
					}
				}	
			}
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



//admin news list page
exports.list = function(req,res){
	News.fetch(function(err,news){
		if(err)console.log(err)

		// 查找到该内容下的图片
		for(var i=0; i<news.length; i++){
			var _content = news[i].content
			var imgReg = /<img[^>]*src[=\'\"\s]+([^\"\']*)[\"\']?[^>]*>/gi
			var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
			var arr = _content.match(imgReg)

			console.log(arr)

			if(arr!==null){
				var index = 0
				for(var j=0; j<arr.length; j++) {
					var src = arr[j].match(srcReg)
					if(src[1]){
						news[i].img[index++]=src[1]
					}
				}	
			}
		}
		

		res.render('news_list', {
			title: '后台文章列表页',
			news: news
		})
	})
}

//news post page
exports.save = function(req,res){
	var newsObj = req.body.news
	var id = newsObj._id

	if(req.imgsrc) newsObj.imgsrc = req.imgsrc

	var	news = new News(newsObj)

	
	if(id){
		// 更新
		News.findById(id, function(err, _news){
			if(err)console.log(err)

			// 删除文件
			// 修改后的文件名
			var imageFileName = newsObj.imgsrc
			// 修改前的文件名
			var _imageFileName = _news.imgsrc
			if(imageFileName!==_imageFileName){
				delNewsImg(_imageFileName)
			}
			// 使用underscore模块的extend函数更新电影变化的属性
			_news = _.extend(_news, newsObj)
			_news.save(function(err,_news){
				if(err)console.log(err)
				res.redirect('/admin/news/list')
			})
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
// ueditor删除图片
exports.uedel = function(req,res){
	var name=req.query.name
	console.log('----------------');
	console.log(name);
	console.log('----------------');

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