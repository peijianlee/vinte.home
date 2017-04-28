var User = require('../models/user')
var Order = require('../models/order')



// req.session.destroy() 

// 随机背景图
var bgsrc = [
	'112745__interior-design-style-design-home-lock-room-fireplace_p.jpg',
	'132459__interior-design-style-design-home-house-room-kitchen_p.jpg',
	'191707__interior-room-apartment-design-style-cuisine-dishes-wood-wood-fruit_p.jpg',
	'503033__beautiful-room_p.jpg',
	'719896__room-living-beautiful-paper-wallpaper-walls_p.jpg',
	'720002__room-living-vintage-furniture-ladder-paper-image_p.jpg'
]
// 随机背景图
var bgwords = [
	"我喜欢我望向别处时你落在我身上的目光。",
	"最怕一生碌碌无为，还说平凡难能可贵。",
	"你那么孤独，却说一个人真好。",
	"当你觉得孤独无助时，想一想还有十几亿的细胞只为了你一个人而活。",
	"一个人久了，煮个饺子看见两个粘在一起的也要给它分开！。",
	"我从未拥有过你一秒钟，心里却失去过你千万次。",
	"校服是我和她唯一穿过的情侣装，毕业照是我和她唯一的合影。",
	"人生的出场顺序太重要了。",
	"理想就是离乡。",
	"世界如此广阔，人类却走进了悲伤的墙角。",
	"我想做一个能在你的葬礼上描述你一生的人。",
	"谢谢你陪我校服到礼服。",
	"周杰伦把爱情比喻成龙卷风，我觉得特别贴切。因为很多人，像我。一辈子都没见过龙卷风。",
	"小时候刮奖刮出“谢”字还不扔，非要把“谢谢惠顾”都刮的干干净净才舍得放手，和后来太多的事一模一样。",
	"喜欢这种东西，捂住嘴巴，也会从眼睛里跑出来。",
	"我听过一万首歌，看过一千部电影，读过一百本书，却从未俘获一个人的心。",
	"年轻时我想变成任何人，除了我自己。",
	"我不喜欢这世界，我只喜欢你。",
	"我离天空最近的一次，是你把我高高地举过了你的肩头。"]
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
	// 登录验证码
	var svgCaptcha = require('svg-captcha')
		svgCaptcha.options.height = '30'
		svgCaptcha.options.fontSize = '35'
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
		captcha: req.session.captcha,
		header_hide: true
	})
}
// 注册界面
exports.showSignup = function(req, res){
	var req_path = req.path
	var bgword = bgwords
	var bgword = bgword[Math.floor(Math.random()*bgword.length)]
	var bgimg = bgsrc
	var bgimg = bgimg[Math.floor(Math.random()*bgimg.length)]
	res.render('signup',{
		title: '用户注册',
		bgword: bgword,
		bgsrc: bgimg,
		captcha: req.session.captcha,
		header_hide: true
	})
}
// signup
exports.signup = function(req, res, next){
	var _user =req.body.signup
	
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

				// res.redirect('/store')
				next()
			})
		}
	})
}

// signin 登录
exports.signin = function(req, res, next){
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
				// res.json({success:1})
				next()
			}else{
				console.log('Password is not matched')
				return res.json({success:0})
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

// 用户中心
exports.detail = function(req,res){
	var name=req.params.name
	User.findOne({'name':name},function(err,user){
		if(err) console.log(err)

		if(!user){
			console.log('非法路径或该用户不存在。')
			return res.render('prompt',{
				message:'非法路径或该用户不存在。'
			})
		}else{
			Order
			.find({'uid':user.id})
			.limit(5)
			.exec(function(err, orders){
				if(err) console.log(err)
				res.render('user',{
					title: user.name+'的个人中心',
					user: user,
					orders: orders,
					userdetail: 'true'
				})

			})
		}
	})
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