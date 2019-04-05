var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var GoodsSchema = new Schema({
	title: String,
	description: String,
	content: String,
	text: String,
	cover: String,
	// sort: [{
	// 	type: ObjectId,
	// 	ref: 'Category'
	// }],
	// scene: [{
	// 	type: ObjectId,
	// 	ref: 'Category'
	// }],
	// material: [{
	// 	type: ObjectId,
	// 	ref: 'Category'
	// }],
	// color: [{
	// 	type: ObjectId,
	// 	ref: 'Category'
	// }],
	favourite: [{
		type: ObjectId,
		ref: 'User'
	}],
	price: Number,
	sale: {
		type: Number,
		default: 0
	},
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
	// 商品属性
	attributes: {
		// 风格
		style: [{
			type: ObjectId,
			ref: 'Category'
		}],
		// 家类型
		sort: [{
			type: ObjectId,
			ref: 'Category'
		}],
		// 使用场所
		scene: [{
			type: ObjectId,
			ref: 'Category'
		}],
		// 材质
		material: [{
			type: ObjectId,
			ref: 'Category'
		}],
		// 颜色
		color: [{
			type: ObjectId,
			ref: 'Category'
		}]
	},
	imgs: [{
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
}, {
	usePushEach: true
})

// 判断保存的数据是否是新增的
GoodsSchema.pre('save', function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else{
		this.meta.updateAt = Date.now()
	}

	next()
})

GoodsSchema.statics = {
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

module.exports = GoodsSchema