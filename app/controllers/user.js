var User = require('../models/user')


// 随机背景图
var bgsrc = [
	'http://i4.piimg.com/11340/7f638e192b9079e6.jpg',
	'http://tupian.enterdesk.com/2013/mxy/12/10/15/3.jpg',
	'http://tupian.enterdesk.com/2014/mxy/02/11/4/4.jpg',
	'http://www.pp3.cn/uploads/allimg/111111/092019C09-12.jpg',
	'http://tupian.enterdesk.com/2012/1030/gha/2/enterdesk%20%284%29.jpg',
	'http://www.pp3.cn/uploads/201608/201608192.jpg']
// 随机背景图
var bgwords = [
	"Genius only means hard-working all one's life.",
	"Cease to struggle and you cease to live.",
	"A strong man will struggle with the storms of fate.",
	"Living without an aim is like sailing without a compass.",
	"Live a noble and honest life. Reviving past times in your old age will help you to enjoy your life again.",
	"Accept what was and what is, and you’ll have more positive energy to pursue what will be.",
	"Behind every successful man there's a lot u unsuccessful years. ",
	"Enrich your life today,. yesterday is history.tomorrow is mystery.",
	"You have to believe in yourself. That's the secret of success."]
exports.showSignup = function(req, res){
	var bgword = bgwords
	var bgword = bgword[Math.floor(Math.random()*bgword.length)]
	var bgimg = bgsrc
	var bgimg = bgimg[Math.floor(Math.random()*bgimg.length)]
	res.render('signup',{
		title: '用户注册',
		bgword: bgword,
		bgsrc: bgimg
	})
}
// 判断用户是否已经登录
exports.userRequired = function(req,res,next){
	var user = req.session.user

	if(user){
		console.log('用户已登录')
		return res.redirect('/news')
	}
	next()
}
exports.showSignin = function(req, res){
	var name = req.query.name
	var password = req.query.password
	var bgword = bgwords
	var bgword = bgword[Math.floor(Math.random()*bgword.length)]
	var bgimg = bgsrc
	var bgimg = bgimg[Math.floor(Math.random()*bgimg.length)]
	res.render('signin',{
		title: '用户登陆',
		name: name,
		password: password,
		bgword: bgword,
		bgsrc: bgimg
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
				if(err) console.log(err)
				console.log(user)

				res.redirect('/')
			})
		}
	})
}

// signin
exports.signin = function(req, res){
	// var _user=req.body.user

	var name=req.query.name
	var password=req.query.password

	User.findOne({name: name},function(err, user){
		if(err) console.log(err)
		if(!user){
			console.log('undefined user')
			return res.json({success:2})

			// return res.redirect('/signup')
		}

		user.comparePassword(password, function(err, isMatch){
			if(err) console.log(err)
			if(isMatch && password!=='') {
				console.log('Password is matched')
				// 登录信息存储在session
				req.session.user = user
				// return res.redirect('/')
				res.json({success:1})
			}else{
				console.log('Password is not matched')
				// return res.redirect('/signin?name='+name+'&password=notmatched')
				res.json({success:0})
			}
		})
	})
}

// logout
exports.logout = function(req, res){
	delete req.session.user
	// delete app.locals.user
	res.redirect('/news')
}

//userlist page
exports.list = function(req,res){
	User.fetch(function(err,users){
		if(err)console.log(err)

		res.render('admin/user_list', {
			title: '用户列表页',
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
		return res.render('prompt',{
			message:'你的权限不够，无法访问该页面！'
		})
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