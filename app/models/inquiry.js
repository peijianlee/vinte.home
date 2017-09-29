var mongoose = require('mongoose')
var InquirySchema = require('../schemas/inquiry')
var Inquiry = mongoose.model('Inquiry', InquirySchema)

module.exports = Inquiry