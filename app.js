var express = require('express')
var path = require('path')
var mongoose = require('mongoose')

var config = require('./config/config.js')

var port = config.port
var app = express()

var logger = require('morgan')

var dbUrl = config.dburl
mongoose.connect(dbUrl, {useMongoClient: true})

mongoose.connection.on('error', function(error){
	console.log('数据库连接失败' + error)
})
mongoose.connection.on('open',function(){
	console.log('数据库连接成功！！！')
})
// 访问路径、方式
app.set('views','./app/views/pages')
app.set('view engine','pug')
// 可视化
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({extended: true}))

// 保存cookie
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)
app.use(cookieParser())
// app.use(session({
// 	secret: 'nodeJS',
// 	store: new mongoStore({
// 		url: dbUrl,
// 		collection: 'sessions'
// 	}),
// 	resave: false,
// 	saveUninitalized: true
// }))

// 使用 session 中间件
app.use(session({
    secret :  'vinte_cookie', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        // maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));

//ueditor
var ueditor = require('ueditor')
app.use("/libs/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {

    // 判断当前是哪个页面
    var ueditortype = req.session.ueditortype.type
    var uedirname = req.session.ueditortype.dirname
    if(ueditortype == 'news'){
        var img_url = '/data/news/'
    }else{
        var img_url = '/data/products/p'+uedirname+'/'
    }
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor
        var date = new Date()
        var imgname = req.ueditor.filename
        res.ue_up(img_url)
        //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        // var dir_url = '/ue_images_data/news/'
        res.ue_list(img_url)  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json')
        res.redirect('/libs/ueditor/nodejs/config.json')
    }

}))

app.use(require('connect-multiparty')())

if('development' === app.get('env')){
	app.set('showStackError',true)
	app.use(logger(':method :url :status'))
	app.locals.pretty = false
	mongoose.set('debug',true)
}


// 引入配置文件
require('./config/routes')(app)

// 获取静态资源路径
app.use(express.static(path.join(__dirname, 'public')))
app.locals.moment = require('moment')
app.listen(port)

// 错误页判断
app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})

console.log('nodeJS started on port ' + port)

