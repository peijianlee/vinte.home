
var Banner = require('../models/banner')
var Category = require('../models/category')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

//banner new page
exports.new = function(req,res){
	res.render('admin/banner_add',{
		title:'首页海报上传',
		banner:{}
	})
}




// banner update page
exports.update = function(req,res){
	var id = req.params.id

	if(id){
		Banner.findById(id,function(err,banners){
			res.render('admin/banner_add',{
				title: '首页海报更新',
				banner: banners
			})
		})
	}
}

//banner list page
exports.list = function(req,res){
	Banner.fetch(function(err,banners){
		if(err)console.log(err)

		res.render('admin/banner_list', {
			title: '首页海报列表页',
			banners: banners
		})
	})
}

// 商品类型海报列表
exports.goodsbanner = function(req, res){
	var url = req.url,
		sort = url.indexOf('sort') > 0,
		material = url.indexOf('material') > 0,
		scene = url.indexOf('scene') > 0,
		pstyle = url.indexOf('pstyle') > 0
	if(sort){
		var title = '商品材质海报设置'
		var bannertype = 'sort'
	}else if(material){
		var title = '商品类型海报设置'
		var bannertype = 'material'
	}else if(scene){
		var title = '商品场景海报设置'
		var bannertype = 'scene'
	}else if(pstyle){
		var title = '商品场景海报设置'
		var bannertype = 'pstyle'
	}
	Category.find({'name':bannertype}, function(err, categories){
		if(err) console.log(err)
		res.render('admin/product_banner',{
			title: title,
			categories: categories,
			bannertype: bannertype
		})
	})
}

// 商品类型海报获取
exports.goodsbannerupdate = function(req, res){
	var id = req.params.id

	// console.log(id)
	Category.findById(id, function(err, category){
		if(err) console.log(err)
		var time = setTimeout(function(){
			res.json({
				success:1,
				id: category.id,
				attributes: category.attributes,
				banner: category.banner || null,
				description: category.description || null
			})
		},500)
	})
}

// admin imgsrc
exports.saveImage = function(req,res,next){
	var imgsrcData = req.files.uploadPoster
	var filePath = imgsrcData.path
	var originalFilename = imgsrcData.originalFilename


	if(originalFilename){
		fs.readFile(filePath,function(err,data){
			var timestamp = Date.now()
			var type = imgsrcData.type.split('/')[1]
			var imgsrc = timestamp + '.' +type
			var newPath = path.join(__dirname, '../../', '/public/banner/'+imgsrc)

			fs.writeFile(newPath, data, function(err){
				if(err)console.log(err)
				req.imgsrc = imgsrc
				next()
			})
		})
	}else{
		next()
	}
}
// 商品类型海报保存
exports.goodsbannersave = function(req, res){
	var googsbanner = req.body.googsbanner,
		g_description = googsbanner.description
	if(!g_description && !req.imgsrc){
		console.log('文件和描述都为空，无效更新')
		return res.redirect('/admin/goods/sort/banner/list')
	}else{
		Category.findById(googsbanner.id, function(err, category){
			if(err) console.log(err)
			var banner = category.banner
			if(g_description) category.description = g_description
			if(req.imgsrc){
				if(category.banner) delBannerImg(category.banner)
				category.banner = req.imgsrc
			}
			category.save(function(err){
				if(err) console.log(err)
				res.redirect('/admin/goods/'+googsbanner.attributes+'/banner/list')
			})
		})
	}
}


//banner post page
exports.save = function(req,res){
	var bannerObj = req.body.banner
	var id = bannerObj._id

	if(req.imgsrc) bannerObj.imgsrc = req.imgsrc

	var	banner = new Banner(bannerObj)

	if(id){
		// 更新
		Banner.findById(id, function(err, _banner){
			if(err)console.log(err)
			// 删除文件
			// 修改后的文件名
			var imageFileName = bannerObj.imgsrc
			// 修改前的文件名
			var _imageFileName = _banner.imgsrc
			if(imageFileName!==_imageFileName){
				delBannerImg(_imageFileName)
			}
			// 使用underscore模块的extend函数更新电影变化的属性
			_banner = _.extend(_banner, bannerObj)
			_banner.save(function(err,_banner){
				if(err)console.log(err)
				res.redirect('/admin/banner/list')
			})
		})
	}else{
		// 新增
		banner.save(function(err,bannerObj){
			if(err)console.log(err)
			res.redirect('/admin/banner/list')
		})
	}
}

//list delete banner
exports.del = function(req,res){
	var id = req.query.id
	var src = req.query.src

	if(id){
		Banner.remove({_id: id},function(err,banner){
			if(err){
				console.log(err)
				res.json({success:0})
			}else{
				res.json({success:1})
				// 删除对应的图片
				delBannerImg(src)
			}
		})
	}
}

// 删除图片
function delBannerImg(filename){
	fs.unlink('public/banner/'+filename, function(err, file) {
		if (err) console.error(err)
		if(file){
			console.log("文件删除成功！")
		}else{
			console.log("文件不存在！")
		}
		
	});
}