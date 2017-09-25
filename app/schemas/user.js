var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
	name:{
		unique: true,
		type: String
	},
	avatar:{
		type: String,
		default: 'avatar.png'
	},
	shopcartgoods:[],
	password: String,
	role: {
		type: Number,
		default: 0
	},
	meta:{
		createAt:{
			type: Date,
			default: Date.now()
		},
		updateAt:{
			type: Date,
			default: Date.now()
		}
	}
})

// 判断保存的数据是否是新增的
UserSchema.pre('save', function(next){
	var user = this

	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
		if(err) return next(err)
		bcrypt.hash(user.password, salt, function(err,hash){
			if(err) return next(err)

			user.password = hash
			next()
		})
	})
})

UserSchema.methods={
	// 验证密码
	comparePassword: function(_password, cb) {
		bcrypt.compare(_password, this.password, function(err, isMatch) {
			if(err) return cb(err)

			cb(null, isMatch)
		})
	},

	// 密码加密
	hashPassword: function(_password, cb){

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err,salt){
			if(err) return cb(err)
			bcrypt.hash(_password, salt, function(err,hash){
				if(err) return cb(err)
				cb(null, hash)
			})
		})
	} 

}


UserSchema.statics = {
	fetch: function(cb) {
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById: function(id, cb){
		return this
			.findOne({_id: id})
			.exec(cb)
	}
}

module.exports = UserSchema