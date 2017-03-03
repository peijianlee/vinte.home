var mongoose = require('mongoose')
var ShopcartSchema = require('../schemas/shopcart')
var Shopcart = mongoose.model('Shopcart', ShopcartSchema)

module.exports = Shopcart