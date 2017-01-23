var mongoose = require('mongoose')
var NewsCategorySchema = require('../schemas/news_category')
var NewsCategory = mongoose.model('NewsCategory', NewsCategorySchema)

module.exports = NewsCategory