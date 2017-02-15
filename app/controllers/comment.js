
var Comment = require('../models/comment')


// comment
exports.save = function(req,res){
	var _comment = req.body.comment
	var movieId = _comment.movie

	// 是否是要回复
	if(_comment.cid){
		// 找到主评论的内容
		Comment.findById(_comment.cid, function(err, comment){
			var reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content,
				date: Date.now()
			}

			comment.reply.push(reply)

			comment.save(function(err, comment) {
				if(err) console.log(err)
				res.redirect('/movie/'+movieId)
			})
		})
	}else{
		// 没有则新增
		var comment = new Comment(_comment) 
		comment.save(function(err, comment){
			if(err)console.log(err)
			res.redirect('/movie/'+movieId)
		})
	}
}
// comment ajax
exports.comment = function(req,res){
	// var _comment = req.body.comment
	var _comment = req.body
	var movieId = _comment.movie
	console.log(_comment)


	// 是否回复
	if(_comment.cid){
		// 找到主评论的内容
		Comment.findById(_comment.cid, function(err, comment){
			var reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content,
				date: Date.now()
			}
			// 当前显示的评论数量
			var replynum = _comment.replynum
			comment.reply.push(reply)
			// 添加后评论数量
			var _replynum = comment.reply.length

			console.log(replynum+','+_replynum)
			console.log('---------------------')
			var results = comment.reply.slice(replynum, _replynum)
			console.log(results)

			comment.save(function(err, comment) {
				if(err){
					console.log(err)
					res.json({success:2})
				}else{
					res.json({
						success:3,
						reply:results,
						replynum:_replynum
					})
				}
			})
		})
	}else{
		// 新增
		var comment = new Comment(_comment) 
		comment.save(function(err, comment){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}