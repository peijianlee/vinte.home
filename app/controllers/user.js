var User = require('../models/user')

// 登录验证码
var svgCaptcha = require('svg-captcha')
	svgCaptcha.options.height = '30'
	svgCaptcha.options.fontSize = '40'

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
// 判断用户是否已经登录
exports.userRequired = function(req,res,next){
	var user = req.session.user

	if(user){
		console.log('用户已登录')
		return res.redirect('/news')
	}
	next()
}
// 创建验证码
exports.createCaptcha = function(req, res, next){
	var captcha = svgCaptcha.create({
		'size': 4,
		'ignoreChars': '0oO1iIlL',
		'noise': 3,
		'color': false
	})
	req.session.captcha = captcha
	if(req.query.changecaptcha){
		console.log(req.session.captcha.text)
		return res.json({
			success:1,
			captcha: req.session.captcha
		})
	}else{
		next()
	}
}
// 判断验证码
exports.checkedCaptcha = function(req, res, next){
	var captcha=req.query.captcha
	// 全部转为小写进行验证
	if((captcha).toLowerCase() !== (req.session.captcha.text).toLowerCase()){
		console.log('验证码错误，请重新输入。')
		return res.json({success:3})
	}else{
		next()
	}
}
// 登录界面
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
		bgsrc: bgimg,
		captcha: req.session.captcha
	})
}
// 注册界面
exports.showSignup = function(req, res){
	var bgword = bgwords
	var bgword = bgword[Math.floor(Math.random()*bgword.length)]
	var bgimg = bgsrc
	var bgimg = bgimg[Math.floor(Math.random()*bgimg.length)]
	res.render('signup',{
		title: '用户注册',
		bgword: bgword,
		bgsrc: bgimg,
		captcha: req.session.captcha
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
			return res.redirect('/signin?name='+user.name)
		}else{
			var user = new User(_user)

			user.save(function(err, user) {
				if(err) console.log(err)
				// 登录信息存储在session
				req.session.user = user

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
		}

		user.comparePassword(password, function(err, isMatch){
			if(err) console.log(err)
			if(isMatch && password!=='') {
				console.log('Password is matched')
				// 登录信息存储在session
				req.session.user = user
				// 删除验证码信息
				delete req.session.captcha
				res.json({success:1})
			}else{
				console.log('Password is not matched')
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