"use strict"
var News = require('../models/news')
var Newscategory = require('../models/news_category')
var Banner = require('../models/banner')
var _ = require('underscore')
var fs = require('fs')

//新建文章
exports.news = function(req,res){
	Newscategory.find({}, function(err, newscategories){
		if(err)console.log(err)
		res.render('admin/news_add',{
			title:'新建文章编辑页',
			newscategories: newscategories,
			news: {}
		})
	})
}

// news update page
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		Newscategory.find({}, function(err, newscategories){
			News.findById(id,function(err,news){
				if(err)console.log(err)
				res.render('admin/news_update',{
					title: '修改文章详情页',
					newscategories: newscategories,
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
	var newscategoryId = newsObj.newscategory


	
	if(id){
		// 更新
		News.findById(id, function(err, _news){
			if(err)console.log(err)

			if(_news.title==newsObj.title && _news.content==newsObj.content && newsObj.newscategory.toString()==_news.newscategory.toString()){
				console.log('没有更新')
				res.redirect('/admin/news/list')

				return false
			}

			// 如果修改文章分类
			if(newsObj.newscategory.toString() !== _news.newscategory.toString()){
				// 找到文章对应的原文章分类
				Newscategory.findById(_news.newscategory,function(err,_oldCat){
					if(err) console.log(err)

					// 在原文章分类的news属性中找到该文章的id值并将其删除
					var index = _oldCat.news.indexOf(id)
					_oldCat.news.splice(index,1)
					_oldCat.save(function(err){
						if(err) console.log(err)
					})
				})

			 	// 找到文章对应的新文章分类
			 	Newscategory.findById(newsObj.newscategory,function(err,_newCat){
			 		if(err) console.log(err)

					// 添加类别名称
					// _news.newscategoryname = _newCat.name
			 		// 将其id值添加到文章分类的news属性中并保存
			 		_newCat.news.push(id)
			 		_newCat.save(function(err){
			 			if(err) console.log(err)
			 		})
			 	})
			}


			// 使用underscore模块的extend函数更新变化的属性
			_news = _.extend(_news, newsObj)
			console.log('###---------###')
			console.log(_news)
			console.log('###---------###')
			console.log(newsObj)
			console.log('###---------###')
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
		Newscategory.findById(newscategoryId,function(err,_newscategory){
			if(err) console.log(err)

			// 添加类别名称
			news.newscategoryname = _newscategory.name
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
				_newscategory.news.push(_newNews._id)
				_newscategory.save(function(err){
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
		.find({}).limit(limit).skip(skip*limit)
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
				Newscategory.find({}, function(err, newscategories){
					if(err) console.log(err)
					Banner.find({}, function(err, banners){
						res.render('news_index', {
							title: 'icoom文章列表页',
							news: news,
							newscategories: newscategories,
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

exports.detail = function(req,res){
	var id=req.params.id
	console.log(id)
	
	News.update({_id:id},{$inc:{pv:1}},function(err){
		if(err) console.log(err)
	})

	News.findById(id,function(err,news){
		res.render('news_detail',{
			title: '文章详情页',
			news: news
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
			Newscategory.findById(news.newscategory,function(err,newscategory){
				if(err) console.log(err)

				if(newscategory){
					// 在文章分类movies数组中查找该值所在位置
					var index = newscategory.news.indexOf(id);
					// 从分类中删除
					newscategory.news.splice(index,1);
					newscategory.save(function(err){
						if(err) console.log(err);
					})
				}
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