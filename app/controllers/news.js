"use strict"
var News = require('../models/news')
var Category = require('../models/category')
var Banner = require('../models/banner')
var Comment = require('../models/comment')
var _ = require('underscore')
var fs = require('fs')
var moment = require('moment')




//ueditor
exports.ue = function (req, res, next) {

    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/ue_images';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }

    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/ue_images';
        res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/libs/ueditor/nodejs/config.json')
    }

}
//新建文章
exports.news = function(req,res){

	// 生成随机数
	var count=3000;
	var originalArray=new Array;
	console.log('----原数组------')
	for(var i=0;i<count;i++){
		originalArray[i]=i+1
	}
	var dl = new Date().getTime()
	originalArray.sort(function(){
		return 0.5 - Math.random()
	})

	console.log(new Date().getTime()+Math.round(Math.random()*500+499))


	Category.find({type:'news'}, function(err, categories){
		if(err)console.log(err)
		res.render('admin/news_add',{
			title:'新建文章编辑页',
			categories: categories,
			news: {}
		})
	})
}

// news update page
exports.update = function(req,res){
	var id = req.params.id
	console.log(id)

	if(id){
		Category.find({type:'news'}, function(err, categories){
			News.findById(id,function(err,news){
				if(err)console.log(err)
				res.render('admin/news_add',{
					title: '修改文章详情页',
					categories: categories,
					news: news
				})
			})
		})
	}
}

//news post page
exports.save = function(req,res){
	var newsObj = req.body.news
	var id = newsObj._id
	var categoryId = newsObj.category


	
	if(id){
		// 更新
		News.findById(id, function(err, _news){
			if(err)console.log(err)

			if(_news.title==newsObj.title && _news.content==newsObj.content && newsObj.category.toString()==_news.category.toString()){
				console.log('没有更新')
				res.redirect('/admin/news/list')

				return false
			}

			// 如果修改文章分类
			if(newsObj.category.toString() !== _news.category.toString()){
				// 找到文章对应的原文章分类
				Category.findById(_news.category,function(err,_oldCat){
					if(err) console.log(err)

					// 在原文章分类的news属性中找到该文章的id值并将其删除
					var index = _oldCat.news.indexOf(id)
					_oldCat.news.splice(index,1)
					_oldCat.save(function(err){
						if(err) console.log(err)
					})
				})

			 	// 找到文章对应的新文章分类
			 	Category.findById(newsObj.category,function(err,_newCat){
			 		if(err) console.log(err)

					// 添加类别名称
					// _news.categoryname = _newCat.name
			 		// 将其id值添加到文章分类的news属性中并保存
			 		_newCat.news.push(id)
			 		_newCat.save(function(err){
			 			if(err) console.log(err)
			 		})
			 	})
			}


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
		})
	}else{
		// 创建新文章
		var	news = new News(newsObj)

		// 找到对应分类插入文章ID
		Category.findById(categoryId,function(err,_category){
			if(err) console.log(err)

			// 添加类别名称
			news.categoryname = _category.name
			// 清除所有标签并保存在text
			var _content = news.content
			_content = _content.replace(/<\/?[^>]*>/g,''); //去除HTML tag
			_content = _content.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
			_content=_content.replace(/ /ig,'');//去掉 
			news.text = _content
			// 保存文章数据
			news.save(function(err,_newNews){
				if(err) console.log(err)

				// 在文章分类添加选中的类别
				_category.news.push(_newNews._id)
				_category.save(function(err){
					if(err) console.log(err)
					res.redirect('/admin/news/list')
				})
			})
		})

	}
}



//index news list page
exports.indexlist = function(req,res){
	var skip = parseInt(req.query.skip) || 0
	var limit = 2
	News
		.find({})
		.limit(limit)
		.skip(skip*limit)
		.exec(function(err,news){
			if(err)console.log(err)
			// 查找到该内容下的图片
			for(var i=0; i<news.length; i++){
				findIMAGE(news,i)

				// 截取字符
				var _text = news[i].text
				_text.substring(0,50)
				news[i].text = news[i].text.substring(0,200)

			}
			// 初始加载
			if(skip == 0){
				Category.find({type:'news'}, function(err, categories){
					if(err) console.log(err)
					Banner.find({}, function(err, banners){
						res.render('news_index', {
							title: 'icoom文章列表页',
							news: news,
							categories: categories,
							banners: banners
						})
					})
				})
			// 加载更多
			}else{
				if(err){
					console.log(err)
					res.json({success:0})
				}else{
					res.json({news:news})
				}

			}
		})
}

//admin news list page
exports.list = function(req,res){
	// .query找到路由上的值
	var page = parseInt(req.query.p,10) || 1 
	var count = 6
	var page = page-1
	var index = page*count


	News
		.find({})
		.sort({_id: -1})
		.populate('category', 'name')
		.populate('uid', 'name')
		.exec(function(err, news){
			if(err)console.log(err)
			// 截取当前文章总数
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

// 浏览量
exports.pv = function(req,res,next){
	var id=req.params.id
	News.update({_id:id},{$inc:{pv:1}},function(err){
		if(err) console.log(err)
	})
	next()
}
// 文章详情
exports.detail = function(req,res){
	// 显示数量
	var num = 5
	var isAjaxGet = false
	if(!req.query.id){
		var id=req.params.id
		var skip = 0
	}else{
		isAjaxGet = true
		var id=req.query.id
		var skip = req.query.pagenum*num
	}
	var index = 0 + skip
	var pagenum = num + skip
	

	// 查找到news再查下面的评论
	News.findById(id,function(err,news){
		if(err)console.log(err)
		if(!news){
			console.log('该文章不存在或者已经被删除了。')
			return res.render('prompt',{
				message:'该文章不存在或者已经被删除了。'
			})
		}
		Comment
			.find({news: id})
			.sort({_id: -1})
			.populate('from', 'name avatar')
			.populate('reply.from reply.to', 'name avatar')
			.exec(function(err,comments){
				// 截取当前评论总数
				var totalcomments = comments.length
				var page = totalcomments / num
				var totalPage = Math.ceil(page)

				if(!isAjaxGet){
					// 初始加载
					if(totalcomments>num){
						var results = comments.slice(index, pagenum)
						comments = results
					}


					res.render('news_detail',{
						title: 'nodeJS ' + news.title,
						news: news,
						comments: comments,
						totalcomments: totalcomments || 0,
						totalPage: totalPage,
					})

				}else{
					// ajax加载
					var results = comments.slice(index, pagenum)
					comments = results
					console.log(comments)
					if(err){
						console.log(err)
						res.json({success:0})
					}else{
						res.json({
							comments:comments,
							totalcomments:totalcomments,
							totalPage:totalPage
						})
						isAjaxGet = false
					}


				}
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

//news delete category
exports.del = function(req,res){
	var id = req.query.id

	if(id){
		News.findById(id,function(err,news){
			if(err) console.log(err)
			// 查找包含这条文章的分类
			Category.findById(news.category,function(err,category){
				if(err) console.log(err)

				if(category){
					// 在文章分类movies数组中查找该值所在位置
					var index = category.news.indexOf(id);
					// 从分类中删除
					category.news.splice(index,1);
					category.save(function(err){
						if(err) console.log(err);
					})
				}
			})
			// 删除文章下的所以评论
			Comment.remove({news: id},function(err){
				if(err) console,log(err)
			})
			// 删除
			News.remove({_id: id},function(err,news){
				if(err){
					console.log(err)
					res.json({success:0})
				}else{
					res.json({success:1})
				}
			})
		})
	}
}