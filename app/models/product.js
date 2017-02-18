var mongoose = require('mongoose')
var ProductSchema = require('../schemas/user')
var Product = mongoose.model('Product', ProductSchema)

module.exports = Product