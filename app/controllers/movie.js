
var Movie = require('../models/movie')
var Category = require('../models/category')
var Comment = require('../models/comment')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')


//detail page
exports.detail = function(req,res){
	var id=req.params.id

	Movie.update({_id:id},{$inc:{pv:1}},function(err){
		if(err) console.log(err)
	})

	// 查找到movie再查下面的评论
	Movie.findById(id,function(err,movie){
		Comment
			.find({movie: id})
			.populate('from', 'name')
			.populate('reply.from reply.to', 'name')
			.exec(function(err,comments){
				console.log(comments)
				res.render('detail',{
					title: 'nodeJS ' + movie.title,
					movie: movie,
					comments: comments
				})
			})
	})
}

// admin poster
exports.savePoster = function(req,res,next){
	var posterData = req.files.uploadPoster
	var filePath = posterData.path
	var originalFilename = posterData.originalFilename

	console.log(req.files)

	if(originalFilename){
		fs.readFile(filePath,function(err,data){
			var timestamp = Date.now()
			var type = posterData.type.split('/')[1]
			var poster = timestamp + '.' +type
			var newPath = path.join(__dirname, '../../', '/public/upload/'+poster)

			fs.writeFile(newPath, data, function(err){
				if(err)console.log(err)
				req.poster = poster
				next()
			})
		})
	}else{
		next()
	}
}

// admin save movie
exports.save = function(req,res){
	var movieObj = req.body.movie
	var id = movieObj._id
	var categoryId = movieObj.category
	var categoryName = movieObj.categoryName

	// 如果有自定义上传海报  将movieObj中的海报地址改成自定义上传海报的地址
	if(req.poster) movieObj.poster = req.poster

	// 更新电影
	if(id){
		Movie.findById(id, function(err, _movie){
			if(err)console.log(err)

			// 如果修改电影分类
			if(movieObj.category.toString() !== _movie.category.toString()){
				// 找到电影对应的原电影分类
				Category.findById(_movie.category,function(err,_oldCat){
					if(err) console.log(err)

					// 在原电影分类的movies属性中找到该电影的id值并将其删除
					var index = _oldCat.movies.indexOf(id)
					_oldCat.movies.splice(index,1)
					_oldCat.save(function(err){
						if(err) console.log(err)
					})
				})

			 	// 找到电影对应的新电影分类
			 	Category.findById(movieObj.category,function(err,_newCat){
			 		if(err) console.log(err)

			 		// 将其id值添加到电影分类的movies属性中并保存
			 		_newCat.movies.push(id)
			 		_newCat.save(function(err){
			 			if(err) console.log(err)
			 		})
			 	})
			}

			// 使用underscore模块的extend函数更新电影变化的属性
			_movie = _.extend(_movie, movieObj)
			_movie.save(function(err,_movie){
				if(err)console.log(err)

				res.redirect('/movie/' + _movie._id)
			})
		})
	// 新建电影
	}else if(movieObj.title){
		// 查找该电影名称是否已存在
		Movie.findOne({title:movieObj.title},function(err,_movie){
			if(err) console.log(err)
			if(_movie){
				console.log('电影已存在')
				res.redirect('/admin/movie/list')
			}else{
				// 创建新电影
				var newMovie = new Movie(movieObj)
				newMovie.save(function(err,_newMovie){
					if(err) console.log(err)

					// 如果选择了电影所属的电影分类
					if(categoryId){
						// 找到对应分类插入电影ID
						Category.findById(categoryId,function(err,_category){
							if(err) console.log(err)

							_category.movies.push(_newMovie._id)

							_category.save(function(err){
								if(err) console.log(err)
								res.redirect('/movie/' + _newMovie._id)
							})
						})
					}else if(categoryName){
						// 查找电影分类是否已存在
						Category.findOne({name:categoryName},function(err,_categoryName){
							if(err) console.log(err)

							if(_categoryName){
								console.log('电影分类已存在')
               					res.redirect('/admin/movie/movieCategory/list')
							}else{
								// 创建电影分类
								var category = new Category({
									name:categoryName,
									movie:[_newMovie._id]
								})
								category.save(function(err,category){
									if(err) console.log(err)
									// 将新创建的电影保存，category的ID值为对应的分类ID值
									_newMovie.category = category._id
									_newMovie.save(function(err,movie){
										if(err) console.log(err)
										res.redirect('/movie/'+movie._id)
									})
									res.redirect('/movie/' + movie._id)
								})
							}
						})
					// 如果没有选择电影所属分类 重定向到当前页
					}else{
						res.redirect('/admin/movie/list')
					}
				})
			}
		})
	// 没有输入电影名称 而只输入了电影分类名称
	}else if(categoryName){
		// 查找电影分类是否已存在
		Category.findOne({name:categoryName},function(err,_categoryName){
			if(err) console.log(err)

			if(_categoryName){
				console.log('电影分类已存在')
			}else{
				// 创建电影分类
				var newCategory = new Category({
					name:categoryName
				})
				newCategory.save(function(err){
					if(err) console.log(err)
					redirect('/movie/' + movie._id)
				})
			}
		})
	// 既没有输入电影名称和分类则数据录入失败 重定向到当前页
	}else{
		res.redirect('/admin/movie/new')
	}
}

//admin new page
exports.new = function(req,res){
	Category.find({}, function(err, categories){
		res.render('admin',{
			title:'nodeJS 后台录入页',
			categories: categories,
			movie: {}
		})
	})
}

// admin update movie
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		Movie.findById(id,function(err,movie){
			Category.find({}, function(err, categories){
				res.render('admin',{
					title: 'nodeJS 后台更新页',
					movie: movie,
					categories: categories
				})
			})
		})
	}
}

// list page
exports.list = function(req, res) {
	Movie.find({})
	.populate('category', 'name')
	.exec(function(err, movies) {
		if (err) console.log(err)

		res.render('list', {
			title: 'imooc 电影列表页',
			movies: movies
		})
	})
}


//list delete movie
exports.del = function(req,res){
	var id = req.query.id
	if(id){
		// 找到该条电影数据
		Movie.findById(id,function(err,movie){
			if(err) console.log(err)

			// 查找包含这条电影的分类
			Category.findById(movie.category,function(err,category){
				if(err) console.log(err)

				if(category){
					// 在电影分类movies数组中查找该值所在位置
					var index = category.movies.indexOf(id);
					// 从分类中删除
					category.movies.splice(index,1);
					category.save(function(err){
						if(err) console.log(err);
					})
				}
			})

			// 找到评论列表并删除
			Comment.remove({movie: id},function(err){
				if(err)console.log(err)
			})

			Movie.remove({_id: id},function(err,movie){
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