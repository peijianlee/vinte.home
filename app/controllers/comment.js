
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