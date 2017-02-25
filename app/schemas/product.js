var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var ProductSchema = new Schema({
	title: String,
	content: String,
	text: String,
	cover: String,
	price: Number,
	saleprice: Number,
	size: {
		h: {
			type: Number,
			default: 0
		},
		w: {
			type: Number,
			default: 0
		},
		d: {
			type: Number,
			default: 0
		}
	},
	material: String,
	img: [{
		src: String
	}],
	pv:{
		type:Number,
		default:0
	},
	uid:{
		type: ObjectId,
		ref: 'User'
	},
	// uname: String,
	category: {
		type: ObjectId,
		ref: 'Category'
	},
	// newscategoryname: String,
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
ProductSchema.pre('save', function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}

	next()
})

ProductSchema.statics = {
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

module.exports = ProductSchema