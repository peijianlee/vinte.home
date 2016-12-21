var User = require('../models/user')


exports.showSignup = function(req, res){
	res.render('signup',{
		title: '注册页面'
	})
}
exports.showSignin = function(req, res){
	var name = req.query.name
	var password = req.query.password
	res.render('signin',{
		title: '登录页面',
		name: name,
		password: password
	})
}
// signup
exports.signup = function(req, res){
	var _user =req.body.user
	
	User.findOne({name: _user.name},function(err,user){
		if(err){
			console.log('服务器异常' + err)
		}
		if(user && user.name!==''){
			console.log('用户名已经存在')
		console.log(user)
			return res.redirect('/signin?name='+user.name)
		}else{
			var user = new User(_user)

			user.save(function(err, user) {
				if(err){
					console.log(err)
				}
				console.log(user)

				res.redirect('/')
			})
		}
	})
}

// signin
exports.signin = function(req, res){
	var _user=req.body.user
	var name=_user.name
	var password=_user.password

	User.findOne({name: name},function(err, user){
		if(err) console.log(err)
		if(!user){
			console.log('undefined user')
			return res.redirect('/signup')
		}

		user.comparePassword(password, function(err, isMatch){
			if(err) console.log(err)
			if(isMatch && password!=='') {
				console.log('Password is matched')
				// 登录信息存储在session
				req.session.user = user
				return res.redirect('/')
			}else{
				console.log('Password is not matched')
				return res.redirect('/signin?name='+name+'&password=notmatched')
			}
		})
	})
}

// logout
exports.logout = function(req, res){
	delete req.session.user
	// delete app.locals.user
	res.redirect('/')
}

//userlist page
exports.list = function(req,res){
	User.fetch(function(err,users){
		if(err)console.log(err)

		res.render('userlist', {
			title: 'imooc 用户列表页',
			users: users
		})
	})
}

exports.signinRequired = function(req,res,next){
	var user = req.session.user

	if(!user){
		console.log('未登录')
		return res.redirect('/signin')
	}

	next()
}

exports.adminRequired = function(req,res,next){
	var user = req.session.user

	if(user.role <=10){
		console.log('没有权限')
		return res.redirect('/signin')
	}

	next()
}

//userlist delete user
exports.del = function(req,res){
	var id = req.query.id
	if(id){
		User.remove({_id: id},function(err,users){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
			}
		})
	}
}