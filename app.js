var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
// var mongoStore = require('connect-mongo')(express)
var port = process.env.PORT || 3000
var app = express()

var logger = require('morgan')

var dbUrl = 'mongodb://localhost:27017/lpj_db'
mongoose.connect(dbUrl)

mongoose.connection.on('error', function(error){
	console.log('数据库连接失败' + error)
})
mongoose.connection.on('open',function(){
	console.log('数据库连接成功！！！')
})
// 访问路径、方式
app.set('views','./app/views/pages')
app.set('view engine','jade')
// 可视化
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({extended: true}))

// 保存cookie
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)
app.use(cookieParser())
app.use(session({
	secret: 'nodeJS',
	store: new mongoStore({
		url: dbUrl,
		collection: 'sessions'
	}),
	resave: false,
	saveUninitalized: true
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

console.log('nodeJS started on port ' + port)

